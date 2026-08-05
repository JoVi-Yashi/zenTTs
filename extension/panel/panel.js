// TTS-zen Panel State Machine — standalone reference
// Bundled into content.js via esbuild import; kept as reference for panel behavior

/**
 * Panel states and transitions:
 *
 *   idle ──[Read click]──► extracting ──► generating ──► playing
 *                                                          │
 *                                                    [Pause click]
 *                                                    ┌──────┘
 *                                                    ▼
 *                                                  paused ──[Resume click]──► playing
 *                                                    │
 *                                              [Stop click]
 *                                                    │
 *                                                    ▼
 *                                                  idle (ready)
 *
 * Button availability:
 *   idle:       Read enabled, Pause disabled, Stop disabled
 *   extracting: Read disabled, Pause disabled, Stop disabled
 *   generating: Read disabled, Pause disabled, Stop disabled
 *   playing:    Read disabled, Pause enabled,  Stop enabled
 *   paused:     Read disabled, Pause enabled,  Stop enabled
 */

export const STATES = {
  IDLE:       'idle',
  EXTRACTING: 'extracting',
  GENERATING: 'generating',
  PLAYING:    'playing',
  PAUSED:     'paused'
};

/**
 * Create panel UI inside a Shadow DOM root.
 * @param {ShadowRoot} shadow - Shadow root to populate
 * @param {object} handlers - { onRead, onPause, onStop } callbacks
 */
export function createPanel(shadow, handlers) {
  const PANEL_HTML = `
    <div id="tts-zen-panel">
      <div id="tts-zen-header">TTS-zen</div>
      <div id="tts-zen-controls">
        <button id="tts-zen-read">Read</button>
        <button id="tts-zen-pause" disabled>Pause</button>
        <button id="tts-zen-stop" disabled>Stop</button>
      </div>
      <div id="tts-zen-status">Ready</div>
    </div>
  `;

  const PANEL_CSS = `
    #tts-zen-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: #1a1a2e;
      color: #e0e0e0;
      border-radius: 12px;
      padding: 14px 18px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.55);
      min-width: 200px;
      max-width: 280px;
      user-select: none;
    }
    #tts-zen-header {
      font-weight: 700;
      font-size: 15px;
      margin-bottom: 10px;
      color: #a78bfa;
      letter-spacing: 0.3px;
    }
    #tts-zen-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
    }
    #tts-zen-controls button {
      flex: 1;
      padding: 8px 10px;
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
    #tts-zen-status {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  `;

  const style = document.createElement('style');
  style.textContent = PANEL_CSS;

  const container = document.createElement('div');
  container.innerHTML = PANEL_HTML;

  shadow.appendChild(style);
  shadow.appendChild(container);

  const readBtn = shadow.getElementById('tts-zen-read');
  const pauseBtn = shadow.getElementById('tts-zen-pause');
  const stopBtn = shadow.getElementById('tts-zen-stop');

  readBtn.addEventListener('click', handlers.onRead);
  pauseBtn.addEventListener('click', handlers.onPause);
  stopBtn.addEventListener('click', handlers.onStop);
}

export function setStatus(text) {
  const host = document.getElementById('tts-zen-host');
  if (!host || !host.shadowRoot) return;
  const el = host.shadowRoot.getElementById('tts-zen-status');
  if (el) el.textContent = text;
}

export function setButtonsEnabled({ read, pause, stop }) {
  const host = document.getElementById('tts-zen-host');
  if (!host || !host.shadowRoot) return;
  if (read !== undefined) {
    const btn = host.shadowRoot.getElementById('tts-zen-read');
    if (btn) btn.disabled = !read;
  }
  if (pause !== undefined) {
    const btn = host.shadowRoot.getElementById('tts-zen-pause');
    if (btn) btn.disabled = !pause;
  }
  if (stop !== undefined) {
    const btn = host.shadowRoot.getElementById('tts-zen-stop');
    if (btn) btn.disabled = !stop;
  }
}
