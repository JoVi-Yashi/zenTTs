// zenTTS — page highlighting that follows the voice
//
// Marks the sentence being read and the word being spoken with the CSS Custom
// Highlight API, so the site's DOM is never touched. The highlight sets its own
// text color, so it stays readable on dark and light sites alike. When a
// sentence cannot be found on the page (e.g. the text was translated), the
// whole paragraph is marked instead, also with a readable text color.

var SENTENCE = 'zentts-sentence';
var WORD = 'zentts-word';
var PICK = 'zentts-pick';
var INK = '#1b1916';
var MARK = '#f6e7b0';          // opaque, so dark text reads on any site
var WORD_MARK = '#e3b04b';

var supported = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';

// "page": opaque marks with dark text (web pages). "overlay": see-through
// marks and no text color, for the PDF reader, whose text layer is invisible
// and sits on top of the rendered page.
var theme = 'page';
export function setHighlightTheme(name) { theme = name; }

function ensureStyles() {
  if (document.getElementById('zentts-highlight')) return;
  var style = document.createElement('style');
  style.id = 'zentts-highlight';
  style.textContent = theme === 'overlay'
    ? '::highlight(' + SENTENCE + ') { background-color: rgba(243, 214, 102, .38); }\n' +
      '::highlight(' + WORD + ') { background-color: rgba(227, 160, 40, .55); }\n' +
      '::highlight(' + PICK + ') { background-color: rgba(47, 93, 138, .22); }'
    : '::highlight(' + SENTENCE + ') { background-color: ' + MARK + '; color: ' + INK + '; }\n' +
      '::highlight(' + WORD + ') { background-color: ' + WORD_MARK + '; color: ' + INK + '; }\n' +
      '::highlight(' + PICK + ') { background-color: #dbe6f3; color: ' + INK + '; text-decoration: underline dotted 2px #2f5d8a; }';
  (document.head || document.documentElement).appendChild(style);
}

// A paragraph can be made of several elements (a PDF paragraph that runs over
// a page break): el.__zenttsParts lists them in reading order
function partsOf(el) { return el && el.__zenttsParts ? el.__zenttsParts : [el]; }

function containsNode(el, node) {
  return partsOf(el).some(function(p) { return p && p.contains(node); });
}

// Box of a paragraph, also for parts without a box of their own (display: contents)
function boxOf(el) {
  var parts = partsOf(el);
  if (parts.length === 1 && getComputedStyle(parts[0]).display !== 'contents') return parts[0].getBoundingClientRect();
  var box = null;
  parts.forEach(function(p) {
    var r = document.createRange();
    r.selectNodeContents(p);
    var b = r.getBoundingClientRect();
    if (!b.width && !b.height) return;
    box = box ? { left: Math.min(box.left, b.left), top: Math.min(box.top, b.top), right: Math.max(box.right, b.right), bottom: Math.max(box.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
  });
  box = box || { left: 0, top: 0, right: 0, bottom: 0 };
  box.width = box.right - box.left;
  box.height = box.bottom - box.top;
  return box;
}

// ---- Text → DOM positions ----
// Whitespace is dropped and "…" is spelled "...", so the cleaned-up text we
// read can be matched against the raw text nodes of the page.

function compactChars(ch) {
  if (/\s/.test(ch)) return '';
  if (ch === '…') return '...';
  return ch;
}

export function compact(text) {
  var out = '';
  for (var i = 0; i < text.length; i++) out += compactChars(text[i]);
  return out;
}

var indexes = new WeakMap();

// { text, map[i] = {node, offset} } for one paragraph, rebuilt if it changed
function indexOf(el) {
  var parts = partsOf(el);
  var raw = parts.map(function(p) { return p.textContent; }).join('\n');
  var cached = indexes.get(el);
  if (cached && cached.raw === raw) return cached;
  var text = '';
  var map = [];
  parts.forEach(function(part) {
    var walker = document.createTreeWalker(part, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n) {
        var p = n.parentNode && n.parentNode.nodeName;
        return p === 'SCRIPT' || p === 'STYLE' ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    for (var node = walker.nextNode(); node; node = walker.nextNode()) {
      var data = node.data;
      for (var i = 0; i < data.length; i++) {
        var c = compactChars(data[i]);
        for (var k = 0; k < c.length; k++) { text += c[k]; map.push({ node: node, offset: i }); }
      }
    }
  });
  var idx = { raw: raw, text: text, map: map };
  indexes.set(el, idx);
  return idx;
}

function rangeFromCompact(idx, start, end) {
  if (start < 0 || end > idx.map.length || start >= end) return null;
  var a = idx.map[start];
  var b = idx.map[end - 1];
  var r = document.createRange();
  r.setStart(a.node, a.offset);
  r.setEnd(b.node, b.offset + 1);
  return r;
}

// Finds `needle` in the paragraph, starting near `hint` (its expected offset)
function find(idx, needle, hint) {
  if (!needle) return -1;
  var at = idx.text.indexOf(needle, Math.max(0, (hint || 0) - 8));
  if (at === -1) at = idx.text.indexOf(needle);
  return at;
}

// ---- State ----

var current = null;        // { el, range, words: [{start, end, range}] }
var fallbackEl = null;
var fallbackStyle = null;

function clearFallback() {
  if (!fallbackEl) return;
  fallbackEl.style.background = fallbackStyle.background;
  fallbackEl.style.boxShadow = fallbackStyle.boxShadow;
  fallbackEl.style.color = fallbackStyle.color;
  fallbackEl = null;
}

function markParagraph(el) {
  if (el === fallbackEl) return;
  clearFallback();
  if (!el || !el.isConnected) return;
  // Parts without a box (PDF text layer): mark their text instead
  if (supported && (el.__zenttsParts || getComputedStyle(el).display === 'contents')) {
    ensureStyles();
    var whole = new Highlight();
    partsOf(el).forEach(function(p) { var r = document.createRange(); r.selectNodeContents(p); whole.add(r); });
    CSS.highlights.set(SENTENCE, whole);
    return;
  }
  fallbackStyle = { background: el.style.background, boxShadow: el.style.boxShadow, color: el.style.color };
  el.style.background = MARK;
  el.style.boxShadow = '-6px 0 0 ' + MARK + ', 6px 0 0 ' + MARK;
  el.style.color = INK;
  fallbackEl = el;
}

function scrollIfNeeded(target) {
  var rect = target.startContainer ? target.getBoundingClientRect() : boxOf(target);
  var margin = Math.min(120, window.innerHeight * 0.15);
  if (rect.top >= margin && rect.bottom <= window.innerHeight - margin) return;
  var el = target.startContainer ? target.startContainer.parentElement : partsOf(target)[0];
  if (el && getComputedStyle(el).display === 'contents') el = el.firstElementChild;
  if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export function clear() {
  if (supported) {
    CSS.highlights.delete(SENTENCE);
    CSS.highlights.delete(WORD);
  }
  clearFallback();
  current = null;
}

// Marks `sentence` inside paragraph `el` and prepares its words.
// `words` is [{start, text}] with offsets into `sentence`; `hint` is where the
// sentence starts in the paragraph, counted without whitespace (see compact()).
export function showSentence(el, sentence, words, hint) {
  if (supported) CSS.highlights.delete(WORD);
  if (!el || !el.isConnected) { clear(); return; }

  if (supported) {
    ensureStyles();
    var idx = indexOf(el);
    var needle = compact(sentence);
    var at = find(idx, needle, hint);
    var range = at >= 0 ? rangeFromCompact(idx, at, at + needle.length) : null;
    if (range) {
      clearFallback();
      var wordRanges = [];
      var pos = at;
      (words || []).forEach(function(w) {
        var wn = compact(w.text);
        var wAt = wn ? idx.text.indexOf(wn, pos) : -1;
        if (wAt >= 0 && wAt < at + needle.length) {
          wordRanges.push(rangeFromCompact(idx, wAt, wAt + wn.length));
          pos = wAt + wn.length;
        } else {
          wordRanges.push(null);
        }
      });
      CSS.highlights.set(SENTENCE, new Highlight(range));
      current = { el: el, range: range, words: wordRanges };
      scrollIfNeeded(range);
      return;
    }
  }

  // Not on the page as-is (translated text, or no Highlight API)
  if (supported) CSS.highlights.delete(SENTENCE);
  current = { el: el, range: null, words: [] };
  markParagraph(el);
  scrollIfNeeded(el);
}

export function showWord(i) {
  if (!supported || !current || !current.range) return;
  var r = current.words[i];
  if (r) CSS.highlights.set(WORD, new Highlight(r));
  else CSS.highlights.delete(WORD);
}

export function hideWord() {
  if (supported) CSS.highlights.delete(WORD);
}

// ---- "Choose where to start" ----

function caretAt(x, y) {
  if (document.caretPositionFromPoint) {
    var p = document.caretPositionFromPoint(x, y);
    return p ? { node: p.offsetNode, offset: p.offset } : null;
  }
  if (document.caretRangeFromPoint) {
    var r = document.caretRangeFromPoint(x, y);
    return r ? { node: r.startContainer, offset: r.startOffset } : null;
  }
  return null;
}

// Index of the sentence under the pointer, or -1.
// paragraphs: [{el}], sentences: [{text, refIdx, hint}]
export function sentenceAtPoint(x, y, paragraphs, sentences) {
  var caret = caretAt(x, y);
  if (!caret || !caret.node) return -1;
  var p = -1;
  for (var i = 0; i < paragraphs.length; i++) {
    if (paragraphs[i].el && containsNode(paragraphs[i].el, caret.node)) { p = i; break; }
  }
  if (p < 0) return -1;

  // Position of the caret in the paragraph's whitespace-free text
  var idx = indexOf(paragraphs[p].el);
  var pos = 0;
  for (var k = 0; k < idx.map.length; k++) {
    var m = idx.map[k];
    if (m.node === caret.node && m.offset >= caret.offset) { pos = k; break; }
    pos = k;
  }
  var first = -1, found = -1;
  for (var j = 0; j < sentences.length; j++) {
    var s = sentences[j];
    if (s.refIdx !== p) continue;
    if (first < 0) first = j;
    if (s.hint <= pos) found = j;
  }
  // Translated text doesn't map to the page: start at the paragraph instead
  return found >= 0 ? found : first;
}

export function showPick(el, sentence, hint) {
  if (!supported || !el) return;
  ensureStyles();
  var idx = indexOf(el);
  var needle = compact(sentence);
  var at = find(idx, needle, hint);
  var range = at >= 0 ? rangeFromCompact(idx, at, at + needle.length) : null;
  if (!range) {
    range = document.createRange();
    range.selectNodeContents(partsOf(el)[0]);
  }
  CSS.highlights.set(PICK, new Highlight(range));
}

export function clearPick() {
  if (supported) CSS.highlights.delete(PICK);
}

// ---- Translation caption ----
// When the text is read translated, the sentence being spoken is shown in a
// small card right under the original paragraph (above it if there is no room),
// with the spoken word marked. It lives in its own shadow root, so the site's
// styles and DOM are untouched. The card is fixed to the viewport and follows
// the paragraph on every scroll (of the page or of any inner scroller, as on
// Webnovel), resize and layout change.

var caption = null;   // { host, box, text, words: [span], el }
var suppressed = false; // a panel dialog is open

var CAPTION_CSS =
  ':host { all: initial; }\n' +
  '.cap { box-sizing: border-box; max-width: 680px; padding: 8px 12px; border-radius: 6px;' +
  ' background: #fbf8f1; color: ' + INK + '; border: 1px solid #ddd4c3; border-left: 3px solid #9a3b25;' +
  ' box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 22px rgba(0,0,0,.14);' +
  ' font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;' +
  ' transition: opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1); }\n' +
  '.cap.enter { opacity: 0; transform: translateY(-4px); }\n' +
  '.w { border-radius: 2px; transition: background-color .12s ease; }\n' +
  '.w.on { background: ' + WORD_MARK + '; }\n' +
  '@media (prefers-color-scheme: dark) { .cap { background: #23201c; color: #e9e2d4; border-color: #3a352e; border-left-color: #d9785c; }' +
  ' .w.on { color: ' + INK + '; } }\n' +
  '@media (prefers-reduced-motion: reduce) { .cap, .w { transition: none; } }';

function captionHost() {
  if (caption && caption.host.isConnected) return caption;
  var host = document.createElement('div');
  host.id = 'zentts-caption';
  // Below the panel (999999), so the panel's reading view and dialogs cover it
  host.style.cssText = 'position:fixed;top:0;left:0;z-index:999998;pointer-events:none;display:none;';
  var root = host.attachShadow({ mode: 'open' });
  var style = document.createElement('style');
  style.textContent = CAPTION_CSS;
  var box = document.createElement('div');
  box.className = 'cap';
  root.append(style, box);
  document.documentElement.appendChild(host);
  caption = { host: host, box: box, text: null, words: [], el: null, raf: 0, ro: null };
  // Capture: scroll events of inner scrollers don't bubble to window
  document.addEventListener('scroll', schedulePlace, { passive: true, capture: true });
  window.addEventListener('resize', schedulePlace, { passive: true });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', schedulePlace, { passive: true });
  if (typeof ResizeObserver !== 'undefined') caption.ro = new ResizeObserver(schedulePlace);
  return caption;
}

function schedulePlace() {
  if (!caption || caption.raf || caption.host.style.display === 'none') return;
  caption.raf = requestAnimationFrame(function() { caption.raf = 0; placeCaption(); });
}

function placeCaption() {
  if (!caption || !caption.el || caption.host.style.display === 'none') return;
  if (!caption.el.isConnected) { hideCaption(); return; }
  var r = boxOf(caption.el);
  var vw = window.innerWidth, vh = window.innerHeight, m = 8;
  // Out of sight (scrolled away): hide until the paragraph is back
  var away = r.bottom < 0 || r.top > vh || (!r.width && !r.height);
  caption.host.style.visibility = suppressed || away ? 'hidden' : '';
  if (away) return;
  var width = Math.min(Math.max(r.width, 260), 680, vw - 2 * m);
  var left = Math.max(m, Math.min(r.left, vw - width - m));
  caption.host.style.width = width + 'px';
  var h = caption.box.offsetHeight;
  var top;
  if (r.bottom + m + h <= vh - m) top = r.bottom + m;            // under the paragraph
  else if (r.top - m - h >= m) top = r.top - m - h;             // above it
  else top = Math.max(m, vh - h - m);                           // paragraph taller than the view: keep at the bottom edge
  caption.host.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
}

export function showCaption(el, text, words) {
  if (!el || !el.isConnected) { hideCaption(); return; }
  var c = captionHost();
  if (c.el !== el && c.ro) {
    c.ro.disconnect();
    partsOf(el).forEach(function(p) { if (getComputedStyle(p).display !== 'contents') c.ro.observe(p); });
    c.ro.observe(document.documentElement);
  }
  c.el = el;
  c.host.style.display = 'block';
  if (c.text !== text) {
    c.text = text;
    c.box.replaceChildren();
    c.words = [];
    var last = 0;
    (words || []).forEach(function(w) {
      if (w.start > last) c.box.appendChild(document.createTextNode(text.slice(last, w.start)));
      var span = document.createElement('span');
      span.className = 'w';
      span.textContent = w.text;
      c.box.appendChild(span);
      c.words.push(span);
      last = w.start + w.text.length;
    });
    if (last < text.length) c.box.appendChild(document.createTextNode(text.slice(last)));
    c.box.classList.add('enter');
    void c.box.offsetWidth;
    c.box.classList.remove('enter');
  }
  placeCaption();
}

export function showCaptionWord(i) {
  if (!caption || caption.host.style.display === 'none') return;
  caption.words.forEach(function(span, k) { span.classList.toggle('on', k === i); });
}

export function hideCaption() {
  if (!caption) return;
  if (caption.ro) caption.ro.disconnect();
  caption.host.style.display = 'none';
  caption.text = null;
  caption.el = null;
}

// Hidden while the panel shows "Extracted text" or "Sites", back afterwards
export function suppressCaption(on) {
  suppressed = !!on;
  if (caption) { caption.host.style.visibility = suppressed ? 'hidden' : ''; placeCaption(); }
}
