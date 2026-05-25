importScripts("./vendor/gifsicle.js");

let gifsicleModulePromise = null;

function getGifsicleModule() {
  if (!gifsicleModulePromise) {
    gifsicleModulePromise = createGifsicle({
      locateFile(path) {
        return `./vendor/${path}`;
      },
      print() {},
      printErr() {},
    });
  }

  return gifsicleModulePromise;
}

function runGifsicle(mod, args) {
  const argv = mod._malloc((args.length + 1) * 4);
  const pointers = [];

  for (let index = 0; index < args.length; index += 1) {
    const pointer = mod.stringToNewUTF8(args[index]);
    pointers.push(pointer);
    mod.setValue(argv + index * 4, pointer, "i32");
  }

  mod.setValue(argv + args.length * 4, 0, "i32");

  try {
    mod._run_gifsicle(args.length, argv);
  } finally {
    pointers.forEach((pointer) => mod._free(pointer));
    mod._free(argv);
  }
}

function getGifCompressionOptions(quality) {
  const normalizedQuality = Math.max(10, Math.min(100, quality));
  const lossy = Math.max(0, Math.round((100 - normalizedQuality) * 4));

  if (normalizedQuality <= 20) {
    return { lossy, colors: 32 };
  }

  if (normalizedQuality <= 35) {
    return { lossy, colors: 64 };
  }

  if (normalizedQuality <= 55) {
    return { lossy, colors: 128 };
  }

  if (normalizedQuality <= 75) {
    return { lossy, colors: 192 };
  }

  return { lossy, colors: null };
}

self.addEventListener("message", async (event) => {
  const { fileBuffer, width, height, quality } = event.data;
  const inputPath = "/input.gif";
  const outputPath = "/output.gif";

  try {
    const mod = await getGifsicleModule();

    try {
      mod.FS.unlink(inputPath);
    } catch {}

    try {
      mod.FS.unlink(outputPath);
    } catch {}

    mod.FS.writeFile(inputPath, new Uint8Array(fileBuffer));

    const args = ["gifsicle", "-O3", "--careful"];
    const { lossy, colors } = getGifCompressionOptions(quality);

    if (lossy > 0) {
      args.push(`--lossy=${lossy}`);
    }

    if (colors) {
      args.push(`--colors=${colors}`);
    }

    if (width > 0 && height > 0) {
      args.push(`--resize=${width}x${height}`);
    }

    args.push("-o", outputPath, inputPath);
    runGifsicle(mod, args);

    const output = mod.FS.readFile(outputPath);
    self.postMessage({ ok: true, output: output.buffer }, [output.buffer]);
  } catch (error) {
    self.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : "GIF 압축에 실패했습니다.",
    });
  }
});
