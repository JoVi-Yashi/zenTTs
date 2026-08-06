<h1 align="center"><img alt="zenTTS" src="tts.png" width="140"></h1>
<p align="center">Floating text-to-speech for Zen Browser. Pick your engine.</p>
<p align="center">
    <a href="README.md">🇪🇸 Español</a> &nbsp;·&nbsp;
    <a href="README.en.md">🇬🇧 English</a>
</p>
<p align="center">
    <a href="https://github.com/JoVi-Yashi/zenTTs/blob/main/LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
    <a href="https://github.com/JoVi-Yashi/zenTTs"><img alt="GitHub stars" src="https://img.shields.io/github/stars/JoVi-Yashi/zenTTs?style=social"></a>
    <img alt="Platform" src="https://img.shields.io/badge/platform-Linux%20%7C%20Windows-purple">
</p>

A TTS panel injected into any page via Shadow DOM. Extracts text, reads it with **native SpeechSynthesis** or **edge-tts** (45 Microsoft neural voices), and highlights each sentence in real time. Includes a **desktop app** to manage the server without touching a terminal.

Built for Wattpad, AO3, and FanFiction readers. Powered by the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API).

> [!WARNING]
> The extension is loaded as a temporary add-on via `about:debugging`. It is not published on addons.mozilla.org.

---

## Engines

| Engine | Backend | How to enable |
|---|---|---|
| **Native** | Browser SpeechSynthesis | Panel → ⚙ → Engine: Native |
| **Neural** | edge-tts · 45 Microsoft voices | `ruby server.rb` + Panel → ⚙ → Engine: Neural |

Switch engines with one click from the settings panel. The extension detects whether the server is running. If you pick Neural without a server, it tells you.

---

## Desktop app

TTS-zen includes a visual GTK3 app to manage the server. **Zero terminal.**

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

One command. Ruby, edge-tts, trafilatura, GTK3 — everything included. Look for **TTS-zen** in your app menu.

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
Each sentence highlights on the page DOM (purple outline + auto-scroll) and in a synchronized pop-up with adjustable typography.

### Platform extractors
Wattpad, AO3, FanFiction, and Webnovel have optimized extractors with platform-specific selectors. Ignores headers, navs, and sidebars.

### Site Manager
Enable or disable the tool per domain with toggle switches. Real favicons. Persists across sessions.

### Desktop app
Native GTK3 GUI. Linux and Windows compatible. Dark theme, system header bar, real-time status.

---

## Structure

```
zenTTs/
├── extension/              # Firefox MV3 WebExtension
│   ├── manifest.json
│   ├── content.js          # esbuild bundle
│   ├── background.js       # edge-tts proxy
│   ├── src/content.js      # Injection, extractors, TTS
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
