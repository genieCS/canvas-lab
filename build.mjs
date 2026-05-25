import { mkdir, readFile, rm, writeFile, cp } from "node:fs/promises";
import { build, transform } from "esbuild";
import { minify } from "terser";

const distDir = "dist";
const assetsDir = `${distDir}/assets`;

async function minifyJavaScript(source, outputPath) {
  const result = await build({
    stdin: {
      contents: source,
      resolveDir: ".",
      sourcefile: outputPath,
      loader: "js",
    },
    bundle: true,
    write: false,
    format: "esm",
    target: "es2020",
    legalComments: "none",
  });

  const compressed = await minify(result.outputFiles[0].text, {
    compress: {
      passes: 2,
    },
    mangle: true,
    format: {
      comments: false,
    },
  });

  if (!compressed.code) {
    throw new Error(`Failed to minify ${outputPath}`);
  }

  await writeFile(outputPath, compressed.code);
}

async function buildHtml() {
  const html = await readFile("index.html", "utf8");
  const output = html
    .replace('href="styles.css"', 'href="./assets/styles.css"')
    .replace('src="app.js"', 'src="./assets/app.js"');

  await writeFile(`${distDir}/index.html`, output);
}

async function buildCss() {
  const css = await readFile("styles.css", "utf8");
  const result = await transform(css, {
    loader: "css",
    minify: true,
    legalComments: "none",
  });

  await writeFile(`${assetsDir}/styles.css`, result.code);
}

async function buildApp() {
  const source = (await readFile("app.js", "utf8")).replace(
    'new Worker("./gif-worker.js")',
    'new Worker("./assets/gif-worker.js")',
  );

  await minifyJavaScript(source, `${assetsDir}/app.js`);
}

async function buildWorker() {
  const source = (await readFile("gif-worker.js", "utf8"))
    .replace('importScripts("./vendor/gifsicle.js")', 'importScripts("../vendor/gifsicle.js")')
    .replace("return `./vendor/${path}`;", "return `../vendor/${path}`;");

  await minifyJavaScript(source, `${assetsDir}/gif-worker.js`);
}

await rm(distDir, { force: true, recursive: true });
await mkdir(assetsDir, { recursive: true });
await buildHtml();
await buildCss();
await buildApp();
await buildWorker();
await cp("vendor", `${distDir}/vendor`, { recursive: true });

console.log("Built dist/");
