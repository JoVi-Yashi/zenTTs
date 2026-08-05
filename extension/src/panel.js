// TTS-zen Panel — Full UI with voice selector, speed, text display, highlighting
// Designed to run inside a Shadow DOM context

const PANEL_HTML = `
<div id="tts-zen-panel">
  <div id="tts-zen-header">
    <span id="tts-zen-logo">🎙️ TTS-zen</span>
    <button id="tts-zen-settings-btn" title="Settings">⚙️</button>
  </div>

  <div id="tts-zen-settings" class="collapsed">
    <div class="setting-row">
      <label for="tts-zen-voice">Voz</label>
      <select id="tts-zen-voice"></select>
    </div>
    <div class="setting-row">
      <label for="tts-zen-speed">Velocidad</label>
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
    <button id="tts-zen-read">▶️ Leer</button>
    <button id="tts-zen-pause" disabled>⏸️</button>
    <button id="tts-zen-stop" disabled>⏹️</button>
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
  bottom: 20px;
  right: 20px;
  z-index: 999999;
  background: #1a1a2e;
  color: #e0e0e0;
  border-radius: 14px;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  box-shadow: 0 4px 32px rgba(0, 0, 0, 0.6);
  width: 320px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
}

#tts-zen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px 10px;
  border-bottom: 1px solid #2a2a45;
}
#tts-zen-logo {
  font-weight: 700;
  font-size: 14px;
  color: #a78bfa;
}
#tts-zen-settings-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 6px;
  transition: background 0.15s;
}
#tts-zen-settings-btn:hover {
  background: #2a2a40;
  color: #a78bfa;
}

#tts-zen-settings {
  padding: 10px 14px;
  border-bottom: 1px solid #2a2a45;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
#tts-zen-settings.collapsed {
  display: none;
}
.setting-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.setting-row label {
  min-width: 70px;
  font-size: 12px;
  color: #999;
}
.setting-row select {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #3f3f5e;
  background: #2a2a40;
  color: #e0e0e0;
  font-size: 12px;
  cursor: pointer;
}
.speed-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.speed-group input[type="range"] {
  flex: 1;
  accent-color: #a78bfa;
}
#tts-zen-speed-label {
  font-size: 12px;
  color: #a78bfa;
  font-weight: 600;
  min-width: 36px;
  text-align: right;
}

#tts-zen-text-display {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px;
  max-height: 300px;
  background: #12122a;
  border-bottom: 1px solid #2a2a45;
}
#tts-zen-text-display::-webkit-scrollbar {
  width: 4px;
}
#tts-zen-text-display::-webkit-scrollbar-thumb {
  background: #3f3f5e;
  border-radius: 2px;
}
#tts-zen-text-content {
  line-height: 1.7;
  font-size: 13px;
  color: #ccc;
}
#tts-zen-text-content .sentence {
  display: inline;
  transition: background 0.2s, color 0.2s;
  border-radius: 3px;
  padding: 1px 0;
}
#tts-zen-text-content .sentence.active {
  background: rgba(167, 139, 250, 0.25);
  color: #fff;
  text-decoration: underline;
  text-decoration-color: #a78bfa;
  text-underline-offset: 2px;
}
#tts-zen-text-content .sentence.played {
  color: #888;
}

#tts-zen-controls {
  display: flex;
  gap: 6px;
  padding: 10px 14px;
}
#tts-zen-controls button {
  flex: 1;
  padding: 9px 10px;
  border: 1px solid #3f3f5e;
  border-radius: 8px;
  background: #2a2a40;
  color: #e0e0e0;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, opacity 0.15s;
}
#tts-zen-controls button:hover:not(:disabled) {
  background: #38385a;
  border-color: #7c3aed;
}
#tts-zen-controls button:active:not(:disabled) {
  background: #4a4a70;
}
#tts-zen-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
#tts-zen-read {
  background: #7c3aed !important;
  border-color: #7c3aed !important;
  color: #fff !important;
}
#tts-zen-read:hover:not(:disabled) {
  background: #8b5cf6 !important;
}
#tts-zen-read:disabled {
  background: #4a3080 !important;
  border-color: #4a3080 !important;
}

#tts-zen-status {
  padding: 6px 14px 10px;
  font-size: 11px;
  color: #666;
  text-align: center;
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
let timeUpdateInterval = null;

// ---- Storage ----

async function loadSettings() {
  try {
    const stored = await browser.storage.local.get(['voice', 'rate']);
    if (stored.voice) state.currentVoice = stored.voice;
    if (stored.rate) state.currentRate = stored.rate;
  } catch (_) { /* OK if storage isn't available */ }
}

async function saveSettings() {
  try {
    await browser.storage.local.set({
      voice: state.currentVoice,
      rate: state.currentRate,
    });
  } catch (_) { /* OK */ }
}

// ---- Voice Loading ----

async function loadVoices() {
  try {
    const resp = await fetch('http://localhost:8765/voices?locale=es-');
    if (resp.ok) {
      state.voices = await resp.json();
      populateVoiceDropdown();
    }
  } catch (_) {
    // Server not running — use default voice
  }
}

function populateVoiceDropdown() {
  const select = getEl('tts-zen-voice');
  if (!select) return;
  select.innerHTML = '';
  // Group by locale
  const groups = {};
  for (const v of state.voices) {
    const country = v.locale.split('-')[1] || v.locale;
    if (!groups[country]) groups[country] = [];
    groups[country].push(v);
  }
  for (const [country, voices] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = country === 'ES' ? '🇪🇸 España' :
                     country === 'MX' ? '🇲🇽 México' :
                     country === 'AR' ? '🇦🇷 Argentina' :
                     country === 'CO' ? '🇨🇴 Colombia' :
                     country === 'CL' ? '🇨🇱 Chile' :
                     country === 'PE' ? '🇵🇪 Perú' :
                     country === 'VE' ? '🇻🇪 Venezuela' :
                     country === 'US' ? '🇺🇸 EEUU' :
                     country;
    for (const v of voices) {
      const opt = document.createElement('option');
      opt.value = v.name;
      opt.textContent = `${v.friendly.split(' - ')[0].replace('Microsoft ', '')} (${v.gender === 'Female' ? '♀' : '♂'})`;
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
    const btn = getEl(`tts-zen-${action}`);
    if (btn) btn.disabled = !enabled;
  }
}

function displaySentences(sentences) {
  const container = getEl('tts-zen-text-content');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < sentences.length; i++) {
    const span = document.createElement('span');
    span.className = 'sentence';
    span.id = `tts-zen-s-${i}`;
    span.textContent = sentences[i].text + ' ';
    container.appendChild(span);
  }
}

function highlightSentence(idx) {
  // Remove previous highlight
  const prev = getEl('tts-zen-text-content')?.querySelector('.sentence.active');
  if (prev) {
    prev.classList.remove('active');
    prev.classList.add('played');
  }
  // Add new highlight
  const el = getEl(`tts-zen-s-${idx}`);
  if (el) {
    el.classList.add('active');
  }
}

function scrollToSentence(idx) {
  const el = getEl(`tts-zen-s-${idx}`);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

// ---- Audio Player ----

function stopAudio() {
  if (timeUpdateInterval) {
    clearInterval(timeUpdateInterval);
    timeUpdateInterval = null;
  }
  if (audio) {
    audio.pause();
    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }
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

  // Decode base64 to binary
  const binary = atob(audioB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  audio = new Audio(url);

  audio.addEventListener('timeupdate', () => {
    if (!audio || !state.sentences.length) return;
    const t = audio.currentTime;
    let found = -1;
    for (let i = 0; i < state.sentences.length; i++) {
      if (t >= state.sentences[i].start && t < state.sentences[i].end) {
        found = i;
        break;
      }
    }
    if (found !== -1 && found !== state.currentSentenceIdx) {
      state.currentSentenceIdx = found;
      highlightSentence(found);
      scrollToSentence(found);
    }
  });

  audio.addEventListener('ended', () => {
    highlightSentence(state.sentences.length - 1);
    setStatus('✅ Listo');
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
    setStatus('▶️ Reproduciendo...');
    setButtonsEnabled({ read: false, pause: true, stop: true });
  }).catch(err => {
    setStatus(`Error: ${err.message}`, true);
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
  const rate = `${Math.round((state.currentRate - 1) * 100)}%`;
  const rateStr = state.currentRate >= 1 ? `+${rate}` : rate;

  setStatus('🎤 Generando audio...');
  setButtonsEnabled({ read: false, pause: false, stop: false });

  try {
    const response = await browser.runtime.sendMessage({
      action: 'read_page_sync',
      text,
      voice,
      rate: rateStr,
    });

    if (response.success) {
      playAudioSync(response.audio, response.sentences);
    } else {
      setStatus(`Error: ${response.error}`, true);
      setButtonsEnabled({ read: true, pause: false, stop: false });
    }
  } catch (err) {
    setStatus(`Error de conexión: ${err.message}`, true);
    setButtonsEnabled({ read: true, pause: false, stop: false });
  }
}

// ---- Audio Controls ----

function handlePause() {
  if (!audio) return;
  if (audio.paused) {
    audio.play().then(() => {
      state.paused = false;
      setStatus('▶️ Reproduciendo...');
    });
  } else {
    audio.pause();
    state.paused = true;
    setStatus('⏸️ Pausado');
  }
}

function handleStop() {
  stopAudio();
  highlightSentence(-1);
  setStatus('⏹️ Detenido');
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

  // Settings toggle
  const settingsBtn = shadow.getElementById('tts-zen-settings-btn');
  const settingsPanel = shadow.getElementById('tts-zen-settings');
  settingsBtn.addEventListener('click', () => {
    settingsPanel.classList.toggle('collapsed');
  });

  // Voice selector
  const voiceSelect = shadow.getElementById('tts-zen-voice');
  voiceSelect.addEventListener('change', () => {
    state.currentVoice = voiceSelect.value;
    saveSettings();
  });

  // Speed slider
  const speedSlider = shadow.getElementById('tts-zen-speed');
  const speedLabel = shadow.getElementById('tts-zen-speed-label');
  speedSlider.addEventListener('input', () => {
    state.currentRate = speedSlider.value / 100;
    speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
    saveSettings();
  });

  // Buttons
  const readBtn = shadow.getElementById('tts-zen-read');
  const pauseBtn = shadow.getElementById('tts-zen-pause');
  const stopBtn = shadow.getElementById('tts-zen-stop');

  readBtn.addEventListener('click', () => dispatchReadPage(handlers.onRead));
  pauseBtn.addEventListener('click', handlePause);
  stopBtn.addEventListener('click', handleStop);

  // Load settings and voices
  await loadSettings();
  speedSlider.value = Math.round(state.currentRate * 100);
  speedLabel.textContent = state.currentRate.toFixed(1) + 'x';
  loadVoices();
}
