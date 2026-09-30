// zenTTS — putting PDFs on the shelf. Shared by the reader (a PDF you open)
// and the library (PDFs you add, several at a time).
//
// A book is identified by the SHA-256 of its bytes, so the same PDF opened
// from the web and from your disk, or added twice, is a single book.

import * as pdfjsLib from 'pdfjs-dist';
import { bookId, loadLibrary, updateBook, writeFile, readFile, dominantColor, clothColor, realAuthor, canvasBlob } from './books.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = browser.runtime.getURL('vendor/pdfjs/pdf.worker.min.mjs');

export { pdfjsLib };

export async function sha256Hex(bytes) {
  var digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), function(b) { return b.toString(16).padStart(2, '0'); }).join('');
}

export function findByHash(lib, hash) {
  return Object.values(lib.books).find(function(b) { return b.hash === hash; }) || null;
}

export async function renderThumb(doc, n) {
  var page = await doc.getPage(n);
  var base = page.getViewport({ scale: 1 });
  var vp = page.getViewport({ scale: 360 / base.width });
  var canvas = document.createElement('canvas');
  canvas.width = Math.floor(vp.width); canvas.height = Math.floor(vp.height);
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp }).promise;
  return canvas;
}

// ---- ISBN printed in the book (copyright page, back cover) ----

function validIsbn(d) {
  if (d.length === 10) {
    var s = 0;
    for (var i = 0; i < 10; i++) s += (d[i] === 'X' ? 10 : +d[i]) * (10 - i);
    return s % 11 === 0;
  }
  if (d.length === 13 && /^97[89]/.test(d)) {
    var t = 0;
    for (var k = 0; k < 13; k++) t += +d[k] * (k % 2 ? 3 : 1);
    return t % 10 === 0;
  }
  return false;
}

export function isbnIn(text) {
  var re = /ISBN(?:-1[03])?[:\s]*((?:97[89][\s-]?)?(?:\d[\s-]?){9}[\dX])/gi, m;
  while ((m = re.exec(text))) {
    var digits = m[1].replace(/[\s-]/g, '').toUpperCase();
    if (validIsbn(digits)) return digits;
  }
  // A bare 13-digit number starting with 978/979 (barcodes)
  var bare = text.match(/\b97[89][\d-]{10,14}\b/g) || [];
  for (var i = 0; i < bare.length; i++) { var d = bare[i].replace(/-/g, ''); if (d.length === 13 && validIsbn(d)) return d; }
  return null;
}

// Looks in the first pages and the last two
export async function findIsbn(doc) {
  var pages = [];
  for (var n = 1; n <= Math.min(6, doc.numPages); n++) pages.push(n);
  for (var k = Math.max(7, doc.numPages - 1); k <= doc.numPages; k++) pages.push(k);
  for (var i = 0; i < pages.length; i++) {
    try {
      var tc = await (await doc.getPage(pages[i])).getTextContent();
      var found = isbnIn(tc.items.map(function(it) { return it.str; }).join(' '));
      if (found) return found;
    } catch (_) {}
  }
  return null;
}

// ---- Shelving ----

// Adds or updates the book for an open document. info: { data, name, key, src,
// title, author }. Returns { id, key, duplicate } — key is the existing book's
// if the same PDF was already on the shelf (so "continue" keeps its place).
export async function shelveDocument(doc, info) {
  var hash = await sha256Hex(info.data);
  var lib = await loadLibrary();
  var existing = findByHash(lib, hash) || lib.books[bookId(info.key)] || null;
  var id = existing ? existing.id : bookId(info.key);
  var key = existing && existing.key ? existing.key : info.key;
  var prev = existing || {};
  var patch = {
    key: key, hash: hash,
    title: prev.titleEdited || prev.meta ? prev.title : info.title,
    author: prev.authorEdited || prev.meta ? prev.author : (realAuthor(info.author) || prev.author || ''),
    name: prev.name || info.name, pages: doc.numPages, openedAt: Date.now(),
    src: info.src || prev.src || null, size: info.data.byteLength
  };
  if (lib.settings.keepCopies && !(await readFile(id, 'pdf'))) {
    try { await writeFile(id, 'pdf', new Blob([info.data], { type: 'application/pdf' })); patch.hasFile = true; } catch (_) {}
  }
  var book = await updateBook(id, patch);
  // The front cover right away (one small render), the rest afterwards
  try {
    if (!(await readFile(id, 'cover'))) {
      var c = await renderThumb(doc, 1);
      await writeFile(id, 'cover', await canvasBlob(c));
      if (!book.color) await updateBook(id, { color: dominantColor(c) || clothColor(id) });
      c.width = c.height = 0;
    }
  } catch (e) { console.error('[zenTTS] cover:', e.message || e); }
  var rest = (async function() {
    try {
      if (doc.numPages > 1 && !(await readFile(id, 'back'))) {
        var b = await renderThumb(doc, doc.numPages);
        await writeFile(id, 'back', await canvasBlob(b));
        b.width = b.height = 0;
      }
      if (!book.isbnFound) {
        var isbn = await findIsbn(doc);
        if (isbn) await updateBook(id, { isbnFound: isbn });
      }
    } catch (e) { console.error('[zenTTS] cover:', e.message || e); }
  })();
  return { id: id, key: key, duplicate: !!existing, done: rest };
}

// Library: adds one file. Returns { status: 'added' | 'duplicate' | 'failed', book, error }
export async function importFile(file) {
  var data;
  try { data = new Uint8Array(await file.arrayBuffer()); } catch (e) { return { status: 'failed', error: e.message }; }
  var hash = await sha256Hex(data);
  var lib = await loadLibrary();
  var dup = findByHash(lib, hash) || lib.books[bookId('pdf:' + file.name + ':' + file.size)];
  if (dup) return { status: 'duplicate', book: dup };
  var doc;
  try { doc = await pdfjsLib.getDocument({ data: data.slice(0) }).promise; }
  catch (e) { return { status: 'failed', error: e.message, name: file.name }; }
  try {
    var meta = null;
    try { meta = await doc.getMetadata(); } catch (_) {}
    var title = (meta && meta.info && meta.info.Title) || file.name.replace(/\.pdf$/i, '');
    var res = await shelveDocument(doc, {
      data: data, name: file.name, key: 'pdf:' + file.name + ':' + file.size,
      title: title, author: meta && meta.info && meta.info.Author
    });
    await res.done;
    var after = await loadLibrary();
    return { status: 'added', book: after.books[res.id] };
  } catch (e) {
    return { status: 'failed', error: e.message, name: file.name };
  } finally {
    doc.destroy();
  }
}
