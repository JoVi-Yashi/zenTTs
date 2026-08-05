// TTS-zen Content Script
// Injects floating Shadow DOM panel, handles text extraction + audio playback
import { Readability } from '@mozilla/readability';
import { createPanel, setStatus, setButtonsEnabled } from './panel.js';

// ---- URL Guard ----
const RESTRICTED_PROTOCOLS = ['edge:', 'about:', 'file:', 'chrome:', 'moz-extension:'];

function shouldInject() {
  const proto = window.location.protocol;
  return !RESTRICTED_PROTOCOLS.some(p => proto === p);
}

// ---- Text Extraction ----
function stripTags(text) {
  return text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
             .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
             .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
             .replace(/<[^>]+>/g, ' ')  // strip remaining HTML tags
             .replace(/\s+/g, ' ')
             .trim();
}

function extractText() {
  // Primary: Readability.js on cloned document
  const clone = document.cloneNode(true);
  const reader = new Readability(clone);
  const article = reader.parse();

  if (article && article.textContent && article.textContent.length > 100) {
    return stripTags(article.textContent);
  }

  // Fallback 1: <main> element
  const main = document.querySelector('main');
  if (main && main.textContent && main.textContent.trim().length > 50) {
    return stripTags(main.textContent);
  }

  // Fallback 2: <article> element
  const articleEl = document.querySelector('article');
  if (articleEl && articleEl.textContent && articleEl.textContent.trim().length > 50) {
    return stripTags(articleEl.textContent);
  }

  // Last resort: body.innerText (already text-only, no tags)
  if (document.body && document.body.innerText) {
    return stripTags(document.body.innerText);
  }

  return null;
}

// ---- Audio Playback ----
let audio = null;

function stopAudio() {
  if (audio) {
    audio.pause();
    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }
    audio = null;
  }
}

function playAudio(arrayBuffer) {
  stopAudio();

  const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  audio = new Audio(url);

  audio.addEventListener('ended', () => {
    setStatus('Ready');
    setButtonsEnabled({ read: true, pause: false, stop: false });
    audio = null;
  });

  audio.addEventListener('error', () => {
    setStatus('Playback error');
    setButtonsEnabled({ read: true, pause: false, stop: false });
    stopAudio();
  });

  audio.play().then(() => {
    setStatus('Playing...');
    setButtonsEnabled({ read: false, pause: true, stop: true });
  }).catch(err => {
    setStatus(`Playback failed: ${err.message}`);
    setButtonsEnabled({ read: true, pause: false, stop: false });
    stopAudio();
  });
}

// ---- Message Dispatch ----
async function dispatchReadPage() {
  const text = extractText();
  if (!text) {
    setStatus('No readable text found on this page');
    return;
  }

  setStatus('Generating audio...');
  setButtonsEnabled({ read: false, pause: false, stop: false });

  try {
    const response = await browser.runtime.sendMessage({
      action: 'read_page',
      text
    });

    if (response.success) {
      // Convert ArrayBuffer-like object back to actual ArrayBuffer
      const buffer = new Uint8Array(response.data).buffer;
      playAudio(buffer);
    } else {
      setStatus(`Error: ${response.error}`);
      setButtonsEnabled({ read: true, pause: false, stop: false });
    }
  } catch (err) {
    setStatus(`Connection error: ${err.message}`);
    setButtonsEnabled({ read: true, pause: false, stop: false });
  }
}

async function dispatchExtractUrl(url) {
  setStatus('Extracting and generating audio...');
  setButtonsEnabled({ read: false, pause: false, stop: false });

  try {
    const response = await browser.runtime.sendMessage({
      action: 'extract_url',
      url
    });

    if (response.success) {
      const buffer = new Uint8Array(response.data).buffer;
      playAudio(buffer);
    } else {
      setStatus(`Error: ${response.error}`);
      setButtonsEnabled({ read: true, pause: false, stop: false });
    }
  } catch (err) {
    setStatus(`Connection error: ${err.message}`);
    setButtonsEnabled({ read: true, pause: false, stop: false });
  }
}

// ---- Audio Controls ----
function handlePause() {
  if (audio) {
    if (audio.paused) {
      audio.play().then(() => {
        setStatus('Playing...');
        setButtonsEnabled({ read: false, pause: true, stop: true });
      });
    } else {
      audio.pause();
      setStatus('Paused');
      setButtonsEnabled({ read: false, pause: true, stop: true });
    }
  }
}

function handleStop() {
  stopAudio();
  setStatus('Ready');
  setButtonsEnabled({ read: true, pause: false, stop: false });
}

// ---- Initialization ----
function injectPanel() {
  const host = document.createElement('div');
  host.id = 'tts-zen-host';
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;pointer-events:none;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  createPanel(shadow, {
    onRead: dispatchReadPage,
    onPause: handlePause,
    onStop: handleStop
  });
}

// ---- Entry Point ----
function tryInject() {
  if (document.body) {
    injectPanel();
  } else {
    requestAnimationFrame(tryInject);
  }
}

if (shouldInject()) {
  tryInject();
}
