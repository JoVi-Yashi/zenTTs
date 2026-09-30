// zenTTS — finding a book's details (title, authors, year, publisher, ISBN,
// cover) from its name or its ISBN, in Open Library and Google Books.
// Nothing is applied automatically: the library shows the matches and you
// choose. Access to those two sites is asked for the first time it's used.

export var ORIGINS = [
  'https://openlibrary.org/*', 'https://covers.openlibrary.org/*',
  'https://www.googleapis.com/*', 'https://books.google.com/*'
];

// Must be called straight from a click (Firefox only asks inside a user gesture)
export function askAccess() {
  try { return browser.permissions.request({ origins: ORIGINS }); } catch (_) { return Promise.resolve(false); }
}

// "Mushoku_Tensei_Vol_15_[SC].pdf" → "Mushoku Tensei Vol 15"
export function cleanTitle(name) {
  return String(name || '')
    .replace(/\.pdf$/i, '')
    .replace(/\[[^\]]*\]|\([^)]*(z-lib|libgen|epub|pdf|www\.|\.com|\.org)[^)]*\)/gi, ' ')
    .replace(/[_+.]+/g, ' ')
    .replace(/\s*-\s*$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function https(url) { return url ? url.replace(/^http:/, 'https:') : null; }

function pickIsbn(list) {
  var all = (list || []).map(function(x) { return String(x).replace(/[^\dX]/gi, ''); });
  return { isbn13: all.find(function(x) { return x.length === 13; }) || null, isbn10: all.find(function(x) { return x.length === 10; }) || null };
}

async function getJson(url) {
  var resp = await fetch(url, { credentials: 'omit' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  return resp.json();
}

async function openLibrary(query, isbn) {
  var fields = 'key,title,subtitle,author_name,first_publish_year,publisher,isbn,cover_i,number_of_pages_median';
  var url = 'https://openlibrary.org/search.json?limit=8&fields=' + fields + '&' + (isbn ? 'isbn=' + encodeURIComponent(isbn) : 'q=' + encodeURIComponent(query));
  var data = await getJson(url);
  return (data.docs || []).map(function(d) {
    var ids = pickIsbn(d.isbn);
    if (isbn) { if (isbn.length === 13) ids.isbn13 = isbn; else ids.isbn10 = isbn; }
    return {
      source: 'Open Library', title: d.title, subtitle: d.subtitle || '', authors: d.author_name || [],
      year: d.first_publish_year || null, publisher: (d.publisher || [])[0] || '', isbn13: ids.isbn13, isbn10: ids.isbn10,
      pages: d.number_of_pages_median || null,
      thumb: d.cover_i ? 'https://covers.openlibrary.org/b/id/' + d.cover_i + '-M.jpg' : null,
      cover: d.cover_i ? 'https://covers.openlibrary.org/b/id/' + d.cover_i + '-L.jpg' : null
    };
  });
}

async function googleBooks(query, isbn) {
  var q = isbn ? 'isbn:' + isbn : query;
  var data = await getJson('https://www.googleapis.com/books/v1/volumes?maxResults=8&q=' + encodeURIComponent(q));
  return (data.items || []).map(function(it) {
    var v = it.volumeInfo || {};
    var ids = pickIsbn((v.industryIdentifiers || []).map(function(x) { return x.identifier; }));
    var img = v.imageLinks || {};
    var thumb = https(img.thumbnail || img.smallThumbnail);
    return {
      source: 'Google Books', title: v.title, subtitle: v.subtitle || '', authors: v.authors || [],
      year: v.publishedDate ? parseInt(v.publishedDate, 10) || null : null, publisher: v.publisher || '',
      isbn13: ids.isbn13, isbn10: ids.isbn10, pages: v.pageCount || null,
      thumb: thumb, cover: thumb ? thumb.replace(/&edge=curl/, '').replace(/zoom=\d/, 'zoom=2') : null
    };
  });
}

// Both sources, by ISBN first when there is one; duplicates (same ISBN, or
// same title and first author) are merged, keeping the one with a cover
export async function searchBooks(query, isbn) {
  var jobs = [];
  if (isbn) jobs.push(openLibrary(null, isbn), googleBooks(null, isbn));
  if (query) jobs.push(openLibrary(query), googleBooks(query));
  var settled = await Promise.allSettled(jobs);
  var out = [], seen = {};
  settled.forEach(function(r) {
    if (r.status !== 'fulfilled') return;
    r.value.forEach(function(b) {
      if (!b.title) return;
      var k = b.isbn13 || b.isbn10 || (b.title + '|' + (b.authors[0] || '')).toLowerCase();
      if (seen[k]) { if (!seen[k].thumb && b.thumb) Object.assign(seen[k], { thumb: b.thumb, cover: b.cover }); return; }
      seen[k] = b;
      out.push(b);
    });
  });
  var failed = settled.every(function(r) { return r.status === 'rejected'; });
  if (failed && jobs.length) throw new Error(settled[0].reason && settled[0].reason.message || 'offline');
  return out;
}

export async function fetchCover(url) {
  var resp = await fetch(url, { credentials: 'omit' });
  if (!resp.ok) throw new Error('HTTP ' + resp.status);
  var blob = await resp.blob();
  // Open Library answers a 1×1 GIF when it has no cover
  if (blob.size < 1000) throw new Error('no cover');
  return blob;
}
