// esbuild config — bundles content.js + Readability + panel into one file
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/content.js'],
  bundle: true,
  outfile: 'content.js',
  format: 'iife',
  target: 'firefox109',
  globalName: '__ttsZenContent__',
  platform: 'browser',
  minify: false,
  sourcemap: false,
  logLevel: 'info'
}).catch(() => process.exit(1));
