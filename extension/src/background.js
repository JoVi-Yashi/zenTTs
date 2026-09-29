// zenTTS background page (Firefox MV3)
// Proxies content-script messages to the local Ruby server on localhost:8765
// and runs the Piper voice (WASM) for the offline "local" engine.

import { TtsSession, voices as piperCatalog, PATH_MAP, HF_BASE } from '@mintplex-labs/piper-tts-web';

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'health':
      handleHealth()
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'translate':
      handleTranslate(message.texts, message.from, message.to)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'get_voices':
      handleGetVoices(message.locale)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'read_page':
      handleReadPage(message.text, message.voice, message.rate)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'read_page_sync':
      handleReadPageSync(message.text, message.voice, message.rate, message.words)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'extract_url':
      handleExtractUrl(message.url, message.voice, message.rate)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'get_theme':
      browser.theme.getCurrent(sender.tab && sender.tab.windowId)
        .then(theme => sendResponse({ success: true, theme }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'local_voices':
      handleLocalVoices()
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'local_download':
      handleLocalDownload(message.voiceId, sender.tab && sender.tab.id)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'local_speak':
      handleLocalSpeak(message.text, message.voiceId)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    default:
      sendResponse({ success: false, error: `unknown action: ${message.action}` });
      return false;
  }
});

async function handleHealth() {
  try {
    const resp = await fetch('http://localhost:8765/health');
    if (!resp.ok) return { success: false, error: 'Server unhealthy' };
    const data = await resp.json();
    return { success: data.status === 'ok', status: data.status };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function handleTranslate(texts, from, to) {
  const resp = await fetch('http://localhost:8765/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, from: from || 'auto', to: to || 'es' })
  });
  if (!resp.ok) throw new Error('Translate failed: ' + resp.status);
  const result = await resp.json();
  return { success: true, texts: result.texts };
}

async function handleGetVoices(locale) {
  const query = locale ? '?locale=' + encodeURIComponent(locale) : '';
  const resp = await fetch('http://localhost:8765/voices' + query);
  if (!resp.ok) throw new Error(`Voices fetch failed: ${resp.status}`);
  const voices = await resp.json();
  return { success: true, voices };
}

async function handleReadPage(text, voice, rate) {
  const body = { text };
  if (voice) body.voice = voice;
  if (rate) body.rate = rate;

  const resp = await fetch('http://localhost:8765/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `TTS server error: ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  return { success: true, data };
}

async function handleReadPageSync(text, voice, rate, words) {
  const body = { text, words: !!words };
  if (voice) body.voice = voice;
  if (rate) body.rate = rate;

  const resp = await fetch('http://localhost:8765/tts/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `TTS server error: ${resp.status}`);
  }

  const result = await resp.json();
  return {
    success: true,
    audio: result.audio,
    sentences: result.sentences,
    words: result.words || [],
  };
}

async function handleExtractUrl(url, voice, rate) {
  const body = { url };
  if (voice) body.voice = voice;
  if (rate) body.rate = rate;

  const resp = await fetch('http://localhost:8765/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Extraction server error: ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  return { success: true, data };
}

// ---- Local engine: Piper in WASM ----

const WASM_PATHS = {
  onnxWasm: browser.runtime.getURL('vendor/ort/'),
  piperData: browser.runtime.getURL('vendor/piper/piper_phonemize.data'),
  piperWasm: browser.runtime.getURL('vendor/piper/piper_phonemize.wasm')
};

// Models live in the origin-private file system, under piper/<file>,
// the same place piper-tts-web looks for them.
async function modelDir() {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle('piper', { create: true });
}

async function storedVoices() {
  const dir = await modelDir();
  const names = new Set();
  for await (const name of dir.keys()) names.add(name);
  return Object.keys(PATH_MAP).filter(id => {
    const file = PATH_MAP[id].split('/').pop();
    return names.has(file) && names.has(file + '.json');
  });
}

let catalog = null;

async function handleLocalVoices() {
  if (!catalog) {
    const list = await piperCatalog();
    catalog = list.map(v => {
      const onnx = Object.keys(v.files || {}).find(f => f.endsWith('.onnx'));
      return {
        key: v.key, name: v.name, quality: v.quality,
        language: v.language.code, size: onnx ? v.files[onnx].size_bytes : 0
      };
    });
  }
  return { success: true, stored: await storedVoices(), catalog };
}

async function saveFile(dir, name, blob) {
  const handle = await dir.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

async function fetchWithProgress(url, onProgress) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + url);
  const total = +(resp.headers.get('Content-Length') || 0);
  const reader = resp.body.getReader();
  const chunks = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    if (onProgress) onProgress(loaded, total);
  }
  return new Blob(chunks);
}

const downloads = {};

async function handleLocalDownload(voiceId, tabId) {
  const path = PATH_MAP[voiceId];
  if (!path) throw new Error('unknown voice ' + voiceId);
  if (!downloads[voiceId]) {
    downloads[voiceId] = (async () => {
      const dir = await modelDir();
      const file = path.split('/').pop();
      const config = await fetchWithProgress(`${HF_BASE}/${path}.json`);
      let last = 0;
      const model = await fetchWithProgress(`${HF_BASE}/${path}`, (loaded, total) => {
        if (tabId === undefined || Date.now() - last < 250) return;
        last = Date.now();
        browser.tabs.sendMessage(tabId, { action: 'local_progress', voiceId, loaded, total }).catch(() => {});
      });
      // Model first, config last: a voice counts as stored only when both exist
      await saveFile(dir, file, model);
      await saveFile(dir, file + '.json', config);
    })().finally(() => { delete downloads[voiceId]; });
  }
  await downloads[voiceId];
  return { success: true };
}

let session = null;
let queue = Promise.resolve();

async function sessionFor(voiceId) {
  if (session && session.voiceId === voiceId) return session;
  // TtsSession is a singleton that keeps the first model; reset it to switch voices
  TtsSession._instance = null;
  session = await TtsSession.create({ voiceId, wasmPaths: WASM_PATHS });
  return session;
}

function handleLocalSpeak(text, voiceId) {
  // One inference at a time: the ONNX session is not re-entrant
  const job = queue.then(async () => {
    const stored = await storedVoices();
    if (!stored.includes(voiceId)) throw new Error('voice not downloaded: ' + voiceId);
    const tts = await sessionFor(voiceId);
    const wav = await tts.predict(text);
    return { success: true, audio: await wav.arrayBuffer() };
  });
  queue = job.catch(() => {});
  return job;
}

// ---- Browser theme → panel ----
// Zen keeps its own accent and workspace gradient inside the browser UI, out of
// reach of extensions; a Firefox theme installed from AMO is readable, so tabs
// are told whenever it changes.

browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
  const tabs = await browser.tabs.query(windowId ? { windowId } : {});
  for (const tab of tabs) {
    browser.tabs.sendMessage(tab.id, { action: 'theme_changed', theme }).catch(() => {});
  }
});
