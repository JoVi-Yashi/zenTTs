#!/usr/bin/env bash
# Build TTS-zen extension from source
# Requirements: Node.js >= 18, npm

cd "$(dirname "$0")"
npm install
npx esbuild src/content.js --bundle --outfile=content.js --format=iife --target=es2020 --platform=browser
echo "✅ Build complete: content.js"
