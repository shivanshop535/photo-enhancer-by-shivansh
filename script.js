const upload = document.getElementById('upload');
const canvasEl = document.getElementById('canvas');
const downloadLink = document.getElementById('downloadLink');
const qualitySelect = document.getElementById('quality');

let ctx = null;
let imageObject = null;

upload.addEventListener('change', handleImageUpload);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => loadImageToCanvas(e.target.result);
        reader.readAsDataURL(file);
    }
}

function loadImageToCanvas(imageSrc) {
    const img = new Image();
    img.onload = () => {
        canvasEl.width = img.width;
        canvasEl.height = img.height;
        ctx = canvasEl.getContext('2d');
        ctx.drawImage(img, 0, 0);
        imageObject = img;
        downloadLink.style.display = 'none';
    };
    img.src = imageSrc;
}

function enhanceImage() {
    if (!imageObject) {
        return alert('Please upload an image first!');
    }

    const quality = qualitySelect.value;
    applyImageEnhancements(quality);

    downloadLink.href = canvasEl.toDataURL();
    downloadLink.style.display = 'inline-block';
}

function applyImageEnhancements(quality) {
    const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
    const data = imageData.data;

    switch (quality) {
        case 'sd':
            adjustBrightness(data, 10);
            adjustContrast(data, 10);
            break;
        case 'hd':
            adjustBrightness(data, 30);
            adjustContrast(data, 30);
            sharpenImage(data, 1);
            break;
        default:
            break;
    }

    ctx.putImageData(imageData, 0, 0);
}

function adjustBrightness(data, amount) {
    for (let i = 0; i < data.length; i += 4) {
        data[i] += amount;
        data[i + 1] += amount;
        data[i + 2] += amount;
    }
}

function adjustContrast(data, amount) {
    const factor = (259 * (amount + 255)) / (255 * (259 - amount));
    for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
}

function sharpenImage(data, strength) {
    const width = canvasEl.width;
    const height = canvasEl.height;
    const tempData = new Uint8ClampedArray(data);

    const kernel = [
        [0, -1, 0],
        [-1, 5, -1],
        [0, -1, 0],
    ];

    for (let i = 1; i < height - 1; i++) {
        for (let j = 1; j < width - 1; j++) {
            let r = 0, g = 0, b = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    let pixelIndex = ((i + ky) * width + (j + kx)) * 4;
                    r += tempData[pixelIndex] * kernel[ky + 1][kx + 1];
                    g += tempData[pixelIndex + 1] * kernel[ky + 1][kx + 1];
                    b += tempData[pixelIndex + 2] * kernel[ky + 1][kx + 1];
                }
            }
            let pixelIndex = (i * width + j) * 4;
            data[pixelIndex] = r * strength;
            data[pixelIndex + 1] = g * strength;
            data[pixelIndex + 2] = b * strength;
        }
    }
}
