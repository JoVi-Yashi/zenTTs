// zenTTS — offline translation in the background page
//
// Uses Firefox Translations models (Bergamot, the same engine Firefox's own
// translator runs) from Mozilla's public registry. A "pack" is one direction
// (e.g. en→es); pairs without a direct model pivot through English.
// Packs are downloaded once, checked, and kept in the origin-private file
// system, so translation works offline afterwards.

import { BatchTranslator, TranslatorBacking } from '@browsermt/bergamot-translator/translator.js';

const REGISTRY = 'https://storage.googleapis.com/moz-fx-translations-data--303e-prod-translations-data/db/models.json';
const PARTS = { model: 'model', lexicalShortlist: 'shortlist', vocab: 'vocab' };
const PIVOT = 'en';

// "zh-Hant" / "zh_hant" → registry code; everything else → 2-letter code
export function normLang(code) {
  if (!code) return '';
  const c = String(code).toLowerCase().replace('-', '_');
  if (c === 'zh_hant' || c === 'zh_tw' || c === 'zh_hk') return 'zh_hant';
  return c.split('_')[0];
}

// ---- Registry ----

let registry = null;

async function loadRegistry() {
  if (registry) return registry;
  const resp = await fetch(REGISTRY, { credentials: 'omit' });
  if (!resp.ok) throw new Error('registry HTTP ' + resp.status);
  const data = await resp.json();
  const models = {};
  for (const [pair, list] of Object.entries(data.models || {})) {
    const released = list.find(m => m.releaseStatus) || null;
    if (released) models[pair] = released;
  }
  registry = { baseUrl: data.baseUrl, models };
  return registry;
}

// Directions needed for from→to: [pair] or [from-en, en-to]
export async function route(from, to) {
  const { models } = await loadRegistry();
  const direct = from + '-' + to;
  if (models[direct]) return [direct];
  const a = from + '-' + PIVOT, b = PIVOT + '-' + to;
  if (from !== PIVOT && to !== PIVOT && models[a] && models[b]) return [a, b];
  return null;
}

function sizeOf(entry) {
  // Compressed sizes are not in the registry; the model is ~75 % of a pack
  return Math.round((entry.files.model.uncompressedSize || 30e6) * 0.8 / 1048576);
}

// ---- Storage (OPFS: translations/<pair>/<part>) ----

async function packsDir(create) {
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle('translations', { create: true });
}

async function pairDir(pair, create) {
  const dir = await packsDir();
  return dir.getDirectoryHandle(pair, { create: !!create });
}

async function hasPack(pair) {
  try {
    const dir = await pairDir(pair);
    // "done" is written last, so half-finished downloads never count
    await dir.getFileHandle('done');
    return true;
  } catch (_) { return false; }
}

export async function listPacks() {
  const out = [];
  try {
    const dir = await packsDir();
    for await (const [name, handle] of dir.entries()) {
      if (handle.kind !== 'directory' || !(await hasPack(name))) continue;
      let bytes = 0;
      for await (const [, f] of handle.entries()) if (f.kind === 'file') bytes += (await f.getFile()).size;
      const [from, to] = name.split('-');
      out.push({ from, to, bytes });
    }
  } catch (_) {}
  return out;
}

export async function removePack(pair) {
  const dir = await packsDir();
  await dir.removeEntry(pair, { recursive: true });
}

// ---- Status and download ----

export async function status(from, to) {
  from = normLang(from); to = normLang(to);
  if (!from || !to || from === to) return { needed: false };
  let pairs;
  try { pairs = await route(from, to); } catch (e) { return { needed: true, supported: null, error: e.message }; }
  if (!pairs) return { needed: true, supported: false };
  const missing = [];
  for (const p of pairs) if (!(await hasPack(p))) missing.push(p);
  const sizeMB = missing.reduce((n, p) => n + sizeOf(registry.models[p]), 0);
  return { needed: true, supported: true, pairs, missing, ready: missing.length === 0, sizeMB };
}

async function sha256(buf) {
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

async function gunzip(buf) {
  const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).arrayBuffer();
}

async function fetchPart(url, onBytes) {
  const resp = await fetch(url, { credentials: 'omit' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  const reader = resp.body.getReader();
  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    onBytes(value.length);
  }
  return new Blob(chunks).arrayBuffer();
}

const downloads = new Map();

// onProgress(fraction) — fraction of all missing packs for this route
export function download(from, to, onProgress) {
  const key = normLang(from) + '-' + normLang(to);
  if (!downloads.has(key)) {
    downloads.set(key, (async () => {
      const st = await status(from, to);
      if (!st.supported) throw new Error('no model for ' + key);
      const total = st.missing.reduce((n, p) => n + sizeOf(registry.models[p]) * 1048576, 0) || 1;
      let got = 0;
      for (const pair of st.missing) {
        const entry = registry.models[pair];
        const dir = await pairDir(pair, true);
        for (const [part, name] of Object.entries(PARTS)) {
          const file = entry.files[part];
          const gz = await fetchPart(registry.baseUrl + '/' + file.path, n => {
            got += n;
            if (onProgress) onProgress(Math.min(0.99, got / total));
          });
          const raw = await gunzip(gz);
          if (file.uncompressedHash && (await sha256(raw)) !== file.uncompressedHash) {
            await removePack(pair).catch(() => {});
            throw new Error('checksum mismatch for ' + pair + ' ' + part);
          }
          const handle = await dir.getFileHandle(name, { create: true });
          const w = await handle.createWritable();
          await w.write(raw);
          await w.close();
        }
        const done = await dir.getFileHandle('done', { create: true });
        const w = await done.createWritable();
        await w.write('ok');
        await w.close();
      }
      if (onProgress) onProgress(1);
    })().finally(() => downloads.delete(key)));
  }
  return downloads.get(key);
}

// ---- Translation ----

async function readPack(pair) {
  const dir = await pairDir(pair);
  const read = async name => (await (await dir.getFileHandle(name)).getFile()).arrayBuffer();
  return { model: await read('model'), shortlist: await read('shortlist'), vocabs: [await read('vocab')], qualityModel: null };
}

// Serves the packs from OPFS instead of Bergamot's own download logic
class LocalBacking extends TranslatorBacking {
  async loadModelRegistery() {
    return (await listPacks()).map(p => ({ from: p.from, to: p.to, files: {} }));
  }
  async loadTranslationModel({ from, to }) {
    return readPack(from + '-' + to);
  }
  async getModels({ from, to }) {
    const pairs = await route(from, to);
    if (!pairs) throw new Error('no route ' + from + '→' + to);
    return pairs.map(p => { const [a, b] = p.split('-'); return { from: a, to: b }; });
  }
}

let translator = null;

function getTranslator() {
  if (!translator) translator = new BatchTranslator({ workers: 1, batchSize: 8 }, new LocalBacking({ registryUrl: REGISTRY }));
  return translator;
}

export async function translate(from, to, texts) {
  from = normLang(from); to = normLang(to);
  const st = await status(from, to);
  if (!st.needed) return texts;
  if (!st.ready) throw new Error('translation pack missing: ' + st.missing.join(', '));
  const tr = getTranslator();
  return Promise.all(texts.map(text =>
    text.trim() ? tr.translate({ from, to, text, html: false }).then(r => r.target.text) : Promise.resolve(text)
  ));
}
