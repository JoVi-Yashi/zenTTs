#!/usr/bin/env ruby
# Build Chrome Web Store submission zip for zenTTS
# Run: ruby extension/build-chrome.rb

require 'fileutils'

EXT_DIR = File.dirname(File.expand_path(__FILE__))
OUTPUT = File.join(EXT_DIR, 'tts-zen-chrome.zip')
STAGING = File.join(EXT_DIR, '.chrome-build')

# Build extension first
Dir.chdir(EXT_DIR) do
  system('node build.js') or abort('build failed')
end

# Files to include in the zip (same payload as AMO, manifest swapped below)
FILES = %w[
  manifest.json
  content.js
  background.js
  reader.js
  reader.html
  library.js
  library.html
  icons/icon-16.png
  icons/icon-32.png
  icons/icon-48.png
  icons/icon-96.png
  icons/icon-128.png
  icons/icon.svg
  icons/sites/ao3.svg
  icons/sites/fanfiction.svg
  icons/sites/wattpad.svg
  icons/sites/webnovel.svg
  vendor/ort/ort-wasm-simd-threaded.wasm
  vendor/ort/ort-wasm-simd-threaded.mjs
  vendor/piper/piper_phonemize.wasm
  vendor/piper/piper_phonemize.data
  vendor/pdfjs/pdf.worker.min.mjs
  worker/translator-worker.js
  worker/bergamot-translator-worker.js
  worker/bergamot-translator-worker.wasm
]

# Files NOT included (source only):
# src/, build.js, package.json, package-lock.json, node_modules/

FileUtils.rm_rf(STAGING)
FileUtils.rm_f(OUTPUT)

Dir.chdir(EXT_DIR) do
  FILES.each do |file|
    src = file == 'manifest.json' ? 'manifest.chrome.json' : file
    dest = File.join(STAGING, file)
    FileUtils.mkdir_p(File.dirname(dest))
    FileUtils.cp(src, dest)
  end

  Dir.chdir(STAGING) do
    system('zip', '-r', OUTPUT, *FILES) or abort('zip failed')
  end
end

FileUtils.rm_rf(STAGING)

size = File.size(OUTPUT)
puts "✅ Chrome package: #{OUTPUT} (#{size / 1024} KB)"
