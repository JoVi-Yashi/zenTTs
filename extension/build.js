// esbuild config — bundles the content script (with Readability and the panel),
// the background page (with Piper and Bergamot) and the PDF reader (with pdf.js),
// and copies the WASM and worker files they need.
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const VENDOR = [
  ['node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm', 'vendor/ort/ort-wasm-simd-threaded.wasm'],
  ['node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs', 'vendor/ort/ort-wasm-simd-threaded.mjs'],
  ['node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm', 'vendor/piper/piper_phonemize.wasm'],
  ['node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data', 'vendor/piper/piper_phonemize.data'],
  // Bergamot resolves its worker next to the bundle (new URL('./worker/…', import.meta.url))
  ['node_modules/@browsermt/bergamot-translator/worker/translator-worker.js', 'worker/translator-worker.js'],
  ['node_modules/@browsermt/bergamot-translator/worker/bergamot-translator-worker.js', 'worker/bergamot-translator-worker.js'],
  ['node_modules/@browsermt/bergamot-translator/worker/bergamot-translator-worker.wasm', 'worker/bergamot-translator-worker.wasm'],
  // pdf.js worker for the PDF reader
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'vendor/pdfjs/pdf.worker.min.mjs'],
];

function copyVendor() {
  for (const [from, to] of VENDOR) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
}

const common = { bundle: true, target: 'es2020', platform: 'browser', minify: false, sourcemap: false, logLevel: 'info' };

Promise.all([
  esbuild.build({ ...common, entryPoints: ['src/content.js'], outfile: 'content.js', format: 'iife' }),
  // ESM so onnxruntime-web can use import.meta and dynamic import()
  esbuild.build({ ...common, entryPoints: ['src/background.js'], outfile: 'background.js', format: 'esm', target: 'es2022',
    // Node-only branches of the Emscripten glue; never taken in the browser
    external: ['fs', 'path', 'crypto', 'worker_threads', 'node:worker_threads'] }),
  // PDF reader page: pdf.js + the same reading code as the content script
  esbuild.build({ ...common, entryPoints: ['src/reader.js'], outfile: 'reader.js', format: 'esm', target: 'es2022' }),
])
  .then(copyVendor)
  .catch(() => process.exit(1));
