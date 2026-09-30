// zenTTS content script
// Extracts the story with a reference to each paragraph on the page, feeds the
// sentences to the player, highlights along, remembers where you were and
// continues with the next chapter in the same page.
import { Readability } from '@mozilla/readability';
import { createPanel, setStatus, setButtonsEnabled, setCounter, setPauseIcon, setResume, updatePreviewSentences,
         setDetectedLanguage, setTranslateOffer, setTranslateProgress, refreshPacks, setPickActive } from './panel.js';
import { siteFor } from './sites.js';
import { createPlayer } from './player.js';
import { textHash, loadProgress, saveProgress, flushProgress, clearProgress, pruneProgress } from './progress.js';
import * as marker from './highlight.js';

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
  lang: 'es', readLang: 'auto', speechLang: null, autoNext: true, wordHighlight: true
};

function st() { return window.__tts_zen_state; }

function ts(key, arg) {
  var T = {
    es: {
      ready: 'Listo', playing: 'Reproduciendo…', paused: 'Pausado', stopped: 'Detenido',
      starting: 'Preparando lectura…', translating: 'Traduciendo…',
      trChoose: 'Elige cómo leer este texto', trFailed: 'No se pudo traducir — leyendo en el idioma original',
      picking: 'Haz clic en la frase por la que quieres empezar · Esc para cancelar',
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
      trChoose: 'Choose how to read this text', trFailed: 'Could not translate — reading in the original language',
      picking: 'Click the sentence you want to start from · Esc to cancel',
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

function wordsOf(text) {
  var out = [], re = /\S+/g, m;
  while ((m = re.exec(text))) out.push({ start: m.index, text: m[0] });
  return out;
}

// Sentences with their words and where they start in the paragraph (counted
// without whitespace, which is how highlight.js finds them on the page)
function sentencesOf(text, refIdx) {
  var hint = 0;
  return splitIntoSentences(text).map(function(s) {
    var item = { text: s, refIdx: refIdx, words: wordsOf(s), hint: hint };
    hint += marker.compact(s).length;
    return item;
  });
}

function buildSentences(paras) {
  var list = [];
  paras.forEach(function(p, i) { list.push.apply(list, sentencesOf(p.text, i)); });
  return list;
}

// ---- Language: detect, decide, translate ----

function normLang(code) {
  if (!code) return null;
  var c = String(code).toLowerCase().replace('-', '_');
  if (c === 'zh_hant' || c === 'zh_tw' || c === 'zh_hk') return 'zh_hant';
  return c.split('_')[0] || null;
}

// Firefox's own detector (CLD2); the page's lang attribute as a fallback
async function detectLanguage(text) {
  try {
    var r = await browser.i18n.detectLanguage(text);
    var top = r && r.languages && r.languages[0];
    if (top && (r.isReliable || top.percentage >= 80) && top.language !== 'und') return normLang(top.language);
  } catch (_) {}
  return normLang(document.documentElement.lang);
}

// Language the user wants to listen in, or null for "original language"
function targetLanguage() {
  var want = st().readLang || 'auto';
  if (want === 'original') return null;
  if (want === 'auto') {
    try { return normLang(browser.i18n.getUILanguage()); } catch (_) { return normLang(st().lang); }
  }
  return normLang(want);
}

var chapterTranslation = null;   // { mode: 'offline' | 'online', from, to }
var pendingOffer = null;         // resolves the translation offer shown in the panel

function withTexts(paras, texts) {
  return paras.map(function(p, i) { return { el: p.el, text: cleanText(texts[i] || p.text) }; });
}

async function translateWith(mode, paras, from, to) {
  setStatus(ts('translating'));
  var texts = paras.map(function(p) { return p.text; });
  var resp = await browser.runtime.sendMessage(mode === 'offline'
    ? { action: 'tr_translate', from: from, to: to, texts: texts }
    : { action: 'translate', from: from, to: to, texts: texts });
  if (!resp || !Array.isArray(resp.texts) || resp.texts.length !== paras.length) throw new Error((resp && resp.error) || 'translate');
  return withTexts(paras, resp.texts);
}

async function serverUp() {
  try { var r = await browser.runtime.sendMessage({ action: 'health' }); return !!(r && r.success); } catch (_) { return false; }
}

function choiceKey(from, to) { return 'trChoice:' + from + '-' + to; }

// Shows the offer in the panel and waits for "download" / "online" / "original"
function askTranslation(info) {
  setTranslateOffer(info);
  setStatus(ts('trChoose'));
  return new Promise(function(resolve) { pendingOffer = resolve; });
}

function onTranslateChoice(choice) {
  if (pendingOffer) { var r = pendingOffer; pendingOffer = null; r(choice); }
}

// Returns the paragraphs in the language to be read, translating if needed
async function resolveLanguage(paras) {
  chapterTranslation = null;
  var sample = paras.map(function(p) { return p.text; }).join('\n').slice(0, 2500);
  var from = await detectLanguage(sample);
  var to = targetLanguage();
  st().speechLang = from;
  setDetectedLanguage(from);
  try {
    if (!from || !to || from === to) return paras;

    var status = await browser.runtime.sendMessage({ action: 'tr_status', from: from, to: to }).catch(function() { return null; });
    if (status && status.needed === false) return paras;
    if (status && status.ready) return await useTranslation('offline', paras, from, to);

    var remembered = (await browser.storage.local.get(choiceKey(from, to)))[choiceKey(from, to)];
    if (remembered === 'original') return paras;
    var online = await serverUp();
    if (remembered === 'online' && online) return await useTranslation('online', paras, from, to);
    var supported = !!(status && status.supported);
    if (!supported && !online) return paras;

    var choice = await askTranslation({
      from: from, to: to, supported: supported, online: online,
      sizeMB: status && status.sizeMB, pivot: status && status.pairs && status.pairs.length > 1 ? status.pairs : null
    });
    if (choice === 'original') {
      await browser.storage.local.set({ [choiceKey(from, to)]: 'original' });
      return paras;
    }
    if (choice === 'online') {
      await browser.storage.local.set({ [choiceKey(from, to)]: 'online' });
      return await useTranslation('online', paras, from, to);
    }
    // download the pack(s), then translate offline
    setTranslateProgress(0);
    var dl = await browser.runtime.sendMessage({ action: 'tr_download', from: from, to: to });
    if (!dl || !dl.success) throw new Error((dl && dl.error) || 'download');
    refreshPacks();
    return await useTranslation('offline', paras, from, to);
  } catch (e) {
    console.error('[zenTTS] translation:', e.message || e);
    setStatus(ts('trFailed'), true);
    st().speechLang = from;
    return paras;
  } finally {
    setTranslateOffer(null);
    setDetectedLanguage(st().speechLang ? from : null);
  }
}

async function useTranslation(mode, paras, from, to) {
  var out = await translateWith(mode, paras, from, to);
  chapterTranslation = { mode: mode, from: from, to: to };
  st().speechLang = to;
  return out;
}

// New paragraphs of an infinite-scroll page follow the chapter's decision
async function translateMore(paras) {
  if (!chapterTranslation) return paras;
  try { return await translateWith(chapterTranslation.mode, paras, chapterTranslation.from, chapterTranslation.to); }
  catch (_) { return paras; }
}


// ---- Page highlight ----
// highlight.js marks the sentence and the spoken word on the page itself

function clearHighlight() { marker.clear(); }

var currentWord = -1;

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
    var lang = s.speechLang || normLang(document.documentElement.lang) || 'es';
    return { voice: s.currentVoice, localVoice: s.localVoice, rate: s.currentRate || 1, lang: lang };
  },
  onSentence: function(i) {
    var s = sentences[i];
    setCounter(i + 1, sentences.length);
    currentWord = -1;
    marker.showSentence(s && paragraphs[s.refIdx] ? paragraphs[s.refIdx].el : null, s ? s.text : '', s ? s.words : [], s ? s.hint : 0);
    highlightPreview(i);
    saveProgress(chapterKey, { index: i, total: sentences.length, hash: chapterHash, title: document.title });
    if (i >= sentences.length * 0.8) prefetchNextChapter();
  },
  onWord: function(i, offset) {
    if (st().wordHighlight === false) return;
    var words = sentences[i] && sentences[i].words;
    if (!words || !words.length) return;
    var k = 0;
    while (k + 1 < words.length && words[k + 1].start <= offset) k++;
    if (k === currentWord) return;
    currentWord = k;
    marker.showWord(k);
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
  paragraphs = await resolveLanguage(paras);
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
  clearHighlight();
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
    fresh = await translateMore(fresh);
    var base = paragraphs.length;
    paragraphs.push.apply(paragraphs, fresh);
    var more = [];
    fresh.forEach(function(p, i) { more.push.apply(more, sentencesOf(p.text, base + i)); });
    player.append(more);
    updatePreviewSentences();
  } finally {
    checking = false;
  }
}

// ---- "Choose where to start" ----
// Only after pressing the panel button: hovering previews the sentence, a
// click starts reading there, Esc (or the button again) cancels.

var picking = false;

function pickStyle(on) {
  var id = 'zentts-pick-style';
  var el = document.getElementById(id);
  if (on && !el) {
    el = document.createElement('style');
    el.id = id;
    el.textContent = 'html.zentts-picking, html.zentts-picking * { cursor: crosshair !important; }';
    (document.head || document.documentElement).appendChild(el);
  }
  document.documentElement.classList.toggle('zentts-picking', on);
}

function fromPanel(e) {
  var host = document.getElementById('tts-zen-host');
  return host && e.composedPath && e.composedPath().includes(host);
}

function sentenceUnder(e) {
  var i = marker.sentenceAtPoint(e.clientX, e.clientY, paragraphs, sentences);
  return i;
}

function onPickMove(e) {
  if (fromPanel(e)) { marker.clearPick(); return; }
  var i = sentenceUnder(e);
  if (i < 0) { marker.clearPick(); return; }
  var s = sentences[i];
  marker.showPick(paragraphs[s.refIdx].el, s.text, s.hint);
}

function onPickClick(e) {
  if (fromPanel(e)) return;
  e.preventDefault();
  e.stopPropagation();
  var i = sentenceUnder(e);
  endPick();
  if (i >= 0) {
    resumeAt = null;
    setResume(null);
    player.start(i, st().currentEngine || 'native');
  }
}

function onPickKey(e) {
  if (e.key === 'Escape') { e.preventDefault(); endPick(); setStatus(ts('ready')); }
}

function endPick() {
  if (!picking) return;
  picking = false;
  setPickActive(false);
  pickStyle(false);
  marker.clearPick();
  document.removeEventListener('mousemove', onPickMove, true);
  document.removeEventListener('click', onPickClick, true);
  document.removeEventListener('keydown', onPickKey, true);
}

async function togglePick() {
  if (picking) { endPick(); setStatus(ts('ready')); return; }
  if (!prepared) {
    setStatus(ts('starting'));
    if (!(await prepareChapter())) { setStatus(ts('noTextFound'), true); return; }
  }
  if (player.state === 'playing') player.pause();
  picking = true;
  setPickActive(true);
  pickStyle(true);
  setStatus(ts('picking'));
  document.addEventListener('mousemove', onPickMove, true);
  document.addEventListener('click', onPickClick, true);
  document.addEventListener('keydown', onPickKey, true);
}

// Download progress for translation packs comes from the background page
browser.runtime.onMessage.addListener(function(msg) {
  if (msg && msg.action === 'tr_progress') setTranslateProgress(msg.fraction);
});

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
    onRate: function(r) { player.setRate(r); },
    onPick: togglePick,
    onTranslate: onTranslateChoice,
    // A different "read in" language applies from the next reading
    onReadLang: function() { if (player.state === 'idle') prepared = false; }
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
