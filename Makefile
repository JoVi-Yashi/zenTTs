.PHONY: install build-extension extension launcher gui stop install-desktop flatpak flatpak-install flatpak-run

install:
	gem install sinatra puma rackup gtk3 --user-install

gui:
	ruby gui.rb

backend:
	ruby server.rb

build-extension:
	cd extension && node build.js

extension:
	cd extension && npm install && node build.js

# ── Launcher ───────────────────────────────────────────

launcher:
	ruby launcher.rb

stop:
	pkill -f "server.rb" 2>/dev/null || true

install-desktop:
	@mkdir -p "$(HOME)/.local/share/applications"
	@mkdir -p "$(HOME)/.local/share/icons/hicolor/scalable/apps"
	@cp tts-zen.desktop "$(HOME)/.local/share/applications/"
	@cp tts.png "$(HOME)/.local/share/icons/hicolor/scalable/apps/tts.png"
	@update-desktop-database "$(HOME)/.local/share/applications/" 2>/dev/null || true
	@echo "✅ zenTTS instalado en el menú de aplicaciones"

# ── Flatpak ────────────────────────────────────────────

flatpak:
	flatpak-builder --user --install --force-clean build-dir flatpak/io.github.jovi-yashi.zentts.yml

flatpak-install:
	flatpak-builder --user --install --force-clean build-dir flatpak/io.github.jovi-yashi.zentts.yml

flatpak-run:
	flatpak run io.github.jovi-yashi.zentts
