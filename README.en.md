<h1 align="center"><img alt="zenTTS" src="tts.png" width="140"></h1>
<p align="center">Floating text-to-speech for Zen Browser. Pick your engine.</p>
<p align="center">
    <a href="README.md">Español</a> · <a href="README.en.md">English</a>
</p>

A panel that reads the page or PDF you have open out loud, marking the sentence and the word as it goes. It extracts just the story, reads it with the **browser's** voice, Microsoft **neural voices** (edge-tts) or an offline **local voice** (Piper), and if it's in another language it **translates** it while you listen. Includes a **desktop app** to manage the neural voice server.

Built for Wattpad, AO3, FanFiction and Webnovel readers; works on any article and on PDFs.

**How to use it:** press the zenTTS button in the browser toolbar (or `Alt+Shift+Z`), then **Read**. The panel never appears on a page by itself.

> [!TIP]
> Now available on addons.mozilla.org: [download zenTTS](https://addons.mozilla.org/en-US/firefox/addon/tts-zen/).

<p align="center"><img alt="zenTTS panel" src="docs/screenshot.png" width="640"></p>

---

## Engines

| Engine | Backend | How to enable |
|---|---|---|
| **Native** | Browser SpeechSynthesis | Panel → ⚙ → Engine: Native |
| **Neural** | edge-tts · Microsoft neural voices | `ruby server.rb` + Panel → ⚙ → Engine: Neural |
| **Local** | Piper in the browser (WASM), works offline | Panel → ⚙ → Voice → Engine: Local → Download voice (~60 MB, once; ~110 MB for high quality) |

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

- **From addons.mozilla.org (recommended):** [install zenTTS](https://addons.mozilla.org/en-US/firefox/addon/tts-zen/) — one click, with automatic updates.
- **From the release:** download `zentts-1.0.0.zip` from [Releases](https://github.com/JoVi-Yashi/zenTTs/releases/latest) → `about:debugging` → **This Zen** → **Load Temporary Add-on** → pick the zip.
- **From source:** `make extension` (or `make build-extension` once dependencies are installed) and pick `extension/manifest.json` in `about:debugging`. `make package` builds `dist/zentts-1.0.0.zip`.

---

## Features

### Appears only when you call it
The zenTTS button in the browser toolbar (or `Alt+Shift+Z`) shows or hides the panel in that tab; it stays through reloads and chapter changes, and the button shows a dot while it's on. ⚙ → Reading → "Always open on this site" makes it open by itself on that domain. The panel lives in Shadow DOM, so the site's CSS doesn't touch it.

### PDF reader
On a tab with a PDF, the button opens the zenTTS reader in a new tab next to it: the pages rendered with pdf.js, the sentence and the word marked on top, without repeated headers or page numbers, and with "pick up where you left off". Web PDFs load by themselves (the first time it may ask for permission for that site). Firefox doesn't let extensions read local files (`file://`), so for a PDF on your computer the reader asks you to drop or choose it once; after that it stays in the library.

The **Contents** button shows the document's table of contents (with sub-levels) and takes you to each section; while reading, the reading jumps there. The reader remembers the page you were on and reads two-column documents in order.

### The library
A 3D bookshelf with what you read (**Library** button in the PDF reader, or ⚙ → Reading → "Open the library"). At the top right you choose what to show:

- **PDF:** the PDFs you open or add. **Add PDFs** takes several at once (or drop them on the shelf); each file is compared by its content (SHA-256), so a repeated PDF is not duplicated: you're told, and the one already there is highlighted. A copy is kept, so PDFs from your computer open from here without choosing them again.
- **Web:** the works zenTTS has read to you on web pages, one shelf per site (AO3, FanFiction, Wattpad, Webnovel and the rest by domain), with the chapter you're on. **Keep reading** opens that chapter. It can be turned off in ⚙ ("Remember what I read on the web").

Each book shows its spine (color and thickness from the book), with a matte cloth-and-paper finish; at rest only the spine shows, so books never overlap even on a full shelf. Hovering pulls it out and turns its cover to you, and choosing it brings it to the middle, turning, with the shelf blurred behind. From its card you continue reading, change the cover, back cover and spine color, and add tags, which work as shelves of their own.

**Series and volume:** the series and volume are taken from the file name, dropping tags such as `[RVN]`, `(z-lib.org)` or `epub` (`[RVN] Mushoku_Tensei_Vol_15.pdf` → *Mushoku Tensei*, vol. 15). With the "Title and series" order, a saga's volumes stay together and in numeric order (1, 2 … 10, not 1, 10, 2). You change them by hand in the book's card; details found online never touch them.

**Book details:** "Find details…" (or "Review details" after adding PDFs) searches in steps and stops as soon as there are good matches:

1. by the ISBN, if it's printed in the PDF (Open Library and Google Books);
2. by series and volume, in your language and in any;
3. by keywords only (the series, its main words);
4. on **AniList** and **MyAnimeList** for light novels, manga and webnovels (whenever the name suggests one, or if the steps before find nothing).

The window shows what was read from the name (series, volume, "Light novel / manga") as chips you can correct, and the 4 most relevant matches with cover, author, year, publisher, ISBN, source and language; "Show more results" opens the rest. If nothing turns up it says so without leaving the tab, so you can correct the search, or you go to **Type them in**: title, author, series, volume, year, publisher, ISBN and a cover from a link (URL) or an image on your computer, with a button that searches the web for covers.

**Your language and your order:** in ⚙ → "Language of the details" you choose which language you want the details in (by default the book's own, detected when it's added). If the ISBN leads to an edition in another language, yours is also searched by title, and the other one is marked "Other edition". When you choose a match you see **what would change, field by field** (with the current and the new cover, and that edition's language) and tick what to take: for example, keep your Spanish title and take the cover and the year. For an edition in another language, title, author and ISBN come ticked only where your book has none.

The first time it asks for access to Open Library, Google Books, AniList and MyAnimeList; nothing is sent unless you use it.

In ⚙ you choose the wood, the order, the size of the books and the language of the details.

### Voice performance and which translation to pick
- **High-quality** Local voices do much more work per second of audio, and Piper runs on a single thread inside the browser: on modest computers they can fall behind the reading and leave pauses between sentences. zenTTS loads the voice ahead of time, cuts long sentences and generates several ahead; if it still can't keep up, ⚙ → Voice says so. **Standard** quality is the best balance.
- **Online** translation (with the server) is the most accurate and nearly instant. **Offline** (Firefox Translations) is private and works without internet; it's a bit less polished and uses the CPU, so with Local voices it translates at the pace of the reading so it doesn't compete with the voice.

### Dual TTS engines
Choose between native SpeechSynthesis (no dependencies) or edge-tts with Microsoft neural voices. Switch from ⚙ → Engine without restarting.

### Synchronized highlighting
The sentence being read is marked on the page itself and the spoken word is highlighted on top of it, in real time (exact timings with the neural voice, estimated with the local one). The marker sets its own text color, so it reads the same on light and dark sites. The panel's reading view follows along too.

### Next chapter, automatically
On AO3, FanFiction.net and Wattpad, when a chapter ends the next one loads in the same page and reading continues. On Webnovel, which loads chapters by infinite scroll, zenTTS makes it load the next one and keeps reading; if there is only a "Next" button, it uses it. Turn it off in ⚙ → "Continue with the next chapter".

### Language detection and offline translation
zenTTS detects the chapter's language with Firefox's own detector. If it differs from the language you want to listen in (⚙ → "Read in": automatic, a specific language or the original), it offers to download a Firefox Translations pack (about 25 MB per direction). After that it translates on your computer, offline. Pairs without a direct model go through English. You can also read in the original language or, with the server running, translate online.

Reading starts as soon as the first paragraphs are translated; the rest is translated while you listen. The translated sentence appears in a card under the original paragraph, with the spoken word marked (⚙ → Reading → "Show the translation next to the text").

In ⚙ → Translate you choose how to always translate (ask, offline pack, online or don't translate), see the choices remembered per language and forget them, and manage the downloaded packs.

### Start where you choose
Press the crosshair button in the panel and click the sentence you want to start from; hovering marks the sentence. Without the button, clicks on the page do nothing. Esc cancels.

### Movable bubble
When minimized, zenTTS is a bubble you can drag to any corner; it stays there and the panel opens in that same corner, turned towards it: in a bottom corner the bar with the buttons sits at the bottom, and the minimize button is always on the corner's side, its arrow pointing at it.

### Voices
Voices are offered in the language that will be read (the translated one, if you translate). Local (Piper) voices are grouped by quality: high (~110 MB), standard (~60 MB) and light; Spanish has voices from Spain, Mexico and Argentina. Settings live in four tabs: Voice, Reading, Translate and Look.

With the browser engine, Pause stops the voice even when the system synthesizer (speech-dispatcher on Linux) ignores pausing; resuming picks up from the last word.

### Browser colors
The panel follows light and dark mode and, if a Firefox theme is installed, takes its colors. Zen does not let extensions read its accent color, so in ⚙ → Appearance you can pick one or paste the value of `zen.theme.accent-color` (from `about:config`) to match.

### Pick up where you left off
zenTTS remembers the sentence you were on in each chapter. When you come back, the button says **Continue · 34 / 120**; "From the beginning" starts over.

### Platform extractors
Wattpad, AO3, FanFiction, and Webnovel have optimized extractors with platform-specific selectors. Ignores headers, navs, and sidebars.

### Supported sites
The globe button lists the sites with their own extractor (AO3, FanFiction, Wattpad, Webnovel) and the editable list of sites where the panel opens by itself.

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
│   ├── src/reader.js       # PDF reader (pdf.js)
│   ├── src/library.js      # 3D library (PDF / Web)
│   ├── src/books.js        # Library data and files
│   ├── src/pdfimport.js    # Adding PDFs: duplicates, covers, ISBN, language
│   ├── src/lookup.js       # Book details: the name, stepped search, sources
│   ├── reader.html         # Reader page
│   ├── library.html        # Library page
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

Site logos are trademarks of their owners and are used only to show which sites zenTTS works with. Book details come from [Open Library](https://openlibrary.org), [Google Books](https://books.google.com), [AniList](https://anilist.co) and [MyAnimeList](https://myanimelist.net) (through [Jikan](https://jikan.moe)), only when you search.

The AO3 and Wattpad ones come from [Simple Icons](https://simpleicons.org) (CC0); the FanFiction.net and Webnovel ones are based on [Arcticons](https://github.com/Arcticons-Team/Arcticons) (CC BY-SA 4.0).
