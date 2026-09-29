// zenTTS Panel — Compact UI with voice, speed, counter, navigation
// Page highlighting happens on the actual DOM, not in this panel

const PANEL_HTML = `
<div id="tts-zen-panel">
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
      <button id="tts-zen-sites-btn" title="Gestionar sitios">
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>

  <div id="tts-zen-body">
    <div id="tts-zen-settings" class="collapsed">
      <div class="setting-row">
        <label id="tts-zen-voice-label">Voz</label>
        <div class="select-wrap">
          <select id="tts-zen-voice"></select>
        </div>
      </div>
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
      <div class="setting-row" id="tts-zen-local-row" hidden>
        <label></label>
        <div class="local-dl">
          <button id="tts-zen-local-dl" type="button">Descargar voz</button>
          <span id="tts-zen-local-progress"></span>
        </div>
      </div>
      <div class="setting-row">
        <label id="tts-zen-lang-label">Idioma</label>
        <div class="select-wrap">
          <select id="tts-zen-lang">
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <div class="setting-row section-header">
        <span id="tts-zen-translate-title">Traducción</span>
      </div>
      <div class="translate-row">
        <select id="tts-zen-lang-in">
          <option value="auto">Auto</option>
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
          <option value="it">IT</option>
          <option value="pt">PT</option>
          <option value="ja">JA</option>
          <option value="ko">KO</option>
          <option value="zh">ZH</option>
          <option value="ru">RU</option>
        </select>
        <span class="translate-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
        <select id="tts-zen-lang-out">
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
          <option value="it">IT</option>
          <option value="pt">PT</option>
          <option value="ja">JA</option>
          <option value="ko">KO</option>
          <option value="zh">ZH</option>
          <option value="ru">RU</option>
        </select>
      </div>
      <div class="setting-row">
        <label id="tts-zen-speed-text">Velocidad</label>
        <div class="speed-group">
          <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
          <span id="tts-zen-speed-label">1.0x</span>
        </div>
      </div>
      <label class="check-row">
        <input type="checkbox" id="tts-zen-autonext">
        <span id="tts-zen-autonext-label">Seguir con el siguiente capítulo</span>
      </label>
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
    </div>

    <div id="tts-zen-resume-row" hidden>
      <button id="tts-zen-restart" type="button">Desde el inicio</button>
    </div>

    <div id="tts-zen-status">Listo</div>
  </div>
</div>

<div id="tts-zen-collapsed" class="hidden">
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
      <span>Sitios</span>
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
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 280px;
  background: var(--sheet);
  border: 1px solid var(--rule); border-radius: 6px;
  color: var(--ink);
  font-family: var(--sans); font-size: 13px; line-height: 1.4;
  box-shadow: var(--shadow);
  user-select: none; overflow: hidden;
}
#tts-zen-panel.collapsed { display: none; }

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

#tts-zen-settings {
  padding: 12px 14px; border-bottom: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 8px;
  max-height: 400px; overflow: hidden;
  transition: max-height .15s ease, padding .15s ease;
}
#tts-zen-settings.collapsed {
  max-height: 0; padding-top: 0; padding-bottom: 0; border-bottom-color: transparent;
}

.setting-row { display: flex; align-items: center; gap: 10px; }
.setting-row label { min-width: 64px; font-size: 12px; color: var(--ink-soft); }

.select-wrap { flex: 1; min-width: 0; }
.select-wrap select, .translate-row select {
  width: 100%; padding: 5px 22px 5px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background-color: var(--paper);
  color: var(--ink); font: 12px var(--sans); cursor: pointer;
  appearance: none;
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

.speed-group { display: flex; align-items: center; gap: 8px; flex: 1; }
.speed-group input[type="range"] { flex: 1; accent-color: var(--ink); cursor: pointer; }
#tts-zen-speed-label {
  font-size: 12px; color: var(--ink); min-width: 32px; text-align: right;
  font-variant-numeric: tabular-nums;
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

.local-dl { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
#tts-zen-local-dl {
  white-space: nowrap; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: 12px var(--sans); cursor: pointer;
}
#tts-zen-local-dl:hover:not(:disabled) { background: var(--hover); }
#tts-zen-local-dl:disabled { opacity: 0.5; cursor: default; }
#tts-zen-local-progress { font-size: 12px; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.check-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-soft); cursor: pointer; }
.check-row input { accent-color: var(--ink); margin: 0; }
[hidden] { display: none !important; }

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
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--sheet); border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  color: var(--ink); cursor: pointer; box-shadow: var(--shadow);
}
#tts-zen-collapsed.hidden { display: none; }
#tts-zen-collapsed:hover { color: var(--accent); }

/* Modals */
#tts-zen-preview-overlay, #tts-zen-sites-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(20,18,15,0.35);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .15s ease; pointer-events: none;
}
#tts-zen-preview-overlay:not(.hidden), #tts-zen-sites-overlay:not(.hidden) { opacity: 1; pointer-events: auto; }
#tts-zen-preview-overlay.hidden, #tts-zen-sites-overlay.hidden { display: none; }

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
.site-toggle {
  width: 34px; height: 20px; border-radius: 10px; border: none; padding: 0;
  cursor: pointer; position: relative; background: var(--rule); flex-shrink: 0;
  transition: background .15s ease;
}
.site-toggle.on { background: var(--accent); }
.site-toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%; background: var(--sheet);
  transition: transform .15s ease;
}
.site-toggle.on::after { transform: translateX(14px); }

.site-add-row { padding-top: 12px; }
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
  * { transition: none !important; }
}
`;
// ---- Translations ----

var T = {
  es: {
    minimize: 'Minimizar', preview: 'Ver texto extraído', sites: 'Gestionar sitios',
    settings: 'Ajustes', voice: 'Voz', engine: 'Motor', engineNative: 'Nativo (Browser)',
    engineNeural: 'Neural (edge-tts)', speed: 'Velocidad', langLabel: 'Idioma',
    langES: 'Español', langEN: 'English', prev: 'Anterior', next: 'Siguiente',
    read: 'Leer', ready: 'Listo', extractedText: 'Texto extraído', reduce: 'Reducir',
    increase: 'Aumentar', lessSpacing: 'Menos espacio', moreSpacing: 'Más espacio',
    sitesModal: 'Sitios', loadingVoices: 'Cargando voces...',
    loadingEdgeVoices: 'Cargando voces edge-tts...', serverUnavailable: 'Servidor no disponible',
    unknown: 'desconocido', line: 'Línea', noText: 'Sin texto — haz clic en Leer primero.',
    generic: 'Genérico', otherSites: 'otros sitios', addSite: 'Añadir',
    addSitePlaceholder: 'ejemplo.com', serif: 'Serif', sans: 'Sans', mono: 'Mono',
    translateTitle: 'Traducción', engineLocal: 'Local (Piper)',
    continueAt: 'Continuar', restart: 'Desde el inicio', autoNext: 'Seguir con el siguiente capítulo',
    downloadVoice: 'Descargar voz', downloading: 'Descargando…', downloaded: 'descargada',
    downloadFailed: 'No se pudo descargar'
  },
  en: {
    minimize: 'Minimize', preview: 'View extracted text', sites: 'Manage sites',
    settings: 'Settings', voice: 'Voice', engine: 'Engine', engineNative: 'Native (Browser)',
    engineNeural: 'Neural (edge-tts)', speed: 'Speed', langLabel: 'Language',
    langES: 'Español', langEN: 'English', prev: 'Previous', next: 'Next',
    read: 'Read', ready: 'Ready', extractedText: 'Extracted text', reduce: 'Decrease',
    increase: 'Increase', lessSpacing: 'Less spacing', moreSpacing: 'More spacing',
    sitesModal: 'Sites', loadingVoices: 'Loading voices...',
    loadingEdgeVoices: 'Loading edge-tts voices...', serverUnavailable: 'Server unavailable',
    unknown: 'unknown', line: 'Line', noText: 'No text — click Read first.',
    generic: 'Generic', otherSites: 'other sites', addSite: 'Add',
    addSitePlaceholder: 'example.com', serif: 'Serif', sans: 'Sans', mono: 'Mono',
    translateTitle: 'Translation', engineLocal: 'Local (Piper)',
    continueAt: 'Continue', restart: 'From the beginning', autoNext: 'Continue with the next chapter',
    downloadVoice: 'Download voice', downloading: 'Downloading…', downloaded: 'downloaded',
    downloadFailed: 'Download failed'
  }
};

function t(key) { return (T[state.lang] || T['es'])[key] || key; }

// ---- State ----

let state = {
  voices: [],
  currentVoice: 'es-ES-AlvaroNeural',
  currentRate: 1.0,
  currentEngine: 'native',
  localVoice: 'es_ES-davefx-medium',
  autoNext: true,
  langIn: 'auto',
  langOut: 'es',
  lang: 'es'
};

// ---- Storage ----

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(['voice', 'rate', 'engine', 'lang', 'langIn', 'langOut', 'localVoice', 'autoNext']);
    if (stored.localVoice) state.localVoice = stored.localVoice;
    if (typeof stored.autoNext === 'boolean') state.autoNext = stored.autoNext;
    if (stored.voice) state.currentVoice = stored.voice;
    if (stored.rate) state.currentRate = stored.rate;
    if (stored.engine) state.currentEngine = stored.engine;
    if (stored.lang) state.lang = stored.lang;
    if (stored.langIn) state.langIn = stored.langIn;
    if (stored.langOut) state.langOut = stored.langOut;
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
  shared.langIn = state.langIn;
  shared.langOut = state.langOut;
  shared.autoNext = state.autoNext;
}

async function saveSettings() {
  try {
    await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate, engine: state.currentEngine, lang: state.lang, langIn: state.langIn, langOut: state.langOut, localVoice: state.localVoice, autoNext: state.autoNext });
  } catch (_) {}
}

// ---- Voice Loading ----

function outLang() {
  return state.langOut && state.langOut !== 'auto' ? state.langOut : state.lang;
}

async function loadVoices() {
  var localRow = getEl('tts-zen-local-row');
  if (localRow) localRow.hidden = state.currentEngine !== 'local';
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
    return { name: v.name, lang: v.lang, default: v.default };
  });
  populateVoiceDropdown('currentVoice');
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
    var lang = state.langOut === 'auto' ? '' : outLang() + '-';
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

async function loadLocalVoices() {
  setVoicePlaceholder(t('loadingVoices'));
  var resp;
  try { resp = await browser.runtime.sendMessage({ action: 'local_voices' }); } catch (_) {}
  if (state.currentEngine !== 'local') return;
  localStored = (resp && resp.stored) || [];
  var prefix = outLang().toLowerCase() + '_';
  var catalog = ((resp && resp.catalog) || []).filter(function(v) {
    return v.key.toLowerCase().startsWith(prefix) || localStored.includes(v.key);
  });
  if (!catalog.length) catalog = (resp && resp.catalog) || [];
  state.voices = catalog.map(function(v) {
    var have = localStored.includes(v.key) ? ' · ' + t('downloaded') : '';
    return { name: v.key, label: v.name + ' (' + v.quality + ')' + have, lang: v.language, size: v.size };
  });
  if (!state.voices.some(function(v) { return v.name === state.localVoice; })) {
    var firstStored = state.voices.find(function(v) { return localStored.includes(v.name); });
    if (firstStored) state.localVoice = firstStored.name;
    else if (state.voices.length) state.localVoice = state.voices[0].name;
  }
  populateVoiceDropdown('localVoice');
  updateLocalRow();
}

function updateLocalRow() {
  var btn = getEl('tts-zen-local-dl');
  var progress = getEl('tts-zen-local-progress');
  if (!btn || !progress) return;
  var have = localStored.includes(state.localVoice);
  var voice = (state.voices || []).find(function(v) { return v.name === state.localVoice; });
  var mb = voice && voice.size ? ' · ' + Math.round(voice.size / 1048576) + ' MB' : '';
  btn.hidden = have;
  btn.disabled = false;
  btn.textContent = t('downloadVoice') + mb;
  progress.textContent = '';
}

async function downloadLocalVoice() {
  var btn = getEl('tts-zen-local-dl');
  var progress = getEl('tts-zen-local-progress');
  var voiceId = state.localVoice;
  if (btn) btn.disabled = true;
  if (progress) progress.textContent = t('downloading');
  try {
    var resp = await browser.runtime.sendMessage({ action: 'local_download', voiceId: voiceId });
    if (!resp || !resp.success) throw new Error((resp && resp.error) || 'download');
    await loadLocalVoices();
  } catch (e) {
    console.error('[zenTTS] download voice:', e.message || e);
    if (btn) btn.disabled = false;
    if (progress) progress.textContent = t('downloadFailed');
  }
}

// Download progress is pushed by the background page
if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
  browser.runtime.onMessage.addListener(function(msg) {
    if (!msg || msg.action !== 'local_progress' || msg.voiceId !== state.localVoice) return;
    var progress = getEl('tts-zen-local-progress');
    if (progress && msg.total) progress.textContent = Math.round(msg.loaded * 100 / msg.total) + ' %';
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

  var groups = {};
  state.voices.forEach(function(v) {
    var lang = v.lang || '';
    (groups[lang] = groups[lang] || []).push(v);
  });
  Object.keys(groups).sort().forEach(function(lang) {
    var optgroup = document.createElement('optgroup');
    optgroup.label = langLabel(lang);
    groups[lang].forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = v.label || v.name;
      opt.selected = v.name === state[key];
      optgroup.appendChild(opt);
    });
    select.appendChild(optgroup);
  });
}

function applyLanguage(shadow) {
  var lang = state.lang;
  // Update settings label texts
  [['tts-zen-voice-label', 'voice'], ['tts-zen-engine-label', 'engine'], ['tts-zen-lang-label', 'langLabel'],
   ['tts-zen-translate-title', 'translateTitle'], ['tts-zen-speed-text', 'speed'],
   ['tts-zen-autonext-label', 'autoNext'], ['tts-zen-restart', 'restart']].forEach(function(pair) {
    var el = shadow.getElementById(pair[0]);
    if (el) el.textContent = T[lang][pair[1]];
  });
  renderReadLabel();
  updateLocalRow();
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
  }

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
  // Update generic site name in ALL_SITES
  for (var i = 0; i < ALL_SITES.length; i++) {
    if (ALL_SITES[i].id === 'generic') {
      ALL_SITES[i].name = T[lang].generic;
      ALL_SITES[i].domain = T[lang].otherSites;
    }
  }
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

var resumeInfo = null;

function renderReadLabel() {
  var label = getEl('tts-zen-read-label');
  if (label) label.textContent = resumeInfo ? t('continueAt') + ' · ' + (resumeInfo.index + 1) + ' / ' + resumeInfo.total : t('read');
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
  await loadSiteSettings();

  // If current site is disabled, abort silently
  if (!isCurrentSiteAllowed()) {
    var hostEl = document.getElementById('tts-zen-host');
    if (hostEl) hostEl.remove();
    return;
  }

  const style = document.createElement('style');
  style.textContent = PANEL_CSS;
  shadow.appendChild(style);

  const container = document.createElement('div');
  container.innerHTML = PANEL_HTML;
  shadow.appendChild(container);
  applyCollapsed();

  // Minimize button
  const minimizeBtn = shadow.getElementById('tts-zen-minimize');
  minimizeBtn.addEventListener('click', toggleCollapse);

  // Collapsed floating button
  const collapsedBtn = shadow.getElementById('tts-zen-collapsed');
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

  const voiceSelect = shadow.getElementById('tts-zen-voice');
  voiceSelect.addEventListener('change', function() {
    if (state.currentEngine === 'local') { state.localVoice = voiceSelect.value; updateLocalRow(); }
    else state.currentVoice = voiceSelect.value;
    syncShared();
    saveSettings();
  });
  shadow.getElementById('tts-zen-local-dl').addEventListener('click', downloadLocalVoice);

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
  });

  const langSelect = shadow.getElementById('tts-zen-lang');
  langSelect.value = state.lang;
  langSelect.addEventListener('change', function() {
    state.lang = langSelect.value;
    window.__tts_zen_state.lang = langSelect.value;
    saveSettings();
    try { applyLanguage(shadow); } catch(e) { console.error(e); }
  });

  var langIn = shadow.getElementById('tts-zen-lang-in');
  if (langIn) { langIn.value = state.langIn; langIn.addEventListener('change', function() { state.langIn = langIn.value; window.__tts_zen_state.langIn = langIn.value; saveSettings(); }); }
  var langOut = shadow.getElementById('tts-zen-lang-out');
  if (langOut) { langOut.value = state.langOut; langOut.addEventListener('change', function() { state.langOut = langOut.value; window.__tts_zen_state.langOut = langOut.value; saveSettings(); loadVoices(); }); }

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

  speedSlider.value = Math.round(state.currentRate * 100);
  speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
  loadVoices();
  try { applyLanguage(shadow); } catch(e) { console.error('applyLanguage error:', e); }
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

function hidePreview() {
  var overlay = getEl('tts-zen-preview-overlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  setTimeout(function() { overlay.classList.add('hidden'); overlay.style.opacity = ''; }, 300);
}


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
  btn.insertAdjacentHTML('beforeend', isPlaying ? PAUSE_ICON : PLAY_ICON);
}


// ---- Site Manager ----

var ALL_SITES = [
  { id: 'wattpad.com', name: 'Wattpad', domain: 'wattpad.com' },
  { id: 'archiveofourown.org', name: 'AO3', domain: 'archiveofourown.org' },
  { id: 'fanfiction.net', name: 'FanFiction', domain: 'fanfiction.net' },
  { id: 'webnovel.com', name: 'Webnovel', domain: 'webnovel.com' },
  { id: 'generic', name: 'Genérico', domain: 'otros sitios' },
];

var fallbackIcons = {
  'wattpad.com': 'icons/sites/wattpad.svg',
  'archiveofourown.org': 'icons/sites/ao3.svg',
  'fanfiction.net': 'icons/sites/fanfiction.svg',
  'webnovel.com': 'icons/sites/webnovel.svg',
};

function faviconUrl(domain) {
  if (domain === 'otros sitios') return '';
  return 'https://www.google.com/s2/favicons?domain=' + domain + '&sz=32';
}

function faviconFallback(domain) {
  var path = fallbackIcons[domain];
  if (!path) return '';
  try { return browser.runtime.getURL(path); } catch (_) { return ''; }
}

// Default: all enabled
var enabledSites = {};

async function loadSiteSettings() {
  try {
    var stored = await browser.storage.local.get(['enabledSites', 'customSites']);
    if (stored.enabledSites) {
      enabledSites = stored.enabledSites;
    } else {
      ALL_SITES.forEach(function(s) { enabledSites[s.id] = true; });
    }
    if (stored.customSites) {
      stored.customSites.forEach(function(s) {
        if (!ALL_SITES.some(function(x) { return x.id === s.id; })) {
          ALL_SITES.push(s);
          if (enabledSites[s.id] === undefined) enabledSites[s.id] = true;
        }
      });
    }
    window.__tts_zen_enabled_sites = enabledSites;
  } catch (_) {
    ALL_SITES.forEach(function(s) { enabledSites[s.id] = true; });
    window.__tts_zen_enabled_sites = enabledSites;
  }
}

async function saveSiteSettings() {
  var custom = ALL_SITES.filter(function(s) {
    return !['wattpad.com', 'archiveofourown.org', 'fanfiction.net', 'webnovel.com', 'generic'].includes(s.id);
  });
  try { await browser.storage.local.set({ enabledSites: enabledSites, customSites: custom }); } catch (_) {}
  window.__tts_zen_enabled_sites = enabledSites;
}

function renderSitesList() {
  var list = getEl('tts-zen-sites-list');
  if (!list) return;
  list.replaceChildren();
  ALL_SITES.forEach(function(site) {
    var enabled = enabledSites[site.id] !== false;
    var row = document.createElement('div');
    row.className = 'site-row';
    var left = document.createElement('div');
    left.className = 'site-row-left';
    if (site.id === 'generic') {
      var iconDiv = document.createElement('div');
      iconDiv.className = 'site-row-icon';
      iconDiv.textContent = '+';
      left.appendChild(iconDiv);
    } else {
      var iconImg = document.createElement('img');
      iconImg.className = 'site-row-icon';
      iconImg.src = faviconUrl(site.domain);
      iconImg.width = 20;
      iconImg.height = 20;
      iconImg.onerror = function() { var fb = faviconFallback(site.id); if (fb) this.src = fb; };
      left.appendChild(iconImg);
    }
    var info = document.createElement('div');
    info.className = 'site-row-info';
    var nameEl = document.createElement('div');
    nameEl.className = 'site-row-name';
    nameEl.textContent = site.name;
    var domainEl = document.createElement('div');
    domainEl.className = 'site-row-domain';
    domainEl.textContent = site.domain;
    info.appendChild(nameEl);
    info.appendChild(domainEl);
    left.appendChild(info);
    row.appendChild(left);

    var toggle = document.createElement('button');
    toggle.className = 'site-toggle' + (enabled ? ' on' : '');
    toggle.dataset.site = site.id;
    row.appendChild(toggle);

    toggle.addEventListener('click', function() {
      var siteId = this.dataset.site;
      enabledSites[siteId] = !(enabledSites[siteId] !== false);
      this.classList.toggle('on', enabledSites[siteId] !== false);
      saveSiteSettings();
    });

    list.appendChild(row);
  });

  // Add site input
  var addRow = document.createElement('div');
  addRow.className = 'site-row site-add-row';
  var input = document.createElement('input');
  input.id = 'tts-zen-add-site-input';
  input.type = 'text';
  input.placeholder = t('addSitePlaceholder');

  var addBtn = document.createElement('button');
  addBtn.id = 'tts-zen-add-site-btn';
  addBtn.textContent = t('addSite');

  addRow.appendChild(input);
  addRow.appendChild(addBtn);

  list.appendChild(addRow);

  addBtn.addEventListener('click', function() {
    var domain = input.value.trim().toLowerCase();
    if (!domain || domain === 'otros sitios') return;
    // Remove protocol and path
    domain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!domain.includes('.')) return;

    // Check duplicate
    if (ALL_SITES.some(function(s) { return s.id === domain; })) return;

    ALL_SITES.push({ id: domain, name: domain.split('.')[0], domain: domain });
    enabledSites[domain] = true;
    saveSiteSettings();
    input.value = '';
    renderSitesList(); // re-render
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') addBtn.click();
  });
}

function showSitesModal() {
  renderSitesList();
  var overlay = getEl('tts-zen-sites-overlay');
  if (overlay) overlay.classList.remove('hidden');
}

function hideSitesModal() {
  var overlay = getEl('tts-zen-sites-overlay');
  if (!overlay) return;
  overlay.style.opacity = '0';
  setTimeout(function() { overlay.classList.add('hidden'); overlay.style.opacity = ''; }, 300);
}

function isCurrentSiteAllowed() {
  var sites = window.__tts_zen_enabled_sites || enabledSites;
  var host = window.location.hostname;
  for (var siteId in sites) {
    if (siteId === 'generic') continue;
    if (host.includes(siteId)) return sites[siteId] !== false;
  }
  return sites['generic'] !== false;
}

