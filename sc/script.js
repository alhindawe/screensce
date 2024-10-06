let frontImageData = null;
let backImageData = null;
let videoStream = null;

const videoElement = document.getElementById('videoElement');
const canvas = document.getElementById('canvas');
const captureFrontBtn = document.getElementById('captureFront');
const captureBackBtn = document.getElementById('captureBack');
const saveImageBtn = document.getElementById('saveImage');
const imageNameInput = document.getElementById('imageName');
const imageNameContainer = document.getElementById('imageNameContainer');
const saveContainer = document.getElementById('saveContainer');

function startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            videoStream = stream;
            videoElement.srcObject = stream;
            videoElement.style.display = 'block';
        })
        .catch((err) => {
            alert('فشل الوصول إلى الكاميرا: ' + err);
        });
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    videoElement.style.display = 'none';
}

function captureImage() {
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
}

function mergeImages() {
    return new Promise((resolve) => {
        const imgFront = new Image();
        const imgBack = new Image();
        imgFront.src = frontImageData;
        imgBack.src = backImageData;

        imgFront.onload = function() {
            imgBack.onload = function() {
                const mergedCanvas = document.createElement('canvas');
                const maxWidth = Math.max(imgFront.width, imgBack.width);
                const totalHeight = imgFront.height + imgBack.height;

                mergedCanvas.width = maxWidth;
                mergedCanvas.height = totalHeight;

                const ctx = mergedCanvas.getContext('2d');
                ctx.drawImage(imgFront, 0, 0);
                ctx.drawImage(imgBack, 0, imgFront.height);

                resolve(mergedCanvas.toDataURL('image/png'));
            }
        }
    });
}

captureFrontBtn.addEventListener('click', () => {
    startCamera();
    captureFrontBtn.style.display = 'none';
    captureBackBtn.style.display = 'none';

    alert('قم بتوجيه الكاميرا نحو وجه البطاقة ثم اضغط على الشاشة لالتقاط الصورة');

    videoElement.addEventListener('click', function captureFrontImage() {
        frontImageData = captureImage();
        stopCamera();
        videoElement.removeEventListener('click', captureFrontImage);

        captureFrontBtn.textContent = 'إعادة التقاط وجه البطاقة';
        captureFrontBtn.style.display = 'inline-block';
        captureBackBtn.disabled = false;
        captureBackBtn.style.display = 'inline-block';
    });
});

captureBackBtn.addEventListener('click', () => {
    startCamera();
    captureFrontBtn.style.display = 'none';
    captureBackBtn.style.display = 'none';

    alert('قم بتوجيه الكاميرا نحو ظهر البطاقة ثم اضغط على الشاشة لالتقاط الصورة');

    videoElement.addEventListener('click', function captureBackImage() {
        backImageData = captureImage();
        stopCamera();
        videoElement.removeEventListener('click', captureBackImage);

        captureBackBtn.textContent = 'إعادة التقاط ظهر البطاقة';
        captureBackBtn.style.display = 'inline-block';

        // تحقق من وجود الصورتين
        if (frontImageData && backImageData) {
            imageNameContainer.style.display = 'block';
            saveContainer.style.display = 'block';
            saveImageBtn.disabled = false;
        }
    });
});

saveImageBtn.addEventListener('click', async () => {
    const mergedImageData = await mergeImages();
    const imageName = imageNameInput.value.trim() || 'صورة البطاقة';

    // إنشاء رابط التنزيل
    const link = document.createElement('a');
    link.href = mergedImageData;
    link.download = `${imageName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('تم حفظ الصورة بنجاح.');

    // إعادة تعيين التطبيق
    resetApp();
});

function resetApp() {
    frontImageData = null;
    backImageData = null;
    captureFrontBtn.textContent = 'التقاط وجه البطاقة';
    captureBackBtn.textContent = 'التقاط ظهر البطاقة';
    captureBackBtn.disabled = true;

    imageNameInput.value = '';
    imageNameContainer.style.display = 'none';
    saveContainer.style.display = 'none';
    saveImageBtn.disabled = true;
}

window.addEventListener('beforeunload', () => {
    stopCamera();
});