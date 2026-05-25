const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const previewFrame = document.querySelector(".preview-frame");
const previewImage = document.querySelector("#previewImage");
const fileSummary = document.querySelector("#fileSummary");
const widthInput = document.querySelector("#widthInput");
const heightInput = document.querySelector("#heightInput");
const lockRatio = document.querySelector("#lockRatio");
const qualityInput = document.querySelector("#qualityInput");
const qualityValue = document.querySelector("#qualityValue");
const compressionHint = document.querySelector("#compressionHint");
const convertButton = document.querySelector("#convertButton");
const resetButton = document.querySelector("#resetButton");
const resultPanel = document.querySelector("#resultPanel");
const resultSummary = document.querySelector("#resultSummary");
const downloadLink = document.querySelector("#downloadLink");
const scaleButtons = document.querySelectorAll("[data-scale]");
const formatInputs = document.querySelectorAll('input[name="format"]');

let sourceFile = null;
let sourceImage = null;
let sourceUrl = null;
let originalWidth = 0;
let originalHeight = 0;
let lastObjectUrl = null;
let activeDimension = null;

const formatExtensions = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const formatNames = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/gif": "GIF",
};

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function selectedFormat() {
  return document.querySelector('input[name="format"]:checked').value;
}

function isGifSource() {
  return sourceFile?.type === "image/gif" || /\.gif$/i.test(sourceFile?.name || "");
}

function setSelectedFormat(format) {
  const input = document.querySelector(`input[name="format"][value="${format}"]`);
  if (input && !input.disabled) {
    input.checked = true;
  }
}

function updateQualityState() {
  const format = selectedFormat();
  const supportsQuality =
    format === "image/png" || format === "image/jpeg" || format === "image/webp" || format === "image/gif";
  qualityInput.disabled = !supportsQuality;

  if (format === "image/png") {
    qualityValue.textContent = `${qualityInput.value}%`;
    compressionHint.textContent =
      "PNG는 품질을 낮추면 색상 수를 줄여 용량을 줄입니다. 투명도는 유지되지만 색 표현이 단순해질 수 있습니다.";
    return;
  }

  if (format === "image/gif") {
    qualityValue.textContent = `${qualityInput.value}%`;
    compressionHint.textContent =
      "GIF는 gifsicle-wasm으로 애니메이션을 유지하며 최적화합니다. 품질을 낮추면 손실 압축과 색상 수 감소가 함께 적용됩니다.";
    return;
  }

  qualityValue.textContent = supportsQuality ? `${qualityInput.value}%` : "자동";
  compressionHint.textContent = "JPEG와 WebP는 품질을 낮추면 용량이 줄어듭니다.";
}

function updateFormatOptions() {
  const gifInput = document.querySelector('input[name="format"][value="image/gif"]');
  gifInput.disabled = !isGifSource();

  if (gifInput.disabled && gifInput.checked) {
    setSelectedFormat("image/png");
  }

  if (isGifSource()) {
    setSelectedFormat("image/gif");
  }

  updateQualityState();
}

function setResultHidden() {
  resultPanel.hidden = true;
  downloadLink.removeAttribute("href");
  downloadLink.hidden = false;
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }
}

function syncDimension(changedInput) {
  if (!lockRatio.checked || !originalWidth || !originalHeight) return;

  const width = Number(widthInput.value);
  const height = Number(heightInput.value);

  if (changedInput === widthInput && activeDimension !== heightInput && width > 0) {
    activeDimension = widthInput;
    heightInput.value = Math.max(1, Math.round((width * originalHeight) / originalWidth));
    activeDimension = null;
  }

  if (changedInput === heightInput && activeDimension !== widthInput && height > 0) {
    activeDimension = heightInput;
    widthInput.value = Math.max(1, Math.round((height * originalWidth) / originalHeight));
    activeDimension = null;
  }
}

function setDimensions(width, height) {
  widthInput.value = width;
  heightInput.value = height;
}

function resetApp() {
  sourceFile = null;
  sourceImage = null;
  originalWidth = 0;
  originalHeight = 0;
  fileInput.value = "";
  widthInput.value = "";
  heightInput.value = "";
  convertButton.disabled = true;
  convertButton.textContent = "변환하기";
  previewFrame.classList.remove("has-image");
  previewImage.removeAttribute("src");
  fileSummary.innerHTML = "<span>파일을 선택해 주세요</span>";
  setResultHidden();
  updateFormatOptions();

  if (sourceUrl) {
    URL.revokeObjectURL(sourceUrl);
    sourceUrl = null;
  }
}

async function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  setResultHidden();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);

  sourceFile = file;
  sourceUrl = URL.createObjectURL(file);

  const image = new Image();
  image.decoding = "async";
  image.src = sourceUrl;

  await image.decode();

  sourceImage = image;
  originalWidth = image.naturalWidth;
  originalHeight = image.naturalHeight;
  setDimensions(originalWidth, originalHeight);
  previewImage.src = sourceUrl;
  previewFrame.classList.add("has-image");
  convertButton.disabled = false;
  fileSummary.innerHTML = `
    <strong>${file.name}</strong>
    <span>${originalWidth} x ${originalHeight}px · ${formatBytes(file.size)}</span>
  `;
  updateFormatOptions();
}

function canvasToBlob(canvas, format, quality) {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, format, quality);
  });
}

function outputFileName(originalName, format) {
  const extension = formatExtensions[format] || "png";
  const baseName = originalName.replace(/\.[^.]+$/, "") || "image";
  return `${baseName}-${widthInput.value}x${heightInput.value}.${extension}`;
}

function compressGif({ targetWidth, targetHeight, quality }) {
  return new Promise((resolve, reject) => {
    const worker = new Worker("./gif-worker.js");

    worker.addEventListener("message", (event) => {
      worker.terminate();

      if (!event.data.ok) {
        reject(new Error(event.data.message));
        return;
      }

      resolve(new Blob([event.data.output], { type: "image/gif" }));
    });

    worker.addEventListener("error", (event) => {
      worker.terminate();
      reject(new Error(event.message || "GIF 압축에 실패했습니다."));
    });

    sourceFile.arrayBuffer().then((fileBuffer) => {
      worker.postMessage(
        {
          fileBuffer,
          width: targetWidth,
          height: targetHeight,
          quality: Math.round(quality * 100),
        },
        [fileBuffer],
      );
    }, reject);
  });
}

function getPngColorCount(quality) {
  const normalizedQuality = Math.max(10, Math.min(100, Math.round(quality * 100)));

  if (normalizedQuality >= 96) {
    return 0;
  }

  if (normalizedQuality <= 20) {
    return 32;
  }

  if (normalizedQuality <= 35) {
    return 64;
  }

  if (normalizedQuality <= 55) {
    return 128;
  }

  if (normalizedQuality <= 75) {
    return 192;
  }

  return 256;
}

function encodePngFromCanvas(canvas, quality) {
  if (!globalThis.UPNG) {
    throw new Error("PNG 압축 라이브러리를 불러오지 못했습니다.");
  }

  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const colorCount = getPngColorCount(quality);
  const pngBuffer = globalThis.UPNG.encode([imageData.data.buffer], canvas.width, canvas.height, colorCount);

  return new Blob([pngBuffer], { type: "image/png" });
}

async function convertImage() {
  if (!sourceImage || !sourceFile) return;

  const targetWidth = Math.max(1, Math.round(Number(widthInput.value)));
  const targetHeight = Math.max(1, Math.round(Number(heightInput.value)));
  const format = selectedFormat();
  const quality = Number(qualityInput.value) / 100;

  convertButton.disabled = true;
  convertButton.textContent = "변환 중...";
  setResultHidden();

  if (format === "image/gif") {
    try {
      const blob = await compressGif({ targetWidth, targetHeight, quality });
      showResult(blob, format, targetWidth, targetHeight);
    } catch (error) {
      showError(error instanceof Error ? error.message : "GIF 압축에 실패했습니다.");
    } finally {
      convertButton.disabled = false;
      convertButton.textContent = "변환하기";
    }
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext("2d");
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (format === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, targetWidth, targetHeight);
  }

  context.drawImage(sourceImage, 0, 0, targetWidth, targetHeight);

  let blob;

  try {
    blob = format === "image/png" ? encodePngFromCanvas(canvas, quality) : await canvasToBlob(canvas, format, quality);
  } catch (error) {
    showError(error instanceof Error ? error.message : "이미지 변환에 실패했습니다.");
    convertButton.disabled = false;
    convertButton.textContent = "변환하기";
    return;
  }
  if (!blob) {
    convertButton.disabled = false;
    convertButton.textContent = "변환하기";
    return;
  }

  showResult(blob, format, targetWidth, targetHeight);

  convertButton.disabled = false;
  convertButton.textContent = "변환하기";
}

function showResult(blob, format, targetWidth, targetHeight) {
  lastObjectUrl = URL.createObjectURL(blob);
  downloadLink.href = lastObjectUrl;
  downloadLink.download = outputFileName(sourceFile.name, format);
  downloadLink.hidden = false;

  const savedRatio = sourceFile.size ? Math.round((1 - blob.size / sourceFile.size) * 100) : 0;
  const savedText = savedRatio > 0 ? ` · ${savedRatio}% 감소` : "";
  resultSummary.textContent = `${formatNames[format]} · ${targetWidth} x ${targetHeight}px · ${formatBytes(blob.size)}${savedText}`;
  resultPanel.hidden = false;
}

function showError(message) {
  resultSummary.textContent = message;
  downloadLink.hidden = true;
  resultPanel.hidden = false;
}

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.classList.add("is-dragging");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("is-dragging");
});

dropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  dropZone.classList.remove("is-dragging");
  loadFile(event.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (event) => {
  loadFile(event.target.files[0]);
});

widthInput.addEventListener("input", () => {
  syncDimension(widthInput);
  setResultHidden();
});

heightInput.addEventListener("input", () => {
  syncDimension(heightInput);
  setResultHidden();
});

qualityInput.addEventListener("input", () => {
  updateQualityState();
  setResultHidden();
});

formatInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updateQualityState();
    setResultHidden();
  });
});

scaleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!originalWidth || !originalHeight) return;
    const scale = Number(button.dataset.scale);
    setDimensions(
      Math.max(1, Math.round(originalWidth * scale)),
      Math.max(1, Math.round(originalHeight * scale)),
    );
    setResultHidden();
  });
});

convertButton.addEventListener("click", convertImage);
resetButton.addEventListener("click", resetApp);
updateQualityState();
updateFormatOptions();
