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

function extractTextWithRefs() {
  const result = { text: '', refs: [] };

  // Try site-specific extractors first — they return text with paragraph breaks
  for (const site of SITE_EXTRACTORS) {
    if (site.test && site.test()) {
      const text = site.extract();
      if (text && text.trim().length > 50) {
        // For site extractors, try to map to visible paragraphs
        return mapParagraphsToText();
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
    extract: () => mapParagraphsToText()?.text || null,
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

function stopAudio() {
  if (audio) {
    audio.pause();
    if (audio.src?.startsWith('blob:')) URL.revokeObjectURL(audio.src);
    audio = null;
  }
  clearHighlight();
}

function jumpToSentence(idx) {
  if (idx < 0 || idx >= sentenceData.length) return;
  if (!audio) return;

  const targetTime = sentenceData[idx].start;
  audio.currentTime = targetTime;
  updateHighlight(idx);
}

function updateHighlight(idx) {
  if (idx < 0 || idx >= sentenceData.length) return;
  const s = sentenceData[idx];
  // Find this sentence's text position in the original extracted text
  const fullText = extractedRefs.map(r => {
    return Array.from(document.querySelectorAll('p, pre, h1, h2, h3, h4, h5, h6, li, td, th, blockquote'))
      .filter(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && el.textContent.trim().length > 1;
      })
      .map(el => el.textContent.trim())
      .join('\n\n');
  }).join('');

  // Find sentence in full text using the refs we stored
  let pos = 0;
  for (const ref of extractedRefs) {
    const refText = ref.el.textContent.trim();
    if (refText.indexOf(s.text) !== -1) {
      const localPos = refText.indexOf(s.text);
      highlightOnPage([ref], localPos, s.text.length);
      setCounter(idx + 1, sentenceData.length);
      return;
    }
  }

  // Fallback: search in concatenated text
  if (extractedRefs.length > 0) {
    highlightOnPage(extractedRefs, pos, s.text.length);
  }
  setCounter(idx + 1, sentenceData.length);
}

function playAudioSync(audioB64, sentences) {
  stopAudio();
  sentenceData = sentences;

  const binary = atob(audioB64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  audio = new Audio(url);

  let lastIdx = -1;

  audio.addEventListener('timeupdate', () => {
    if (!audio || !sentenceData.length) return;
    const t = audio.currentTime;
    let found = -1;
    for (let i = 0; i < sentenceData.length; i++) {
      if (t >= sentenceData[i].start && t < sentenceData[i].end) {
        found = i; break;
      }
    }
    if (found !== -1 && found !== lastIdx) {
      lastIdx = found;
      updateHighlight(found);
    }
  });

  audio.addEventListener('ended', () => {
    updateHighlight(sentenceData.length - 1);
    setStatus('Listo');
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    URL.revokeObjectURL(audio.src);
    audio = null;
  });

  audio.addEventListener('error', () => {
    setStatus('Error de reproducción', true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    stopAudio();
  });

  audio.play().then(() => {
    setStatus('Reproduciendo...');
    setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
  }).catch(err => {
    setStatus('Error: ' + err.message, true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    stopAudio();
  });
}

// ---- Message Dispatch ----

async function dispatchReadPage(extractFn) {
  const result = extractFn();
  if (!result || !result.text) {
    setStatus('No se encontró texto en esta página', true);
    return;
  }

  extractedRefs = result.refs || [];
  const text = result.text;
  const voice = state?.currentVoice || 'es-ES-AlvaroNeural';
  const rateVal = state?.currentRate || 1.0;
  const rate = Math.round((rateVal - 1) * 100) + '%';
  const rateStr = rateVal >= 1 ? '+' + rate : rate;

  setStatus('Generando audio...');
  setButtonsEnabled({ read: false, pause: false, stop: false, prev: false, next: false });

  try {
    const response = await browser.runtime.sendMessage({
      action: 'read_page_sync', text, voice, rate: rateStr,
    });
    if (response.success) {
      playAudioSync(response.audio, response.sentences);
    } else {
      setStatus('Error: ' + response.error, true);
      setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    }
  } catch (err) {
    setStatus('Error de conexión: ' + err.message, true);
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
  if (!audio || !sentenceData.length) return;
  const t = audio.currentTime;
  let idx = -1;
  for (let i = sentenceData.length - 1; i >= 0; i--) {
    if (sentenceData[i].start < t - 0.5) { idx = i; break; }
  }
  jumpToSentence(Math.max(0, idx));
}

function handleNext() {
  if (!audio || !sentenceData.length) return;
  const t = audio.currentTime;
  let idx = sentenceData.length - 1;
  for (let i = 0; i < sentenceData.length; i++) {
    if (sentenceData[i].start > t + 0.1) { idx = i; break; }
  }
  jumpToSentence(idx);
}

// ---- Panel state bridge ----

// State shared with panel via global
window.__tts_zen_state = {
  get voices() { return state?.voices || []; },
  set voices(v) { if (state) state.voices = v; },
  get currentVoice() { return state?.currentVoice || 'es-ES-AlvaroNeural'; },
  set currentVoice(v) { if (state) state.currentVoice = v; },
  get currentRate() { return state?.currentRate || 1.0; },
  set currentRate(v) { if (state) state.currentRate = v; },
};

let state = { voices: [], currentVoice: 'es-ES-AlvaroNeural', currentRate: 1.0 };

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
