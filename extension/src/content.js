// TTS-zen Content Script
// Injects floating panel, extracts text with DOM references for page highlighting
import { Readability } from '@mozilla/readability';
import { createPanel, setStatus, setButtonsEnabled, setCounter } from './panel.js';

// ---- URL Guard ----
const RESTRICTED_PROTOCOLS = ['edge:', 'about:', 'file:', 'chrome:', 'moz-extension:'];

function shouldInject() {
  return !RESTRICTED_PROTOCOLS.includes(window.location.protocol);
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

// ---- Audio Player ----

let audio = null;
let extractedRefs = [];
let sentenceData = [];
let chunkQueue = [];
let chunkIndex = 0;
let totalSentences = 0;
let sentenceOffset = 0;

function stopAudio() {
  chunkQueue = [];
  chunkIndex = 0;
  totalSentences = 0;
  sentenceOffset = 0;
  if (audio) {
    audio.pause();
    if (audio.src?.startsWith('blob:')) URL.revokeObjectURL(audio.src);
    audio = null;
  }
  clearHighlight();
  window.__tts_zen_sentences = [];
}

function splitIntoChunks(text, maxLen) {
  var chunks = [];
  var paragraphs = text.split('\n\n');
  var current = '';
  for (var i = 0; i < paragraphs.length; i++) {
    var p = paragraphs[i].trim();
    if (!p) continue;
    if (current && (current.length + p.length > maxLen)) {
      chunks.push(current.trim());
      current = p;
    } else {
      current = current ? current + '\n\n' + p : p;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length > 0 ? chunks : [text];
}

async function fetchChunk(text) {
  var st = window.__tts_zen_state || {};
  var voice = st.currentVoice || 'es-ES-AlvaroNeural';
  var rateVal = st.currentRate || 1.0;
  var rate = Math.round((rateVal - 1) * 100) + '%';
  var rateStr = rateVal >= 1 ? '+' + rate : rate;

  var response = await sendMessageWithRetry({
    action: 'read_page_sync', text: text, voice: voice, rate: rateStr,
  });
  if (!response || !response.success) {
    throw new Error(response?.error || 'TTS chunk failed');
  }
  return response;
}

function playChunk(chunkData) {
  // Offset sentence timings by total previous audio duration
  var sentences = chunkData.sentences;
  var duration = sentences.length > 0 ? sentences[sentences.length - 1].end : 0;
  for (var i = 0; i < sentences.length; i++) {
    sentences[i].start += sentenceOffset;
    sentences[i].end += sentenceOffset;
  }

  sentenceData = sentenceData.concat(sentences);
  totalSentences = sentenceData.length;
  window.__tts_zen_sentences = sentenceData; // for preview popup sync

  // Decode base64 audio
  var binary = atob(chunkData.audio);
  var bytes = new Uint8Array(binary.length);
  for (var i2 = 0; i2 < binary.length; i2++) bytes[i2] = binary.charCodeAt(i2);
  var blob = new Blob([bytes], { type: 'audio/mpeg' });
  var url = URL.createObjectURL(blob);

  if (audio) {
    URL.revokeObjectURL(audio.src);
  }
  audio = new Audio(url);
  var lastIdx = -1;

  audio.addEventListener('timeupdate', function() {
    if (!audio || !sentenceData.length) return;
    var t = audio.currentTime + sentenceOffset;
    var found = -1;
    for (var i3 = 0; i3 < sentenceData.length; i3++) {
      if (t >= sentenceData[i3].start && t < sentenceData[i3].end) { found = i3; break; }
    }
    if (found !== -1 && found !== lastIdx) {
      lastIdx = found;
      updateHighlight(found);
    }
  });

  audio.addEventListener('ended', function() {
    sentenceOffset += duration;
    URL.revokeObjectURL(audio.src);
    audio = null;

    chunkIndex++;
    if (chunkIndex < chunkQueue.length) {
      // Pre-fetched, play next
      setStatus('Reproduciendo... (' + (chunkIndex + 1) + '/' + chunkQueue.length + ')');
      playChunk(chunkQueue[chunkIndex]);
    } else {
      // All done
      setStatus('Listo');
      setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
      sentenceOffset = 0;
    }
  });

  audio.addEventListener('error', function() {
    setStatus('Error de reproduccion', true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    stopAudio();
  });

  audio.play().then(function() {
    setStatus('Reproduciendo... (' + (chunkIndex + 1) + '/' + chunkQueue.length + ')');
    setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
  }).catch(function(err) {
    setStatus('Error: ' + err.message, true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    stopAudio();
  });
}

async function startChunkedPlayback(text) {
  var chunks = splitIntoChunks(text, 2000);
  chunkQueue = new Array(chunks.length);
  chunkIndex = 0;
  sentenceOffset = 0;
  sentenceData = [];

  // Fetch first chunk and start playing
  setStatus('Generando audio... (1/' + chunks.length + ')');
  chunkQueue[0] = await fetchChunk(chunks[0]);
  playChunk(chunkQueue[0]);

  // Pre-fetch remaining chunks in background
  for (var i = 1; i < chunks.length; i++) {
    setStatus('Reproduciendo... cargando (' + (i + 1) + '/' + chunks.length + ')');
    chunkQueue[i] = await fetchChunk(chunks[i]);
  }
}

function jumpToSentence(idx) {
  if (idx < 0 || idx >= sentenceData.length) return;
  if (!audio && chunkIndex < chunkQueue.length) return;

  var targetTime = sentenceData[idx].start;
  // Find which chunk contains this sentence and seek
  if (audio && targetTime >= sentenceOffset) {
    audio.currentTime = targetTime - sentenceOffset;
    updateHighlight(idx);
  }
}

function updateHighlight(idx) {
  if (idx < 0 || idx >= sentenceData.length) return;
  var s = sentenceData[idx];

  // Update preview popup highlight if open (inside Shadow DOM)
  var host = document.getElementById('tts-zen-host');
  if (host && host.shadowRoot) {
    var prevActive = host.shadowRoot.querySelector('#tts-zen-preview-content .sentence.active');
    if (prevActive) { prevActive.classList.remove('active'); prevActive.classList.add('played'); }
    var prevEl = host.shadowRoot.getElementById('tts-zen-preview-s-' + idx);
    if (prevEl) {
      prevEl.classList.add('active');
      prevEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

async function sendMessageWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await browser.runtime.sendMessage(message);
    } catch (err) {
      if (err.message?.includes('receiving end does not exist') && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 200));
        continue;
      }
      throw err;
    }
  }
}

async function dispatchReadPage(extractFn) {
  const result = extractFn();
  if (!result || !result.text) {
    setStatus('No se encontró texto en esta página', true);
    return;
  }

  extractedRefs = result.refs || [];
  const text = result.text;
  window.__tts_zen_last_text = text; // for preview modal

  setStatus('Extrayendo texto...');
  setButtonsEnabled({ read: false, pause: false, stop: false, prev: false, next: false });

  try {
    if (!browser || !browser.runtime || !browser.runtime.sendMessage) {
      throw new Error('Extension API not available — reload the extension in about:debugging');
    }
    await startChunkedPlayback(text);
  } catch (err) {
    setStatus('Error: ' + err.message, true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
  }
}

// ---- Audio Controls ----

function handlePause() {
  if (!audio) return;
  if (audio.paused) {
    audio.play().then(() => setStatus('Reproduciendo...'));
  } else {
    audio.pause();
    setStatus('Pausado');
  }
}

function handleStop() {
  stopAudio();
  setStatus('Detenido');
  setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
}

function handlePrev() {
  if (!sentenceData.length) return;
  var t = audio ? (sentenceOffset + audio.currentTime) : sentenceOffset;
  var idx = -1;
  for (var i = sentenceData.length - 1; i >= 0; i--) {
    if (sentenceData[i].start < t - 0.5) { idx = i; break; }
  }
  jumpToSentence(Math.max(0, idx));
}

function handleNext() {
  if (!sentenceData.length) return;
  var t = audio ? (sentenceOffset + audio.currentTime) : sentenceOffset;
  var idx = sentenceData.length - 1;
  for (var i = 0; i < sentenceData.length; i++) {
    if (sentenceData[i].start > t + 0.1) { idx = i; break; }
  }
  jumpToSentence(idx);
}

// ---- Panel state bridge ----

// State shared with panel via global
window.__tts_zen_state = { currentVoice: 'es-ES-AlvaroNeural', currentRate: 1.0 };

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
