// TTS-zen Panel — Compact UI with voice, speed, counter, navigation
// Page highlighting happens on the actual DOM, not in this panel

const PANEL_HTML = `
<div id="tts-zen-panel">
  <div id="tts-zen-header">
    <span id="tts-zen-logo">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
      TTS-zen
    </span>
    <button id="tts-zen-settings-btn" title="Ajustes">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </div>

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
`;

const PANEL_CSS = `
:host { all: initial; }

#tts-zen-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999999;
  width: 290px;
  background: linear-gradient(145deg, #14142b 0%, #1a1a35 100%);
  border: 1px solid rgba(167, 139, 250, 0.12);
  border-radius: 16px;
  color: #d1d5db;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-shadow: 0 0 0 1px rgba(167, 139, 250, 0.05), 0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
  user-select: none;
  animation: panel-in .3s cubic-bezier(0.16,1,0.3,1);
  transition: box-shadow .3s ease, border-color .3s ease;
}
#tts-zen-panel:hover {
  border-color: rgba(167,139,250,0.25);
  box-shadow: 0 0 0 1px rgba(167,139,250,0.1), 0 12px 48px rgba(0,0,0,0.55);
}
@keyframes panel-in { from { opacity:0; transform: translateY(12px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }

#tts-zen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 12px 14px 10px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
#tts-zen-logo {
  display: flex; align-items: center; gap: 7px;
  font-weight: 600; font-size: 13px; color: #a78bfa;
}
#tts-zen-logo svg { color: #a78bfa; }
#tts-zen-settings-btn {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; background: transparent;
  border: 1px solid transparent; border-radius: 8px; color: #6b7280; cursor: pointer;
  transition: all .2s ease;
}
#tts-zen-settings-btn:hover {
  background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.2);
  color: #a78bfa; transform: rotate(30deg);
}

#tts-zen-settings {
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column; gap: 8px;
}
#tts-zen-settings.collapsed { display: none; }

.setting-row { display: flex; align-items: center; gap: 8px; }
.setting-row label { min-width: 62px; font-size: 11px; color: #9ca3af; font-weight: 500; }

.select-wrap {
  flex: 1; position: relative; overflow: visible;
}
.select-wrap select {
  width: 100%; padding: 6px 8px; border-radius: 7px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.04); color: #d1d5db;
  font-size: 11px; cursor: pointer; outline: none;
  transition: border-color .2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 9 5' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l3.5 3L8 1' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 8px center;
  padding-right: 24px;
}
.select-wrap select:hover { border-color: rgba(167,139,250,0.3); }
.select-wrap select:focus { border-color: #a78bfa; background: rgba(167,139,250,0.06); }

.speed-group { display: flex; align-items: center; gap: 8px; flex: 1; }
.speed-group input[type="range"] {
  flex: 1; height: 4px; appearance: none;
  background: rgba(255,255,255,0.08); border-radius: 2px; outline: none; cursor: pointer;
}
.speed-group input[type="range"]::-webkit-slider-thumb {
  appearance: none; width: 14px; height: 14px; border-radius: 50%;
  background: #a78bfa; cursor: pointer; border: 2px solid #1a1a35;
  box-shadow: 0 2px 8px rgba(167,139,250,0.4);
  transition: transform .15s ease, box-shadow .2s ease;
}
.speed-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15); box-shadow: 0 4px 12px rgba(167,139,250,0.6);
}
#tts-zen-speed-label {
  font-size: 11px; color: #a78bfa; font-weight: 600;
  min-width: 32px; text-align: right; font-variant-numeric: tabular-nums;
}

#tts-zen-counter {
  text-align: center; padding: 10px 14px 6px;
  font-size: 12px; color: #6b7280; font-weight: 500;
  font-variant-numeric: tabular-nums;
}

#tts-zen-nav {
  display: flex; justify-content: center; gap: 16px;
  padding: 0 14px 8px;
}
#tts-zen-nav button {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 28px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 7px; color: #9ca3af; cursor: pointer;
  transition: all .2s ease;
}
#tts-zen-nav button:hover:not(:disabled) {
  background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); color: #a78bfa;
}
#tts-zen-nav button:disabled { opacity: 0.25; cursor: not-allowed; }

#tts-zen-controls {
  display: flex; gap: 6px; padding: 0 14px 10px;
}
#tts-zen-controls button {
  display: flex; align-items: center; justify-content: center; gap: 5px;
  flex: 1; padding: 8px 10px;
  border: 1px solid rgba(255,255,255,0.08); border-radius: 9px;
  background: rgba(255,255,255,0.04); color: #d1d5db;
  font-size: 12px; font-weight: 500; cursor: pointer;
  transition: all .2s cubic-bezier(0.4,0,0.2,1); outline: none;
}
#tts-zen-controls button svg { flex-shrink: 0; transition: transform .2s ease; }
#tts-zen-controls button:hover:not(:disabled) {
  background: rgba(255,255,255,0.08); border-color: rgba(167,139,250,0.3);
  transform: translateY(-1px);
}
#tts-zen-controls button:hover:not(:disabled) svg { transform: scale(1.1); }
#tts-zen-controls button:active:not(:disabled) {
  transform: translateY(0) scale(0.97); transition: all .1s ease;
}
#tts-zen-controls button:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
#tts-zen-controls button.primary {
  background: #7c3aed; border-color: #7c3aed; color: #fff; font-weight: 600;
  box-shadow: 0 2px 12px rgba(124,58,237,0.3);
}
#tts-zen-controls button.primary:hover:not(:disabled) {
  background: #8b5cf6; border-color: #8b5cf6;
  box-shadow: 0 4px 20px rgba(124,58,237,0.45);
}
#tts-zen-controls button.primary:active:not(:disabled) {
  background: #6d28d9; box-shadow: 0 1px 6px rgba(124,58,237,0.3);
}

#tts-zen-status {
  padding: 4px 14px 10px; font-size: 11px; color: #6b7280;
  text-align: center; font-weight: 500;
}
#tts-zen-status.error { color: #f87171; }
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
  speedSlider.value = Math.round(state.currentRate * 100);
  speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
  loadVoices();
}
