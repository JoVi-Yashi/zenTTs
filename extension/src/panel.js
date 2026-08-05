// TTS-zen Panel — Refined dark UI with SVG icons, animations, text sync
// Designed to run inside a Shadow DOM context

const PANEL_HTML = `
<div id="tts-zen-panel">
  <div id="tts-zen-header">
    <span id="tts-zen-logo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
      </svg>
      TTS-zen
    </span>
    <button id="tts-zen-settings-btn" title="Ajustes">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
      </svg>
    </button>
  </div>

  <div id="tts-zen-settings" class="collapsed">
    <div class="setting-row">
      <label>Voz</label>
      <select id="tts-zen-voice"></select>
    </div>
    <div class="setting-row">
      <label>Velocidad</label>
      <div class="speed-group">
        <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
        <span id="tts-zen-speed-label">1.0x</span>
      </div>
    </div>
  </div>

  <div id="tts-zen-text-display">
    <div id="tts-zen-text-content"></div>
  </div>

  <div id="tts-zen-controls">
    <button id="tts-zen-read" class="primary">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <polygon points="5,3 19,12 5,21"></polygon>
      </svg>
      Leer
    </button>
    <button id="tts-zen-pause" disabled>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </svg>
    </button>
    <button id="tts-zen-stop" disabled>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <rect x="4" y="4" width="16" height="16" rx="2"></rect>
      </svg>
    </button>
  </div>

  <div id="tts-zen-status">Listo</div>
</div>
`;

const PANEL_CSS = `
:host {
  all: initial;
}

#tts-zen-panel {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 999999;
  width: 340px;
  max-height: 70vh;
  background: linear-gradient(145deg, #14142b 0%, #1a1a35 100%);
  border: 1px solid rgba(167, 139, 250, 0.12);
  border-radius: 16px;
  color: #d1d5db;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 0 0 1px rgba(167, 139, 250, 0.05),
    0 8px 40px rgba(0, 0, 0, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.3);
  user-select: none;
  animation: panel-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transition: box-shadow 0.3s ease, border-color 0.3s ease;
}

#tts-zen-panel:hover {
  border-color: rgba(167, 139, 250, 0.25);
  box-shadow:
    0 0 0 1px rgba(167, 139, 250, 0.1),
    0 12px 48px rgba(0, 0, 0, 0.55),
    0 4px 12px rgba(0, 0, 0, 0.35);
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ---- Header ---- */

#tts-zen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

#tts-zen-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #a78bfa;
  letter-spacing: 0.2px;
}

#tts-zen-logo svg {
  color: #a78bfa;
  transition: transform 0.3s ease;
}

#tts-zen-settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

#tts-zen-settings-btn:hover {
  background: rgba(167, 139, 250, 0.1);
  border-color: rgba(167, 139, 250, 0.2);
  color: #a78bfa;
  transform: rotate(30deg);
}

/* ---- Settings ---- */

#tts-zen-settings {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: settings-in 0.2s ease;
}

#tts-zen-settings.collapsed {
  display: none;
}

@keyframes settings-in {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 200px; }
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-row label {
  min-width: 68px;
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.setting-row select {
  flex: 1;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: #d1d5db;
  font-size: 12px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}

.setting-row select:hover {
  border-color: rgba(167, 139, 250, 0.3);
}

.setting-row select:focus {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.06);
}

.speed-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.speed-group input[type="range"] {
  flex: 1;
  height: 6px;
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  transition: background 0.2s ease;
}

.speed-group input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #a78bfa;
  cursor: pointer;
  border: 2px solid #1a1a35;
  box-shadow: 0 2px 8px rgba(167, 139, 250, 0.4);
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}

.speed-group input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.6);
}

#tts-zen-speed-label {
  font-size: 12px;
  color: #a78bfa;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

/* ---- Text Display ---- */

#tts-zen-text-display {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  max-height: 320px;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  scroll-behavior: smooth;
}

#tts-zen-text-display::-webkit-scrollbar {
  width: 4px;
}

#tts-zen-text-display::-webkit-scrollbar-track {
  background: transparent;
}

#tts-zen-text-display::-webkit-scrollbar-thumb {
  background: rgba(167, 139, 250, 0.2);
  border-radius: 2px;
}

#tts-zen-text-display::-webkit-scrollbar-thumb:hover {
  background: rgba(167, 139, 250, 0.4);
}

#tts-zen-text-content {
  line-height: 1.75;
  font-size: 13px;
  color: #9ca3af;
}

#tts-zen-text-content .sentence {
  display: inline;
  transition: color 0.3s ease, background 0.25s ease, text-decoration-color 0.3s ease;
  border-radius: 3px;
  padding: 1px 2px;
  text-decoration: underline;
  text-decoration-color: transparent;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
}

#tts-zen-text-content .sentence.active {
  color: #f3f4f6;
  background: rgba(167, 139, 250, 0.18);
  text-decoration-color: #a78bfa;
  box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.15);
}

#tts-zen-text-content .sentence.played {
  color: #6b7280;
}

/* ---- Controls ---- */

#tts-zen-controls {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
}

#tts-zen-controls button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  padding: 10px 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  color: #d1d5db;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
}

#tts-zen-controls button svg {
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

#tts-zen-controls button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(167, 139, 250, 0.3);
  transform: translateY(-1px);
}

#tts-zen-controls button:hover:not(:disabled) svg {
  transform: scale(1.1);
}

#tts-zen-controls button:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
  transition: all 0.1s ease;
}

#tts-zen-controls button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none;
}

#tts-zen-controls button.primary {
  background: #7c3aed;
  border-color: #7c3aed;
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(124, 58, 237, 0.3);
}

#tts-zen-controls button.primary:hover:not(:disabled) {
  background: #8b5cf6;
  border-color: #8b5cf6;
  box-shadow: 0 4px 20px rgba(124, 58, 237, 0.45);
}

#tts-zen-controls button.primary:active:not(:disabled) {
  background: #6d28d9;
  box-shadow: 0 1px 6px rgba(124, 58, 237, 0.3);
}

/* ---- Status ---- */

#tts-zen-status {
  padding: 6px 16px 12px;
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  font-weight: 500;
  transition: color 0.2s ease;
}

#tts-zen-status.error {
  color: #f87171;
}
`;
// ---- State ----

let state = {
  voices: [],
  currentVoice: 'es-ES-AlvaroNeural',
  currentRate: 1.0,
  sentences: [],
  currentSentenceIdx: -1,
  playing: false,
  paused: false,
};

let audio = null;

// ---- Storage ----

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(['voice', 'rate']);
    if (stored.voice) state.currentVoice = stored.voice;
    if (stored.rate) state.currentRate = stored.rate;
  } catch (_) { /* OK */ }
}

async function saveSettings() {
  try {
    await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate });
  } catch (_) { /* OK */ }
}

// ---- Voice Loading ----

async function loadVoices() {
  try {
    const response = await browser.runtime.sendMessage({ action: 'get_voices' });
    if (response.success) {
      state.voices = response.voices;
      populateVoiceDropdown();
    }
  } catch (_) { /* Server not running */ }
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
  for (const [country, voices] of Object.entries(groups)) {
    const names = { ES: 'España', MX: 'México', AR: 'Argentina', CO: 'Colombia', CL: 'Chile', PE: 'Perú', VE: 'Venezuela', US: 'EEUU', BO: 'Bolivia', CR: 'Costa Rica', CU: 'Cuba', DO: 'Dominicana', EC: 'Ecuador', SV: 'El Salvador', GQ: 'Guinea Ecuatorial', GT: 'Guatemala', HN: 'Honduras', NI: 'Nicaragua', PA: 'Panamá', PY: 'Paraguay', PR: 'Puerto Rico', UY: 'Uruguay' };
    const label = names[country] || country;
    const optgroup = document.createElement('optgroup');
    optgroup.label = label;
    for (const v of voices) {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = v.friendly.replace('Microsoft ', '').replace(' Online (Natural)', '');
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

export function setStatus(text, isError = false) {
  const el = getEl('tts-zen-status');
  if (!el) return;
  el.textContent = text;
  el.className = isError ? 'error' : '';
}

export function setButtonsEnabled({ read, pause, stop }) {
  for (const [action, enabled] of [['read', read], ['pause', pause], ['stop', stop]]) {
    const btn = getEl('tts-zen-' + action);
    if (btn) btn.disabled = !enabled;
  }
}

// ---- Text Display ----

function displaySentences(sentences) {
  const container = getEl('tts-zen-text-content');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < sentences.length; i++) {
    const span = document.createElement('span');
    span.className = 'sentence';
    span.id = 'tts-zen-s-' + i;
    span.textContent = sentences[i].text + ' ';
    container.appendChild(span);
  }
}

function highlightSentence(idx) {
  const prev = getEl('tts-zen-text-content');
  if (!prev) return;
  const active = prev.querySelector('.sentence.active');
  if (active) { active.classList.remove('active'); active.classList.add('played'); }
  const el = getEl('tts-zen-s-' + idx);
  if (el) el.classList.add('active');
}

function scrollToSentence(idx) {
  const el = getEl('tts-zen-s-' + idx);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ---- Audio Player ----

function stopAudio() {
  if (audio) {
    audio.pause();
    if (audio.src && audio.src.startsWith('blob:')) URL.revokeObjectURL(audio.src);
    audio = null;
  }
  state.playing = false;
  state.paused = false;
  state.currentSentenceIdx = -1;
}

function playAudioSync(audioB64, sentences) {
  stopAudio();
  state.sentences = sentences;
  state.currentSentenceIdx = -1;
  displaySentences(sentences);

  const binary = atob(audioB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  audio = new Audio(url);

  audio.addEventListener('timeupdate', () => {
    if (!audio || !state.sentences.length) return;
    const t = audio.currentTime;
    let found = -1;
    for (let i = 0; i < state.sentences.length; i++) {
      if (t >= state.sentences[i].start && t < state.sentences[i].end) { found = i; break; }
    }
    if (found !== -1 && found !== state.currentSentenceIdx) {
      state.currentSentenceIdx = found;
      highlightSentence(found);
      scrollToSentence(found);
    }
  });

  audio.addEventListener('ended', () => {
    highlightSentence(state.sentences.length - 1);
    setStatus('Listo');
    setButtonsEnabled({ read: true, pause: false, stop: false });
    URL.revokeObjectURL(audio.src);
    audio = null;
    state.playing = false;
  });

  audio.addEventListener('error', () => {
    setStatus('Error de reproducción', true);
    setButtonsEnabled({ read: true, pause: false, stop: false });
    stopAudio();
  });

  audio.play().then(() => {
    state.playing = true;
    setStatus('Reproduciendo...');
    setButtonsEnabled({ read: false, pause: true, stop: true });
  }).catch(err => {
    setStatus('Error: ' + err.message, true);
    setButtonsEnabled({ read: true, pause: false, stop: false });
    stopAudio();
  });
}

// ---- Message Dispatch ----

async function dispatchReadPage(extractFn) {
  const text = extractFn();
  if (!text) {
    setStatus('No se encontró texto en esta página', true);
    return;
  }
  const voice = state.currentVoice;
  const rate = Math.round((state.currentRate - 1) * 100) + '%';
  const rateStr = state.currentRate >= 1 ? '+' + rate : rate;

  setStatus('Generando audio...');
  setButtonsEnabled({ read: false, pause: false, stop: false });

  try {
    const response = await browser.runtime.sendMessage({
      action: 'read_page_sync', text, voice, rate: rateStr,
    });
    if (response.success) {
      playAudioSync(response.audio, response.sentences);
    } else {
      setStatus('Error: ' + response.error, true);
      setButtonsEnabled({ read: true, pause: false, stop: false });
    }
  } catch (err) {
    setStatus('Error de conexión: ' + err.message, true);
    setButtonsEnabled({ read: true, pause: false, stop: false });
  }
}

// ---- Audio Controls ----

function handlePause() {
  if (!audio) return;
  if (audio.paused) {
    audio.play().then(() => { state.paused = false; setStatus('Reproduciendo...'); });
  } else {
    audio.pause();
    state.paused = true;
    setStatus('Pausado');
  }
}

function handleStop() {
  stopAudio();
  highlightSentence(-1);
  setStatus('Detenido');
  setButtonsEnabled({ read: true, pause: false, stop: false });
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
  settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('collapsed'));

  const voiceSelect = shadow.getElementById('tts-zen-voice');
  voiceSelect.addEventListener('change', () => { state.currentVoice = voiceSelect.value; saveSettings(); });

  const speedSlider = shadow.getElementById('tts-zen-speed');
  const speedLabel = shadow.getElementById('tts-zen-speed-label');
  speedSlider.addEventListener('input', () => { state.currentRate = speedSlider.value / 100; speedLabel.textContent = state.currentRate.toFixed(1) + 'x'; saveSettings(); });

  const readBtn = shadow.getElementById('tts-zen-read');
  const pauseBtn = shadow.getElementById('tts-zen-pause');
  const stopBtn = shadow.getElementById('tts-zen-stop');
  readBtn.addEventListener('click', () => dispatchReadPage(handlers.onRead));
  pauseBtn.addEventListener('click', handlePause);
  stopBtn.addEventListener('click', handleStop);

  await loadSettings();
  speedSlider.value = Math.round(state.currentRate * 100);
  speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
  loadVoices();
}
