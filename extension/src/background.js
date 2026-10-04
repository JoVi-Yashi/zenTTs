// zenTTS background page (Firefox MV3)
// Proxies content-script messages to the local Ruby server on localhost:8765
// and runs the Piper voice (WASM) for the offline "local" engine.

import { TtsSession, voices as piperCatalog, PATH_MAP, HF_BASE } from '@mintplex-labs/piper-tts-web';
import * as offline from './translator.js';

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

    case 'tr_status':
      offline.status(message.from, message.to)
        .then(st => sendResponse(Object.assign({ success: true }, st)))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'tr_download': {
      let last = 0;
      offline.download(message.from, message.to, fraction => {
        if (fraction < 1 && Date.now() - last < 200) return;
        last = Date.now();
        notify(sender, { action: 'tr_progress', from: message.from, to: message.to, fraction });
      })
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;
    }

    case 'tr_translate':
      offline.translate(message.from, message.to, message.texts)
        .then(texts => sendResponse({ success: true, texts }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'tr_list':
      offline.listPacks()
        .then(packs => sendResponse({ success: true, packs }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'tr_remove':
      offline.removePack(message.pair)
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'get_theme':
      // Chrome has no theme API; the panel falls back to prefers-color-scheme
      if (!browser.theme) { sendResponse({ success: false, error: 'no theme API' }); return false; }
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
      handleLocalDownload(message.voiceId, sender)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'panel_state':
      isActive(sender.tab)
        .then(on => sendResponse({ success: true, on }))
        .catch(() => sendResponse({ success: true, on: false }));
      return true;

    case 'open_library':
      browser.tabs.create({ url: browser.runtime.getURL('library.html'), index: sender.tab ? sender.tab.index + 1 : undefined })
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'panel_set':
      // The panel itself turned off (e.g. "Always open here" unchecked and hidden)
      if (sender.tab) setTabActive(sender.tab.id, !!message.on);
      sendResponse({ success: true });
      return false;

    case 'local_warm':
      warmVoice(message.voiceId)
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

// Voices the bundled catalog lacks, from the official Piper repository.
// Registered in PATH_MAP so piper-tts-web finds them in OPFS by file name.
const RHASSPY = 'https://huggingface.co/rhasspy/piper-voices/resolve/main';
const EXTRA_VOICES = [
  { key: 'es_AR-daniela-high', name: 'daniela', quality: 'high', language: 'es_AR',
    path: 'es/es_AR/daniela/high/es_AR-daniela-high.onnx', size: 114199011 }
];
for (const v of EXTRA_VOICES) if (!PATH_MAP[v.key]) PATH_MAP[v.key] = v.path;

function voiceBase(voiceId) {
  return EXTRA_VOICES.some(v => v.key === voiceId) ? RHASSPY : HF_BASE;
}

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
    for (const v of EXTRA_VOICES) {
      if (!catalog.some(c => c.key === v.key)) catalog.push({ key: v.key, name: v.name, quality: v.quality, language: v.language, size: v.size });
    }
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

async function handleLocalDownload(voiceId, sender) {
  const path = PATH_MAP[voiceId];
  if (!path) throw new Error('unknown voice ' + voiceId);
  if (!downloads[voiceId]) {
    downloads[voiceId] = (async () => {
      const dir = await modelDir();
      const file = path.split('/').pop();
      const base = voiceBase(voiceId);
      const config = await fetchWithProgress(`${base}/${path}.json`);
      let last = 0;
      const model = await fetchWithProgress(`${base}/${path}`, (loaded, total) => {
        if (Date.now() - last < 250) return;
        last = Date.now();
        // Content-Length can be missing behind the CDN redirect: fall back to the catalog size
        const known = total || ((catalog || []).find(c => c.key === voiceId) || {}).size || 0;
        notify(sender, { action: 'local_progress', voiceId, loaded, total: known });
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

// Voices known to be stored, so each sentence doesn't list the OPFS folder
const readyVoices = new Set();

async function ensureStored(voiceId) {
  if (readyVoices.has(voiceId)) return;
  if (!(await storedVoices()).includes(voiceId)) throw new Error('voice not downloaded: ' + voiceId);
  readyVoices.add(voiceId);
}

// One inference at a time: the ONNX session is not re-entrant
function enqueue(fn) {
  const job = queue.then(fn);
  queue = job.catch(() => {});
  return job;
}

// Loads the model ahead of time, so the first sentence doesn't wait for it
function warmVoice(voiceId) {
  return enqueue(async () => {
    await ensureStored(voiceId);
    const t0 = performance.now();
    await sessionFor(voiceId);
    return { success: true, ms: Math.round(performance.now() - t0) };
  });
}

function handleLocalSpeak(text, voiceId) {
  return enqueue(async () => {
    await ensureStored(voiceId);
    const tts = await sessionFor(voiceId);
    const t0 = performance.now();
    const wav = await tts.predict(text);
    // Synthesis time, to compare with the audio length (is the voice keeping up?)
    return { success: true, audio: await wav.arrayBuffer(), ms: Math.round(performance.now() - t0) };
  });
}

// ---- Progress messages ----
// Content scripts get them through tabs.sendMessage; the PDF reader is an
// extension page, which gets runtime messages instead.

function notify(sender, msg) {
  const tabId = sender && sender.tab && sender.tab.id;
  if (tabId !== undefined) browser.tabs.sendMessage(tabId, msg).catch(() => {});
  if (sender && sender.url && sender.url.startsWith(browser.runtime.getURL(''))) {
    browser.runtime.sendMessage(msg).catch(() => {});
  }
}

// ---- Toolbar button: show the panel per tab ----
// Nothing appears by itself: the button (or Alt+Shift+Z) turns the panel on or
// off in that tab. The choice lives in session storage, so it survives
// reloads and chapter changes in the tab. Sites marked "always open here"
// (autoSites) show it in every tab, unless it was turned off in that tab.

const TABS_KEY = 'activeTabs';

function hostOf(url) {
  try { return new URL(url).hostname; } catch (_) { return ''; }
}

function isPdfUrl(url) {
  try { return /\.pdf$/i.test(new URL(url).pathname); } catch (_) { return false; }
}

async function tabStates() {
  try { return (await browser.storage.session.get(TABS_KEY))[TABS_KEY] || {}; } catch (_) { return {}; }
}

async function isActive(tab) {
  if (!tab) return false;
  const states = await tabStates();
  if (tab.id in states) return states[tab.id];
  const { autoSites } = await browser.storage.local.get('autoSites');
  return (autoSites || []).includes(hostOf(tab.url));
}

async function setTabActive(tabId, on) {
  const states = await tabStates();
  states[tabId] = on;
  try { await browser.storage.session.set({ [TABS_KEY]: states }); } catch (_) {}
  showBadge(tabId, on);
}

function showBadge(tabId, on) {
  browser.action.setBadgeText({ tabId, text: on ? '●' : '' }).catch(() => {});
  browser.action.setBadgeBackgroundColor({ tabId, color: '#9a3b25' }).catch(() => {});
  browser.action.setTitle({ tabId, title: on ? 'zenTTS · activo (clic para ocultar)' : 'zenTTS · clic para mostrar' }).catch(() => {});
}

// A new tab created by the extension: loading an extension page by navigating
// the PDF's own tab (file:// or web) is refused by Firefox in MV3 and shows
// "file not found", so the reader opens next to it instead.
async function openReader(tab) {
  const url = browser.runtime.getURL('reader.html') + '?src=' + encodeURIComponent(tab.url);
  try {
    await browser.tabs.create({ url, index: tab.index + 1, openerTabId: tab.id });
  } catch (e) {
    console.error('[zenTTS] reader:', e.message || e);
    await browser.tabs.create({ url });
  }
}

async function toggle(tab) {
  if (!tab) return;
  if (isPdfUrl(tab.url)) return openReader(tab);
  const on = !(await isActive(tab));
  await setTabActive(tab.id, on);
  browser.tabs.sendMessage(tab.id, { action: 'panel_toggle', on }).catch(() => {});
}

browser.action.onClicked.addListener(toggle);

if (browser.commands && browser.commands.onCommand) {
  browser.commands.onCommand.addListener(async (command) => {
    if (command !== 'toggle-panel') return;
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    toggle(tab);
  });
}

// Tab badges are reset when a tab navigates: put them back
browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (info.status !== 'complete') return;
  showBadge(tabId, await isActive(tab));
});

browser.tabs.onRemoved.addListener(async (tabId) => {
  const states = await tabStates();
  if (!(tabId in states)) return;
  delete states[tabId];
  try { await browser.storage.session.set({ [TABS_KEY]: states }); } catch (_) {}
});

// ---- Browser theme → panel ----
// Zen keeps its own accent and workspace gradient inside the browser UI, out of
// reach of extensions; a Firefox theme installed from AMO is readable, so tabs
// are told whenever it changes.

// Chrome has no theme API at all, so this only runs on Firefox.
if (browser.theme && browser.theme.onUpdated) {
  browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
    const tabs = await browser.tabs.query(windowId ? { windowId } : {});
    for (const tab of tabs) {
      browser.tabs.sendMessage(tab.id, { action: 'theme_changed', theme }).catch(() => {});
    }
  });
}
