.PHONY: install build-extension extension launcher stop install-desktop

install:
	bundle install

backend:
	ruby server.rb

build-extension:
	cd extension && npx esbuild src/content.js --bundle --outfile=content.js --format=iife --target=es2020 --platform=browser --log-level=info

extension:
	cd extension && npm install && npx esbuild src/content.js --bundle --outfile=content.js --format=iife --target=es2020 --platform=browser --log-level=info

# ── Launcher ───────────────────────────────────────────

launcher:
	ruby launcher.rb

stop:
	pkill -f "server.rb" 2>/dev/null || true

install-desktop:
	@mkdir -p "$(HOME)/.local/share/applications"
	@mkdir -p "$(HOME)/.local/share/icons/hicolor/scalable/apps"
	@cp tts-zen.desktop "$(HOME)/.local/share/applications/"
	@cp tts-zen.svg "$(HOME)/.local/share/icons/hicolor/scalable/apps/"
	@update-desktop-database "$(HOME)/.local/share/applications/" 2>/dev/null || true
	@echo "✅ TTS-zen instalado en el menú de aplicaciones"
