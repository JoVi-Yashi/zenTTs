// zenTTS Panel — Compact UI with voice, speed, counter, navigation
// Page highlighting happens on the actual DOM, not in this panel

import { applyPanelColors, themeTokens, parseColor, toHex } from './theme.js';
import { suppressCaption } from './highlight.js';

var ACCENT_PRESETS = ['#9a3b25', '#2f5d8a', '#3f7a4a', '#7a3b6e', '#b07a1c'];

const PANEL_HTML = `
<div id="tts-zen-panel" data-corner="br">
  <div id="tts-zen-header">
    <div id="tts-zen-header-left">
      <span id="tts-zen-logo">zen<em>TTS</em></span>
    </div>
    <div id="tts-zen-header-right">
      <button id="tts-zen-preview-btn" title="Ver texto extraído">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
      <button id="tts-zen-sites-btn" title="Sitios compatibles">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </button>
      <button id="tts-zen-settings-btn" title="Ajustes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
      <button id="tts-zen-minimize" title="Minimizar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="7" y1="7" x2="17" y2="17"></line>
          <polyline points="17 9 17 17 9 17"></polyline>
        </svg>
      </button>
    </div>
  </div>

  <div id="tts-zen-body">
    <div id="tts-zen-settings" class="collapsed">
     <div class="settings-inner">
      <div class="tabs" role="tablist" id="tts-zen-tabs">
        <button type="button" role="tab" data-tab="voice" id="tts-zen-tab-voice">Voz</button>
        <button type="button" role="tab" data-tab="read" id="tts-zen-tab-read">Lectura</button>
        <button type="button" role="tab" data-tab="tr" id="tts-zen-tab-tr">Traducir</button>
        <button type="button" role="tab" data-tab="look" id="tts-zen-tab-look">Aspecto</button>
        <i class="tab-ink"></i>
      </div>
      <div class="tab-pages">
       <section class="tab-page" data-page="voice" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-engine-label">Motor</label>
          <div class="select-wrap">
            <select id="tts-zen-engine">
              <option value="native">Nativo (Browser)</option>
              <option value="server">Neural (edge-tts)</option>
              <option value="local">Local (Piper)</option>
            </select>
          </div>
        </div>
        <div class="setting-row">
          <label id="tts-zen-voice-label">Voz</label>
          <div class="select-wrap">
            <select id="tts-zen-voice"></select>
          </div>
        </div>
        <div class="setting-row" id="tts-zen-voice-info-row" hidden>
          <label></label>
          <div class="hint-text" id="tts-zen-voice-info"></div>
        </div>
        <div class="setting-row" id="tts-zen-slow-hint" hidden>
          <label></label>
          <div class="hint-text warn" id="tts-zen-slow-text"></div>
        </div>
        <div class="setting-row" id="tts-zen-voice-hint" hidden>
          <label></label>
          <div class="hint-text"><span id="tts-zen-voice-hint-text">Las voces del sistema suenan robóticas.</span>
            <button type="button" class="link-btn" id="tts-zen-try-local">Probar voz Local</button></div>
        </div>
        <div class="setting-row" id="tts-zen-local-row" hidden>
          <label></label>
          <button id="tts-zen-local-dl" type="button" class="fill-btn"><span class="fill-label"></span><span class="water" aria-hidden="true"><span class="fill-label"></span></span><i class="wave" aria-hidden="true"></i></button>
        </div>
        <div class="setting-row" id="tts-zen-neural-hint" hidden>
          <label></label>
          <div class="hint-text"><span id="tts-zen-neural-hint-text">¿Aún más natural? El motor Neural usa voces de Microsoft.</span>
            <button type="button" class="link-btn" id="tts-zen-try-neural">Usar Neural</button></div>
        </div>
        <div class="setting-row">
          <label id="tts-zen-speed-text">Velocidad</label>
          <div class="speed-group">
            <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
            <span id="tts-zen-speed-label">1.0x</span>
          </div>
        </div>
       </section>
       <section class="tab-page" data-page="read" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-readlang-label">Leer en</label>
          <div class="select-wrap">
            <select id="tts-zen-readlang">
              <option value="auto">Auto</option>
              <option value="original">Idioma original</option>
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Português</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="zh">中文</option>
              <option value="ru">Русский</option>
            </select>
          </div>
        </div>
        <div class="setting-row" id="tts-zen-detected-row" hidden>
          <label></label>
          <div class="hint-text" id="tts-zen-detected"></div>
        </div>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-autonext">
          <span id="tts-zen-autonext-label">Seguir con el siguiente capítulo</span>
        </label>
        <label class="check-row" id="tts-zen-autoopen-row">
          <input type="checkbox" id="tts-zen-autoopen">
          <span id="tts-zen-autoopen-label">Abrir siempre en este sitio</span>
        </label>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-inline-tr">
          <span id="tts-zen-inline-tr-label">Mostrar la traducción junto al texto</span>
        </label>
        <div class="setting-row">
          <button type="button" class="link-btn" id="tts-zen-open-library">Abrir la biblioteca</button>
        </div>
       </section>
       <section class="tab-page" data-page="tr" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-trmode-label">Traducir con</label>
          <div class="select-wrap">
            <select id="tts-zen-trmode">
              <option value="ask">Preguntar</option>
              <option value="offline">Paquete sin conexión</option>
              <option value="online">En línea</option>
              <option value="never">No traducir</option>
            </select>
          </div>
        </div>
        <div id="tts-zen-trchoices" class="packs"></div>
        <div class="setting-row section-header">
          <span id="tts-zen-packs-title">Paquetes de traducción</span>
        </div>
        <div id="tts-zen-packs" class="packs"></div>
       </section>
       <section class="tab-page" data-page="look" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-lang-label">Interfaz</label>
          <div class="select-wrap">
            <select id="tts-zen-lang">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-follow-theme">
          <span id="tts-zen-follow-label">Usar los colores del tema del navegador</span>
        </label>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-word-hl">
          <span id="tts-zen-word-hl-label">Resaltar la palabra que suena</span>
        </label>
        <div class="setting-row">
          <label id="tts-zen-accent-label">Acento</label>
          <div class="accent-group" id="tts-zen-accent-group">
            <button type="button" class="swatch swatch-auto" data-accent="" title="Auto">A</button>
            ${ACCENT_PRESETS.map(function(c) { return '<button type="button" class="swatch" data-accent="' + c + '" style="--c:' + c + '" title="' + c + '"></button>'; }).join('')}
            <span class="swatch swatch-custom" id="tts-zen-accent-custom" title="Otro color">+<input type="color" id="tts-zen-accent-picker"></span>
          </div>
        </div>
        <div class="setting-row">
          <label></label>
          <input type="text" id="tts-zen-accent-hex" placeholder="Pegar color de Zen" spellcheck="false" autocomplete="off">
        </div>
        <div class="accent-hint" id="tts-zen-accent-hint" title="about:config → zen.theme.accent-color">zen.theme.accent-color</div>
       </section>
      </div>
     </div>
    </div>

    <div id="tts-zen-counter">—</div>

    <div id="tts-zen-nav">
      <button id="tts-zen-prev" disabled title="Anterior">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button id="tts-zen-next" disabled title="Siguiente">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <div id="tts-zen-translate-bar" hidden>
     <div class="tb-inner">
      <div id="tts-zen-translate-msg"></div>
      <div class="tb-actions">
        <button type="button" id="tts-zen-tr-download" class="fill-btn tb-main"><span class="fill-label"></span><span class="water" aria-hidden="true"><span class="fill-label"></span></span><i class="wave" aria-hidden="true"></i></button>
        <button type="button" id="tts-zen-tr-online" hidden></button>
        <button type="button" id="tts-zen-tr-original"></button>
      </div>
     </div>
    </div>

    <div id="tts-zen-controls">
      <button id="tts-zen-read" class="primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
        <span id="tts-zen-read-label">Leer</span>
      </button>
      <button id="tts-zen-pause" disabled>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      <button id="tts-zen-stop" disabled>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        </svg>
      </button>
      <button id="tts-zen-pick" title="Elegir dónde empezar" aria-pressed="false">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="7"></circle>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
          <line x1="12" y1="1.5" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22.5"></line>
          <line x1="1.5" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22.5" y2="12"></line>
        </svg>
      </button>
    </div>

    <div id="tts-zen-resume-row" hidden>
      <button id="tts-zen-restart" type="button">Desde el inicio</button>
    </div>

    <div id="tts-zen-status">Listo</div>
  </div>
</div>

<div id="tts-zen-tip" role="tooltip" hidden></div>
<div id="tts-zen-bubble-ghost" data-corner="br" aria-hidden="true"></div>
<div id="tts-zen-collapsed" class="hidden" data-corner="br" role="button" tabindex="0" title="zenTTS">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
</div>

<div id="tts-zen-preview-overlay" class="hidden">
  <div id="tts-zen-preview-modal">
    <div id="tts-zen-preview-header">
      <span>Texto extraído</span>
      <div id="tts-zen-preview-tools">
        <button class="preview-tool active" data-font="serif" title="Serif">Serif</button>
        <button class="preview-tool" data-font="sans" title="Sans">Sans</button>
        <button class="preview-tool" data-font="mono" title="Mono">Mono</button>
        <span class="tool-sep"></span>
        <button class="preview-tool" data-size="down" title="Reducir">A-</button>
        <button class="preview-tool" data-size="up" title="Aumentar">A+</button>
        <span class="tool-sep"></span>
        <button class="preview-tool" data-spacing="down" title="Menos espacio">-</button>
        <button class="preview-tool" data-spacing="up" title="Más espacio">+</button>
      </div>
      <button id="tts-zen-preview-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="tts-zen-preview-content"></div>
  </div>
</div>

<div id="tts-zen-sites-overlay" class="hidden">
  <div id="tts-zen-sites-modal">
    <div id="tts-zen-sites-header">
      <span>Sitios compatibles</span>
      <button id="tts-zen-sites-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="tts-zen-sites-list"></div>
  </div>
</div>
`;

const PANEL_CSS = `
:host {
  all: initial;
  --paper: #f6f1e7;
  --sheet: #fbf8f1;
  --ink: #2a2622;
  --ink-soft: #6d655a;
  --rule: #ddd4c3;
  --hover: rgba(42,38,34,0.06);
  --accent: #9a3b25;
  --mark: #f3e19a;
  --shadow: 0 1px 2px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.10);
  --serif: "Iowan Old Style", "Charter", "Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Helvetica Neue", sans-serif;
  --mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) {
  :host {
    --paper: #1b1916;
    --sheet: #23201c;
    --ink: #e9e2d4;
    --ink-soft: #a39a8b;
    --rule: #3a352e;
    --hover: rgba(233,226,212,0.07);
    --accent: #d9785c;
    --mark: rgba(217,120,92,0.24);
    --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35);
  }
}

button { font-family: var(--sans); }
button:focus-visible, select:focus-visible, input:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 1px;
}

#tts-zen-panel {
  position: fixed; z-index: 999999;
  width: 280px; max-height: calc(100vh - 48px); display: flex; flex-direction: column;
  background: var(--sheet);
  border: 1px solid var(--rule); border-radius: 6px;
  color: var(--ink);
  font-family: var(--sans); font-size: 13px; line-height: 1.4;
  box-shadow: var(--shadow);
  user-select: none; overflow: hidden;
}
/* Anchored to one corner; the bubble can be dragged to any of the four */
[data-corner="br"] { bottom: 24px; right: 24px; transform-origin: bottom right; }
[data-corner="bl"] { bottom: 24px; left: 24px; transform-origin: bottom left; }
[data-corner="tr"] { top: 24px; right: 24px; transform-origin: top right; }
[data-corner="tl"] { top: 24px; left: 24px; transform-origin: top left; }

#tts-zen-panel {
  transition: transform .24s cubic-bezier(.2,.8,.2,1), opacity .18s ease, visibility 0s;
}
#tts-zen-panel.collapsed {
  transform: scale(.35); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform .2s cubic-bezier(.4,0,.6,1), opacity .16s ease, visibility 0s .2s;
}
#tts-zen-body { overflow-y: auto; min-height: 0; display: flex; flex-direction: column; }

/* The panel turns towards its corner: in a bottom corner the header (and the
   settings it opens) sit at the bottom; in a left corner the header buttons
   are mirrored, so "minimize" is always the button nearest the corner. */
#tts-zen-panel[data-corner^="b"] { flex-direction: column-reverse; }
#tts-zen-panel[data-corner^="b"] #tts-zen-header { border-bottom: none; border-top: 1px solid var(--rule); }
#tts-zen-panel[data-corner^="b"] #tts-zen-settings { order: 99; border-bottom: none; border-top: 1px solid var(--rule); }
#tts-zen-panel[data-corner^="b"] #tts-zen-settings.collapsed { border-top-color: transparent; }
#tts-zen-panel[data-corner$="l"] #tts-zen-header,
#tts-zen-panel[data-corner$="l"] #tts-zen-header-right { flex-direction: row-reverse; }
#tts-zen-panel[data-corner$="l"] #tts-zen-header { padding: 8px 14px 8px 8px; }
#tts-zen-minimize svg { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
#tts-zen-panel[data-corner="bl"] #tts-zen-minimize svg { transform: rotate(90deg); }
#tts-zen-panel[data-corner="tl"] #tts-zen-minimize svg { transform: rotate(180deg); }
#tts-zen-panel[data-corner="tr"] #tts-zen-minimize svg { transform: rotate(270deg); }

button { transition: transform .08s ease, background-color .15s ease, color .15s ease, opacity .15s ease; }
button:active:not(:disabled) { transform: scale(.96); }

#tts-zen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 8px 8px 14px;
  border-bottom: 1px solid var(--rule);
}
#tts-zen-header-left, #tts-zen-header-right { display: flex; align-items: center; gap: 2px; }

#tts-zen-logo {
  font-family: var(--serif); font-size: 16px; font-weight: 600;
  color: var(--ink); letter-spacing: -0.01em;
}
#tts-zen-logo em { font-style: italic; font-weight: 400; color: var(--accent); }

#tts-zen-header-right button {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0;
  background: transparent; border: none; border-radius: 4px;
  color: var(--ink-soft); cursor: pointer;
}
#tts-zen-header-right button:hover { background: var(--hover); color: var(--ink); }

/* Real-height expand: the grid row goes from 0fr to 1fr */
#tts-zen-settings {
  display: grid; grid-template-rows: 1fr;
  border-bottom: 1px solid var(--rule);
  transition: grid-template-rows .26s cubic-bezier(.2,.8,.2,1), border-color .26s ease;
}
#tts-zen-settings.collapsed { grid-template-rows: 0fr; border-bottom-color: transparent; }
.settings-inner {
  min-height: 0; overflow: hidden;
  padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 10px;
  transition: padding .26s cubic-bezier(.2,.8,.2,1), opacity .2s ease;
}
#tts-zen-settings.collapsed .settings-inner { padding-top: 0; padding-bottom: 0; opacity: 0; }

/* Settings tabs: a segmented control with a sliding marker */
.tabs {
  position: relative; display: grid; grid-template-columns: repeat(4, 1fr);
  padding: 2px; border-radius: 6px; background: var(--paper); border: 1px solid var(--rule);
}
.tabs button {
  position: relative; z-index: 1; min-width: 0; padding: 4px 2px; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft); font: 11.5px var(--sans); cursor: pointer;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tabs button:hover { color: var(--ink); }
.tabs button[aria-selected="true"] { color: var(--ink); font-weight: 600; }
.tab-ink {
  position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc((100% - 4px) / 4);
  border-radius: 4px; background: var(--sheet); box-shadow: 0 1px 2px rgba(0,0,0,.12);
  transform: translateX(calc(var(--tab, 0) * 100%));
  transition: transform .28s cubic-bezier(.2,.8,.2,1);
}
/* All pages share one grid cell; the area's height follows the active page
   with a transition, so short tabs leave no gap and switching never jumps */
.tab-pages { display: grid; overflow: hidden; transition: height .26s cubic-bezier(.2,.8,.2,1); }
.tab-page {
  grid-area: 1 / 1; align-self: start; min-width: 0; display: flex; flex-direction: column; gap: 8px;
  transition: opacity .2s ease, transform .24s cubic-bezier(.2,.8,.2,1), visibility 0s;
}
.tab-page:not(.active) { opacity: 0; visibility: hidden; pointer-events: none; transform: translateX(var(--from, 12px)); transition: opacity .12s ease, transform .2s ease, visibility 0s .2s; }

.setting-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.setting-row label { flex-shrink: 0; min-width: 64px; max-width: 40%; font-size: 12px; color: var(--ink-soft); }

.select-wrap { flex: 1; min-width: 0; }
.select-wrap select, .translate-row select {
  width: 100%; padding: 5px 22px 5px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background-color: var(--paper);
  color: var(--ink); font: 12px var(--sans); cursor: pointer;
  appearance: none; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
  background-image: url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 9 5' fill='none'%3E%3Cpath d='M1 1l3.5 3L8 1' stroke='%238a8175' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 7px center;
}
.select-wrap select:hover, .translate-row select:hover { border-color: var(--ink-soft); }

.section-header {
  margin-top: 4px; font-size: 12px; color: var(--ink-soft);
  font-variant: small-caps; letter-spacing: 0.04em;
}
.translate-row { display: flex; align-items: center; gap: 6px; }
.translate-row select { flex: 1; width: auto; text-align-last: center; }
.translate-arrow { display: flex; align-items: center; color: var(--ink-soft); flex-shrink: 0; }

.speed-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
/* min-width: 0 — Firefox gives range inputs a large intrinsic width */
.speed-group input[type="range"] { flex: 1; min-width: 0; width: 100%; margin: 0; accent-color: var(--ink); cursor: pointer; }
#tts-zen-speed-label {
  flex-shrink: 0; min-width: 4.5ch; text-align: right;
  font-size: 12px; color: var(--ink); font-variant-numeric: tabular-nums;
}

#tts-zen-counter {
  text-align: center; padding: 12px 14px 6px;
  font-family: var(--serif); font-style: italic; font-size: 14px;
  color: var(--ink-soft); font-variant-numeric: tabular-nums oldstyle-nums;
}

#tts-zen-nav { display: flex; justify-content: center; gap: 4px; padding: 0 14px 8px; }
#tts-zen-nav button {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 28px; padding: 0;
  background: transparent; border: none; border-radius: 4px;
  color: var(--ink-soft); cursor: pointer;
}
#tts-zen-nav button:hover:not(:disabled) { background: var(--hover); color: var(--ink); }
#tts-zen-nav button:disabled { opacity: 0.35; cursor: default; }

#tts-zen-controls { display: flex; gap: 6px; padding: 0 14px 10px; }
#tts-zen-controls button {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 38px; height: 32px; padding: 0;
  border: 1px solid var(--rule); border-radius: 4px;
  background: transparent; color: var(--ink);
  font-size: 13px; cursor: pointer;
}
#tts-zen-controls button:hover:not(:disabled) { background: var(--hover); }
#tts-zen-controls button:disabled { opacity: 0.35; cursor: default; }
#tts-zen-controls button.primary {
  flex: 1; width: auto;
  background: var(--ink); border-color: var(--ink); color: var(--sheet); font-weight: 600;
}
#tts-zen-controls button.primary:hover:not(:disabled) { background: var(--ink); opacity: 0.88; }

/* Download buttons fill up like water while downloading: the "water" layer is
   a copy of the label in inverted colors, clipped to the progress, with a
   rippling edge. */
.fill-btn {
  position: relative; overflow: hidden; flex: 1; min-width: 0;
  padding: 5px 10px; border-radius: 4px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: 12px var(--sans); cursor: pointer;
  text-align: center; white-space: nowrap; --p: 0%;
  transition: opacity .25s ease, transform .08s ease, background-color .15s ease;
}
.fill-btn:hover:not(:disabled) { background: var(--hover); }
.fill-btn .fill-label { display: block; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.fill-btn .water {
  position: absolute; inset: 0; padding: inherit; display: flex; align-items: center; justify-content: center;
  background: var(--ink); color: var(--sheet);
  clip-path: inset(0 calc(100% - var(--p)) 0 0);
  transition: clip-path .3s ease;
}
.fill-btn .water .fill-label { width: 100%; }
.fill-btn .wave {
  position: absolute; top: 0; bottom: 0; left: calc(var(--p) - 1px); width: 7px; display: none;
  background: var(--ink);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='12'%3E%3Cpath d='M0 0 Q7 3 0 6 Q7 9 0 12Z'/%3E%3C/svg%3E") 0 0 / 7px 12px repeat-y;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='12'%3E%3Cpath d='M0 0 Q7 3 0 6 Q7 9 0 12Z'/%3E%3C/svg%3E") 0 0 / 7px 12px repeat-y;
  animation: ripple .9s linear infinite;
  transition: left .3s ease;
}
.fill-btn.filling { cursor: progress; }
.fill-btn.filling .wave { display: block; }
.fill-btn.filling:hover { background: transparent; }
.fill-btn.done { opacity: 0; }
@keyframes ripple { to { -webkit-mask-position: 0 12px; mask-position: 0 12px; } }
.check-row { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; line-height: 1.35; color: var(--ink-soft); cursor: pointer; }
.check-row input { accent-color: var(--ink); margin: 1px 0 0; flex-shrink: 0; }

.hint-text.warn { color: var(--accent); }
#tts-zen-tip {
  position: fixed; z-index: 10000000; max-width: 240px; padding: 5px 8px; border-radius: 4px;
  background: var(--ink); color: var(--sheet); font: 12px/1.35 var(--sans);
  box-shadow: 0 4px 14px rgba(0,0,0,.18); pointer-events: none;
  animation: tip-in .14s ease;
}
@keyframes tip-in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
.hint-text { flex: 1; min-width: 0; font-size: 12px; line-height: 1.35; color: var(--ink-soft); }
.link-btn {
  background: none; border: none; padding: 0; cursor: pointer; font: inherit;
  color: var(--accent); text-decoration: underline; text-underline-offset: 3px;
}

/* Translation offer */
#tts-zen-translate-bar {
  display: grid; grid-template-rows: 1fr; margin: 4px 14px 12px;
  animation: bar-in .24s cubic-bezier(.2,.8,.2,1);
  transition: grid-template-rows .28s cubic-bezier(.4,0,.2,1), margin .28s cubic-bezier(.4,0,.2,1), opacity .2s ease;
}
#tts-zen-translate-bar.closing { grid-template-rows: 0fr; margin-top: 0; margin-bottom: 0; opacity: 0; }
.tb-inner {
  min-height: 0; overflow: hidden; padding: 10px 12px; border-radius: 6px;
  background: var(--paper); border: 1px solid var(--rule);
  font-size: 12px; line-height: 1.4; color: var(--ink);
}
#tts-zen-translate-bar.closing .tb-inner { padding-top: 0; padding-bottom: 0; border-width: 0; transition: padding .28s ease; }
@keyframes bar-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.tb-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tb-actions .fill-btn { flex: 1 1 100%; font-weight: 600; }
.tb-actions button:not(.fill-btn) {
  padding: 4px 10px; border-radius: 4px; border: 1px solid var(--rule);
  background: transparent; color: var(--ink); font: 12px var(--sans); cursor: pointer;
}
.tb-actions button:not(.fill-btn):hover:not(:disabled) { background: var(--hover); }
.tb-actions button:disabled:not(.filling) { opacity: .5; cursor: default; }

.packs { display: flex; flex-direction: column; gap: 4px; }
.pack-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--ink); }
.pack-row span:last-of-type { color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.pack-row button {
  flex-shrink: 0; width: 22px; height: 22px; padding: 0; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft); cursor: pointer;
}
.pack-row button:hover { background: var(--hover); color: var(--ink); }
.packs-empty { font-size: 12px; color: var(--ink-soft); }
.pack-row .muted { color: var(--ink-soft); }

#tts-zen-pick.active { background: var(--ink); border-color: var(--ink); color: var(--sheet); }
[hidden] { display: none !important; }

.accent-group { flex: 1; display: flex; align-items: center; justify-content: space-between; min-width: 0; }
.swatch {
  width: 18px; height: 18px; flex-shrink: 0; padding: 0; border-radius: 50%; cursor: pointer;
  background: var(--c, transparent); border: 1px solid var(--rule);
  font: 600 10px var(--sans); color: var(--ink-soft);
}
.swatch.active { outline: 2px solid var(--ink); outline-offset: 2px; }
.swatch-custom {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; max-width: 18px; box-sizing: border-box; overflow: hidden;
  border: 2px solid transparent; font-size: 12px; line-height: 1; color: var(--ink);
  background: linear-gradient(var(--sheet), var(--sheet)) padding-box,
              conic-gradient(#c0392b, #d4a017, #3f7a4a, #2f5d8a, #7a3b6e, #c0392b) border-box;
}
#tts-zen-accent-picker { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; border: 0; padding: 0; }
#tts-zen-accent-hex {
  flex: 1; min-width: 0; padding: 5px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--paper); color: var(--ink);
  font: 12px var(--mono); outline: none;
}
#tts-zen-accent-hex:focus { border-color: var(--ink-soft); }
#tts-zen-accent-hex.invalid { border-color: var(--accent); }
.accent-hint { margin: -2px 0 0 74px; font: 10px var(--mono); color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

#tts-zen-resume-row { text-align: center; padding: 0 14px 6px; }
#tts-zen-restart {
  background: none; border: none; padding: 0; cursor: pointer;
  font: 12px var(--sans); color: var(--ink-soft);
  text-decoration: underline; text-underline-offset: 3px;
}
#tts-zen-restart:hover { color: var(--ink); }

#tts-zen-status {
  padding: 0 14px 10px; font-size: 12px; color: var(--ink-soft); text-align: center;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#tts-zen-status.error { color: var(--accent); }

/* Collapsed state */
#tts-zen-collapsed {
  position: fixed; z-index: 999999;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--sheet); border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  color: var(--ink); cursor: grab; box-shadow: var(--shadow);
  touch-action: none; transform-origin: center;
  transition: transform .34s cubic-bezier(.34,1.56,.64,1), opacity .2s ease, visibility 0s, box-shadow .2s ease;
}
#tts-zen-collapsed.hidden {
  transform: scale(.3); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform .16s ease, opacity .12s ease, visibility 0s .16s;
}
#tts-zen-collapsed:hover { color: var(--accent); }
#tts-zen-collapsed.dragging { transition: none; cursor: grabbing; box-shadow: 0 10px 28px rgba(0,0,0,.24); }
/* Where the bubble will land while it is being dragged */
#tts-zen-bubble-ghost {
  position: fixed; z-index: 999998; width: 40px; height: 40px; border-radius: 50%;
  border: 2px dashed var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent);
  opacity: 0; transform: scale(.6); pointer-events: none;
  transition: opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1), top .22s cubic-bezier(.2,.8,.2,1), left .22s cubic-bezier(.2,.8,.2,1), right .22s cubic-bezier(.2,.8,.2,1), bottom .22s cubic-bezier(.2,.8,.2,1);
}
#tts-zen-bubble-ghost.show { opacity: 1; transform: scale(1); }

/* Modals */
#tts-zen-preview-overlay, #tts-zen-sites-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(20,18,15,0.35);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .15s ease; pointer-events: none;
}
#tts-zen-preview-overlay:not(.hidden), #tts-zen-sites-overlay:not(.hidden) { opacity: 1; pointer-events: auto; }
#tts-zen-preview-overlay.hidden, #tts-zen-sites-overlay.hidden { display: none; }

#tts-zen-preview-overlay:not(.hidden) #tts-zen-preview-modal,
#tts-zen-sites-overlay:not(.hidden) #tts-zen-sites-modal { animation: modal-in .28s cubic-bezier(.2,.8,.2,1); }
.closing #tts-zen-preview-modal, .closing #tts-zen-sites-modal { transform: translateY(8px) scale(.98); opacity: 0; transition: transform .18s ease, opacity .18s ease; }
@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
#tts-zen-read-label.swap { animation: label-in .22s ease; display: inline-block; }
@keyframes label-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }

#tts-zen-preview-modal, #tts-zen-sites-modal {
  max-width: 92vw; background: var(--paper); color: var(--ink);
  border: 1px solid var(--rule); border-radius: 6px; overflow: hidden;
  box-shadow: var(--shadow); font-family: var(--sans);
}
#tts-zen-preview-modal { width: 620px; max-height: 84vh; display: flex; flex-direction: column; }
#tts-zen-sites-modal { width: 380px; }

#tts-zen-preview-header, #tts-zen-sites-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 10px 10px 18px; border-bottom: 1px solid var(--rule);
  flex-wrap: wrap; gap: 8px;
}
#tts-zen-preview-header > span, #tts-zen-sites-header > span {
  font-family: var(--serif); font-size: 16px; font-weight: 600; color: var(--ink);
}
#tts-zen-preview-tools { display: flex; align-items: center; gap: 2px; }
.preview-tool {
  padding: 3px 8px; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft);
  font: 12px var(--sans); cursor: pointer;
}
.preview-tool:hover { background: var(--hover); color: var(--ink); }
.preview-tool.active { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
.preview-tool[data-font="serif"] { font-family: var(--serif); }
.preview-tool[data-font="mono"] { font-family: var(--mono); }
.tool-sep { width: 1px; height: 14px; background: var(--rule); margin: 0 6px; }

#tts-zen-preview-close, #tts-zen-sites-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0; background: transparent; border: none;
  border-radius: 4px; color: var(--ink-soft); cursor: pointer;
}
#tts-zen-preview-close:hover, #tts-zen-sites-close:hover { background: var(--hover); color: var(--ink); }

#tts-zen-preview-content {
  flex: 1; overflow-y: auto; padding: 28px 36px;
  font-family: var(--serif); font-size: 17px; line-height: 1.7; color: var(--ink);
  white-space: pre-wrap; user-select: text;
}
#tts-zen-preview-content p { max-width: 62ch; margin-left: auto !important; margin-right: auto !important; }
#tts-zen-preview-content .sentence { padding: 1px 0; transition: background .15s ease, color .15s ease; }
#tts-zen-preview-content .sentence.active { background: var(--mark); color: var(--ink); }
#tts-zen-preview-content .sentence.played { color: var(--ink-soft); }
#tts-zen-preview-content .chunk-label {
  max-width: 62ch; margin: 16px auto 4px; text-align: center;
  font-size: 12px; font-style: italic; color: var(--ink-soft);
}
#tts-zen-preview-content .chunk-pending {
  font-size: 14px; color: var(--ink-soft);
  border-left: 2px solid var(--rule); padding-left: 10px; margin-bottom: 6px;
}

/* Sites list */
#tts-zen-sites-list { padding: 6px 18px 14px; display: flex; flex-direction: column; max-height: 55vh; overflow-y: auto; }
.site-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--rule);
}
.site-row:last-child { border-bottom: none; }
.site-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.site-row-icon {
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 20px; height: 20px; border-radius: 3px;
  color: var(--ink-soft); font-size: 15px;
}
.site-row-info { display: flex; flex-direction: column; min-width: 0; }
.site-row-name { font-size: 14px; color: var(--ink); }
.site-row-domain { font-size: 12px; color: var(--ink-soft); }
.site-add-row { padding-top: 12px; }
.sites-section { margin: 14px 0 2px; font-size: 12px; color: var(--ink-soft); font-variant: small-caps; letter-spacing: .04em; }
.sites-section:first-child { margin-top: 4px; }
.sites-hint { margin: 2px 0 6px; font-size: 12px; line-height: 1.4; color: var(--ink-soft); }
.site-remove {
  flex-shrink: 0; width: 24px; height: 24px; padding: 0; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft); cursor: pointer;
}
.site-remove:hover { background: var(--hover); color: var(--ink); }
#tts-zen-add-site-input {
  flex: 1; min-width: 0; padding: 6px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--sheet); color: var(--ink);
  font: 13px var(--sans); outline: none;
}
#tts-zen-add-site-input:focus { border-color: var(--ink-soft); }
#tts-zen-add-site-btn {
  padding: 6px 12px; border-radius: 4px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: 13px var(--sans);
  cursor: pointer; white-space: nowrap;
}
#tts-zen-add-site-btn:hover { background: var(--hover); }

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
`;
// ---- Translations ----

var T = {
  es: {
    minimize: 'Minimizar', preview: 'Ver texto extraído', sites: 'Sitios compatibles',
    settings: 'Ajustes', voice: 'Voz', engine: 'Motor', engineNative: 'Nativo (Browser)',
    engineNeural: 'Neural (edge-tts)', speed: 'Velocidad', langLabel: 'Idioma',
    langES: 'Español', langEN: 'English', prev: 'Anterior', next: 'Siguiente',
    read: 'Leer', ready: 'Listo', extractedText: 'Texto extraído', reduce: 'Reducir',
    increase: 'Aumentar', lessSpacing: 'Menos espacio', moreSpacing: 'Más espacio',
    sitesModal: 'Sitios compatibles', loadingVoices: 'Cargando voces...',
    loadingEdgeVoices: 'Cargando voces edge-tts...', serverUnavailable: 'Servidor no disponible',
    unknown: 'desconocido', line: 'Línea', noText: 'Sin texto — haz clic en Leer primero.',
    generic: 'Genérico', otherSites: 'otros sitios', addSite: 'Añadir',
    addSitePlaceholder: 'ejemplo.com', serif: 'Serif', sans: 'Sans', mono: 'Mono',
    translateTitle: 'Traducción', engineLocal: 'Local (Piper)',
    continueAt: 'Continuar', restart: 'Desde el inicio', autoNext: 'Seguir con el siguiente capítulo',
    downloadVoice: 'Descargar voz', downloading: 'Descargando…', downloaded: 'descargada',
    downloadFailed: 'No se pudo descargar',
    look: 'Aspecto', followTheme: 'Usar los colores del tema del navegador', accent: 'Acento',
    pasteZen: 'Pegar color de Zen', otherColor: 'Otro color', wordHighlight: 'Resaltar la palabra que suena',
    otherLangs: 'Otros idiomas', readLang: 'Leer en', autoLang: 'Auto · %s', original: 'Idioma original',
    detected: 'Detectado: %s', packs: 'Paquetes de traducción', noPacks: 'Ninguno descargado',
    remove: 'Borrar', pick: 'Elegir dónde empezar', roboticHint: 'Las voces del sistema suenan robóticas.',
    tryLocal: 'Probar voz Local', trFound: 'Texto en %s.', trNeedsTwo: 'Hacen falta dos paquetes (%s).',
    trDownload: 'Descargar %s · %s MB', trOnline: 'Traducir en línea', trOriginal: 'Leer en %s',
    trDownloading: 'Descargando… %s', trFailed: 'No se pudo descargar la traducción',
    tabVoice: 'Voz', tabRead: 'Lectura', tabTr: 'Traducir', tabLook: 'Aspecto', uiLang: 'Interfaz',
    inlineTr: 'Mostrar la traducción junto al texto', trMode: 'Traducir con', trAsk: 'Preguntar',
    trOffline: 'Paquete sin conexión', trOnlineMode: 'En línea', trNever: 'No traducir',
    remembered: 'Elecciones recordadas', forget: 'Olvidar', neuralHint: '¿Aún más natural? El motor Neural usa voces de Microsoft.',
    tryNeural: 'Usar Neural', qHigh: 'Alta calidad', qMedium: 'Normal', qLow: 'Ligera',
    retry: 'No se pudo descargar · Reintentar', downloadPct: 'Descargando… %s',
    tipHigh: 'Alta calidad · la más natural; ~110 MB y tarda más en generar cada frase',
    tipMedium: 'Normal · buen equilibrio entre naturalidad y rapidez; ~60 MB',
    tipLow: 'Ligera · la más rápida y pequeña; suena más robótica',
    tipNative: 'Voces del navegador: al instante, sin descargas; calidad según tu sistema',
    tipServer: 'Voces neurales de Microsoft (edge-tts): las más naturales; necesita el servidor en marcha',
    tipLocal: 'Piper en tu equipo: sin conexión una vez descargada la voz',
    infoNative: 'Voz del navegador · al instante', infoNativeRobotic: 'Voz del sistema (espeak) · suena robótica',
    infoServer: 'Neural · la más natural; necesita el servidor',
    slowVoice: 'En tu equipo esta voz se genera más despacio de lo que suena (x%s), por eso hay pausas entre frases. Prueba una de calidad Normal o Ligera.',
    openLibrary: 'Abrir la biblioteca',
    autoOpen: 'Abrir siempre en este sitio', presetsTitle: 'Sitios con extractor propio',
    presetNext: 'solo la historia · capítulo siguiente en la misma página', presetScroll: 'solo la historia · sigue el scroll infinito',
    presetGeneric: 'cualquier otra página · extractor de artículos', autoTitle: 'Abrir siempre en',
    autoHint: 'El panel aparece al pulsar el botón de zenTTS en la barra del navegador (Alt+Mayús+Z). En estos sitios se abre solo.'
  },
  en: {
    minimize: 'Minimize', preview: 'View extracted text', sites: 'Supported sites',
    settings: 'Settings', voice: 'Voice', engine: 'Engine', engineNative: 'Native (Browser)',
    engineNeural: 'Neural (edge-tts)', speed: 'Speed', langLabel: 'Language',
    langES: 'Español', langEN: 'English', prev: 'Previous', next: 'Next',
    read: 'Read', ready: 'Ready', extractedText: 'Extracted text', reduce: 'Decrease',
    increase: 'Increase', lessSpacing: 'Less spacing', moreSpacing: 'More spacing',
    sitesModal: 'Supported sites', loadingVoices: 'Loading voices...',
    loadingEdgeVoices: 'Loading edge-tts voices...', serverUnavailable: 'Server unavailable',
    unknown: 'unknown', line: 'Line', noText: 'No text — click Read first.',
    generic: 'Generic', otherSites: 'other sites', addSite: 'Add',
    addSitePlaceholder: 'example.com', serif: 'Serif', sans: 'Sans', mono: 'Mono',
    translateTitle: 'Translation', engineLocal: 'Local (Piper)',
    continueAt: 'Continue', restart: 'From the beginning', autoNext: 'Continue with the next chapter',
    downloadVoice: 'Download voice', downloading: 'Downloading…', downloaded: 'downloaded',
    downloadFailed: 'Download failed',
    look: 'Appearance', followTheme: 'Use the browser theme colors', accent: 'Accent',
    pasteZen: 'Paste Zen color', otherColor: 'Other color', wordHighlight: 'Highlight the spoken word',
    otherLangs: 'Other languages', readLang: 'Read in', autoLang: 'Auto · %s', original: 'Original language',
    detected: 'Detected: %s', packs: 'Translation packs', noPacks: 'None downloaded',
    remove: 'Delete', pick: 'Choose where to start', roboticHint: 'System voices sound robotic.',
    tryLocal: 'Try the Local voice', trFound: 'Text in %s.', trNeedsTwo: 'Needs two packs (%s).',
    trDownload: 'Download %s · %s MB', trOnline: 'Translate online', trOriginal: 'Read in %s',
    trDownloading: 'Downloading… %s', trFailed: 'Could not download the translation',
    tabVoice: 'Voice', tabRead: 'Reading', tabTr: 'Translate', tabLook: 'Look', uiLang: 'Interface',
    inlineTr: 'Show the translation next to the text', trMode: 'Translate with', trAsk: 'Ask',
    trOffline: 'Offline pack', trOnlineMode: 'Online', trNever: "Don't translate",
    remembered: 'Remembered choices', forget: 'Forget', neuralHint: 'Even more natural? The Neural engine uses Microsoft voices.',
    tryNeural: 'Use Neural', qHigh: 'High quality', qMedium: 'Standard', qLow: 'Light',
    retry: 'Download failed · Retry', downloadPct: 'Downloading… %s',
    tipHigh: 'High quality · the most natural; ~110 MB and slower to generate each sentence',
    tipMedium: 'Standard · a good balance of naturalness and speed; ~60 MB',
    tipLow: 'Light · the fastest and smallest; sounds more robotic',
    tipNative: 'Browser voices: instant, nothing to download; quality depends on your system',
    tipServer: 'Microsoft neural voices (edge-tts): the most natural; needs the server running',
    tipLocal: 'Piper on your computer: offline once the voice is downloaded',
    infoNative: 'Browser voice · instant', infoNativeRobotic: 'System voice (espeak) · sounds robotic',
    infoServer: 'Neural · the most natural; needs the server',
    slowVoice: 'On your computer this voice takes longer to generate than to play (x%s), hence the pauses between sentences. Try a Standard or Light one.',
    openLibrary: 'Open the library',
    autoOpen: 'Always open on this site', presetsTitle: 'Sites with their own extractor',
    presetNext: 'just the story · next chapter in the same page', presetScroll: 'just the story · follows infinite scroll',
    presetGeneric: 'any other page · article extractor', autoTitle: 'Always open on',
    autoHint: 'The panel appears when you press the zenTTS button in the browser toolbar (Alt+Shift+Z). On these sites it opens by itself.'
  }
};

function t(key) { return (T[state.lang] || T['es'])[key] || key; }
function tf(key) {
  var out = t(key), args = Array.prototype.slice.call(arguments, 1);
  args.forEach(function(a) { out = out.replace('%s', a); });
  return out;
}

// "en" → "inglés" / "English", in the interface language
export function languageName(code) {
  if (!code) return '';
  try {
    var name = new Intl.DisplayNames([state.lang], { type: 'language' }).of(code.replace('_', '-'));
    if (name) return name;
  } catch (_) {}
  return code;
}

// ---- State ----

let state = {
  voices: [],
  currentVoice: 'es-ES-AlvaroNeural',
  currentRate: 1.0,
  currentEngine: 'native',
  localVoice: 'es_ES-davefx-medium',
  autoNext: true,
  accent: '',
  followTheme: true,
  wordHighlight: true,
  readLang: 'auto',
  trMode: 'ask',
  inlineTr: true,
  tab: 'voice',
  corner: 'br',
  lang: 'es'
};

// ---- Storage ----

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(['voice', 'rate', 'engine', 'lang', 'readLang', 'localVoice', 'autoNext', 'accent', 'followTheme', 'wordHighlight', 'corner', 'trMode', 'inlineTr', 'tab']);
    // "Leer en" replaces the old translate-to setting (langOut): start on Auto
    if (stored.readLang) state.readLang = stored.readLang;
    if (stored.corner) state.corner = stored.corner;
    if (stored.trMode) state.trMode = stored.trMode;
    if (typeof stored.inlineTr === 'boolean') state.inlineTr = stored.inlineTr;
    if (stored.tab) state.tab = stored.tab;
    if (typeof stored.wordHighlight === 'boolean') state.wordHighlight = stored.wordHighlight;
    if (typeof stored.accent === 'string') state.accent = stored.accent;
    if (typeof stored.followTheme === 'boolean') state.followTheme = stored.followTheme;
    if (stored.localVoice) state.localVoice = stored.localVoice;
    if (typeof stored.autoNext === 'boolean') state.autoNext = stored.autoNext;
    if (stored.voice) state.currentVoice = stored.voice;
    if (stored.rate) state.currentRate = stored.rate;
    if (stored.engine) state.currentEngine = stored.engine;
    if (stored.lang) state.lang = stored.lang;
  } catch (_) {}
  syncShared();
}

// The content script reads settings from window.__tts_zen_state
function syncShared() {
  var shared = window.__tts_zen_state;
  if (!shared) return;
  shared.currentVoice = state.currentVoice;
  shared.localVoice = state.localVoice;
  shared.currentRate = state.currentRate;
  shared.currentEngine = state.currentEngine;
  shared.lang = state.lang;
  shared.readLang = state.readLang;
  shared.trMode = state.trMode;
  shared.inlineTr = state.inlineTr;
  shared.autoNext = state.autoNext;
  shared.wordHighlight = state.wordHighlight;
}

async function saveSettings() {
  try {
    await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate, engine: state.currentEngine, lang: state.lang, readLang: state.readLang, corner: state.corner, trMode: state.trMode, inlineTr: state.inlineTr, tab: state.tab, localVoice: state.localVoice, autoNext: state.autoNext, accent: state.accent, followTheme: state.followTheme, wordHighlight: state.wordHighlight });
  } catch (_) {}
}

// ---- Voice Loading ----

function uiLang() {
  try { return browser.i18n.getUILanguage().slice(0, 2).toLowerCase(); } catch (_) { return state.lang; }
}

// Language the text will be spoken in: set by the content script once it has
// decided whether to translate; until then, the reading language (the page's
// own language only with "Original language")
function outLang() {
  var shared = window.__tts_zen_state;
  if (shared && shared.speechLang) return shared.speechLang;
  if (state.readLang === 'original') return detectedLang || uiLang();
  if (state.readLang && state.readLang !== 'auto') return state.readLang;
  return uiLang();
}

// espeak (the usual Linux speech engine) voices: "Spanish (Spain)+Nguyen"
function isRobotic(v) {
  return /espeak|mbrola|speechd/i.test((v.voiceURI || '') + ' ' + v.name) || /\+/.test(v.name);
}

function cleanVoiceName(v) {
  var m = v.name.match(/^(.*?)\+(.+)$/);
  if (isRobotic(v)) return langLabel(v.lang) + (m ? ' · ' + m[2].replace(/_/g, ' ') : '');
  return v.name.replace(/^Microsoft /, '');
}

async function loadVoices() {
  var localRow = getEl('tts-zen-local-row');
  if (localRow) localRow.hidden = state.currentEngine !== 'local';
  var neural = getEl('tts-zen-neural-hint');
  if (neural) neural.hidden = state.currentEngine !== 'local';
  var hint = getEl('tts-zen-voice-hint');
  if (hint) hint.hidden = true;
  if (state.currentEngine === 'server') return loadServerVoices();
  if (state.currentEngine === 'local') return loadLocalVoices();

  var voices = speechSynthesis.getVoices();
  if (voices.length === 0) {
    // Voices load asynchronously the first time
    speechSynthesis.onvoiceschanged = function() {
      if (state.currentEngine === 'native') loadVoices();
    };
    return;
  }
  state.voices = voices.map(function(v) {
    return { name: v.name, lang: v.lang, default: v.default, label: cleanVoiceName(v), robotic: isRobotic(v) };
  });
  populateVoiceDropdown('currentVoice');

  // Only robotic system voices for this language: suggest the local voice
  var prefix = outLang().toLowerCase();
  var mine = state.voices.filter(function(v) { return (v.lang || '').toLowerCase().startsWith(prefix); });
  if (hint) hint.hidden = !(mine.length === 0 || mine.every(function(v) { return v.robotic; }));
}

function setVoicePlaceholder(text) {
  var select = getEl('tts-zen-voice');
  if (!select) return;
  select.replaceChildren();
  var opt = document.createElement('option');
  opt.value = ''; opt.textContent = text;
  select.appendChild(opt);
  select.disabled = true;
}

async function loadServerVoices() {
  setVoicePlaceholder(t('loadingEdgeVoices'));
  try {
    var lang = outLang() + '-';
    var resp = await browser.runtime.sendMessage({ action: 'get_voices', locale: lang });
    if (state.currentEngine !== 'server') return;
    if (resp && resp.success && resp.voices && resp.voices.length > 0) {
      state.voices = resp.voices.map(function(v) { return { name: v.name, lang: v.locale }; });
      populateVoiceDropdown('currentVoice');
      window.__tts_zen_state.serverAvailable = true;
      return;
    }
  } catch (e) {
    console.error('[zenTTS] voices:', e.message || e);
  }
  window.__tts_zen_state.serverAvailable = false;
  setVoicePlaceholder(t('serverUnavailable'));
}

var localStored = [];
var localDownload = null;      // { voiceId, fraction } while a voice downloads

var QUALITY = { high: 'qHigh', medium: 'qMedium', low: 'qLow', x_low: 'qLow' };

async function loadLocalVoices() {
  setVoicePlaceholder(t('loadingVoices'));
  var resp;
  try { resp = await browser.runtime.sendMessage({ action: 'local_voices' }); } catch (_) {}
  if (state.currentEngine !== 'local') return;
  localStored = (resp && resp.stored) || [];
  var prefix = outLang().toLowerCase() + '_';
  var all = (resp && resp.catalog) || [];
  var catalog = all.filter(function(v) {
    return v.key.toLowerCase().startsWith(prefix) || localStored.includes(v.key);
  });
  if (!catalog.length) catalog = all;
  state.voices = catalog.map(function(v) {
    var region = (v.language || '').split('_')[1];
    var parts = [v.name.replace(/_/g, ' ')];
    if (region) parts.push(region);
    if (localStored.includes(v.key)) parts.push(t('downloaded'));
    else if (v.size) parts.push(Math.round(v.size / 1048576) + ' MB');
    var q = QUALITY[v.quality] || 'qMedium';
    return {
      name: v.key, label: parts.join(' · '), lang: v.language, size: v.size, quality: q,
      tip: t({ qHigh: 'tipHigh', qMedium: 'tipMedium', qLow: 'tipLow' }[q]),
      group: v.key.toLowerCase().startsWith(prefix) ? (QUALITY[v.quality] || 'qMedium') : null
    };
  });
  if (!state.voices.some(function(v) { return v.name === state.localVoice; })) {
    var firstStored = state.voices.find(function(v) { return localStored.includes(v.name); });
    var standard = state.voices.find(function(v) { return v.group === 'qMedium'; });
    state.localVoice = (firstStored || standard || state.voices[0] || {}).name || state.localVoice;
    syncShared();
  }
  populateVoiceDropdown('localVoice');
  updateLocalRow();
  warmLocalVoice();
}

// Sets a .fill-btn's label and water level (fraction 0..1, or null when idle)
function setFill(btn, text, fraction) {
  if (!btn) return;
  btn.querySelectorAll('.fill-label').forEach(function(l) { l.textContent = text; });
  btn.title = text;
  var filling = fraction != null;
  btn.classList.toggle('filling', filling);
  btn.disabled = filling;
  btn.style.setProperty('--p', filling ? Math.round(Math.max(0, Math.min(1, fraction)) * 100) + '%' : '0%');
}

function updateLocalRow() {
  var btn = getEl('tts-zen-local-dl');
  if (!btn) return;
  var have = localStored.includes(state.localVoice);
  var row = getEl('tts-zen-local-row');
  if (row && state.currentEngine === 'local') row.hidden = have && !localDownload;
  if (!localDownload) btn.classList.remove('done');
  if (localDownload && localDownload.voiceId === state.localVoice) {
    setFill(btn, tf('downloadPct', Math.round(localDownload.fraction * 100) + ' %'), localDownload.fraction);
    return;
  }
  var voice = (state.voices || []).find(function(v) { return v.name === state.localVoice; });
  var mb = voice && voice.size ? ' · ' + Math.round(voice.size / 1048576) + ' MB' : '';
  setFill(btn, (btn.dataset.failed === state.localVoice ? t('retry') : t('downloadVoice') + mb), null);
}

async function downloadLocalVoice() {
  var btn = getEl('tts-zen-local-dl');
  var voiceId = state.localVoice;
  if (localDownload) return;
  localDownload = { voiceId: voiceId, fraction: 0 };
  if (btn) delete btn.dataset.failed;
  updateLocalRow();
  try {
    var resp = await browser.runtime.sendMessage({ action: 'local_download', voiceId: voiceId });
    if (!resp || !resp.success) throw new Error((resp && resp.error) || 'download');
    localDownload.fraction = 1;
    updateLocalRow();
    // Let the water reach the end, then fade the button out
    await new Promise(function(r) { setTimeout(r, 350); });
    if (btn) btn.classList.add('done');
    await new Promise(function(r) { setTimeout(r, 260); });
    localDownload = null;
    await loadLocalVoices();
  } catch (e) {
    console.error('[zenTTS] download voice:', e.message || e);
    localDownload = null;
    if (btn) btn.dataset.failed = voiceId;
    updateLocalRow();
  }
}

// Download progress is pushed by the background page
if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener(function(msg) {
    if (!msg || msg.action !== 'local_progress' || !localDownload || msg.voiceId !== localDownload.voiceId) return;
    if (msg.total) localDownload.fraction = Math.min(0.99, msg.loaded / msg.total);
    updateLocalRow();
  });
}

var LANG_NAMES = {
  es: 'Español', en: 'English', fr: 'Français', de: 'Deutsch', it: 'Italiano',
  pt: 'Português', ja: '日本語', ko: '한국어', zh: '中文', ru: 'Русский'
};

function langLabel(lang) {
  var parts = (lang || '').split(/[-_]/);
  var name = LANG_NAMES[parts[0]] || parts[0] || t('unknown');
  return parts[1] ? name + ' (' + parts[1] + ')' : name;
}

// Fills the voice list and keeps state[key] pointing at an existing voice,
// preferring one in the reading language when the saved voice is missing.
function populateVoiceDropdown(key) {
  var select = getEl('tts-zen-voice');
  if (!select) return;
  select.replaceChildren();
  select.disabled = false;
  if (!state.voices || state.voices.length === 0) return;

  var names = state.voices.map(function(v) { return v.name; });
  if (!names.includes(state[key])) {
    var prefix = outLang().toLowerCase();
    var match = state.voices.find(function(v) { return (v.lang || '').toLowerCase().startsWith(prefix); });
    var def = state.voices.find(function(v) { return v.default; });
    state[key] = (match || def || state.voices[0]).name;
    syncShared();
  }

  // Voices in the reading language first, grouped by region (Piper voices:
  // by quality, best first); the rest after
  var want = outLang().toLowerCase();
  var groups = {};
  var others = [];
  var byQuality = key === 'localVoice';
  state.voices.forEach(function(v) {
    var lang = v.lang || '';
    var g = byQuality ? v.group : (lang.toLowerCase().replace('_', '-').startsWith(want) ? lang : null);
    if (g) (groups[g] = groups[g] || []).push(v);
    else others.push(v);
  });
  var order = byQuality ? ['qHigh', 'qMedium', 'qLow'].filter(function(g) { return groups[g]; }) : Object.keys(groups).sort();
  function option(v, withLang) {
    var opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = (v.label || v.name) + (withLang && v.label && v.label.indexOf(langLabel(v.lang)) !== 0 ? ' — ' + langLabel(v.lang) : '');
    opt.title = v.tip ? v.tip + ' — ' + v.name : v.name;
    opt.selected = v.name === state[key];
    return opt;
  }
  order.forEach(function(g) {
    var optgroup = document.createElement('optgroup');
    optgroup.label = byQuality ? t(g) : langLabel(g);
    groups[g].forEach(function(v) { optgroup.appendChild(option(v, false)); });
    select.appendChild(optgroup);
  });
  if (others.length) {
    var rest = document.createElement('optgroup');
    rest.label = t('otherLangs');
    others.sort(function(a, b) { return (a.lang || '').localeCompare(b.lang || ''); })
      .forEach(function(v) { rest.appendChild(option(v, true)); });
    select.appendChild(rest);
  }
  var chosen = state.voices.find(function(v) { return v.name === state[key]; });
  select.title = chosen ? (chosen.tip ? chosen.tip + ' — ' : '') + chosen.name : '';
  renderVoiceInfo();
}

// One line under the voice list describing the chosen voice
function renderVoiceInfo() {
  var row = getEl('tts-zen-voice-info-row'), el = getEl('tts-zen-voice-info');
  if (!row || !el) return;
  var text = '';
  if (state.currentEngine === 'local') {
    var v = (state.voices || []).find(function(x) { return x.name === state.localVoice; });
    text = v && v.tip ? v.tip : '';
  } else if (state.currentEngine === 'server') {
    text = t('infoServer');
  } else {
    var n = (state.voices || []).find(function(x) { return x.name === state.currentVoice; });
    if (n) text = n.robotic ? t('infoNativeRobotic') : t('infoNative');
  }
  el.textContent = text;
  row.hidden = !text;
  renderSlowHint();
}

var slowVoices = {};   // voiceId → generation time / audio time

function renderSlowHint() {
  var row = getEl('tts-zen-slow-hint');
  if (!row) return;
  var ratio = slowVoices[state.localVoice];
  var show = state.currentEngine === 'local' && ratio > 1;
  row.hidden = !show;
  if (show) getEl('tts-zen-slow-text').textContent = tf('slowVoice', ratio.toFixed(1));
}

if (typeof window !== 'undefined') {
  window.addEventListener('zentts-voice-speed', function(e) {
    slowVoices[e.detail.voice] = e.detail.ratio;
    renderSlowHint();
  });
}

// Loads the chosen Piper voice in the background page before it is needed
function warmLocalVoice() {
  if (state.currentEngine !== 'local' || !localStored.includes(state.localVoice)) return;
  try { browser.runtime.sendMessage({ action: 'local_warm', voiceId: state.localVoice }).catch(function() {}); } catch (_) {}
}

function applyLanguage(shadow) {
  var lang = state.lang;
  // Update settings label texts
  [['tts-zen-voice-label', 'voice'], ['tts-zen-engine-label', 'engine'], ['tts-zen-lang-label', 'uiLang'],
   ['tts-zen-tab-voice', 'tabVoice'], ['tts-zen-tab-read', 'tabRead'], ['tts-zen-tab-tr', 'tabTr'], ['tts-zen-tab-look', 'tabLook'],
   ['tts-zen-inline-tr-label', 'inlineTr'], ['tts-zen-open-library', 'openLibrary'], ['tts-zen-autoopen-label', 'autoOpen'], ['tts-zen-trmode-label', 'trMode'],
   ['tts-zen-neural-hint-text', 'neuralHint'], ['tts-zen-try-neural', 'tryNeural'],
   ['tts-zen-translate-title', 'translateTitle'], ['tts-zen-speed-text', 'speed'],
   ['tts-zen-autonext-label', 'autoNext'], ['tts-zen-restart', 'restart'],
   ['tts-zen-look-title', 'look'], ['tts-zen-word-hl-label', 'wordHighlight'],
   ['tts-zen-readlang-label', 'readLang'], ['tts-zen-packs-title', 'packs'],
   ['tts-zen-voice-hint-text', 'roboticHint'], ['tts-zen-try-local', 'tryLocal'], ['tts-zen-follow-label', 'followTheme'], ['tts-zen-accent-label', 'accent']].forEach(function(pair) {
    var el = shadow.getElementById(pair[0]);
    if (el) el.textContent = T[lang][pair[1]];
  });
  renderReadLabel();
  updateLocalRow();
  var trModeSel = shadow.getElementById('tts-zen-trmode');
  if (trModeSel) ['trAsk', 'trOffline', 'trOnlineMode', 'trNever'].forEach(function(k, i) { trModeSel.options[i].textContent = T[lang][k]; });
  shadow.querySelectorAll('.tabs button').forEach(function(b) { b.title = b.textContent; });
  renderReadLangOptions();
  renderDetected();
  renderTranslateBar();
  refreshPacks();
  var pickBtn = shadow.getElementById('tts-zen-pick');
  if (pickBtn) pickBtn.title = T[lang].pick;
  var hex = shadow.getElementById('tts-zen-accent-hex');
  if (hex) hex.placeholder = T[lang].pasteZen;
  var custom = shadow.getElementById('tts-zen-accent-custom');
  if (custom) custom.title = T[lang].otherColor;
  var previewBtn = shadow.getElementById('tts-zen-preview-btn');
  if (previewBtn) previewBtn.title = T[lang].preview;
  var sitesBtn = shadow.getElementById('tts-zen-sites-btn');
  if (sitesBtn) sitesBtn.title = T[lang].sites;
  var settingsBtn = shadow.getElementById('tts-zen-settings-btn');
  if (settingsBtn) settingsBtn.title = T[lang].settings;
  var minimizeBtn = shadow.getElementById('tts-zen-minimize');
  if (minimizeBtn) minimizeBtn.title = T[lang].minimize;
  var prevBtn = shadow.getElementById('tts-zen-prev');
  if (prevBtn) prevBtn.title = T[lang].prev;
  var nextBtn = shadow.getElementById('tts-zen-next');
  if (nextBtn) nextBtn.title = T[lang].next;

  // Update engine options
  var engineSelect = shadow.getElementById('tts-zen-engine');
  if (engineSelect && engineSelect.options.length >= 3) {
    engineSelect.options[0].textContent = T[lang].engineNative;
    engineSelect.options[1].textContent = T[lang].engineNeural;
    engineSelect.options[2].textContent = T[lang].engineLocal;
    engineSelect.options[0].title = T[lang].tipNative;
    engineSelect.options[1].title = T[lang].tipServer;
    engineSelect.options[2].title = T[lang].tipLocal;
  }
  renderVoiceInfo();

  // Update status
  var statusEl = shadow.getElementById('tts-zen-status');
  if (statusEl && (statusEl.textContent === T['es'].ready || statusEl.textContent === T['en'].ready)) {
    statusEl.textContent = T[lang].ready;
  }

  // Update sites modal header
  var sitesHeader = shadow.querySelector('#tts-zen-sites-header span');
  if (sitesHeader) sitesHeader.textContent = T[lang].sitesModal;
  // Update preview header
  var previewHeader = shadow.querySelector('#tts-zen-preview-header span');
  if (previewHeader) previewHeader.textContent = T[lang].extractedText;
  // Update preview tools
  var tools = shadow.querySelectorAll('.preview-tool');
  tools.forEach(function(tool) {
    if (tool.dataset.font === 'serif') tool.textContent = T[lang].serif;
    if (tool.dataset.font === 'sans') tool.textContent = T[lang].sans;
    if (tool.dataset.font === 'mono') tool.textContent = T[lang].mono;
    if (tool.dataset.size === 'down') tool.title = T[lang].reduce;
    if (tool.dataset.size === 'up') tool.title = T[lang].increase;
    if (tool.dataset.spacing === 'down') tool.title = T[lang].lessSpacing;
    if (tool.dataset.spacing === 'up') tool.title = T[lang].moreSpacing;
  });
  // Update add site input placeholder
  var addInput = shadow.getElementById('tts-zen-add-site-input');
  if (addInput) addInput.placeholder = T[lang].addSitePlaceholder;
  var addBtn = shadow.getElementById('tts-zen-add-site-btn');
  if (addBtn) addBtn.textContent = T[lang].addSite;

  // Re-render sites list if open
  if (shadow.getElementById('tts-zen-sites-overlay') && 
      !shadow.getElementById('tts-zen-sites-overlay').classList.contains('hidden')) {
    renderSitesList();
  }
  tipify(shadow);
}

// ---- Tooltips ----
// Icon buttons show a tooltip in the panel's style instead of the system one.
// The tooltip lives outside the panel, so the panel's rounded clip doesn't cut it.

function tipify(shadow) {
  shadow.querySelectorAll('#tts-zen-panel button[title], #tts-zen-collapsed[title], .preview-tool[title], #tts-zen-preview-close, #tts-zen-sites-close').forEach(function(b) {
    var text = b.getAttribute('title');
    if (!text) return;
    b.setAttribute('data-tip', text);
    b.setAttribute('aria-label', text);
    b.removeAttribute('title');
  });
}

function setupTooltips(shadow) {
  var tip = shadow.getElementById('tts-zen-tip');
  var timer = null, current = null;
  function hide() { clearTimeout(timer); current = null; tip.hidden = true; }
  function show(el) {
    tip.textContent = el.getAttribute('data-tip');
    tip.hidden = false;
    var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
    var top = r.top - h - 8 > 4 ? r.top - h - 8 : r.bottom + 8;
    var left = Math.max(6, Math.min(window.innerWidth - w - 6, r.left + r.width / 2 - w / 2));
    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
  }
  shadow.addEventListener('pointerover', function(e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (el === current) return;
    hide();
    if (!el || el.classList.contains('dragging')) return;
    current = el;
    timer = setTimeout(function() { if (current === el) show(el); }, 380);
  });
  shadow.addEventListener('pointerout', function(e) {
    var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('[data-tip]');
    if (to !== current) hide();
  });
  shadow.addEventListener('pointerdown', hide, true);
  shadow.addEventListener('focusin', function(e) {
    var el = e.target.closest && e.target.closest('[data-tip]');
    if (el && el.matches(':focus-visible')) { current = el; show(el); }
  });
  shadow.addEventListener('focusout', hide);
}

// ---- UI Helpers ----

function getEl(id) {
  const host = document.getElementById('tts-zen-host');
  if (!host || !host.shadowRoot) return null;
  return host.shadowRoot.getElementById(id);
}

export function setStatus(text, isError) {
  const el = getEl('tts-zen-status');
  if (!el) return;
  el.textContent = text;
  el.className = isError ? 'error' : '';
}

export function setCounter(current, total) {
  const el = getEl('tts-zen-counter');
  if (!el) return;
  el.textContent = current + ' / ' + total;
}

export function setButtonsEnabled(btns) {
  for (const [action, enabled] of [['read', btns.read], ['pause', btns.pause], ['stop', btns.stop], ['prev', btns.prev], ['next', btns.next]]) {
    const btn = getEl('tts-zen-' + action);
    if (btn) btn.disabled = enabled === false;
  }
}

// ---- Colors: browser theme + accent ----

var browserTheme = null;

function applyColors() {
  var host = document.getElementById('tts-zen-host');
  applyPanelColors(host, state.followTheme ? themeTokens(browserTheme) : null, state.accent);
  var group = getEl('tts-zen-accent-group');
  if (group) {
    group.querySelectorAll('.swatch').forEach(function(b) {
      var custom = !b.hasAttribute('data-accent');
      var isPreset = state.accent === '' || ACCENT_PRESETS.includes(state.accent);
      b.classList.toggle('active', custom ? !isPreset : b.dataset.accent === state.accent);
    });
  }
  var picker = getEl('tts-zen-accent-picker');
  var parsed = parseColor(state.accent || ACCENT_PRESETS[0]);
  if (picker && parsed) picker.value = toHex(parsed);
}

function setAccent(value) {
  state.accent = value;
  saveSettings();
  applyColors();
}

async function loadBrowserTheme() {
  try {
    var resp = await browser.runtime.sendMessage({ action: 'get_theme' });
    browserTheme = resp && resp.success ? resp.theme : null;
  } catch (_) { browserTheme = null; }
  applyColors();
}

function setupColors(shadow) {
  var wordHl = shadow.getElementById('tts-zen-word-hl');
  wordHl.checked = state.wordHighlight;
  wordHl.addEventListener('change', function() { state.wordHighlight = wordHl.checked; syncShared(); saveSettings(); });

  var follow = shadow.getElementById('tts-zen-follow-theme');
  follow.checked = state.followTheme;
  follow.addEventListener('change', function() { state.followTheme = follow.checked; saveSettings(); applyColors(); });

  shadow.getElementById('tts-zen-accent-group').addEventListener('click', function(e) {
    var sw = e.target.closest('.swatch[data-accent]');
    if (sw) setAccent(sw.dataset.accent);
  });
  var picker = shadow.getElementById('tts-zen-accent-picker');
  picker.addEventListener('input', function() { setAccent(picker.value); });

  var hex = shadow.getElementById('tts-zen-accent-hex');
  function commitHex() {
    var v = hex.value.trim();
    if (!v) { hex.classList.remove('invalid'); return; }
    var rgb = parseColor(/^[0-9a-f]{3,8}$/i.test(v) ? '#' + v : v);
    hex.classList.toggle('invalid', !rgb);
    if (rgb) { setAccent(toHex(rgb)); hex.value = ''; }
  }
  hex.addEventListener('change', commitHex);
  hex.addEventListener('keydown', function(e) { if (e.key === 'Enter') commitHex(); });

  try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyColors);
  } catch (_) {}
  loadBrowserTheme();
}

// The background page tells every tab when the Firefox theme changes
if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.action === 'theme_changed') { browserTheme = msg.theme; applyColors(); }
  });
}

var resumeInfo = null;

function renderReadLabel() {
  var label = getEl('tts-zen-read-label');
  var text = resumeInfo ? t('continueAt') + ' · ' + (resumeInfo.index + 1) + ' / ' + resumeInfo.total : t('read');
  if (label && label.textContent !== text) {
    label.textContent = text;
    label.classList.remove('swap');
    void label.offsetWidth;
    label.classList.add('swap');
  }
  var row = getEl('tts-zen-resume-row');
  if (row) row.hidden = !resumeInfo;
}

// Offers "Continue · N / M" instead of "Read" (null → back to "Read")
export function setResume(info) {
  resumeInfo = info;
  renderReadLabel();
}

// ---- Initialization ----

export async function createPanel(shadow, handlers) {
  // Load settings FIRST — before any DOM creation
  await loadSettings();
  await loadCollapsedState();

  const style = document.createElement('style');
  style.textContent = PANEL_CSS;
  shadow.appendChild(style);

  const container = document.createElement('div');
  const parsedPanel = new DOMParser().parseFromString(PANEL_HTML, 'text/html');
  while (parsedPanel.body.firstChild) {
    container.appendChild(parsedPanel.body.firstChild);
  }
  shadow.appendChild(container);
  applyCollapsed();

  // Minimize button
  const minimizeBtn = shadow.getElementById('tts-zen-minimize');
  minimizeBtn.addEventListener('click', toggleCollapse);

  // Collapsed floating button (drag handling first, so a drag is not a click)
  const collapsedBtn = shadow.getElementById('tts-zen-collapsed');
  setupBubble(shadow);
  collapsedBtn.addEventListener('click', toggleCollapse);

  // Preview button
  const previewBtn = shadow.getElementById('tts-zen-preview-btn');
  previewBtn.addEventListener('click', function() { showPreview(''); });

  // Sites modal
  const sitesBtn = shadow.getElementById('tts-zen-sites-btn');
  sitesBtn.addEventListener('click', showSitesModal);
  const sitesClose = shadow.getElementById('tts-zen-sites-close');
  sitesClose.addEventListener('click', hideSitesModal);
  const sitesOverlay = shadow.getElementById('tts-zen-sites-overlay');
  sitesOverlay.addEventListener('click', function(e) { if (e.target === sitesOverlay) hideSitesModal(); });

  // Preview close
  const previewClose = shadow.getElementById('tts-zen-preview-close');
  previewClose.addEventListener('click', hidePreview);

  // Preview typography tools
  setupPreviewTools(shadow);

  // Overlay click to close
  const overlay = shadow.getElementById('tts-zen-preview-overlay');
  overlay.addEventListener('click', function(e) { if (e.target === overlay) hidePreview(); });

  const settingsBtn = shadow.getElementById('tts-zen-settings-btn');
  const settingsPanel = shadow.getElementById('tts-zen-settings');
  settingsBtn.addEventListener('click', function() { settingsPanel.classList.toggle('collapsed'); });
  setupTabs(shadow);
  setupTooltips(shadow);

  const voiceSelect = shadow.getElementById('tts-zen-voice');
  voiceSelect.addEventListener('change', function() {
    if (state.currentEngine === 'local') { state.localVoice = voiceSelect.value; updateLocalRow(); warmLocalVoice(); }
    else state.currentVoice = voiceSelect.value;
    syncShared();
    saveSettings();
    renderVoiceInfo();
    if (handlers.onVoice) handlers.onVoice();
  });
  shadow.getElementById('tts-zen-local-dl').addEventListener('click', downloadLocalVoice);
  setupColors(shadow);

  var autoNext = shadow.getElementById('tts-zen-autonext');
  autoNext.checked = state.autoNext;
  autoNext.addEventListener('change', function() { state.autoNext = autoNext.checked; syncShared(); saveSettings(); });

  const engineSelect = shadow.getElementById('tts-zen-engine');
  engineSelect.value = state.currentEngine;
  engineSelect.addEventListener('change', async function() {
    state.currentEngine = engineSelect.value;
    window.__tts_zen_state.currentEngine = engineSelect.value;
    saveSettings();
    await loadVoices();
    if (handlers.onEngine) handlers.onEngine(state.currentEngine);
  });

  const langSelect = shadow.getElementById('tts-zen-lang');
  langSelect.value = state.lang;
  langSelect.addEventListener('change', function() {
    state.lang = langSelect.value;
    window.__tts_zen_state.lang = langSelect.value;
    saveSettings();
    try { applyLanguage(shadow); } catch(e) { console.error(e); }
  });

  var readLang = shadow.getElementById('tts-zen-readlang');
  readLang.value = state.readLang;
  readLang.addEventListener('change', function() {
    state.readLang = readLang.value;
    syncShared();
    saveSettings();
    if (handlers.onReadLang) handlers.onReadLang(state.readLang);
    loadVoices();
  });

  shadow.getElementById('tts-zen-try-local').addEventListener('click', function() {
    engineSelect.value = 'local';
    engineSelect.dispatchEvent(new Event('change'));
  });
  shadow.getElementById('tts-zen-try-neural').addEventListener('click', function() {
    engineSelect.value = 'server';
    engineSelect.dispatchEvent(new Event('change'));
  });

  shadow.getElementById('tts-zen-open-library').addEventListener('click', function() {
    if (window.location.protocol === 'moz-extension:') { window.location.href = browser.runtime.getURL('library.html'); return; }
    browser.runtime.sendMessage({ action: 'open_library' }).catch(function() {});
  });

  var autoOpen = shadow.getElementById('tts-zen-autoopen');
  autoOpen.addEventListener('change', function() { setAutoSite(currentHost(), autoOpen.checked); });
  loadAutoSites();

  var inlineTr = shadow.getElementById('tts-zen-inline-tr');
  inlineTr.checked = state.inlineTr;
  inlineTr.addEventListener('change', function() {
    state.inlineTr = inlineTr.checked; syncShared(); saveSettings();
    if (handlers.onInlineTr) handlers.onInlineTr(state.inlineTr);
  });

  var trMode = shadow.getElementById('tts-zen-trmode');
  trMode.value = state.trMode;
  trMode.addEventListener('change', function() { state.trMode = trMode.value; syncShared(); saveSettings(); });
  shadow.getElementById('tts-zen-pick').addEventListener('click', function() { if (handlers.onPick) handlers.onPick(); });
  translateHandlers = handlers.onTranslate || null;
  ['download', 'online', 'original'].forEach(function(choice) {
    shadow.getElementById('tts-zen-tr-' + choice).addEventListener('click', function() {
      if (translateHandlers) translateHandlers(choice);
    });
  });
  applyCorner();
  refreshPacks();

  const speedSlider = shadow.getElementById('tts-zen-speed');
  const speedLabel = shadow.getElementById('tts-zen-speed-label');
  speedSlider.addEventListener('input', function() { state.currentRate = speedSlider.value / 100; window.__tts_zen_state.currentRate = state.currentRate; speedLabel.textContent = state.currentRate.toFixed(1) + 'x'; if (handlers.onRate) handlers.onRate(state.currentRate); saveSettings(); });

  var readBtn = shadow.getElementById('tts-zen-read');
  var pauseBtn = shadow.getElementById('tts-zen-pause');
  var stopBtn = shadow.getElementById('tts-zen-stop');
  var prevBtn = shadow.getElementById('tts-zen-prev');
  var nextBtn = shadow.getElementById('tts-zen-next');

  readBtn.addEventListener('click', handlers.onRead);
  pauseBtn.addEventListener('click', handlers.onPause);
  stopBtn.addEventListener('click', handlers.onStop);
  prevBtn.addEventListener('click', handlers.onPrev);
  nextBtn.addEventListener('click', handlers.onNext);
  shadow.getElementById('tts-zen-restart').addEventListener('click', handlers.onRestart);
  shadow.getElementById('tts-zen-pick').title = t('pick');

  speedSlider.value = Math.round(state.currentRate * 100);
  speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
  loadVoices();
  try { applyLanguage(shadow); } catch(e) { console.error('applyLanguage error:', e); }
}

// ---- Reading language, detection and translation offer ----

var detectedLang = null;
var offer = null;               // { from, to, sizeMB, pivot, online, progress }
var translateHandlers = null;

function renderReadLangOptions() {
  var sel = getEl('tts-zen-readlang');
  if (!sel) return;
  sel.options[0].textContent = tf('autoLang', languageName(uiLang()));
  sel.options[1].textContent = t('original');
}

function renderDetected() {
  var row = getEl('tts-zen-detected-row');
  var el = getEl('tts-zen-detected');
  if (!row || !el) return;
  row.hidden = !detectedLang;
  if (detectedLang) el.textContent = tf('detected', languageName(detectedLang));
}

// Called by the content script once the page language is known
export function setDetectedLanguage(code) {
  detectedLang = code;
  renderDetected();
  loadVoices();
}

function renderTranslateBar() {
  var bar = getEl('tts-zen-translate-bar');
  if (!bar) return;
  if (!offer) { closeTranslateBar(bar); return; }
  clearTimeout(bar._closing);
  bar.classList.remove('closing');
  bar.hidden = false;
  var msg = tf('trFound', languageName(offer.from));
  if (offer.pivot) msg += ' ' + tf('trNeedsTwo', offer.pivot.join(' + '));
  getEl('tts-zen-translate-msg').textContent = msg;
  var dl = getEl('tts-zen-tr-download');
  var pair = offer.from.toUpperCase() + '→' + offer.to.toUpperCase();
  if (offer.progress != null) setFill(dl, tf('trDownloading', Math.round(offer.progress * 100) + ' %'), offer.progress);
  else setFill(dl, tf('trDownload', pair, offer.sizeMB), null);
  dl.hidden = offer.supported === false;
  var busy = offer.progress != null;
  getEl('tts-zen-tr-online').hidden = !offer.online || busy;
  getEl('tts-zen-tr-online').textContent = t('trOnline');
  getEl('tts-zen-tr-original').hidden = busy;
  getEl('tts-zen-tr-original').textContent = tf('trOriginal', languageName(offer.from));
}

// Folds the offer away (height, margin and opacity), then hides it
function closeTranslateBar(bar) {
  if (bar.hidden || bar.classList.contains('closing')) return;
  bar.classList.add('closing');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  bar._closing = setTimeout(function() { bar.hidden = true; bar.classList.remove('closing'); }, reduce ? 0 : 300);
}

// info: { from, to, sizeMB, pivot?, online } or null to hide
export function setTranslateOffer(info) {
  offer = info;
  renderTranslateBar();
}

export function setTranslateProgress(fraction) {
  if (!offer) return;
  offer.progress = fraction;
  renderTranslateBar();
}

function packRow(label, detail, title, onRemove) {
  var row = document.createElement('div');
  row.className = 'pack-row';
  var name = document.createElement('span');
  name.textContent = label;
  var info = document.createElement('span');
  info.textContent = detail;
  var del = document.createElement('button');
  del.type = 'button';
  del.title = title;
  del.textContent = '✕';
  del.addEventListener('click', onRemove);
  row.append(name, info, del);
  return row;
}

var CHOICE_LABEL = { offline: 'trOffline', online: 'trOnlineMode', original: 'trNever' };

// Translation tab: remembered per-pair choices, then the downloaded packs
export async function refreshPacks() {
  var box = getEl('tts-zen-packs');
  var choices = getEl('tts-zen-trchoices');
  if (!box) return;
  var list = [];
  try {
    var resp = await browser.runtime.sendMessage({ action: 'tr_list' });
    list = (resp && resp.packs) || [];
  } catch (_) {}
  box.replaceChildren();
  if (!list.length) {
    var empty = document.createElement('div');
    empty.className = 'packs-empty';
    empty.textContent = t('noPacks');
    box.appendChild(empty);
  }
  list.forEach(function(pk) {
    box.appendChild(packRow(languageName(pk.from) + ' → ' + languageName(pk.to), Math.round(pk.bytes / 1048576) + ' MB', t('remove'), async function() {
      try { await browser.runtime.sendMessage({ action: 'tr_remove', pair: pk.from + '-' + pk.to }); } catch (_) {}
      refreshPacks();
    }));
  });

  if (!choices) return;
  var stored = {};
  try { stored = await browser.storage.local.get(null); } catch (_) {}
  choices.replaceChildren();
  Object.keys(stored).filter(function(k) { return k.indexOf('trChoice:') === 0; }).sort().forEach(function(k) {
    var pair = k.slice(9).split('-');
    choices.appendChild(packRow(languageName(pair[0]) + ' → ' + languageName(pair[1]), t(CHOICE_LABEL[stored[k]] || 'trAsk'), t('forget'), async function() {
      try { await browser.storage.local.remove(k); } catch (_) {}
      refreshPacks();
    }));
  });
  choices.hidden = !choices.childElementCount;
}

// ---- Settings tabs ----

var TABS = ['voice', 'read', 'tr', 'look'];

function selectTab(shadow, name, focus) {
  var i = Math.max(0, TABS.indexOf(name));
  var prev = TABS.indexOf(state.tab);
  state.tab = TABS[i];
  var tabs = shadow.getElementById('tts-zen-tabs');
  tabs.style.setProperty('--tab', i);
  tabs.querySelectorAll('button').forEach(function(b) {
    var on = b.dataset.tab === state.tab;
    b.setAttribute('aria-selected', String(on));
    b.tabIndex = on ? 0 : -1;
    if (on && focus) b.focus();
  });
  shadow.querySelectorAll('.tab-page').forEach(function(pg) {
    var on = pg.dataset.page === state.tab;
    // New page slides in from the side of the tab it comes from
    if (on) pg.style.setProperty('--from', (i >= prev ? 12 : -12) + 'px');
    else pg.style.setProperty('--from', (TABS.indexOf(pg.dataset.page) < i ? -12 : 12) + 'px');
    pg.classList.toggle('active', on);
    pg.setAttribute('aria-hidden', String(!on));
  });
  fitTabHeight(shadow);
  if (state.tab === 'tr') refreshPacks();
}

function fitTabHeight(shadow) {
  var pages = shadow.querySelector('.tab-pages');
  var active = shadow.querySelector('.tab-page.active');
  if (pages && active) pages.style.height = active.offsetHeight + 'px';
}

function setupTabs(shadow) {
  var tabs = shadow.getElementById('tts-zen-tabs');
  tabs.addEventListener('click', function(e) {
    var b = e.target.closest('button[data-tab]');
    if (!b) return;
    selectTab(shadow, b.dataset.tab);
    saveSettings();
  });
  tabs.addEventListener('keydown', function(e) {
    var i = TABS.indexOf(state.tab);
    if (e.key === 'ArrowRight') i = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') i = (i + TABS.length - 1) % TABS.length;
    else return;
    e.preventDefault();
    selectTab(shadow, TABS[i], true);
    saveSettings();
  });
  selectTab(shadow, state.tab);
  // Rows appear and disappear (hints, download button, packs): keep the height in step
  if (typeof ResizeObserver !== 'undefined') {
    var ro = new ResizeObserver(function() { fitTabHeight(shadow); });
    shadow.querySelectorAll('.tab-page').forEach(function(pg) { ro.observe(pg); });
  }
}

export function setPickActive(on) {
  var b = getEl('tts-zen-pick');
  if (!b) return;
  b.classList.toggle('active', on);
  b.setAttribute('aria-pressed', String(on));
}

// ---- Corner anchoring and the draggable bubble ----

function applyCorner() {
  var corner = state.corner || 'br';
  ['tts-zen-panel', 'tts-zen-collapsed', 'tts-zen-bubble-ghost'].forEach(function(id) {
    var el = getEl(id);
    if (el) el.dataset.corner = corner;
  });
}

function setCorner(corner) {
  state.corner = corner;
  saveSettings();
  applyCorner();
}

var suppressClick = false;

function nearestCorner(cx, cy) {
  return (cy < window.innerHeight / 2 ? 't' : 'b') + (cx < window.innerWidth / 2 ? 'l' : 'r');
}

function setupBubble(shadow) {
  var bubble = shadow.getElementById('tts-zen-collapsed');
  var ghost = shadow.getElementById('tts-zen-bubble-ghost');
  var drag = null;
  var reduce = function() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

  // The bubble follows the pointer with a light spring, kept inside the window
  function frame() {
    if (!drag || !drag.moved) return;
    var k = reduce() ? 1 : 0.35;
    drag.cx += (drag.tx - drag.cx) * k;
    drag.cy += (drag.ty - drag.cy) * k;
    bubble.style.transform = 'translate(' + drag.cx.toFixed(1) + 'px,' + drag.cy.toFixed(1) + 'px) scale(1.08)';
    var r = drag.home;
    var corner = nearestCorner(r.left + r.width / 2 + drag.cx, r.top + r.height / 2 + drag.cy);
    if (ghost.dataset.corner !== corner) ghost.dataset.corner = corner;
    drag.raf = requestAnimationFrame(frame);
  }

  bubble.addEventListener('pointerdown', function(e) {
    if (e.button !== 0) return;
    var home = bubble.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId, home: home, tx: 0, ty: 0, cx: 0, cy: 0 };
    bubble.setPointerCapture(e.pointerId);
  });
  bubble.addEventListener('pointermove', function(e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 5) return;
    var r = drag.home, m = 6;
    drag.tx = Math.max(m - r.left, Math.min(window.innerWidth - m - r.right, dx));
    drag.ty = Math.max(m - r.top, Math.min(window.innerHeight - m - r.bottom, dy));
    if (!drag.moved) {
      drag.moved = true;
      bubble.getAnimations().forEach(function(a) { a.cancel(); });
      bubble.classList.add('dragging');
      ghost.dataset.corner = state.corner || 'br';
      ghost.classList.add('show');
      drag.raf = requestAnimationFrame(frame);
    }
  });
  function end() {
    if (!drag) return;
    var d = drag;
    drag = null;
    cancelAnimationFrame(d.raf);
    ghost.classList.remove('show');
    if (!d.moved) return;
    suppressClick = true;
    // FLIP with the Web Animations API: remember where it was dropped, anchor it
    // to the nearest corner, then fly from the drop point into the corner
    var before = bubble.getBoundingClientRect();
    var corner = nearestCorner(before.left + before.width / 2, before.top + before.height / 2);
    bubble.style.transform = '';
    setCorner(corner);
    var after = bubble.getBoundingClientRect();
    var dx = before.left - after.left, dy = before.top - after.top;
    bubble.classList.remove('dragging');
    if (reduce() || !bubble.animate) return;
    var dist = Math.hypot(dx, dy);
    bubble.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(1.08)' },
      { transform: 'translate(0,0) scale(1)' }
    ], { duration: Math.round(Math.max(350, Math.min(650, 300 + dist * 0.45))), easing: 'cubic-bezier(.34,1.3,.64,1)' });
  }
  bubble.addEventListener('pointerup', end);
  bubble.addEventListener('pointercancel', end);

  // Registered before the toggle handler: a drag must not also open the panel
  bubble.addEventListener('click', function(e) {
    if (suppressClick) { suppressClick = false; e.stopImmediatePropagation(); }
  });
  bubble.addEventListener('keydown', function(e) {
    var c = state.corner || 'br';
    var v = c[0], h = c[1];
    if (e.key === 'ArrowUp') v = 't';
    else if (e.key === 'ArrowDown') v = 'b';
    else if (e.key === 'ArrowLeft') h = 'l';
    else if (e.key === 'ArrowRight') h = 'r';
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCollapse(); return; }
    else return;
    e.preventDefault();
    moveBubbleTo(v + h);
  });
}

// Keyboard: animate between corners too
function moveBubbleTo(corner) {
  var bubble = getEl('tts-zen-collapsed');
  if (!bubble || corner === state.corner) return;
  var before = bubble.getBoundingClientRect();
  setCorner(corner);
  var after = bubble.getBoundingClientRect();
  if (!bubble.animate || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  bubble.animate([
    { transform: 'translate(' + (before.left - after.left) + 'px,' + (before.top - after.top) + 'px)' },
    { transform: 'translate(0,0)' }
  ], { duration: 480, easing: 'cubic-bezier(.34,1.3,.64,1)' });
}

// ---- Minimize / Collapse ----

let panelCollapsed = false;

async function loadCollapsedState() {
  try {
    const stored = await browser.storage.local.get('collapsed');
    if (stored.collapsed) {
      panelCollapsed = true;
      applyCollapsed();
    }
  } catch (_) {}
}

async function saveCollapsedState() {
  try { await browser.storage.local.set({ collapsed: panelCollapsed }); } catch (_) {}
}

function applyCollapsed() {
  const panel = getEl('tts-zen-panel');
  const collapsedBtn = getEl('tts-zen-collapsed');
  if (!panel || !collapsedBtn) return;
  if (panelCollapsed) {
    panel.classList.add('collapsed');
    collapsedBtn.classList.remove('hidden');
  } else {
    panel.classList.remove('collapsed');
    collapsedBtn.classList.add('hidden');
  }
}

function toggleCollapse() {
  panelCollapsed = !panelCollapsed;
  applyCollapsed();
  saveCollapsedState();
}

// ---- Preview Modal ----

let lastExtractedText = '';

export function showPreview(text) {
  lastExtractedText = text || lastExtractedText || window.__tts_zen_last_text || '';
  var overlay = getEl('tts-zen-preview-overlay');
  var content = getEl('tts-zen-preview-content');
  if (!overlay || !content) return;

  renderPreviewContent(content);
  applyPreviewStyle();
  overlay.classList.remove('hidden');
  suppressCaption(true);
}

function renderPreviewContent(content) {
  var sentences = window.__tts_zen_sentences || [];
  content.replaceChildren();

  if (sentences.length > 0) {
    for (var i = 0; i < sentences.length; i++) {
      var p = document.createElement('p');
      p.style.cssText = 'margin:0 0 6px 0;line-height:inherit;';
      var span = document.createElement('span');
      span.className = 'sentence';
      span.id = 'tts-zen-preview-s-' + i;
      span.textContent = sentences[i].text;
      p.appendChild(span);
      content.appendChild(p);
    }
  } else {
    var paragraphs = (lastExtractedText || 'Sin texto — click en Leer primero.')
      .split(/\n\n+/)
      .filter(function(l) { return l.trim(); });
    for (var j = 0; j < paragraphs.length; j++) {
      var p2 = document.createElement('p');
      p2.style.cssText = 'margin:0 0 10px 0;line-height:inherit;';
      p2.textContent = paragraphs[j].trim();
      content.appendChild(p2);
    }
  }
}

// Update preview if already open (called from content.js during playback)
export function updatePreviewSentences() {
  var overlay = getEl('tts-zen-preview-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  var content = getEl('tts-zen-preview-content');
  if (content) renderPreviewContent(content);
}

function closeOverlay(overlay) {
  if (!overlay || overlay.classList.contains('hidden')) return;
  suppressCaption(false);
  overlay.classList.add('closing');
  overlay.style.opacity = '0';
  setTimeout(function() { overlay.classList.add('hidden'); overlay.classList.remove('closing'); overlay.style.opacity = ''; }, 190);
}

function hidePreview() { closeOverlay(getEl('tts-zen-preview-overlay')); }


// ---- Preview Typography ----

var previewFont = 'serif';
var previewSize = 17;
var previewSpacing = 1.7;

function applyPreviewStyle() {
  var content = getEl('tts-zen-preview-content');
  if (!content) return;
  var family = previewFont === 'serif' ? '"Georgia", "Times New Roman", serif' :
               previewFont === 'mono' ? '"JetBrains Mono", "Fira Code", monospace' :
               '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
  content.style.setProperty('font-family', family, 'important');
  content.style.setProperty('font-size', previewSize + 'px', 'important');
  content.style.setProperty('line-height', String(previewSpacing), 'important');
}

function setupPreviewTools(shadow) {
  var tools = shadow.querySelectorAll('.preview-tool');
  tools.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var font = this.dataset.font;
      var size = this.dataset.size;
      var spacing = this.dataset.spacing;

      if (font) {
        previewFont = font;
        tools.forEach(function(b) { if (b.dataset.font) b.classList.remove('active'); });
        this.classList.add('active');
      }
      if (size === 'up') previewSize = Math.min(24, previewSize + 1);
      if (size === 'down') previewSize = Math.max(11, previewSize - 1);
      if (spacing === 'up') previewSpacing = Math.min(2.8, +(previewSpacing + 0.1).toFixed(1));
      if (spacing === 'down') previewSpacing = Math.max(1.2, +(previewSpacing - 0.1).toFixed(1));

      applyPreviewStyle();
    });
  });
}

// ---- Pause/Play Icon Toggle ----

var PLAY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"></polygon></svg>';
var PAUSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

export function setPauseIcon(isPlaying) {
  var btn = getEl('tts-zen-pause');
  if (!btn) return;
  btn.textContent = '';
  var iconHtml = isPlaying ? PAUSE_ICON : PLAY_ICON;
  var parsedIcon = new DOMParser().parseFromString(iconHtml, 'text/html');
  while (parsedIcon.body.firstChild) {
    btn.appendChild(parsedIcon.body.firstChild);
  }
}


// ---- Supported sites and "always open here" ----
// The panel only appears when turned on with the toolbar button. Sites listed
// in autoSites open it by themselves. The presets are the sites with their own
// extractor; any other page is read with the generic one.

var PRESETS = [
  { id: 'archiveofourown.org', name: 'Archive of Our Own', icon: 'icons/sites/ao3.svg', what: 'presetNext' },
  { id: 'fanfiction.net', name: 'FanFiction.net', icon: 'icons/sites/fanfiction.png', what: 'presetNext' },
  { id: 'wattpad.com', name: 'Wattpad', icon: 'icons/sites/wattpad.svg', what: 'presetNext' },
  { id: 'webnovel.com', name: 'Webnovel', icon: 'icons/sites/webnovel.png', what: 'presetScroll' }
];

var autoSites = [];

function currentHost() { return window.location.hostname; }

async function loadAutoSites() {
  try { autoSites = (await browser.storage.local.get('autoSites')).autoSites || []; } catch (_) { autoSites = []; }
  renderAutoOpen();
}

async function saveAutoSites() {
  try { await browser.storage.local.set({ autoSites: autoSites }); } catch (_) {}
  renderAutoOpen();
}

function setAutoSite(host, on) {
  if (!host) return;
  autoSites = autoSites.filter(function(h) { return h !== host; });
  if (on) autoSites.push(host);
  saveAutoSites();
}

function renderAutoOpen() {
  var box = getEl('tts-zen-autoopen');
  if (box) {
    box.checked = autoSites.includes(currentHost());
    box.disabled = !currentHost() || window.location.protocol === 'moz-extension:';
  }
  var row = getEl('tts-zen-autoopen-row');
  if (row) row.hidden = !currentHost() || window.location.protocol === 'moz-extension:';
  var overlay = getEl('tts-zen-sites-overlay');
  if (overlay && !overlay.classList.contains('hidden')) renderSitesList();
}

function iconUrl(path) {
  try { return browser.runtime.getURL(path); } catch (_) { return ''; }
}

function renderSitesList() {
  var list = getEl('tts-zen-sites-list');
  if (!list) return;
  list.replaceChildren();

  function section(text) {
    var h = document.createElement('div');
    h.className = 'sites-section';
    h.textContent = text;
    list.appendChild(h);
  }
  function row(icon, name, detail, action) {
    var r = document.createElement('div');
    r.className = 'site-row';
    var left = document.createElement('div');
    left.className = 'site-row-left';
    if (icon) {
      var img = document.createElement('img');
      img.className = 'site-row-icon';
      img.src = icon; img.width = 20; img.height = 20; img.alt = '';
      left.appendChild(img);
    } else {
      var dot = document.createElement('div');
      dot.className = 'site-row-icon';
      dot.textContent = '◆';
      left.appendChild(dot);
    }
    var info = document.createElement('div');
    info.className = 'site-row-info';
    var n = document.createElement('div');
    n.className = 'site-row-name';
    n.textContent = name;
    var d = document.createElement('div');
    d.className = 'site-row-domain';
    d.textContent = detail;
    info.append(n, d);
    left.appendChild(info);
    r.appendChild(left);
    if (action) r.appendChild(action);
    list.appendChild(r);
  }

  section(t('presetsTitle'));
  PRESETS.forEach(function(p) { row(iconUrl(p.icon), p.name, p.id + ' · ' + t(p.what)); });
  row(null, t('generic'), t('presetGeneric'));

  section(t('autoTitle'));
  var hint = document.createElement('p');
  hint.className = 'sites-hint';
  hint.textContent = t('autoHint');
  list.appendChild(hint);
  autoSites.slice().sort().forEach(function(host) {
    var del = document.createElement('button');
    del.type = 'button';
    del.className = 'site-remove';
    del.textContent = '✕';
    del.setAttribute('data-tip', t('remove'));
    del.setAttribute('aria-label', t('remove') + ' ' + host);
    del.addEventListener('click', function() { setAutoSite(host, false); });
    var preset = PRESETS.find(function(p) { return host.endsWith(p.id); });
    row(preset ? iconUrl(preset.icon) : null, host, preset ? preset.name : t('generic'), del);
  });

  var addRow = document.createElement('div');
  addRow.className = 'site-row site-add-row';
  var input = document.createElement('input');
  input.id = 'tts-zen-add-site-input';
  input.type = 'text';
  input.placeholder = t('addSitePlaceholder');
  var addBtn = document.createElement('button');
  addBtn.id = 'tts-zen-add-site-btn';
  addBtn.type = 'button';
  addBtn.textContent = t('addSite');
  addRow.append(input, addBtn);
  list.appendChild(addRow);
  addBtn.addEventListener('click', function() {
    var domain = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain.includes('.') || autoSites.includes(domain)) return;
    setAutoSite(domain, true);
  });
  input.addEventListener('keydown', function(e) { if (e.key === 'Enter') addBtn.click(); });
}

function showSitesModal() {
  renderSitesList();
  var overlay = getEl('tts-zen-sites-overlay');
  if (overlay) { overlay.classList.remove('hidden'); suppressCaption(true); }
}

function hideSitesModal() { closeOverlay(getEl('tts-zen-sites-overlay')); }

// ---- Showing and hiding the whole panel (toolbar button) ----

export function setPanelVisible(on) {
  var host = document.getElementById('tts-zen-host');
  if (!host) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (on) {
    host.style.display = '';
    if (!reduce && host.animate) host.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'ease-out' });
    return;
  }
  var done = function() { host.style.display = 'none'; };
  if (reduce || !host.animate) { done(); return; }
  host.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: 'ease-in' }).onfinish = done;
}
