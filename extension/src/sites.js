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
    // Chapters load one after another in the same page (infinite scroll), so
    // the "next chapter" is found in the page itself: see content.js
    inPage: true,
    test: function(host) { return host.includes('webnovel.com'); },
    container: function(doc) { return webnovelChapter(doc); },
    paragraphs: function(c) { return paragraphsIn(c, 'p'); },
    chapterKey: function(url, container) {
      var id = container && chapterIdOf(container);
      return 'webnovel:' + (id || url.pathname);
    },
    nextUrl: function() { return null; },
    nextContainer: function(doc, current) { return chapterAfter(doc, current); },
    pullMore: function(current) { pullMore(current); },
    nextControl: function(doc, current, url) { return nextControl(doc, current, url); },
    isLocked: function(el) { return isLocked(el); }
  }
];

// ---- Webnovel ----

var CHAPTER_SEL = '.cha-content, .cha-words, .chapter-content, .read-content, [class*="cha-content"], [class*="cha-words"]';
var active = null;   // the chapter being read, set by content.js

export function setActiveChapter(el) { active = el; }

// Also looks inside open shadow roots, in case the reader is built with them
export function deepQueryAll(root, selector) {
  var out = Array.prototype.slice.call(root.querySelectorAll(selector));
  var walker = (root.ownerDocument || root).createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
  for (var n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.shadowRoot) out = out.concat(deepQueryAll(n.shadowRoot, selector));
  }
  return out;
}

// One element per chapter: the outermost match
function chapterNodes(doc) {
  return deepQueryAll(doc, CHAPTER_SEL).filter(function(el) {
    var up = el.parentElement && el.parentElement.closest(CHAPTER_SEL);
    return !up;
  });
}

function idFromUrl(href) {
  var m = String(href || '').match(/\/book\/[^/]*?(\d{6,})[^/]*\/[^/]*?(\d{6,})/) || String(href || '').match(/(\d{8,})(?!.*\d{8,})/);
  return m ? m[m.length - 1] : null;
}

// Chapter id of a chapter element: data attributes or ids on it or its wrappers
function chapterIdOf(el) {
  for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
    var v = n.getAttribute('data-cid') || n.getAttribute('data-chapter-id') || n.getAttribute('data-chapterid') || n.getAttribute('data-id');
    if (v && /\d{6,}/.test(v)) return v.match(/\d{6,}/)[0];
    if (n.id && /\d{6,}/.test(n.id)) return n.id.match(/\d{6,}/)[0];
  }
  return null;
}

function webnovelChapter(doc) {
  var list = chapterNodes(doc);
  if (!list.length) return null;
  if (active && active.isConnected && list.indexOf(active) >= 0) return active;
  var id = doc.location ? idFromUrl(doc.location.href) : null;
  if (id) {
    var byId = list.find(function(el) { return chapterIdOf(el) === id; });
    if (byId) return byId;
  }
  // The first chapter that is (at least partly) on screen, else the first one
  if (doc.defaultView) {
    var h = doc.defaultView.innerHeight;
    var seen = list.find(function(el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < h; });
    if (seen) return seen;
  }
  return list[0];
}

function chapterAfter(doc, current) {
  var list = chapterNodes(doc);
  var i = list.indexOf(current);
  var next = i >= 0 ? list[i + 1] : null;
  return next && visibleText(next).length > 20 ? next : null;
}

function scrollerOf(el) {
  for (var n = el && el.parentElement; n; n = n.parentElement) {
    var cs = getComputedStyle(n);
    if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 4) return n;
  }
  return null;
}

// Nudges the site's infinite scroll into loading what comes next
function pullMore(current) {
  var last = current && (current.lastElementChild || current);
  if (last && last.scrollIntoView) last.scrollIntoView({ block: 'end' });
  var box = scrollerOf(current);
  if (box) { box.scrollTop = box.scrollHeight; box.dispatchEvent(new Event('scroll')); }
  var doc = (current && current.ownerDocument) || document;
  var win = doc.defaultView || window;
  win.scrollTo(0, doc.documentElement.scrollHeight);
  win.dispatchEvent(new Event('scroll'));
}

var NEXT_WORDS = /^\s*(next(\s+chapter)?|siguiente(\s+cap[ií]tulo)?|cap[ií]tulo\s+siguiente|pr[oó]ximo(\s+cap[ií]tulo)?|下一章)\s*[›»>→]*\s*$/i;

function labelOf(el) {
  return [el.textContent, el.getAttribute('title'), el.getAttribute('aria-label')].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
}

// The "next chapter" link or button: rel=next, its label, a *next* class, or
// the entry after the current chapter in a table of contents on the page.
// Returns { href } for links, { button } for buttons, or null.
function nextControl(doc, current, url) {
  var rel = doc.querySelector('link[rel="next"][href], a[rel="next"][href]');
  if (rel) return { href: absolute(rel.getAttribute('href'), url) };
  var candidates = deepQueryAll(doc, 'a, button, [role="button"]').filter(function(el) {
    if (el.disabled || el.getAttribute('aria-disabled') === 'true') return false;
    var label = labelOf(el);
    var cls = (typeof el.className === 'string' ? el.className : '') + ' ' + (el.id || '');
    return (label.length < 40 && NEXT_WORDS.test(label)) || /(^|[\s_-])next([\s_-]|chapter|$)/i.test(cls);
  });
  for (var i = 0; i < candidates.length; i++) {
    var el = candidates[i];
    var href = el.tagName === 'A' && el.getAttribute('href');
    if (href && !/^(#|javascript:)/i.test(href)) return { href: absolute(href, url) };
    if (el.tagName !== 'A' || href) return { button: el };
  }
  // Table of contents: the link right after the current chapter's
  var id = (current && chapterIdOf(current)) || idFromUrl(url && url.href);
  if (id) {
    var links = deepQueryAll(doc, 'a[href*="/book/"]');
    var at = links.findIndex(function(a) { return idFromUrl(a.href) === id; });
    for (var k = at + 1; at >= 0 && k < links.length; k++) {
      var other = idFromUrl(links[k].href);
      if (other && other !== id) return { href: links[k].href };
    }
  }
  return null;
}

var LOCKED = /unlock (this )?chapter|desbloquear|locked chapter|cap[ií]tulo bloqueado|premium chapter/i;
function isLocked(el) {
  if (!el) return false;
  if (LOCKED.test(visibleText(el).slice(0, 4000))) return true;
  // A "lock" class (but not "block")
  return Array.prototype.some.call(el.querySelectorAll('[class*="ock"]'), function(n) {
    return /(^|[\s_-])(un)?lock(ed)?([\s_-]|$)/i.test(typeof n.className === 'string' ? n.className : '');
  });
}

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
