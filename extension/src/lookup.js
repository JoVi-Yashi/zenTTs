// zenTTS — finding a book's details (title, authors, year, publisher, ISBN,
// cover) from its file name or its ISBN.
//
// The name is cleaned first ("[RVN] Mushoku_Tensei_Vol_15.pdf" → series
// "Mushoku Tensei", volume 15) and the search goes in steps, stopping once
// there are enough good matches:
//   1. the ISBN printed in the PDF (Open Library, Google Books);
//   2. series + volume, in your language and in any;
//   3. keywords only (the series alone, the main words);
//   4. AniList and MyAnimeList (Jikan), for light novels, manga and webnovels.
// Every match carries the language of its edition and a relevance score.
// Nothing is applied automatically: the library shows the matches, you
// choose and you tick which fields to take. Access to these sites is asked
// the first time the search is used.

export var ORIGINS = [
  'https://openlibrary.org/*', 'https://covers.openlibrary.org/*',
  'https://www.googleapis.com/*', 'https://books.google.com/*',
  'https://graphql.anilist.co/*', 'https://s4.anilist.co/*',
  'https://api.jikan.moe/*', 'https://cdn.myanimelist.net/*'
];

// Must be called straight from a click (Firefox only asks inside a user gesture)
export function askAccess(extra) {
  try { return browser.permissions.request({ origins: ORIGINS.concat(extra || []) }); } catch (_) { return Promise.resolve(false); }
}

// ---- The name ----

var JUNK = /\b(z-?lib(?:rary)?(?:\.org)?|libgen|annas?[- ]archive|epub|pdf|mobi|azw3?|retail|digital|scan(?:lation)?s?|fan[- ]?trad(?:uccion|ucción)?|fan[- ]?translat(?:ion|ed)|www\.[^\s)]*|\S+\.(?:com|org|net))\b/gi;
var JUNK_ONE = new RegExp(JUNK.source, 'i');
var LN = /\b(LN|WN|light[\s_-]?novel|novela[\s_-]?ligera|web[\s_-]?novel|isekai)\b/i;
var STOP = new Set(('the a an of and or to in on at for with de del la las el los y o en un una unos unas al por para con su sus no ni ' +
  'vol volume volumen tomo libro book part parte edition edicion edición novel novela ligera light').split(' '));

export function fold(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function wordsOf(s) {
  return fold(s).replace(/[^\p{L}\p{N}]+/gu, ' ').trim().split(' ').filter(function(w) { return w && !STOP.has(w); });
}

// "[RVN] Mushoku_Tensei_Vol_15 (z-lib.org).pdf" →
// { series: 'Mushoku Tensei', volume: 15, chapter: null, keywords: ['mushoku', 'tensei'], lnHint: true, clean: 'Mushoku Tensei Vol. 15' }
export function parseTitle(name) {
  var s = String(name || '').replace(/\.(pdf|epub|mobi|azw3?|txt)$/i, '');
  var tagged = /\[[^\]]*\]/.test(s);
  var lnHint = LN.test(s);
  s = s.replace(/\[[^\]]*\]|\{[^}]*\}/g, ' ');
  // Parentheses: drop the ones that are sources, formats or publishers' imprints; keep the rest
  s = s.replace(/\(([^)]*)\)/g, function(m, inner) {
    return JUNK_ONE.test(inner) || LN.test(inner) || /\b(press|edition|edici[oó]n|ediciones|editorial|publishing|kodansha|yen|j-?novel|seven seas)\b/i.test(inner) ? ' ' : m;
  });
  s = s.replace(/[_+]+/g, ' ').replace(/\.(?!\d)/g, ' ');
  s = s.replace(JUNK, ' ').replace(new RegExp(LN.source, 'gi'), ' ');
  var volume = null, chapter = null, m;
  if ((m = s.match(/\b(?:vol(?:ume|umen)?|tomo|libro|book|t)\s*\.?\s*(\d{1,3}(?:\.\d)?)\b/i)) ||
      (m = s.match(/\bv(\d{1,3})\b/i))) {
    volume = parseFloat(m[1]);
    s = s.replace(m[0], ' ');
  }
  if ((m = s.match(/\b(?:cap[ií]tulo|chapter|cap|ch)\s*\.?\s*(\d{1,4})\b/i))) {
    chapter = parseInt(m[1], 10);
    s = s.replace(m[0], ' ');
  }
  // A bare number at the end ("Overlord - 15", "Mushoku Tensei 15"), never a year
  // (1–2 digits, or 3 after a dash: "Fahrenheit 451" keeps its number)
  if (volume == null && (m = s.match(/(?:\s[\-–—]\s*(\d{1,3})|\s(\d{1,2}))\s*$/)) && s.slice(0, m.index).trim()) {
    m[1] = m[1] || m[2];
    volume = parseInt(m[1], 10);
    s = s.slice(0, m.index);
  }
  var series = s.replace(/\s*[\-–—:,]+\s*$/, '').replace(/^\s*[\-–—:,]+\s*/, '').replace(/\s{2,}/g, ' ').trim();
  if (tagged && volume != null) lnHint = true;
  return {
    series: series, volume: volume, chapter: chapter, keywords: wordsOf(series), lnHint: lnHint,
    clean: series + (volume != null ? ' Vol. ' + volume : '') + (chapter != null ? ' · ' + chapter : '')
  };
}

// Kept for the reader/library: the tidy title of a file name
export function cleanTitle(name) { return parseTitle(name).clean; }

// Key that keeps a saga's volumes together and in order, whatever the title shows
export function sortKeyOf(series, volume) {
  var v = volume == null ? '' : String(Math.round(volume * 10)).padStart(5, '0');
  return wordsOf(series).join(' ') + '|' + v;
}

// ---- Languages ----

var LANG3 = { es: 'spa', en: 'eng', ja: 'jpn', fr: 'fre', de: 'ger', it: 'ita', pt: 'por', zh: 'chi', ko: 'kor', ru: 'rus', ca: 'cat' };
var LANG2 = Object.fromEntries(Object.entries(LANG3).map(function(e) { return [e[1], e[0]]; }));

export function langName(code, es) {
  try { return new Intl.DisplayNames([es ? 'es' : 'en'], { type: 'language' }).of(code); } catch (_) { return code; }
}

// ---- Sources ----

function https(url) { return url ? url.replace(/^http:/, 'https:') : null; }

function pickIsbn(list) {
  var all = (list || []).map(function(x) { return String(x).replace(/[^\dX]/gi, ''); });
  return { isbn13: all.find(function(x) { return x.length === 13; }) || null, isbn10: all.find(function(x) { return x.length === 10; }) || null };
}

async function getJson(url, init) {
  var resp = await fetch(url, Object.assign({ credentials: 'omit' }, init || {}));
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

// by: { isbn } | { q } | { title }
async function openLibrary(by, lang) {
  var fields = 'key,title,subtitle,author_name,first_publish_year,publisher,isbn,cover_i,number_of_pages_median,language';
  var params = 'limit=8&fields=' + fields;
  if (by.isbn) params += '&isbn=' + encodeURIComponent(by.isbn);
  else if (by.title) params += '&title=' + encodeURIComponent(by.title);
  else params += '&q=' + encodeURIComponent(by.q);
  if (lang && LANG3[lang]) params += '&language=' + LANG3[lang];
  var data = await getJson('https://openlibrary.org/search.json?' + params);
  return (data.docs || []).map(function(d) {
    var ids = pickIsbn(d.isbn);
    if (by.isbn) { if (by.isbn.length === 13) ids.isbn13 = by.isbn; else ids.isbn10 = by.isbn; }
    var langs = (d.language || []).map(function(l) { return LANG2[l] || l; });
    return {
      source: 'Open Library', kind: 'book', title: d.title, subtitle: d.subtitle || '', authors: d.author_name || [],
      year: d.first_publish_year || null, publisher: (d.publisher || [])[0] || '', isbn13: ids.isbn13, isbn10: ids.isbn10,
      pages: d.number_of_pages_median || null,
      // An edition in several languages is taken as yours if yours is among them
      lang: lang && langs.indexOf(lang) >= 0 ? lang : langs[0] || null,
      thumb: d.cover_i ? 'https://covers.openlibrary.org/b/id/' + d.cover_i + '-M.jpg' : null,
      cover: d.cover_i ? 'https://covers.openlibrary.org/b/id/' + d.cover_i + '-L.jpg' : null
    };
  });
}

async function googleBooks(q, lang) {
  var url = 'https://www.googleapis.com/books/v1/volumes?maxResults=10&printType=books&q=' + encodeURIComponent(q);
  if (lang) url += '&langRestrict=' + lang;
  var data = await getJson(url);
  return (data.items || []).map(function(it) {
    var v = it.volumeInfo || {};
    var ids = pickIsbn((v.industryIdentifiers || []).map(function(x) { return x.identifier; }));
    var img = v.imageLinks || {};
    var thumb = https(img.thumbnail || img.smallThumbnail);
    return {
      source: 'Google Books', kind: 'book', title: v.title, subtitle: v.subtitle || '', authors: v.authors || [],
      year: v.publishedDate ? parseInt(v.publishedDate, 10) || null : null, publisher: v.publisher || '',
      isbn13: ids.isbn13, isbn10: ids.isbn10, pages: v.pageCount || null, lang: v.language || null,
      thumb: thumb, cover: thumb ? thumb.replace(/&edge=curl/, '').replace(/zoom=\d/, 'zoom=2') : null
    };
  });
}

var ANILIST_QUERY = 'query($s:String){Page(perPage:6){media(search:$s,type:MANGA,sort:SEARCH_MATCH){id format ' +
  'title{romaji english native} startDate{year} volumes siteUrl coverImage{extraLarge large} ' +
  'staff(perPage:6){edges{role node{name{full}}}}}}}';

async function aniList(search) {
  var data = await getJson('https://graphql.anilist.co', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: ANILIST_QUERY, variables: { s: search } })
  });
  var list = (data.data && data.data.Page && data.data.Page.media) || [];
  return list.map(function(m) {
    var t = m.title || {};
    var authors = ((m.staff && m.staff.edges) || []).filter(function(e) { return /story|original|author/i.test(e.role || ''); })
      .map(function(e) { return e.node && e.node.name && e.node.name.full; }).filter(Boolean);
    var cover = m.coverImage && (m.coverImage.extraLarge || m.coverImage.large);
    return {
      source: 'AniList', kind: 'series', format: m.format === 'NOVEL' ? 'novel' : 'manga',
      title: t.english || t.romaji || t.native, subtitle: '', altTitles: [t.romaji, t.native].filter(Boolean),
      authors: Array.from(new Set(authors)), year: (m.startDate && m.startDate.year) || null, publisher: '',
      isbn13: null, isbn10: null, pages: null, volumes: m.volumes || null, lang: null, url: m.siteUrl,
      thumb: cover, cover: cover
    };
  });
}

// "Magonote, Rifujin na" → "Rifujin na Magonote"
function flipName(n) { var p = String(n).split(', '); return p.length === 2 ? p[1] + ' ' + p[0] : n; }

async function jikan(search) {
  var data = await getJson('https://api.jikan.moe/v4/manga?limit=6&q=' + encodeURIComponent(search));
  return (data.data || []).map(function(m) {
    var img = (m.images && (m.images.jpg || m.images.webp)) || {};
    var from = m.published && m.published.prop && m.published.prop.from;
    return {
      source: 'MyAnimeList', kind: 'series', format: /novel/i.test(m.type || '') ? 'novel' : 'manga',
      title: m.title_english || m.title, subtitle: '', altTitles: [m.title, m.title_japanese].filter(Boolean),
      authors: (m.authors || []).map(function(a) { return flipName(a.name); }), year: (from && from.year) || null,
      publisher: '', isbn13: null, isbn10: null, pages: null, volumes: m.volumes || null, lang: null, url: m.url,
      thumb: img.image_url || img.large_image_url || null, cover: img.large_image_url || img.image_url || null
    };
  });
}

// ---- Relevance ----

function hasNumber(text, n) {
  return new RegExp('(^|\\D)0*' + String(n).replace('.', '\\.') + '(?!\\d)').test(text);
}

export function score(r, o) {
  var p = o.parsed || {};
  var mine = p.keywords && p.keywords.length ? p.keywords : wordsOf(o.query || '');
  var text = [r.title, r.subtitle].concat(r.altTitles || []).join(' ');
  var theirs = new Set(wordsOf(text));
  var common = mine.filter(function(w) { return theirs.has(w); }).length;
  var s = mine.length ? 4 * common / mine.length : 1;
  if (p.volume != null && r.kind === 'book') {
    var nums = (fold(r.title + ' ' + r.subtitle).match(/\d+(\.\d)?/g) || []).map(Number);
    if (hasNumber(r.title + ' ' + r.subtitle, p.volume)) s += 1.5;
    else if (nums.some(function(n) { return n > 0 && n < 400; })) s -= 1;
  }
  if (r.cover || r.thumb) s += 0.6;
  if (r.authors && r.authors.length) s += 0.3;
  if (o.lang && r.lang) s += r.lang === o.lang ? 1.2 : -0.8;
  if (r.kind === 'series') s += p.lnHint ? 0.8 : -0.5;
  var isbn = o.isbn && String(o.isbn);
  // The ISBN printed in the PDF counts, unless it led to an edition in another language
  if (isbn && (r.isbn13 === isbn || r.isbn10 === isbn)) s += o.lang && r.lang && r.lang !== o.lang ? 0.3 : 2;
  return Math.round(s * 100) / 100;
}

function mergeInto(out, seen, list) {
  list.forEach(function(b) {
    if (!b || !b.title) return;
    var k = b.isbn13 || b.isbn10 || (b.source + '|' + fold(b.title) + '|' + fold(b.authors[0] || ''));
    var k2 = fold(b.title) + '|' + fold(b.authors[0] || '') + '|' + (b.lang || '') + '|' + b.kind;
    var had = seen[k] || seen[k2];
    if (had) {
      if (!had.thumb && b.thumb) Object.assign(had, { thumb: b.thumb, cover: b.cover });
      if (!had.lang && b.lang) had.lang = b.lang;
      return;
    }
    seen[k] = seen[k2] = b;
    out.push(b);
  });
}

// o: { parsed, isbn, query, lang, onStep(step) }. Steps: 'isbn', 'title',
// 'keywords', 'series'. Returns matches, best first, each with .score and
// .otherLang (an edition in another language than o.lang).
export async function searchBooks(o) {
  var p = o.parsed || parseTitle(o.query || '');
  var lang = o.lang || null;
  var step = o.onStep || function() {};
  var out = [], seen = {}, tried = 0, failed = 0;
  var opts = { parsed: p, isbn: o.isbn, lang: lang, query: o.query };

  async function run(jobs) {
    var settled = await Promise.allSettled(jobs);
    settled.forEach(function(r) {
      tried++;
      if (r.status === 'fulfilled') mergeInto(out, seen, r.value);
      else failed++;
    });
  }
  function good() {
    return out.filter(function(r) { return score(r, opts) >= 3.2 && (!lang || !r.lang || r.lang === lang); }).length;
  }

  var text = o.query || [p.series, p.volume != null ? p.volume : ''].join(' ').trim();
  if (o.isbn) {
    step('isbn');
    await run([openLibrary({ isbn: o.isbn }), googleBooks('isbn:' + o.isbn)]);
  }
  // Also by title when the ISBN found nothing, or only an edition in another language
  if (text && good() < 3) {
    step('title');
    var jobs = [openLibrary({ q: text }), googleBooks(text)];
    if (lang) jobs.push(openLibrary({ q: text }, lang), googleBooks(text, lang));
    if (p.series && p.volume != null) jobs.push(googleBooks('intitle:' + p.series + ' ' + p.volume, lang));
    await run(jobs);
  }
  if (good() < 3 && p.series) {
    step('keywords');
    var kw = p.keywords.join(' ');
    var more = [googleBooks(p.series, lang), openLibrary({ title: p.series })];
    if (kw && kw !== fold(p.series)) more.push(openLibrary({ q: kw }));
    if (p.lnHint) more.push(googleBooks(p.series + ' light novel' + (p.volume != null ? ' ' + p.volume : '')));
    await run(more);
  }
  if ((p.lnHint || good() < 3) && (p.series || text)) {
    step('series');
    await run([aniList(p.series || text), jikan(p.series || text)]);
  }
  if (tried && failed === tried) throw new Error('offline');
  out.forEach(function(r) {
    r.score = score(r, opts);
    r.otherLang = !!(lang && r.lang && r.lang !== lang);
  });
  out.sort(function(a, b) { return b.score - a.score; });
  return out;
}

// Covers to try for an ISBN when the chosen match has none
export function coverUrlsForIsbn(isbn) {
  if (!isbn) return [];
  return ['https://covers.openlibrary.org/b/isbn/' + isbn + '-L.jpg'];
}

export async function fetchCover(url) {
  var resp = await fetch(url, { credentials: 'omit' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var blob = await resp.blob();
  // Open Library answers a 1×1 GIF when it has no cover
  if (blob.size < 1000) throw new Error('no cover');
  if (blob.type && !/^image\//.test(blob.type)) throw new Error('not an image');
  return blob;
}
