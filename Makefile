.PHONY: install-backend backend test install-extension build-extension extension launcher stop install-desktop

install-backend:
	cd server && uv sync --group dev

backend:
	cd server && uv run uvicorn tts_zen.main:app --port 8765

test:
	cd server && uv run pytest -v

install-extension:
	cd extension && npm install

build-extension:
	cd extension && npx esbuild src/content.js --bundle --outfile=content.js --format=iife --target=es2020 --platform=browser --log-level=info

extension: install-extension build-extension

# ── Launcher ───────────────────────────────────────────

launcher:
	python3 launcher.py

stop:
	pkill -f "uvicorn tts_zen" 2>/dev/null || true

install-desktop:
	@mkdir -p "$(HOME)/.local/share/applications"
	@mkdir -p "$(HOME)/.local/share/icons/hicolor/scalable/apps"
	@cp tts-zen.desktop "$(HOME)/.local/share/applications/"
	@cp tts-zen.svg "$(HOME)/.local/share/icons/hicolor/scalable/apps/"
	@update-desktop-database "$(HOME)/.local/share/applications/" 2>/dev/null || true
	@echo "✅ TTS-zen instalado en el menú de aplicaciones"
