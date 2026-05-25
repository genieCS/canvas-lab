const fileInput = document.querySelector("#fileInput");
const dropZone = document.querySelector("#dropZone");
const previewFrame = document.querySelector(".preview-frame");
const previewImage = document.querySelector("#previewImage");
const fileSummary = document.querySelector("#fileSummary");
const widthInput = document.querySelector("#widthInput");
const heightInput = document.querySelector("#heightInput");
const lockRatio = document.querySelector("#lockRatio");
const languagePicker = document.querySelector("#languagePicker");
const languageButton = document.querySelector("#languageButton");
const languageMenu = document.querySelector("#languageMenu");
const compressionHint = document.querySelector("#compressionHint");
const convertButton = document.querySelector("#convertButton");
const resetButton = document.querySelector("#resetButton");
const resultPanel = document.querySelector("#resultPanel");
const resultSummary = document.querySelector("#resultSummary");
const downloadLink = document.querySelector("#downloadLink");
const scaleButtons = document.querySelectorAll("[data-scale]");
const formatInputs = document.querySelectorAll('input[name="format"]');
const compressionInputs = document.querySelectorAll('input[name="compression"]');
const languageMenuItems = document.querySelectorAll("[data-lang]");

let sourceFile = null;
let sourceImage = null;
let sourceUrl = null;
let originalWidth = 0;
let originalHeight = 0;
let lastObjectUrl = null;
let activeDimension = null;
let currentLang = "en";
let conversionToken = 0;

const translations = {
  ko: {
    pageTitle: "Canvas Lab 이미지 변환기",
    appAria: "이미지 변환 도구",
    title: "이미지 변환기",
    language: "언어",
    languageSelect: "언어 선택",
    reset: "초기화",
    uploadAria: "이미지 업로드",
    dropTitle: "이미지를 끌어오거나 선택",
    dropSubtitle: "JPEG, PNG, WebP, GIF 등 브라우저가 읽을 수 있는 이미지",
    previewAlt: "선택한 이미지 미리보기",
    emptyPreview: "이미지를 올리면 미리보기가 표시됩니다.",
    settingsAria: "변환 설정",
    imageInfo: "이미지 정보",
    pixelSize: "픽셀 사이즈",
    lockRatio: "비율 고정",
    width: "너비",
    height: "높이",
    formatTitle: "확장자 변환",
    formatAria: "출력 포맷",
    compressionTitle: "이미지 압축",
    compressionAria: "압축률",
    convert: "변환하기",
    converting: "변환 중...",
    resultDone: "변환 완료",
    download: "다운로드",
    pngHint: "PNG는 압축률이 높을수록 색상 수를 줄입니다. 투명도는 유지되지만 색 표현이 단순해질 수 있습니다.",
    gifHint: "GIF는 애니메이션을 유지하며 최적화합니다. 압축률이 높을수록 손실 압축과 색상 수 감소가 강해집니다.",
    lossyHint: "JPEG와 WebP는 압축률이 높을수록 품질을 낮춰 용량을 줄입니다.",
    pngLoadError: "PNG 압축 라이브러리를 불러오지 못했습니다.",
    gifCompressError: "GIF 압축에 실패했습니다.",
    convertError: "이미지 변환에 실패했습니다.",
    reduced: "감소",
  },
  en: {
    pageTitle: "Canvas Lab Image Converter",
    appAria: "Image conversion tool",
    title: "Image Converter",
    language: "Language",
    languageSelect: "Select language",
    reset: "Reset",
    uploadAria: "Image upload",
    dropTitle: "Drop or choose an image",
    dropSubtitle: "JPEG, PNG, WebP, GIF, and other browser-readable images",
    previewAlt: "Selected image preview",
    emptyPreview: "Upload an image to see a preview.",
    settingsAria: "Conversion settings",
    imageInfo: "Image info",
    pixelSize: "Pixel size",
    lockRatio: "Lock ratio",
    width: "Width",
    height: "Height",
    formatTitle: "Format conversion",
    formatAria: "Output format",
    compressionTitle: "Image compression",
    compressionAria: "Compression ratio",
    convert: "Convert",
    converting: "Converting...",
    resultDone: "Conversion complete",
    download: "Download",
    pngHint: "PNG reduces file size by lowering the color count as compression increases. Transparency is preserved, but colors may look simpler.",
    gifHint: "GIF keeps animation while optimizing. Higher compression increases lossy compression and color reduction.",
    lossyHint: "JPEG and WebP reduce file size by lowering quality as compression increases.",
    pngLoadError: "Could not load the PNG compression library.",
    gifCompressError: "GIF compression failed.",
    convertError: "Image conversion failed.",
    reduced: "smaller",
  },
  ja: {
    pageTitle: "Canvas Lab 画像コンバーター",
    appAria: "画像変換ツール",
    title: "画像コンバーター",
    language: "言語",
    languageSelect: "言語を選択",
    reset: "リセット",
    uploadAria: "画像アップロード",
    dropTitle: "画像をドロップまたは選択",
    dropSubtitle: "JPEG、PNG、WebP、GIF など、ブラウザで読み込める画像",
    previewAlt: "選択した画像のプレビュー",
    emptyPreview: "画像をアップロードするとプレビューが表示されます。",
    settingsAria: "変換設定",
    imageInfo: "画像情報",
    pixelSize: "ピクセルサイズ",
    lockRatio: "比率を固定",
    width: "幅",
    height: "高さ",
    formatTitle: "形式変換",
    formatAria: "出力形式",
    compressionTitle: "画像圧縮",
    compressionAria: "圧縮率",
    convert: "変換",
    converting: "変換中...",
    resultDone: "変換完了",
    download: "ダウンロード",
    pngHint: "PNGは圧縮率が高いほど色数を減らして容量を下げます。透明度は維持されますが、色表現が単純になることがあります。",
    gifHint: "GIFはアニメーションを維持したまま最適化します。圧縮率が高いほど非可逆圧縮と色数削減が強くなります。",
    lossyHint: "JPEGとWebPは圧縮率が高いほど品質を下げて容量を減らします。",
    pngLoadError: "PNG圧縮ライブラリを読み込めませんでした。",
    gifCompressError: "GIF圧縮に失敗しました。",
    convertError: "画像変換に失敗しました。",
    reduced: "削減",
  },
  zh: {
    pageTitle: "Canvas Lab 图像转换器",
    appAria: "图像转换工具",
    title: "图像转换器",
    language: "语言",
    languageSelect: "选择语言",
    reset: "重置",
    uploadAria: "图像上传",
    dropTitle: "拖放或选择图像",
    dropSubtitle: "JPEG、PNG、WebP、GIF 等浏览器可读取的图像",
    previewAlt: "所选图像预览",
    emptyPreview: "上传图像后会显示预览。",
    settingsAria: "转换设置",
    imageInfo: "图像信息",
    pixelSize: "像素尺寸",
    lockRatio: "锁定比例",
    width: "宽度",
    height: "高度",
    formatTitle: "格式转换",
    formatAria: "输出格式",
    compressionTitle: "图像压缩",
    compressionAria: "压缩率",
    convert: "转换",
    converting: "转换中...",
    resultDone: "转换完成",
    download: "下载",
    pngHint: "PNG 会在压缩率提高时减少颜色数量来降低文件大小。透明度会保留，但颜色表现可能更简单。",
    gifHint: "GIF 会在保留动画的同时进行优化。压缩率越高，有损压缩和颜色减少越强。",
    lossyHint: "JPEG 和 WebP 会在压缩率提高时降低质量来减少文件大小。",
    pngLoadError: "无法加载 PNG 压缩库。",
    gifCompressError: "GIF 压缩失败。",
    convertError: "图像转换失败。",
    reduced: "减少",
  },
  fr: {
    pageTitle: "Convertisseur d’images Canvas Lab",
    appAria: "Outil de conversion d’images",
    title: "Convertisseur d’images",
    language: "Langue",
    languageSelect: "Choisir la langue",
    reset: "Réinitialiser",
    uploadAria: "Import d’image",
    dropTitle: "Déposez ou choisissez une image",
    dropSubtitle: "JPEG, PNG, WebP, GIF et autres images lisibles par le navigateur",
    previewAlt: "Aperçu de l’image sélectionnée",
    emptyPreview: "Importez une image pour afficher un aperçu.",
    settingsAria: "Paramètres de conversion",
    imageInfo: "Infos image",
    pixelSize: "Taille en pixels",
    lockRatio: "Verrouiller le ratio",
    width: "Largeur",
    height: "Hauteur",
    formatTitle: "Conversion de format",
    formatAria: "Format de sortie",
    compressionTitle: "Compression d’image",
    compressionAria: "Taux de compression",
    convert: "Convertir",
    converting: "Conversion...",
    resultDone: "Conversion terminée",
    download: "Télécharger",
    pngHint: "Le PNG réduit la taille du fichier en diminuant le nombre de couleurs quand la compression augmente. La transparence est conservée, mais les couleurs peuvent être simplifiées.",
    gifHint: "Le GIF conserve l’animation tout en l’optimisant. Une compression plus forte augmente la compression avec perte et la réduction des couleurs.",
    lossyHint: "JPEG et WebP réduisent la taille du fichier en baissant la qualité quand la compression augmente.",
    pngLoadError: "Impossible de charger la bibliothèque de compression PNG.",
    gifCompressError: "La compression GIF a échoué.",
    convertError: "La conversion de l’image a échoué.",
    reduced: "en moins",
  },
  es: {
    pageTitle: "Convertidor de imágenes Canvas Lab",
    appAria: "Herramienta de conversión de imágenes",
    title: "Convertidor de imágenes",
    language: "Idioma",
    languageSelect: "Seleccionar idioma",
    reset: "Restablecer",
    uploadAria: "Subida de imagen",
    dropTitle: "Arrastra o elige una imagen",
    dropSubtitle: "JPEG, PNG, WebP, GIF y otras imágenes compatibles con el navegador",
    previewAlt: "Vista previa de la imagen seleccionada",
    emptyPreview: "Sube una imagen para ver la vista previa.",
    settingsAria: "Ajustes de conversión",
    imageInfo: "Información de la imagen",
    pixelSize: "Tamaño en píxeles",
    lockRatio: "Bloquear proporción",
    width: "Ancho",
    height: "Alto",
    formatTitle: "Conversión de formato",
    formatAria: "Formato de salida",
    compressionTitle: "Compresión de imagen",
    compressionAria: "Nivel de compresión",
    convert: "Convertir",
    converting: "Convirtiendo...",
    resultDone: "Conversión completada",
    download: "Descargar",
    pngHint: "PNG reduce el tamaño del archivo disminuyendo la cantidad de colores a medida que aumenta la compresión. La transparencia se conserva, pero los colores pueden verse más simples.",
    gifHint: "GIF mantiene la animación mientras optimiza. Una compresión más alta aumenta la compresión con pérdida y la reducción de colores.",
    lossyHint: "JPEG y WebP reducen el tamaño del archivo bajando la calidad a medida que aumenta la compresión.",
    pngLoadError: "No se pudo cargar la biblioteca de compresión PNG.",
    gifCompressError: "La compresión GIF falló.",
    convertError: "La conversión de la imagen falló.",
    reduced: "menos",
  },
  de: {
    pageTitle: "Canvas Lab Bildkonverter",
    appAria: "Werkzeug zur Bildkonvertierung",
    title: "Bildkonverter",
    language: "Sprache",
    languageSelect: "Sprache auswählen",
    reset: "Zurücksetzen",
    uploadAria: "Bild hochladen",
    dropTitle: "Bild ablegen oder auswählen",
    dropSubtitle: "JPEG, PNG, WebP, GIF und andere im Browser lesbare Bilder",
    previewAlt: "Vorschau des ausgewählten Bildes",
    emptyPreview: "Lade ein Bild hoch, um eine Vorschau zu sehen.",
    settingsAria: "Konvertierungseinstellungen",
    imageInfo: "Bildinformationen",
    pixelSize: "Pixelgröße",
    lockRatio: "Seitenverhältnis sperren",
    width: "Breite",
    height: "Höhe",
    formatTitle: "Format konvertieren",
    formatAria: "Ausgabeformat",
    compressionTitle: "Bildkomprimierung",
    compressionAria: "Komprimierungsrate",
    convert: "Konvertieren",
    converting: "Konvertiere...",
    resultDone: "Konvertierung abgeschlossen",
    download: "Herunterladen",
    pngHint: "PNG reduziert die Dateigröße, indem bei höherer Komprimierung die Farbanzahl verringert wird. Transparenz bleibt erhalten, Farben können jedoch einfacher wirken.",
    gifHint: "GIF behält die Animation bei und wird optimiert. Höhere Komprimierung verstärkt verlustbehaftete Komprimierung und Farbreduktion.",
    lossyHint: "JPEG und WebP reduzieren die Dateigröße, indem bei höherer Komprimierung die Qualität gesenkt wird.",
    pngLoadError: "Die PNG-Komprimierungsbibliothek konnte nicht geladen werden.",
    gifCompressError: "GIF-Komprimierung fehlgeschlagen.",
    convertError: "Bildkonvertierung fehlgeschlagen.",
    reduced: "kleiner",
  },
};

const formatExtensions = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

currentLang = getInitialLanguage();

const formatNames = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/webp": "WebP",
  "image/gif": "GIF",
};

function t(key) {
  return translations[currentLang][key] || translations.ko[key] || key;
}

function setLanguageMenuOpen(isOpen) {
  languageMenu.hidden = !isOpen;
  languageButton.setAttribute("aria-expanded", String(isOpen));
}

function getInitialLanguage() {
  const saved = localStorage.getItem("canvasLabLanguage");
  if (saved && translations[saved]) {
    return saved;
  }

  const browserLanguage = navigator.language?.toLowerCase() || "";
  const languageCode = browserLanguage.split("-")[0];

  if (translations[languageCode]) {
    return languageCode;
  }

  if (browserLanguage.startsWith("zh")) {
    return "zh";
  }

  return "en";
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.title = t("pageTitle");
  languageMenuItems.forEach((item) => {
    item.setAttribute("aria-checked", String(item.dataset.lang === currentLang));
  });

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(",").forEach((pair) => {
      const [attribute, key] = pair.split(":");
      element.setAttribute(attribute, t(key));
    });
  });

  if (!sourceFile) {
    renderEmptyFileSummary();
  } else {
    renderFileSummary();
  }

  updateQualityState();
}

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

function selectedCompression() {
  return Number(document.querySelector('input[name="compression"]:checked').value);
}

function selectedQuality() {
  return (100 - selectedCompression()) / 100;
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
  compressionInputs.forEach((input) => {
    input.disabled = !supportsQuality;
  });

  if (format === "image/png") {
    compressionHint.textContent = t("pngHint");
    return;
  }

  if (format === "image/gif") {
    compressionHint.textContent = t("gifHint");
    return;
  }

  compressionHint.textContent = t("lossyHint");
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
  resultSummary.textContent = "";
  downloadLink.removeAttribute("href");
  downloadLink.removeAttribute("download");
  downloadLink.hidden = false;
  if (lastObjectUrl) {
    URL.revokeObjectURL(lastObjectUrl);
    lastObjectUrl = null;
  }
}

function cancelPendingConversion() {
  conversionToken += 1;
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

function renderEmptyFileSummary() {
  fileSummary.innerHTML = `<span>${t("imageInfo")}</span>`;
}

function renderFileSummary() {
  fileSummary.innerHTML = `
    <strong>${sourceFile.name}</strong>
    <span>${originalWidth} x ${originalHeight}px · ${formatBytes(sourceFile.size)}</span>
  `;
}

function resetApp() {
  cancelPendingConversion();
  sourceFile = null;
  sourceImage = null;
  originalWidth = 0;
  originalHeight = 0;
  fileInput.value = "";
  widthInput.value = "";
  heightInput.value = "";
  convertButton.disabled = true;
  convertButton.textContent = t("convert");
  previewFrame.classList.remove("has-image");
  previewImage.removeAttribute("src");
  renderEmptyFileSummary();
  setResultHidden();
  updateFormatOptions();

  if (sourceUrl) {
    URL.revokeObjectURL(sourceUrl);
    sourceUrl = null;
  }
}

async function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  cancelPendingConversion();
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
  renderFileSummary();
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
      reject(new Error(event.message || t("gifCompressError")));
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

function getPngColorCount(compression) {
  if (compression >= 75) {
    return 64;
  }

  if (compression >= 50) {
    return 128;
  }

  return 256;
}

function encodePngFromCanvas(canvas, compression) {
  if (!globalThis.UPNG) {
    throw new Error(t("pngLoadError"));
  }

  const context = canvas.getContext("2d");
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const colorCount = getPngColorCount(compression);
  const pngBuffer = globalThis.UPNG.encode([imageData.data.buffer], canvas.width, canvas.height, colorCount);

  return new Blob([pngBuffer], { type: "image/png" });
}

async function convertImage() {
  if (!sourceImage || !sourceFile) return;

  const targetWidth = Math.max(1, Math.round(Number(widthInput.value)));
  const targetHeight = Math.max(1, Math.round(Number(heightInput.value)));
  const format = selectedFormat();
  const compression = selectedCompression();
  const quality = selectedQuality();

  convertButton.disabled = true;
  convertButton.textContent = t("converting");
  setResultHidden();
  const currentConversionToken = ++conversionToken;

  if (format === "image/gif") {
    try {
      const blob = await compressGif({ targetWidth, targetHeight, quality });
      if (currentConversionToken !== conversionToken) return;
      showResult(blob, format, targetWidth, targetHeight);
    } catch (error) {
      if (currentConversionToken !== conversionToken) return;
      showError(error instanceof Error ? error.message : t("gifCompressError"));
    } finally {
      if (currentConversionToken === conversionToken) {
        convertButton.disabled = false;
        convertButton.textContent = t("convert");
      }
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
    blob =
      format === "image/png"
        ? encodePngFromCanvas(canvas, compression)
        : await canvasToBlob(canvas, format, quality);
  } catch (error) {
    if (currentConversionToken !== conversionToken) return;
    showError(error instanceof Error ? error.message : t("convertError"));
    convertButton.disabled = false;
    convertButton.textContent = t("convert");
    return;
  }
  if (!blob) {
    if (currentConversionToken !== conversionToken) return;
    convertButton.disabled = false;
    convertButton.textContent = t("convert");
    return;
  }

  if (currentConversionToken !== conversionToken) return;
  showResult(blob, format, targetWidth, targetHeight);

  convertButton.disabled = false;
  convertButton.textContent = t("convert");
}

function showResult(blob, format, targetWidth, targetHeight) {
  lastObjectUrl = URL.createObjectURL(blob);
  downloadLink.href = lastObjectUrl;
  downloadLink.download = outputFileName(sourceFile.name, format);
  downloadLink.hidden = false;

  const savedRatio = sourceFile.size ? Math.round((1 - blob.size / sourceFile.size) * 100) : 0;
  const savedText = savedRatio > 0 ? ` · ${savedRatio}% ${t("reduced")}` : "";
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
  cancelPendingConversion();
  syncDimension(widthInput);
  setResultHidden();
});

heightInput.addEventListener("input", () => {
  cancelPendingConversion();
  syncDimension(heightInput);
  setResultHidden();
});

formatInputs.forEach((input) => {
  input.addEventListener("change", () => {
    cancelPendingConversion();
    updateQualityState();
    setResultHidden();
  });
});

compressionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    cancelPendingConversion();
    updateQualityState();
    setResultHidden();
  });
});

languageButton.addEventListener("click", () => {
  setLanguageMenuOpen(languageMenu.hidden);
});

languageMenuItems.forEach((item) => {
  item.addEventListener("click", () => {
    currentLang = item.dataset.lang;
    localStorage.setItem("canvasLabLanguage", currentLang);
    setLanguageMenuOpen(false);
    applyLanguage();
  });
});

document.addEventListener("click", (event) => {
  if (!languagePicker.contains(event.target)) {
    setLanguageMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setLanguageMenuOpen(false);
  }
});

scaleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!originalWidth || !originalHeight) return;
    const scale = Number(button.dataset.scale);
    setDimensions(
      Math.max(1, Math.round(originalWidth * scale)),
      Math.max(1, Math.round(originalHeight * scale)),
    );
    cancelPendingConversion();
    setResultHidden();
  });
});

convertButton.addEventListener("click", convertImage);
resetButton.addEventListener("click", resetApp);
applyLanguage();
updateFormatOptions();
