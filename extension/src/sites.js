// zenTTS — Site descriptors
// Each descriptor works on any Document (the live page or one fetched for the
// next chapter), so extraction and "next chapter" share the same selectors.

function visibleText(el) {
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

function paragraphsIn(container, selector) {
  var out = [];
  var nodes = container.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    // Skip nested matches (a <p> inside a <blockquote> that also matches)
    if (el.parentElement && el.parentElement.closest(selector) &&
        container.contains(el.parentElement.closest(selector))) continue;
    if (visibleText(el).length >= 2) out.push(el);
  }
  // Containers without block children (plain text with <br>) → one paragraph
  if (out.length === 0 && visibleText(container).length > 0) out.push(container);
  return out;
}

function absolute(href, base) {
  try { return new URL(href, base).href; } catch (_) { return null; }
}

function relNext(doc, url) {
  var link = doc.querySelector('link[rel="next"][href], a[rel="next"][href]');
  return link ? absolute(link.getAttribute('href'), url) : null;
}

var BLOCKS = 'p, h1, h2, h3, h4, h5, h6, li, blockquote, pre';

export var SITES = [
  {
    id: 'ao3',
    test: function(host) { return host.includes('archiveofourown.org'); },
    container: function(doc) { return doc.querySelector('#chapters .userstuff'); },
    paragraphs: function(c) {
      return paragraphsIn(c, BLOCKS).filter(function(el) { return !el.classList.contains('landmark'); });
    },
    chapterKey: function(url) {
      var m = url.pathname.match(/\/works\/(\d+)(?:\/chapters\/(\d+))?/);
      return m ? 'ao3:' + m[1] + ':' + (m[2] || '1') : null;
    },
    nextUrl: function(doc, url) {
      var a = doc.querySelector('li.chapter.next a[href], .chapter.next a[href]');
      return a ? absolute(a.getAttribute('href'), url) : null;
    }
  },
  {
    id: 'ffn',
    test: function(host) { return host.includes('fanfiction.net') || host.includes('fictionpress.com'); },
    container: function(doc) { return doc.querySelector('#storytext, .storytext'); },
    paragraphs: function(c) { return paragraphsIn(c, 'p'); },
    chapterKey: function(url) {
      var m = url.pathname.match(/\/s\/(\d+)(?:\/(\d+))?/);
      return m ? 'ffn:' + m[1] + ':' + (m[2] || '1') : null;
    },
    nextUrl: function(doc, url) {
      var m = url.pathname.match(/\/s\/(\d+)(?:\/(\d+))?(\/.*)?/);
      if (!m) return null;
      var n = parseInt(m[2] || '1', 10) + 1;
      var sel = doc.querySelector('#chap_select');
      if (!sel || !sel.querySelector('option[value="' + n + '"]')) return null;
      return absolute('/s/' + m[1] + '/' + n + (m[3] || '/'), url);
    }
  },
  {
    id: 'wattpad',
    test: function(host) { return host.includes('wattpad.com'); },
    // The header panel (.text-center) holds metadata, not the story
    container: function(doc) { return doc.querySelector('.panel.panel-reading:not(.text-center) pre') ||
                                      doc.querySelector('.panel.panel-reading:not(.text-center)'); },
    paragraphs: function(c) {
      var ps = c.querySelectorAll('p[data-p-id]');
      return ps.length ? Array.prototype.filter.call(ps, function(el) { return visibleText(el).length >= 2; })
                       : paragraphsIn(c, 'p');
    },
    chapterKey: function(url) {
      var m = url.pathname.match(/^\/(\d+)/);
      return m ? 'wattpad:' + m[1] : null;
    },
    nextUrl: function(doc, url) {
      var a = doc.querySelector('a.next-part-link[href], .next-part a[href]');
      return a ? absolute(a.getAttribute('href'), url) : relNext(doc, url);
    }
  },
  {
    id: 'webnovel',
    test: function(host) { return host.includes('webnovel.com'); },
    container: function(doc) {
      return doc.querySelector('.cha-words, .cha-content, .chapter-content, .read-content, [class*="cha-words"], [class*="cha-content"]');
    },
    paragraphs: function(c) { return paragraphsIn(c, 'p'); },
    chapterKey: function(url) { return 'webnovel:' + url.pathname; },
    // Webnovel already loads chapters by infinite scroll (see the content observer)
    nextUrl: function() { return null; }
  }
];

export var GENERIC = {
  id: 'generic',
  test: function() { return true; },
  container: function(doc) {
    return doc.querySelector('article, main, [role="main"]') || doc.body;
  },
  paragraphs: function(c) { return paragraphsIn(c, BLOCKS + ', td, th'); },
  chapterKey: function(url) { return 'page:' + url.origin + url.pathname; },
  nextUrl: relNext
};

export function siteFor(host) {
  for (var i = 0; i < SITES.length; i++) {
    if (SITES[i].test(host)) return SITES[i];
  }
  return GENERIC;
}
