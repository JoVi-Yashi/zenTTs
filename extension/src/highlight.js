// zenTTS — page highlighting that follows the voice
//
// Marks the sentence being read and the word being spoken with the CSS Custom
// Highlight API, so the site's DOM is never touched. The highlight sets its own
// text color, so it stays readable on dark and light sites alike. When a
// sentence cannot be found on the page (e.g. the text was translated), the
// whole paragraph is marked instead, also with a readable text color.

var SENTENCE = 'zentts-sentence';
var WORD = 'zentts-word';
var INK = '#1b1916';
var MARK = '#f6e7b0';          // opaque, so dark text reads on any site
var WORD_MARK = '#e3b04b';

var supported = typeof CSS !== 'undefined' && CSS.highlights && typeof Highlight !== 'undefined';

function ensureStyles() {
  if (document.getElementById('zentts-highlight')) return;
  var style = document.createElement('style');
  style.id = 'zentts-highlight';
  style.textContent =
    '::highlight(' + SENTENCE + ') { background-color: ' + MARK + '; color: ' + INK + '; }\n' +
    '::highlight(' + WORD + ') { background-color: ' + WORD_MARK + '; color: ' + INK + '; }';
  (document.head || document.documentElement).appendChild(style);
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
  var raw = el.textContent;
  var cached = indexes.get(el);
  if (cached && cached.raw === raw) return cached;
  var text = '';
  var map = [];
  var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
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
  fallbackStyle = { background: el.style.background, boxShadow: el.style.boxShadow, color: el.style.color };
  el.style.background = MARK;
  el.style.boxShadow = '-6px 0 0 ' + MARK + ', 6px 0 0 ' + MARK;
  el.style.color = INK;
  fallbackEl = el;
}

function scrollIfNeeded(target) {
  var rect = target.getBoundingClientRect();
  var margin = Math.min(120, window.innerHeight * 0.15);
  if (rect.top >= margin && rect.bottom <= window.innerHeight - margin) return;
  var el = target.startContainer ? target.startContainer.parentElement : target;
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
