// zenTTS PDF reader — an extension page that shows a PDF with pdf.js and
// reads it with the same panel, voices and highlighting as web pages.
//
// Web PDFs are fetched directly (asking for access to their site if needed).
// Local files (file://) can't be read by extensions in Firefox, so the reader
// asks you to drop or pick the file once; a copy is kept in the library, so
// from then on it opens from the shelf (library.html).
//
// Each page is a canvas plus pdf.js's invisible text layer. Its lines are put
// in reading order (columns included), grouped into paragraphs (repeated
// headers, footers and page numbers left out) and handed to the content script
// through window.__zentts_embed. The document outline becomes the table of
// contents, and the page you were on is remembered.

import { setHighlightTheme } from './highlight.js';
import { loadLibrary, updateBook, readFile, realAuthor } from './books.js';
import { pdfjsLib, shelveDocument } from './pdfimport.js';

var ES = (function() { try { return browser.i18n.getUILanguage().toLowerCase().startsWith('es'); } catch (_) { return true; } })();
var S = ES ? {
  dropTitle: 'Abre el PDF', dropNamed: 'Suelta aquí %s o elígelo para leerlo.', dropAny: 'Suelta aquí un PDF o elígelo para leerlo.',
  choose: 'Elegir PDF', why: 'Firefox no deja que las extensiones lean archivos de tu equipo por su cuenta: hace falta que lo abras tú una vez. Después queda en tu biblioteca.',
  allowTitle: 'Permitir leer este PDF', allowText: 'zenTTS necesita permiso para descargar el PDF de %s.', allow: 'Permitir y abrir',
  loading: 'Abriendo el PDF…', preparing: 'Preparando la página %s de %s…', pages: '%s págs.', other: 'Abrir otro PDF',
  failed: 'No se pudo abrir el PDF: %s', noText: 'Este PDF no tiene texto seleccionable (parece escaneado), así que no se puede leer en voz alta.',
  toc: 'Índice', noToc: 'Este PDF no tiene índice.', library: 'Biblioteca', page: 'pág. %s / %s', close: 'Cerrar',
  missing: 'La copia de este libro ya no está en la biblioteca. Ábrelo de nuevo para leerlo.'
} : {
  dropTitle: 'Open the PDF', dropNamed: 'Drop %s here or choose it to read it.', dropAny: 'Drop a PDF here or choose one to read it.',
  choose: 'Choose PDF', why: "Firefox doesn't let extensions read files on your computer by themselves: you need to open it once. After that it stays in your library.",
  allowTitle: 'Allow reading this PDF', allowText: 'zenTTS needs permission to download the PDF from %s.', allow: 'Allow and open',
  loading: 'Opening the PDF…', preparing: 'Preparing page %s of %s…', pages: '%s pages', other: 'Open another PDF',
  failed: 'Could not open the PDF: %s', noText: "This PDF has no selectable text (it looks scanned), so it can't be read aloud.",
  toc: 'Contents', noToc: 'This PDF has no table of contents.', library: 'Library', page: 'p. %s / %s', close: 'Close',
  missing: "This book's copy is no longer in the library. Open it again to read it."
};
function f(s) { var a = [].slice.call(arguments, 1); a.forEach(function(x) { s = s.replace('%s', x); }); return s; }
function $(id) { return document.getElementById(id); }

var params = new URLSearchParams(location.search);
var src = params.get('src');
var fromShelf = params.get('book');

function fileName(url) {
  try { return decodeURIComponent(new URL(url).pathname.split('/').pop()) || 'documento.pdf'; } catch (_) { return 'documento.pdf'; }
}

function show(id) {
  ['drop', 'allow', 'loading'].forEach(function(x) { $(x).hidden = x !== id; });
}

// ---- Getting the bytes ----

// With cookies first (PDFs behind a login), then without them (public PDFs
// whose server allows any origin but not credentials)
async function fetchBytes(url) {
  var resp;
  try { resp = await fetch(url, { credentials: 'include' }); }
  catch (_) { resp = await fetch(url, { credentials: 'omit' }); }
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return new Uint8Array(await resp.arrayBuffer());
}

function askForFile(name) {
  show('drop');
  $('drop-title').textContent = S.dropTitle;
  var text = name ? f(S.dropNamed, '«' + name + '»') : S.dropAny;
  $('drop-text').textContent = text;
  $('choose').textContent = S.choose;
  $('drop-why').textContent = name ? S.why : '';
  return new Promise(function(resolve) {
    function take(file) {
      if (!file) return;
      file.arrayBuffer().then(function(buf) { resolve({ data: new Uint8Array(buf), name: file.name, key: 'pdf:' + file.name + ':' + file.size }); });
    }
    $('choose').onclick = function() { $('file').click(); };
    $('file').onchange = function() { take($('file').files[0]); };
    var drop = $('drop');
    ['dragenter', 'dragover'].forEach(function(t) { document.addEventListener(t, function(e) { e.preventDefault(); drop.classList.add('over'); }); });
    document.addEventListener('dragleave', function() { drop.classList.remove('over'); });
    document.addEventListener('drop', function(e) {
      e.preventDefault();
      drop.classList.remove('over');
      var file = [].find.call(e.dataTransfer.files, function(x) { return /pdf$/i.test(x.type) || /\.pdf$/i.test(x.name); });
      take(file);
    });
  });
}

async function askForAccess(url) {
  var origin = new URL(url).origin + '/*';
  show('allow');
  $('allow-title').textContent = S.allowTitle;
  $('allow-text').textContent = f(S.allowText, new URL(url).hostname);
  $('allow-btn').textContent = S.allow;
  await new Promise(function(resolve) {
    $('allow-btn').onclick = async function() {
      var ok = false;
      try { ok = await browser.permissions.request({ origins: [origin] }); } catch (_) {}
      if (ok) resolve();
    };
  });
  return fetchBytes(url);
}

async function getDocumentBytes() {
  // Opened from the shelf: the copy kept in the library
  if (fromShelf) {
    var lib = await loadLibrary();
    var book = lib.books[fromShelf];
    var file = await readFile(fromShelf, 'pdf');
    if (book && file) return { data: new Uint8Array(await file.arrayBuffer()), name: book.name || book.title, key: book.key };
    if (book && book.src && /^https?:/i.test(book.src)) src = book.src;
    else throw new Error(S.missing);
  }
  if (src && /^https?:/i.test(src)) {
    var name = fileName(src);
    try { return { data: await fetchBytes(src), name: name, key: 'pdf:' + src }; }
    catch (_) { return { data: await askForAccess(src), name: name, key: 'pdf:' + src }; }
  }
  return askForFile(src ? fileName(src) : null);
}

// ---- Layout: items → segments → reading order ----

function median(xs) {
  if (!xs.length) return 0;
  var s = xs.slice().sort(function(a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}

function segmentText(items) {
  var text = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i], prev = items[i - 1];
    if (prev && !/\s$/.test(text) && !/^\s/.test(it.str) && it.x - (prev.x + prev.w) > prev.h * 0.12) text += ' ';
    text += it.str;
  }
  return text.replace(/\s+/g, ' ').trim();
}

// Groups a page's items into segments: pieces of a line, split where a wide
// gap separates two columns ({items, y, h, x, right, text})
function segmentsOf(items, pageWidth) {
  var rows = [];
  items.filter(function(it) { return it.str; })
    .sort(function(a, b) { return b.y - a.y || a.x - b.x; })
    .forEach(function(it) {
      var row = rows.find(function(r) { return Math.abs(r.y - it.y) <= Math.max(r.h, it.h) * 0.5; });
      if (row) { row.items.push(it); row.h = Math.max(row.h, it.h); }
      else rows.push({ y: it.y, h: it.h, items: [it] });
    });
  var segs = [];
  rows.forEach(function(r) {
    r.items.sort(function(a, b) { return a.x - b.x; });
    var cur = null;
    r.items.forEach(function(it) {
      var gap = cur ? it.x - cur.right : 0;
      if (!cur || gap > Math.max(r.h * 2.2, pageWidth * 0.035)) {
        cur = { y: r.y, h: r.h, items: [], x: it.x, right: it.x + it.w };
        segs.push(cur);
      }
      cur.items.push(it);
      cur.right = Math.max(cur.right, it.x + it.w);
    });
  });
  segs.forEach(function(sg) { sg.text = segmentText(sg.items); });
  return segs.filter(function(sg) { return sg.text; });
}

// The gutter between two columns, if the page has them: the widest vertical
// strip in the middle of the page that no segment crosses, with text on both sides
function gutterOf(segs, pageWidth) {
  if (segs.length < 8) return null;
  var bins = 200, step = pageWidth / bins, used = new Array(bins).fill(0);
  segs.forEach(function(sg) {
    for (var b = Math.max(0, Math.floor(sg.x / step)); b <= Math.min(bins - 1, Math.floor(sg.right / step)); b++) used[b]++;
  });
  // Segments spanning the whole width (titles) may cross it: allow a few
  var allowed = Math.max(1, Math.floor(segs.length * 0.12));
  var best = null, start = -1;
  for (var b = Math.floor(bins * 0.3); b <= Math.ceil(bins * 0.7); b++) {
    if (used[b] <= allowed) { if (start < 0) start = b; }
    else if (start >= 0) { if (!best || b - start > best.w) best = { from: start, w: b - start }; start = -1; }
  }
  if (start >= 0) { var end = Math.ceil(bins * 0.7) + 1; if (!best || end - start > best.w) best = { from: start, w: end - start }; }
  if (!best || best.w * step < pageWidth * 0.015) return null;
  var g0 = best.from * step, g1 = (best.from + best.w) * step;
  var left = segs.filter(function(sg) { return sg.right <= g1; }).length;
  var right = segs.filter(function(sg) { return sg.x >= g0; }).length;
  return left >= 3 && right >= 3 ? { from: g0, to: g1 } : null;
}

// Segments in reading order: full-width blocks where they are, and between
// them the whole left column, then the right one
function readingOrder(segs, pageWidth) {
  var g = gutterOf(segs, pageWidth);
  var top = segs.slice().sort(function(a, b) { return b.y - a.y || a.x - b.x; });
  if (!g) { top.forEach(function(sg) { sg.col = 0; }); return top; }
  var out = [], band = [];
  function flush() {
    ['l', 'r'].forEach(function(side) {
      band.filter(function(sg) { return sg.side === side; }).forEach(function(sg) { out.push(sg); });
    });
    band = [];
  }
  top.forEach(function(sg) {
    if (sg.right <= g.to + 1) sg.side = 'l';
    else if (sg.x >= g.from - 1) sg.side = 'r';
    else sg.side = 'span';
    sg.col = sg.side === 'r' ? 1 : 0;
    if (sg.side === 'span') { flush(); out.push(sg); } else band.push(sg);
  });
  flush();
  return out;
}

// Normalized form of a line, to spot running headers and footers ("Page 3" ≈ "Page 4")
function shape(text) { return text.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim(); }

function isPageNumber(text) { return /^(p(á|a)g(ina|e)?\.?\s*)?[\divxlcdm]{1,5}(\s*(\/|de|of)\s*\d+)?$/i.test(text.trim()); }

// Marks header/footer lines: near the top or bottom of the page and repeated
// on several pages, or just a page number
function markRunning(pages) {
  var counts = {};
  pages.forEach(function(pg) {
    var seen = {};
    pg.lines.forEach(function(l) {
      var zone = l.y > pg.height * 0.9 || l.y < pg.height * 0.1;
      if (!zone) return;
      var k = shape(l.text);
      if (!seen[k]) { seen[k] = true; counts[k] = (counts[k] || 0) + 1; }
    });
  });
  // Short documents: two pages are enough to call a line a running header
  var min = pages.length < 2 ? Infinity : Math.max(2, Math.ceil(pages.length * 0.3));
  pages.forEach(function(pg) {
    pg.lines.forEach(function(l) {
      var zone = l.y > pg.height * 0.9 || l.y < pg.height * 0.1;
      l.skip = zone && (counts[shape(l.text)] >= min || isPageNumber(l.text));
    });
  });
}

var ENDS = /[.!?:»"”…)]$/;

// Splits the lines into paragraphs: a bigger gap, a change of size or
// indentation, or a short line that ends a sentence starts a new one. Moving
// to the next column or page continues the paragraph unless the sentence ended.
function paragraphsOf(pages) {
  var paras = [];
  var cur = null;
  pages.forEach(function(pg) {
    var lines = pg.lines.filter(function(l) { return !l.skip; });
    var gaps = [];
    for (var i = 1; i < lines.length; i++) {
      var g = lines[i - 1].y - lines[i].y;
      if (g > 0 && lines[i - 1].col === lines[i].col) gaps.push(g);
    }
    var lead = median(gaps) || 14;
    var width = Math.max.apply(null, lines.map(function(l) { return l.right - l.x; }).concat([1]));
    lines.forEach(function(l, i) {
      var prev = lines[i - 1];
      var brk = !cur;
      if (!brk && prev && prev.col === l.col && prev.y > l.y) {
        var gap = prev.y - l.y;
        var ended = ENDS.test(prev.text);
        var colLeft = median(lines.filter(function(x) { return x.col === l.col; }).map(function(x) { return x.x; }));
        brk = gap > lead * 1.45 ||
          Math.abs(l.h - prev.h) > prev.h * 0.25 ||
          (ended && prev.right - prev.x < width * 0.8 * (pg.cols > 1 ? 0.5 : 1)) ||
          (ended && l.x - colLeft > l.h * 0.8);
      } else if (!brk) {
        // New column or new page: continues the last paragraph unless that one ended
        brk = ENDS.test(cur.lines[cur.lines.length - 1].text) || Math.abs(l.h - cur.lines[cur.lines.length - 1].h) > l.h * 0.25;
      }
      if (brk) { cur = { lines: [] }; paras.push(cur); }
      l.page = pg;
      cur.lines.push(l);
    });
  });
  return paras;
}

// Wraps each paragraph's spans in <div class="para"> (display: contents, so
// pdf.js's positioning is untouched); one per page it spans
function buildParagraphs(paras) {
  return paras.map(function(p) {
    var parts = [];
    var part = null;
    p.lines.forEach(function(l) {
      if (!part || part.page !== l.page) {
        part = { page: l.page, el: document.createElement('div') };
        part.el.className = 'para';
        l.page.layer.appendChild(part.el);
        parts.push(part);
      }
      l.items.forEach(function(it) { if (it.span) part.el.appendChild(it.span); });
    });
    var els = parts.map(function(x) { return x.el; });
    var el = els[0];
    el.__zenttsParts = els;
    var text = p.lines.map(function(l) { return l.text; }).join(' ')
      // join words hyphenated at the end of a line: "exam- ple" → "exam-ple" reads better than a pause
      .replace(/(\p{Ll})- (\p{Ll})/gu, '$1-$2');
    var first = p.lines[0];
    return { el: el, text: text, page: first.page.n, y: first.y, h: first.h };
  });
}

// ---- Rendering ----

var pageDivs = [];      // index n-1 → .page element
var viewports = [];     // index n-1 → viewport

async function renderDocument(doc) {
  var container = $('pages');
  var width = Math.min(860, document.documentElement.clientWidth - 32);
  var pages = [];
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting && !e.target.__drawn) { e.target.__drawn = true; e.target.__draw(); }
    });
  }, { rootMargin: '800px 0px' });

  for (var n = 1; n <= doc.numPages; n++) {
    $('loading-text').textContent = f(S.preparing, n, doc.numPages);
    $('loading-bar').style.width = Math.round(n * 100 / doc.numPages) + '%';
    var page = await doc.getPage(n);
    var base = page.getViewport({ scale: 1 });
    var viewport = page.getViewport({ scale: width / base.width });
    var div = document.createElement('div');
    div.className = 'page';
    div.dataset.page = n;
    div.style.width = Math.floor(viewport.width) + 'px';
    div.style.height = Math.floor(viewport.height) + 'px';
    div.style.setProperty('--scale-factor', viewport.scale);
    var layer = document.createElement('div');
    layer.className = 'textLayer';
    div.appendChild(layer);
    var num = document.createElement('span');
    num.className = 'num';
    num.textContent = n;
    div.appendChild(num);
    container.appendChild(div);
    pageDivs.push(div);
    viewports.push(viewport);

    div.__draw = (function(page, viewport, div) {
      return function() {
        var canvas = document.createElement('canvas');
        var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        div.insertBefore(canvas, div.firstChild);
        page.render({ canvasContext: canvas.getContext('2d'), viewport: viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null });
      };
    })(page, viewport, div);
    io.observe(div);

    var content = await page.getTextContent();
    var tl = new pdfjsLib.TextLayer({ textContentSource: content, container: layer, viewport: viewport });
    await tl.render();
    // textDivs match the items that have a string, in order
    var spans = tl.textDivs;
    var items = [];
    var k = 0;
    content.items.forEach(function(it) {
      if (it.str === undefined) return;
      var span = spans[k++];
      items.push({ str: it.str, eol: it.hasEOL, x: it.transform[4], y: it.transform[5], w: it.width, h: Math.abs(it.transform[3]) || it.height || 10, span: span });
    });
    var lines = readingOrder(segmentsOf(items, base.width), base.width);
    pages.push({ n: n, height: base.height, width: base.width, layer: layer, lines: lines,
      cols: lines.some(function(l) { return l.col === 1; }) ? 2 : 1 });
  }
  return pages;
}

// ---- On the shelf ----

// Adds (or updates) the book in the library. The same PDF already on the
// shelf (same bytes) keeps its entry and its progress key.
async function shelve(doc, got, title, author) {
  var res = await shelveDocument(doc, {
    data: got.data, name: got.name, key: got.key,
    src: src && /^https?:/i.test(src) ? src : null, title: title, author: author
  });
  got.key = res.key;
  return res.id;
}

// ---- Where you are: page indicator, remembered page ----

var bookKey = null;
var currentPage = 1;
var saveTimer = null;

function trackPages(total) {
  var visible = new Map();
  var io = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) { visible.set(+e.target.dataset.page, e.intersectionRatio); });
    var best = currentPage, ratio = -1;
    visible.forEach(function(r, n) { if (r > ratio) { ratio = r; best = n; } });
    if (best !== currentPage) {
      currentPage = best;
      $('doc-page').textContent = f(S.page, currentPage, total);
      clearTimeout(saveTimer);
      saveTimer = setTimeout(savePosition, 800);
    }
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
  pageDivs.forEach(function(d) { io.observe(d); });
  $('doc-page').textContent = f(S.page, currentPage, total);
}

function savePosition() {
  if (!bookKey) return;
  var div = pageDivs[currentPage - 1];
  var frac = div ? Math.max(0, Math.min(1, -div.getBoundingClientRect().top / div.offsetHeight)) : 0;
  updateBook(bookKey, { lastPage: currentPage, pageFrac: +frac.toFixed(3), progress: +(currentPage / pageDivs.length).toFixed(4), readAt: Date.now() });
}

function goToPage(n, pdfY) {
  var div = pageDivs[n - 1];
  if (!div) return;
  var offset = 0;
  if (pdfY != null && viewports[n - 1]) offset = Math.max(0, viewports[n - 1].convertToViewportPoint(0, pdfY)[1] - 40);
  window.scrollTo({ top: div.getBoundingClientRect().top + window.scrollY - 60 + offset, behavior: 'auto' });
}

// ---- Table of contents ----

var tocEntries = [];   // flat, in document order: { page, y, li }

async function resolveDest(doc, dest) {
  try {
    if (typeof dest === 'string') dest = await doc.getDestination(dest);
    if (!Array.isArray(dest) || !dest[0]) return null;
    var index = typeof dest[0] === 'object' ? await doc.getPageIndex(dest[0]) : dest[0];
    var kind = dest[1] && dest[1].name;
    var y = kind === 'XYZ' ? dest[3] : (kind === 'FitH' || kind === 'FitBH') ? dest[2] : null;
    return { page: index + 1, y: typeof y === 'number' ? y : null };
  } catch (_) { return null; }
}

// Without an outline: lines clearly bigger than the body text
function headingsOf(pages) {
  var sizes = [];
  pages.forEach(function(pg) { pg.lines.forEach(function(l) { if (!l.skip) sizes.push(l.h); }); });
  var body = median(sizes) || 10;
  var out = [];
  pages.forEach(function(pg) {
    pg.lines.forEach(function(l) {
      if (l.skip || l.h < body * 1.3 || l.text.length > 90 || l.text.length < 2) return;
      var prev = out[out.length - 1];
      // One heading over two lines
      if (prev && prev.page === pg.n && Math.abs(prev.h - l.h) < 0.5 && prev.y - l.y < l.h * 1.6) { prev.title += ' ' + l.text; prev.y = l.y; return; }
      out.push({ title: l.text, page: pg.n, y: l.y + l.h, h: l.h, items: [] });
    });
  });
  // Bigger headings are chapters, the rest sections under them
  var top = Math.max.apply(null, out.map(function(x) { return x.h; }).concat([0]));
  var tree = [];
  out.forEach(function(x) {
    if (x.h >= top * 0.92 || !tree.length) tree.push(x); else tree[tree.length - 1].items.push(x);
  });
  return tree;
}

async function buildToc(doc, pages) {
  var list = $('toc-list');
  var outline = null;
  try { outline = await doc.getOutline(); } catch (_) {}
  var tree = [];
  async function convert(items) {
    var out = [];
    for (var i = 0; i < (items || []).length; i++) {
      var it = items[i];
      var at = await resolveDest(doc, it.dest);
      out.push({ title: it.title, page: at && at.page, y: at && at.y, items: await convert(it.items) });
    }
    return out;
  }
  if (outline && outline.length) tree = await convert(outline);
  else tree = headingsOf(pages);

  list.replaceChildren();
  tocEntries = [];
  if (!tree.length) {
    var none = document.createElement('p');
    none.className = 'toc-empty';
    none.textContent = S.noToc;
    list.appendChild(none);
    return;
  }
  function render(items, parent, depth) {
    var ul = document.createElement('ul');
    items.forEach(function(it) {
      var li = document.createElement('li');
      var row = document.createElement('div');
      row.className = 'toc-row';
      row.style.paddingLeft = (8 + depth * 14) + 'px';
      if (it.items && it.items.length) {
        var tog = document.createElement('button');
        tog.type = 'button';
        tog.className = 'toc-toggle';
        tog.textContent = '▸';
        tog.setAttribute('aria-expanded', 'false');
        tog.onclick = function() { var open = li.classList.toggle('open'); tog.setAttribute('aria-expanded', String(open)); };
        row.appendChild(tog);
      } else {
        var sp = document.createElement('span');
        sp.className = 'toc-toggle';
        row.appendChild(sp);
      }
      var a = document.createElement('button');
      a.type = 'button';
      a.className = 'toc-link';
      a.textContent = it.title;
      var pg = document.createElement('span');
      pg.className = 'toc-page';
      pg.textContent = it.page || '';
      a.appendChild(pg);
      a.onclick = function() { if (it.page) jumpTo(it.page, it.y); };
      row.appendChild(a);
      li.appendChild(row);
      if (it.page) tocEntries.push({ page: it.page, y: it.y == null ? Infinity : it.y, li: li });
      if (it.items && it.items.length) render(it.items, li, depth + 1);
      ul.appendChild(li);
    });
    parent.appendChild(ul);
  }
  render(tree, list, 0);
}

var paragraphsRef = [];

// Scrolls there; while reading, reading moves there too
function jumpTo(page, y) {
  goToPage(page, y);
  var target = paragraphsRef.find(function(p) { return p.page > page || (p.page === page && (y == null || p.y <= y + 2)); });
  if (target) window.dispatchEvent(new CustomEvent('zentts-seek', { detail: { el: target.el } }));
  if (window.innerWidth < 900) toggleToc(false);
}

// Marks the section being read
function markSection(page, y) {
  var current = null;
  tocEntries.forEach(function(e) { if (e.page < page || (e.page === page && e.y >= y - 2)) current = e; });
  tocEntries.forEach(function(e) { e.li.classList.toggle('current', e === current); });
  if (current) {
    for (var p = current.li.parentElement; p && p.id !== 'toc-list'; p = p.parentElement) if (p.tagName === 'LI') p.classList.add('open');
  }
}

function toggleToc(on) {
  var open = on === undefined ? !document.body.classList.contains('toc-open') : on;
  document.body.classList.toggle('toc-open', open);
  $('toc-btn').setAttribute('aria-expanded', String(open));
}

// ---- Start ----

async function start() {
  $('open-other').textContent = S.other;
  $('open-other').onclick = function() { location.href = browser.runtime.getURL('reader.html'); };
  $('toc-btn').textContent = S.toc;
  $('toc-btn').onclick = function() { toggleToc(); };
  $('toc-title').textContent = S.toc;
  $('toc-close').setAttribute('aria-label', S.close);
  $('toc-close').onclick = function() { toggleToc(false); };
  $('library-btn').textContent = S.library;
  $('library-btn').onclick = function() { location.href = browser.runtime.getURL('library.html'); };

  var got;
  try { got = await getDocumentBytes(); } catch (e) { show('loading'); $('loading-text').textContent = f(S.failed, e.message); $('loading-bar').parentNode.hidden = true; return; }
  show('loading');
  $('loading-text').textContent = S.loading;
  var doc;
  try { doc = await pdfjsLib.getDocument({ data: got.data.slice(0) }).promise; }
  catch (e) { $('loading-text').textContent = f(S.failed, e.message); return; }

  var meta = null;
  try { meta = await doc.getMetadata(); } catch (_) {}
  var title = (meta && meta.info && meta.info.Title) || got.name.replace(/\.pdf$/i, '');
  var author = realAuthor(meta && meta.info && meta.info.Author);
  document.title = title + ' · zenTTS';
  $('doc-title').textContent = title;
  $('doc-pages').textContent = f(S.pages, doc.numPages);
  $('open-other').hidden = false;

  try { bookKey = await shelve(doc, got, title, author); } catch (e) { console.error('[zenTTS] library:', e.message || e); }

  var pages = await renderDocument(doc);
  markRunning(pages);
  var paras = buildParagraphs(paragraphsOf(pages));
  paragraphsRef = paras;
  $('loading').hidden = true;
  $('toc-btn').hidden = false;
  if (!paras.length) { show('loading'); $('loading-text').textContent = S.noText; $('loading-bar').parentNode.hidden = true; return; }

  buildToc(doc, pages);

  // Back to the page you were on
  var lib = await loadLibrary();
  var book = bookKey && lib.books[bookKey];
  if (book && book.lastPage > 1) {
    currentPage = book.lastPage;
    goToPage(book.lastPage);
    var div = pageDivs[book.lastPage - 1];
    if (div && book.pageFrac) window.scrollBy(0, div.offsetHeight * book.pageFrac);
  }
  trackPages(doc.numPages);

  // The content script says which paragraph is being read
  window.addEventListener('zentts-reading', function(e) {
    var p = paras.find(function(x) { return x.el === e.detail.el; });
    if (!p) return;
    markSection(p.page, p.y);
    if (bookKey) updateBook(bookKey, { readPage: p.page });
  });

  window.__zentts_embed = {
    key: got.key,
    title: title,
    paragraphs: function() { return paras; }
  };
  setHighlightTheme('overlay');
  await import('./content.js');
}

window.addEventListener('pagehide', savePosition);

start();
