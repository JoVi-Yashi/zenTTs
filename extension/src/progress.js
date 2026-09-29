// Remembers the sentence you were on, per chapter

var PREFIX = 'progress:';
var MAX_ENTRIES = 300;
var WRITE_EVERY_MS = 3000;

var pending = null;
var timer = null;

export function textHash(text) {
  var s = text.slice(0, 300);
  var h = 5381;
  for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export async function loadProgress(key) {
  if (!key) return null;
  try {
    var got = await browser.storage.local.get(PREFIX + key);
    return got[PREFIX + key] || null;
  } catch (_) { return null; }
}

function flush() {
  timer = null;
  if (!pending) return;
  var item = {};
  item[PREFIX + pending.key] = pending.data;
  pending = null;
  browser.storage.local.set(item).catch(function() {});
}

// Throttled: at most one write every few seconds, plus flushNow() on pagehide
export function saveProgress(key, data) {
  if (!key) return;
  pending = { key: key, data: Object.assign({ updatedAt: Date.now() }, data) };
  if (!timer) timer = setTimeout(flush, WRITE_EVERY_MS);
}

export function flushProgress() {
  if (timer) { clearTimeout(timer); flush(); }
}

export async function clearProgress(key) {
  if (!key) return;
  if (pending && pending.key === key) pending = null;
  try { await browser.storage.local.remove(PREFIX + key); } catch (_) {}
}

// Keeps the most recent entries only
export async function pruneProgress() {
  try {
    var all = await browser.storage.local.get(null);
    var keys = Object.keys(all).filter(function(k) { return k.startsWith(PREFIX); });
    if (keys.length <= MAX_ENTRIES) return;
    keys.sort(function(a, b) { return (all[b].updatedAt || 0) - (all[a].updatedAt || 0); });
    await browser.storage.local.remove(keys.slice(MAX_ENTRIES));
  } catch (_) {}
}
