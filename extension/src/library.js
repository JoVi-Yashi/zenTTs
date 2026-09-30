// zenTTS library — the PDFs you have opened, as books on a shelf.
//
// Each book stands with its spine to you (thickness from its page count,
// color from its cover). Hovering pulls it out and turns its cover towards
// you; choosing it brings it to the middle, slowly turning to show front and
// back cover, with the shelf set aside and blurred. Tags make sub-libraries.
// Data and files come from books.js (storage.local + OPFS).

import { loadLibrary, saveLibrary, updateBook, removeBook, coverUrl, writeFile, removeFile, clothColor, bookId, DEFAULT_SETTINGS } from './books.js';
import { importFile } from './pdfimport.js';
import { askAccess, searchBooks, cleanTitle, fetchCover } from './lookup.js';

var ES = (function() { try { return browser.i18n.getUILanguage().toLowerCase().startsWith('es'); } catch (_) { return true; } })();
var S = ES ? {
  title: '· Biblioteca', search: 'Buscar por título o autor', open: 'Abrir PDF', settings: 'Ajustes de la biblioteca',
  all: 'Todos', untagged: 'Sin etiqueta', newTag: '+ Etiqueta', tagName: 'Nombre de la etiqueta', delTag: '¿Borrar la etiqueta «%s»? Los libros se quedan.',
  empty: 'Aún no hay libros. Abre un PDF con el botón de zenTTS y aparecerá aquí.', emptyTag: 'No hay libros con esta etiqueta. Arrastra uno hasta la pestaña para añadirlo.',
  noMatch: 'Ningún libro coincide con la búsqueda.',
  page: 'Pág. %s de %s', percent: '%s %', never: 'Sin empezar', cont: 'Continuar leyendo', start: 'Empezar a leer',
  cover: 'Portada…', back: 'Contraportada…', resetCovers: 'Portadas originales', spine: 'Color del lomo',
  tags: 'Etiquetas', noTags: 'Crea etiquetas con «+ Etiqueta» para ordenar tus libros en estanterías.', remove: 'Quitar de la biblioteca',
  removeQ: '¿Quitar «%s» de la biblioteca? Se borra la copia guardada.', close: 'Cerrar', opened: 'Abierto %s',
  noCopy: 'Sin copia guardada: se abrirá desde su enlace original.',
  wood: 'Estantería', oak: 'Roble', walnut: 'Nogal', dark: 'Oscura', minimal: 'Minimalista',
  sort: 'Orden', recent: 'Recientes', byTitle: 'Título', byProgress: 'Progreso', size: 'Tamaño',
  keep: 'Guardar una copia de cada PDF', keepHint: 'Así los PDF de tu equipo se abren desde aquí sin volver a elegirlos.', used: 'Espacio usado: %s',
  pagesN: '%s págs.',
  add: 'Añadir PDF', modePdf: 'PDF', modeWeb: 'Web', modeLabel: 'Qué mostrar',
  adding: 'Añadiendo %s de %s · %s', added: 'Añadidos: %s', dups: 'Ya estaban: %s', failed: 'No se pudieron abrir: %s',
  review: 'Revisar datos (%s)', dismiss: 'Cerrar', dropHere: 'Suelta los PDF para añadirlos a la biblioteca',
  lookup: 'Buscar datos…', lookupTitle: 'Datos del libro', lookupSearch: 'Buscar', lookupNone: 'Ninguno de estos', lookupSkip: 'Saltar',
  lookupPick: 'Elegir', lookupEmpty: 'Sin resultados. Prueba con otro título o con el ISBN.', lookupOffline: 'No se pudo buscar (¿sin conexión?).',
  lookupDenied: 'Hace falta permitir el acceso a Open Library y Google Books para buscar.', lookupWait: 'Buscando…', lookupOf: '%s de %s',
  lookupHint: 'Elige el libro que corresponde a este PDF. Se aplican el título, el autor, el ISBN y la portada.',
  year: 'Año', publisher: 'Editorial', isbn: 'ISBN',
  webEmpty: 'Aún no hay obras de la web. Lo que leas con zenTTS en AO3, FanFiction, Wattpad, Webnovel u otras páginas aparecerá aquí, ordenado por sitio.',
  chapter: 'Capítulo %s de %s', chapterN: 'Capítulo %s', inChapter: '%s % del capítulo', contWeb: 'Seguir leyendo', openWork: 'Abrir la obra',
  removeWorkQ: '¿Quitar «%s» de la biblioteca?', rememberWeb: 'Recordar lo que leo en la web', rememberHint: 'Solo las páginas que zenTTS lee en voz alta.'
} : {
  title: '· Library', search: 'Search by title or author', open: 'Open PDF', settings: 'Library settings',
  all: 'All', untagged: 'Untagged', newTag: '+ Tag', tagName: 'Tag name', delTag: 'Delete the tag “%s”? The books stay.',
  empty: 'No books yet. Open a PDF with the zenTTS button and it will appear here.', emptyTag: 'No books with this tag. Drag one onto the tab to add it.',
  noMatch: 'No book matches the search.',
  page: 'Page %s of %s', percent: '%s%', never: 'Not started', cont: 'Continue reading', start: 'Start reading',
  cover: 'Cover…', back: 'Back cover…', resetCovers: 'Original covers', spine: 'Spine color',
  tags: 'Tags', noTags: 'Create tags with “+ Tag” to sort your books into shelves.', remove: 'Remove from library',
  removeQ: 'Remove “%s” from the library? Its saved copy is deleted.', close: 'Close', opened: 'Opened %s',
  noCopy: 'No saved copy: it will open from its original link.',
  wood: 'Shelf', oak: 'Oak', walnut: 'Walnut', dark: 'Dark', minimal: 'Minimal',
  sort: 'Order', recent: 'Recent', byTitle: 'Title', byProgress: 'Progress', size: 'Size',
  keep: 'Keep a copy of each PDF', keepHint: 'So PDFs from your computer open from here without choosing them again.', used: 'Space used: %s',
  pagesN: '%s pages',
  add: 'Add PDFs', modePdf: 'PDF', modeWeb: 'Web', modeLabel: 'What to show',
  adding: 'Adding %s of %s · %s', added: 'Added: %s', dups: 'Already there: %s', failed: 'Could not open: %s',
  review: 'Review details (%s)', dismiss: 'Close', dropHere: 'Drop the PDFs to add them to the library',
  lookup: 'Find details…', lookupTitle: 'Book details', lookupSearch: 'Search', lookupNone: 'None of these', lookupSkip: 'Skip',
  lookupPick: 'Choose', lookupEmpty: 'No results. Try another title or the ISBN.', lookupOffline: 'Could not search (offline?).',
  lookupDenied: 'Access to Open Library and Google Books is needed to search.', lookupWait: 'Searching…', lookupOf: '%s of %s',
  lookupHint: 'Choose the book this PDF is. Its title, author, ISBN and cover are applied.',
  year: 'Year', publisher: 'Publisher', isbn: 'ISBN',
  webEmpty: 'No web works yet. What you read with zenTTS on AO3, FanFiction, Wattpad, Webnovel or other pages will appear here, by site.',
  chapter: 'Chapter %s of %s', chapterN: 'Chapter %s', inChapter: '%s% of the chapter', contWeb: 'Keep reading', openWork: 'Open the work',
  removeWorkQ: 'Remove “%s” from the library?', rememberWeb: 'Remember what I read on the web', rememberHint: 'Only pages zenTTS reads aloud.'
};
function f(s) { var a = [].slice.call(arguments, 1); a.forEach(function(x) { s = s.replace('%s', x); }); return s; }
function $(id) { return document.getElementById(id); }
function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
var reduceMotion = function() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; };

var TAG_COLORS = ['#9a3b25', '#2f5d8a', '#3f7a4a', '#7a3b6e', '#b07a1c', '#4f6b73'];

var lib = null;
var web = { works: {} };   // works read on web pages (written by the content script)
var mode = 'pdf';          // 'pdf' or 'web'
var view = 'all';          // 'all' or a tag id
var query = '';
var covers = {};           // id → { cover, back } object URLs
var focusedId = null;
var shown = new Set();     // books already on screen (only new ones slide in)

// ---- Data helpers ----

// Web works look like books to the shelf: id, title, color, tags…
var SITE_LOOK = {
  ao3: { color: '#8f1d1d', icon: 'icons/sites/ao3.svg' },
  ffn: { color: '#2b3f78', icon: 'icons/sites/fanfiction.svg' },
  wattpad: { color: '#c9501f', icon: 'icons/sites/wattpad.svg' },
  webnovel: { color: '#23457a', icon: 'icons/sites/webnovel.svg' }
};

function asBook(w) {
  var look = SITE_LOOK[w.site] || {};
  return Object.assign({}, w, { id: 'w' + bookId(w.key), kind: 'web', color: w.color || look.color || clothColor(w.host || w.key) });
}

function books() {
  if (mode === 'web') return Object.values(web.works).map(asBook);
  return Object.values(lib.books);
}

function itemById(id) {
  if (lib.books[id]) return lib.books[id];
  var w = Object.values(web.works).find(function(x) { return 'w' + bookId(x.key) === id; });
  return w ? asBook(w) : null;
}

function thickness(b) {
  if (b.kind === 'web') return Math.round(Math.max(22, Math.min(60, 20 + (b.chapters || 12) * 1.2)));
  return Math.round(Math.max(22, Math.min(60, 16 + (b.pages || 60) / 9)));
}

function progressOf(b) {
  if (b.kind === 'web') {
    var within = b.chapterProgress || 0;
    return b.chapters ? Math.min(1, ((b.chapterNum || 1) - 1 + within) / b.chapters) : within;
  }
  var p = b.progress || (b.lastPage && b.pages ? b.lastPage / b.pages : 0);
  return Math.max(0, Math.min(1, p || 0));
}

function sorted(list) {
  var s = lib.settings.sort;
  return list.slice().sort(function(a, b) {
    if (s === 'title') return (a.title || '').localeCompare(b.title || '');
    if (s === 'progress') return progressOf(b) - progressOf(a);
    return (b.openedAt || b.addedAt || 0) - (a.openedAt || a.addedAt || 0);
  });
}

function matches(b) {
  if (!query) return true;
  var q = query.toLowerCase();
  return (b.title || '').toLowerCase().includes(q) || (b.author || '').toLowerCase().includes(q);
}

async function loadCovers(b) {
  if (covers[b.id]) return covers[b.id];
  if (b.kind === 'web') covers[b.id] = { cover: b.image || null, back: null };
  else covers[b.id] = { cover: await coverUrl(b.id, 'cover'), back: await coverUrl(b.id, 'back') };
  return covers[b.id];
}

function dropCovers(id) {
  var c = covers[id];
  if (c) {
    [c.cover, c.back].forEach(function(u) { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); });
  }
  delete covers[id];
}

function timeAgo(t) {
  if (!t) return '';
  try { return new Intl.RelativeTimeFormat(ES ? 'es' : 'en', { numeric: 'auto' }).format(-Math.round((Date.now() - t) / 86400000), 'day'); } catch (_) { return ''; }
}

// ---- A book element ----

function faceCover(b, which) {
  var face = el('div', 'face ' + which);
  var url = covers[b.id] && covers[b.id][which === 'front' ? 'cover' : 'back'];
  if (url) {
    var img = el('img');
    img.alt = '';
    img.src = url;
    img.draggable = false;
    face.appendChild(img);
  } else {
    // A cover drawn from the title, until there is a real one
    var plain = el('div', 'plain');
    plain.appendChild(el('b', null, which === 'front' ? b.title : ''));
    var sub = b.kind === 'web' ? b.siteName : b.author;
    if (which === 'front' && sub) plain.appendChild(el('i', null, sub));
    face.appendChild(plain);
  }
  return face;
}

function makeBook(b) {
  var btn = el('button', 'book');
  btn.type = 'button';
  btn.dataset.id = b.id;
  btn.style.setProperty('--d', thickness(b) + 'px');
  btn.style.setProperty('--thick', thickness(b) + 'px');
  btn.style.setProperty('--spine', b.color || clothColor(b.id));
  btn.setAttribute('aria-label', b.title + (b.author ? ', ' + b.author : '') + ' — ' + Math.round(progressOf(b) * 100) + ' %');
  btn.title = b.title;
  var b3 = el('div', 'b3');
  var spine = el('div', 'face spine');
  spine.appendChild(el('span', 't', b.title));
  var tick = el('div', 'progress-tick');
  var fill = el('i');
  fill.style.width = Math.round(progressOf(b) * 100) + '%';
  tick.appendChild(fill);
  spine.appendChild(tick);
  b3.append(spine, faceCover(b, 'front'), faceCover(b, 'back'), el('div', 'face edge'));
  btn.appendChild(b3);
  return btn;
}

// ---- Shelves ----

function groups() {
  var list = sorted(books().filter(matches));
  if (view !== 'all') {
    var tag = lib.tags.find(function(t) { return t.id === view; });
    return [{ label: tag ? tag.name : '', books: list.filter(function(b) { return (b.tags || []).includes(view); }) }];
  }
  if (mode === 'web') {
    // One shelf per site, the busiest first
    var bySite = {};
    list.forEach(function(b) { var k = b.siteName || b.host || '?'; (bySite[k] = bySite[k] || { label: k, site: b.site, books: [] }).books.push(b); });
    return Object.values(bySite).sort(function(a, b) { return b.books.length - a.books.length; });
  }
  if (!lib.tags.length) return [{ label: null, books: list }];
  var out = lib.tags.map(function(t) { return { label: t.name, color: t.color, books: list.filter(function(b) { return (b.tags || []).includes(t.id); }) }; })
    .filter(function(g) { return g.books.length; });
  var rest = list.filter(function(b) { return !(b.tags || []).some(function(id) { return lib.tags.some(function(t) { return t.id === id; }); }); });
  if (rest.length) out.push({ label: S.untagged, books: rest });
  return out;
}

// Splits books into rows that fit the case's width
function rowsOf(list, width) {
  var rows = [[]], used = 0;
  list.forEach(function(b) {
    var w = thickness(b) + 3;
    if (used + w > width && rows[rows.length - 1].length) { rows.push([]); used = 0; }
    rows[rows.length - 1].push(b);
    used += w;
  });
  return rows;
}

function renderStage() {
  var stage = $('stage');
  stage.replaceChildren();
  var cs = el('div', 'case');
  stage.appendChild(cs);
  var all = books();
  var gs = groups();
  var total = gs.reduce(function(n, g) { return n + g.books.length; }, 0);
  if (!total) {
    var row = el('div', 'row');
    var empty = el('div', 'empty');
    empty.style.width = '100%';
    empty.appendChild(el('div', null, !all.length ? (mode === 'web' ? S.webEmpty : S.empty) : query ? S.noMatch : S.emptyTag));
    if (!all.length && mode === 'pdf') {
      var open = el('button', 'btn', S.add);
      open.type = 'button';
      open.onclick = pickPdfs;
      empty.appendChild(open);
    }
    row.appendChild(empty);
    cs.append(row, el('div', 'plank'));
    return;
  }
  var width = Math.max(200, cs.clientWidth - 44 - 36);
  var k = 0;
  gs.forEach(function(g) {
    if (g.label) {
      var lab = el('div', 'group-label', g.label);
      var look = SITE_LOOK[g.site];
      if (look) {
        var ic = el('img');
        ic.src = look.icon; ic.alt = ''; ic.width = 14; ic.height = 14;
        lab.prepend(ic);
      }
      cs.appendChild(lab);
    }
    rowsOf(g.books, width).forEach(function(r) {
      var row = el('div', 'row');
      r.forEach(function(b) {
        var bk = makeBook(b);
        if (!shown.has(b.id)) {
          shown.add(b.id);
          bk.classList.add('new');
          bk.style.setProperty('--delay', Math.min(k++ * 0.03, 0.6) + 's');
        }
        row.appendChild(bk);
      });
      row.appendChild(el('div', 'bookend'));
      cs.append(row, el('div', 'plank'));
    });
  });
  wireBooks(cs);
}

function wireBooks(root) {
  root.querySelectorAll('.book').forEach(function(bk) {
    var id = bk.dataset.id;
    // Turn towards the nearer side of the shelf, so the cover faces the middle
    function aim() {
      var r = bk.getBoundingClientRect(), row = bk.parentElement.getBoundingClientRect();
      var left = r.left + r.width / 2 < row.left + row.width / 2;
      bk.style.setProperty('--turn', left ? '-68deg' : '-112deg');
    }
    // Lift after a short intent delay and drop with a short grace: passing over
    // books quickly, or along an edge, never makes them jump back and forth
    bk.addEventListener('pointerenter', function() { aim(); intend(bk, true); });
    bk.addEventListener('pointerleave', function() { intend(bk, false); });
    bk.addEventListener('focus', aim);
    bk.addEventListener('click', function() { openFocus(id, bk); });
    // Drag onto a tag tab to tag it
    bk.draggable = true;
    bk.addEventListener('dragstart', function(e) { e.dataTransfer.setData('text/zentts-book', id); e.dataTransfer.effectAllowed = 'copy'; bk.classList.add('dragging'); });
    bk.addEventListener('dragend', function() { bk.classList.remove('dragging'); });
  });
}

var liftTimer = null, lifted = null;
function intend(bk, on) {
  clearTimeout(liftTimer);
  liftTimer = setTimeout(function() {
    if (on) {
      if (lifted && lifted !== bk) lifted.classList.remove('lifted');
      bk.classList.add('lifted');
      lifted = bk;
    } else if (lifted === bk) {
      bk.classList.remove('lifted');
      lifted = null;
    }
  }, on ? 60 : 90);
}

// Arrow keys move between books
document.addEventListener('keydown', function(e) {
  if (!$('lookup').hidden) { if (e.key === 'Escape') closeLookup(); return; }
  if (focusedId) { if (e.key === 'Escape') closeFocus(); return; }
  if (e.key === 'Escape') { $('settings').hidden = true; return; }
  var cur = document.activeElement;
  if (!cur || !cur.classList || !cur.classList.contains('book')) return;
  var all = Array.prototype.slice.call(document.querySelectorAll('#stage .book'));
  var i = all.indexOf(cur);
  if (e.key === 'ArrowRight' && all[i + 1]) { e.preventDefault(); all[i + 1].focus(); }
  if (e.key === 'ArrowLeft' && all[i - 1]) { e.preventDefault(); all[i - 1].focus(); }
});

// ---- Tabs (tags) ----

function renderTabs() {
  var nav = $('tabs');
  nav.replaceChildren();
  function tab(id, name, color, count) {
    var t = el('div', 'tab');
    t.setAttribute('role', 'tab');
    t.tabIndex = 0;
    t.setAttribute('aria-selected', String(view === id));
    if (color) { var dot = el('span', 'dot'); dot.style.setProperty('--c', color); t.appendChild(dot); }
    var label = el('span', 'name', name);
    t.appendChild(label);
    t.appendChild(el('span', 'count', String(count)));
    t.onclick = function(e) { if (e.target.closest('.x') || e.target.tagName === 'INPUT') return; view = id; render(); };
    t.onkeydown = function(e) { if (e.key === 'Enter' && e.target === t) t.click(); };
    if (id !== 'all') {
      // Rename with a double click, delete with the ×
      t.ondblclick = function() { editTag(t, label, id); };
      var x = el('button', 'x', '×');
      x.type = 'button';
      x.setAttribute('aria-label', f(S.delTag, name));
      x.onclick = function() { deleteTag(id); };
      t.appendChild(x);
      t.addEventListener('dragover', function(e) { e.preventDefault(); t.classList.add('drop'); });
      t.addEventListener('dragleave', function() { t.classList.remove('drop'); });
      t.addEventListener('drop', function(e) {
        e.preventDefault();
        t.classList.remove('drop');
        var bid = e.dataTransfer.getData('text/zentts-book');
        if (bid) toggleTag(bid, id, true);
      });
    }
    nav.appendChild(t);
  }
  tab('all', S.all, null, books().length);
  lib.tags.forEach(function(t) { tab(t.id, t.name, t.color, books().filter(function(b) { return (b.tags || []).includes(t.id); }).length); });
  var add = el('button', 'tab new', S.newTag);
  add.type = 'button';
  add.onclick = function() { newTag(add); };
  nav.appendChild(add);
}

function newTag(btn) {
  var input = el('input');
  input.placeholder = S.tagName;
  btn.replaceChildren(input);
  input.focus();
  var finished = false;
  function done(save) {
    // Enter re-renders the tabs, which blurs the input: only once
    if (finished) return;
    finished = true;
    var name = input.value.trim();
    if (save && name) {
      var id = 't' + Date.now().toString(36);
      lib.tags.push({ id: id, name: name, color: TAG_COLORS[lib.tags.length % TAG_COLORS.length] });
      persist();
    }
    render();
  }
  input.onkeydown = function(e) { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
  input.onblur = function() { done(true); };
}

function editTag(tabEl, label, id) {
  var tag = lib.tags.find(function(t) { return t.id === id; });
  var input = el('input');
  input.value = tag.name;
  label.replaceWith(input);
  input.focus();
  input.select();
  var finished = false;
  function done(save) {
    if (finished) return;
    finished = true;
    if (save && input.value.trim()) { tag.name = input.value.trim(); persist(); }
    render();
  }
  input.onkeydown = function(e) { if (e.key === 'Enter') done(true); if (e.key === 'Escape') done(false); };
  input.onblur = function() { done(true); };
}

function deleteTag(id) {
  var tag = lib.tags.find(function(t) { return t.id === id; });
  if (!tag || !confirm(f(S.delTag, tag.name))) return;
  lib.tags = lib.tags.filter(function(t) { return t.id !== id; });
  books().forEach(function(b) { b.tags = (b.tags || []).filter(function(x) { return x !== id; }); });
  if (view === id) view = 'all';
  persist();
  render();
}

function toggleTag(id, tagId, on) {
  var b = lib.books[id] || Object.values(web.works).find(function(x) { return 'w' + bookId(x.key) === id; });
  if (!b) return;
  var tags = (b.tags || []).filter(function(x) { return x !== tagId; });
  if (on) tags.push(tagId);
  b.tags = tags;
  if (lib.books[id]) persist(); else persistWeb();
  render();
}

// ---- Focus: the chosen book, turning in the middle ----

var spin = { angle: -90, raf: 0, last: 0, hold: 0 };

function startSpin(b3) {
  cancelAnimationFrame(spin.raf);
  if (reduceMotion()) { b3.style.setProperty('--spin', '-90deg'); return; }
  function tick(t) {
    var dt = spin.last ? Math.min(50, t - spin.last) : 16;
    spin.last = t;
    if (Date.now() > spin.hold) spin.angle += dt * 0.022;       // one turn every ~16 s
    b3.style.setProperty('--spin', spin.angle.toFixed(2) + 'deg');
    spin.raf = requestAnimationFrame(tick);
  }
  spin.last = 0;
  spin.raf = requestAnimationFrame(tick);
}

async function openFocus(id, from) {
  var b = itemById(id);
  if (!b) return;
  focusedId = id;
  await loadCovers(b);
  var holder = $('focus-holder');
  holder.replaceChildren();
  var big = makeBook(b);
  big.removeAttribute('title');
  big.tabIndex = -1;
  big.draggable = false;
  var shadow = el('div', 'shadow');
  big.appendChild(shadow);
  holder.appendChild(big);
  (b.kind === 'web' ? renderWebCard : renderCard)(b);
  var focus = $('focus');
  focus.hidden = false;
  document.body.classList.add('focused');
  requestAnimationFrame(function() { focus.classList.add('show'); });

  var b3 = big.querySelector('.b3');
  spin.angle = -90;
  spin.hold = 0;
  // FLIP: fly from the shelf, turning from the spine to the cover
  if (from && !reduceMotion() && big.animate) {
    var a = from.getBoundingClientRect(), z = big.getBoundingClientRect();
    b3.style.setProperty('--spin', '0deg');
    big.animate([
      { transform: 'translate(' + (a.left + a.width / 2 - z.left - z.width / 2) + 'px,' + (a.top + a.height / 2 - z.top - z.height / 2) + 'px) scale(' + (a.height / z.height).toFixed(3) + ')' },
      { transform: 'none' }
    ], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
    b3.classList.add('fly');
    requestAnimationFrame(function() { b3.style.setProperty('--spin', '-90deg'); });
    setTimeout(function() { b3.classList.remove('fly'); if (focusedId === id) startSpin(b3); }, 700);
  } else {
    startSpin(b3);
  }

  // Drag to turn it by hand
  var drag = null;
  big.addEventListener('pointerdown', function(e) { drag = { x: e.clientX, a: spin.angle }; big.setPointerCapture(e.pointerId); spin.hold = Infinity; });
  big.addEventListener('pointermove', function(e) {
    if (!drag) return;
    spin.angle = drag.a + (e.clientX - drag.x) * 0.6;
    b3.style.setProperty('--spin', spin.angle + 'deg');
  });
  function release() { if (drag) { drag = null; spin.hold = Date.now() + 2500; } }
  big.addEventListener('pointerup', release);
  big.addEventListener('pointercancel', release);
}

function closeFocus() {
  if (!focusedId) return;
  var id = focusedId;
  focusedId = null;
  cancelAnimationFrame(spin.raf);
  var focus = $('focus');
  focus.classList.remove('show');
  document.body.classList.remove('focused');
  setTimeout(function() { if (!focusedId) { focus.hidden = true; $('focus-holder').replaceChildren(); } }, reduceMotion() ? 0 : 350);
  var back = document.querySelector('#stage .book[data-id="' + id + '"]');
  if (back) back.focus({ preventScroll: true });
}

$('focus').addEventListener('click', function(e) { if (e.target === $('focus') || e.target === $('focus-holder')) closeFocus(); });

function renderCard(b) {
  var card = $('card');
  card.replaceChildren();
  var close = el('button', 'btn ghost close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', S.close);
  close.onclick = closeFocus;
  card.appendChild(close);

  var title = el('input', 'title');
  title.value = b.title || '';
  title.onchange = async function() { await updateBook(b.id, { title: title.value.trim() || b.title, titleEdited: true }); await refresh(); };
  var author = el('input', 'author');
  author.value = b.author || '';
  author.placeholder = ES ? 'Autor' : 'Author';
  author.onchange = async function() { await updateBook(b.id, { author: author.value.trim(), authorEdited: true }); await refresh(); };
  card.append(title, author);

  var p = progressOf(b);
  var where = b.lastPage ? f(S.page, b.lastPage, b.pages || '?') + ' · ' + f(S.percent, Math.round(p * 100)) : S.never;
  card.appendChild(el('div', null, where));
  var meter = el('div', 'meter');
  var fill = el('i');
  fill.style.width = Math.round(p * 100) + '%';
  meter.appendChild(fill);
  card.appendChild(meter);
  var info = [b.pages ? f(S.pagesN, b.pages) : '', b.openedAt ? f(S.opened, timeAgo(b.openedAt)) : ''].filter(Boolean).join(' · ');
  card.appendChild(el('div', 'muted', info));
  // Details found in Open Library / Google Books (or the ISBN printed in the PDF)
  var details = [b.year ? S.year + ' ' + b.year : '', b.publisher || '', (b.isbn || b.isbnFound) ? S.isbn + ' ' + (b.isbn || b.isbnFound) : ''].filter(Boolean).join(' · ');
  if (details) card.appendChild(el('div', 'muted details', details));
  if (!b.hasFile && b.src) card.appendChild(el('div', 'muted', S.noCopy));

  var go = el('button', 'btn main', b.lastPage ? S.cont : S.start);
  go.type = 'button';
  go.onclick = function() { location.href = browser.runtime.getURL('reader.html') + '?book=' + encodeURIComponent(b.id); };
  card.appendChild(go);

  // Covers and spine
  var row = el('div', 'row2');
  function pick(which) {
    var input = $('img-input');
    input.value = '';
    input.onchange = async function() {
      var file = input.files[0];
      if (!file) return;
      await writeFile(b.id, which + '-custom', file);
      dropCovers(b.id);
      await refresh(true);
    };
    input.click();
  }
  var c1 = el('button', 'btn', S.cover); c1.type = 'button'; c1.onclick = function() { pick('cover'); };
  var c2 = el('button', 'btn', S.back); c2.type = 'button'; c2.onclick = function() { pick('back'); };
  var c3 = el('button', 'btn ghost', S.resetCovers); c3.type = 'button';
  c3.onclick = async function() { await removeFile(b.id, 'cover-custom'); await removeFile(b.id, 'back-custom'); dropCovers(b.id); await refresh(true); };
  var c4 = el('button', 'btn', S.lookup); c4.type = 'button';
  // The permission prompt has to come straight from the click
  c4.onclick = function() { var ok = askAccess(); openLookup([b.id], ok); };
  row.append(c4, c1, c2, c3);
  card.appendChild(row);
  var spineRow = el('label', 'row2');
  spineRow.appendChild(el('span', null, S.spine));
  var color = el('input');
  color.type = 'color';
  color.value = /^#[0-9a-f]{6}$/i.test(b.color || '') ? b.color : '#6b4a32';
  color.oninput = function() { document.querySelectorAll('.book[data-id="' + b.id + '"]').forEach(function(x) { x.style.setProperty('--spine', color.value); }); };
  color.onchange = async function() { await updateBook(b.id, { color: color.value }); lib = await loadLibrary(); renderStage(); };
  spineRow.appendChild(color);
  card.appendChild(spineRow);

  tagChips(card, b);

  var del = el('button', 'btn danger', S.remove);
  del.type = 'button';
  del.style.marginTop = '8px';
  del.onclick = async function() {
    if (!confirm(f(S.removeQ, b.title))) return;
    closeFocus();
    await removeBook(b.id);
    dropCovers(b.id);
    await refresh();
  };
  card.appendChild(del);
}

function tagChips(card, b) {
  card.appendChild(el('h3', null, S.tags));
  var tags = el('div', 'row2');
  if (!lib.tags.length) tags.appendChild(el('span', 'muted', S.noTags));
  lib.tags.forEach(function(t) {
    var on = (b.tags || []).includes(t.id);
    var chip = el('button', 'chip');
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(on));
    var dot = el('span', 'dot'); dot.style.setProperty('--c', t.color);
    chip.append(dot, document.createTextNode(t.name));
    chip.onclick = function() { toggleTag(b.id, t.id, !on); var x = itemById(b.id); if (x) (x.kind === 'web' ? renderWebCard : renderCard)(x); };
    tags.appendChild(chip);
  });
  card.appendChild(tags);
}

// A work read on the web: where you are, and back to it
function renderWebCard(b) {
  var card = $('card');
  card.replaceChildren();
  var close = el('button', 'btn ghost close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', S.close);
  close.onclick = closeFocus;
  card.appendChild(close);
  card.appendChild(el('div', 'title static', b.title));
  var who = el('div', 'author static');
  var look = SITE_LOOK[b.site];
  if (look) { var ic = el('img'); ic.src = look.icon; ic.alt = ''; ic.width = 14; ic.height = 14; who.appendChild(ic); }
  who.appendChild(document.createTextNode([b.author, b.siteName].filter(Boolean).join(' · ')));
  card.appendChild(who);

  var where = b.chapters ? f(S.chapter, b.chapterNum || 1, b.chapters) : (b.chapterNum ? f(S.chapterN, b.chapterNum) : '');
  if (b.chapterTitle && b.chapterTitle !== b.title) where = where ? where + ' · ' + b.chapterTitle : b.chapterTitle;
  if (where) card.appendChild(el('div', null, where));
  var p = progressOf(b);
  var meter = el('div', 'meter');
  var fill = el('i');
  fill.style.width = Math.round(p * 100) + '%';
  meter.appendChild(fill);
  card.appendChild(meter);
  card.appendChild(el('div', 'muted', [f(S.inChapter, Math.round((b.chapterProgress || 0) * 100)), b.openedAt ? f(S.opened, timeAgo(b.openedAt)) : ''].filter(Boolean).join(' · ')));

  var go = el('button', 'btn main', S.contWeb);
  go.type = 'button';
  go.onclick = function() { browser.tabs.create({ url: b.chapterUrl || b.workUrl }); };
  card.appendChild(go);
  if (b.workUrl && b.workUrl !== b.chapterUrl) {
    var work = el('button', 'btn', S.openWork);
    work.type = 'button';
    work.onclick = function() { browser.tabs.create({ url: b.workUrl }); };
    card.appendChild(work);
  }
  tagChips(card, b);
  var del = el('button', 'btn danger', S.remove);
  del.type = 'button';
  del.style.marginTop = '8px';
  del.onclick = async function() {
    if (!confirm(f(S.removeWorkQ, b.title))) return;
    closeFocus();
    delete web.works[b.key];
    await persistWeb();
    render();
  };
  card.appendChild(del);
}

// ---- Settings ----

function renderSettings() {
  var box = $('settings');
  box.replaceChildren();
  var st = lib.settings;
  function select(label, key, options) {
    var l = el('label');
    l.appendChild(el('span', null, label));
    var s = el('select');
    options.forEach(function(o) { var op = el('option', null, o[1]); op.value = o[0]; op.selected = st[key] === o[0]; s.appendChild(op); });
    s.onchange = function() { st[key] = s.value; persist(); applySettings(); renderStage(); };
    l.appendChild(s);
    box.appendChild(l);
  }
  select(S.wood, 'wood', [['oak', S.oak], ['walnut', S.walnut], ['dark', S.dark], ['minimal', S.minimal]]);
  select(S.sort, 'sort', [['recent', S.recent], ['title', S.byTitle], ['progress', S.byProgress]]);
  var sz = el('label');
  sz.appendChild(el('span', null, S.size));
  var seg = el('span', 'seg');
  ['s', 'm', 'l'].forEach(function(k) {
    var b = el('button', null, k.toUpperCase());
    b.type = 'button';
    b.setAttribute('aria-pressed', String(st.size === k));
    b.onclick = function() { st.size = k; persist(); applySettings(); renderSettings(); renderStage(); };
    seg.appendChild(b);
  });
  sz.appendChild(seg);
  box.appendChild(sz);
  var keep = el('label');
  keep.appendChild(el('span', null, S.keep));
  var cb = el('input');
  cb.type = 'checkbox';
  cb.checked = st.keepCopies !== false;
  cb.onchange = function() { st.keepCopies = cb.checked; persist(); };
  keep.appendChild(cb);
  box.appendChild(keep);
  box.appendChild(el('div', 'muted', S.keepHint));
  var remember = el('label');
  remember.appendChild(el('span', null, S.rememberWeb));
  var rb = el('input');
  rb.type = 'checkbox';
  browser.storage.local.get('rememberWeb').then(function(g) { rb.checked = g.rememberWeb !== false; });
  rb.onchange = function() { browser.storage.local.set({ rememberWeb: rb.checked }); };
  remember.appendChild(rb);
  box.appendChild(remember);
  box.appendChild(el('div', 'muted', S.rememberHint));
  var used = el('div', 'muted');
  box.appendChild(used);
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(function(e) { used.textContent = f(S.used, Math.round((e.usage || 0) / 1048576) + ' MB'); });
  }
}

function applySettings() {
  document.body.dataset.wood = lib.settings.wood || DEFAULT_SETTINGS.wood;
  document.body.dataset.size = lib.settings.size || DEFAULT_SETTINGS.size;
}

$('settings-btn').onclick = function(e) {
  e.stopPropagation();
  var box = $('settings');
  box.hidden = !box.hidden;
  if (!box.hidden) renderSettings();
};
document.addEventListener('click', function(e) {
  var box = $('settings');
  if (!box.hidden && !box.contains(e.target) && e.target !== $('settings-btn')) box.hidden = true;
});

// ---- Adding PDFs (several at once, no duplicates) ----

function pickPdfs() { $('pdf-input').value = ''; $('pdf-input').click(); }

function toast() {
  var t = $('import');
  t.hidden = false;
  t.replaceChildren();
  return t;
}

async function importFiles(files) {
  files = Array.prototype.filter.call(files, function(x) { return /pdf$/i.test(x.type) || /\.pdf$/i.test(x.name); });
  if (!files.length) return;
  if (mode !== 'pdf') setMode('pdf');
  var t = toast();
  var line = el('div', null, '');
  var bar = el('div', 'meter');
  var fill = el('i');
  bar.appendChild(fill);
  t.append(line, bar);
  var added = [], dups = [], failed = [];
  for (var i = 0; i < files.length; i++) {
    line.textContent = f(S.adding, i + 1, files.length, files[i].name);
    fill.style.width = Math.round(i * 100 / files.length) + '%';
    var r = await importFile(files[i]);
    if (r.status === 'added') added.push(r.book);
    else if (r.status === 'duplicate') dups.push(r.book);
    else failed.push(files[i].name);
    await refresh();
  }
  fill.style.width = '100%';
  // Summary, with the duplicates named and highlighted on the shelf
  t.replaceChildren();
  if (added.length) t.appendChild(el('div', null, f(S.added, added.length)));
  if (dups.length) t.appendChild(el('div', null, f(S.dups, dups.map(function(b) { return '«' + b.title + '»'; }).join(', '))));
  if (failed.length) t.appendChild(el('div', 'bad', f(S.failed, failed.join(', '))));
  var actions = el('div', 'row2');
  if (added.length) {
    var rev = el('button', 'btn main', f(S.review, added.length));
    rev.type = 'button';
    rev.onclick = function() { var ok = askAccess(); t.hidden = true; openLookup(added.map(function(b) { return b.id; }), ok); };
    actions.appendChild(rev);
  }
  var x = el('button', 'btn ghost', S.dismiss);
  x.type = 'button';
  x.onclick = function() { t.hidden = true; };
  actions.appendChild(x);
  t.appendChild(actions);
  dups.forEach(function(b) {
    var bk = document.querySelector('#stage .book[data-id="' + CSS.escape(b.id) + '"]');
    if (bk) { bk.classList.remove('pulse'); void bk.offsetWidth; bk.classList.add('pulse'); }
  });
}

$('pdf-input').addEventListener('change', function() { importFiles($('pdf-input').files); });

// Dropping PDFs anywhere on the page adds them
var dragDepth = 0;
document.addEventListener('dragenter', function(e) {
  if (!e.dataTransfer || ![].includes.call(e.dataTransfer.types, 'Files')) return;
  dragDepth++;
  document.body.classList.add('dropping');
});
document.addEventListener('dragleave', function() { if (--dragDepth <= 0) { dragDepth = 0; document.body.classList.remove('dropping'); } });
document.addEventListener('dragover', function(e) { if (e.dataTransfer && [].includes.call(e.dataTransfer.types, 'Files')) e.preventDefault(); });
document.addEventListener('drop', function(e) {
  if (!e.dataTransfer || !e.dataTransfer.files.length) return;
  e.preventDefault();
  dragDepth = 0;
  document.body.classList.remove('dropping');
  importFiles(e.dataTransfer.files);
});

// ---- Book details: the matches found, and you choose ----

var lookupQueue = [];

async function openLookup(ids, access) {
  lookupQueue = ids.slice();
  var box = $('lookup');
  box.hidden = false;
  requestAnimationFrame(function() { box.classList.add('show'); });
  var granted = false;
  try { granted = await access; } catch (_) {}
  showLookup(0, granted);
}

function closeLookup() {
  var box = $('lookup');
  box.classList.remove('show');
  setTimeout(function() { box.hidden = true; }, reduceMotion() ? 0 : 250);
}

async function showLookup(i, granted) {
  var box = $('lookup-body');
  var id = lookupQueue[i];
  var b = id && lib.books[id];
  if (!b) { closeLookup(); return; }
  box.replaceChildren();
  var head = el('div', 'lk-head');
  head.appendChild(el('h2', null, S.lookupTitle));
  if (lookupQueue.length > 1) head.appendChild(el('span', 'muted', f(S.lookupOf, i + 1, lookupQueue.length)));
  box.appendChild(head);
  box.appendChild(el('p', 'muted', S.lookupHint));
  var form = el('form', 'lk-form');
  var q = el('input');
  q.type = 'search';
  q.value = cleanTitle(b.meta ? b.title : (b.title || b.name));
  var go = el('button', 'btn', S.lookupSearch);
  form.append(q, go);
  box.appendChild(form);
  var list = el('div', 'lk-list');
  box.appendChild(list);
  var foot = el('div', 'row2 lk-foot');
  var none = el('button', 'btn ghost', lookupQueue.length > 1 ? S.lookupSkip : S.lookupNone);
  none.type = 'button';
  none.onclick = function() { next(); };
  foot.appendChild(none);
  box.appendChild(foot);

  function next() { if (i + 1 < lookupQueue.length) showLookup(i + 1, granted); else closeLookup(); }

  async function run(useIsbn) {
    list.replaceChildren(el('div', 'muted', S.lookupWait));
    if (!granted) { list.replaceChildren(el('div', 'bad', S.lookupDenied)); return; }
    var results;
    try { results = await searchBooks(q.value.trim(), useIsbn ? (b.isbn || b.isbnFound) : null); }
    catch (_) { list.replaceChildren(el('div', 'bad', S.lookupOffline)); return; }
    list.replaceChildren();
    if (!results.length) { list.appendChild(el('div', 'muted', S.lookupEmpty)); return; }
    results.slice(0, 12).forEach(function(r) {
      var item = el('div', 'lk-item');
      var img = el('div', 'lk-thumb');
      if (r.thumb) { var im = el('img'); im.src = r.thumb; im.alt = ''; im.loading = 'lazy'; img.appendChild(im); }
      var txt = el('div', 'lk-text');
      txt.appendChild(el('b', null, r.title + (r.subtitle ? ': ' + r.subtitle : '')));
      if (r.authors.length) txt.appendChild(el('div', null, r.authors.join(', ')));
      var bits = [r.year, r.publisher, r.isbn13 || r.isbn10 ? S.isbn + ' ' + (r.isbn13 || r.isbn10) : '', r.pages ? f(S.pagesN, r.pages) : ''].filter(Boolean).join(' · ');
      if (bits) txt.appendChild(el('div', 'muted', bits));
      txt.appendChild(el('span', 'lk-src', r.source));
      var pick = el('button', 'btn main', S.lookupPick);
      pick.type = 'button';
      pick.onclick = async function() {
        pick.disabled = true;
        await applyDetails(b, r);
        next();
      };
      item.append(img, txt, pick);
      list.appendChild(item);
    });
  }
  form.onsubmit = function(e) { e.preventDefault(); run(false); };
  run(!!(b.isbn || b.isbnFound));
}

async function applyDetails(b, r) {
  await updateBook(b.id, {
    title: r.title + (r.subtitle ? ': ' + r.subtitle : ''), author: r.authors.join(', '),
    year: r.year || null, publisher: r.publisher || '', isbn: r.isbn13 || r.isbn10 || b.isbnFound || null,
    meta: { source: r.source, at: Date.now() }
  });
  if (r.cover || r.thumb) {
    try {
      var blob;
      try { blob = await fetchCover(r.cover || r.thumb); } catch (_) { blob = await fetchCover(r.thumb); }
      await writeFile(b.id, 'cover-meta', blob);
    } catch (_) {}
  }
  dropCovers(b.id);
  await refresh(true);
}

$('lookup').addEventListener('click', function(e) { if (e.target === $('lookup')) closeLookup(); });

// ---- PDF / Web ----

function setMode(m) {
  mode = m;
  lib.settings.mode = m;
  persist();
  closeFocus();
  document.querySelectorAll('#mode button').forEach(function(b) { b.setAttribute('aria-pressed', String(b.dataset.mode === m)); });
  $('open-pdf').hidden = m !== 'pdf';
  view = 'all';
  render();
}

// ---- Glue ----

function openPdf() { location.href = browser.runtime.getURL('reader.html'); }

var saving = false;
function persist() {
  saving = true;
  saveLibrary(lib).then(function() { setTimeout(function() { saving = false; }, 50); });
}

async function persistWeb() {
  saving = true;
  try { await browser.storage.local.set({ webWorks: web }); } catch (_) {}
  setTimeout(function() { saving = false; }, 50);
}

async function loadWeb() {
  try { web = (await browser.storage.local.get('webWorks')).webWorks || { works: {} }; } catch (_) { web = { works: {} }; }
  if (!web.works) web.works = {};
}

async function refresh(reloadCovers) {
  lib = await loadLibrary();
  await loadWeb();
  if (reloadCovers) Object.keys(covers).forEach(dropCovers);
  await Promise.all(books().map(loadCovers));
  render();
  var b = focusedId && itemById(focusedId);
  if (b) {
    // Update the book in the middle without restarting its turn
    var holder = $('focus-holder');
    var old = holder.querySelector('.book');
    if (old && reloadCovers) {
      var fresh = makeBook(b).querySelector('.b3');
      var b3 = old.querySelector('.b3');
      b3.replaceChildren.apply(b3, Array.prototype.slice.call(fresh.children));
    }
    if (old) old.style.setProperty('--spine', b.color || clothColor(b.id));
    (b.kind === 'web' ? renderWebCard : renderCard)(b);
  }
}

function render() {
  applySettings();
  renderTabs();
  renderStage();
}

var resizeTimer = null;
window.addEventListener('resize', function() { clearTimeout(resizeTimer); resizeTimer = setTimeout(renderStage, 150); });

// Another tab (the reader, or a page being read) updated the library
browser.storage.onChanged.addListener(function(changes, area) {
  if (area === 'local' && (changes.library || changes.webWorks) && !saving) refresh();
});

async function init() {
  document.documentElement.lang = ES ? 'es' : 'en';
  $('lib-title').textContent = S.title;
  document.title = 'zenTTS ' + S.title;
  $('search').placeholder = S.search;
  $('open-pdf').textContent = S.add;
  $('open-pdf').onclick = pickPdfs;
  $('mode').setAttribute('aria-label', S.modeLabel);
  $('mode-pdf').textContent = S.modePdf;
  $('mode-web').textContent = S.modeWeb;
  $('mode-pdf').onclick = function() { setMode('pdf'); };
  $('mode-web').onclick = function() { setMode('web'); };
  $('drop-hint').textContent = S.dropHere;
  $('settings-btn').setAttribute('aria-label', S.settings);
  $('settings-btn').title = S.settings;
  $('search').addEventListener('input', function() { query = $('search').value.trim(); renderStage(); });
  lib = await loadLibrary();
  await loadWeb();
  mode = lib.settings.mode === 'web' ? 'web' : 'pdf';
  document.querySelectorAll('#mode button').forEach(function(b) { b.setAttribute('aria-pressed', String(b.dataset.mode === mode)); });
  $('open-pdf').hidden = mode !== 'pdf';
  await Promise.all(books().map(loadCovers));
  render();
}

init();
