#!/usr/bin/env bash
# Build zenTTS extension from source
# Requirements: Node.js >= 18, npm

cd "$(dirname "$0")"
npm install
node build.js
echo "✅ Build complete: content.js, background.js, vendor/"
