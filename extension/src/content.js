// zenTTS content script
// Extracts the story with a reference to each paragraph on the page, feeds the
// sentences to the player, highlights along, remembers where you were and
// continues with the next chapter in the same page.
import { Readability } from '@mozilla/readability';
import { createPanel, setStatus, setButtonsEnabled, setCounter, setPauseIcon, setResume, updatePreviewSentences } from './panel.js';
import { siteFor } from './sites.js';
import { createPlayer } from './player.js';
import { textHash, loadProgress, saveProgress, flushProgress, clearProgress, pruneProgress } from './progress.js';

// ---- URL Guard ----
const RESTRICTED_PROTOCOLS = ['edge:', 'about:', 'file:', 'chrome:', 'moz-extension:'];

function shouldInject() {
  var proto = window.location.protocol;
  if (RESTRICTED_PROTOCOLS.includes(proto)) return false;

  var sites = window.__tts_zen_enabled_sites || {};
  var host = window.location.hostname;
  for (var siteId in sites) {
    if (siteId === 'generic') continue;
    if (host.includes(siteId)) return sites[siteId] !== false;
  }
  return sites['generic'] !== false;
}

// ---- Shared state with the panel ----

window.__tts_zen_state = {
  currentVoice: 'es-ES-AlvaroNeural', localVoice: 'es_ES-davefx-medium',
  currentRate: 1.0, currentEngine: 'native', serverAvailable: false,
  lang: 'es', langIn: 'auto', langOut: 'es', autoNext: true
};

function st() { return window.__tts_zen_state; }

function ts(key, arg) {
  var T = {
    es: {
      ready: 'Listo', playing: 'Reproduciendo…', paused: 'Pausado', stopped: 'Detenido',
      starting: 'Preparando lectura…', translating: 'Traduciendo…',
      noTextFound: 'No se encontró texto en esta página',
      voiceError: 'No se pudo leer con ninguna voz',
      fallback_local: 'edge-tts no respondió — usando voz local',
      fallback_native: 'Sin voz neural — usando la voz del navegador',
      nextLoading: 'Cargando el capítulo siguiente…', nextFailed: 'No se pudo cargar el capítulo siguiente',
      chapterDone: 'Capítulo terminado', pressRead: 'Pulsa Leer para continuar'
    },
    en: {
      ready: 'Ready', playing: 'Playing…', paused: 'Paused', stopped: 'Stopped',
      starting: 'Getting ready…', translating: 'Translating…',
      noTextFound: 'No text found on this page',
      voiceError: 'Could not read with any voice',
      fallback_local: 'edge-tts did not answer — using the local voice',
      fallback_native: 'No neural voice — using the browser voice',
      nextLoading: 'Loading the next chapter…', nextFailed: 'Could not load the next chapter',
      chapterDone: 'Chapter finished', pressRead: 'Press Read to continue'
    }
  };
  var s = (T[st().lang] || T.es)[key] || key;
  return arg !== undefined ? s.replace('%s', arg) : s;
}

// ---- Extraction ----

var site = siteFor(window.location.hostname);
var chapterDoc = document;           // document the current chapter came from
var chapterUrl = new URL(window.location.href);

function isHidden(el) {
  if (el.ownerDocument !== document) return false;
  var cs = window.getComputedStyle(el);
  return cs.display === 'none' || cs.visibility === 'hidden';
}

function cleanText(text) {
  return text
    .replace(/[\t ]+/g, ' ')
    .replace(/\.{3,}/g, '…')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\.([A-ZÁÉÍÓÚÑ])/g, '. $1')
    .replace(/ {2,}/g, ' ')
    .trim();
}

// Returns [{el, text}] — el is null when the text came from Readability
function extractParagraphs() {
  var container = site.container(document);
  if (container) {
    var paras = site.paragraphs(container)
      .filter(function(el) { return !isHidden(el); })
      .map(function(el) { return { el: el, text: cleanText(el.innerText || el.textContent || '') }; })
      .filter(function(p) { return p.text.length >= 2; });
    var total = paras.reduce(function(n, p) { return n + p.text.length; }, 0);
    if (total > 50) return paras;
  }
  try {
    var article = new Readability(document.cloneNode(true)).parse();
    if (article && article.textContent && article.textContent.trim().length > 50) {
      return article.textContent.split(/\n\s*\n/).map(function(t) { return { el: null, text: cleanText(t) }; })
        .filter(function(p) { return p.text.length >= 2; });
    }
  } catch (_) {}
  return [];
}

function splitIntoSentences(text) {
  var parts = text.match(/[^.!?…\n]+[.!?…]*["'»”’)]*\s*/g) || [text];
  return parts.map(function(p) { return p.trim(); }).filter(function(p) { return p.length > 0; });
}

function buildSentences(paras) {
  var list = [];
  paras.forEach(function(p, i) {
    splitIntoSentences(p.text).forEach(function(s) { list.push({ text: s, refIdx: i }); });
  });
  return list;
}

async function translateParagraphs(paras) {
  var to = st().langOut;
  if (!to || to === 'auto') return paras;
  setStatus(ts('translating'));
  try {
    var resp = await browser.runtime.sendMessage({
      action: 'translate', texts: paras.map(function(p) { return p.text; }), from: st().langIn || 'auto', to: to
    });
    if (resp && Array.isArray(resp.texts) && resp.texts.length === paras.length) {
      return paras.map(function(p, i) { return { el: p.el, text: cleanText(resp.texts[i] || p.text) }; });
    }
  } catch (e) {
    console.error('[zenTTS] translate:', e.message || e);
  }
  return paras;
}

// ---- Page highlight ----

var highlighted = null;
var MARK = 'rgba(243, 225, 154, 0.55)';

function clearHighlight() {
  if (!highlighted) return;
  highlighted.style.removeProperty('background');
  highlighted.style.removeProperty('box-shadow');
  highlighted = null;
}

function highlightParagraph(el) {
  if (el === highlighted) return;
  clearHighlight();
  if (!el || !el.isConnected) return;
  el.style.background = MARK;
  el.style.boxShadow = '-6px 0 0 ' + MARK + ', 6px 0 0 ' + MARK;
  el.style.transition = 'background 0.15s ease';
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  highlighted = el;
}

function highlightPreview(i) {
  var host = document.getElementById('tts-zen-host');
  if (!host || !host.shadowRoot) return;
  var root = host.shadowRoot;
  var overlay = root.getElementById('tts-zen-preview-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  if (!root.getElementById('tts-zen-preview-s-' + (sentences.length - 1))) updatePreviewSentences();
  var prev = root.querySelector('#tts-zen-preview-content .sentence.active');
  if (prev) { prev.classList.remove('active'); prev.classList.add('played'); }
  var el = root.getElementById('tts-zen-preview-s-' + i);
  if (el) { el.classList.add('active'); el.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
}

// ---- Reading session ----

var paragraphs = [];
var sentences = [];
var chapterKey = null;
var chapterHash = null;
var resumeAt = null;      // { index, total } offered by the Continue button
var prepared = false;     // sentences built for the current chapter
var nextChapter = null;   // { url, promise }
var engineNote = null;    // shown instead of "Playing…" after a fallback

var player = createPlayer({
  options: function() {
    var s = st();
    var lang = s.langOut && s.langOut !== 'auto' ? s.langOut : (document.documentElement.lang || 'es');
    return { voice: s.currentVoice, localVoice: s.localVoice, rate: s.currentRate || 1, lang: lang };
  },
  onSentence: function(i) {
    var s = sentences[i];
    setCounter(i + 1, sentences.length);
    highlightParagraph(s && paragraphs[s.refIdx] ? paragraphs[s.refIdx].el : null);
    highlightPreview(i);
    saveProgress(chapterKey, { index: i, total: sentences.length, hash: chapterHash, title: document.title });
    if (i >= sentences.length * 0.8) prefetchNextChapter();
  },
  onState: function(state) {
    var playing = state === 'playing';
    var active = state !== 'idle';
    setButtonsEnabled({ read: !active, pause: active, stop: active, prev: active, next: active });
    setPauseIcon(playing);
    if (state === 'playing') setStatus(engineNote || ts('playing'));
    if (state === 'paused') setStatus(ts('paused'));
  },
  onEnd: function() {
    clearHighlight();
    clearProgress(chapterKey);
    resumeAt = null;
    setResume(null);
    if (st().autoNext) goToNextChapter();
    else setStatus(ts('chapterDone'));
  },
  onFallback: function(from, to) {
    engineNote = ts('fallback_' + to);
    setStatus(engineNote);
    st().serverAvailable = from === 'server' ? false : st().serverAvailable;
  },
  onError: function(name, err) {
    console.error('[zenTTS] ' + name + ':', err && (err.message || err));
    setStatus(ts('voiceError'), true);
  }
});

async function prepareChapter() {
  var paras = extractParagraphs();
  if (!paras.length) {
    // Dynamic sites (Webnovel, Wattpad) may still be rendering
    await new Promise(function(r) { setTimeout(r, 2000); });
    paras = extractParagraphs();
  }
  if (!paras.length) return false;

  chapterKey = site.chapterKey(chapterUrl);
  chapterHash = textHash(paras.map(function(p) { return p.text; }).join('\n'));
  paragraphs = await translateParagraphs(paras);
  sentences = buildSentences(paragraphs);
  window.__tts_zen_sentences = sentences;
  window.__tts_zen_last_text = paragraphs.map(function(p) { return p.text; }).join('\n\n');
  player.load(sentences);
  prepared = true;
  return true;
}

async function startReading(fromIndex) {
  setStatus(ts('starting'));
  if (!prepared && !(await prepareChapter())) {
    setStatus(ts('noTextFound'), true);
    return;
  }
  startContentObserver();
  engineNote = null;
  player.start(fromIndex || 0, st().currentEngine || 'native');
}

// ---- Resume ----

async function offerResume() {
  var key = site.chapterKey(chapterUrl);
  var saved = await loadProgress(key);
  resumeAt = saved && saved.index > 0 ? saved : null;
  setResume(resumeAt ? { index: resumeAt.index, total: resumeAt.total } : null);
}

async function handleRead() {
  if (player.state === 'paused') { player.resume(); return; }
  var from = 0;
  if (resumeAt) {
    if (!prepared && !(await prepareChapter())) { setStatus(ts('noTextFound'), true); return; }
    // Only resume if the chapter text is the one we saved
    if (resumeAt.hash === chapterHash && resumeAt.index < sentences.length) from = resumeAt.index;
  }
  resumeAt = null;
  setResume(null);
  startReading(from);
}

function handleRestart() {
  clearProgress(chapterKey || site.chapterKey(chapterUrl));
  resumeAt = null;
  setResume(null);
  startReading(0);
}

// ---- Next chapter, in the same page ----

async function fetchChapter(url) {
  var resp = await fetch(url, { credentials: 'include' });
  if (!resp.ok) {
    var err = new Error('HTTP ' + resp.status);
    err.status = resp.status;
    throw err;
  }
  var doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
  var container = site.container(doc);
  if (!container) throw new Error('no chapter content');
  return { url: url, doc: doc, container: container };
}

function prefetchNextChapter() {
  if (nextChapter || !st().autoNext) return;
  var url = site.nextUrl(chapterDoc, chapterUrl);
  if (!url) return;
  nextChapter = { url: url, promise: fetchChapter(url) };
  nextChapter.promise.catch(function() {});
}

async function goToNextChapter() {
  prefetchNextChapter();
  if (!nextChapter) { setStatus(ts('chapterDone')); return; }
  var target = nextChapter;
  nextChapter = null;
  setStatus(ts('nextLoading'));
  stopContentObserver();

  var loaded;
  try {
    loaded = await target.promise;
  } catch (e) {
    console.error('[zenTTS] next chapter:', e.message || e);
    if (e.status === 404 || e.status === 410) { setStatus(ts('nextFailed'), true); return; }
    // Anything else (e.g. a Cloudflare check): navigate normally and resume there
    try { await browser.storage.local.set({ pendingAutoplay: { url: target.url, ts: Date.now() } }); } catch (_) {}
    window.location.href = target.url;
    return;
  }

  var live = site.container(document);
  if (!live) { window.location.href = target.url; return; }
  var fresh = document.importNode(loaded.container, true);
  live.replaceWith(fresh);
  history.pushState(null, '', loaded.url);
  if (loaded.doc.title) document.title = loaded.doc.title;

  chapterDoc = loaded.doc;
  chapterUrl = new URL(loaded.url);
  prepared = false;
  highlighted = null;
  fresh.scrollIntoView({ behavior: 'smooth', block: 'start' });
  startReading(0);
}

async function checkPendingAutoplay() {
  try {
    var got = await browser.storage.local.get('pendingAutoplay');
    var p = got.pendingAutoplay;
    if (!p) return;
    await browser.storage.local.remove('pendingAutoplay');
    if (p.url !== window.location.href || Date.now() - p.ts > 120000) return;
    setStatus(ts('pressRead'));
    startReading(0);
  } catch (_) {}
}

// ---- Dynamic content (Webnovel-style infinite scroll) ----

var contentObserver = null;
var observedLength = 0;

function startContentObserver() {
  stopContentObserver();
  if (site.id !== 'webnovel' && site.id !== 'generic') return;
  var target = site.container(document) || document.body;
  var root = target.parentElement || document.body;
  observedLength = paragraphs.length;
  contentObserver = new MutationObserver(function() { checkForNewParagraphs(root); });
  contentObserver.observe(root, { childList: true, subtree: true });
}

function stopContentObserver() {
  if (contentObserver) { contentObserver.disconnect(); contentObserver = null; }
}

var checking = false;
async function checkForNewParagraphs(root) {
  if (checking) return;
  checking = true;
  try {
    var known = new Set(paragraphs.map(function(p) { return p.el; }));
    var fresh = [];
    root.querySelectorAll('p').forEach(function(el) {
      if (known.has(el) || isHidden(el)) return;
      var text = cleanText(el.innerText || el.textContent || '');
      if (text.length >= 20) fresh.push({ el: el, text: text });
    });
    if (!fresh.length) return;
    fresh = await translateParagraphs(fresh);
    var base = paragraphs.length;
    paragraphs.push.apply(paragraphs, fresh);
    var more = [];
    fresh.forEach(function(p, i) {
      splitIntoSentences(p.text).forEach(function(s) { more.push({ text: s, refIdx: base + i }); });
    });
    player.append(more);
    updatePreviewSentences();
  } finally {
    checking = false;
  }
}

// ---- Controls ----

function handlePause() {
  if (player.state === 'playing') player.pause();
  else if (player.state === 'paused') player.resume();
}

function handleStop() {
  stopContentObserver();
  player.stop();
  clearHighlight();
  flushProgress();
  setStatus(ts('stopped'));
  offerResume();
}

function handlePrev() { if (player.index >= 0) player.jump(player.index - 1); }
function handleNext() { if (player.index >= 0) player.jump(player.index + 1); }

// ---- Initialization ----

// Default enabled sites (panel.js overrides from storage after async load)
window.__tts_zen_enabled_sites = { 'wattpad.com': true, 'archiveofourown.org': true, 'fanfiction.net': true, 'webnovel.com': true, 'generic': true };

function injectPanel() {
  const host = document.createElement('div');
  host.id = 'tts-zen-host';
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  createPanel(shadow, {
    onRead: handleRead,
    onRestart: handleRestart,
    onPause: handlePause,
    onStop: handleStop,
    onPrev: handlePrev,
    onNext: handleNext,
    onRate: function(r) { player.setRate(r); }
  }).then(function() {
    offerResume();
    checkPendingAutoplay();
    pruneProgress();
  });

  window.addEventListener('pagehide', flushProgress);
  // Back/forward after an in-page chapter swap: reload so the page matches the URL
  window.addEventListener('popstate', function() { if (chapterUrl.href !== window.location.href) window.location.reload(); });
}

function tryInject() {
  if (document.body) injectPanel();
  else requestAnimationFrame(tryInject);
}

if (shouldInject()) tryInject();
