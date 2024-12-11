// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const originalDimensions = document.getElementById('originalDimensions');
const compressedSize = document.getElementById('compressedSize');
const compressionRatio = document.getElementById('compressionRatio');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片文件
let currentFile = null;

// 绑定事件监听器
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('drop', handleDrop);
qualitySlider.addEventListener('input', handleQualityChange);
downloadBtn.addEventListener('click', downloadCompressedImage);

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processImage(file);
    }
}

// 处理拖拽
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.style.borderColor = '#0071e3';
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.style.borderColor = '#86868b';
    
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processImage(file);
    }
}

// 处理图片
function processImage(file) {
    currentFile = file;
    
    // 显示原图信息
    originalSize.textContent = formatFileSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            originalDimensions.textContent = `${img.width} x ${img.height}`;
            originalImage.src = e.target.result;
            compressImage(img, qualitySlider.value / 100);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // 显示预览区域
    previewContainer.style.display = 'block';
}

// 压缩图片
function compressImage(img, quality) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 设置画布尺寸
    canvas.width = img.width;
    canvas.height = img.height;
    
    // 绘制图片
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // 压缩图片
    const compressedDataUrl = canvas.toDataURL(currentFile.type, quality);
    compressedImage.src = compressedDataUrl;
    
    // 计算压缩后的大小
    const compressedSize = calculateBase64Size(compressedDataUrl);
    updateCompressionInfo(compressedSize);
}

// 处理质量滑块变化
function handleQualityChange(event) {
    const quality = event.target.value;
    qualityValue.textContent = quality + '%';
    
    if (currentFile) {
        const img = new Image();
        img.onload = () => {
            compressImage(img, quality / 100);
        };
        img.src = originalImage.src;
    }
}

// 下载压缩后的图片
function downloadCompressedImage() {
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedImage.src;
    link.click();
}

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 工具函数：计算Base64字符串大小
function calculateBase64Size(base64String) {
    const stringLength = base64String.length - 'data:image/jpeg;base64,'.length;
    const sizeInBytes = Math.ceil(stringLength * 0.75);
    return sizeInBytes;
}

// 更新压缩信息
function updateCompressionInfo(compressedBytes) {
    const originalBytes = currentFile.size;
    compressedSize.textContent = formatFileSize(compressedBytes);
    const ratio = ((1 - compressedBytes / originalBytes) * 100).toFixed(1);
    compressionRatio.textContent = ratio + '%';
} 