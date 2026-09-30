// zenTTS content script
// Extracts the story with a reference to each paragraph on the page, feeds the
// sentences to the player, highlights along, remembers where you were and
// continues with the next chapter in the same page.
import { Readability } from '@mozilla/readability';
import { createPanel, setStatus, setButtonsEnabled, setCounter, setPauseIcon, setResume, updatePreviewSentences,
         setDetectedLanguage, setTranslateOffer, setTranslateProgress, refreshPacks, setPickActive, setPanelVisible } from './panel.js';
import { siteFor } from './sites.js';
import { createPlayer } from './player.js';
import { textHash, loadProgress, saveProgress, flushProgress, clearProgress, pruneProgress } from './progress.js';
import * as marker from './highlight.js';

// ---- URL Guard ----
const RESTRICTED_PROTOCOLS = ['edge:', 'about:', 'file:', 'chrome:', 'moz-extension:'];

// The PDF reader (an extension page) provides its own paragraphs
var embed = window.__zentts_embed || null;

// ---- Shared state with the panel ----

window.__tts_zen_state = {
  currentVoice: 'es-ES-AlvaroNeural', localVoice: 'es_ES-davefx-medium',
  currentRate: 1.0, currentEngine: 'native', serverAvailable: false,
  lang: 'es', readLang: 'auto', speechLang: null, autoNext: true, wordHighlight: true,
  trMode: 'ask', inlineTr: true
};

function st() { return window.__tts_zen_state; }

function ts(key, arg) {
  var T = {
    es: {
      ready: 'Listo', playing: 'Reproduciendo…', paused: 'Pausado', stopped: 'Detenido',
      starting: 'Preparando lectura…', translating: 'Traduciendo…',
      trChoose: 'Elige cómo leer este texto', trDownloadingPack: 'Descargando paquete de traducción…',
      trProgress: 'traduciendo %s', trFailed: 'No se pudo traducir — leyendo en el idioma original',
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
      trChoose: 'Choose how to read this text', trDownloadingPack: 'Downloading translation pack…',
      trProgress: 'translating %s', trFailed: 'Could not translate — reading in the original language',
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

// In the PDF reader the "site" is the document itself: no next chapter
var site = embed ? {
  id: 'pdf', container: function() { return null; }, paragraphs: function() { return []; },
  chapterKey: function() { return embed.key; }, nextUrl: function() { return null; }
} : siteFor(window.location.hostname);
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
  if (embed) {
    return embed.paragraphs().map(function(p) { return { el: p.el, text: cleanText(p.text) }; })
      .filter(function(p) { return p.text.length >= 2; });
  }
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

async function remember(from, to, choice) {
  try { await browser.storage.local.set({ [choiceKey(from, to)]: choice }); } catch (_) {}
  refreshPacks();
}

// Downloads the pack(s) with the offer showing the water-fill button, then
// folds the offer away right away
async function downloadPack(info) {
  setTranslateOffer(Object.assign({}, info, { progress: 0 }));
  setStatus(ts('trDownloadingPack'));
  try {
    var dl = await browser.runtime.sendMessage({ action: 'tr_download', from: info.from, to: info.to });
    if (!dl || !dl.success) throw new Error((dl && dl.error) || 'download');
    setTranslateProgress(1);
    await new Promise(function(r) { setTimeout(r, 300); });
  } finally {
    setTranslateOffer(null);
    refreshPacks();
  }
}

// Decides how this chapter is read: returns { mode: null | 'offline' | 'online', from, to }.
// "Translate with" in the settings wins; with "Ask", a choice remembered for
// this pair of languages, and otherwise the offer in the panel.
async function decideLanguage(paras) {
  var sample = paras.map(function(p) { return p.text; }).join('\n').slice(0, 2500);
  var from = await detectLanguage(sample);
  var to = targetLanguage();
  var none = { mode: null, from: from, to: to };
  setDetectedLanguage(from);
  if (!from || !to || from === to) return none;
  var mode = st().trMode || 'ask';
  if (mode === 'never') return none;

  var status = await browser.runtime.sendMessage({ action: 'tr_status', from: from, to: to }).catch(function() { return null; });
  if (status && status.needed === false) return none;
  var ready = !!(status && status.ready);
  var supported = !!(status && status.supported);
  var info = { from: from, to: to, supported: supported, sizeMB: status && status.sizeMB,
               pivot: status && status.pairs && status.pairs.length > 1 ? status.pairs : null };
  var online = await serverUp();
  info.online = online;

  try {
    if (mode === 'offline') {
      if (ready) return { mode: 'offline', from: from, to: to };
      if (supported) { await downloadPack(info); return { mode: 'offline', from: from, to: to }; }
      return online ? { mode: 'online', from: from, to: to } : none;
    }
    if (mode === 'online') {
      if (online) return { mode: 'online', from: from, to: to };
      return ready ? { mode: 'offline', from: from, to: to } : none;
    }

    // "Ask"
    if (ready) return { mode: 'offline', from: from, to: to };
    var remembered = (await browser.storage.local.get(choiceKey(from, to)))[choiceKey(from, to)];
    if (remembered === 'original') return none;
    if (remembered === 'online' && online) return { mode: 'online', from: from, to: to };
    if (remembered === 'offline' && supported) { await downloadPack(info); return { mode: 'offline', from: from, to: to }; }
    if (!supported && !online) return none;

    var choice = await askTranslation(info);
    if (choice === 'original') { setTranslateOffer(null); await remember(from, to, 'original'); return none; }
    if (choice === 'online') { setTranslateOffer(null); await remember(from, to, 'online'); return { mode: 'online', from: from, to: to }; }
    await remember(from, to, 'offline');
    await downloadPack(info);
    return { mode: 'offline', from: from, to: to };
  } catch (e) {
    console.error('[zenTTS] translation:', e.message || e);
    setTranslateOffer(null);
    setStatus(ts('trFailed'), true);
    return none;
  }
}

// ---- Progressive translation ----
// The first few paragraphs are translated before reading starts; the rest
// follows in the background in small batches and is appended to the queue.

var FIRST_CHARS = 1200;
var BATCH = 8;
var background = null;   // { gen, done, progress, waiters[] }
var chapterGen = 0;
var chapterEls = new Set();   // page paragraphs of the chapter, translated or not yet

function leadCount(paras) {
  var n = 0, chars = 0;
  while (n < paras.length && (n === 0 || chars < FIRST_CHARS)) { chars += paras[n].text.length; n++; }
  return n;
}

function notifyWaiters() {
  if (!background) return;
  var w = background.waiters;
  background.waiters = [];
  w.forEach(function(fn) { fn(); });
}

// Resolves when more sentences arrive or the background translation ends
function moreSentences() {
  if (!background || background.done) return Promise.resolve();
  return new Promise(function(r) { background.waiters.push(r); });
}

async function translateRest(rest, gen) {
  var plan = chapterTranslation;
  var total = rest.length;
  var bg = background = { gen: gen, done: false, progress: 0, waiters: [] };
  try {
    for (var k = 0; k < rest.length; k += BATCH) {
      // Offline translation and the Piper voice share the CPU: with the local
      // voice, only stay a couple of batches ahead of what is being read
      while (plan.mode === 'offline' && st().currentEngine === 'local' && player.state === 'playing' &&
             gen === chapterGen && paragraphs.length - readingParagraph() > BATCH * 2) {
        await nextSentenceTick();
      }
      if (gen !== chapterGen) return;
      var batch = rest.slice(k, k + BATCH);
      var out;
      try { out = await translateWith(plan.mode, batch, plan.from, plan.to); }
      catch (e) { console.error('[zenTTS] translation:', e.message || e); out = batch; }
      if (gen !== chapterGen) return;
      var base = paragraphs.length;
      paragraphs.push.apply(paragraphs, out);
      var more = [];
      out.forEach(function(p, i) { more.push.apply(more, sentencesOf(p.text, base + i)); });
      player.append(more);
      window.__tts_zen_last_text = paragraphs.map(function(p) { return p.text; }).join('\n\n');
      bg.progress = Math.min(1, (k + batch.length) / total);
      if (player.state === 'playing') setStatus(playingStatus());
      if (player.index >= 0) setCounter(player.index + 1, sentences.length);
      updatePreviewSentences();
      notifyWaiters();
    }
  } finally {
    bg.done = true;
    notifyWaiters();
    if (gen === chapterGen && player.state === 'playing') setStatus(playingStatus());
  }
}

function readingParagraph() {
  var s = sentences[player.index];
  return s ? s.refIdx : 0;
}

var sentenceTicks = [];
function nextSentenceTick() {
  return new Promise(function(r) { sentenceTicks.push(r); setTimeout(r, 4000); });
}

function playingStatus() {
  var base = engineNote || ts('playing');
  if (background && !background.done && background.gen === chapterGen) {
    return base + ' · ' + ts('trProgress', Math.round(background.progress * 100) + ' %');
  }
  return base;
}

// New paragraphs of an infinite-scroll page follow the chapter's decision
async function translateMore(paras) {
  if (!chapterTranslation) return paras;
  try { return await translateWith(chapterTranslation.mode, paras, chapterTranslation.from, chapterTranslation.to); }
  catch (_) { return paras; }
}

// ---- Page highlight ----
// highlight.js marks the sentence and the spoken word on the page itself

function clearHighlight() { marker.clear(); marker.hideCaption(); }

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
    var ticks = sentenceTicks; sentenceTicks = [];
    ticks.forEach(function(r) { r(); });
    var s = sentences[i];
    setCounter(i + 1, sentences.length);
    currentWord = -1;
    var el = s && paragraphs[s.refIdx] ? paragraphs[s.refIdx].el : null;
    marker.showSentence(el, s ? s.text : '', s ? s.words : [], s ? s.hint : 0);
    // Translated text: show it next to the original paragraph
    if (chapterTranslation && st().inlineTr !== false && s && el) marker.showCaption(el, s.text, s.words);
    else marker.hideCaption();
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
    marker.showCaptionWord(k);
  },
  onState: function(state) {
    var playing = state === 'playing';
    var active = state !== 'idle';
    setButtonsEnabled({ read: !active, pause: active, stop: active, prev: active, next: active });
    setPauseIcon(playing);
    if (state === 'playing') setStatus(playingStatus());
    if (state === 'paused') setStatus(ts('paused'));
  },
  onEnd: async function() {
    // Caught up with the background translation: continue when it catches up
    if (background && !background.done && background.gen === chapterGen) {
      var at = sentences.length;
      setStatus(ts('translating'));
      await moreSentences();
      if (sentences.length > at) { player.start(at, st().currentEngine || 'native'); return; }
    }
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

  var gen = ++chapterGen;
  chapterEls = new Set(paras.map(function(p) { return p.el; }));
  background = null;
  chapterTranslation = null;
  st().speechLang = null;
  chapterKey = site.chapterKey(chapterUrl);
  chapterHash = textHash(paras.map(function(p) { return p.text; }).join('\n'));

  var plan = await decideLanguage(paras);
  if (gen !== chapterGen) return false;
  var rest = [];
  if (plan.mode) {
    var n = leadCount(paras);
    setStatus(ts('translating'));
    try {
      paragraphs = await translateWith(plan.mode, paras.slice(0, n), plan.from, plan.to);
      chapterTranslation = plan;
      rest = paras.slice(n);
    } catch (e) {
      console.error('[zenTTS] translation:', e.message || e);
      setStatus(ts('trFailed'), true);
      paragraphs = paras;
    }
  } else {
    paragraphs = paras;
  }
  if (gen !== chapterGen) return false;
  // The voice follows the language that is actually read
  st().speechLang = chapterTranslation ? plan.to : plan.from;
  setDetectedLanguage(plan.from);

  sentences = buildSentences(paragraphs);
  window.__tts_zen_sentences = sentences;
  window.__tts_zen_last_text = paragraphs.map(function(p) { return p.text; }).join('\n\n');
  player.load(sentences);
  prepared = true;
  if (rest.length) translateRest(rest, gen);
  return true;
}

async function startReading(fromIndex) {
  setStatus(ts('starting'));
  if (!prepared && !(await prepareChapter())) {
    if (!prepared) setStatus(ts('noTextFound'), true);
    return;
  }
  startContentObserver();
  engineNote = null;
  // Resuming further than what is translated so far: wait for it
  while (fromIndex >= sentences.length && background && !background.done) {
    setStatus(ts('translating'));
    await moreSentences();
  }
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
    if (resumeAt.hash === chapterHash && resumeAt.index < Math.max(sentences.length, resumeAt.total)) from = resumeAt.index;
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
    var known = new Set(chapterEls);
    paragraphs.forEach(function(p) { known.add(p.el); });
    var fresh = [];
    root.querySelectorAll('p').forEach(function(el) {
      if (known.has(el) || isHidden(el)) return;
      var text = cleanText(el.innerText || el.textContent || '');
      if (text.length >= 20) fresh.push({ el: el, text: text });
    });
    if (!fresh.length) return;
    fresh.forEach(function(p) { chapterEls.add(p.el); });
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

var restartOnResume = false;   // voice or engine changed while paused

function handlePause() {
  if (player.state === 'playing') player.pause();
  else if (player.state === 'paused') {
    if (restartOnResume) { restartOnResume = false; player.start(player.index, st().currentEngine || 'native'); }
    else player.resume();
  }
}

// A new voice or engine applies right away: the current sentence starts over
// with it (audio already generated with the old voice is dropped)
function applyVoiceChange() {
  if (player.state === 'playing') player.start(player.index, st().currentEngine || 'native');
  else if (player.state === 'paused') restartOnResume = true;
}

function handleStop() {
  restartOnResume = false;
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
// The panel only appears once it is turned on for this tab with the toolbar
// button (or the site is set to always open it).

var panelReady = null;

function injectPanel() {
  const host = document.createElement('div');
  host.id = 'tts-zen-host';
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  return createPanel(shadow, {
    onRead: handleRead,
    onRestart: handleRestart,
    onPause: handlePause,
    onStop: handleStop,
    onPrev: handlePrev,
    onNext: handleNext,
    onRate: function(r) { player.setRate(r); },
    onPick: togglePick,
    onTranslate: onTranslateChoice,
    onVoice: applyVoiceChange,
    onEngine: applyVoiceChange,
    onInlineTr: function(on) {
      if (!on) { marker.hideCaption(); return; }
      var s = sentences[player.index];
      if (chapterTranslation && s && player.state !== 'idle' && paragraphs[s.refIdx]) marker.showCaption(paragraphs[s.refIdx].el, s.text, s.words);
    },
    // A different "read in" language applies from the next reading
    onReadLang: function() { if (player.state === 'idle') { prepared = false; st().speechLang = null; } }
  }).then(function() {
    offerResume();
    checkPendingAutoplay();
    pruneProgress();
  });
}

function whenBody() {
  return new Promise(function(r) {
    (function wait() { if (document.body) r(); else requestAnimationFrame(wait); })();
  });
}

async function showPanel() {
  if (!panelReady) {
    panelReady = whenBody().then(injectPanel);
    window.addEventListener('pagehide', flushProgress);
    // Back/forward after an in-page chapter swap: reload so the page matches the URL
    window.addEventListener('popstate', function() { if (chapterUrl.href !== window.location.href) window.location.reload(); });
  } else {
    await panelReady;
    setPanelVisible(true);
  }
}

async function hidePanel() {
  if (!panelReady) return;
  await panelReady;
  endPick();
  if (player.state !== 'idle') handleStop();
  setPanelVisible(false);
}

browser.runtime.onMessage.addListener(function(msg) {
  if (msg && msg.action === 'panel_toggle') { if (msg.on) showPanel(); else hidePanel(); }
});

async function boot() {
  if (embed) { showPanel(); return; }
  if (RESTRICTED_PROTOCOLS.includes(window.location.protocol) || window.top !== window) return;
  var state = null;
  try { state = await browser.runtime.sendMessage({ action: 'panel_state' }); } catch (_) {}
  if (state && state.on) showPanel();
}

boot();
