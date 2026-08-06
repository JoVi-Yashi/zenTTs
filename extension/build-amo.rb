#!/usr/bin/env ruby
# Build AMO submission zip for TTS-zen
# Run: ruby extension/build-amo.rb

require 'fileutils'

EXT_DIR = File.dirname(File.expand_path(__FILE__))
OUTPUT = File.join(EXT_DIR, 'tts-zen-amo.zip')

# Build extension first
Dir.chdir(EXT_DIR) do
  system('npx esbuild src/content.js --bundle --outfile=content.js --format=iife --target=es2020 --platform=browser --log-level=info')
end

# Files to include in the zip
FILES = %w[
  manifest.json
  content.js
  background.js
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
]

# Files NOT included (source only):
# src/, build.js, package.json, package-lock.json, node_modules/

FileUtils.rm_f(OUTPUT)
Dir.chdir(EXT_DIR) do
  system('zip', '-r', OUTPUT, *FILES)
end

size = File.size(OUTPUT)
puts "✅ AMO package: #{OUTPUT} (#{size / 1024} KB)"
