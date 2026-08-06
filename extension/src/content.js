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
  // Try site-specific extractors first
  for (const site of SITE_EXTRACTORS) {
    if (site.test && site.test()) {
      const text = site.extract();
      if (text && text.trim().length > 50) {
        return { text, refs: [] };
      }
    }
  }

  // Generic extraction with multiple strategies
  var result = mapParagraphsToText();
  if (result && result.text && result.text.trim().length > 50) return result;

  // Fallback: try Readability (handles translated pages better)
  try {
    var doc = document.cloneNode(true);
    var reader = new Readability(doc);
    var article = reader.parse();
    if (article && article.textContent && article.textContent.trim().length > 50) {
      return { text: article.textContent.trim(), refs: [] };
    }
  } catch (_) {}

  // Last resort: body text
  var body = document.body;
  if (body && body.innerText && body.innerText.trim().length > 10) {
    return { text: body.innerText.trim(), refs: [{ el: body, start: 0, end: body.innerText.trim().length }] };
  }
  return null;
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
      // Webnovel loads content dynamically — try multiple selectors
      var content = document.querySelector('.cha-words, .cha-content, .chapter-content, .read-content, [class*="cha-words"], [class*="cha-content"], .reader-content, .reader-main, [class*="reader"]');
      if (!content) {
        // Fallback: find the largest text block
        var divs = document.querySelectorAll('div');
        var best = null; var maxLen = 0;
        for (var i = 0; i < divs.length; i++) {
          var txt = divs[i].textContent.trim();
          if (txt.length > maxLen && txt.length > 500) {
            maxLen = txt.length; best = divs[i];
          }
        }
        if (best) return best.textContent;
        return null;
      }
      return content.textContent;
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

// ---- Text cleaning ----

function cleanText(text) {
  return text
    // Normalize whitespace
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Fix broken lines (single newlines within paragraphs)
    .replace(/([^.!?…\n])\n([a-záéíóúñ])/gi, '$1 $2')
    // Normalize punctuation
    .replace(/\.{3,}/g, '…')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',')
    .replace(/\s+!/g, '!')
    .replace(/\s+\?/g, '?')
    // Ensure periods have space after
    .replace(/\.([A-ZÁÉÍÓÚÑ])/g, '. $1')
    // Remove leading/trailing whitespace per line
    .split('\n').map(function(l) { return l.trim(); }).join('\n')
    // Remove empty lines at start/end
    .replace(/^\n+/, '').replace(/\n+$/, '')
    // Collapse multiple spaces
    .replace(/ {2,}/g, ' ')
    .trim();
}

// ---- Dynamic content observer ----

var contentObserver = null;
var scrollCheckInterval = null;
var lastKnownText = '';
var chunkCount = 0;

function startContentObserver() {
  stopContentObserver();
  lastKnownText = window.__tts_zen_last_text || '';
  chunkCount = 0;

  // Find the main content area (article, main, or story container)
  var target = document.querySelector('article, main, [role="main"], .cha-content, .chapter-content, .read-content, #chapters, .userstuff, .storytext, .panel-reading');
  if (!target) target = document.body;

  // Observer for DOM changes
  contentObserver = new MutationObserver(function() {
    checkForNewContent(target);
  });
  contentObserver.observe(target, { childList: true, subtree: true, characterData: true });

  // Also check on scroll (for lazy-loaded images/text)
  scrollCheckInterval = setInterval(function() {
    checkForNewContent(target);
  }, 2000);
}

function stopContentObserver() {
  if (contentObserver) { contentObserver.disconnect(); contentObserver = null; }
  if (scrollCheckInterval) { clearInterval(scrollCheckInterval); scrollCheckInterval = null; }
}

function checkForNewContent(target) {
  var currentText = target.innerText || target.textContent || '';
  currentText = currentText.replace(/\s+/g, ' ').trim();
  
  if (currentText.length <= lastKnownText.length) return;
  
  // Get only the new portion
  var newPortion = currentText.substring(lastKnownText.length).trim();
  if (newPortion.length < 20) return;
  
  // Find the newest paragraph/chunk (last N chars)
  var chunk = newPortion;
  if (newPortion.length > 2000) {
    chunk = newPortion.substring(newPortion.length - 2000);
  }
  
  lastKnownText = currentText;
  chunkCount++;
  console.log('[TTS-zen] Chunk #' + chunkCount + ' detected, ' + chunk.length + ' chars');
  onNewContent(chunk);
}

async function onNewContent(newText) {
  newText = cleanText(newText);
  window.__tts_zen_last_text = (window.__tts_zen_last_text || '') + '\n\n' + newText;

  var st = window.__tts_zen_state || {};
  var langOut = st.langOut || 'es';
  if (langOut && langOut !== 'auto') {
    try {
      var resp = await browser.runtime.sendMessage({ action: 'translate', text: newText, from: 'auto', to: langOut });
      if (resp && resp.text && resp.text !== newText) {
        newText = resp.text;
      }
    } catch (_) {}
  }

  appendToPreview(newText);
}

function appendToPreview(text) {
  var host = document.getElementById('tts-zen-host');
  if (!host || !host.shadowRoot) return;
  var overlay = host.shadowRoot.getElementById('tts-zen-preview-overlay');
  if (!overlay || overlay.classList.contains('hidden')) return;
  var content = host.shadowRoot.getElementById('tts-zen-preview-content');
  if (!content) return;

  var chunkLabel = document.createElement('div');
  chunkLabel.style.cssText = 'font-size:9px;color:#5b6370;margin-top:12px;margin-bottom:2px;letter-spacing:0.5px;';
  chunkLabel.textContent = '— chunk ' + (chunkCount) + ' —';
  content.appendChild(chunkLabel);

  var p = document.createElement('p');
  p.style.cssText = 'margin:0 0 6px 0;line-height:1.6;opacity:0.7;font-size:11px;border-left:2px solid rgba(167,139,250,0.25);padding-left:8px;color:#8b94a5;';
  p.textContent = text.substring(0, 400);
  if (text.length > 400) p.textContent += '…';
  content.appendChild(p);
  content.scrollTop = content.scrollHeight;
}

// ---- Server TTS Player (edge-tts) with chunking ----

var serverAudio = null;
var serverSentences = [];

function splitText(text, maxLen) {
  maxLen = maxLen || 3000;
  if (text.length <= maxLen) return [text];
  var parts = [];
  var sentences = text.match(/[^.!?…\n]+[.!?…]*(\n|$)?/g) || [text];
  var cur = '';
  for (var i = 0; i < sentences.length; i++) {
    if (cur.length + sentences[i].length > maxLen && cur.length > 0) {
      parts.push(cur.trim()); cur = '';
    }
    cur += sentences[i];
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

async function startServerPlayback(text) {
  stopSpeech();
  var st = window.__tts_zen_state || {};
  var voice = st.currentVoice || 'es-ES-AlvaroNeural';
  var rate = st.currentRate || 1.0;
  var rateStr = rate >= 1.0 ? '+' + Math.round((rate - 1) * 100) + '%' : '-' + Math.round((1 - rate) * 100) + '%';

  // Split large texts into chunks edge-tts can handle
  var chunks = splitText(text, 3000);
  var totalChunks = chunks.length;
  var allSentences = [];

  isSpeaking = true;
  setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
  setPauseIcon(true);

  try {
    for (var ci = 0; ci < totalChunks; ci++) {
      if (!isSpeaking) { console.log('[TTS-zen] Chunk loop stopped: isSpeaking=false'); break; }
      var progress = totalChunks > 1 ? ' [' + (ci + 1) + '/' + totalChunks + ']' : '';
      setStatus(ts('serverMode') + progress);

      console.log('[TTS-zen] Chunk ' + (ci+1) + '/' + totalChunks + ': sending ' + chunks[ci].length + ' chars');
      var resp = await browser.runtime.sendMessage({ action: 'read_page_sync', text: chunks[ci], voice: voice, rate: rateStr });
      console.log('[TTS-zen] Chunk ' + (ci+1) + ': resp success=' + resp.success);
      if (!resp.success) throw new Error(ts('serverError'));

      // Accumulate sentences with offset
      var offset = allSentences.length > 0 ? allSentences[allSentences.length - 1].end : 0;
      (resp.sentences || []).forEach(function(s) {
        allSentences.push({ text: s.text, start: s.start + offset, end: s.end + offset });
      });

      serverSentences = allSentences;
      window.__tts_zen_sentences = serverSentences;
      sentenceData = allSentences;
      window.__tts_zen_state.serverAvailable = true;

      // Create and play audio
      var audioBytes = Uint8Array.from(atob(resp.audio), function(c) { return c.charCodeAt(0); });
      var blob = new Blob([audioBytes], { type: 'audio/mpeg' });
      var url = URL.createObjectURL(blob);
      if (serverAudio) { serverAudio.pause(); URL.revokeObjectURL(serverAudio.src); }
      serverAudio = new Audio(url);
      serverAudio.playbackRate = rate;

      currentSentenceIdx = ci === 0 ? 0 : allSentences.length - (resp.sentences || []).length;

      // Wait for audio to finish
      await new Promise(function(resolve, reject) {
        serverAudio.ontimeupdate = function() {
          if (!isSpeaking || !serverSentences.length) return;
          var t = serverAudio.currentTime;
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
        serverAudio.onended = function() { console.log('[TTS-zen] Chunk ' + (ci+1) + ': audio ended'); resolve(); };
        serverAudio.onerror = function(e) { console.error('[TTS-zen] Chunk ' + (ci+1) + ': audio error'); reject(new Error('audio')); };
        serverAudio.play().catch(function(e) { console.error('[TTS-zen] Chunk ' + (ci+1) + ': play() failed', e.message); reject(e); });
      });
      console.log('[TTS-zen] Chunk ' + (ci+1) + ': done');
    }

    isSpeaking = false;
    setStatus(ts('ready'));
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    setPauseIcon(false);
  } catch (e) {
    window.__tts_zen_state.serverAvailable = false;
    setStatus(ts('noServer'), true);
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    isSpeaking = false;
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
  stopContentObserver();

  // Wait for dynamic content to load (websites like Webnovel)
  if (window.location.hostname.includes('webnovel.com') || 
      window.location.hostname.includes('wattpad.com')) {
    await new Promise(function(r) { setTimeout(r, 1500); });
  }

  var result = extractFn();
  if (!result || !result.text || result.text.trim().length < 20) {
    // Retry after delay
    await new Promise(function(r) { setTimeout(r, 2000); });
    result = extractFn();
  }
  if (!result || !result.text || result.text.trim().length < 20) {
    setStatus('No se encontró texto en esta página', true);
    return;
  }

  extractedRefs = result.refs || [];
  var text = cleanText(result.text);
  window.__tts_zen_last_text = text;
  console.log('[TTS-zen] Texto extraido: ' + text.length + ' chars, ~' + text.split(/[.!?…]/).length + ' oraciones');

  setStatus(ts('starting'));

  // Start watching for new content
  startContentObserver();

  var st = window.__tts_zen_state || {};
  var langIn = st.langIn || 'auto';
  var langOut = st.langOut || 'es';

  // Translate if output language is set
  if (langOut && langOut !== 'auto') {
    try {
      setStatus('Traduciendo...');
      console.log('[TTS-zen] Translating from=' + langIn + ' to=' + langOut + ' text=' + text.substring(0,50) + '...');
      var resp = await browser.runtime.sendMessage({ action: 'translate', text: text, from: langIn, to: langOut });
      console.log('[TTS-zen] Translate resp:', resp);
      if (resp && resp.text && resp.text !== text) {
        text = resp.text;
        console.log('[TTS-zen] Translated OK, first 50 chars:', text.substring(0,50));
      }
    } catch (e) {
      console.error('[TTS-zen] Translate error:', e.message || e);
    }
  }

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
  stopContentObserver();
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
window.__tts_zen_state = { currentVoice: 'es-ES-AlvaroNeural', currentRate: 1.0, currentEngine: 'native', serverAvailable: false, lang: 'es', langIn: 'auto', langOut: 'es' };

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
