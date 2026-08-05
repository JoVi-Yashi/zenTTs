.PHONY: install-backend backend test install-extension build-extension extension

install-backend:
	cd server && uv sync --group dev

backend:
	cd server && uv run uvicorn tts_zen.main:app --port 8765

test:
	cd server && uv run pytest -v

install-extension:
	cd extension && npm install

build-extension:
	cd extension && npx esbuild src/content.js --bundle --outfile=content.js --format=iife --target=firefox109 --platform=browser --log-level=info

extension: install-extension build-extension
