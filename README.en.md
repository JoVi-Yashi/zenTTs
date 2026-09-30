<h1 align="center"><img alt="zenTTS" src="tts.png" width="140"></h1>
<p align="center">Floating text-to-speech for Zen Browser. Pick your engine.</p>
<p align="center">
    <a href="README.md">Español</a> · <a href="README.en.md">English</a>
</p>

A TTS panel injected into any page via Shadow DOM. Extracts text, reads it with **native SpeechSynthesis** or **edge-tts** (45 Microsoft neural voices), and highlights each sentence in real time. Includes a **desktop app** to manage the server without touching a terminal.

Built for Wattpad, AO3, and FanFiction readers. Powered by the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API).

> [!WARNING]
> The extension is loaded as a temporary add-on via `about:debugging`. It is not published on addons.mozilla.org.

<p align="center"><img alt="zenTTS panel" src="docs/screenshot.png" width="640"></p>

---

## Engines

| Engine | Backend | How to enable |
|---|---|---|
| **Native** | Browser SpeechSynthesis | Panel → ⚙ → Engine: Native |
| **Neural** | edge-tts · Microsoft neural voices | `ruby server.rb` + Panel → ⚙ → Engine: Neural |
| **Local** | Piper in the browser (WASM), works offline | Panel → ⚙ → Engine: Local → Download voice (~60 MB, once) |

If the Neural engine fails mid-reading (edge-tts relies on a Microsoft service that sometimes stops answering), zenTTS carries on from the same sentence with the Local voice if you have one downloaded, or with the browser voice, and says so in the panel.

---

## Desktop app

zenTTS includes a visual GTK3 app to manage the server.

<p align="center"><i>Dark window with native header bar. Green/red indicator, Start/Stop buttons, and direct Zen Browser launcher.</i></p>

```bash
make gui              # Linux
ruby gui.rb           # Linux / Windows
```

Real-time status (3s polling), start/stop the server, and open Zen Browser automatically. Integrates with the app menu and dock.

---

## Installation

### Linux — Flatpak (recommended)

```bash
git clone https://github.com/JoVi-Yashi/zenTTs.git
cd zenTTs
make flatpak
```

One command. Ruby, edge-tts, trafilatura, GTK3 — everything included. Look for **zenTTS** in your app menu.

### Linux — Manual

```bash
git clone https://github.com/JoVi-Yashi/zenTTs.git
cd zenTTs
make install                                    # gem install sinatra puma rackup gtk3
cd extension && npm install && cd ..
make build-extension
make install-desktop                            # app menu icon
```

### Windows

```bash
# Requirements: RubyInstaller + MSYS2
gem install sinatra puma rackup gtk3
pip install edge-tts trafilatura

git clone https://github.com/JoVi-Yashi/zenTTs.git
cd zenTTs
cd extension && npm install && cd ..
make build-extension
```

> **Note**: On Windows, edge-tts and trafilatura must be on your PATH. The app uses `netstat`/`taskkill` instead of `fuser`.

### Load the extension in Zen

1. `about:debugging` → **Load Temporary Add-on**
2. Select `extension/manifest.json`

---

## Features

### Floating panel
Shadow DOM encapsulation. Site CSS never interferes. Appears bottom-right, collapsible to a 44px circle.

### Dual TTS engines
Choose between native SpeechSynthesis (no dependencies) or edge-tts with Microsoft neural voices. Switch from ⚙ → Engine without restarting.

### Synchronized highlighting
The sentence being read is marked on the page itself and the spoken word is highlighted on top of it, in real time (exact timings with the neural voice, estimated with the local one). The marker sets its own text color, so it reads the same on light and dark sites. The panel's reading view follows along too.

### Next chapter, automatically
On AO3, FanFiction.net and Wattpad, when a chapter ends the next one loads in the same page and reading continues. Turn it off in ⚙ → "Continue with the next chapter".

### Language detection and offline translation
zenTTS detects the chapter's language with Firefox's own detector. If it differs from the language you want to listen in (⚙ → "Read in": automatic, a specific language or the original), it offers to download a Firefox Translations pack (about 25 MB per direction). After that it translates on your computer, offline. Pairs without a direct model go through English. You can also read in the original language or, with the server running, translate online. Packs are managed in ⚙ → Translation packs.

### Start where you choose
Press the crosshair button in the panel and click the sentence you want to start from; hovering marks the sentence. Without the button, clicks on the page do nothing. Esc cancels.

### Movable bubble
When minimized, zenTTS is a bubble you can drag to any corner; it stays there and the panel opens in that same corner.

### Browser colors
The panel follows light and dark mode and, if a Firefox theme is installed, takes its colors. Zen does not let extensions read its accent color, so in ⚙ → Appearance you can pick one or paste the value of `zen.theme.accent-color` (from `about:config`) to match.

### Pick up where you left off
zenTTS remembers the sentence you were on in each chapter. When you come back, the button says **Continue · 34 / 120**; "From the beginning" starts over.

### Platform extractors
Wattpad, AO3, FanFiction, and Webnovel have optimized extractors with platform-specific selectors. Ignores headers, navs, and sidebars.

### Site Manager
Enable or disable the tool per domain with toggle switches. Real favicons. Persists across sessions.

### Desktop app
Native GTK3 GUI. Linux and Windows compatible. Warm dark theme, system header bar, real-time status.

---

## Structure

```
zenTTs/
├── extension/              # Firefox MV3 WebExtension
│   ├── manifest.json
│   ├── content.js          # esbuild bundle (generated)
│   ├── background.js       # esbuild bundle (generated)
│   ├── vendor/             # Piper/onnxruntime WASM (copied by the build)
│   ├── src/content.js      # Injection, highlighting, next chapter
│   ├── src/sites.js        # Per-site extractors
│   ├── src/player.js       # Player and engine fallback
│   ├── src/engines/        # Native, Neural (edge-tts), Local (Piper)
│   ├── src/progress.js     # Remembers your place per chapter
│   ├── src/background.js   # Server proxy + Piper
│   ├── src/panel.js        # Panel UI, settings, sites
│   └── icons/
├── server.rb               # REST API Ruby/Sinatra
├── gui.rb                  # GTK3 desktop app
├── launcher.rb             # Terminal TUI (alternative)
├── flatpak/                # Flatpak manifest + metainfo
├── docs/                   # Landing page
└── Gemfile
```

---

## Tech Stack

| Layer | Stack |
|---|---|
| Extension | vanilla JS, esbuild IIFE, MV3, Shadow DOM |
| Native TTS | SpeechSynthesis API |
| Neural TTS | edge-tts 7.2.8 + Sinatra (Ruby) |
| Extraction | @mozilla/readability + site selectors |
| GUI | GTK3 + Ruby (Linux / Windows) |
| Packaging | Flatpak, manual install, Windows |

---

## License

MIT
