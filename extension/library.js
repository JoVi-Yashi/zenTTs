// src/books.js
var KEY = "library";
var DEFAULT_SETTINGS = { wood: "oak", sort: "recent", size: "m", keepCopies: true };
async function loadLibrary() {
  var got = {};
  try {
    got = (await browser.storage.local.get(KEY))[KEY] || {};
  } catch (_) {
  }
  return {
    books: got.books || {},
    tags: got.tags || [],
    settings: Object.assign({}, DEFAULT_SETTINGS, got.settings || {})
  };
}
async function saveLibrary(lib2) {
  try {
    await browser.storage.local.set({ [KEY]: lib2 });
  } catch (_) {
  }
}
async function updateBook(id, patch) {
  var lib2 = await loadLibrary();
  var book = Object.assign({ id, tags: [], addedAt: Date.now() }, lib2.books[id] || {}, patch);
  lib2.books[id] = book;
  await saveLibrary(lib2);
  return book;
}
async function removeBook(id) {
  var lib2 = await loadLibrary();
  delete lib2.books[id];
  await saveLibrary(lib2);
  try {
    var root = await libraryDir(false);
    await root.removeEntry(id, { recursive: true });
  } catch (_) {
  }
}
async function libraryDir(create) {
  var root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle("library", { create });
}
async function bookDir(id, create) {
  var lib2 = await libraryDir(create);
  return lib2.getDirectoryHandle(id, { create });
}
async function writeFile(id, name, blob) {
  var dir = await bookDir(id, true);
  var handle = await dir.getFileHandle(name, { create: true });
  var w = await handle.createWritable();
  await w.write(blob);
  await w.close();
}
async function readFile(id, name) {
  try {
    var dir = await bookDir(id, false);
    return await (await dir.getFileHandle(name)).getFile();
  } catch (_) {
    return null;
  }
}
async function removeFile(id, name) {
  try {
    var dir = await bookDir(id, false);
    await dir.removeEntry(name);
  } catch (_) {
  }
}
async function coverUrl(id, which) {
  var f2 = await readFile(id, which + "-custom") || await readFile(id, which);
  return f2 ? URL.createObjectURL(f2) : null;
}
var CLOTH = ["#7b2e22", "#2f4f6e", "#3d5a3e", "#6b3f5e", "#8a5a1f", "#44505a", "#5c3a27", "#2c5a57"];
function clothColor(id) {
  var h = 0;
  for (var i = 0; i < id.length; i++) h = h * 31 + id.charCodeAt(i) >>> 0;
  return CLOTH[h % CLOTH.length];
}

// src/library.js
var ES = (function() {
  try {
    return browser.i18n.getUILanguage().toLowerCase().startsWith("es");
  } catch (_) {
    return true;
  }
})();
var S = ES ? {
  title: "\xB7 Biblioteca",
  search: "Buscar por t\xEDtulo o autor",
  open: "Abrir PDF",
  settings: "Ajustes de la biblioteca",
  all: "Todos",
  untagged: "Sin etiqueta",
  newTag: "+ Etiqueta",
  tagName: "Nombre de la etiqueta",
  delTag: "\xBFBorrar la etiqueta \xAB%s\xBB? Los libros se quedan.",
  empty: "A\xFAn no hay libros. Abre un PDF con el bot\xF3n de zenTTS y aparecer\xE1 aqu\xED.",
  emptyTag: "No hay libros con esta etiqueta. Arrastra uno hasta la pesta\xF1a para a\xF1adirlo.",
  noMatch: "Ning\xFAn libro coincide con la b\xFAsqueda.",
  page: "P\xE1g. %s de %s",
  percent: "%s %",
  never: "Sin empezar",
  cont: "Continuar leyendo",
  start: "Empezar a leer",
  cover: "Portada\u2026",
  back: "Contraportada\u2026",
  resetCovers: "Portadas originales",
  spine: "Color del lomo",
  tags: "Etiquetas",
  noTags: "Crea etiquetas con \xAB+ Etiqueta\xBB para ordenar tus libros en estanter\xEDas.",
  remove: "Quitar de la biblioteca",
  removeQ: "\xBFQuitar \xAB%s\xBB de la biblioteca? Se borra la copia guardada.",
  close: "Cerrar",
  opened: "Abierto %s",
  noCopy: "Sin copia guardada: se abrir\xE1 desde su enlace original.",
  wood: "Estanter\xEDa",
  oak: "Roble",
  walnut: "Nogal",
  dark: "Oscura",
  minimal: "Minimalista",
  sort: "Orden",
  recent: "Recientes",
  byTitle: "T\xEDtulo",
  byProgress: "Progreso",
  size: "Tama\xF1o",
  keep: "Guardar una copia de cada PDF",
  keepHint: "As\xED los PDF de tu equipo se abren desde aqu\xED sin volver a elegirlos.",
  used: "Espacio usado: %s",
  pagesN: "%s p\xE1gs."
} : {
  title: "\xB7 Library",
  search: "Search by title or author",
  open: "Open PDF",
  settings: "Library settings",
  all: "All",
  untagged: "Untagged",
  newTag: "+ Tag",
  tagName: "Tag name",
  delTag: "Delete the tag \u201C%s\u201D? The books stay.",
  empty: "No books yet. Open a PDF with the zenTTS button and it will appear here.",
  emptyTag: "No books with this tag. Drag one onto the tab to add it.",
  noMatch: "No book matches the search.",
  page: "Page %s of %s",
  percent: "%s%",
  never: "Not started",
  cont: "Continue reading",
  start: "Start reading",
  cover: "Cover\u2026",
  back: "Back cover\u2026",
  resetCovers: "Original covers",
  spine: "Spine color",
  tags: "Tags",
  noTags: "Create tags with \u201C+ Tag\u201D to sort your books into shelves.",
  remove: "Remove from library",
  removeQ: "Remove \u201C%s\u201D from the library? Its saved copy is deleted.",
  close: "Close",
  opened: "Opened %s",
  noCopy: "No saved copy: it will open from its original link.",
  wood: "Shelf",
  oak: "Oak",
  walnut: "Walnut",
  dark: "Dark",
  minimal: "Minimal",
  sort: "Order",
  recent: "Recent",
  byTitle: "Title",
  byProgress: "Progress",
  size: "Size",
  keep: "Keep a copy of each PDF",
  keepHint: "So PDFs from your computer open from here without choosing them again.",
  used: "Space used: %s",
  pagesN: "%s pages"
};
function f(s) {
  var a = [].slice.call(arguments, 1);
  a.forEach(function(x) {
    s = s.replace("%s", x);
  });
  return s;
}
function $(id) {
  return document.getElementById(id);
}
function el(tag, cls, text) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}
var reduceMotion = function() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
var TAG_COLORS = ["#9a3b25", "#2f5d8a", "#3f7a4a", "#7a3b6e", "#b07a1c", "#4f6b73"];
var lib = null;
var view = "all";
var query = "";
var covers = {};
var focusedId = null;
function books() {
  return Object.values(lib.books);
}
function thickness(b) {
  return Math.round(Math.max(22, Math.min(60, 16 + (b.pages || 60) / 9)));
}
function progressOf(b) {
  var p = b.progress || (b.lastPage && b.pages ? b.lastPage / b.pages : 0);
  return Math.max(0, Math.min(1, p || 0));
}
function sorted(list) {
  var s = lib.settings.sort;
  return list.slice().sort(function(a, b) {
    if (s === "title") return (a.title || "").localeCompare(b.title || "");
    if (s === "progress") return progressOf(b) - progressOf(a);
    return (b.openedAt || b.addedAt || 0) - (a.openedAt || a.addedAt || 0);
  });
}
function matches(b) {
  if (!query) return true;
  var q = query.toLowerCase();
  return (b.title || "").toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q);
}
async function loadCovers(b) {
  if (covers[b.id]) return covers[b.id];
  covers[b.id] = { cover: await coverUrl(b.id, "cover"), back: await coverUrl(b.id, "back") };
  return covers[b.id];
}
function dropCovers(id) {
  var c = covers[id];
  if (c) {
    if (c.cover) URL.revokeObjectURL(c.cover);
    if (c.back) URL.revokeObjectURL(c.back);
  }
  delete covers[id];
}
function timeAgo(t) {
  if (!t) return "";
  try {
    return new Intl.RelativeTimeFormat(ES ? "es" : "en", { numeric: "auto" }).format(-Math.round((Date.now() - t) / 864e5), "day");
  } catch (_) {
    return "";
  }
}
function faceCover(b, which) {
  var face = el("div", "face " + which);
  var url = covers[b.id] && covers[b.id][which === "front" ? "cover" : "back"];
  if (url) {
    var img = el("img");
    img.alt = "";
    img.src = url;
    img.draggable = false;
    face.appendChild(img);
  } else {
    var plain = el("div", "plain");
    plain.appendChild(el("b", null, which === "front" ? b.title : ""));
    if (which === "front" && b.author) plain.appendChild(el("i", null, b.author));
    face.appendChild(plain);
  }
  return face;
}
function makeBook(b) {
  var btn = el("button", "book");
  btn.type = "button";
  btn.dataset.id = b.id;
  btn.style.setProperty("--d", thickness(b) + "px");
  btn.style.setProperty("--thick", thickness(b) + "px");
  btn.style.setProperty("--spine", b.color || clothColor(b.id));
  btn.setAttribute("aria-label", b.title + (b.author ? ", " + b.author : "") + " \u2014 " + Math.round(progressOf(b) * 100) + " %");
  btn.title = b.title;
  var b3 = el("div", "b3");
  var spine = el("div", "face spine");
  spine.appendChild(el("span", "t", b.title));
  var tick = el("div", "progress-tick");
  var fill = el("i");
  fill.style.width = Math.round(progressOf(b) * 100) + "%";
  tick.appendChild(fill);
  spine.appendChild(tick);
  b3.append(spine, faceCover(b, "front"), faceCover(b, "back"), el("div", "face edge"));
  btn.appendChild(b3);
  return btn;
}
function groups() {
  var list = sorted(books().filter(matches));
  if (view !== "all") {
    var tag = lib.tags.find(function(t) {
      return t.id === view;
    });
    return [{ label: tag ? tag.name : "", books: list.filter(function(b) {
      return (b.tags || []).includes(view);
    }) }];
  }
  if (!lib.tags.length) return [{ label: null, books: list }];
  var out = lib.tags.map(function(t) {
    return { label: t.name, color: t.color, books: list.filter(function(b) {
      return (b.tags || []).includes(t.id);
    }) };
  }).filter(function(g) {
    return g.books.length;
  });
  var rest = list.filter(function(b) {
    return !(b.tags || []).some(function(id) {
      return lib.tags.some(function(t) {
        return t.id === id;
      });
    });
  });
  if (rest.length) out.push({ label: S.untagged, books: rest });
  return out;
}
function rowsOf(list, width) {
  var rows = [[]], used = 0;
  list.forEach(function(b) {
    var w = thickness(b) + 3;
    if (used + w > width && rows[rows.length - 1].length) {
      rows.push([]);
      used = 0;
    }
    rows[rows.length - 1].push(b);
    used += w;
  });
  return rows;
}
function renderStage() {
  var stage = $("stage");
  stage.replaceChildren();
  var cs = el("div", "case");
  stage.appendChild(cs);
  var all = books();
  var gs = groups();
  var total = gs.reduce(function(n, g) {
    return n + g.books.length;
  }, 0);
  if (!total) {
    var row = el("div", "row");
    var empty = el("div", "empty");
    empty.style.width = "100%";
    empty.appendChild(el("div", null, !all.length ? S.empty : query ? S.noMatch : S.emptyTag));
    if (!all.length) {
      var open = el("button", "btn", S.open);
      open.type = "button";
      open.onclick = openPdf;
      empty.appendChild(open);
    }
    row.appendChild(empty);
    cs.append(row, el("div", "plank"));
    return;
  }
  var width = Math.max(200, cs.clientWidth - 44 - 36);
  var k = 0;
  gs.forEach(function(g) {
    if (g.label) {
      var lab = el("div", "group-label", g.label);
      cs.appendChild(lab);
    }
    rowsOf(g.books, width).forEach(function(r) {
      var row2 = el("div", "row");
      r.forEach(function(b) {
        var bk = makeBook(b);
        bk.style.setProperty("--delay", Math.min(k++ * 0.03, 0.6) + "s");
        row2.appendChild(bk);
      });
      row2.appendChild(el("div", "bookend"));
      cs.append(row2, el("div", "plank"));
    });
  });
  wireBooks(cs);
}
function wireBooks(root) {
  root.querySelectorAll(".book").forEach(function(bk) {
    var id = bk.dataset.id;
    bk.addEventListener("pointerenter", function() {
      var r = bk.getBoundingClientRect(), row = bk.parentElement.getBoundingClientRect();
      var left = r.left + r.width / 2 < row.left + row.width / 2;
      bk.style.setProperty("--turn", left ? "-68deg" : "-112deg");
    });
    bk.addEventListener("focus", function() {
      bk.dispatchEvent(new Event("pointerenter"));
    });
    bk.addEventListener("click", function() {
      openFocus(id, bk);
    });
    bk.draggable = true;
    bk.addEventListener("dragstart", function(e) {
      e.dataTransfer.setData("text/zentts-book", id);
      e.dataTransfer.effectAllowed = "copy";
      bk.classList.add("dragging");
    });
    bk.addEventListener("dragend", function() {
      bk.classList.remove("dragging");
    });
  });
}
document.addEventListener("keydown", function(e) {
  if (focusedId) {
    if (e.key === "Escape") closeFocus();
    return;
  }
  if (e.key === "Escape") {
    $("settings").hidden = true;
    return;
  }
  var cur = document.activeElement;
  if (!cur || !cur.classList || !cur.classList.contains("book")) return;
  var all = Array.prototype.slice.call(document.querySelectorAll("#stage .book"));
  var i = all.indexOf(cur);
  if (e.key === "ArrowRight" && all[i + 1]) {
    e.preventDefault();
    all[i + 1].focus();
  }
  if (e.key === "ArrowLeft" && all[i - 1]) {
    e.preventDefault();
    all[i - 1].focus();
  }
});
function renderTabs() {
  var nav = $("tabs");
  nav.replaceChildren();
  function tab(id, name, color, count) {
    var t = el("div", "tab");
    t.setAttribute("role", "tab");
    t.tabIndex = 0;
    t.setAttribute("aria-selected", String(view === id));
    if (color) {
      var dot = el("span", "dot");
      dot.style.setProperty("--c", color);
      t.appendChild(dot);
    }
    var label = el("span", "name", name);
    t.appendChild(label);
    t.appendChild(el("span", "count", String(count)));
    t.onclick = function(e) {
      if (e.target.closest(".x") || e.target.tagName === "INPUT") return;
      view = id;
      render();
    };
    t.onkeydown = function(e) {
      if (e.key === "Enter" && e.target === t) t.click();
    };
    if (id !== "all") {
      t.ondblclick = function() {
        editTag(t, label, id);
      };
      var x = el("button", "x", "\xD7");
      x.type = "button";
      x.setAttribute("aria-label", f(S.delTag, name));
      x.onclick = function() {
        deleteTag(id);
      };
      t.appendChild(x);
      t.addEventListener("dragover", function(e) {
        e.preventDefault();
        t.classList.add("drop");
      });
      t.addEventListener("dragleave", function() {
        t.classList.remove("drop");
      });
      t.addEventListener("drop", function(e) {
        e.preventDefault();
        t.classList.remove("drop");
        var bid = e.dataTransfer.getData("text/zentts-book");
        if (bid) toggleTag(bid, id, true);
      });
    }
    nav.appendChild(t);
  }
  tab("all", S.all, null, books().length);
  lib.tags.forEach(function(t) {
    tab(t.id, t.name, t.color, books().filter(function(b) {
      return (b.tags || []).includes(t.id);
    }).length);
  });
  var add = el("button", "tab new", S.newTag);
  add.type = "button";
  add.onclick = function() {
    newTag(add);
  };
  nav.appendChild(add);
}
function newTag(btn) {
  var input = el("input");
  input.placeholder = S.tagName;
  btn.replaceChildren(input);
  input.focus();
  var finished = false;
  function done(save) {
    if (finished) return;
    finished = true;
    var name = input.value.trim();
    if (save && name) {
      var id = "t" + Date.now().toString(36);
      lib.tags.push({ id, name, color: TAG_COLORS[lib.tags.length % TAG_COLORS.length] });
      persist();
    }
    render();
  }
  input.onkeydown = function(e) {
    if (e.key === "Enter") done(true);
    if (e.key === "Escape") done(false);
  };
  input.onblur = function() {
    done(true);
  };
}
function editTag(tabEl, label, id) {
  var tag = lib.tags.find(function(t) {
    return t.id === id;
  });
  var input = el("input");
  input.value = tag.name;
  label.replaceWith(input);
  input.focus();
  input.select();
  var finished = false;
  function done(save) {
    if (finished) return;
    finished = true;
    if (save && input.value.trim()) {
      tag.name = input.value.trim();
      persist();
    }
    render();
  }
  input.onkeydown = function(e) {
    if (e.key === "Enter") done(true);
    if (e.key === "Escape") done(false);
  };
  input.onblur = function() {
    done(true);
  };
}
function deleteTag(id) {
  var tag = lib.tags.find(function(t) {
    return t.id === id;
  });
  if (!tag || !confirm(f(S.delTag, tag.name))) return;
  lib.tags = lib.tags.filter(function(t) {
    return t.id !== id;
  });
  books().forEach(function(b) {
    b.tags = (b.tags || []).filter(function(x) {
      return x !== id;
    });
  });
  if (view === id) view = "all";
  persist();
  render();
}
function toggleTag(bookId, tagId, on) {
  var b = lib.books[bookId];
  if (!b) return;
  var tags = (b.tags || []).filter(function(x) {
    return x !== tagId;
  });
  if (on) tags.push(tagId);
  b.tags = tags;
  persist();
  render();
}
var spin = { angle: -90, raf: 0, last: 0, hold: 0 };
function startSpin(b3) {
  cancelAnimationFrame(spin.raf);
  if (reduceMotion()) {
    b3.style.setProperty("--spin", "-90deg");
    return;
  }
  function tick(t) {
    var dt = spin.last ? Math.min(50, t - spin.last) : 16;
    spin.last = t;
    if (Date.now() > spin.hold) spin.angle += dt * 0.022;
    b3.style.setProperty("--spin", spin.angle.toFixed(2) + "deg");
    spin.raf = requestAnimationFrame(tick);
  }
  spin.last = 0;
  spin.raf = requestAnimationFrame(tick);
}
async function openFocus(id, from) {
  var b = lib.books[id];
  if (!b) return;
  focusedId = id;
  await loadCovers(b);
  var holder = $("focus-holder");
  holder.replaceChildren();
  var big = makeBook(b);
  big.removeAttribute("title");
  big.tabIndex = -1;
  big.draggable = false;
  var shadow = el("div", "shadow");
  big.appendChild(shadow);
  holder.appendChild(big);
  renderCard(b);
  var focus = $("focus");
  focus.hidden = false;
  document.body.classList.add("focused");
  requestAnimationFrame(function() {
    focus.classList.add("show");
  });
  var b3 = big.querySelector(".b3");
  spin.angle = -90;
  spin.hold = 0;
  if (from && !reduceMotion() && big.animate) {
    var a = from.getBoundingClientRect(), z = big.getBoundingClientRect();
    b3.style.setProperty("--spin", "0deg");
    big.animate([
      { transform: "translate(" + (a.left + a.width / 2 - z.left - z.width / 2) + "px," + (a.top + a.height / 2 - z.top - z.height / 2) + "px) scale(" + (a.height / z.height).toFixed(3) + ")" },
      { transform: "none" }
    ], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" });
    b3.classList.add("fly");
    requestAnimationFrame(function() {
      b3.style.setProperty("--spin", "-90deg");
    });
    setTimeout(function() {
      b3.classList.remove("fly");
      if (focusedId === id) startSpin(b3);
    }, 700);
  } else {
    startSpin(b3);
  }
  var drag = null;
  big.addEventListener("pointerdown", function(e) {
    drag = { x: e.clientX, a: spin.angle };
    big.setPointerCapture(e.pointerId);
    spin.hold = Infinity;
  });
  big.addEventListener("pointermove", function(e) {
    if (!drag) return;
    spin.angle = drag.a + (e.clientX - drag.x) * 0.6;
    b3.style.setProperty("--spin", spin.angle + "deg");
  });
  function release() {
    if (drag) {
      drag = null;
      spin.hold = Date.now() + 2500;
    }
  }
  big.addEventListener("pointerup", release);
  big.addEventListener("pointercancel", release);
}
function closeFocus() {
  if (!focusedId) return;
  var id = focusedId;
  focusedId = null;
  cancelAnimationFrame(spin.raf);
  var focus = $("focus");
  focus.classList.remove("show");
  document.body.classList.remove("focused");
  setTimeout(function() {
    if (!focusedId) {
      focus.hidden = true;
      $("focus-holder").replaceChildren();
    }
  }, reduceMotion() ? 0 : 350);
  var back = document.querySelector('#stage .book[data-id="' + id + '"]');
  if (back) back.focus({ preventScroll: true });
}
$("focus").addEventListener("click", function(e) {
  if (e.target === $("focus") || e.target === $("focus-holder")) closeFocus();
});
function renderCard(b) {
  var card = $("card");
  card.replaceChildren();
  var close = el("button", "btn ghost close", "\u2715");
  close.type = "button";
  close.setAttribute("aria-label", S.close);
  close.onclick = closeFocus;
  card.appendChild(close);
  var title = el("input", "title");
  title.value = b.title || "";
  title.onchange = async function() {
    await updateBook(b.id, { title: title.value.trim() || b.title, titleEdited: true });
    await refresh();
  };
  var author = el("input", "author");
  author.value = b.author || "";
  author.placeholder = ES ? "Autor" : "Author";
  author.onchange = async function() {
    await updateBook(b.id, { author: author.value.trim(), authorEdited: true });
    await refresh();
  };
  card.append(title, author);
  var p = progressOf(b);
  var where = b.lastPage ? f(S.page, b.lastPage, b.pages || "?") + " \xB7 " + f(S.percent, Math.round(p * 100)) : S.never;
  card.appendChild(el("div", null, where));
  var meter = el("div", "meter");
  var fill = el("i");
  fill.style.width = Math.round(p * 100) + "%";
  meter.appendChild(fill);
  card.appendChild(meter);
  var info = [b.pages ? f(S.pagesN, b.pages) : "", b.openedAt ? f(S.opened, timeAgo(b.openedAt)) : ""].filter(Boolean).join(" \xB7 ");
  card.appendChild(el("div", "muted", info));
  if (!b.hasFile && b.src) card.appendChild(el("div", "muted", S.noCopy));
  var go = el("button", "btn main", b.lastPage ? S.cont : S.start);
  go.type = "button";
  go.onclick = function() {
    location.href = browser.runtime.getURL("reader.html") + "?book=" + encodeURIComponent(b.id);
  };
  card.appendChild(go);
  var row = el("div", "row2");
  function pick(which) {
    var input = $("img-input");
    input.value = "";
    input.onchange = async function() {
      var file = input.files[0];
      if (!file) return;
      await writeFile(b.id, which + "-custom", file);
      dropCovers(b.id);
      await refresh(true);
    };
    input.click();
  }
  var c1 = el("button", "btn", S.cover);
  c1.type = "button";
  c1.onclick = function() {
    pick("cover");
  };
  var c2 = el("button", "btn", S.back);
  c2.type = "button";
  c2.onclick = function() {
    pick("back");
  };
  var c3 = el("button", "btn ghost", S.resetCovers);
  c3.type = "button";
  c3.onclick = async function() {
    await removeFile(b.id, "cover-custom");
    await removeFile(b.id, "back-custom");
    dropCovers(b.id);
    await refresh(true);
  };
  row.append(c1, c2, c3);
  card.appendChild(row);
  var spineRow = el("label", "row2");
  spineRow.appendChild(el("span", null, S.spine));
  var color = el("input");
  color.type = "color";
  color.value = /^#[0-9a-f]{6}$/i.test(b.color || "") ? b.color : "#6b4a32";
  color.oninput = function() {
    document.querySelectorAll('.book[data-id="' + b.id + '"]').forEach(function(x) {
      x.style.setProperty("--spine", color.value);
    });
  };
  color.onchange = async function() {
    await updateBook(b.id, { color: color.value });
    lib = await loadLibrary();
    renderStage();
  };
  spineRow.appendChild(color);
  card.appendChild(spineRow);
  card.appendChild(el("h3", null, S.tags));
  var tags = el("div", "row2");
  if (!lib.tags.length) tags.appendChild(el("span", "muted", S.noTags));
  lib.tags.forEach(function(t) {
    var on = (b.tags || []).includes(t.id);
    var chip = el("button", "chip");
    chip.type = "button";
    chip.setAttribute("aria-pressed", String(on));
    var dot = el("span", "dot");
    dot.style.setProperty("--c", t.color);
    chip.append(dot, document.createTextNode(t.name));
    chip.onclick = function() {
      toggleTag(b.id, t.id, !on);
      renderCard(lib.books[b.id]);
    };
    tags.appendChild(chip);
  });
  card.appendChild(tags);
  var del = el("button", "btn danger", S.remove);
  del.type = "button";
  del.style.marginTop = "8px";
  del.onclick = async function() {
    if (!confirm(f(S.removeQ, b.title))) return;
    closeFocus();
    await removeBook(b.id);
    dropCovers(b.id);
    await refresh();
  };
  card.appendChild(del);
}
function renderSettings() {
  var box = $("settings");
  box.replaceChildren();
  var st = lib.settings;
  function select(label, key, options) {
    var l = el("label");
    l.appendChild(el("span", null, label));
    var s = el("select");
    options.forEach(function(o) {
      var op = el("option", null, o[1]);
      op.value = o[0];
      op.selected = st[key] === o[0];
      s.appendChild(op);
    });
    s.onchange = function() {
      st[key] = s.value;
      persist();
      applySettings();
      renderStage();
    };
    l.appendChild(s);
    box.appendChild(l);
  }
  select(S.wood, "wood", [["oak", S.oak], ["walnut", S.walnut], ["dark", S.dark], ["minimal", S.minimal]]);
  select(S.sort, "sort", [["recent", S.recent], ["title", S.byTitle], ["progress", S.byProgress]]);
  var sz = el("label");
  sz.appendChild(el("span", null, S.size));
  var seg = el("span", "seg");
  ["s", "m", "l"].forEach(function(k) {
    var b = el("button", null, k.toUpperCase());
    b.type = "button";
    b.setAttribute("aria-pressed", String(st.size === k));
    b.onclick = function() {
      st.size = k;
      persist();
      applySettings();
      renderSettings();
      renderStage();
    };
    seg.appendChild(b);
  });
  sz.appendChild(seg);
  box.appendChild(sz);
  var keep = el("label");
  keep.appendChild(el("span", null, S.keep));
  var cb = el("input");
  cb.type = "checkbox";
  cb.checked = st.keepCopies !== false;
  cb.onchange = function() {
    st.keepCopies = cb.checked;
    persist();
  };
  keep.appendChild(cb);
  box.appendChild(keep);
  box.appendChild(el("div", "muted", S.keepHint));
  var used = el("div", "muted");
  box.appendChild(used);
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(function(e) {
      used.textContent = f(S.used, Math.round((e.usage || 0) / 1048576) + " MB");
    });
  }
}
function applySettings() {
  document.body.dataset.wood = lib.settings.wood || DEFAULT_SETTINGS.wood;
  document.body.dataset.size = lib.settings.size || DEFAULT_SETTINGS.size;
}
$("settings-btn").onclick = function(e) {
  e.stopPropagation();
  var box = $("settings");
  box.hidden = !box.hidden;
  if (!box.hidden) renderSettings();
};
document.addEventListener("click", function(e) {
  var box = $("settings");
  if (!box.hidden && !box.contains(e.target) && e.target !== $("settings-btn")) box.hidden = true;
});
function openPdf() {
  location.href = browser.runtime.getURL("reader.html");
}
var saving = false;
function persist() {
  saving = true;
  saveLibrary(lib).then(function() {
    setTimeout(function() {
      saving = false;
    }, 50);
  });
}
async function refresh(reloadCovers) {
  lib = await loadLibrary();
  if (reloadCovers) Object.keys(covers).forEach(dropCovers);
  await Promise.all(books().map(loadCovers));
  render();
  if (focusedId && lib.books[focusedId]) {
    var holder = $("focus-holder");
    var old = holder.querySelector(".book");
    var b = lib.books[focusedId];
    if (old && reloadCovers) {
      var fresh = makeBook(b).querySelector(".b3");
      var b3 = old.querySelector(".b3");
      b3.replaceChildren.apply(b3, Array.prototype.slice.call(fresh.children));
    }
    if (old) old.style.setProperty("--spine", b.color || clothColor(b.id));
    renderCard(b);
  }
}
function render() {
  applySettings();
  renderTabs();
  renderStage();
}
var resizeTimer = null;
window.addEventListener("resize", function() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderStage, 150);
});
browser.storage.onChanged.addListener(function(changes, area) {
  if (area === "local" && changes.library && !saving) refresh();
});
async function init() {
  document.documentElement.lang = ES ? "es" : "en";
  $("lib-title").textContent = S.title;
  document.title = "zenTTS " + S.title;
  $("search").placeholder = S.search;
  $("open-pdf").textContent = S.open;
  $("open-pdf").onclick = openPdf;
  $("settings-btn").setAttribute("aria-label", S.settings);
  $("settings-btn").title = S.settings;
  $("search").addEventListener("input", function() {
    query = $("search").value.trim();
    renderStage();
  });
  lib = await loadLibrary();
  await Promise.all(books().map(loadCovers));
  render();
}
init();
