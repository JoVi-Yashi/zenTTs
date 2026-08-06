// TTS-zen Content Script
// Injects floating panel, extracts text with DOM references for page highlighting
import { Readability } from '@mozilla/readability';
import { createPanel, setStatus, setButtonsEnabled, setCounter, setPauseIcon } from './panel.js';

// ---- URL Guard ----
const RESTRICTED_PROTOCOLS = ['edge:', 'about:', 'file:', 'chrome:', 'moz-extension:'];

function shouldInject() {
  var proto = window.location.protocol;
  if (RESTRICTED_PROTOCOLS.includes(proto)) return false;

  var sites = window.__tts_zen_enabled_sites || {};
  var host = window.location.hostname;

  // Check specific sites first
  for (var siteId in sites) {
    if (siteId === 'generic') continue;
    if (host.includes(siteId)) {
      return sites[siteId] !== false;
    }
  }

  // No specific match — use generic setting
  return sites['generic'] !== false;
}

// ---- Text Extraction with DOM references ----

async function waitForElement(selector, timeout = 10000) {
  const el = document.querySelector(selector);
  if (el) return el;
  return new Promise((resolve) => {
    const start = Date.now();
    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) { observer.disconnect(); resolve(found); }
      else if (Date.now() - start > timeout) { observer.disconnect(); resolve(null); }
    });
    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  });
}

function extractTextWithRefs() {
  const result = { text: '', refs: [] };

  // Try site-specific extractors first — they return text with paragraph breaks
  for (const site of SITE_EXTRACTORS) {
    if (site.test && site.test()) {
      const text = site.extract();
      if (text && text.trim().length > 50) {
        return { text, refs: [] };
      }
    }
  }

  // Generic: map visible paragraphs
  return mapParagraphsToText();
}

function mapParagraphsToText() {
  const result = { text: '', refs: [] };

  // Find all visible text-bearing elements
  const candidates = document.querySelectorAll(
    'p, pre, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div.story-text p, .userstuff p, .chapter-content p'
  );

  if (candidates.length === 0) {
    // Fallback: use body text
    const body = document.body;
    if (body && body.innerText) {
      result.text = body.innerText;
      result.refs.push({ el: body, start: 0, end: body.innerText.length });
      return result;
    }
    return null;
  }

  let offset = 0;
  for (const el of candidates) {
    // Skip hidden elements
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') continue;

    const txt = el.textContent.trim();
    if (txt.length < 2) continue; // skip empty/near-empty

    result.text += txt + '\n\n';
    const start = offset;
    const end = start + txt.length;
    result.refs.push({ el, start, end });
    offset = end + 2; // +2 for \n\n
  }

  if (!result.text.trim()) return null;
  result.text = result.text.trim();
  return result;
}

// ---- Site-Specific Extractors ----

const SITE_EXTRACTORS = [
  {
    test: () => window.location.hostname.includes('wattpad.com'),
    extract: () => {
      // Story content is in: .panel.panel-reading (NOT .text-center) > pre > p[data-p-id]
      // The header panel has .text-center class and contains metadata, not story
      const paragraphs = document.querySelectorAll(
        '.panel.panel-reading:not(.text-center) pre p[data-p-id]'
      );
      if (paragraphs.length === 0) return null;

      const parts = [];
      for (const p of paragraphs) {
        const txt = p.textContent.trim();
        if (txt.length > 20) parts.push(txt);
      }
      return parts.length > 0 ? parts.join('\n\n') : null;
    }
  },
  {
    test: () => window.location.hostname.includes('archiveofourown.org'),
    extract: () => {
      const chapter = document.querySelector('#chapters .userstuff');
      return chapter?.textContent || null;
    }
  },
  {
    test: () => window.location.hostname.includes('fanfiction.net'),
    extract: () => {
      const story = document.querySelector('.storytext, #storytext');
      return story?.textContent || null;
    }
  },
  {
    test: () => window.location.hostname.includes('webnovel.com'),
    extract: () => {
      const content = document.querySelector('.cha-content, .chapter-content, .read-content, [class*="cha-words"]');
      return content?.textContent || null;
    }
  },
];

// ---- DOM Highlighting ----

let currentHighlight = null;

function highlightOnPage(refs, charOffset, charLength) {
  // Remove previous highlight
  if (currentHighlight) {
    for (const el of currentHighlight) {
      el.style.removeProperty('background');
      el.style.removeProperty('outline');
      el.style.removeProperty('border-radius');
    }
    currentHighlight = null;
  }

  // Find which ref(s) contain this offset range
  const endOffset = charOffset + charLength;
  const matched = [];
  for (const ref of refs) {
    if (ref.start <= endOffset && ref.end >= charOffset) {
      matched.push(ref.el);
    }
  }

  if (matched.length > 0) {
    for (const el of matched) {
      el.style.background = 'rgba(167, 139, 250, 0.15)';
      el.style.outline = '2px solid rgba(167, 139, 250, 0.4)';
      el.style.borderRadius = '4px';
      el.style.transition = 'background 0.3s ease, outline 0.3s ease';
    }
    matched[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    currentHighlight = matched;
  }
}

function clearHighlight() {
  if (currentHighlight) {
    for (const el of currentHighlight) {
      el.style.removeProperty('background');
      el.style.removeProperty('outline');
      el.style.removeProperty('border-radius');
    }
    currentHighlight = null;
  }
}

// ---- Server TTS Player (edge-tts) ----

var serverAudio = null;
var serverSentences = [];

async function startServerPlayback(text) {
  stopSpeech();
  var st = window.__tts_zen_state || {};
  var voice = st.currentVoice || 'es-ES-AlvaroNeural';
  var rate = st.currentRate || 1.0;
  var rateStr = rate >= 1.0 ? '+' + Math.round((rate - 1) * 100) + '%' : '-' + Math.round((1 - rate) * 100) + '%';

  setStatus(ts('connecting'));
  try {
    var resp = await browser.runtime.sendMessage({ action: 'read_page_sync', text: text, voice: voice, rate: rateStr });
    if (!resp.success) throw new Error(ts('serverError'));
    if (!resp.sentences || resp.sentences.length === 0) throw new Error(ts('noTiming'));

    serverSentences = resp.sentences;
    window.__tts_zen_sentences = serverSentences;
    window.__tts_zen_state.serverAvailable = true;

    // Build sentenceData for highlighting
    sentenceData = serverSentences.map(function(s) { return { text: s.text, start: s.start, end: s.end }; });

    // Create audio from base64
    var audioBytes = Uint8Array.from(atob(resp.audio), function(c) { return c.charCodeAt(0); });
    var blob = new Blob([audioBytes], { type: 'audio/mpeg' });
    var url = URL.createObjectURL(blob);

    if (serverAudio) {
      serverAudio.pause();
      URL.revokeObjectURL(serverAudio.src);
    }

    serverAudio = new Audio(url);
    serverAudio.playbackRate = rate;

    currentSentenceIdx = 0;
    isSpeaking = true;
    setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
    setPauseIcon(true);

    serverAudio.ontimeupdate = function() {
      if (!isSpeaking || serverSentences.length === 0) return;
      var t = serverAudio.currentTime;
      // Find current sentence
      for (var i = currentSentenceIdx; i < serverSentences.length; i++) {
        if (t >= serverSentences[i].start && t < serverSentences[i].end) {
          if (i !== currentSentenceIdx) {
            currentSentenceIdx = i;
            updateHighlightServer(i);
          }
          break;
        }
      }
    };

    serverAudio.onended = function() {
      isSpeaking = false;
      setStatus(ts('ready'));
      setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
      setPauseIcon(false);
    };

    serverAudio.onerror = function() {
      setStatus(ts('audioError'), true);
      setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
      isSpeaking = false;
    };

    await serverAudio.play();
    setStatus(ts('serverMode'));
  } catch (e) {
    window.__tts_zen_state.serverAvailable = false;
    // Auto-fallback to native mode
    setStatus(ts('noServer') + ' — usando modo Nativo', true);
    startSpeechPlayback(text);
  }
}

function updateHighlightServer(idx) {
  if (idx < 0 || idx >= serverSentences.length) return;
  setCounter(idx + 1, serverSentences.length);

  // Update preview overlay
  var host = document.getElementById('tts-zen-host');
  if (host && host.shadowRoot) {
    var overlay = host.shadowRoot.getElementById('tts-zen-preview-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      refreshPreviewContent(host.shadowRoot);
      var prevActive = host.shadowRoot.querySelector('#tts-zen-preview-content .sentence.active');
      if (prevActive) { prevActive.classList.remove('active'); prevActive.classList.add('played'); }
      var prevEl = host.shadowRoot.getElementById('tts-zen-preview-s-' + idx);
      if (prevEl) {
        prevEl.classList.add('active');
        prevEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // Page-level highlight
  var s = serverSentences[idx];
  for (var i = 0; i < extractedRefs.length; i++) {
    var ref = extractedRefs[i];
    var refText = ref.el.textContent.trim();
    var pos = refText.indexOf(s.text);
    if (pos !== -1) {
      highlightOnPage([ref], pos, s.text.length);
      return;
    }
  }
}

// ---- SpeechSynthesis Player ----

let sentenceData = [];
let currentSentenceIdx = -1;
let extractedRefs = [];
let isSpeaking = false;
let isPaused = false;

function splitIntoSentences(text) {
  // Split by sentence-ending punctuation, keeping delimiters
  var parts = text.match(/[^.!?…\n]+[.!?…]*(\n|$)?/g) || [text];
  return parts.map(function(p) { return p.trim(); }).filter(function(p) { return p.length > 0; });
}

function stopSpeech() {
  speechSynthesis.cancel();
  if (serverAudio) {
    serverAudio.pause();
    URL.revokeObjectURL(serverAudio.src);
    serverAudio = null;
  }
  isSpeaking = false;
  isPaused = false;
  currentSentenceIdx = -1;
  clearHighlight();
  window.__tts_zen_sentences = [];
}

function speakSentence(idx) {
  if (idx >= sentenceData.length) {
    // Finished all sentences
    setStatus(ts('ready'));
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    setPauseIcon(false);
    isSpeaking = false;
    return;
  }

  currentSentenceIdx = idx;
  var text = sentenceData[idx].text;
  var st = window.__tts_zen_state || {};
  var rate = st.currentRate || 1.0;

  var utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.lang = 'es-ES';

  // Try to find a matching voice
  var selectedVoice = st.currentVoice || '';
  if (selectedVoice && _nativeVoices.length > 0) {
    var match = _nativeVoices.find(function(v) { return v.name === selectedVoice || v.voiceURI === selectedVoice; });
    if (match) utterance.voice = match;
  }

  utterance.onstart = function() {
    updateHighlight(idx);
    setCounter(idx + 1, sentenceData.length);
    setStatus(ts('playing'));
  };

  utterance.onend = function() {
    if (!isSpeaking) return;
    // Don't chain if paused — wait for resume
    if (isPaused) {
      isSpeaking = false;
      return;
    }
    speakSentence(idx + 1);
  };

  utterance.onerror = function(e) {
    if (e.error === 'canceled' || e.error === 'interrupted') return;
    setStatus(ts('voiceError') + ': ' + e.error, true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    isSpeaking = false;
  };

  speechSynthesis.speak(utterance);
}

function startSpeechPlayback(text) {
  stopSpeech();

  // Split into sentences and build data array
  var rawSentences = splitIntoSentences(text);
  sentenceData = rawSentences.map(function(s, i) {
    return { text: s, start: i, end: i + 1 };
  });
  window.__tts_zen_sentences = sentenceData;

  isSpeaking = true;
  setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
  setPauseIcon(true);

  speakSentence(0);
}

function jumpToSentence(idx) {
  if (idx < 0 || idx >= sentenceData.length) return;
  speechSynthesis.cancel();
  isSpeaking = true;
  setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
  setPauseIcon(true);
  speakSentence(idx);
}

function updateHighlight(idx) {
  if (idx < 0 || idx >= sentenceData.length) return;
  var s = sentenceData[idx];

  // Update preview popup highlight if open
  var host = document.getElementById('tts-zen-host');
  if (host && host.shadowRoot) {
    var overlay = host.shadowRoot.getElementById('tts-zen-preview-overlay');
    if (overlay && !overlay.classList.contains('hidden')) {
      refreshPreviewContent(host.shadowRoot);
      var prevActive = host.shadowRoot.querySelector('#tts-zen-preview-content .sentence.active');
      if (prevActive) { prevActive.classList.remove('active'); prevActive.classList.add('played'); }
      var prevEl = host.shadowRoot.getElementById('tts-zen-preview-s-' + idx);
      if (prevEl) {
        prevEl.classList.add('active');
        prevEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  // Page-level highlight
  for (var i = 0; i < extractedRefs.length; i++) {
    var ref = extractedRefs[i];
    var refText = ref.el.textContent.trim();
    var pos = refText.indexOf(s.text);
    if (pos !== -1) {
      highlightOnPage([ref], pos, s.text.length);
      setCounter(idx + 1, sentenceData.length);
      return;
    }
  }
  setCounter(idx + 1, sentenceData.length);
}

function refreshPreviewContent(shadow) {
  var content = shadow.getElementById('tts-zen-preview-content');
  if (!content) return;
  var sentences = window.__tts_zen_sentences || [];
  if (sentences.length === 0) return;
  content.replaceChildren();
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
}

async function dispatchReadPage(extractFn) {
  var result = extractFn();
  if (!result || !result.text) {
    setStatus(ts('noTextFound'), true);
    return;
  }

  extractedRefs = result.refs || [];
  var text = result.text;
  window.__tts_zen_last_text = text;

  setStatus(ts('starting'));

  var st = window.__tts_zen_state || {};
  if (st.currentEngine === 'server') {
    await startServerPlayback(text);
    return;
  }
  startSpeechPlayback(text);
}

// ---- Audio Controls ----

function handlePause() {
  if (!isSpeaking) return;
  var st = window.__tts_zen_state || {};
  if (st.currentEngine === 'server' && serverAudio) {
    if (isPaused) {
      serverAudio.play();
      isPaused = false;
      setStatus(ts('serverMode'));
      setPauseIcon(true);
    } else {
      serverAudio.pause();
      isPaused = true;
      setStatus(ts('paused'));
      setPauseIcon(false);
    }
    return;
  }
  if (isPaused) {
    speechSynthesis.resume();
    isPaused = false;
    setStatus(ts('playing'));
    setPauseIcon(true);
  } else {
    speechSynthesis.pause();
    isPaused = true;
    setStatus(ts('paused'));
    setPauseIcon(false);
  }
}

function handleStop() {
  stopSpeech();
  setStatus(ts('stopped'));
  setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
  setPauseIcon(false);
}

function handlePrev() {
  if (!sentenceData.length) return;
  var st = window.__tts_zen_state || {};
  if (st.currentEngine === 'server' && serverAudio) {
    var idx = Math.max(0, currentSentenceIdx - 2);
    serverAudio.currentTime = serverSentences[idx].start;
    currentSentenceIdx = idx;
    updateHighlightServer(idx);
    return;
  }
  var idx = Math.max(0, currentSentenceIdx - 2);
  jumpToSentence(idx);
}

function handleNext() {
  if (!sentenceData.length) return;
  var st = window.__tts_zen_state || {};
  if (st.currentEngine === 'server' && serverAudio) {
    var idx = Math.min(sentenceData.length - 1, currentSentenceIdx + 1);
    serverAudio.currentTime = serverSentences[idx].start;
    currentSentenceIdx = idx;
    updateHighlightServer(idx);
    return;
  }
  var idx = Math.min(sentenceData.length - 1, currentSentenceIdx + 1);
  jumpToSentence(idx);
}

// ---- Panel state bridge ----

// State shared with panel via global
window.__tts_zen_state = { currentVoice: 'es-ES-AlvaroNeural', currentRate: 1.0, currentEngine: 'native', serverAvailable: false, lang: 'es' };

// Translation helper for status messages
function ts(key) {
  var lang = (window.__tts_zen_state && window.__tts_zen_state.lang) || 'es';
  var T = {
    es: {
      ready: 'Listo', playing: 'Reproduciendo...', connecting: 'Conectando al servidor...',
      serverError: 'Error del servidor', noTiming: 'Sin datos de timing', audioError: 'Error de audio',
      serverMode: 'Reproduciendo (edge-tts)...', noServer: 'Servidor no disponible — usa modo Nativo',
      noTextFound: 'No se encontró texto en esta página', starting: 'Iniciando lectura...',
      paused: 'Pausado', stopped: 'Detenido', voiceError: 'Error de voz'
    },
    en: {
      ready: 'Ready', playing: 'Playing...', connecting: 'Connecting to server...',
      serverError: 'Server error', noTiming: 'No timing data', audioError: 'Audio error',
      serverMode: 'Playing (edge-tts)...', noServer: 'Server unavailable — switch to Native mode',
      noTextFound: 'No text found on this page', starting: 'Starting playback...',
      paused: 'Paused', stopped: 'Stopped', voiceError: 'Voice error'
    }
  };
  return (T[lang] || T['es'])[key] || key;
}

// Warm up speechSynthesis voices (async, needed before first speak)
var _nativeVoices = [];
function ensureVoices() {
  _nativeVoices = speechSynthesis.getVoices();
  if (_nativeVoices.length === 0) {
    speechSynthesis.onvoiceschanged = function() {
      _nativeVoices = speechSynthesis.getVoices();
    };
    // Trigger voice loading with a dummy utterance
    var dummy = new SpeechSynthesisUtterance('');
    dummy.volume = 0;
    speechSynthesis.speak(dummy);
  }
}
ensureVoices();
// Default enabled sites (panel.js overrides from storage after async load)
window.__tts_zen_enabled_sites = { 'wattpad.com': true, 'archiveofourown.org': true, 'fanfiction.net': true, 'webnovel.com': true, 'generic': true };

// ---- Initialization ----

function injectPanel() {
  const host = document.createElement('div');
  host.id = 'tts-zen-host';
  host.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:999999;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  createPanel(shadow, {
    onRead: () => dispatchReadPage(extractTextWithRefs),
    onPause: handlePause,
    onStop: handleStop,
    onPrev: handlePrev,
    onNext: handleNext,
  });
}

function tryInject() {
  if (document.body) { injectPanel(); }
  else { requestAnimationFrame(tryInject); }
}

if (shouldInject()) {
  tryInject();
}
