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
      <button id="tts-zen-preview-btn" title="Ver texto extraido">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
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
        <label>Velocidad</label>
        <div class="speed-group">
          <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
          <span id="tts-zen-speed-label">1.0x</span>
      </div>
    </div>
    <div class="setting-row sites-section">
      <label>Sitios</label>
      <div id="tts-zen-sites">
        <div class="site-tag active">
          <span class="site-icon">W</span> Wattpad
        </div>
        <div class="site-tag active">
          <span class="site-icon">A</span> AO3
        </div>
        <div class="site-tag active">
          <span class="site-icon">F</span> FanFiction
        </div>
        <div class="site-tag">
          <span class="site-icon">+</span> Genérico
        </div>
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
      <span>Texto extraido</span>
      <div id="tts-zen-preview-tools">
        <button class="preview-tool" data-font="serif" title="Serif">Serif</button>
        <button class="preview-tool active" data-font="sans" title="Sans">Sans</button>
        <button class="preview-tool" data-font="mono" title="Mono">Mono</button>
        <span class="tool-sep"></span>
        <button class="preview-tool" data-size="down" title="Reducir">A-</button>
        <button class="preview-tool" data-size="up" title="Aumentar">A+</button>
        <span class="tool-sep"></span>
        <button class="preview-tool" data-spacing="down" title="Menos espacio">-</button>
        <button class="preview-tool" data-spacing="up" title="Mas espacio">+</button>
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
}
#tts-zen-settings.collapsed { display: none; }

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
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  animation: fade-in .2s ease;
}
#tts-zen-preview-overlay.hidden { display: none; }
@keyframes fade-in { from { opacity:0; } to { opacity:1; } }

#tts-zen-preview-modal {
  width: 480px; max-width: 90vw; max-height: 80vh;
  background: #1a1a35; border: 1px solid rgba(167,139,250,0.15);
  border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  animation: modal-in .25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes modal-in { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }

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
`;
// ---- State ----

let state = {
  voices: [],
  currentVoice: 'es-ES-AlvaroNeural',
  currentRate: 1.0,
};

// ---- Storage ----

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(['voice', 'rate']);
    if (stored.voice) state.currentVoice = stored.voice;
    if (stored.rate) state.currentRate = stored.rate;
  } catch (_) {}
}

async function saveSettings() {
  try {
    await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate });
  } catch (_) {}
}

// ---- Voice Loading ----

async function loadVoices() {
  try {
    let response;
    for (let i = 0; i < 3; i++) {
      try {
        response = await browser.runtime.sendMessage({ action: 'get_voices' });
        break;
      } catch (err) {
        if (err.message?.includes('receiving end does not exist') && i < 2) {
          await new Promise(r => setTimeout(r, 200));
          continue;
        }
        throw err;
      }
    }
    if (response?.success) {
      state.voices = response.voices;
      populateVoiceDropdown();
    }
  } catch (_) {}
}

function populateVoiceDropdown() {
  const select = getEl('tts-zen-voice');
  if (!select) return;
  select.innerHTML = '';
  const groups = {};
  for (const v of state.voices) {
    const country = v.locale.split('-')[1] || v.locale;
    if (!groups[country]) groups[country] = [];
    groups[country].push(v);
  }
  const names = { ES: 'España', MX: 'México', AR: 'Argentina', CO: 'Colombia',
    CL: 'Chile', PE: 'Perú', VE: 'Venezuela', US: 'EEUU', BO: 'Bolivia',
    CR: 'Costa Rica', CU: 'Cuba', DO: 'Dominicana', EC: 'Ecuador',
    SV: 'El Salvador', GQ: 'Guinea Ecuatorial', GT: 'Guatemala',
    HN: 'Honduras', NI: 'Nicaragua', PA: 'Panamá', PY: 'Paraguay',
    PR: 'Puerto Rico', UY: 'Uruguay' };
  for (const [country, voices] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = names[country] || country;
    for (const v of voices) {
      const opt = document.createElement('option');
      opt.value = v.name;
      const short = v.friendly.replace('Microsoft ', '').replace(' Online (Natural)', '');
      opt.textContent = short + ' (' + (v.gender === 'Female' ? 'F' : 'M') + ')';
      if (v.name === state.currentVoice) opt.selected = true;
      optgroup.appendChild(opt);
    }
    select.appendChild(optgroup);
  }
  select.value = state.currentVoice;
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
  el.textContent = 'Linea ' + current + ' de ' + total;
}

export function setButtonsEnabled(btns) {
  for (const [action, enabled] of [['read', btns.read], ['pause', btns.pause], ['stop', btns.stop], ['prev', btns.prev], ['next', btns.next]]) {
    const btn = getEl('tts-zen-' + action);
    if (btn) btn.disabled = enabled === false;
  }
}

// ---- Initialization ----

export async function createPanel(shadow, handlers) {
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

  await loadSettings();
  await loadCollapsedState();
  speedSlider.value = Math.round(state.currentRate * 100);
  speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
  loadVoices();
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
  content.innerHTML = '';

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
  const overlay = getEl('tts-zen-preview-overlay');
  if (overlay) overlay.classList.add('hidden');
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
  btn.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
}

