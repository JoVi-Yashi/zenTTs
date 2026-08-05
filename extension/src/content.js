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
             .replace(/<[^>]+>/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
}

// ---- Site-Specific Extractors ----

const SITE_EXTRACTORS = [
  {
    // Wattpad — story content is in pre elements inside the reader
    test: () => window.location.hostname.includes('wattpad.com'),
    extract: () => {
      const parts = document.querySelectorAll('pre');
      if (parts.length > 0) {
        return Array.from(parts).map(p => p.textContent).join('\n\n');
      }
      return null;
    }
  },
  {
    // Archive of Our Own (AO3)
    test: () => window.location.hostname.includes('archiveofourown.org'),
    extract: () => {
      const chapter = document.querySelector('#chapters .userstuff');
      if (chapter) return chapter.textContent;
      return null;
    }
  },
  {
    // Fanfiction.net
    test: () => window.location.hostname.includes('fanfiction.net'),
    extract: () => {
      const story = document.querySelector('.storytext, #storytext');
      if (story) return story.textContent;
      return null;
    }
  },
];

function extractText() {
  // Try site-specific extractors first
  for (const site of SITE_EXTRACTORS) {
    if (site.test()) {
      const text = site.extract();
      if (text && text.trim().length > 50) {
        return stripTags(text);
      }
    }
  }

  // Fallback: Readability.js on cloned document
  const clone = document.cloneNode(true);
  const reader = new Readability(clone);
  const article = reader.parse();

  if (article && article.textContent && article.textContent.length > 100) {
    return stripTags(article.textContent);
  }

  // Fallback 2: <main> element
  const main = document.querySelector('main');
  if (main && main.textContent && main.textContent.trim().length > 50) {
    return stripTags(main.textContent);
  }

  // Fallback 3: <article> element
  const articleEl = document.querySelector('article');
  if (articleEl && articleEl.textContent && articleEl.textContent.trim().length > 50) {
    return stripTags(articleEl.textContent);
  }

  // Last resort: body.innerText
  if (document.body && document.body.innerText) {
    return stripTags(document.body.innerText);
  }

  return null;
}

// ---- Initialization ----

function injectPanel() {
  const host = document.createElement('div');
  host.id = 'tts-zen-host';
  host.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:999999;';
  document.body.appendChild(host);

  const shadow = host.attachShadow({ mode: 'open' });
  createPanel(shadow, {
    onRead: extractText,
  });
}

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
