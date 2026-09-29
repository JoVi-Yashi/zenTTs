// esbuild config — bundles the content script (with Readability and the panel)
// and the background page (with Piper), and copies the WASM files Piper needs.
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const VENDOR = [
  ['node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.wasm', 'vendor/ort/ort-wasm-simd-threaded.wasm'],
  ['node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.mjs', 'vendor/ort/ort-wasm-simd-threaded.mjs'],
  ['node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.wasm', 'vendor/piper/piper_phonemize.wasm'],
  ['node_modules/@diffusionstudio/piper-wasm/build/piper_phonemize.data', 'vendor/piper/piper_phonemize.data'],
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
    external: ['fs', 'path', 'crypto', 'worker_threads'] }),
])
  .then(copyVendor)
  .catch(() => process.exit(1));
