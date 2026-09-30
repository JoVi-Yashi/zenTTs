// zenTTS PDF reader — an extension page that shows a PDF with pdf.js and
// reads it with the same panel, voices and highlighting as web pages.
//
// Web PDFs are fetched directly (asking for access to their site if needed).
// Local files (file://) can't be read by extensions in Firefox, so the reader
// asks you to drop or pick the file once.
//
// Each page is a canvas plus pdf.js's invisible text layer. Its lines are
// grouped into paragraphs (repeated headers, footers and page numbers are
// left out) and handed to the content script through window.__zentts_embed.

import * as pdfjsLib from 'pdfjs-dist';
import { setHighlightTheme } from './highlight.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = browser.runtime.getURL('vendor/pdfjs/pdf.worker.min.mjs');

var ES = (function() { try { return browser.i18n.getUILanguage().toLowerCase().startsWith('es'); } catch (_) { return true; } })();
var S = ES ? {
  dropTitle: 'Abre el PDF', dropNamed: 'Suelta aquí %s o elígelo para leerlo.', dropAny: 'Suelta aquí un PDF o elígelo para leerlo.',
  choose: 'Elegir PDF', why: 'Firefox no deja que las extensiones lean archivos de tu equipo por su cuenta: hace falta que lo abras tú una vez.',
  allowTitle: 'Permitir leer este PDF', allowText: 'zenTTS necesita permiso para descargar el PDF de %s.', allow: 'Permitir y abrir',
  loading: 'Abriendo el PDF…', preparing: 'Preparando la página %s de %s…', pages: '%s págs.', other: 'Abrir otro PDF',
  failed: 'No se pudo abrir el PDF: %s', noText: 'Este PDF no tiene texto seleccionable (parece escaneado), así que no se puede leer en voz alta.'
} : {
  dropTitle: 'Open the PDF', dropNamed: 'Drop %s here or choose it to read it.', dropAny: 'Drop a PDF here or choose one to read it.',
  choose: 'Choose PDF', why: "Firefox doesn't let extensions read files on your computer by themselves: you need to open it once.",
  allowTitle: 'Allow reading this PDF', allowText: 'zenTTS needs permission to download the PDF from %s.', allow: 'Allow and open',
  loading: 'Opening the PDF…', preparing: 'Preparing page %s of %s…', pages: '%s pages', other: 'Open another PDF',
  failed: 'Could not open the PDF: %s', noText: "This PDF has no selectable text (it looks scanned), so it can't be read aloud."
};
function f(s) { var a = [].slice.call(arguments, 1); a.forEach(function(x) { s = s.replace('%s', x); }); return s; }
function $(id) { return document.getElementById(id); }

var params = new URLSearchParams(location.search);
var src = params.get('src');

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
  if (src && /^https?:/i.test(src)) {
    var name = fileName(src);
    try { return { data: await fetchBytes(src), name: name, key: 'pdf:' + src }; }
    catch (_) { return { data: await askForAccess(src), name: name, key: 'pdf:' + src }; }
  }
  return askForFile(src ? fileName(src) : null);
}

// ---- Layout: lines → paragraphs ----

function lineOf(items) {
  var text = '';
  for (var i = 0; i < items.length; i++) {
    var it = items[i], prev = items[i - 1];
    if (prev && !/\s$/.test(text) && !/^\s/.test(it.str) && it.x - (prev.x + prev.w) > prev.h * 0.12) text += ' ';
    text += it.str;
  }
  return text.replace(/\s+/g, ' ').trim();
}

// Groups a page's text items into lines ({items, y, h, x, text})
function linesOf(items) {
  var lines = [];
  var cur = null;
  items.forEach(function(it) {
    if (!it.str && !it.eol) return;
    if (cur && Math.abs(it.y - cur.y) <= Math.max(cur.h, it.h) * 0.5) {
      cur.items.push(it);
      cur.h = Math.max(cur.h, it.h);
    } else {
      cur = { items: [it], y: it.y, h: it.h };
      lines.push(cur);
    }
  });
  lines.forEach(function(l) {
    l.items = l.items.filter(function(it) { return it.str; });
    l.x = l.items.length ? Math.min.apply(null, l.items.map(function(it) { return it.x; })) : 0;
    l.right = l.items.length ? Math.max.apply(null, l.items.map(function(it) { return it.x + it.w; })) : 0;
    l.text = lineOf(l.items);
  });
  return lines.filter(function(l) { return l.text; });
}

// Normalized form of a line, to spot running headers and footers ("Page 3" ≈ "Page 4")
function shape(text) { return text.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim(); }

function isPageNumber(text) { return /^(p(á|a)g(ina|e)?\.?\s*)?[\divxlcdm]{1,5}(\s*(\/|de|of)\s*\d+)?$/i.test(text.trim()); }

function median(xs) {
  if (!xs.length) return 0;
  var s = xs.slice().sort(function(a, b) { return a - b; });
  return s[Math.floor(s.length / 2)];
}

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

// Splits the lines into paragraphs: a bigger gap, a change of size or
// indentation, or a short line that ends a sentence starts a new one
function paragraphsOf(pages) {
  var paras = [];
  var cur = null;
  pages.forEach(function(pg) {
    var lines = pg.lines.filter(function(l) { return !l.skip; });
    var gaps = [];
    for (var i = 1; i < lines.length; i++) {
      var g = lines[i - 1].y - lines[i].y;
      if (g > 0) gaps.push(g);
    }
    var lead = median(gaps) || 14;
    var width = Math.max.apply(null, lines.map(function(l) { return l.right - l.x; }).concat([1]));
    var left = median(lines.map(function(l) { return l.x; }));
    lines.forEach(function(l, i) {
      var prev = lines[i - 1];
      var brk = !cur;
      if (!brk && prev) {
        var gap = prev.y - l.y;
        var ended = /[.!?:»"”…)]$/.test(prev.text);
        brk = gap > lead * 1.45 || gap < 0 ||
          Math.abs(l.h - prev.h) > prev.h * 0.25 ||
          (ended && prev.right - prev.x < width * 0.8) ||
          (ended && l.x - left > l.h * 0.8);
      } else if (!brk && !prev) {
        // First line of a page: continues the last paragraph unless that one ended
        brk = /[.!?:»"”…)]$/.test(cur.lines[cur.lines.length - 1].text);
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
        var first = l.items[0] && l.items[0].span;
        if (first && first.parentNode) first.parentNode.insertBefore(part.el, first);
        else l.page.layer.appendChild(part.el);
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
    return { el: el, text: text };
  });
}

// ---- Rendering ----

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
    pages.push({ n: n, height: base.height, layer: layer, lines: linesOf(items) });
  }
  return pages;
}

// ---- Start ----

async function start() {
  $('open-other').textContent = S.other;
  $('open-other').onclick = function() { location.href = browser.runtime.getURL('reader.html'); };
  var got;
  try { got = await getDocumentBytes(); } catch (e) { show('loading'); $('loading-text').textContent = f(S.failed, e.message); return; }
  show('loading');
  $('loading-text').textContent = S.loading;
  var doc;
  try { doc = await pdfjsLib.getDocument({ data: got.data }).promise; }
  catch (e) { $('loading-text').textContent = f(S.failed, e.message); return; }

  var meta = null;
  try { meta = await doc.getMetadata(); } catch (_) {}
  var title = (meta && meta.info && meta.info.Title) || got.name;
  document.title = title + ' · zenTTS';
  $('doc-title').textContent = title;
  $('doc-pages').textContent = f(S.pages, doc.numPages);
  $('open-other').hidden = false;

  var pages = await renderDocument(doc);
  markRunning(pages);
  var paras = buildParagraphs(paragraphsOf(pages));
  $('loading').hidden = true;
  if (!paras.length) { show('loading'); $('loading-text').textContent = S.noText; $('loading-bar').parentNode.hidden = true; return; }

  window.__zentts_embed = {
    key: got.key,
    title: title,
    paragraphs: function() { return paras; }
  };
  setHighlightTheme('overlay');
  await import('./content.js');
}

start();
