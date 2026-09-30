// zenTTS library store — shared by the PDF reader and the library page.
//
// Metadata lives in storage.local under "library":
//   { books: { id: Book }, tags: [{ id, name, color }], settings: {…} }
// Files live in the extension's origin-private file system, under
// library/<id>/: the PDF itself ("pdf"), the generated covers ("cover",
// "back") and the ones you set yourself ("cover-custom", "back-custom").
// Keeping a copy of the PDF is what lets a local file be reopened from the
// shelf: Firefox never lets an extension read it again from disk.

var KEY = 'library';

export var DEFAULT_SETTINGS = { wood: 'oak', sort: 'recent', size: 'm', keepCopies: true };

// Short stable id from the reader's progress key ("pdf:<url>" or "pdf:<name>:<size>")
export function bookId(key) {
  var h = 2166136261;
  for (var i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 'b' + (h >>> 0).toString(36);
}

export async function loadLibrary() {
  var got = {};
  try { got = (await browser.storage.local.get(KEY))[KEY] || {}; } catch (_) {}
  return {
    books: got.books || {},
    tags: got.tags || [],
    settings: Object.assign({}, DEFAULT_SETTINGS, got.settings || {})
  };
}

export async function saveLibrary(lib) {
  try { await browser.storage.local.set({ [KEY]: lib }); } catch (_) {}
}

// Merges `patch` into a book (creating it) and saves; returns the book
export async function updateBook(id, patch) {
  var lib = await loadLibrary();
  var book = Object.assign({ id: id, tags: [], addedAt: Date.now() }, lib.books[id] || {}, patch);
  lib.books[id] = book;
  await saveLibrary(lib);
  return book;
}

export async function removeBook(id) {
  var lib = await loadLibrary();
  delete lib.books[id];
  await saveLibrary(lib);
  try {
    var root = await libraryDir(false);
    await root.removeEntry(id, { recursive: true });
  } catch (_) {}
}

// ---- Files (OPFS) ----

async function libraryDir(create) {
  var root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle('library', { create: create });
}

async function bookDir(id, create) {
  var lib = await libraryDir(create);
  return lib.getDirectoryHandle(id, { create: create });
}

export async function writeFile(id, name, blob) {
  var dir = await bookDir(id, true);
  var handle = await dir.getFileHandle(name, { create: true });
  var w = await handle.createWritable();
  await w.write(blob);
  await w.close();
}

// File or null
export async function readFile(id, name) {
  try {
    var dir = await bookDir(id, false);
    return await (await dir.getFileHandle(name)).getFile();
  } catch (_) { return null; }
}

export async function removeFile(id, name) {
  try { var dir = await bookDir(id, false); await dir.removeEntry(name); } catch (_) {}
}

// Object URL of a cover ("cover" or "back"): yours if set, else the generated one
export async function coverUrl(id, which) {
  var f = (await readFile(id, which + '-custom')) || (await readFile(id, which));
  return f ? URL.createObjectURL(f) : null;
}

// Average color of a canvas, leaving out near-white paper: the spine color
export function dominantColor(canvas) {
  try {
    var small = document.createElement('canvas');
    small.width = 24; small.height = 32;
    var ctx = small.getContext('2d');
    ctx.drawImage(canvas, 0, 0, 24, 32);
    var d = ctx.getImageData(0, 0, 24, 32).data;
    var r = 0, g = 0, b = 0, n = 0;
    for (var i = 0; i < d.length; i += 4) {
      if (d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235) continue;
      r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
    }
    if (n < 20) return null;
    r /= n; g /= n; b /= n;
    // Greyish (a page of text): no real color to take
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 28) return null;
    // A bit darker, so the spine reads as cloth, not as paper
    return '#' + [r, g, b].map(function(v) { return Math.round(v * 0.72).toString(16).padStart(2, '0'); }).join('');
  } catch (_) { return null; }
}

// Bookbinding colors for books whose cover gives none, picked from the id
var CLOTH = ['#7b2e22', '#2f4f6e', '#3d5a3e', '#6b3f5e', '#8a5a1f', '#44505a', '#5c3a27', '#2c5a57'];
export function clothColor(id) {
  var h = 0;
  for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return CLOTH[h % CLOTH.length];
}

// Placeholder authors some PDF tools write
export function realAuthor(a) {
  return a && !/^(anonymous|unknown|author|user|admin|desconocido)$/i.test(a.trim()) ? a.trim() : '';
}

export function canvasBlob(canvas, type, quality) {
  return new Promise(function(resolve) { canvas.toBlob(resolve, type || 'image/webp', quality || 0.85); });
}
