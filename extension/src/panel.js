// TTS-zen Panel — Compact UI with voice, speed, counter, navigation
// Page highlighting happens on the actual DOM, not in this panel

const PANEL_HTML = `
<div id="tts-zen-panel">
  <div id="tts-zen-header">
    <div id="tts-zen-header-left">
      <button id="tts-zen-minimize" title="Minimizar">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <span id="tts-zen-logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        TTS-zen
      </span>
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
    </div>
  </div>

  <div id="tts-zen-body">
    <div id="tts-zen-settings" class="collapsed">
      <div class="setting-row">
        <label>Voz</label>
        <div class="select-wrap">
          <select id="tts-zen-voice"></select>
        </div>
      </div>
      <div class="setting-row">
        <label>Motor</label>
        <div class="select-wrap">
          <select id="tts-zen-engine">
            <option value="native">Nativo (Browser)</option>
            <option value="server">Neural (edge-tts)</option>
          </select>
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
        <span class="section-icon">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </span>
        <span>Traducción</span>
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
        <label>Velocidad</label>
        <div class="speed-group">
          <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
          <span id="tts-zen-speed-label">1.0x</span>
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

    <div id="tts-zen-controls">
      <button id="tts-zen-read" class="primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
        Leer
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
        <button class="preview-tool" data-font="serif" title="Serif">Serif</button>
        <button class="preview-tool active" data-font="sans" title="Sans">Sans</button>
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
:host { all: initial; }

#tts-zen-panel {
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 290px;
  background: linear-gradient(145deg, #14142b 0%, #1a1a35 100%);
  border: 1px solid rgba(167,139,250,0.12); border-radius: 16px;
  color: #d1d5db;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  box-shadow: 0 0 0 1px rgba(167,139,250,0.05), 0 8px 40px rgba(0,0,0,0.5);
  user-select: none; overflow: hidden;
  animation: panel-in .3s cubic-bezier(0.16,1,0.3,1);
  transition: all .35s cubic-bezier(0.4,0,0.2,1), border-color .3s ease;
}
#tts-zen-panel.collapsed {
  width: 44px; height: 44px; border-radius: 50%;
  padding: 0; min-width: 0;
}
#tts-zen-panel.collapsed #tts-zen-header { padding: 0; border-bottom: none; }
#tts-zen-panel.collapsed #tts-zen-body { display: none; }
#tts-zen-panel.collapsed #tts-zen-logo span,
#tts-zen-panel.collapsed #tts-zen-logo svg:not(#tts-zen-mini-icon),
#tts-zen-panel.collapsed #tts-zen-header-right,
#tts-zen-panel.collapsed #tts-zen-minimize svg { display: none; }
#tts-zen-panel.collapsed #tts-zen-minimize {
  width: 44px; height: 44px; border-radius: 50%; background: transparent;
}
#tts-zen-panel.collapsed:hover {
  box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 8px 30px rgba(124,58,237,0.3);
}

@keyframes panel-in { from { opacity:0; transform: translateY(12px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }

#tts-zen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
#tts-zen-header-left, #tts-zen-header-right { display: flex; align-items: center; gap: 6px; }

#tts-zen-minimize {
  display: flex; align-items: center; justify-content: center;
  width: 12px; height: 12px; border-radius: 50%;
  background: #fbbf24; border: none; cursor: pointer;
  padding: 0; position: relative;
  transition: all .15s ease;
}
#tts-zen-minimize svg { opacity: 0; transition: opacity .15s ease; }
#tts-zen-minimize:hover { background: #f59e0b; }
#tts-zen-minimize:hover svg { opacity: 1; }

#tts-zen-logo {
  display: flex; align-items: center; gap: 6px;
  font-weight: 600; font-size: 12px; color: #a78bfa;
}

#tts-zen-header-right button {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; background: transparent;
  border: 1px solid transparent; border-radius: 7px; color: #6b7280; cursor: pointer;
  transition: all .2s ease;
}
#tts-zen-header-right button:hover {
  background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.2); color: #a78bfa;
}
#tts-zen-settings-btn:hover { transform: rotate(30deg); }

#tts-zen-body { transition: opacity .3s ease; }

#tts-zen-settings {
  padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column; gap: 8px;
  max-height: 400px; overflow: hidden;
  transition: max-height .4s cubic-bezier(.25,.8,.25,1), padding .4s ease, border-color .4s ease, opacity .3s ease;
  opacity: 1;
}
#tts-zen-settings.collapsed {
  max-height: 0; padding-top: 0; padding-bottom: 0;
  border-bottom-color: transparent; opacity: 0;
}

.setting-row { display: flex; align-items: center; gap: 8px; }
.setting-row label { min-width: 60px; font-size: 11px; color: #9ca3af; font-weight: 500; }

.select-wrap { flex: 1; position: relative; }
.select-wrap select {
  width: 100%; padding: 5px 8px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: #d1d5db; font-size: 11px; cursor: pointer; outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 9 5' fill='none'%3E%3Cpath d='M1 1l3.5 3L8 1' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 7px center; padding-right: 22px;
}
.select-wrap select:hover { border-color: rgba(167,139,250,0.3); }
.select-wrap select:focus { border-color: #a78bfa; background: rgba(167,139,250,0.06); }

.speed-group { display: flex; align-items: center; gap: 6px; flex: 1; }
.speed-group input[type="range"] {
  flex: 1; height: 4px; appearance: none; background: rgba(255,255,255,0.08);
  border-radius: 2px; outline: none; cursor: pointer;
}
.speed-group input[type="range"]::-webkit-slider-thumb {
  appearance: none; width: 14px; height: 14px; border-radius: 50%;
  background: #a78bfa; cursor: pointer; border: 2px solid #1a1a35;
  box-shadow: 0 2px 8px rgba(167,139,250,0.4);
  transition: transform .15s ease;
}
.speed-group input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }

/* Translation row */
.section-header { display: flex; align-items: center; gap: 6px; margin-top: 6px; margin-bottom: 4px; font-size: 10px; font-weight: 600; color: #a78bfa; letter-spacing: 0.5px; }
.section-icon { display: flex; align-items: center; color: #a78bfa; }
.translate-row { display: flex; align-items: center; gap: 6px; padding: 0; margin-bottom: 6px; }
.translate-row select { flex: 1; padding: 5px 20px 5px 8px; border-radius: 6px; border: 1px solid rgba(167,139,250,0.12); background: rgba(167,139,250,0.04); color: #c4b5fd; font-size: 11px; cursor: pointer; outline: none; appearance: none; text-align-last: center; }
.translate-row select:hover { border-color: rgba(167,139,250,0.25); }
.translate-arrow { display: flex; align-items: center; color: #5b6370; flex-shrink: 0; }

#tts-zen-speed-label {
  font-size: 11px; color: #a78bfa; font-weight: 600; min-width: 30px; text-align: right;
}

#tts-zen-counter {
  text-align: center; padding: 10px 12px 4px;
  font-size: 12px; color: #6b7280; font-weight: 500;
}

#tts-zen-nav {
  display: flex; justify-content: center; gap: 14px; padding: 0 12px 6px;
}
#tts-zen-nav button {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 26px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
  color: #9ca3af; cursor: pointer; transition: all .2s ease;
}
#tts-zen-nav button:hover:not(:disabled) {
  background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); color: #a78bfa;
}
#tts-zen-nav button:disabled { opacity: 0.25; cursor: not-allowed; }

#tts-zen-controls {
  display: flex; gap: 5px; padding: 0 12px 8px;
}
#tts-zen-controls button {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  flex: 1; padding: 7px 8px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; background: rgba(255,255,255,0.04); color: #d1d5db;
  font-size: 11px; font-weight: 500; cursor: pointer;
  transition: all .2s cubic-bezier(0.4,0,0.2,1); outline: none;
}
#tts-zen-controls button:hover:not(:disabled) {
  background: rgba(255,255,255,0.08); border-color: rgba(167,139,250,0.3); transform: translateY(-1px);
}
#tts-zen-controls button:active:not(:disabled) { transform: translateY(0) scale(0.97); }
#tts-zen-controls button:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
#tts-zen-controls button.primary {
  background: #7c3aed; border-color: #7c3aed; color: #fff; font-weight: 600;
  box-shadow: 0 2px 12px rgba(124,58,237,0.3);
}
#tts-zen-controls button.primary:hover:not(:disabled) {
  background: #8b5cf6; box-shadow: 0 4px 20px rgba(124,58,237,0.45);
}

#tts-zen-status {
  padding: 2px 12px 8px; font-size: 11px; color: #6b7280; text-align: center;
}
#tts-zen-status.error { color: #f87171; }

/* Collapsed state */
#tts-zen-collapsed {
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(145deg, #7c3aed, #6d28d9);
  border: none; display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 16px rgba(124,58,237,0.4);
  transition: all .2s ease;
  animation: bump-in .3s cubic-bezier(0.16,1,0.3,1);
}
#tts-zen-collapsed.hidden { display: none; }
#tts-zen-collapsed:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(124,58,237,0.55);
}
@keyframes bump-in { from { opacity:0; transform: scale(0.5); } to { opacity:1; transform: scale(1); } }

/* Preview modal */
#tts-zen-preview-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .3s ease;
  pointer-events: none;
}
#tts-zen-preview-overlay:not(.hidden) {
  opacity: 1; pointer-events: auto;
}
#tts-zen-preview-overlay.hidden { display: none; }
@keyframes fade-in { from { opacity:0; } to { opacity:1; } }

#tts-zen-preview-modal {
  width: 480px; max-width: 90vw; max-height: 80vh;
  background: #1a1a35; border: 1px solid rgba(167,139,250,0.15);
  border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  transform: scale(0.92) translateY(16px); opacity: 0;
  transition: transform .35s cubic-bezier(.16,1,.3,1), opacity .25s ease;
}
#tts-zen-preview-overlay:not(.hidden) #tts-zen-preview-modal {
  transform: scale(1) translateY(0); opacity: 1;
}

#tts-zen-preview-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-wrap: wrap; gap: 6px;
}
#tts-zen-preview-header span { font-weight: 600; color: #a78bfa; font-size: 13px; }
#tts-zen-preview-tools {
  display: flex; align-items: center; gap: 4px;
}
.preview-tool {
  padding: 3px 7px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 5px; background: rgba(255,255,255,0.04);
  color: #9ca3af; font-size: 10px; cursor: pointer;
  transition: all .15s ease; font-family: inherit;
}
.preview-tool:hover { background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); color: #d1d5db; }
.preview-tool.active { background: rgba(167,139,250,0.18); border-color: #a78bfa; color: #a78bfa; }
.tool-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.08); margin: 0 2px; }

/* ---- Site Tags ---- */
.sites-section { align-items: flex-start !important; }
#tts-zen-sites {
  display: flex; flex-wrap: wrap; gap: 5px; flex: 1;
}
.site-tag {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: #6b7280; font-size: 10px; font-weight: 500;
  transition: all .2s ease; cursor: default;
}
.site-tag.active {
  border-color: rgba(167,139,250,0.2);
  background: rgba(167,139,250,0.08);
  color: #a78bfa;
}
.site-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(167,139,250,0.15); font-size: 10px; font-weight: 700;
}
.site-tag.active .site-icon { background: rgba(167,139,250,0.3); }
#tts-zen-preview-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; background: transparent; border: none;
  border-radius: 8px; color: #6b7280; cursor: pointer;
  transition: all .15s ease;
}
#tts-zen-preview-close:hover { background: rgba(255,255,255,0.08); color: #d1d5db; }

#tts-zen-preview-content {
  flex: 1; overflow-y: auto; padding: 18px;
  font-size: 13px; line-height: 1.8; color: #9ca3af;
  white-space: pre-wrap;
}
#tts-zen-preview-content::-webkit-scrollbar { width: 4px; }
#tts-zen-preview-content::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.2); border-radius: 2px; }

#tts-zen-preview-content .sentence {
  transition: background .25s ease, color .3s ease;
  border-radius: 3px; padding: 1px 2px;
}
#tts-zen-preview-content .sentence.active {
  background: rgba(167,139,250,0.22); color: #f3f4f6;
}
#tts-zen-preview-content .sentence.played { color: #6b7280; }

/* ---- Sites Modal ---- */
#tts-zen-sites-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .3s ease;
  pointer-events: none;
}
#tts-zen-sites-overlay:not(.hidden) {
  opacity: 1; pointer-events: auto;
}
#tts-zen-sites-overlay.hidden { display: none; }
#tts-zen-sites-modal {
  width: 360px; max-width: 90vw; background: #1a1a35;
  border: 1px solid rgba(167,139,250,0.15); border-radius: 16px; overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  transform: scale(0.92) translateY(16px); opacity: 0;
  transition: transform .35s cubic-bezier(.16,1,.3,1), opacity .25s ease;
}
#tts-zen-sites-overlay:not(.hidden) #tts-zen-sites-modal {
  transform: scale(1) translateY(0); opacity: 1;
}
#tts-zen-sites-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
#tts-zen-sites-header span { font-weight: 600; color: #a78bfa; font-size: 14px; }
#tts-zen-sites-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; background: transparent; border: none;
  border-radius: 8px; color: #6b7280; cursor: pointer; transition: all .15s ease;
}
#tts-zen-sites-close:hover { background: rgba(255,255,255,0.08); color: #d1d5db; }
#tts-zen-sites-list { padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; max-height: 50vh; overflow-y: auto; }

.site-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all .2s ease;
}
.site-row:hover { border-color: rgba(167,139,250,0.2); background: rgba(167,139,250,0.04); }
.site-row-left { display: flex; align-items: center; gap: 10px; }
.site-row-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(167,139,250,0.12); color: #a78bfa;
  font-size: 13px; font-weight: 700;
}
.site-row-info { display: flex; flex-direction: column; }
.site-row-name { font-size: 13px; color: #d1d5db; font-weight: 500; }
.site-row-domain { font-size: 10px; color: #6b7280; }
.site-toggle {
  width: 42px; height: 24px; border-radius: 12px; border: none;
  cursor: pointer; position: relative; background: rgba(255,255,255,0.1);
  transition: background .2s ease; flex-shrink: 0;
}
.site-toggle.on { background: #7c3aed; }
.site-toggle::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%; background: #fff;
  transition: transform .2s ease;
}
.site-toggle.on::after { transform: translateX(18px); }

#tts-zen-add-site-input:focus { border-color: #a78bfa !important; }
#tts-zen-add-site-btn:hover { background: rgba(167,139,250,0.2) !important; }
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
    translateTitle: 'Traducción'
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
    translateTitle: 'Translation'
  }
};

function t(key) { return (T[state.lang] || T['es'])[key] || key; }

// ---- State ----

let state = {
  voices: [],
  currentVoice: 'es-ES-AlvaroNeural',
  currentRate: 1.0,
  currentEngine: 'native',
  langIn: 'auto',
  langOut: 'es',
  lang: 'es'
};

// ---- Storage ----

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(['voice', 'rate', 'engine', 'lang', 'langIn', 'langOut']);
    if (stored.voice) state.currentVoice = stored.voice;
    if (stored.rate) state.currentRate = stored.rate;
    if (stored.engine) state.currentEngine = stored.engine;
    if (stored.lang) state.lang = stored.lang;
    if (stored.langIn) state.langIn = stored.langIn;
    if (stored.langOut) state.langOut = stored.langOut;
  } catch (_) {}
}

async function saveSettings() {
  try {
    await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate, engine: state.currentEngine, lang: state.lang, langIn: state.langIn, langOut: state.langOut });
  } catch (_) {}
}

// ---- Voice Loading ----

async function loadVoices() {
  // Always clear and repopulate based on current engine
  if (state.currentEngine === 'server') {
    await loadServerVoices();
    return;
  }

  // Use browser's built-in speech synthesis voices
  var voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    state.voices = voices.map(function(v) {
      return { name: v.name, lang: v.lang, voiceURI: v.voiceURI, default: v.default };
    });
    populateVoiceDropdown();
    return;
  }

  // Voices might not be loaded yet on first call
  // IMPORTANT: guard against race with engine switch
  speechSynthesis.onvoiceschanged = function() {
    // Only populate if we're still in native mode
    if (state.currentEngine !== 'native') return;
    var v = speechSynthesis.getVoices();
    state.voices = v.map(function(x) {
      return { name: x.name, lang: x.lang, voiceURI: x.voiceURI, default: x.default };
    });
    populateVoiceDropdown();
  };
}

async function loadServerVoices() {
  var select = getEl('tts-zen-voice');
  if (select) {
    while (select.options.length > 0) select.remove(0);
    var opt = document.createElement('option');
    opt.value = ''; opt.textContent = t('loadingEdgeVoices');
    select.appendChild(opt); select.disabled = true;
  }

  try {
    console.log('[TTS-zen] loadServerVoices: sending get_voices...');
    var resp = await browser.runtime.sendMessage({ action: 'get_voices' });
    console.log('[TTS-zen] loadServerVoices: got resp', resp);
    if (resp.success && resp.voices && resp.voices.length > 0) {
      state.voices = resp.voices.map(function(v) {
        return { name: v.name, lang: v.locale, voiceURI: v.name, default: false };
      });
      populateVoiceDropdown();
      window.__tts_zen_state.serverAvailable = true;
      console.log('[TTS-zen] loadServerVoices: OK ' + resp.voices.length + ' voices');
    } else {
      state.voices = [];
      populateVoiceDropdown();
      window.__tts_zen_state.serverAvailable = false;
      console.error('[TTS-zen] loadServerVoices: FAIL success=' + resp.success + ' voices=' + (resp.voices ? resp.voices.length : 0));
      if (select) {
        while (select.options.length > 0) select.remove(0);
        var opt2 = document.createElement('option');
        opt2.value = ''; opt2.textContent = t('serverUnavailable');
        select.appendChild(opt2); select.disabled = true;
      }
    }
  } catch (e) {
    state.voices = [];
    populateVoiceDropdown();
    window.__tts_zen_state.serverAvailable = false;
    console.error('[TTS-zen] loadServerVoices: ERROR', e.message || e);
    if (select) {
      while (select.options.length > 0) select.remove(0);
      var opt3 = document.createElement('option');
      opt3.value = ''; opt3.textContent = t('serverUnavailable');
      select.appendChild(opt3); select.disabled = true;
    }
  }
}

function populateVoiceDropdown() {
  var select = getEl('tts-zen-voice');
  if (!select) return;
  while (select.options.length > 0) select.remove(0);
  select.disabled = false;

  if (!state.voices || state.voices.length === 0) return;

  // Group by language
  var groups = {};
  state.voices.forEach(function(v) {
    var lang = v.lang || 'desconocido';
    if (!groups[lang]) groups[lang] = [];
    groups[lang].push(v);
  });

  var langNames = { 'es-ES': 'Español', 'es-MX': 'Español (MX)', 'es-US': 'Español (US)',
    'es': 'Español', 'en-US': 'English', 'en-GB': 'English (UK)', 'en': 'English',
    'fr-FR': 'Français', 'de-DE': 'Deutsch', 'it-IT': 'Italiano', 'pt-BR': 'Português' };
  // edge-tts locales (es-AR, en-AU, etc.) — group by prefix
  function langLabel(lang) {
    if (langNames[lang]) return langNames[lang];
    if (lang.startsWith('es-')) return 'Español (' + lang.split('-')[1] + ')';
    if (lang.startsWith('en-')) return 'English (' + lang.split('-')[1] + ')';
    return lang;
  }

  Object.keys(groups).sort().forEach(function(lang) {
    var voices = groups[lang];
    var label = langLabel(lang);
    var optgroup = document.createElement('optgroup');
    optgroup.label = label;
    voices.forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = v.name + (v.default ? ' (default)' : '');
      if (v.name === state.currentVoice || v.default) opt.selected = true;
      optgroup.appendChild(opt);
    });
    select.appendChild(optgroup);
  });
}

function applyLanguage(shadow) {
  var lang = state.lang;
  // Update settings label texts
  var voiceRow = shadow.querySelector('.setting-row:nth-child(1) label');
  if (voiceRow) voiceRow.textContent = T[lang].voice;
  var engineRow = shadow.querySelector('.setting-row:nth-child(2) label');
  if (engineRow) engineRow.textContent = T[lang].engine;
  var langRow = shadow.querySelector('.setting-row:nth-child(3) label');
  if (langRow) langRow.textContent = T[lang].langLabel;
  // Translation section header
  var translateHeader = shadow.querySelector('.section-header span:last-child');
  if (translateHeader) translateHeader.textContent = T[lang].translateTitle;
  // Speed label (last .setting-row)
  var allSettingRows = shadow.querySelectorAll('#tts-zen-settings .setting-row');
  if (allSettingRows.length >= 4) {
    var speedRow = allSettingRows[allSettingRows.length - 1];
    var speedLabel = speedRow.querySelector('label');
    if (speedLabel) speedLabel.textContent = T[lang].speed;
  }

  // Update button texts
  var readBtn = shadow.getElementById('tts-zen-read');
  if (readBtn) readBtn.childNodes[readBtn.childNodes.length-1].textContent = ' ' + T[lang].read;
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
  if (engineSelect && engineSelect.options.length >= 2) {
    engineSelect.options[0].textContent = T[lang].engineNative;
    engineSelect.options[1].textContent = T[lang].engineNeural;
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
  el.textContent = t('line') + ' ' + current + ' de ' + total;
}

export function setButtonsEnabled(btns) {
  for (const [action, enabled] of [['read', btns.read], ['pause', btns.pause], ['stop', btns.stop], ['prev', btns.prev], ['next', btns.next]]) {
    const btn = getEl('tts-zen-' + action);
    if (btn) btn.disabled = enabled === false;
  }
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
  voiceSelect.addEventListener('change', function() { state.currentVoice = voiceSelect.value; window.__tts_zen_state.currentVoice = voiceSelect.value; saveSettings(); });

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
  if (langOut) { langOut.value = state.langOut; langOut.addEventListener('change', function() { state.langOut = langOut.value; window.__tts_zen_state.langOut = langOut.value; saveSettings(); }); }

  const speedSlider = shadow.getElementById('tts-zen-speed');
  const speedLabel = shadow.getElementById('tts-zen-speed-label');
  speedSlider.addEventListener('input', function() { state.currentRate = speedSlider.value / 100; window.__tts_zen_state.currentRate = state.currentRate; speedLabel.textContent = state.currentRate.toFixed(1) + 'x'; saveSettings(); });

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

var previewFont = 'sans';
var previewSize = 14;
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
  return fallbackIcons[domain] || '';
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
      iconDiv.style.fontSize = '16px';
      iconDiv.textContent = '+';
      left.appendChild(iconDiv);
    } else {
      var iconImg = document.createElement('img');
      iconImg.className = 'site-row-icon';
      iconImg.src = faviconUrl(site.domain);
      iconImg.width = 24;
      iconImg.height = 24;
      iconImg.style.borderRadius = '4px';
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
  addRow.className = 'site-row';
  addRow.style.cssText = 'padding:6px 10px;gap:8px;';
  var input = document.createElement('input');
  input.id = 'tts-zen-add-site-input';
  input.type = 'text';
  input.placeholder = t('addSitePlaceholder');
  input.style.cssText = 'flex:1;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#d1d5db;font-size:11px;outline:none';

  var addBtn = document.createElement('button');
  addBtn.id = 'tts-zen-add-site-btn';
  addBtn.textContent = t('addSite');
  addBtn.style.cssText = 'padding:6px 12px;border-radius:6px;border:1px solid rgba(167,139,250,0.3);background:rgba(167,139,250,0.1);color:#a78bfa;font-size:11px;cursor:pointer;white-space:nowrap';

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

