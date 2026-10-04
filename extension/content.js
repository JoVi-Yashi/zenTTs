(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/@mozilla/readability/Readability.js
  var require_Readability = __commonJS({
    "node_modules/@mozilla/readability/Readability.js"(exports, module) {
      function Readability2(doc, options) {
        if (options && options.documentElement) {
          doc = options;
          options = arguments[2];
        } else if (!doc || !doc.documentElement) {
          throw new Error(
            "First argument to Readability constructor should be a document object."
          );
        }
        options = options || {};
        this._doc = doc;
        this._docJSDOMParser = this._doc.firstChild.__JSDOMParser__;
        this._articleTitle = null;
        this._articleByline = null;
        this._articleDir = null;
        this._articleSiteName = null;
        this._attempts = [];
        this._metadata = {};
        this._debug = !!options.debug;
        this._maxElemsToParse = options.maxElemsToParse || this.DEFAULT_MAX_ELEMS_TO_PARSE;
        this._nbTopCandidates = options.nbTopCandidates || this.DEFAULT_N_TOP_CANDIDATES;
        this._charThreshold = options.charThreshold || this.DEFAULT_CHAR_THRESHOLD;
        this._classesToPreserve = this.CLASSES_TO_PRESERVE.concat(
          options.classesToPreserve || []
        );
        this._keepClasses = !!options.keepClasses;
        this._serializer = options.serializer || function(el) {
          return el.innerHTML;
        };
        this._disableJSONLD = !!options.disableJSONLD;
        this._allowedVideoRegex = options.allowedVideoRegex || this.REGEXPS.videos;
        this._linkDensityModifier = options.linkDensityModifier || 0;
        this._flags = this.FLAG_STRIP_UNLIKELYS | this.FLAG_WEIGHT_CLASSES | this.FLAG_CLEAN_CONDITIONALLY;
        if (this._debug) {
          let logNode = function(node) {
            if (node.nodeType == node.TEXT_NODE) {
              return `${node.nodeName} ("${node.textContent}")`;
            }
            let attrPairs = Array.from(node.attributes || [], function(attr) {
              return `${attr.name}="${attr.value}"`;
            }).join(" ");
            return `<${node.localName} ${attrPairs}>`;
          };
          this.log = function() {
            if (typeof console !== "undefined") {
              let args = Array.from(arguments, (arg) => {
                if (arg && arg.nodeType == this.ELEMENT_NODE) {
                  return logNode(arg);
                }
                return arg;
              });
              args.unshift("Reader: (Readability)");
              console.log(...args);
            } else if (typeof dump !== "undefined") {
              var msg = Array.prototype.map.call(arguments, function(x) {
                return x && x.nodeName ? logNode(x) : x;
              }).join(" ");
              dump("Reader: (Readability) " + msg + "\n");
            }
          };
        } else {
          this.log = function() {
          };
        }
      }
      Readability2.prototype = {
        FLAG_STRIP_UNLIKELYS: 1,
        FLAG_WEIGHT_CLASSES: 2,
        FLAG_CLEAN_CONDITIONALLY: 4,
        // https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
        ELEMENT_NODE: 1,
        TEXT_NODE: 3,
        // Max number of nodes supported by this parser. Default: 0 (no limit)
        DEFAULT_MAX_ELEMS_TO_PARSE: 0,
        // The number of top candidates to consider when analysing how
        // tight the competition is among candidates.
        DEFAULT_N_TOP_CANDIDATES: 5,
        // Element tags to score by default.
        DEFAULT_TAGS_TO_SCORE: "section,h2,h3,h4,h5,h6,p,td,pre".toUpperCase().split(","),
        // The default number of chars an article must have in order to return a result
        DEFAULT_CHAR_THRESHOLD: 500,
        // All of the regular expressions in use within readability.
        // Defined up here so we don't instantiate them repeatedly in loops.
        REGEXPS: {
          // NOTE: These two regular expressions are duplicated in
          // Readability-readerable.js. Please keep both copies in sync.
          unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
          okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i,
          positive: /article|body|content|entry|hentry|h-entry|main|page|pagination|post|text|blog|story/i,
          negative: /-ad-|hidden|^hid$| hid$| hid |^hid |banner|combx|comment|com-|contact|footer|gdpr|masthead|media|meta|outbrain|promo|related|scroll|share|shoutbox|sidebar|skyscraper|sponsor|shopping|tags|widget/i,
          extraneous: /print|archive|comment|discuss|e[\-]?mail|share|reply|all|login|sign|single|utility/i,
          byline: /byline|author|dateline|writtenby|p-author/i,
          replaceFonts: /<(\/?)font[^>]*>/gi,
          normalize: /\s{2,}/g,
          videos: /\/\/(www\.)?((dailymotion|youtube|youtube-nocookie|player\.vimeo|v\.qq)\.com|(archive|upload\.wikimedia)\.org|player\.twitch\.tv)/i,
          shareElements: /(\b|_)(share|sharedaddy)(\b|_)/i,
          nextLink: /(next|weiter|continue|>([^\|]|$)|»([^\|]|$))/i,
          prevLink: /(prev|earl|old|new|<|«)/i,
          tokenize: /\W+/g,
          whitespace: /^\s*$/,
          hasContent: /\S$/,
          hashUrl: /^#.+/,
          srcsetUrl: /(\S+)(\s+[\d.]+[xw])?(\s*(?:,|$))/g,
          b64DataUrl: /^data:\s*([^\s;,]+)\s*;\s*base64\s*,/i,
          // Commas as used in Latin, Sindhi, Chinese and various other scripts.
          // see: https://en.wikipedia.org/wiki/Comma#Comma_variants
          commas: /\u002C|\u060C|\uFE50|\uFE10|\uFE11|\u2E41|\u2E34|\u2E32|\uFF0C/g,
          // See: https://schema.org/Article
          jsonLdArticleTypes: /^Article|AdvertiserContentArticle|NewsArticle|AnalysisNewsArticle|AskPublicNewsArticle|BackgroundNewsArticle|OpinionNewsArticle|ReportageNewsArticle|ReviewNewsArticle|Report|SatiricalArticle|ScholarlyArticle|MedicalScholarlyArticle|SocialMediaPosting|BlogPosting|LiveBlogPosting|DiscussionForumPosting|TechArticle|APIReference$/,
          // used to see if a node's content matches words commonly used for ad blocks or loading indicators
          adWords: /^(ad(vertising|vertisement)?|pub(licité)?|werb(ung)?|广告|Реклама|Anuncio)$/iu,
          loadingWords: /^((loading|正在加载|Загрузка|chargement|cargando)(…|\.\.\.)?)$/iu
        },
        UNLIKELY_ROLES: [
          "menu",
          "menubar",
          "complementary",
          "navigation",
          "alert",
          "alertdialog",
          "dialog"
        ],
        DIV_TO_P_ELEMS: /* @__PURE__ */ new Set([
          "BLOCKQUOTE",
          "DL",
          "DIV",
          "IMG",
          "OL",
          "P",
          "PRE",
          "TABLE",
          "UL"
        ]),
        ALTER_TO_DIV_EXCEPTIONS: ["DIV", "ARTICLE", "SECTION", "P", "OL", "UL"],
        PRESENTATIONAL_ATTRIBUTES: [
          "align",
          "background",
          "bgcolor",
          "border",
          "cellpadding",
          "cellspacing",
          "frame",
          "hspace",
          "rules",
          "style",
          "valign",
          "vspace"
        ],
        DEPRECATED_SIZE_ATTRIBUTE_ELEMS: ["TABLE", "TH", "TD", "HR", "PRE"],
        // The commented out elements qualify as phrasing content but tend to be
        // removed by readability when put into paragraphs, so we ignore them here.
        PHRASING_ELEMS: [
          // "CANVAS", "IFRAME", "SVG", "VIDEO",
          "ABBR",
          "AUDIO",
          "B",
          "BDO",
          "BR",
          "BUTTON",
          "CITE",
          "CODE",
          "DATA",
          "DATALIST",
          "DFN",
          "EM",
          "EMBED",
          "I",
          "IMG",
          "INPUT",
          "KBD",
          "LABEL",
          "MARK",
          "MATH",
          "METER",
          "NOSCRIPT",
          "OBJECT",
          "OUTPUT",
          "PROGRESS",
          "Q",
          "RUBY",
          "SAMP",
          "SCRIPT",
          "SELECT",
          "SMALL",
          "SPAN",
          "STRONG",
          "SUB",
          "SUP",
          "TEXTAREA",
          "TIME",
          "VAR",
          "WBR"
        ],
        // These are the classes that readability sets itself.
        CLASSES_TO_PRESERVE: ["page"],
        // These are the list of HTML entities that need to be escaped.
        HTML_ESCAPE_MAP: {
          lt: "<",
          gt: ">",
          amp: "&",
          quot: '"',
          apos: "'"
        },
        /**
         * Run any post-process modifications to article content as necessary.
         *
         * @param Element
         * @return void
         **/
        _postProcessContent(articleContent) {
          this._fixRelativeUris(articleContent);
          this._simplifyNestedElements(articleContent);
          if (!this._keepClasses) {
            this._cleanClasses(articleContent);
          }
        },
        /**
         * Iterates over a NodeList, calls `filterFn` for each node and removes node
         * if function returned `true`.
         *
         * If function is not passed, removes all the nodes in node list.
         *
         * @param NodeList nodeList The nodes to operate on
         * @param Function filterFn the function to use as a filter
         * @return void
         */
        _removeNodes(nodeList, filterFn) {
          if (this._docJSDOMParser && nodeList._isLiveNodeList) {
            throw new Error("Do not pass live node lists to _removeNodes");
          }
          for (var i = nodeList.length - 1; i >= 0; i--) {
            var node = nodeList[i];
            var parentNode = node.parentNode;
            if (parentNode) {
              if (!filterFn || filterFn.call(this, node, i, nodeList)) {
                parentNode.removeChild(node);
              }
            }
          }
        },
        /**
         * Iterates over a NodeList, and calls _setNodeTag for each node.
         *
         * @param NodeList nodeList The nodes to operate on
         * @param String newTagName the new tag name to use
         * @return void
         */
        _replaceNodeTags(nodeList, newTagName) {
          if (this._docJSDOMParser && nodeList._isLiveNodeList) {
            throw new Error("Do not pass live node lists to _replaceNodeTags");
          }
          for (const node of nodeList) {
            this._setNodeTag(node, newTagName);
          }
        },
        /**
         * Iterate over a NodeList, which doesn't natively fully implement the Array
         * interface.
         *
         * For convenience, the current object context is applied to the provided
         * iterate function.
         *
         * @param  NodeList nodeList The NodeList.
         * @param  Function fn       The iterate function.
         * @return void
         */
        _forEachNode(nodeList, fn) {
          Array.prototype.forEach.call(nodeList, fn, this);
        },
        /**
         * Iterate over a NodeList, and return the first node that passes
         * the supplied test function
         *
         * For convenience, the current object context is applied to the provided
         * test function.
         *
         * @param  NodeList nodeList The NodeList.
         * @param  Function fn       The test function.
         * @return void
         */
        _findNode(nodeList, fn) {
          return Array.prototype.find.call(nodeList, fn, this);
        },
        /**
         * Iterate over a NodeList, return true if any of the provided iterate
         * function calls returns true, false otherwise.
         *
         * For convenience, the current object context is applied to the
         * provided iterate function.
         *
         * @param  NodeList nodeList The NodeList.
         * @param  Function fn       The iterate function.
         * @return Boolean
         */
        _someNode(nodeList, fn) {
          return Array.prototype.some.call(nodeList, fn, this);
        },
        /**
         * Iterate over a NodeList, return true if all of the provided iterate
         * function calls return true, false otherwise.
         *
         * For convenience, the current object context is applied to the
         * provided iterate function.
         *
         * @param  NodeList nodeList The NodeList.
         * @param  Function fn       The iterate function.
         * @return Boolean
         */
        _everyNode(nodeList, fn) {
          return Array.prototype.every.call(nodeList, fn, this);
        },
        _getAllNodesWithTag(node, tagNames) {
          if (node.querySelectorAll) {
            return node.querySelectorAll(tagNames.join(","));
          }
          return [].concat.apply(
            [],
            tagNames.map(function(tag) {
              var collection = node.getElementsByTagName(tag);
              return Array.isArray(collection) ? collection : Array.from(collection);
            })
          );
        },
        /**
         * Removes the class="" attribute from every element in the given
         * subtree, except those that match CLASSES_TO_PRESERVE and
         * the classesToPreserve array from the options object.
         *
         * @param Element
         * @return void
         */
        _cleanClasses(node) {
          var classesToPreserve = this._classesToPreserve;
          var className = (node.getAttribute("class") || "").split(/\s+/).filter((cls) => classesToPreserve.includes(cls)).join(" ");
          if (className) {
            node.setAttribute("class", className);
          } else {
            node.removeAttribute("class");
          }
          for (node = node.firstElementChild; node; node = node.nextElementSibling) {
            this._cleanClasses(node);
          }
        },
        /**
         * Tests whether a string is a URL or not.
         *
         * @param {string} str The string to test
         * @return {boolean} true if str is a URL, false if not
         */
        _isUrl(str) {
          try {
            new URL(str);
            return true;
          } catch {
            return false;
          }
        },
        /**
         * Converts each <a> and <img> uri in the given element to an absolute URI,
         * ignoring #ref URIs.
         *
         * @param Element
         * @return void
         */
        _fixRelativeUris(articleContent) {
          var baseURI = this._doc.baseURI;
          var documentURI = this._doc.documentURI;
          function toAbsoluteURI(uri) {
            if (baseURI == documentURI && uri.charAt(0) == "#") {
              return uri;
            }
            try {
              return new URL(uri, baseURI).href;
            } catch (ex) {
            }
            return uri;
          }
          var links = this._getAllNodesWithTag(articleContent, ["a"]);
          this._forEachNode(links, function(link) {
            var href = link.getAttribute("href");
            if (href) {
              if (href.indexOf("javascript:") === 0) {
                if (link.childNodes.length === 1 && link.childNodes[0].nodeType === this.TEXT_NODE) {
                  var text = this._doc.createTextNode(link.textContent);
                  link.parentNode.replaceChild(text, link);
                } else {
                  var container = this._doc.createElement("span");
                  while (link.firstChild) {
                    container.appendChild(link.firstChild);
                  }
                  link.parentNode.replaceChild(container, link);
                }
              } else {
                link.setAttribute("href", toAbsoluteURI(href));
              }
            }
          });
          var medias = this._getAllNodesWithTag(articleContent, [
            "img",
            "picture",
            "figure",
            "video",
            "audio",
            "source"
          ]);
          this._forEachNode(medias, function(media) {
            var src = media.getAttribute("src");
            var poster = media.getAttribute("poster");
            var srcset = media.getAttribute("srcset");
            if (src) {
              media.setAttribute("src", toAbsoluteURI(src));
            }
            if (poster) {
              media.setAttribute("poster", toAbsoluteURI(poster));
            }
            if (srcset) {
              var newSrcset = srcset.replace(
                this.REGEXPS.srcsetUrl,
                function(_, p1, p2, p3) {
                  return toAbsoluteURI(p1) + (p2 || "") + p3;
                }
              );
              media.setAttribute("srcset", newSrcset);
            }
          });
        },
        _simplifyNestedElements(articleContent) {
          var node = articleContent;
          while (node) {
            if (node.parentNode && ["DIV", "SECTION"].includes(node.tagName) && !(node.id && node.id.startsWith("readability"))) {
              if (this._isElementWithoutContent(node)) {
                node = this._removeAndGetNext(node);
                continue;
              } else if (this._hasSingleTagInsideElement(node, "DIV") || this._hasSingleTagInsideElement(node, "SECTION")) {
                var child = node.children[0];
                for (var i = 0; i < node.attributes.length; i++) {
                  child.setAttributeNode(node.attributes[i].cloneNode());
                }
                node.parentNode.replaceChild(child, node);
                node = child;
                continue;
              }
            }
            node = this._getNextNode(node);
          }
        },
        /**
         * Get the article title as an H1.
         *
         * @return string
         **/
        _getArticleTitle() {
          var doc = this._doc;
          var curTitle = "";
          var origTitle = "";
          try {
            curTitle = origTitle = doc.title.trim();
            if (typeof curTitle !== "string") {
              curTitle = origTitle = this._getInnerText(
                doc.getElementsByTagName("title")[0]
              );
            }
          } catch (e) {
          }
          var titleHadHierarchicalSeparators = false;
          function wordCount(str) {
            return str.split(/\s+/).length;
          }
          if (/ [\|\-\\\/>»] /.test(curTitle)) {
            titleHadHierarchicalSeparators = / [\\\/>»] /.test(curTitle);
            let allSeparators = Array.from(origTitle.matchAll(/ [\|\-\\\/>»] /gi));
            curTitle = origTitle.substring(0, allSeparators.pop().index);
            if (wordCount(curTitle) < 3) {
              curTitle = origTitle.replace(/^[^\|\-\\\/>»]*[\|\-\\\/>»]/gi, "");
            }
          } else if (curTitle.includes(": ")) {
            var headings = this._getAllNodesWithTag(doc, ["h1", "h2"]);
            var trimmedTitle = curTitle.trim();
            var match = this._someNode(headings, function(heading) {
              return heading.textContent.trim() === trimmedTitle;
            });
            if (!match) {
              curTitle = origTitle.substring(origTitle.lastIndexOf(":") + 1);
              if (wordCount(curTitle) < 3) {
                curTitle = origTitle.substring(origTitle.indexOf(":") + 1);
              } else if (wordCount(origTitle.substr(0, origTitle.indexOf(":"))) > 5) {
                curTitle = origTitle;
              }
            }
          } else if (curTitle.length > 150 || curTitle.length < 15) {
            var hOnes = doc.getElementsByTagName("h1");
            if (hOnes.length === 1) {
              curTitle = this._getInnerText(hOnes[0]);
            }
          }
          curTitle = curTitle.trim().replace(this.REGEXPS.normalize, " ");
          var curTitleWordCount = wordCount(curTitle);
          if (curTitleWordCount <= 4 && (!titleHadHierarchicalSeparators || curTitleWordCount != wordCount(origTitle.replace(/[\|\-\\\/>»]+/g, "")) - 1)) {
            curTitle = origTitle;
          }
          return curTitle;
        },
        /**
         * Prepare the HTML document for readability to scrape it.
         * This includes things like stripping javascript, CSS, and handling terrible markup.
         *
         * @return void
         **/
        _prepDocument() {
          var doc = this._doc;
          this._removeNodes(this._getAllNodesWithTag(doc, ["style"]));
          if (doc.body) {
            this._replaceBrs(doc.body);
          }
          this._replaceNodeTags(this._getAllNodesWithTag(doc, ["font"]), "SPAN");
        },
        /**
         * Finds the next node, starting from the given node, and ignoring
         * whitespace in between. If the given node is an element, the same node is
         * returned.
         */
        _nextNode(node) {
          var next = node;
          while (next && next.nodeType != this.ELEMENT_NODE && this.REGEXPS.whitespace.test(next.textContent)) {
            next = next.nextSibling;
          }
          return next;
        },
        /**
         * Replaces 2 or more successive <br> elements with a single <p>.
         * Whitespace between <br> elements are ignored. For example:
         *   <div>foo<br>bar<br> <br><br>abc</div>
         * will become:
         *   <div>foo<br>bar<p>abc</p></div>
         */
        _replaceBrs(elem) {
          this._forEachNode(this._getAllNodesWithTag(elem, ["br"]), function(br) {
            var next = br.nextSibling;
            var replaced = false;
            while ((next = this._nextNode(next)) && next.tagName == "BR") {
              replaced = true;
              var brSibling = next.nextSibling;
              next.remove();
              next = brSibling;
            }
            if (replaced) {
              var p = this._doc.createElement("p");
              br.parentNode.replaceChild(p, br);
              next = p.nextSibling;
              while (next) {
                if (next.tagName == "BR") {
                  var nextElem = this._nextNode(next.nextSibling);
                  if (nextElem && nextElem.tagName == "BR") {
                    break;
                  }
                }
                if (!this._isPhrasingContent(next)) {
                  break;
                }
                var sibling = next.nextSibling;
                p.appendChild(next);
                next = sibling;
              }
              while (p.lastChild && this._isWhitespace(p.lastChild)) {
                p.lastChild.remove();
              }
              if (p.parentNode.tagName === "P") {
                this._setNodeTag(p.parentNode, "DIV");
              }
            }
          });
        },
        _setNodeTag(node, tag) {
          this.log("_setNodeTag", node, tag);
          if (this._docJSDOMParser) {
            node.localName = tag.toLowerCase();
            node.tagName = tag.toUpperCase();
            return node;
          }
          var replacement = node.ownerDocument.createElement(tag);
          while (node.firstChild) {
            replacement.appendChild(node.firstChild);
          }
          node.parentNode.replaceChild(replacement, node);
          if (node.readability) {
            replacement.readability = node.readability;
          }
          for (var i = 0; i < node.attributes.length; i++) {
            replacement.setAttributeNode(node.attributes[i].cloneNode());
          }
          return replacement;
        },
        /**
         * Prepare the article node for display. Clean out any inline styles,
         * iframes, forms, strip extraneous <p> tags, etc.
         *
         * @param Element
         * @return void
         **/
        _prepArticle(articleContent) {
          this._cleanStyles(articleContent);
          this._markDataTables(articleContent);
          this._fixLazyImages(articleContent);
          this._cleanConditionally(articleContent, "form");
          this._cleanConditionally(articleContent, "fieldset");
          this._clean(articleContent, "object");
          this._clean(articleContent, "embed");
          this._clean(articleContent, "footer");
          this._clean(articleContent, "link");
          this._clean(articleContent, "aside");
          var shareElementThreshold = this.DEFAULT_CHAR_THRESHOLD;
          this._forEachNode(articleContent.children, function(topCandidate) {
            this._cleanMatchedNodes(topCandidate, function(node, matchString) {
              return this.REGEXPS.shareElements.test(matchString) && node.textContent.length < shareElementThreshold;
            });
          });
          this._clean(articleContent, "iframe");
          this._clean(articleContent, "input");
          this._clean(articleContent, "textarea");
          this._clean(articleContent, "select");
          this._clean(articleContent, "button");
          this._cleanHeaders(articleContent);
          this._cleanConditionally(articleContent, "table");
          this._cleanConditionally(articleContent, "ul");
          this._cleanConditionally(articleContent, "div");
          this._replaceNodeTags(
            this._getAllNodesWithTag(articleContent, ["h1"]),
            "h2"
          );
          this._removeNodes(
            this._getAllNodesWithTag(articleContent, ["p"]),
            function(paragraph) {
              var contentElementCount = this._getAllNodesWithTag(paragraph, [
                "img",
                "embed",
                "object",
                "iframe"
              ]).length;
              return contentElementCount === 0 && !this._getInnerText(paragraph, false);
            }
          );
          this._forEachNode(
            this._getAllNodesWithTag(articleContent, ["br"]),
            function(br) {
              var next = this._nextNode(br.nextSibling);
              if (next && next.tagName == "P") {
                br.remove();
              }
            }
          );
          this._forEachNode(
            this._getAllNodesWithTag(articleContent, ["table"]),
            function(table) {
              var tbody = this._hasSingleTagInsideElement(table, "TBODY") ? table.firstElementChild : table;
              if (this._hasSingleTagInsideElement(tbody, "TR")) {
                var row = tbody.firstElementChild;
                if (this._hasSingleTagInsideElement(row, "TD")) {
                  var cell = row.firstElementChild;
                  cell = this._setNodeTag(
                    cell,
                    this._everyNode(cell.childNodes, this._isPhrasingContent) ? "P" : "DIV"
                  );
                  table.parentNode.replaceChild(cell, table);
                }
              }
            }
          );
        },
        /**
         * Initialize a node with the readability object. Also checks the
         * className/id for special names to add to its score.
         *
         * @param Element
         * @return void
         **/
        _initializeNode(node) {
          node.readability = { contentScore: 0 };
          switch (node.tagName) {
            case "DIV":
              node.readability.contentScore += 5;
              break;
            case "PRE":
            case "TD":
            case "BLOCKQUOTE":
              node.readability.contentScore += 3;
              break;
            case "ADDRESS":
            case "OL":
            case "UL":
            case "DL":
            case "DD":
            case "DT":
            case "LI":
            case "FORM":
              node.readability.contentScore -= 3;
              break;
            case "H1":
            case "H2":
            case "H3":
            case "H4":
            case "H5":
            case "H6":
            case "TH":
              node.readability.contentScore -= 5;
              break;
          }
          node.readability.contentScore += this._getClassWeight(node);
        },
        _removeAndGetNext(node) {
          var nextNode = this._getNextNode(node, true);
          node.remove();
          return nextNode;
        },
        /**
         * Traverse the DOM from node to node, starting at the node passed in.
         * Pass true for the second parameter to indicate this node itself
         * (and its kids) are going away, and we want the next node over.
         *
         * Calling this in a loop will traverse the DOM depth-first.
         *
         * @param {Element} node
         * @param {boolean} ignoreSelfAndKids
         * @return {Element}
         */
        _getNextNode(node, ignoreSelfAndKids) {
          if (!ignoreSelfAndKids && node.firstElementChild) {
            return node.firstElementChild;
          }
          if (node.nextElementSibling) {
            return node.nextElementSibling;
          }
          do {
            node = node.parentNode;
          } while (node && !node.nextElementSibling);
          return node && node.nextElementSibling;
        },
        // compares second text to first one
        // 1 = same text, 0 = completely different text
        // works the way that it splits both texts into words and then finds words that are unique in second text
        // the result is given by the lower length of unique parts
        _textSimilarity(textA, textB) {
          var tokensA = textA.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
          var tokensB = textB.toLowerCase().split(this.REGEXPS.tokenize).filter(Boolean);
          if (!tokensA.length || !tokensB.length) {
            return 0;
          }
          var uniqTokensB = tokensB.filter((token) => !tokensA.includes(token));
          var distanceB = uniqTokensB.join(" ").length / tokensB.join(" ").length;
          return 1 - distanceB;
        },
        /**
         * Checks whether an element node contains a valid byline
         *
         * @param node {Element}
         * @param matchString {string}
         * @return boolean
         */
        _isValidByline(node, matchString) {
          var rel = node.getAttribute("rel");
          var itemprop = node.getAttribute("itemprop");
          var bylineLength = node.textContent.trim().length;
          return (rel === "author" || itemprop && itemprop.includes("author") || this.REGEXPS.byline.test(matchString)) && !!bylineLength && bylineLength < 100;
        },
        _getNodeAncestors(node, maxDepth) {
          maxDepth = maxDepth || 0;
          var i = 0, ancestors = [];
          while (node.parentNode) {
            ancestors.push(node.parentNode);
            if (maxDepth && ++i === maxDepth) {
              break;
            }
            node = node.parentNode;
          }
          return ancestors;
        },
        /***
         * grabArticle - Using a variety of metrics (content score, classname, element types), find the content that is
         *         most likely to be the stuff a user wants to read. Then return it wrapped up in a div.
         *
         * @param page a document to run upon. Needs to be a full document, complete with body.
         * @return Element
         **/
        /* eslint-disable-next-line complexity */
        _grabArticle(page) {
          this.log("**** grabArticle ****");
          var doc = this._doc;
          var isPaging = page !== null;
          page = page ? page : this._doc.body;
          if (!page) {
            this.log("No body found in document. Abort.");
            return null;
          }
          var pageCacheNodes = Array.from(page.childNodes).map((n) => n.cloneNode(true));
          while (true) {
            this.log("Starting grabArticle loop");
            var stripUnlikelyCandidates = this._flagIsActive(
              this.FLAG_STRIP_UNLIKELYS
            );
            var elementsToScore = [];
            var node = this._doc.documentElement;
            let shouldRemoveTitleHeader = true;
            while (node) {
              if (node.tagName === "HTML") {
                this._articleLang = node.getAttribute("lang");
              }
              var matchString = node.className + " " + node.id;
              if (!this._isProbablyVisible(node)) {
                this.log("Removing hidden node - " + matchString);
                node = this._removeAndGetNext(node);
                continue;
              }
              if (node.getAttribute("aria-modal") == "true" && node.getAttribute("role") == "dialog") {
                node = this._removeAndGetNext(node);
                continue;
              }
              if (!this._articleByline && !this._metadata.byline && this._isValidByline(node, matchString)) {
                var endOfSearchMarkerNode = this._getNextNode(node, true);
                var next = this._getNextNode(node);
                var itemPropNameNode = null;
                while (next && next != endOfSearchMarkerNode) {
                  var itemprop = next.getAttribute("itemprop");
                  if (itemprop && itemprop.includes("name")) {
                    itemPropNameNode = next;
                    break;
                  } else {
                    next = this._getNextNode(next);
                  }
                }
                this._articleByline = (itemPropNameNode ?? node).textContent.trim();
                node = this._removeAndGetNext(node);
                continue;
              }
              if (shouldRemoveTitleHeader && this._headerDuplicatesTitle(node)) {
                this.log(
                  "Removing header: ",
                  node.textContent.trim(),
                  this._articleTitle.trim()
                );
                shouldRemoveTitleHeader = false;
                node = this._removeAndGetNext(node);
                continue;
              }
              if (stripUnlikelyCandidates) {
                if (this.REGEXPS.unlikelyCandidates.test(matchString) && !this.REGEXPS.okMaybeItsACandidate.test(matchString) && !this._hasAncestorTag(node, "table") && !this._hasAncestorTag(node, "code") && node.tagName !== "BODY" && node.tagName !== "A") {
                  this.log("Removing unlikely candidate - " + matchString);
                  node = this._removeAndGetNext(node);
                  continue;
                }
                if (this.UNLIKELY_ROLES.includes(node.getAttribute("role"))) {
                  this.log(
                    "Removing content with role " + node.getAttribute("role") + " - " + matchString
                  );
                  node = this._removeAndGetNext(node);
                  continue;
                }
              }
              if ((node.tagName === "DIV" || node.tagName === "SECTION" || node.tagName === "HEADER" || node.tagName === "H1" || node.tagName === "H2" || node.tagName === "H3" || node.tagName === "H4" || node.tagName === "H5" || node.tagName === "H6") && this._isElementWithoutContent(node)) {
                node = this._removeAndGetNext(node);
                continue;
              }
              if (this.DEFAULT_TAGS_TO_SCORE.includes(node.tagName)) {
                elementsToScore.push(node);
              }
              if (node.tagName === "DIV") {
                var p = null;
                var childNode = node.firstChild;
                while (childNode) {
                  var nextSibling = childNode.nextSibling;
                  if (this._isPhrasingContent(childNode)) {
                    if (p !== null) {
                      p.appendChild(childNode);
                    } else if (!this._isWhitespace(childNode)) {
                      p = doc.createElement("p");
                      node.replaceChild(p, childNode);
                      p.appendChild(childNode);
                    }
                  } else if (p !== null) {
                    while (p.lastChild && this._isWhitespace(p.lastChild)) {
                      p.lastChild.remove();
                    }
                    p = null;
                  }
                  childNode = nextSibling;
                }
                if (this._hasSingleTagInsideElement(node, "P") && this._getLinkDensity(node) < 0.25) {
                  var newNode = node.children[0];
                  node.parentNode.replaceChild(newNode, node);
                  node = newNode;
                  elementsToScore.push(node);
                } else if (!this._hasChildBlockElement(node)) {
                  node = this._setNodeTag(node, "P");
                  elementsToScore.push(node);
                }
              }
              node = this._getNextNode(node);
            }
            var candidates = [];
            this._forEachNode(elementsToScore, function(elementToScore) {
              if (!elementToScore.parentNode || typeof elementToScore.parentNode.tagName === "undefined") {
                return;
              }
              var innerText = this._getInnerText(elementToScore);
              if (innerText.length < 25) {
                return;
              }
              var ancestors2 = this._getNodeAncestors(elementToScore, 5);
              if (ancestors2.length === 0) {
                return;
              }
              var contentScore = 0;
              contentScore += 1;
              contentScore += innerText.split(this.REGEXPS.commas).length;
              contentScore += Math.min(Math.floor(innerText.length / 100), 3);
              this._forEachNode(ancestors2, function(ancestor, level) {
                if (!ancestor.tagName || !ancestor.parentNode || typeof ancestor.parentNode.tagName === "undefined") {
                  return;
                }
                if (typeof ancestor.readability === "undefined") {
                  this._initializeNode(ancestor);
                  candidates.push(ancestor);
                }
                if (level === 0) {
                  var scoreDivider = 1;
                } else if (level === 1) {
                  scoreDivider = 2;
                } else {
                  scoreDivider = level * 3;
                }
                ancestor.readability.contentScore += contentScore / scoreDivider;
              });
            });
            var topCandidates = [];
            for (var c = 0, cl = candidates.length; c < cl; c += 1) {
              var candidate = candidates[c];
              var candidateScore = candidate.readability.contentScore * (1 - this._getLinkDensity(candidate));
              candidate.readability.contentScore = candidateScore;
              this.log("Candidate:", candidate, "with score " + candidateScore);
              for (var t2 = 0; t2 < this._nbTopCandidates; t2++) {
                var aTopCandidate = topCandidates[t2];
                if (!aTopCandidate || candidateScore > aTopCandidate.readability.contentScore) {
                  topCandidates.splice(t2, 0, candidate);
                  if (topCandidates.length > this._nbTopCandidates) {
                    topCandidates.pop();
                  }
                  break;
                }
              }
            }
            var topCandidate = topCandidates[0] || null;
            var neededToCreateTopCandidate = false;
            var parentOfTopCandidate;
            if (topCandidate === null || topCandidate.tagName === "BODY") {
              topCandidate = doc.createElement("DIV");
              neededToCreateTopCandidate = true;
              while (page.firstChild) {
                this.log("Moving child out:", page.firstChild);
                topCandidate.appendChild(page.firstChild);
              }
              page.appendChild(topCandidate);
              this._initializeNode(topCandidate);
            } else if (topCandidate) {
              var alternativeCandidateAncestors = [];
              for (var i = 1; i < topCandidates.length; i++) {
                if (topCandidates[i].readability.contentScore / topCandidate.readability.contentScore >= 0.75) {
                  alternativeCandidateAncestors.push(
                    this._getNodeAncestors(topCandidates[i])
                  );
                }
              }
              var MINIMUM_TOPCANDIDATES = 3;
              if (alternativeCandidateAncestors.length >= MINIMUM_TOPCANDIDATES) {
                parentOfTopCandidate = topCandidate.parentNode;
                while (parentOfTopCandidate.tagName !== "BODY") {
                  var listsContainingThisAncestor = 0;
                  for (var ancestorIndex = 0; ancestorIndex < alternativeCandidateAncestors.length && listsContainingThisAncestor < MINIMUM_TOPCANDIDATES; ancestorIndex++) {
                    listsContainingThisAncestor += Number(
                      alternativeCandidateAncestors[ancestorIndex].includes(
                        parentOfTopCandidate
                      )
                    );
                  }
                  if (listsContainingThisAncestor >= MINIMUM_TOPCANDIDATES) {
                    topCandidate = parentOfTopCandidate;
                    break;
                  }
                  parentOfTopCandidate = parentOfTopCandidate.parentNode;
                }
              }
              if (!topCandidate.readability) {
                this._initializeNode(topCandidate);
              }
              parentOfTopCandidate = topCandidate.parentNode;
              var lastScore = topCandidate.readability.contentScore;
              var scoreThreshold = lastScore / 3;
              while (parentOfTopCandidate.tagName !== "BODY") {
                if (!parentOfTopCandidate.readability) {
                  parentOfTopCandidate = parentOfTopCandidate.parentNode;
                  continue;
                }
                var parentScore = parentOfTopCandidate.readability.contentScore;
                if (parentScore < scoreThreshold) {
                  break;
                }
                if (parentScore > lastScore) {
                  topCandidate = parentOfTopCandidate;
                  break;
                }
                lastScore = parentOfTopCandidate.readability.contentScore;
                parentOfTopCandidate = parentOfTopCandidate.parentNode;
              }
              parentOfTopCandidate = topCandidate.parentNode;
              while (parentOfTopCandidate.tagName != "BODY" && parentOfTopCandidate.children.length == 1) {
                topCandidate = parentOfTopCandidate;
                parentOfTopCandidate = topCandidate.parentNode;
              }
              if (!topCandidate.readability) {
                this._initializeNode(topCandidate);
              }
            }
            var articleContent = doc.createElement("DIV");
            if (isPaging) {
              articleContent.id = "readability-content";
            }
            var siblingScoreThreshold = Math.max(
              10,
              topCandidate.readability.contentScore * 0.2
            );
            parentOfTopCandidate = topCandidate.parentNode;
            var siblings = parentOfTopCandidate.children;
            for (var s = 0, sl = siblings.length; s < sl; s++) {
              var sibling = siblings[s];
              var append = false;
              this.log(
                "Looking at sibling node:",
                sibling,
                sibling.readability ? "with score " + sibling.readability.contentScore : ""
              );
              this.log(
                "Sibling has score",
                sibling.readability ? sibling.readability.contentScore : "Unknown"
              );
              if (sibling === topCandidate) {
                append = true;
              } else {
                var contentBonus = 0;
                if (sibling.className === topCandidate.className && topCandidate.className !== "") {
                  contentBonus += topCandidate.readability.contentScore * 0.2;
                }
                if (sibling.readability && sibling.readability.contentScore + contentBonus >= siblingScoreThreshold) {
                  append = true;
                } else if (sibling.nodeName === "P") {
                  var linkDensity = this._getLinkDensity(sibling);
                  var nodeContent = this._getInnerText(sibling);
                  var nodeLength = nodeContent.length;
                  if (nodeLength > 80 && linkDensity < 0.25) {
                    append = true;
                  } else if (nodeLength < 80 && nodeLength > 0 && linkDensity === 0 && nodeContent.search(/\.( |$)/) !== -1) {
                    append = true;
                  }
                }
              }
              if (append) {
                this.log("Appending node:", sibling);
                if (!this.ALTER_TO_DIV_EXCEPTIONS.includes(sibling.nodeName)) {
                  this.log("Altering sibling:", sibling, "to div.");
                  sibling = this._setNodeTag(sibling, "DIV");
                }
                articleContent.appendChild(sibling);
                siblings = parentOfTopCandidate.children;
                s -= 1;
                sl -= 1;
              }
            }
            if (this._debug) {
              this.log("Article content pre-prep: " + articleContent.innerHTML);
            }
            this._prepArticle(articleContent);
            if (this._debug) {
              this.log("Article content post-prep: " + articleContent.innerHTML);
            }
            if (neededToCreateTopCandidate) {
              topCandidate.id = "readability-page-1";
              topCandidate.className = "page";
            } else {
              var div = doc.createElement("DIV");
              div.id = "readability-page-1";
              div.className = "page";
              while (articleContent.firstChild) {
                div.appendChild(articleContent.firstChild);
              }
              articleContent.appendChild(div);
            }
            if (this._debug) {
              this.log("Article content after paging: " + articleContent.innerHTML);
            }
            var parseSuccessful = true;
            var textLength = this._getInnerText(articleContent, true).length;
            if (textLength < this._charThreshold) {
              parseSuccessful = false;
              while (page.firstChild) page.removeChild(page.firstChild);
              pageCacheNodes.forEach((n) => page.appendChild(n.cloneNode(true)));
              this._attempts.push({
                articleContent,
                textLength
              });
              if (this._flagIsActive(this.FLAG_STRIP_UNLIKELYS)) {
                this._removeFlag(this.FLAG_STRIP_UNLIKELYS);
              } else if (this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
                this._removeFlag(this.FLAG_WEIGHT_CLASSES);
              } else if (this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
                this._removeFlag(this.FLAG_CLEAN_CONDITIONALLY);
              } else {
                this._attempts.sort(function(a, b) {
                  return b.textLength - a.textLength;
                });
                if (!this._attempts[0].textLength) {
                  return null;
                }
                articleContent = this._attempts[0].articleContent;
                parseSuccessful = true;
              }
            }
            if (parseSuccessful) {
              var ancestors = [parentOfTopCandidate, topCandidate].concat(
                this._getNodeAncestors(parentOfTopCandidate)
              );
              this._someNode(ancestors, function(ancestor) {
                if (!ancestor.tagName) {
                  return false;
                }
                var articleDir = ancestor.getAttribute("dir");
                if (articleDir) {
                  this._articleDir = articleDir;
                  return true;
                }
                return false;
              });
              return articleContent;
            }
          }
        },
        /**
         * Converts some of the common HTML entities in string to their corresponding characters.
         *
         * @param str {string} - a string to unescape.
         * @return string without HTML entity.
         */
        _unescapeHtmlEntities(str) {
          if (!str) {
            return str;
          }
          var htmlEscapeMap = this.HTML_ESCAPE_MAP;
          return str.replace(/&(quot|amp|apos|lt|gt);/g, function(_, tag) {
            return htmlEscapeMap[tag];
          }).replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi, function(_, hex, numStr) {
            var num = parseInt(hex || numStr, hex ? 16 : 10);
            if (num == 0 || num > 1114111 || num >= 55296 && num <= 57343) {
              num = 65533;
            }
            return String.fromCodePoint(num);
          });
        },
        /**
         * Try to extract metadata from JSON-LD object.
         * For now, only Schema.org objects of type Article or its subtypes are supported.
         * @return Object with any metadata that could be extracted (possibly none)
         */
        _getJSONLD(doc) {
          var scripts = this._getAllNodesWithTag(doc, ["script"]);
          var metadata;
          this._forEachNode(scripts, function(jsonLdElement) {
            if (!metadata && jsonLdElement.getAttribute("type") === "application/ld+json") {
              try {
                var content = jsonLdElement.textContent.replace(
                  /^\s*<!\[CDATA\[|\]\]>\s*$/g,
                  ""
                );
                var parsed = JSON.parse(content);
                if (Array.isArray(parsed)) {
                  parsed = parsed.find((it) => {
                    return it["@type"] && it["@type"].match(this.REGEXPS.jsonLdArticleTypes);
                  });
                  if (!parsed) {
                    return;
                  }
                }
                var schemaDotOrgRegex = /^https?\:\/\/schema\.org\/?$/;
                var matches = typeof parsed["@context"] === "string" && parsed["@context"].match(schemaDotOrgRegex) || typeof parsed["@context"] === "object" && typeof parsed["@context"]["@vocab"] == "string" && parsed["@context"]["@vocab"].match(schemaDotOrgRegex);
                if (!matches) {
                  return;
                }
                if (!parsed["@type"] && Array.isArray(parsed["@graph"])) {
                  parsed = parsed["@graph"].find((it) => {
                    return (it["@type"] || "").match(this.REGEXPS.jsonLdArticleTypes);
                  });
                }
                if (!parsed || !parsed["@type"] || !parsed["@type"].match(this.REGEXPS.jsonLdArticleTypes)) {
                  return;
                }
                metadata = {};
                if (typeof parsed.name === "string" && typeof parsed.headline === "string" && parsed.name !== parsed.headline) {
                  var title = this._getArticleTitle();
                  var nameMatches = this._textSimilarity(parsed.name, title) > 0.75;
                  var headlineMatches = this._textSimilarity(parsed.headline, title) > 0.75;
                  if (headlineMatches && !nameMatches) {
                    metadata.title = parsed.headline;
                  } else {
                    metadata.title = parsed.name;
                  }
                } else if (typeof parsed.name === "string") {
                  metadata.title = parsed.name.trim();
                } else if (typeof parsed.headline === "string") {
                  metadata.title = parsed.headline.trim();
                }
                if (parsed.author) {
                  if (typeof parsed.author.name === "string") {
                    metadata.byline = parsed.author.name.trim();
                  } else if (Array.isArray(parsed.author) && parsed.author[0] && typeof parsed.author[0].name === "string") {
                    metadata.byline = parsed.author.filter(function(author) {
                      return author && typeof author.name === "string";
                    }).map(function(author) {
                      return author.name.trim();
                    }).join(", ");
                  }
                }
                if (typeof parsed.description === "string") {
                  metadata.excerpt = parsed.description.trim();
                }
                if (parsed.publisher && typeof parsed.publisher.name === "string") {
                  metadata.siteName = parsed.publisher.name.trim();
                }
                if (typeof parsed.datePublished === "string") {
                  metadata.datePublished = parsed.datePublished.trim();
                }
              } catch (err) {
                this.log(err.message);
              }
            }
          });
          return metadata ? metadata : {};
        },
        /**
         * Attempts to get excerpt and byline metadata for the article.
         *
         * @param {Object} jsonld — object containing any metadata that
         * could be extracted from JSON-LD object.
         *
         * @return Object with optional "excerpt" and "byline" properties
         */
        _getArticleMetadata(jsonld) {
          var metadata = {};
          var values = {};
          var metaElements = this._doc.getElementsByTagName("meta");
          var propertyPattern = /\s*(article|dc|dcterm|og|twitter)\s*:\s*(author|creator|description|published_time|title|site_name)\s*/gi;
          var namePattern = /^\s*(?:(dc|dcterm|og|twitter|parsely|weibo:(article|webpage))\s*[-\.:]\s*)?(author|creator|pub-date|description|title|site_name)\s*$/i;
          this._forEachNode(metaElements, function(element) {
            var elementName = element.getAttribute("name");
            var elementProperty = element.getAttribute("property");
            var content = element.getAttribute("content");
            if (!content) {
              return;
            }
            var matches = null;
            var name = null;
            if (elementProperty) {
              matches = elementProperty.match(propertyPattern);
              if (matches) {
                name = matches[0].toLowerCase().replace(/\s/g, "");
                values[name] = content.trim();
              }
            }
            if (!matches && elementName && namePattern.test(elementName)) {
              name = elementName;
              if (content) {
                name = name.toLowerCase().replace(/\s/g, "").replace(/\./g, ":");
                values[name] = content.trim();
              }
            }
          });
          metadata.title = jsonld.title || values["dc:title"] || values["dcterm:title"] || values["og:title"] || values["weibo:article:title"] || values["weibo:webpage:title"] || values.title || values["twitter:title"] || values["parsely-title"];
          if (!metadata.title) {
            metadata.title = this._getArticleTitle();
          }
          const articleAuthor = typeof values["article:author"] === "string" && !this._isUrl(values["article:author"]) ? values["article:author"] : void 0;
          metadata.byline = jsonld.byline || values["dc:creator"] || values["dcterm:creator"] || values.author || values["parsely-author"] || articleAuthor;
          metadata.excerpt = jsonld.excerpt || values["dc:description"] || values["dcterm:description"] || values["og:description"] || values["weibo:article:description"] || values["weibo:webpage:description"] || values.description || values["twitter:description"];
          metadata.siteName = jsonld.siteName || values["og:site_name"];
          metadata.publishedTime = jsonld.datePublished || values["article:published_time"] || values["parsely-pub-date"] || null;
          metadata.title = this._unescapeHtmlEntities(metadata.title);
          metadata.byline = this._unescapeHtmlEntities(metadata.byline);
          metadata.excerpt = this._unescapeHtmlEntities(metadata.excerpt);
          metadata.siteName = this._unescapeHtmlEntities(metadata.siteName);
          metadata.publishedTime = this._unescapeHtmlEntities(metadata.publishedTime);
          return metadata;
        },
        /**
         * Check if node is image, or if node contains exactly only one image
         * whether as a direct child or as its descendants.
         *
         * @param Element
         **/
        _isSingleImage(node) {
          while (node) {
            if (node.tagName === "IMG") {
              return true;
            }
            if (node.children.length !== 1 || node.textContent.trim() !== "") {
              return false;
            }
            node = node.children[0];
          }
          return false;
        },
        /**
         * Find all <noscript> that are located after <img> nodes, and which contain only one
         * <img> element. Replace the first image with the image from inside the <noscript> tag,
         * and remove the <noscript> tag. This improves the quality of the images we use on
         * some sites (e.g. Medium).
         *
         * @param Element
         **/
        _unwrapNoscriptImages(doc) {
          var imgs = Array.from(doc.getElementsByTagName("img"));
          this._forEachNode(imgs, function(img) {
            for (var i = 0; i < img.attributes.length; i++) {
              var attr = img.attributes[i];
              switch (attr.name) {
                case "src":
                case "srcset":
                case "data-src":
                case "data-srcset":
                  return;
              }
              if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
                return;
              }
            }
            img.remove();
          });
          var noscripts = Array.from(doc.getElementsByTagName("noscript"));
          this._forEachNode(noscripts, function(noscript) {
            if (!this._isSingleImage(noscript)) {
              return;
            }
            var tmp = doc.createElement("div");
            var parsedNoscript = new DOMParser().parseFromString(noscript.innerHTML, "text/html");
            while (parsedNoscript.body.firstChild) tmp.appendChild(parsedNoscript.body.firstChild);
            var prevElement = noscript.previousElementSibling;
            if (prevElement && this._isSingleImage(prevElement)) {
              var prevImg = prevElement;
              if (prevImg.tagName !== "IMG") {
                prevImg = prevElement.getElementsByTagName("img")[0];
              }
              var newImg = tmp.getElementsByTagName("img")[0];
              for (var i = 0; i < prevImg.attributes.length; i++) {
                var attr = prevImg.attributes[i];
                if (attr.value === "") {
                  continue;
                }
                if (attr.name === "src" || attr.name === "srcset" || /\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
                  if (newImg.getAttribute(attr.name) === attr.value) {
                    continue;
                  }
                  var attrName = attr.name;
                  if (newImg.hasAttribute(attrName)) {
                    attrName = "data-old-" + attrName;
                  }
                  newImg.setAttribute(attrName, attr.value);
                }
              }
              noscript.parentNode.replaceChild(tmp.firstElementChild, prevElement);
            }
          });
        },
        /**
         * Removes script tags from the document.
         *
         * @param Element
         **/
        _removeScripts(doc) {
          this._removeNodes(this._getAllNodesWithTag(doc, ["script", "noscript"]));
        },
        /**
         * Check if this node has only whitespace and a single element with given tag
         * Returns false if the DIV node contains non-empty text nodes
         * or if it contains no element with given tag or more than 1 element.
         *
         * @param Element
         * @param string tag of child element
         **/
        _hasSingleTagInsideElement(element, tag) {
          if (element.children.length != 1 || element.children[0].tagName !== tag) {
            return false;
          }
          return !this._someNode(element.childNodes, function(node) {
            return node.nodeType === this.TEXT_NODE && this.REGEXPS.hasContent.test(node.textContent);
          });
        },
        _isElementWithoutContent(node) {
          return node.nodeType === this.ELEMENT_NODE && !node.textContent.trim().length && (!node.children.length || node.children.length == node.getElementsByTagName("br").length + node.getElementsByTagName("hr").length);
        },
        /**
         * Determine whether element has any children block level elements.
         *
         * @param Element
         */
        _hasChildBlockElement(element) {
          return this._someNode(element.childNodes, function(node) {
            return this.DIV_TO_P_ELEMS.has(node.tagName) || this._hasChildBlockElement(node);
          });
        },
        /***
         * Determine if a node qualifies as phrasing content.
         * https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Content_categories#Phrasing_content
         **/
        _isPhrasingContent(node) {
          return node.nodeType === this.TEXT_NODE || this.PHRASING_ELEMS.includes(node.tagName) || (node.tagName === "A" || node.tagName === "DEL" || node.tagName === "INS") && this._everyNode(node.childNodes, this._isPhrasingContent);
        },
        _isWhitespace(node) {
          return node.nodeType === this.TEXT_NODE && node.textContent.trim().length === 0 || node.nodeType === this.ELEMENT_NODE && node.tagName === "BR";
        },
        /**
         * Get the inner text of a node - cross browser compatibly.
         * This also strips out any excess whitespace to be found.
         *
         * @param Element
         * @param Boolean normalizeSpaces (default: true)
         * @return string
         **/
        _getInnerText(e, normalizeSpaces) {
          normalizeSpaces = typeof normalizeSpaces === "undefined" ? true : normalizeSpaces;
          var textContent = e.textContent.trim();
          if (normalizeSpaces) {
            return textContent.replace(this.REGEXPS.normalize, " ");
          }
          return textContent;
        },
        /**
         * Get the number of times a string s appears in the node e.
         *
         * @param Element
         * @param string - what to split on. Default is ","
         * @return number (integer)
         **/
        _getCharCount(e, s) {
          s = s || ",";
          return this._getInnerText(e).split(s).length - 1;
        },
        /**
         * Remove the style attribute on every e and under.
         * TODO: Test if getElementsByTagName(*) is faster.
         *
         * @param Element
         * @return void
         **/
        _cleanStyles(e) {
          if (!e || e.tagName.toLowerCase() === "svg") {
            return;
          }
          for (var i = 0; i < this.PRESENTATIONAL_ATTRIBUTES.length; i++) {
            e.removeAttribute(this.PRESENTATIONAL_ATTRIBUTES[i]);
          }
          if (this.DEPRECATED_SIZE_ATTRIBUTE_ELEMS.includes(e.tagName)) {
            e.removeAttribute("width");
            e.removeAttribute("height");
          }
          var cur = e.firstElementChild;
          while (cur !== null) {
            this._cleanStyles(cur);
            cur = cur.nextElementSibling;
          }
        },
        /**
         * Get the density of links as a percentage of the content
         * This is the amount of text that is inside a link divided by the total text in the node.
         *
         * @param Element
         * @return number (float)
         **/
        _getLinkDensity(element) {
          var textLength = this._getInnerText(element).length;
          if (textLength === 0) {
            return 0;
          }
          var linkLength = 0;
          this._forEachNode(element.getElementsByTagName("a"), function(linkNode) {
            var href = linkNode.getAttribute("href");
            var coefficient = href && this.REGEXPS.hashUrl.test(href) ? 0.3 : 1;
            linkLength += this._getInnerText(linkNode).length * coefficient;
          });
          return linkLength / textLength;
        },
        /**
         * Get an elements class/id weight. Uses regular expressions to tell if this
         * element looks good or bad.
         *
         * @param Element
         * @return number (Integer)
         **/
        _getClassWeight(e) {
          if (!this._flagIsActive(this.FLAG_WEIGHT_CLASSES)) {
            return 0;
          }
          var weight = 0;
          if (typeof e.className === "string" && e.className !== "") {
            if (this.REGEXPS.negative.test(e.className)) {
              weight -= 25;
            }
            if (this.REGEXPS.positive.test(e.className)) {
              weight += 25;
            }
          }
          if (typeof e.id === "string" && e.id !== "") {
            if (this.REGEXPS.negative.test(e.id)) {
              weight -= 25;
            }
            if (this.REGEXPS.positive.test(e.id)) {
              weight += 25;
            }
          }
          return weight;
        },
        /**
         * Clean a node of all elements of type "tag".
         * (Unless it's a youtube/vimeo video. People love movies.)
         *
         * @param Element
         * @param string tag to clean
         * @return void
         **/
        _clean(e, tag) {
          var isEmbed = ["object", "embed", "iframe"].includes(tag);
          this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(element) {
            if (isEmbed) {
              for (var i = 0; i < element.attributes.length; i++) {
                if (this._allowedVideoRegex.test(element.attributes[i].value)) {
                  return false;
                }
              }
              if (element.tagName === "object" && this._allowedVideoRegex.test(element.innerHTML)) {
                return false;
              }
            }
            return true;
          });
        },
        /**
         * Check if a given node has one of its ancestor tag name matching the
         * provided one.
         * @param  HTMLElement node
         * @param  String      tagName
         * @param  Number      maxDepth
         * @param  Function    filterFn a filter to invoke to determine whether this node 'counts'
         * @return Boolean
         */
        _hasAncestorTag(node, tagName, maxDepth, filterFn) {
          maxDepth = maxDepth || 3;
          tagName = tagName.toUpperCase();
          var depth = 0;
          while (node.parentNode) {
            if (maxDepth > 0 && depth > maxDepth) {
              return false;
            }
            if (node.parentNode.tagName === tagName && (!filterFn || filterFn(node.parentNode))) {
              return true;
            }
            node = node.parentNode;
            depth++;
          }
          return false;
        },
        /**
         * Return an object indicating how many rows and columns this table has.
         */
        _getRowAndColumnCount(table) {
          var rows = 0;
          var columns = 0;
          var trs = table.getElementsByTagName("tr");
          for (var i = 0; i < trs.length; i++) {
            var rowspan = trs[i].getAttribute("rowspan") || 0;
            if (rowspan) {
              rowspan = parseInt(rowspan, 10);
            }
            rows += rowspan || 1;
            var columnsInThisRow = 0;
            var cells = trs[i].getElementsByTagName("td");
            for (var j = 0; j < cells.length; j++) {
              var colspan = cells[j].getAttribute("colspan") || 0;
              if (colspan) {
                colspan = parseInt(colspan, 10);
              }
              columnsInThisRow += colspan || 1;
            }
            columns = Math.max(columns, columnsInThisRow);
          }
          return { rows, columns };
        },
        /**
         * Look for 'data' (as opposed to 'layout') tables, for which we use
         * similar checks as
         * https://searchfox.org/mozilla-central/rev/f82d5c549f046cb64ce5602bfd894b7ae807c8f8/accessible/generic/TableAccessible.cpp#19
         */
        _markDataTables(root) {
          var tables = root.getElementsByTagName("table");
          for (var i = 0; i < tables.length; i++) {
            var table = tables[i];
            var role = table.getAttribute("role");
            if (role == "presentation") {
              table._readabilityDataTable = false;
              continue;
            }
            var datatable = table.getAttribute("datatable");
            if (datatable == "0") {
              table._readabilityDataTable = false;
              continue;
            }
            var summary = table.getAttribute("summary");
            if (summary) {
              table._readabilityDataTable = true;
              continue;
            }
            var caption2 = table.getElementsByTagName("caption")[0];
            if (caption2 && caption2.childNodes.length) {
              table._readabilityDataTable = true;
              continue;
            }
            var dataTableDescendants = ["col", "colgroup", "tfoot", "thead", "th"];
            var descendantExists = function(tag) {
              return !!table.getElementsByTagName(tag)[0];
            };
            if (dataTableDescendants.some(descendantExists)) {
              this.log("Data table because found data-y descendant");
              table._readabilityDataTable = true;
              continue;
            }
            if (table.getElementsByTagName("table")[0]) {
              table._readabilityDataTable = false;
              continue;
            }
            var sizeInfo = this._getRowAndColumnCount(table);
            if (sizeInfo.columns == 1 || sizeInfo.rows == 1) {
              table._readabilityDataTable = false;
              continue;
            }
            if (sizeInfo.rows >= 10 || sizeInfo.columns > 4) {
              table._readabilityDataTable = true;
              continue;
            }
            table._readabilityDataTable = sizeInfo.rows * sizeInfo.columns > 10;
          }
        },
        /* convert images and figures that have properties like data-src into images that can be loaded without JS */
        _fixLazyImages(root) {
          this._forEachNode(
            this._getAllNodesWithTag(root, ["img", "picture", "figure"]),
            function(elem) {
              if (elem.src && this.REGEXPS.b64DataUrl.test(elem.src)) {
                var parts = this.REGEXPS.b64DataUrl.exec(elem.src);
                if (parts[1] === "image/svg+xml") {
                  return;
                }
                var srcCouldBeRemoved = false;
                for (var i = 0; i < elem.attributes.length; i++) {
                  var attr = elem.attributes[i];
                  if (attr.name === "src") {
                    continue;
                  }
                  if (/\.(jpg|jpeg|png|webp)/i.test(attr.value)) {
                    srcCouldBeRemoved = true;
                    break;
                  }
                }
                if (srcCouldBeRemoved) {
                  var b64starts = parts[0].length;
                  var b64length = elem.src.length - b64starts;
                  if (b64length < 133) {
                    elem.removeAttribute("src");
                  }
                }
              }
              if ((elem.src || elem.srcset && elem.srcset != "null") && !elem.className.toLowerCase().includes("lazy")) {
                return;
              }
              for (var j = 0; j < elem.attributes.length; j++) {
                attr = elem.attributes[j];
                if (attr.name === "src" || attr.name === "srcset" || attr.name === "alt") {
                  continue;
                }
                var copyTo = null;
                if (/\.(jpg|jpeg|png|webp)\s+\d/.test(attr.value)) {
                  copyTo = "srcset";
                } else if (/^\s*\S+\.(jpg|jpeg|png|webp)\S*\s*$/.test(attr.value)) {
                  copyTo = "src";
                }
                if (copyTo) {
                  if (elem.tagName === "IMG" || elem.tagName === "PICTURE") {
                    elem.setAttribute(copyTo, attr.value);
                  } else if (elem.tagName === "FIGURE" && !this._getAllNodesWithTag(elem, ["img", "picture"]).length) {
                    var img = this._doc.createElement("img");
                    img.setAttribute(copyTo, attr.value);
                    elem.appendChild(img);
                  }
                }
              }
            }
          );
        },
        _getTextDensity(e, tags) {
          var textLength = this._getInnerText(e, true).length;
          if (textLength === 0) {
            return 0;
          }
          var childrenLength = 0;
          var children = this._getAllNodesWithTag(e, tags);
          this._forEachNode(
            children,
            (child) => childrenLength += this._getInnerText(child, true).length
          );
          return childrenLength / textLength;
        },
        /**
         * Clean an element of all tags of type "tag" if they look fishy.
         * "Fishy" is an algorithm based on content length, classnames, link density, number of images & embeds, etc.
         *
         * @return void
         **/
        _cleanConditionally(e, tag) {
          if (!this._flagIsActive(this.FLAG_CLEAN_CONDITIONALLY)) {
            return;
          }
          this._removeNodes(this._getAllNodesWithTag(e, [tag]), function(node) {
            var isDataTable = function(t2) {
              return t2._readabilityDataTable;
            };
            var isList = tag === "ul" || tag === "ol";
            if (!isList) {
              var listLength = 0;
              var listNodes = this._getAllNodesWithTag(node, ["ul", "ol"]);
              this._forEachNode(
                listNodes,
                (list) => listLength += this._getInnerText(list).length
              );
              isList = listLength / this._getInnerText(node).length > 0.9;
            }
            if (tag === "table" && isDataTable(node)) {
              return false;
            }
            if (this._hasAncestorTag(node, "table", -1, isDataTable)) {
              return false;
            }
            if (this._hasAncestorTag(node, "code")) {
              return false;
            }
            if ([...node.getElementsByTagName("table")].some(
              (tbl) => tbl._readabilityDataTable
            )) {
              return false;
            }
            var weight = this._getClassWeight(node);
            this.log("Cleaning Conditionally", node);
            var contentScore = 0;
            if (weight + contentScore < 0) {
              return true;
            }
            if (this._getCharCount(node, ",") < 10) {
              var p = node.getElementsByTagName("p").length;
              var img = node.getElementsByTagName("img").length;
              var li = node.getElementsByTagName("li").length - 100;
              var input = node.getElementsByTagName("input").length;
              var headingDensity = this._getTextDensity(node, [
                "h1",
                "h2",
                "h3",
                "h4",
                "h5",
                "h6"
              ]);
              var embedCount = 0;
              var embeds = this._getAllNodesWithTag(node, [
                "object",
                "embed",
                "iframe"
              ]);
              for (var i = 0; i < embeds.length; i++) {
                for (var j = 0; j < embeds[i].attributes.length; j++) {
                  if (this._allowedVideoRegex.test(embeds[i].attributes[j].value)) {
                    return false;
                  }
                }
                if (embeds[i].tagName === "object" && this._allowedVideoRegex.test(embeds[i].innerHTML)) {
                  return false;
                }
                embedCount++;
              }
              var innerText = this._getInnerText(node);
              if (this.REGEXPS.adWords.test(innerText) || this.REGEXPS.loadingWords.test(innerText)) {
                return true;
              }
              var contentLength = innerText.length;
              var linkDensity = this._getLinkDensity(node);
              var textishTags = ["SPAN", "LI", "TD"].concat(
                Array.from(this.DIV_TO_P_ELEMS)
              );
              var textDensity = this._getTextDensity(node, textishTags);
              var isFigureChild = this._hasAncestorTag(node, "figure");
              const shouldRemoveNode = () => {
                const errs = [];
                if (!isFigureChild && img > 1 && p / img < 0.5) {
                  errs.push(`Bad p to img ratio (img=${img}, p=${p})`);
                }
                if (!isList && li > p) {
                  errs.push(`Too many li's outside of a list. (li=${li} > p=${p})`);
                }
                if (input > Math.floor(p / 3)) {
                  errs.push(`Too many inputs per p. (input=${input}, p=${p})`);
                }
                if (!isList && !isFigureChild && headingDensity < 0.9 && contentLength < 25 && (img === 0 || img > 2) && linkDensity > 0) {
                  errs.push(
                    `Suspiciously short. (headingDensity=${headingDensity}, img=${img}, linkDensity=${linkDensity})`
                  );
                }
                if (!isList && weight < 25 && linkDensity > 0.2 + this._linkDensityModifier) {
                  errs.push(
                    `Low weight and a little linky. (linkDensity=${linkDensity})`
                  );
                }
                if (weight >= 25 && linkDensity > 0.5 + this._linkDensityModifier) {
                  errs.push(
                    `High weight and mostly links. (linkDensity=${linkDensity})`
                  );
                }
                if (embedCount === 1 && contentLength < 75 || embedCount > 1) {
                  errs.push(
                    `Suspicious embed. (embedCount=${embedCount}, contentLength=${contentLength})`
                  );
                }
                if (img === 0 && textDensity === 0) {
                  errs.push(
                    `No useful content. (img=${img}, textDensity=${textDensity})`
                  );
                }
                if (errs.length) {
                  this.log("Checks failed", errs);
                  return true;
                }
                return false;
              };
              var haveToRemove = shouldRemoveNode();
              if (isList && haveToRemove) {
                for (var x = 0; x < node.children.length; x++) {
                  let child = node.children[x];
                  if (child.children.length > 1) {
                    return haveToRemove;
                  }
                }
                let li_count = node.getElementsByTagName("li").length;
                if (img == li_count) {
                  return false;
                }
              }
              return haveToRemove;
            }
            return false;
          });
        },
        /**
         * Clean out elements that match the specified conditions
         *
         * @param Element
         * @param Function determines whether a node should be removed
         * @return void
         **/
        _cleanMatchedNodes(e, filter) {
          var endOfSearchMarkerNode = this._getNextNode(e, true);
          var next = this._getNextNode(e);
          while (next && next != endOfSearchMarkerNode) {
            if (filter.call(this, next, next.className + " " + next.id)) {
              next = this._removeAndGetNext(next);
            } else {
              next = this._getNextNode(next);
            }
          }
        },
        /**
         * Clean out spurious headers from an Element.
         *
         * @param Element
         * @return void
         **/
        _cleanHeaders(e) {
          let headingNodes = this._getAllNodesWithTag(e, ["h1", "h2"]);
          this._removeNodes(headingNodes, function(node) {
            let shouldRemove = this._getClassWeight(node) < 0;
            if (shouldRemove) {
              this.log("Removing header with low class weight:", node);
            }
            return shouldRemove;
          });
        },
        /**
         * Check if this node is an H1 or H2 element whose content is mostly
         * the same as the article title.
         *
         * @param Element  the node to check.
         * @return boolean indicating whether this is a title-like header.
         */
        _headerDuplicatesTitle(node) {
          if (node.tagName != "H1" && node.tagName != "H2") {
            return false;
          }
          var heading = this._getInnerText(node, false);
          this.log("Evaluating similarity of header:", heading, this._articleTitle);
          return this._textSimilarity(this._articleTitle, heading) > 0.75;
        },
        _flagIsActive(flag) {
          return (this._flags & flag) > 0;
        },
        _removeFlag(flag) {
          this._flags = this._flags & ~flag;
        },
        _isProbablyVisible(node) {
          return (!node.style || node.style.display != "none") && (!node.style || node.style.visibility != "hidden") && !node.hasAttribute("hidden") && //check for "fallback-image" so that wikimedia math images are displayed
          (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true" || node.className && node.className.includes && node.className.includes("fallback-image"));
        },
        /**
         * Runs readability.
         *
         * Workflow:
         *  1. Prep the document by removing script tags, css, etc.
         *  2. Build readability's DOM tree.
         *  3. Grab the article content from the current dom tree.
         *  4. Replace the current DOM tree with the new one.
         *  5. Read peacefully.
         *
         * @return void
         **/
        parse() {
          if (this._maxElemsToParse > 0) {
            var numTags = this._doc.getElementsByTagName("*").length;
            if (numTags > this._maxElemsToParse) {
              throw new Error(
                "Aborting parsing document; " + numTags + " elements found"
              );
            }
          }
          this._unwrapNoscriptImages(this._doc);
          var jsonLd = this._disableJSONLD ? {} : this._getJSONLD(this._doc);
          this._removeScripts(this._doc);
          this._prepDocument();
          var metadata = this._getArticleMetadata(jsonLd);
          this._metadata = metadata;
          this._articleTitle = metadata.title;
          var articleContent = this._grabArticle();
          if (!articleContent) {
            return null;
          }
          this.log("Grabbed: " + articleContent.innerHTML);
          this._postProcessContent(articleContent);
          if (!metadata.excerpt) {
            var paragraphs2 = articleContent.getElementsByTagName("p");
            if (paragraphs2.length) {
              metadata.excerpt = paragraphs2[0].textContent.trim();
            }
          }
          var textContent = articleContent.textContent;
          return {
            title: this._articleTitle,
            byline: metadata.byline || this._articleByline,
            dir: this._articleDir,
            lang: this._articleLang,
            content: this._serializer(articleContent),
            textContent,
            length: textContent.length,
            excerpt: metadata.excerpt,
            siteName: metadata.siteName || this._articleSiteName,
            publishedTime: metadata.publishedTime
          };
        }
      };
      if (typeof module === "object") {
        module.exports = Readability2;
      }
    }
  });

  // node_modules/@mozilla/readability/Readability-readerable.js
  var require_Readability_readerable = __commonJS({
    "node_modules/@mozilla/readability/Readability-readerable.js"(exports, module) {
      var REGEXPS = {
        // NOTE: These two regular expressions are duplicated in
        // Readability.js. Please keep both copies in sync.
        unlikelyCandidates: /-ad-|ai2html|banner|breadcrumbs|combx|comment|community|cover-wrap|disqus|extra|footer|gdpr|header|legends|menu|related|remark|replies|rss|shoutbox|sidebar|skyscraper|social|sponsor|supplemental|ad-break|agegate|pagination|pager|popup|yom-remote/i,
        okMaybeItsACandidate: /and|article|body|column|content|main|shadow/i
      };
      function isNodeVisible(node) {
        return (!node.style || node.style.display != "none") && !node.hasAttribute("hidden") && //check for "fallback-image" so that wikimedia math images are displayed
        (!node.hasAttribute("aria-hidden") || node.getAttribute("aria-hidden") != "true" || node.className && node.className.includes && node.className.includes("fallback-image"));
      }
      function isProbablyReaderable(doc, options = {}) {
        if (typeof options == "function") {
          options = { visibilityChecker: options };
        }
        var defaultOptions = {
          minScore: 20,
          minContentLength: 140,
          visibilityChecker: isNodeVisible
        };
        options = Object.assign(defaultOptions, options);
        var nodes = doc.querySelectorAll("p, pre, article");
        var brNodes = doc.querySelectorAll("div > br");
        if (brNodes.length) {
          var set = new Set(nodes);
          [].forEach.call(brNodes, function(node) {
            set.add(node.parentNode);
          });
          nodes = Array.from(set);
        }
        var score = 0;
        return [].some.call(nodes, function(node) {
          if (!options.visibilityChecker(node)) {
            return false;
          }
          var matchString = node.className + " " + node.id;
          if (REGEXPS.unlikelyCandidates.test(matchString) && !REGEXPS.okMaybeItsACandidate.test(matchString)) {
            return false;
          }
          if (node.matches("li p")) {
            return false;
          }
          var textContentLength = node.textContent.trim().length;
          if (textContentLength < options.minContentLength) {
            return false;
          }
          score += Math.sqrt(textContentLength - options.minContentLength);
          if (score > options.minScore) {
            return true;
          }
          return false;
        });
      }
      if (typeof module === "object") {
        module.exports = isProbablyReaderable;
      }
    }
  });

  // node_modules/@mozilla/readability/index.js
  var require_readability = __commonJS({
    "node_modules/@mozilla/readability/index.js"(exports, module) {
      var Readability2 = require_Readability();
      var isProbablyReaderable = require_Readability_readerable();
      module.exports = {
        Readability: Readability2,
        isProbablyReaderable
      };
    }
  });

  // src/content.js
  var import_readability = __toESM(require_readability());

  // src/theme.js
  var probe = null;
  function parseColor(value) {
    if (!value || typeof value !== "string") return null;
    if (!probe) probe = document.createElement("canvas").getContext("2d");
    probe.fillStyle = "#010203";
    probe.fillStyle = value;
    var out = probe.fillStyle;
    if (out === "#010203" && value.trim().toLowerCase() !== "#010203") return null;
    if (out[0] === "#") {
      return [1, 3, 5].map(function(i) {
        return parseInt(out.slice(i, i + 2), 16);
      });
    }
    var m = out.match(/[\d.]+/g);
    return m ? m.slice(0, 3).map(Number) : null;
  }
  function toHex(rgb) {
    return "#" + rgb.map(function(v) {
      return Math.round(v).toString(16).padStart(2, "0");
    }).join("");
  }
  function mix(a, b, t2) {
    return a.map(function(v, i) {
      return v + (b[i] - v) * t2;
    });
  }
  function luminance(rgb) {
    var c = rgb.map(function(v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function contrast(a, b) {
    var la = luminance(a), lb = luminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function fitAccent(accent, background2) {
    var target = luminance(background2) > 0.4 ? [0, 0, 0] : [255, 255, 255];
    var out = accent;
    for (var t2 = 0.1; contrast(out, background2) < 3.2 && t2 <= 1; t2 += 0.1) out = mix(accent, target, t2);
    return out;
  }
  function themeTokens(theme2) {
    var c = theme2 && theme2.colors || {};
    var sheet = parseColor(c.popup || c.toolbar || c.frame);
    var ink = parseColor(c.popup_text || c.toolbar_text || c.tab_background_text);
    if (!sheet || !ink || contrast(sheet, ink) < 3) return null;
    var paper = parseColor(c.toolbar_field) || mix(sheet, ink, 0.05);
    if (contrast(paper, ink) < 3) paper = mix(sheet, ink, 0.05);
    var dark = luminance(sheet) < 0.3;
    return {
      dark,
      sheet,
      paper,
      ink,
      inkSoft: mix(ink, sheet, 0.35),
      rule: mix(ink, sheet, 0.8),
      accent: parseColor(c.tab_line || c.icons_attention || c.toolbar_field_border_focus)
    };
  }
  var TOKEN_VARS = ["--sheet", "--paper", "--ink", "--ink-soft", "--rule", "--hover", "--accent", "--mark"];
  function applyPanelColors(host, tokens, accentValue) {
    if (!host) return;
    TOKEN_VARS.forEach(function(v) {
      host.style.removeProperty(v);
    });
    if (tokens) {
      host.style.setProperty("--sheet", toHex(tokens.sheet));
      host.style.setProperty("--paper", toHex(tokens.paper));
      host.style.setProperty("--ink", toHex(tokens.ink));
      host.style.setProperty("--ink-soft", toHex(tokens.inkSoft));
      host.style.setProperty("--rule", toHex(tokens.rule));
      var i = tokens.ink;
      host.style.setProperty("--hover", "rgba(" + i[0] + "," + i[1] + "," + i[2] + ",0.07)");
    }
    var accent = parseColor(accentValue) || tokens && tokens.accent;
    if (!accent) return;
    var panel = host.shadowRoot && host.shadowRoot.getElementById("tts-zen-panel");
    var bg = tokens ? tokens.sheet : parseColor(panel ? getComputedStyle(panel).getPropertyValue("--sheet") : "") || [251, 248, 241];
    var fitted = fitAccent(accent, bg);
    host.style.setProperty("--accent", toHex(fitted));
    host.style.setProperty("--mark", "rgba(" + fitted.map(Math.round).join(",") + ",0.22)");
  }

  // src/highlight.js
  var SENTENCE = "zentts-sentence";
  var WORD = "zentts-word";
  var PICK = "zentts-pick";
  var INK = "#1b1916";
  var MARK = "#f6e7b0";
  var WORD_MARK = "#e3b04b";
  var supported = typeof CSS !== "undefined" && CSS.highlights && typeof Highlight !== "undefined";
  var theme = "page";
  function ensureStyles() {
    if (document.getElementById("zentts-highlight")) return;
    var style = document.createElement("style");
    style.id = "zentts-highlight";
    style.textContent = theme === "overlay" ? "::highlight(" + SENTENCE + ") { background-color: rgba(243, 214, 102, .38); }\n::highlight(" + WORD + ") { background-color: rgba(227, 160, 40, .55); }\n::highlight(" + PICK + ") { background-color: rgba(47, 93, 138, .22); }" : "::highlight(" + SENTENCE + ") { background-color: " + MARK + "; color: " + INK + "; }\n::highlight(" + WORD + ") { background-color: " + WORD_MARK + "; color: " + INK + "; }\n::highlight(" + PICK + ") { background-color: #dbe6f3; color: " + INK + "; text-decoration: underline dotted 2px #2f5d8a; }";
    (document.head || document.documentElement).appendChild(style);
  }
  function partsOf(el) {
    return el && el.__zenttsParts ? el.__zenttsParts : [el];
  }
  function containsNode(el, node) {
    return partsOf(el).some(function(p) {
      return p && p.contains(node);
    });
  }
  function boxOf(el) {
    var parts = partsOf(el);
    if (parts.length === 1 && getComputedStyle(parts[0]).display !== "contents") return parts[0].getBoundingClientRect();
    var box = null;
    parts.forEach(function(p) {
      var r = document.createRange();
      r.selectNodeContents(p);
      var b = r.getBoundingClientRect();
      if (!b.width && !b.height) return;
      box = box ? { left: Math.min(box.left, b.left), top: Math.min(box.top, b.top), right: Math.max(box.right, b.right), bottom: Math.max(box.bottom, b.bottom) } : { left: b.left, top: b.top, right: b.right, bottom: b.bottom };
    });
    box = box || { left: 0, top: 0, right: 0, bottom: 0 };
    box.width = box.right - box.left;
    box.height = box.bottom - box.top;
    return box;
  }
  function compactChars(ch) {
    if (/\s/.test(ch)) return "";
    if (ch === "\u2026") return "...";
    return ch;
  }
  function compact(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) out += compactChars(text[i]);
    return out;
  }
  var indexes = /* @__PURE__ */ new WeakMap();
  function indexOf(el) {
    var parts = partsOf(el);
    var raw = parts.map(function(p) {
      return p.textContent;
    }).join("\n");
    var cached = indexes.get(el);
    if (cached && cached.raw === raw) return cached;
    var text = "";
    var map = [];
    parts.forEach(function(part) {
      var walker = document.createTreeWalker(part, NodeFilter.SHOW_TEXT, {
        acceptNode: function(n) {
          var p = n.parentNode && n.parentNode.nodeName;
          return p === "SCRIPT" || p === "STYLE" ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
        }
      });
      for (var node = walker.nextNode(); node; node = walker.nextNode()) {
        var data = node.data;
        for (var i = 0; i < data.length; i++) {
          var c = compactChars(data[i]);
          for (var k = 0; k < c.length; k++) {
            text += c[k];
            map.push({ node, offset: i });
          }
        }
      }
    });
    var idx = { raw, text, map };
    indexes.set(el, idx);
    return idx;
  }
  function rangeFromCompact(idx, start, end) {
    if (start < 0 || end > idx.map.length || start >= end) return null;
    var a = idx.map[start];
    var b = idx.map[end - 1];
    var r = document.createRange();
    r.setStart(a.node, a.offset);
    r.setEnd(b.node, b.offset + 1);
    return r;
  }
  function find(idx, needle, hint) {
    if (!needle) return -1;
    var at = idx.text.indexOf(needle, Math.max(0, (hint || 0) - 8));
    if (at === -1) at = idx.text.indexOf(needle);
    return at;
  }
  var current = null;
  var fallbackEl = null;
  var fallbackStyle = null;
  function clearFallback() {
    if (!fallbackEl) return;
    fallbackEl.style.background = fallbackStyle.background;
    fallbackEl.style.boxShadow = fallbackStyle.boxShadow;
    fallbackEl.style.color = fallbackStyle.color;
    fallbackEl = null;
  }
  function markParagraph(el) {
    if (el === fallbackEl) return;
    clearFallback();
    if (!el || !el.isConnected) return;
    if (supported && (el.__zenttsParts || getComputedStyle(el).display === "contents")) {
      ensureStyles();
      var whole = new Highlight();
      partsOf(el).forEach(function(p) {
        var r = document.createRange();
        r.selectNodeContents(p);
        whole.add(r);
      });
      CSS.highlights.set(SENTENCE, whole);
      return;
    }
    fallbackStyle = { background: el.style.background, boxShadow: el.style.boxShadow, color: el.style.color };
    el.style.background = MARK;
    el.style.boxShadow = "-6px 0 0 " + MARK + ", 6px 0 0 " + MARK;
    el.style.color = INK;
    fallbackEl = el;
  }
  function scrollIfNeeded(target) {
    var rect = target.startContainer ? target.getBoundingClientRect() : boxOf(target);
    var margin = Math.min(120, window.innerHeight * 0.15);
    if (rect.top >= margin && rect.bottom <= window.innerHeight - margin) return;
    var el = target.startContainer ? target.startContainer.parentElement : partsOf(target)[0];
    if (el && getComputedStyle(el).display === "contents") el = el.firstElementChild;
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function clear() {
    if (supported) {
      CSS.highlights.delete(SENTENCE);
      CSS.highlights.delete(WORD);
    }
    clearFallback();
    current = null;
  }
  function showSentence(el, sentence, words, hint) {
    if (supported) CSS.highlights.delete(WORD);
    if (!el || !el.isConnected) {
      clear();
      return;
    }
    if (supported) {
      ensureStyles();
      var idx = indexOf(el);
      var needle = compact(sentence);
      var at = find(idx, needle, hint);
      var range = at >= 0 ? rangeFromCompact(idx, at, at + needle.length) : null;
      if (range) {
        clearFallback();
        var wordRanges = [];
        var pos = at;
        (words || []).forEach(function(w) {
          var wn = compact(w.text);
          var wAt = wn ? idx.text.indexOf(wn, pos) : -1;
          if (wAt >= 0 && wAt < at + needle.length) {
            wordRanges.push(rangeFromCompact(idx, wAt, wAt + wn.length));
            pos = wAt + wn.length;
          } else {
            wordRanges.push(null);
          }
        });
        CSS.highlights.set(SENTENCE, new Highlight(range));
        current = { el, range, words: wordRanges };
        scrollIfNeeded(range);
        return;
      }
    }
    if (supported) CSS.highlights.delete(SENTENCE);
    current = { el, range: null, words: [] };
    markParagraph(el);
    scrollIfNeeded(el);
  }
  function showWord(i) {
    if (!supported || !current || !current.range) return;
    var r = current.words[i];
    if (r) CSS.highlights.set(WORD, new Highlight(r));
    else CSS.highlights.delete(WORD);
  }
  function caretAt(x, y) {
    if (document.caretPositionFromPoint) {
      var p = document.caretPositionFromPoint(x, y);
      return p ? { node: p.offsetNode, offset: p.offset } : null;
    }
    if (document.caretRangeFromPoint) {
      var r = document.caretRangeFromPoint(x, y);
      return r ? { node: r.startContainer, offset: r.startOffset } : null;
    }
    return null;
  }
  function sentenceAtPoint(x, y, paragraphs2, sentences2) {
    var caret = caretAt(x, y);
    if (!caret || !caret.node) return -1;
    var p = -1;
    for (var i = 0; i < paragraphs2.length; i++) {
      if (paragraphs2[i].el && containsNode(paragraphs2[i].el, caret.node)) {
        p = i;
        break;
      }
    }
    if (p < 0) return -1;
    var idx = indexOf(paragraphs2[p].el);
    var pos = 0;
    for (var k = 0; k < idx.map.length; k++) {
      var m = idx.map[k];
      if (m.node === caret.node && m.offset >= caret.offset) {
        pos = k;
        break;
      }
      pos = k;
    }
    var first = -1, found = -1;
    for (var j = 0; j < sentences2.length; j++) {
      var s = sentences2[j];
      if (s.refIdx !== p) continue;
      if (first < 0) first = j;
      if (s.hint <= pos) found = j;
    }
    return found >= 0 ? found : first;
  }
  function showPick(el, sentence, hint) {
    if (!supported || !el) return;
    ensureStyles();
    var idx = indexOf(el);
    var needle = compact(sentence);
    var at = find(idx, needle, hint);
    var range = at >= 0 ? rangeFromCompact(idx, at, at + needle.length) : null;
    if (!range) {
      range = document.createRange();
      range.selectNodeContents(partsOf(el)[0]);
    }
    CSS.highlights.set(PICK, new Highlight(range));
  }
  function clearPick() {
    if (supported) CSS.highlights.delete(PICK);
  }
  var caption = null;
  var suppressed = false;
  var CAPTION_CSS = ":host { all: initial; }\n.cap { box-sizing: border-box; max-width: 680px; padding: 8px 12px; border-radius: 6px; background: #fbf8f1; color: " + INK + '; border: 1px solid #ddd4c3; border-left: 3px solid #9a3b25; box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 8px 22px rgba(0,0,0,.14); font: 15px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; transition: opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1); }\n.cap.enter { opacity: 0; transform: translateY(-4px); }\n.w { border-radius: 2px; transition: background-color .12s ease; }\n.w.on { background: ' + WORD_MARK + "; }\n@media (prefers-color-scheme: dark) { .cap { background: #23201c; color: #e9e2d4; border-color: #3a352e; border-left-color: #d9785c; } .w.on { color: " + INK + "; } }\n@media (prefers-reduced-motion: reduce) { .cap, .w { transition: none; } }";
  function captionHost() {
    if (caption && caption.host.isConnected) return caption;
    var host = document.createElement("div");
    host.id = "zentts-caption";
    host.style.cssText = "position:fixed;top:0;left:0;z-index:999998;pointer-events:none;display:none;";
    var root = host.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.textContent = CAPTION_CSS;
    var box = document.createElement("div");
    box.className = "cap";
    root.append(style, box);
    document.documentElement.appendChild(host);
    caption = { host, box, text: null, words: [], el: null, raf: 0, ro: null };
    document.addEventListener("scroll", schedulePlace, { passive: true, capture: true });
    window.addEventListener("resize", schedulePlace, { passive: true });
    if (window.visualViewport) window.visualViewport.addEventListener("resize", schedulePlace, { passive: true });
    if (typeof ResizeObserver !== "undefined") caption.ro = new ResizeObserver(schedulePlace);
    return caption;
  }
  function schedulePlace() {
    if (!caption || caption.raf || caption.host.style.display === "none") return;
    caption.raf = requestAnimationFrame(function() {
      caption.raf = 0;
      placeCaption();
    });
  }
  function placeCaption() {
    if (!caption || !caption.el || caption.host.style.display === "none") return;
    if (!caption.el.isConnected) {
      hideCaption();
      return;
    }
    var r = boxOf(caption.el);
    var vw = window.innerWidth, vh = window.innerHeight, m = 8;
    var away = r.bottom < 0 || r.top > vh || !r.width && !r.height;
    caption.host.style.visibility = suppressed || away ? "hidden" : "";
    if (away) return;
    var width = Math.min(Math.max(r.width, 260), 680, vw - 2 * m);
    var left = Math.max(m, Math.min(r.left, vw - width - m));
    caption.host.style.width = width + "px";
    var h = caption.box.offsetHeight;
    var top;
    if (r.bottom + m + h <= vh - m) top = r.bottom + m;
    else if (r.top - m - h >= m) top = r.top - m - h;
    else top = Math.max(m, vh - h - m);
    caption.host.style.transform = "translate(" + Math.round(left) + "px," + Math.round(top) + "px)";
  }
  function showCaption(el, text, words) {
    if (!el || !el.isConnected) {
      hideCaption();
      return;
    }
    var c = captionHost();
    if (c.el !== el && c.ro) {
      c.ro.disconnect();
      partsOf(el).forEach(function(p) {
        if (getComputedStyle(p).display !== "contents") c.ro.observe(p);
      });
      c.ro.observe(document.documentElement);
    }
    c.el = el;
    c.host.style.display = "block";
    if (c.text !== text) {
      c.text = text;
      c.box.replaceChildren();
      c.words = [];
      var last = 0;
      (words || []).forEach(function(w) {
        if (w.start > last) c.box.appendChild(document.createTextNode(text.slice(last, w.start)));
        var span = document.createElement("span");
        span.className = "w";
        span.textContent = w.text;
        c.box.appendChild(span);
        c.words.push(span);
        last = w.start + w.text.length;
      });
      if (last < text.length) c.box.appendChild(document.createTextNode(text.slice(last)));
      c.box.classList.add("enter");
      void c.box.offsetWidth;
      c.box.classList.remove("enter");
    }
    placeCaption();
  }
  function showCaptionWord(i) {
    if (!caption || caption.host.style.display === "none") return;
    caption.words.forEach(function(span, k) {
      span.classList.toggle("on", k === i);
    });
  }
  function hideCaption() {
    if (!caption) return;
    if (caption.ro) caption.ro.disconnect();
    caption.host.style.display = "none";
    caption.text = null;
    caption.el = null;
  }
  function suppressCaption(on) {
    suppressed = !!on;
    if (caption) {
      caption.host.style.visibility = suppressed ? "hidden" : "";
      placeCaption();
    }
  }

  // src/panel.js
  var ACCENT_PRESETS = ["#9a3b25", "#2f5d8a", "#3f7a4a", "#7a3b6e", "#b07a1c"];
  var PANEL_HTML = `
<div id="tts-zen-panel" data-corner="br">
  <div id="tts-zen-header">
    <div id="tts-zen-header-left">
      <span id="tts-zen-logo">zen<em>TTS</em></span>
    </div>
    <div id="tts-zen-header-right">
      <button id="tts-zen-preview-btn" title="Ver texto extra\xEDdo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
      <button id="tts-zen-sites-btn" title="Sitios compatibles">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </button>
      <button id="tts-zen-settings-btn" title="Ajustes">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
      <button id="tts-zen-minimize" title="Minimizar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="7" y1="7" x2="17" y2="17"></line>
          <polyline points="17 9 17 17 9 17"></polyline>
        </svg>
      </button>
    </div>
  </div>

  <div id="tts-zen-body">
    <div id="tts-zen-settings" class="collapsed">
     <div class="settings-inner">
      <div class="tabs" role="tablist" id="tts-zen-tabs">
        <button type="button" role="tab" data-tab="voice" id="tts-zen-tab-voice">Voz</button>
        <button type="button" role="tab" data-tab="read" id="tts-zen-tab-read">Lectura</button>
        <button type="button" role="tab" data-tab="tr" id="tts-zen-tab-tr">Traducir</button>
        <button type="button" role="tab" data-tab="look" id="tts-zen-tab-look">Aspecto</button>
        <i class="tab-ink"></i>
      </div>
      <div class="tab-pages">
       <section class="tab-page" data-page="voice" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-engine-label">Motor</label>
          <div class="select-wrap">
            <select id="tts-zen-engine">
              <option value="native">Nativo (Browser)</option>
              <option value="server">Neural (edge-tts)</option>
              <option value="local">Local (Piper)</option>
            </select>
          </div>
        </div>
        <div class="setting-row">
          <label id="tts-zen-voice-label">Voz</label>
          <div class="select-wrap">
            <select id="tts-zen-voice"></select>
          </div>
        </div>
        <div class="setting-row" id="tts-zen-voice-info-row" hidden>
          <label></label>
          <div class="hint-text" id="tts-zen-voice-info"></div>
        </div>
        <div class="setting-row" id="tts-zen-slow-hint" hidden>
          <label></label>
          <div class="hint-text warn" id="tts-zen-slow-text"></div>
        </div>
        <div class="setting-row" id="tts-zen-voice-hint" hidden>
          <label></label>
          <div class="hint-text"><span id="tts-zen-voice-hint-text">Las voces del sistema suenan rob\xF3ticas.</span>
            <button type="button" class="link-btn" id="tts-zen-try-local">Probar voz Local</button></div>
        </div>
        <div class="setting-row" id="tts-zen-local-row" hidden>
          <label></label>
          <button id="tts-zen-local-dl" type="button" class="fill-btn"><span class="fill-label"></span><span class="water" aria-hidden="true"><span class="fill-label"></span></span><i class="wave" aria-hidden="true"></i></button>
        </div>
        <div class="setting-row" id="tts-zen-neural-hint" hidden>
          <label></label>
          <div class="hint-text"><span id="tts-zen-neural-hint-text">\xBFA\xFAn m\xE1s natural? El motor Neural usa voces de Microsoft.</span>
            <button type="button" class="link-btn" id="tts-zen-try-neural">Usar Neural</button></div>
        </div>
        <div class="setting-row">
          <label id="tts-zen-speed-text">Velocidad</label>
          <div class="speed-group">
            <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
            <span id="tts-zen-speed-label">1.0x</span>
          </div>
        </div>
       </section>
       <section class="tab-page" data-page="read" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-readlang-label">Leer en</label>
          <div class="select-wrap">
            <select id="tts-zen-readlang">
              <option value="auto">Auto</option>
              <option value="original">Idioma original</option>
              <option value="es">Espa\xF1ol</option>
              <option value="en">English</option>
              <option value="fr">Fran\xE7ais</option>
              <option value="de">Deutsch</option>
              <option value="it">Italiano</option>
              <option value="pt">Portugu\xEAs</option>
              <option value="ja">\u65E5\u672C\u8A9E</option>
              <option value="ko">\uD55C\uAD6D\uC5B4</option>
              <option value="zh">\u4E2D\u6587</option>
              <option value="ru">\u0420\u0443\u0441\u0441\u043A\u0438\u0439</option>
            </select>
          </div>
        </div>
        <div class="setting-row" id="tts-zen-detected-row" hidden>
          <label></label>
          <div class="hint-text" id="tts-zen-detected"></div>
        </div>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-autonext">
          <span id="tts-zen-autonext-label">Seguir con el siguiente cap\xEDtulo</span>
        </label>
        <label class="check-row" id="tts-zen-autoopen-row">
          <input type="checkbox" id="tts-zen-autoopen">
          <span id="tts-zen-autoopen-label">Abrir siempre en este sitio</span>
        </label>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-inline-tr">
          <span id="tts-zen-inline-tr-label">Mostrar la traducci\xF3n junto al texto</span>
        </label>
        <div class="setting-row">
          <button type="button" class="link-btn" id="tts-zen-open-library">Abrir la biblioteca</button>
        </div>
       </section>
       <section class="tab-page" data-page="tr" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-trmode-label">Traducir con</label>
          <div class="select-wrap">
            <select id="tts-zen-trmode">
              <option value="ask">Preguntar</option>
              <option value="offline">Paquete sin conexi\xF3n</option>
              <option value="online">En l\xEDnea</option>
              <option value="never">No traducir</option>
            </select>
          </div>
        </div>
        <div id="tts-zen-trchoices" class="packs"></div>
        <div class="setting-row section-header">
          <span id="tts-zen-packs-title">Paquetes de traducci\xF3n</span>
        </div>
        <div id="tts-zen-packs" class="packs"></div>
       </section>
       <section class="tab-page" data-page="look" role="tabpanel">
        <div class="setting-row">
          <label id="tts-zen-lang-label">Interfaz</label>
          <div class="select-wrap">
            <select id="tts-zen-lang">
              <option value="es">Espa\xF1ol</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-follow-theme">
          <span id="tts-zen-follow-label">Usar los colores del tema del navegador</span>
        </label>
        <label class="check-row">
          <input type="checkbox" id="tts-zen-word-hl">
          <span id="tts-zen-word-hl-label">Resaltar la palabra que suena</span>
        </label>
        <div class="setting-row">
          <label id="tts-zen-accent-label">Acento</label>
          <div class="accent-group" id="tts-zen-accent-group">
            <button type="button" class="swatch swatch-auto" data-accent="" title="Auto">A</button>
            ${ACCENT_PRESETS.map(function(c) {
    return '<button type="button" class="swatch" data-accent="' + c + '" style="--c:' + c + '" title="' + c + '"></button>';
  }).join("")}
            <span class="swatch swatch-custom" id="tts-zen-accent-custom" title="Otro color">+<input type="color" id="tts-zen-accent-picker"></span>
          </div>
        </div>
        <div class="setting-row">
          <label></label>
          <input type="text" id="tts-zen-accent-hex" placeholder="Pegar color de Zen" spellcheck="false" autocomplete="off">
        </div>
        <div class="accent-hint" id="tts-zen-accent-hint" title="about:config \u2192 zen.theme.accent-color">zen.theme.accent-color</div>
       </section>
      </div>
     </div>
    </div>

    <div id="tts-zen-counter">\u2014</div>

    <div id="tts-zen-nav">
      <button id="tts-zen-prev" disabled title="Anterior">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button id="tts-zen-next" disabled title="Siguiente">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <div id="tts-zen-translate-bar" hidden>
     <div class="tb-inner">
      <div id="tts-zen-translate-msg"></div>
      <div class="tb-actions">
        <button type="button" id="tts-zen-tr-download" class="fill-btn tb-main"><span class="fill-label"></span><span class="water" aria-hidden="true"><span class="fill-label"></span></span><i class="wave" aria-hidden="true"></i></button>
        <button type="button" id="tts-zen-tr-online" hidden></button>
        <button type="button" id="tts-zen-tr-original"></button>
      </div>
     </div>
    </div>

    <div id="tts-zen-controls">
      <button id="tts-zen-read" class="primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
        <span id="tts-zen-read-label">Leer</span>
      </button>
      <button id="tts-zen-pause" disabled>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="6" y="4" width="4" height="16"></rect>
          <rect x="14" y="4" width="4" height="16"></rect>
        </svg>
      </button>
      <button id="tts-zen-stop" disabled>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <rect x="4" y="4" width="16" height="16" rx="2"></rect>
        </svg>
      </button>
      <button id="tts-zen-pick" title="Elegir d\xF3nde empezar" aria-pressed="false">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="7"></circle>
          <circle cx="12" cy="12" r="1.5" fill="currentColor"></circle>
          <line x1="12" y1="1.5" x2="12" y2="5"></line><line x1="12" y1="19" x2="12" y2="22.5"></line>
          <line x1="1.5" y1="12" x2="5" y2="12"></line><line x1="19" y1="12" x2="22.5" y2="12"></line>
        </svg>
      </button>
    </div>

    <div id="tts-zen-resume-row" hidden>
      <button id="tts-zen-restart" type="button">Desde el inicio</button>
    </div>

    <div id="tts-zen-status">Listo</div>
  </div>
</div>

<div id="tts-zen-tip" role="tooltip" hidden></div>
<div id="tts-zen-bubble-ghost" data-corner="br" aria-hidden="true"></div>
<div id="tts-zen-collapsed" class="hidden" data-corner="br" role="button" tabindex="0" title="zenTTS">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
  </svg>
</div>

<div id="tts-zen-preview-overlay" class="hidden">
  <div id="tts-zen-preview-modal">
    <div id="tts-zen-preview-header">
      <span>Texto extra\xEDdo</span>
      <div id="tts-zen-preview-tools">
        <button class="preview-tool active" data-font="serif" title="Serif">Serif</button>
        <button class="preview-tool" data-font="sans" title="Sans">Sans</button>
        <button class="preview-tool" data-font="mono" title="Mono">Mono</button>
        <span class="tool-sep"></span>
        <button class="preview-tool" data-size="down" title="Reducir">A-</button>
        <button class="preview-tool" data-size="up" title="Aumentar">A+</button>
        <span class="tool-sep"></span>
        <button class="preview-tool" data-spacing="down" title="Menos espacio">-</button>
        <button class="preview-tool" data-spacing="up" title="M\xE1s espacio">+</button>
      </div>
      <button id="tts-zen-preview-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="tts-zen-preview-content"></div>
  </div>
</div>

<div id="tts-zen-sites-overlay" class="hidden">
  <div id="tts-zen-sites-modal">
    <div id="tts-zen-sites-header">
      <span>Sitios compatibles</span>
      <button id="tts-zen-sites-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="tts-zen-sites-list"></div>
  </div>
</div>
`;
  var PANEL_CSS = `
:host {
  all: initial;
  --paper: #f6f1e7;
  --sheet: #fbf8f1;
  --ink: #2a2622;
  --ink-soft: #6d655a;
  --rule: #ddd4c3;
  --hover: rgba(42,38,34,0.06);
  --accent: #9a3b25;
  --mark: #f3e19a;
  --shadow: 0 1px 2px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.10);
  --serif: "Iowan Old Style", "Charter", "Source Serif 4", "Source Serif Pro", Georgia, "Times New Roman", serif;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, "Helvetica Neue", sans-serif;
  --mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}
@media (prefers-color-scheme: dark) {
  :host {
    --paper: #1b1916;
    --sheet: #23201c;
    --ink: #e9e2d4;
    --ink-soft: #a39a8b;
    --rule: #3a352e;
    --hover: rgba(233,226,212,0.07);
    --accent: #d9785c;
    --mark: rgba(217,120,92,0.24);
    --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.35);
  }
}

button { font-family: var(--sans); }
button:focus-visible, select:focus-visible, input:focus-visible {
  outline: 2px solid var(--accent); outline-offset: 1px;
}

#tts-zen-panel {
  position: fixed; z-index: 999999;
  width: 280px; max-height: calc(100vh - 48px); display: flex; flex-direction: column;
  background: var(--sheet);
  border: 1px solid var(--rule); border-radius: 6px;
  color: var(--ink);
  font-family: var(--sans); font-size: 13px; line-height: 1.4;
  box-shadow: var(--shadow);
  user-select: none; overflow: hidden;
}
/* Anchored to one corner; the bubble can be dragged to any of the four */
[data-corner="br"] { bottom: 24px; right: 24px; transform-origin: bottom right; }
[data-corner="bl"] { bottom: 24px; left: 24px; transform-origin: bottom left; }
[data-corner="tr"] { top: 24px; right: 24px; transform-origin: top right; }
[data-corner="tl"] { top: 24px; left: 24px; transform-origin: top left; }

#tts-zen-panel {
  transition: transform .24s cubic-bezier(.2,.8,.2,1), opacity .18s ease, visibility 0s;
}
#tts-zen-panel.collapsed {
  transform: scale(.35); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform .2s cubic-bezier(.4,0,.6,1), opacity .16s ease, visibility 0s .2s;
}
#tts-zen-body { overflow-y: auto; min-height: 0; display: flex; flex-direction: column; }

/* The panel turns towards its corner: in a bottom corner the header (and the
   settings it opens) sit at the bottom; in a left corner the header buttons
   are mirrored, so "minimize" is always the button nearest the corner. */
#tts-zen-panel[data-corner^="b"] { flex-direction: column-reverse; }
#tts-zen-panel[data-corner^="b"] #tts-zen-header { border-bottom: none; border-top: 1px solid var(--rule); }
#tts-zen-panel[data-corner^="b"] #tts-zen-settings { order: 99; border-bottom: none; border-top: 1px solid var(--rule); }
#tts-zen-panel[data-corner^="b"] #tts-zen-settings.collapsed { border-top-color: transparent; }
#tts-zen-panel[data-corner$="l"] #tts-zen-header,
#tts-zen-panel[data-corner$="l"] #tts-zen-header-right { flex-direction: row-reverse; }
#tts-zen-panel[data-corner$="l"] #tts-zen-header { padding: 8px 14px 8px 8px; }
#tts-zen-minimize svg { transition: transform .3s cubic-bezier(.2,.8,.2,1); }
#tts-zen-panel[data-corner="bl"] #tts-zen-minimize svg { transform: rotate(90deg); }
#tts-zen-panel[data-corner="tl"] #tts-zen-minimize svg { transform: rotate(180deg); }
#tts-zen-panel[data-corner="tr"] #tts-zen-minimize svg { transform: rotate(270deg); }

button { transition: transform .08s ease, background-color .15s ease, color .15s ease, opacity .15s ease; }
button:active:not(:disabled) { transform: scale(.96); }

#tts-zen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 8px 8px 14px;
  border-bottom: 1px solid var(--rule);
}
#tts-zen-header-left, #tts-zen-header-right { display: flex; align-items: center; gap: 2px; }

#tts-zen-logo {
  font-family: var(--serif); font-size: 16px; font-weight: 600;
  color: var(--ink); letter-spacing: -0.01em;
}
#tts-zen-logo em { font-style: italic; font-weight: 400; color: var(--accent); }

#tts-zen-header-right button {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0;
  background: transparent; border: none; border-radius: 4px;
  color: var(--ink-soft); cursor: pointer;
}
#tts-zen-header-right button:hover { background: var(--hover); color: var(--ink); }

/* Real-height expand: the grid row goes from 0fr to 1fr */
#tts-zen-settings {
  display: grid; grid-template-rows: 1fr;
  border-bottom: 1px solid var(--rule);
  transition: grid-template-rows .26s cubic-bezier(.2,.8,.2,1), border-color .26s ease;
}
#tts-zen-settings.collapsed { grid-template-rows: 0fr; border-bottom-color: transparent; }
.settings-inner {
  min-height: 0; overflow: hidden;
  padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 10px;
  transition: padding .26s cubic-bezier(.2,.8,.2,1), opacity .2s ease;
}
#tts-zen-settings.collapsed .settings-inner { padding-top: 0; padding-bottom: 0; opacity: 0; }

/* Settings tabs: a segmented control with a sliding marker */
.tabs {
  position: relative; display: grid; grid-template-columns: repeat(4, 1fr);
  padding: 2px; border-radius: 6px; background: var(--paper); border: 1px solid var(--rule);
}
.tabs button {
  position: relative; z-index: 1; min-width: 0; padding: 4px 2px; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft); font: 11.5px var(--sans); cursor: pointer;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.tabs button:hover { color: var(--ink); }
.tabs button[aria-selected="true"] { color: var(--ink); font-weight: 600; }
.tab-ink {
  position: absolute; top: 2px; bottom: 2px; left: 2px; width: calc((100% - 4px) / 4);
  border-radius: 4px; background: var(--sheet); box-shadow: 0 1px 2px rgba(0,0,0,.12);
  transform: translateX(calc(var(--tab, 0) * 100%));
  transition: transform .28s cubic-bezier(.2,.8,.2,1);
}
/* All pages share one grid cell; the area's height follows the active page
   with a transition, so short tabs leave no gap and switching never jumps */
.tab-pages { display: grid; overflow: hidden; transition: height .26s cubic-bezier(.2,.8,.2,1); }
.tab-page {
  grid-area: 1 / 1; align-self: start; min-width: 0; display: flex; flex-direction: column; gap: 8px;
  transition: opacity .2s ease, transform .24s cubic-bezier(.2,.8,.2,1), visibility 0s;
}
.tab-page:not(.active) { opacity: 0; visibility: hidden; pointer-events: none; transform: translateX(var(--from, 12px)); transition: opacity .12s ease, transform .2s ease, visibility 0s .2s; }

.setting-row { display: flex; align-items: center; gap: 10px; min-width: 0; }
.setting-row label { flex-shrink: 0; min-width: 64px; max-width: 40%; font-size: 12px; color: var(--ink-soft); }

.select-wrap { flex: 1; min-width: 0; }
.select-wrap select, .translate-row select {
  width: 100%; padding: 5px 22px 5px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background-color: var(--paper);
  color: var(--ink); font: 12px var(--sans); cursor: pointer;
  appearance: none; text-overflow: ellipsis; white-space: nowrap; overflow: hidden;
  background-image: url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 9 5' fill='none'%3E%3Cpath d='M1 1l3.5 3L8 1' stroke='%238a8175' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 7px center;
}
.select-wrap select:hover, .translate-row select:hover { border-color: var(--ink-soft); }

.section-header {
  margin-top: 4px; font-size: 12px; color: var(--ink-soft);
  font-variant: small-caps; letter-spacing: 0.04em;
}
.translate-row { display: flex; align-items: center; gap: 6px; }
.translate-row select { flex: 1; width: auto; text-align-last: center; }
.translate-arrow { display: flex; align-items: center; color: var(--ink-soft); flex-shrink: 0; }

.speed-group { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
/* min-width: 0 \u2014 Firefox gives range inputs a large intrinsic width */
.speed-group input[type="range"] { flex: 1; min-width: 0; width: 100%; margin: 0; accent-color: var(--ink); cursor: pointer; }
#tts-zen-speed-label {
  flex-shrink: 0; min-width: 4.5ch; text-align: right;
  font-size: 12px; color: var(--ink); font-variant-numeric: tabular-nums;
}

#tts-zen-counter {
  text-align: center; padding: 12px 14px 6px;
  font-family: var(--serif); font-style: italic; font-size: 14px;
  color: var(--ink-soft); font-variant-numeric: tabular-nums oldstyle-nums;
}

#tts-zen-nav { display: flex; justify-content: center; gap: 4px; padding: 0 14px 8px; }
#tts-zen-nav button {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 28px; padding: 0;
  background: transparent; border: none; border-radius: 4px;
  color: var(--ink-soft); cursor: pointer;
}
#tts-zen-nav button:hover:not(:disabled) { background: var(--hover); color: var(--ink); }
#tts-zen-nav button:disabled { opacity: 0.35; cursor: default; }

#tts-zen-controls { display: flex; gap: 6px; padding: 0 14px 10px; }
#tts-zen-controls button {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 38px; height: 32px; padding: 0;
  border: 1px solid var(--rule); border-radius: 4px;
  background: transparent; color: var(--ink);
  font-size: 13px; cursor: pointer;
}
#tts-zen-controls button:hover:not(:disabled) { background: var(--hover); }
#tts-zen-controls button:disabled { opacity: 0.35; cursor: default; }
#tts-zen-controls button.primary {
  flex: 1; width: auto;
  background: var(--ink); border-color: var(--ink); color: var(--sheet); font-weight: 600;
}
#tts-zen-controls button.primary:hover:not(:disabled) { background: var(--ink); opacity: 0.88; }

/* Download buttons fill up like water while downloading: the "water" layer is
   a copy of the label in inverted colors, clipped to the progress, with a
   rippling edge. */
.fill-btn {
  position: relative; overflow: hidden; flex: 1; min-width: 0;
  padding: 5px 10px; border-radius: 4px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: 12px var(--sans); cursor: pointer;
  text-align: center; white-space: nowrap; --p: 0%;
  transition: opacity .25s ease, transform .08s ease, background-color .15s ease;
}
.fill-btn:hover:not(:disabled) { background: var(--hover); }
.fill-btn .fill-label { display: block; overflow: hidden; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.fill-btn .water {
  position: absolute; inset: 0; padding: inherit; display: flex; align-items: center; justify-content: center;
  background: var(--ink); color: var(--sheet);
  clip-path: inset(0 calc(100% - var(--p)) 0 0);
  transition: clip-path .3s ease;
}
.fill-btn .water .fill-label { width: 100%; }
.fill-btn .wave {
  position: absolute; top: 0; bottom: 0; left: calc(var(--p) - 1px); width: 7px; display: none;
  background: var(--ink);
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='12'%3E%3Cpath d='M0 0 Q7 3 0 6 Q7 9 0 12Z'/%3E%3C/svg%3E") 0 0 / 7px 12px repeat-y;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='12'%3E%3Cpath d='M0 0 Q7 3 0 6 Q7 9 0 12Z'/%3E%3C/svg%3E") 0 0 / 7px 12px repeat-y;
  animation: ripple .9s linear infinite;
  transition: left .3s ease;
}
.fill-btn.filling { cursor: progress; }
.fill-btn.filling .wave { display: block; }
.fill-btn.filling:hover { background: transparent; }
.fill-btn.done { opacity: 0; }
@keyframes ripple { to { -webkit-mask-position: 0 12px; mask-position: 0 12px; } }
.check-row { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; line-height: 1.35; color: var(--ink-soft); cursor: pointer; }
.check-row input { accent-color: var(--ink); margin: 1px 0 0; flex-shrink: 0; }

.hint-text.warn { color: var(--accent); }
#tts-zen-tip {
  position: fixed; z-index: 10000000; max-width: 240px; padding: 5px 8px; border-radius: 4px;
  background: var(--ink); color: var(--sheet); font: 12px/1.35 var(--sans);
  box-shadow: 0 4px 14px rgba(0,0,0,.18); pointer-events: none;
  animation: tip-in .14s ease;
}
@keyframes tip-in { from { opacity: 0; transform: translateY(2px); } to { opacity: 1; transform: none; } }
.hint-text { flex: 1; min-width: 0; font-size: 12px; line-height: 1.35; color: var(--ink-soft); }
.link-btn {
  background: none; border: none; padding: 0; cursor: pointer; font: inherit;
  color: var(--accent); text-decoration: underline; text-underline-offset: 3px;
}

/* Translation offer */
#tts-zen-translate-bar {
  display: grid; grid-template-rows: 1fr; margin: 4px 14px 12px;
  animation: bar-in .24s cubic-bezier(.2,.8,.2,1);
  transition: grid-template-rows .28s cubic-bezier(.4,0,.2,1), margin .28s cubic-bezier(.4,0,.2,1), opacity .2s ease;
}
#tts-zen-translate-bar.closing { grid-template-rows: 0fr; margin-top: 0; margin-bottom: 0; opacity: 0; }
.tb-inner {
  min-height: 0; overflow: hidden; padding: 10px 12px; border-radius: 6px;
  background: var(--paper); border: 1px solid var(--rule);
  font-size: 12px; line-height: 1.4; color: var(--ink);
}
#tts-zen-translate-bar.closing .tb-inner { padding-top: 0; padding-bottom: 0; border-width: 0; transition: padding .28s ease; }
@keyframes bar-in { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.tb-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.tb-actions .fill-btn { flex: 1 1 100%; font-weight: 600; }
.tb-actions button:not(.fill-btn) {
  padding: 4px 10px; border-radius: 4px; border: 1px solid var(--rule);
  background: transparent; color: var(--ink); font: 12px var(--sans); cursor: pointer;
}
.tb-actions button:not(.fill-btn):hover:not(:disabled) { background: var(--hover); }
.tb-actions button:disabled:not(.filling) { opacity: .5; cursor: default; }

.packs { display: flex; flex-direction: column; gap: 4px; }
.pack-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 12px; color: var(--ink); }
.pack-row span:last-of-type { color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.pack-row button {
  flex-shrink: 0; width: 22px; height: 22px; padding: 0; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft); cursor: pointer;
}
.pack-row button:hover { background: var(--hover); color: var(--ink); }
.packs-empty { font-size: 12px; color: var(--ink-soft); }
.pack-row .muted { color: var(--ink-soft); }

#tts-zen-pick.active { background: var(--ink); border-color: var(--ink); color: var(--sheet); }
[hidden] { display: none !important; }

.accent-group { flex: 1; display: flex; align-items: center; justify-content: space-between; min-width: 0; }
.swatch {
  width: 18px; height: 18px; flex-shrink: 0; padding: 0; border-radius: 50%; cursor: pointer;
  background: var(--c, transparent); border: 1px solid var(--rule);
  font: 600 10px var(--sans); color: var(--ink-soft);
}
.swatch.active { outline: 2px solid var(--ink); outline-offset: 2px; }
.swatch-custom {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  width: 18px; max-width: 18px; box-sizing: border-box; overflow: hidden;
  border: 2px solid transparent; font-size: 12px; line-height: 1; color: var(--ink);
  background: linear-gradient(var(--sheet), var(--sheet)) padding-box,
              conic-gradient(#c0392b, #d4a017, #3f7a4a, #2f5d8a, #7a3b6e, #c0392b) border-box;
}
#tts-zen-accent-picker { position: absolute; inset: 0; opacity: 0; width: 100%; height: 100%; cursor: pointer; border: 0; padding: 0; }
#tts-zen-accent-hex {
  flex: 1; min-width: 0; padding: 5px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--paper); color: var(--ink);
  font: 12px var(--mono); outline: none;
}
#tts-zen-accent-hex:focus { border-color: var(--ink-soft); }
#tts-zen-accent-hex.invalid { border-color: var(--accent); }
.accent-hint { margin: -2px 0 0 74px; font: 10px var(--mono); color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

#tts-zen-resume-row { text-align: center; padding: 0 14px 6px; }
#tts-zen-restart {
  background: none; border: none; padding: 0; cursor: pointer;
  font: 12px var(--sans); color: var(--ink-soft);
  text-decoration: underline; text-underline-offset: 3px;
}
#tts-zen-restart:hover { color: var(--ink); }

#tts-zen-status {
  padding: 0 14px 10px; font-size: 12px; color: var(--ink-soft); text-align: center;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
#tts-zen-status.error { color: var(--accent); }

/* Collapsed state */
#tts-zen-collapsed {
  position: fixed; z-index: 999999;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--sheet); border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  color: var(--ink); cursor: grab; box-shadow: var(--shadow);
  touch-action: none; transform-origin: center;
  transition: transform .34s cubic-bezier(.34,1.56,.64,1), opacity .2s ease, visibility 0s, box-shadow .2s ease;
}
#tts-zen-collapsed.hidden {
  transform: scale(.3); opacity: 0; visibility: hidden; pointer-events: none;
  transition: transform .16s ease, opacity .12s ease, visibility 0s .16s;
}
#tts-zen-collapsed:hover { color: var(--accent); }
#tts-zen-collapsed.dragging { transition: none; cursor: grabbing; box-shadow: 0 10px 28px rgba(0,0,0,.24); }
/* Where the bubble will land while it is being dragged */
#tts-zen-bubble-ghost {
  position: fixed; z-index: 999998; width: 40px; height: 40px; border-radius: 50%;
  border: 2px dashed var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent);
  opacity: 0; transform: scale(.6); pointer-events: none;
  transition: opacity .18s ease, transform .22s cubic-bezier(.2,.8,.2,1), top .22s cubic-bezier(.2,.8,.2,1), left .22s cubic-bezier(.2,.8,.2,1), right .22s cubic-bezier(.2,.8,.2,1), bottom .22s cubic-bezier(.2,.8,.2,1);
}
#tts-zen-bubble-ghost.show { opacity: 1; transform: scale(1); }

/* Modals */
#tts-zen-preview-overlay, #tts-zen-sites-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(20,18,15,0.35);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .15s ease; pointer-events: none;
}
#tts-zen-preview-overlay:not(.hidden), #tts-zen-sites-overlay:not(.hidden) { opacity: 1; pointer-events: auto; }
#tts-zen-preview-overlay.hidden, #tts-zen-sites-overlay.hidden { display: none; }

#tts-zen-preview-overlay:not(.hidden) #tts-zen-preview-modal,
#tts-zen-sites-overlay:not(.hidden) #tts-zen-sites-modal { animation: modal-in .28s cubic-bezier(.2,.8,.2,1); }
.closing #tts-zen-preview-modal, .closing #tts-zen-sites-modal { transform: translateY(8px) scale(.98); opacity: 0; transition: transform .18s ease, opacity .18s ease; }
@keyframes modal-in { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
#tts-zen-read-label.swap { animation: label-in .22s ease; display: inline-block; }
@keyframes label-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: none; } }

#tts-zen-preview-modal, #tts-zen-sites-modal {
  max-width: 92vw; background: var(--paper); color: var(--ink);
  border: 1px solid var(--rule); border-radius: 6px; overflow: hidden;
  box-shadow: var(--shadow); font-family: var(--sans);
}
#tts-zen-preview-modal { width: 620px; max-height: 84vh; display: flex; flex-direction: column; }
#tts-zen-sites-modal { width: 380px; }

#tts-zen-preview-header, #tts-zen-sites-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 10px 10px 18px; border-bottom: 1px solid var(--rule);
  flex-wrap: wrap; gap: 8px;
}
#tts-zen-preview-header > span, #tts-zen-sites-header > span {
  font-family: var(--serif); font-size: 16px; font-weight: 600; color: var(--ink);
}
#tts-zen-preview-tools { display: flex; align-items: center; gap: 2px; }
.preview-tool {
  padding: 3px 8px; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft);
  font: 12px var(--sans); cursor: pointer;
}
.preview-tool:hover { background: var(--hover); color: var(--ink); }
.preview-tool.active { color: var(--ink); text-decoration: underline; text-underline-offset: 3px; }
.preview-tool[data-font="serif"] { font-family: var(--serif); }
.preview-tool[data-font="mono"] { font-family: var(--mono); }
.tool-sep { width: 1px; height: 14px; background: var(--rule); margin: 0 6px; }

#tts-zen-preview-close, #tts-zen-sites-close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; padding: 0; background: transparent; border: none;
  border-radius: 4px; color: var(--ink-soft); cursor: pointer;
}
#tts-zen-preview-close:hover, #tts-zen-sites-close:hover { background: var(--hover); color: var(--ink); }

#tts-zen-preview-content {
  flex: 1; overflow-y: auto; padding: 28px 36px;
  font-family: var(--serif); font-size: 17px; line-height: 1.7; color: var(--ink);
  white-space: pre-wrap; user-select: text;
}
#tts-zen-preview-content p { max-width: 62ch; margin-left: auto !important; margin-right: auto !important; }
#tts-zen-preview-content .sentence { padding: 1px 0; transition: background .15s ease, color .15s ease; }
#tts-zen-preview-content .sentence.active { background: var(--mark); color: var(--ink); }
#tts-zen-preview-content .sentence.played { color: var(--ink-soft); }
#tts-zen-preview-content .chunk-label {
  max-width: 62ch; margin: 16px auto 4px; text-align: center;
  font-size: 12px; font-style: italic; color: var(--ink-soft);
}
#tts-zen-preview-content .chunk-pending {
  font-size: 14px; color: var(--ink-soft);
  border-left: 2px solid var(--rule); padding-left: 10px; margin-bottom: 6px;
}

/* Sites list */
#tts-zen-sites-list { padding: 6px 18px 14px; display: flex; flex-direction: column; max-height: 55vh; overflow-y: auto; }
.site-row {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 0; border-bottom: 1px solid var(--rule);
}
.site-row:last-child { border-bottom: none; }
.site-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.site-row-icon {
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 20px; height: 20px; border-radius: 3px;
  color: var(--ink-soft); font-size: 15px;
}
.site-row-info { display: flex; flex-direction: column; min-width: 0; }
.site-row-name { font-size: 14px; color: var(--ink); }
.site-row-domain { font-size: 12px; color: var(--ink-soft); }
.site-add-row { padding-top: 12px; }
.sites-section { margin: 14px 0 2px; font-size: 12px; color: var(--ink-soft); font-variant: small-caps; letter-spacing: .04em; }
.sites-section:first-child { margin-top: 4px; }
.sites-hint { margin: 2px 0 6px; font-size: 12px; line-height: 1.4; color: var(--ink-soft); }
.site-remove {
  flex-shrink: 0; width: 24px; height: 24px; padding: 0; border: none; border-radius: 4px;
  background: transparent; color: var(--ink-soft); cursor: pointer;
}
.site-remove:hover { background: var(--hover); color: var(--ink); }
#tts-zen-add-site-input {
  flex: 1; min-width: 0; padding: 6px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background: var(--sheet); color: var(--ink);
  font: 13px var(--sans); outline: none;
}
#tts-zen-add-site-input:focus { border-color: var(--ink-soft); }
#tts-zen-add-site-btn {
  padding: 6px 12px; border-radius: 4px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: 13px var(--sans);
  cursor: pointer; white-space: nowrap;
}
#tts-zen-add-site-btn:hover { background: var(--hover); }

@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; animation: none !important; }
}
`;
  var T = {
    es: {
      minimize: "Minimizar",
      preview: "Ver texto extra\xEDdo",
      sites: "Sitios compatibles",
      settings: "Ajustes",
      voice: "Voz",
      engine: "Motor",
      engineNative: "Nativo (Browser)",
      engineNeural: "Neural (edge-tts)",
      speed: "Velocidad",
      langLabel: "Idioma",
      langES: "Espa\xF1ol",
      langEN: "English",
      prev: "Anterior",
      next: "Siguiente",
      read: "Leer",
      ready: "Listo",
      extractedText: "Texto extra\xEDdo",
      reduce: "Reducir",
      increase: "Aumentar",
      lessSpacing: "Menos espacio",
      moreSpacing: "M\xE1s espacio",
      sitesModal: "Sitios compatibles",
      loadingVoices: "Cargando voces...",
      loadingEdgeVoices: "Cargando voces edge-tts...",
      serverUnavailable: "Servidor no disponible",
      unknown: "desconocido",
      line: "L\xEDnea",
      noText: "Sin texto \u2014 haz clic en Leer primero.",
      generic: "Gen\xE9rico",
      otherSites: "otros sitios",
      addSite: "A\xF1adir",
      addSitePlaceholder: "ejemplo.com",
      serif: "Serif",
      sans: "Sans",
      mono: "Mono",
      translateTitle: "Traducci\xF3n",
      engineLocal: "Local (Piper)",
      continueAt: "Continuar",
      restart: "Desde el inicio",
      autoNext: "Seguir con el siguiente cap\xEDtulo",
      downloadVoice: "Descargar voz",
      downloading: "Descargando\u2026",
      downloaded: "descargada",
      downloadFailed: "No se pudo descargar",
      look: "Aspecto",
      followTheme: "Usar los colores del tema del navegador",
      accent: "Acento",
      pasteZen: "Pegar color de Zen",
      otherColor: "Otro color",
      wordHighlight: "Resaltar la palabra que suena",
      otherLangs: "Otros idiomas",
      readLang: "Leer en",
      autoLang: "Auto \xB7 %s",
      original: "Idioma original",
      detected: "Detectado: %s",
      packs: "Paquetes de traducci\xF3n",
      noPacks: "Ninguno descargado",
      remove: "Borrar",
      pick: "Elegir d\xF3nde empezar",
      roboticHint: "Las voces del sistema suenan rob\xF3ticas.",
      tryLocal: "Probar voz Local",
      trFound: "Texto en %s.",
      trNeedsTwo: "Hacen falta dos paquetes (%s).",
      trDownload: "Descargar %s \xB7 %s MB",
      trOnline: "Traducir en l\xEDnea",
      trOriginal: "Leer en %s",
      trDownloading: "Descargando\u2026 %s",
      trFailed: "No se pudo descargar la traducci\xF3n",
      tabVoice: "Voz",
      tabRead: "Lectura",
      tabTr: "Traducir",
      tabLook: "Aspecto",
      uiLang: "Interfaz",
      inlineTr: "Mostrar la traducci\xF3n junto al texto",
      trMode: "Traducir con",
      trAsk: "Preguntar",
      trOffline: "Paquete sin conexi\xF3n",
      trOnlineMode: "En l\xEDnea",
      trNever: "No traducir",
      remembered: "Elecciones recordadas",
      forget: "Olvidar",
      neuralHint: "\xBFA\xFAn m\xE1s natural? El motor Neural usa voces de Microsoft.",
      tryNeural: "Usar Neural",
      qHigh: "Alta calidad",
      qMedium: "Normal",
      qLow: "Ligera",
      retry: "No se pudo descargar \xB7 Reintentar",
      downloadPct: "Descargando\u2026 %s",
      tipHigh: "Alta calidad \xB7 la m\xE1s natural; ~110 MB y tarda m\xE1s en generar cada frase",
      tipMedium: "Normal \xB7 buen equilibrio entre naturalidad y rapidez; ~60 MB",
      tipLow: "Ligera \xB7 la m\xE1s r\xE1pida y peque\xF1a; suena m\xE1s rob\xF3tica",
      tipNative: "Voces del navegador: al instante, sin descargas; calidad seg\xFAn tu sistema",
      tipServer: "Voces neurales de Microsoft (edge-tts): las m\xE1s naturales; necesita el servidor en marcha",
      tipLocal: "Piper en tu equipo: sin conexi\xF3n una vez descargada la voz",
      infoNative: "Voz del navegador \xB7 al instante",
      infoNativeRobotic: "Voz del sistema (espeak) \xB7 suena rob\xF3tica",
      infoServer: "Neural \xB7 la m\xE1s natural; necesita el servidor",
      slowVoice: "En tu equipo esta voz se genera m\xE1s despacio de lo que suena (x%s), por eso hay pausas entre frases. Prueba una de calidad Normal o Ligera.",
      openLibrary: "Abrir la biblioteca",
      autoOpen: "Abrir siempre en este sitio",
      presetsTitle: "Sitios con extractor propio",
      presetNext: "solo la historia \xB7 cap\xEDtulo siguiente en la misma p\xE1gina",
      presetScroll: "solo la historia \xB7 sigue el scroll infinito",
      presetGeneric: "cualquier otra p\xE1gina \xB7 extractor de art\xEDculos",
      autoTitle: "Abrir siempre en",
      autoHint: "El panel aparece al pulsar el bot\xF3n de zenTTS en la barra del navegador (Alt+May\xFAs+Z). En estos sitios se abre solo."
    },
    en: {
      minimize: "Minimize",
      preview: "View extracted text",
      sites: "Supported sites",
      settings: "Settings",
      voice: "Voice",
      engine: "Engine",
      engineNative: "Native (Browser)",
      engineNeural: "Neural (edge-tts)",
      speed: "Speed",
      langLabel: "Language",
      langES: "Espa\xF1ol",
      langEN: "English",
      prev: "Previous",
      next: "Next",
      read: "Read",
      ready: "Ready",
      extractedText: "Extracted text",
      reduce: "Decrease",
      increase: "Increase",
      lessSpacing: "Less spacing",
      moreSpacing: "More spacing",
      sitesModal: "Supported sites",
      loadingVoices: "Loading voices...",
      loadingEdgeVoices: "Loading edge-tts voices...",
      serverUnavailable: "Server unavailable",
      unknown: "unknown",
      line: "Line",
      noText: "No text \u2014 click Read first.",
      generic: "Generic",
      otherSites: "other sites",
      addSite: "Add",
      addSitePlaceholder: "example.com",
      serif: "Serif",
      sans: "Sans",
      mono: "Mono",
      translateTitle: "Translation",
      engineLocal: "Local (Piper)",
      continueAt: "Continue",
      restart: "From the beginning",
      autoNext: "Continue with the next chapter",
      downloadVoice: "Download voice",
      downloading: "Downloading\u2026",
      downloaded: "downloaded",
      downloadFailed: "Download failed",
      look: "Appearance",
      followTheme: "Use the browser theme colors",
      accent: "Accent",
      pasteZen: "Paste Zen color",
      otherColor: "Other color",
      wordHighlight: "Highlight the spoken word",
      otherLangs: "Other languages",
      readLang: "Read in",
      autoLang: "Auto \xB7 %s",
      original: "Original language",
      detected: "Detected: %s",
      packs: "Translation packs",
      noPacks: "None downloaded",
      remove: "Delete",
      pick: "Choose where to start",
      roboticHint: "System voices sound robotic.",
      tryLocal: "Try the Local voice",
      trFound: "Text in %s.",
      trNeedsTwo: "Needs two packs (%s).",
      trDownload: "Download %s \xB7 %s MB",
      trOnline: "Translate online",
      trOriginal: "Read in %s",
      trDownloading: "Downloading\u2026 %s",
      trFailed: "Could not download the translation",
      tabVoice: "Voice",
      tabRead: "Reading",
      tabTr: "Translate",
      tabLook: "Look",
      uiLang: "Interface",
      inlineTr: "Show the translation next to the text",
      trMode: "Translate with",
      trAsk: "Ask",
      trOffline: "Offline pack",
      trOnlineMode: "Online",
      trNever: "Don't translate",
      remembered: "Remembered choices",
      forget: "Forget",
      neuralHint: "Even more natural? The Neural engine uses Microsoft voices.",
      tryNeural: "Use Neural",
      qHigh: "High quality",
      qMedium: "Standard",
      qLow: "Light",
      retry: "Download failed \xB7 Retry",
      downloadPct: "Downloading\u2026 %s",
      tipHigh: "High quality \xB7 the most natural; ~110 MB and slower to generate each sentence",
      tipMedium: "Standard \xB7 a good balance of naturalness and speed; ~60 MB",
      tipLow: "Light \xB7 the fastest and smallest; sounds more robotic",
      tipNative: "Browser voices: instant, nothing to download; quality depends on your system",
      tipServer: "Microsoft neural voices (edge-tts): the most natural; needs the server running",
      tipLocal: "Piper on your computer: offline once the voice is downloaded",
      infoNative: "Browser voice \xB7 instant",
      infoNativeRobotic: "System voice (espeak) \xB7 sounds robotic",
      infoServer: "Neural \xB7 the most natural; needs the server",
      slowVoice: "On your computer this voice takes longer to generate than to play (x%s), hence the pauses between sentences. Try a Standard or Light one.",
      openLibrary: "Open the library",
      autoOpen: "Always open on this site",
      presetsTitle: "Sites with their own extractor",
      presetNext: "just the story \xB7 next chapter in the same page",
      presetScroll: "just the story \xB7 follows infinite scroll",
      presetGeneric: "any other page \xB7 article extractor",
      autoTitle: "Always open on",
      autoHint: "The panel appears when you press the zenTTS button in the browser toolbar (Alt+Shift+Z). On these sites it opens by itself."
    }
  };
  function t(key) {
    return (T[state.lang] || T["es"])[key] || key;
  }
  function tf(key) {
    var out = t(key), args = Array.prototype.slice.call(arguments, 1);
    args.forEach(function(a) {
      out = out.replace("%s", a);
    });
    return out;
  }
  function languageName(code) {
    if (!code) return "";
    try {
      var name = new Intl.DisplayNames([state.lang], { type: "language" }).of(code.replace("_", "-"));
      if (name) return name;
    } catch (_) {
    }
    return code;
  }
  var state = {
    voices: [],
    currentVoice: "es-ES-AlvaroNeural",
    currentRate: 1,
    currentEngine: "native",
    localVoice: "es_ES-davefx-medium",
    autoNext: true,
    accent: "",
    followTheme: true,
    wordHighlight: true,
    readLang: "auto",
    trMode: "ask",
    inlineTr: true,
    tab: "voice",
    corner: "br",
    lang: "es"
  };
  async function loadSettings() {
    try {
      const stored = await browser.storage.local.get(["voice", "rate", "engine", "lang", "readLang", "localVoice", "autoNext", "accent", "followTheme", "wordHighlight", "corner", "trMode", "inlineTr", "tab"]);
      if (stored.readLang) state.readLang = stored.readLang;
      if (stored.corner) state.corner = stored.corner;
      if (stored.trMode) state.trMode = stored.trMode;
      if (typeof stored.inlineTr === "boolean") state.inlineTr = stored.inlineTr;
      if (stored.tab) state.tab = stored.tab;
      if (typeof stored.wordHighlight === "boolean") state.wordHighlight = stored.wordHighlight;
      if (typeof stored.accent === "string") state.accent = stored.accent;
      if (typeof stored.followTheme === "boolean") state.followTheme = stored.followTheme;
      if (stored.localVoice) state.localVoice = stored.localVoice;
      if (typeof stored.autoNext === "boolean") state.autoNext = stored.autoNext;
      if (stored.voice) state.currentVoice = stored.voice;
      if (stored.rate) state.currentRate = stored.rate;
      if (stored.engine) state.currentEngine = stored.engine;
      if (stored.lang) state.lang = stored.lang;
    } catch (_) {
    }
    syncShared();
  }
  function syncShared() {
    var shared = window.__tts_zen_state;
    if (!shared) return;
    shared.currentVoice = state.currentVoice;
    shared.localVoice = state.localVoice;
    shared.currentRate = state.currentRate;
    shared.currentEngine = state.currentEngine;
    shared.lang = state.lang;
    shared.readLang = state.readLang;
    shared.trMode = state.trMode;
    shared.inlineTr = state.inlineTr;
    shared.autoNext = state.autoNext;
    shared.wordHighlight = state.wordHighlight;
  }
  async function saveSettings() {
    try {
      await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate, engine: state.currentEngine, lang: state.lang, readLang: state.readLang, corner: state.corner, trMode: state.trMode, inlineTr: state.inlineTr, tab: state.tab, localVoice: state.localVoice, autoNext: state.autoNext, accent: state.accent, followTheme: state.followTheme, wordHighlight: state.wordHighlight });
    } catch (_) {
    }
  }
  function uiLang() {
    try {
      return browser.i18n.getUILanguage().slice(0, 2).toLowerCase();
    } catch (_) {
      return state.lang;
    }
  }
  function outLang() {
    var shared = window.__tts_zen_state;
    if (shared && shared.speechLang) return shared.speechLang;
    if (state.readLang === "original") return detectedLang || uiLang();
    if (state.readLang && state.readLang !== "auto") return state.readLang;
    return uiLang();
  }
  function isRobotic(v) {
    return /espeak|mbrola|speechd/i.test((v.voiceURI || "") + " " + v.name) || /\+/.test(v.name);
  }
  function cleanVoiceName(v) {
    var m = v.name.match(/^(.*?)\+(.+)$/);
    if (isRobotic(v)) return langLabel(v.lang) + (m ? " \xB7 " + m[2].replace(/_/g, " ") : "");
    return v.name.replace(/^Microsoft /, "");
  }
  async function loadVoices() {
    var localRow = getEl("tts-zen-local-row");
    if (localRow) localRow.hidden = state.currentEngine !== "local";
    var neural = getEl("tts-zen-neural-hint");
    if (neural) neural.hidden = state.currentEngine !== "local";
    var hint = getEl("tts-zen-voice-hint");
    if (hint) hint.hidden = true;
    if (state.currentEngine === "server") return loadServerVoices();
    if (state.currentEngine === "local") return loadLocalVoices();
    var voices = speechSynthesis.getVoices();
    if (voices.length === 0) {
      speechSynthesis.onvoiceschanged = function() {
        if (state.currentEngine === "native") loadVoices();
      };
      return;
    }
    state.voices = voices.map(function(v) {
      return { name: v.name, lang: v.lang, default: v.default, label: cleanVoiceName(v), robotic: isRobotic(v) };
    });
    populateVoiceDropdown("currentVoice");
    var prefix = outLang().toLowerCase();
    var mine = state.voices.filter(function(v) {
      return (v.lang || "").toLowerCase().startsWith(prefix);
    });
    if (hint) hint.hidden = !(mine.length === 0 || mine.every(function(v) {
      return v.robotic;
    }));
  }
  function setVoicePlaceholder(text) {
    var select = getEl("tts-zen-voice");
    if (!select) return;
    select.replaceChildren();
    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = text;
    select.appendChild(opt);
    select.disabled = true;
  }
  async function loadServerVoices() {
    setVoicePlaceholder(t("loadingEdgeVoices"));
    try {
      var lang = outLang() + "-";
      var resp = await browser.runtime.sendMessage({ action: "get_voices", locale: lang });
      if (state.currentEngine !== "server") return;
      if (resp && resp.success && resp.voices && resp.voices.length > 0) {
        state.voices = resp.voices.map(function(v) {
          return { name: v.name, lang: v.locale };
        });
        populateVoiceDropdown("currentVoice");
        window.__tts_zen_state.serverAvailable = true;
        return;
      }
    } catch (e) {
      console.error("[zenTTS] voices:", e.message || e);
    }
    window.__tts_zen_state.serverAvailable = false;
    setVoicePlaceholder(t("serverUnavailable"));
  }
  var localStored = [];
  var localDownload = null;
  var QUALITY = { high: "qHigh", medium: "qMedium", low: "qLow", x_low: "qLow" };
  async function loadLocalVoices() {
    setVoicePlaceholder(t("loadingVoices"));
    var resp;
    try {
      resp = await browser.runtime.sendMessage({ action: "local_voices" });
    } catch (_) {
    }
    if (state.currentEngine !== "local") return;
    localStored = resp && resp.stored || [];
    var prefix = outLang().toLowerCase() + "_";
    var all = resp && resp.catalog || [];
    var catalog = all.filter(function(v) {
      return v.key.toLowerCase().startsWith(prefix) || localStored.includes(v.key);
    });
    if (!catalog.length) catalog = all;
    state.voices = catalog.map(function(v) {
      var region = (v.language || "").split("_")[1];
      var parts = [v.name.replace(/_/g, " ")];
      if (region) parts.push(region);
      if (localStored.includes(v.key)) parts.push(t("downloaded"));
      else if (v.size) parts.push(Math.round(v.size / 1048576) + " MB");
      var q = QUALITY[v.quality] || "qMedium";
      return {
        name: v.key,
        label: parts.join(" \xB7 "),
        lang: v.language,
        size: v.size,
        quality: q,
        tip: t({ qHigh: "tipHigh", qMedium: "tipMedium", qLow: "tipLow" }[q]),
        group: v.key.toLowerCase().startsWith(prefix) ? QUALITY[v.quality] || "qMedium" : null
      };
    });
    if (!state.voices.some(function(v) {
      return v.name === state.localVoice;
    })) {
      var firstStored = state.voices.find(function(v) {
        return localStored.includes(v.name);
      });
      var standard = state.voices.find(function(v) {
        return v.group === "qMedium";
      });
      state.localVoice = (firstStored || standard || state.voices[0] || {}).name || state.localVoice;
      syncShared();
    }
    populateVoiceDropdown("localVoice");
    updateLocalRow();
    warmLocalVoice();
  }
  function setFill(btn, text, fraction) {
    if (!btn) return;
    btn.querySelectorAll(".fill-label").forEach(function(l) {
      l.textContent = text;
    });
    btn.title = text;
    var filling = fraction != null;
    btn.classList.toggle("filling", filling);
    btn.disabled = filling;
    btn.style.setProperty("--p", filling ? Math.round(Math.max(0, Math.min(1, fraction)) * 100) + "%" : "0%");
  }
  function updateLocalRow() {
    var btn = getEl("tts-zen-local-dl");
    if (!btn) return;
    var have = localStored.includes(state.localVoice);
    var row = getEl("tts-zen-local-row");
    if (row && state.currentEngine === "local") row.hidden = have && !localDownload;
    if (!localDownload) btn.classList.remove("done");
    if (localDownload && localDownload.voiceId === state.localVoice) {
      setFill(btn, tf("downloadPct", Math.round(localDownload.fraction * 100) + " %"), localDownload.fraction);
      return;
    }
    var voice = (state.voices || []).find(function(v) {
      return v.name === state.localVoice;
    });
    var mb = voice && voice.size ? " \xB7 " + Math.round(voice.size / 1048576) + " MB" : "";
    setFill(btn, btn.dataset.failed === state.localVoice ? t("retry") : t("downloadVoice") + mb, null);
  }
  async function downloadLocalVoice() {
    var btn = getEl("tts-zen-local-dl");
    var voiceId = state.localVoice;
    if (localDownload) return;
    localDownload = { voiceId, fraction: 0 };
    if (btn) delete btn.dataset.failed;
    updateLocalRow();
    try {
      var resp = await browser.runtime.sendMessage({ action: "local_download", voiceId });
      if (!resp || !resp.success) throw new Error(resp && resp.error || "download");
      localDownload.fraction = 1;
      updateLocalRow();
      await new Promise(function(r) {
        setTimeout(r, 350);
      });
      if (btn) btn.classList.add("done");
      await new Promise(function(r) {
        setTimeout(r, 260);
      });
      localDownload = null;
      await loadLocalVoices();
    } catch (e) {
      console.error("[zenTTS] download voice:", e.message || e);
      localDownload = null;
      if (btn) btn.dataset.failed = voiceId;
      updateLocalRow();
    }
  }
  if (typeof browser !== "undefined" && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(function(msg) {
      if (!msg || msg.action !== "local_progress" || !localDownload || msg.voiceId !== localDownload.voiceId) return;
      if (msg.total) localDownload.fraction = Math.min(0.99, msg.loaded / msg.total);
      updateLocalRow();
    });
  }
  var LANG_NAMES = {
    es: "Espa\xF1ol",
    en: "English",
    fr: "Fran\xE7ais",
    de: "Deutsch",
    it: "Italiano",
    pt: "Portugu\xEAs",
    ja: "\u65E5\u672C\u8A9E",
    ko: "\uD55C\uAD6D\uC5B4",
    zh: "\u4E2D\u6587",
    ru: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439"
  };
  function langLabel(lang) {
    var parts = (lang || "").split(/[-_]/);
    var name = LANG_NAMES[parts[0]] || parts[0] || t("unknown");
    return parts[1] ? name + " (" + parts[1] + ")" : name;
  }
  function populateVoiceDropdown(key) {
    var select = getEl("tts-zen-voice");
    if (!select) return;
    select.replaceChildren();
    select.disabled = false;
    if (!state.voices || state.voices.length === 0) return;
    var names = state.voices.map(function(v) {
      return v.name;
    });
    if (!names.includes(state[key])) {
      var prefix = outLang().toLowerCase();
      var match = state.voices.find(function(v) {
        return (v.lang || "").toLowerCase().startsWith(prefix);
      });
      var def = state.voices.find(function(v) {
        return v.default;
      });
      state[key] = (match || def || state.voices[0]).name;
      syncShared();
    }
    var want = outLang().toLowerCase();
    var groups = {};
    var others = [];
    var byQuality = key === "localVoice";
    state.voices.forEach(function(v) {
      var lang = v.lang || "";
      var g = byQuality ? v.group : lang.toLowerCase().replace("_", "-").startsWith(want) ? lang : null;
      if (g) (groups[g] = groups[g] || []).push(v);
      else others.push(v);
    });
    var order = byQuality ? ["qHigh", "qMedium", "qLow"].filter(function(g) {
      return groups[g];
    }) : Object.keys(groups).sort();
    function option(v, withLang) {
      var opt = document.createElement("option");
      opt.value = v.name;
      opt.textContent = (v.label || v.name) + (withLang && v.label && v.label.indexOf(langLabel(v.lang)) !== 0 ? " \u2014 " + langLabel(v.lang) : "");
      opt.title = v.tip ? v.tip + " \u2014 " + v.name : v.name;
      opt.selected = v.name === state[key];
      return opt;
    }
    order.forEach(function(g) {
      var optgroup = document.createElement("optgroup");
      optgroup.label = byQuality ? t(g) : langLabel(g);
      groups[g].forEach(function(v) {
        optgroup.appendChild(option(v, false));
      });
      select.appendChild(optgroup);
    });
    if (others.length) {
      var rest = document.createElement("optgroup");
      rest.label = t("otherLangs");
      others.sort(function(a, b) {
        return (a.lang || "").localeCompare(b.lang || "");
      }).forEach(function(v) {
        rest.appendChild(option(v, true));
      });
      select.appendChild(rest);
    }
    var chosen = state.voices.find(function(v) {
      return v.name === state[key];
    });
    select.title = chosen ? (chosen.tip ? chosen.tip + " \u2014 " : "") + chosen.name : "";
    renderVoiceInfo();
  }
  function renderVoiceInfo() {
    var row = getEl("tts-zen-voice-info-row"), el = getEl("tts-zen-voice-info");
    if (!row || !el) return;
    var text = "";
    if (state.currentEngine === "local") {
      var v = (state.voices || []).find(function(x) {
        return x.name === state.localVoice;
      });
      text = v && v.tip ? v.tip : "";
    } else if (state.currentEngine === "server") {
      text = t("infoServer");
    } else {
      var n = (state.voices || []).find(function(x) {
        return x.name === state.currentVoice;
      });
      if (n) text = n.robotic ? t("infoNativeRobotic") : t("infoNative");
    }
    el.textContent = text;
    row.hidden = !text;
    renderSlowHint();
  }
  var slowVoices = {};
  function renderSlowHint() {
    var row = getEl("tts-zen-slow-hint");
    if (!row) return;
    var ratio = slowVoices[state.localVoice];
    var show = state.currentEngine === "local" && ratio > 1;
    row.hidden = !show;
    if (show) getEl("tts-zen-slow-text").textContent = tf("slowVoice", ratio.toFixed(1));
  }
  if (typeof window !== "undefined") {
    window.addEventListener("zentts-voice-speed", function(e) {
      slowVoices[e.detail.voice] = e.detail.ratio;
      renderSlowHint();
    });
  }
  function warmLocalVoice() {
    if (state.currentEngine !== "local" || !localStored.includes(state.localVoice)) return;
    try {
      browser.runtime.sendMessage({ action: "local_warm", voiceId: state.localVoice }).catch(function() {
      });
    } catch (_) {
    }
  }
  function applyLanguage(shadow) {
    var lang = state.lang;
    [
      ["tts-zen-voice-label", "voice"],
      ["tts-zen-engine-label", "engine"],
      ["tts-zen-lang-label", "uiLang"],
      ["tts-zen-tab-voice", "tabVoice"],
      ["tts-zen-tab-read", "tabRead"],
      ["tts-zen-tab-tr", "tabTr"],
      ["tts-zen-tab-look", "tabLook"],
      ["tts-zen-inline-tr-label", "inlineTr"],
      ["tts-zen-open-library", "openLibrary"],
      ["tts-zen-autoopen-label", "autoOpen"],
      ["tts-zen-trmode-label", "trMode"],
      ["tts-zen-neural-hint-text", "neuralHint"],
      ["tts-zen-try-neural", "tryNeural"],
      ["tts-zen-translate-title", "translateTitle"],
      ["tts-zen-speed-text", "speed"],
      ["tts-zen-autonext-label", "autoNext"],
      ["tts-zen-restart", "restart"],
      ["tts-zen-look-title", "look"],
      ["tts-zen-word-hl-label", "wordHighlight"],
      ["tts-zen-readlang-label", "readLang"],
      ["tts-zen-packs-title", "packs"],
      ["tts-zen-voice-hint-text", "roboticHint"],
      ["tts-zen-try-local", "tryLocal"],
      ["tts-zen-follow-label", "followTheme"],
      ["tts-zen-accent-label", "accent"]
    ].forEach(function(pair) {
      var el = shadow.getElementById(pair[0]);
      if (el) el.textContent = T[lang][pair[1]];
    });
    renderReadLabel();
    updateLocalRow();
    var trModeSel = shadow.getElementById("tts-zen-trmode");
    if (trModeSel) ["trAsk", "trOffline", "trOnlineMode", "trNever"].forEach(function(k, i) {
      trModeSel.options[i].textContent = T[lang][k];
    });
    shadow.querySelectorAll(".tabs button").forEach(function(b) {
      b.title = b.textContent;
    });
    renderReadLangOptions();
    renderDetected();
    renderTranslateBar();
    refreshPacks();
    var pickBtn = shadow.getElementById("tts-zen-pick");
    if (pickBtn) pickBtn.title = T[lang].pick;
    var hex = shadow.getElementById("tts-zen-accent-hex");
    if (hex) hex.placeholder = T[lang].pasteZen;
    var custom = shadow.getElementById("tts-zen-accent-custom");
    if (custom) custom.title = T[lang].otherColor;
    var previewBtn = shadow.getElementById("tts-zen-preview-btn");
    if (previewBtn) previewBtn.title = T[lang].preview;
    var sitesBtn = shadow.getElementById("tts-zen-sites-btn");
    if (sitesBtn) sitesBtn.title = T[lang].sites;
    var settingsBtn = shadow.getElementById("tts-zen-settings-btn");
    if (settingsBtn) settingsBtn.title = T[lang].settings;
    var minimizeBtn = shadow.getElementById("tts-zen-minimize");
    if (minimizeBtn) minimizeBtn.title = T[lang].minimize;
    var prevBtn = shadow.getElementById("tts-zen-prev");
    if (prevBtn) prevBtn.title = T[lang].prev;
    var nextBtn = shadow.getElementById("tts-zen-next");
    if (nextBtn) nextBtn.title = T[lang].next;
    var engineSelect = shadow.getElementById("tts-zen-engine");
    if (engineSelect && engineSelect.options.length >= 3) {
      engineSelect.options[0].textContent = T[lang].engineNative;
      engineSelect.options[1].textContent = T[lang].engineNeural;
      engineSelect.options[2].textContent = T[lang].engineLocal;
      engineSelect.options[0].title = T[lang].tipNative;
      engineSelect.options[1].title = T[lang].tipServer;
      engineSelect.options[2].title = T[lang].tipLocal;
    }
    renderVoiceInfo();
    var statusEl = shadow.getElementById("tts-zen-status");
    if (statusEl && (statusEl.textContent === T["es"].ready || statusEl.textContent === T["en"].ready)) {
      statusEl.textContent = T[lang].ready;
    }
    var sitesHeader = shadow.querySelector("#tts-zen-sites-header span");
    if (sitesHeader) sitesHeader.textContent = T[lang].sitesModal;
    var previewHeader = shadow.querySelector("#tts-zen-preview-header span");
    if (previewHeader) previewHeader.textContent = T[lang].extractedText;
    var tools = shadow.querySelectorAll(".preview-tool");
    tools.forEach(function(tool) {
      if (tool.dataset.font === "serif") tool.textContent = T[lang].serif;
      if (tool.dataset.font === "sans") tool.textContent = T[lang].sans;
      if (tool.dataset.font === "mono") tool.textContent = T[lang].mono;
      if (tool.dataset.size === "down") tool.title = T[lang].reduce;
      if (tool.dataset.size === "up") tool.title = T[lang].increase;
      if (tool.dataset.spacing === "down") tool.title = T[lang].lessSpacing;
      if (tool.dataset.spacing === "up") tool.title = T[lang].moreSpacing;
    });
    var addInput = shadow.getElementById("tts-zen-add-site-input");
    if (addInput) addInput.placeholder = T[lang].addSitePlaceholder;
    var addBtn = shadow.getElementById("tts-zen-add-site-btn");
    if (addBtn) addBtn.textContent = T[lang].addSite;
    if (shadow.getElementById("tts-zen-sites-overlay") && !shadow.getElementById("tts-zen-sites-overlay").classList.contains("hidden")) {
      renderSitesList();
    }
    tipify(shadow);
  }
  function tipify(shadow) {
    shadow.querySelectorAll("#tts-zen-panel button[title], #tts-zen-collapsed[title], .preview-tool[title], #tts-zen-preview-close, #tts-zen-sites-close").forEach(function(b) {
      var text = b.getAttribute("title");
      if (!text) return;
      b.setAttribute("data-tip", text);
      b.setAttribute("aria-label", text);
      b.removeAttribute("title");
    });
  }
  function setupTooltips(shadow) {
    var tip = shadow.getElementById("tts-zen-tip");
    var timer2 = null, current2 = null;
    function hide() {
      clearTimeout(timer2);
      current2 = null;
      tip.hidden = true;
    }
    function show(el) {
      tip.textContent = el.getAttribute("data-tip");
      tip.hidden = false;
      var r = el.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight;
      var top = r.top - h - 8 > 4 ? r.top - h - 8 : r.bottom + 8;
      var left = Math.max(6, Math.min(window.innerWidth - w - 6, r.left + r.width / 2 - w / 2));
      tip.style.top = top + "px";
      tip.style.left = left + "px";
    }
    shadow.addEventListener("pointerover", function(e) {
      var el = e.target.closest && e.target.closest("[data-tip]");
      if (el === current2) return;
      hide();
      if (!el || el.classList.contains("dragging")) return;
      current2 = el;
      timer2 = setTimeout(function() {
        if (current2 === el) show(el);
      }, 380);
    });
    shadow.addEventListener("pointerout", function(e) {
      var to = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest("[data-tip]");
      if (to !== current2) hide();
    });
    shadow.addEventListener("pointerdown", hide, true);
    shadow.addEventListener("focusin", function(e) {
      var el = e.target.closest && e.target.closest("[data-tip]");
      if (el && el.matches(":focus-visible")) {
        current2 = el;
        show(el);
      }
    });
    shadow.addEventListener("focusout", hide);
  }
  function getEl(id) {
    const host = document.getElementById("tts-zen-host");
    if (!host || !host.shadowRoot) return null;
    return host.shadowRoot.getElementById(id);
  }
  function setStatus(text, isError) {
    const el = getEl("tts-zen-status");
    if (!el) return;
    el.textContent = text;
    el.className = isError ? "error" : "";
  }
  function setCounter(current2, total) {
    const el = getEl("tts-zen-counter");
    if (!el) return;
    el.textContent = current2 + " / " + total;
  }
  function setButtonsEnabled(btns) {
    for (const [action, enabled] of [["read", btns.read], ["pause", btns.pause], ["stop", btns.stop], ["prev", btns.prev], ["next", btns.next]]) {
      const btn = getEl("tts-zen-" + action);
      if (btn) btn.disabled = enabled === false;
    }
  }
  var browserTheme = null;
  function applyColors() {
    var host = document.getElementById("tts-zen-host");
    applyPanelColors(host, state.followTheme ? themeTokens(browserTheme) : null, state.accent);
    var group = getEl("tts-zen-accent-group");
    if (group) {
      group.querySelectorAll(".swatch").forEach(function(b) {
        var custom = !b.hasAttribute("data-accent");
        var isPreset = state.accent === "" || ACCENT_PRESETS.includes(state.accent);
        b.classList.toggle("active", custom ? !isPreset : b.dataset.accent === state.accent);
      });
    }
    var picker = getEl("tts-zen-accent-picker");
    var parsed = parseColor(state.accent || ACCENT_PRESETS[0]);
    if (picker && parsed) picker.value = toHex(parsed);
  }
  function setAccent(value) {
    state.accent = value;
    saveSettings();
    applyColors();
  }
  async function loadBrowserTheme() {
    try {
      var resp = await browser.runtime.sendMessage({ action: "get_theme" });
      browserTheme = resp && resp.success ? resp.theme : null;
    } catch (_) {
      browserTheme = null;
    }
    applyColors();
  }
  function setupColors(shadow) {
    var wordHl = shadow.getElementById("tts-zen-word-hl");
    wordHl.checked = state.wordHighlight;
    wordHl.addEventListener("change", function() {
      state.wordHighlight = wordHl.checked;
      syncShared();
      saveSettings();
    });
    var follow = shadow.getElementById("tts-zen-follow-theme");
    follow.checked = state.followTheme;
    follow.addEventListener("change", function() {
      state.followTheme = follow.checked;
      saveSettings();
      applyColors();
    });
    shadow.getElementById("tts-zen-accent-group").addEventListener("click", function(e) {
      var sw = e.target.closest(".swatch[data-accent]");
      if (sw) setAccent(sw.dataset.accent);
    });
    var picker = shadow.getElementById("tts-zen-accent-picker");
    picker.addEventListener("input", function() {
      setAccent(picker.value);
    });
    var hex = shadow.getElementById("tts-zen-accent-hex");
    function commitHex() {
      var v = hex.value.trim();
      if (!v) {
        hex.classList.remove("invalid");
        return;
      }
      var rgb = parseColor(/^[0-9a-f]{3,8}$/i.test(v) ? "#" + v : v);
      hex.classList.toggle("invalid", !rgb);
      if (rgb) {
        setAccent(toHex(rgb));
        hex.value = "";
      }
    }
    hex.addEventListener("change", commitHex);
    hex.addEventListener("keydown", function(e) {
      if (e.key === "Enter") commitHex();
    });
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyColors);
    } catch (_) {
    }
    loadBrowserTheme();
  }
  if (typeof browser !== "undefined" && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(function(msg) {
      if (msg && msg.action === "theme_changed") {
        browserTheme = msg.theme;
        applyColors();
      }
    });
  }
  var resumeInfo = null;
  function renderReadLabel() {
    var label = getEl("tts-zen-read-label");
    var text = resumeInfo ? t("continueAt") + " \xB7 " + (resumeInfo.index + 1) + " / " + resumeInfo.total : t("read");
    if (label && label.textContent !== text) {
      label.textContent = text;
      label.classList.remove("swap");
      void label.offsetWidth;
      label.classList.add("swap");
    }
    var row = getEl("tts-zen-resume-row");
    if (row) row.hidden = !resumeInfo;
  }
  function setResume(info) {
    resumeInfo = info;
    renderReadLabel();
  }
  async function createPanel(shadow, handlers) {
    await loadSettings();
    await loadCollapsedState();
    const style = document.createElement("style");
    style.textContent = PANEL_CSS;
    shadow.appendChild(style);
    const container = document.createElement("div");
    const parsedPanel = new DOMParser().parseFromString(PANEL_HTML, "text/html");
    while (parsedPanel.body.firstChild) {
      container.appendChild(parsedPanel.body.firstChild);
    }
    shadow.appendChild(container);
    applyCollapsed();
    const minimizeBtn = shadow.getElementById("tts-zen-minimize");
    minimizeBtn.addEventListener("click", toggleCollapse);
    const collapsedBtn = shadow.getElementById("tts-zen-collapsed");
    setupBubble(shadow);
    collapsedBtn.addEventListener("click", toggleCollapse);
    const previewBtn = shadow.getElementById("tts-zen-preview-btn");
    previewBtn.addEventListener("click", function() {
      showPreview("");
    });
    const sitesBtn = shadow.getElementById("tts-zen-sites-btn");
    sitesBtn.addEventListener("click", showSitesModal);
    const sitesClose = shadow.getElementById("tts-zen-sites-close");
    sitesClose.addEventListener("click", hideSitesModal);
    const sitesOverlay = shadow.getElementById("tts-zen-sites-overlay");
    sitesOverlay.addEventListener("click", function(e) {
      if (e.target === sitesOverlay) hideSitesModal();
    });
    const previewClose = shadow.getElementById("tts-zen-preview-close");
    previewClose.addEventListener("click", hidePreview);
    setupPreviewTools(shadow);
    const overlay = shadow.getElementById("tts-zen-preview-overlay");
    overlay.addEventListener("click", function(e) {
      if (e.target === overlay) hidePreview();
    });
    const settingsBtn = shadow.getElementById("tts-zen-settings-btn");
    const settingsPanel = shadow.getElementById("tts-zen-settings");
    settingsBtn.addEventListener("click", function() {
      settingsPanel.classList.toggle("collapsed");
    });
    setupTabs(shadow);
    setupTooltips(shadow);
    const voiceSelect = shadow.getElementById("tts-zen-voice");
    voiceSelect.addEventListener("change", function() {
      if (state.currentEngine === "local") {
        state.localVoice = voiceSelect.value;
        updateLocalRow();
        warmLocalVoice();
      } else state.currentVoice = voiceSelect.value;
      syncShared();
      saveSettings();
      renderVoiceInfo();
      if (handlers.onVoice) handlers.onVoice();
    });
    shadow.getElementById("tts-zen-local-dl").addEventListener("click", downloadLocalVoice);
    setupColors(shadow);
    var autoNext = shadow.getElementById("tts-zen-autonext");
    autoNext.checked = state.autoNext;
    autoNext.addEventListener("change", function() {
      state.autoNext = autoNext.checked;
      syncShared();
      saveSettings();
    });
    const engineSelect = shadow.getElementById("tts-zen-engine");
    engineSelect.value = state.currentEngine;
    engineSelect.addEventListener("change", async function() {
      state.currentEngine = engineSelect.value;
      window.__tts_zen_state.currentEngine = engineSelect.value;
      saveSettings();
      await loadVoices();
      if (handlers.onEngine) handlers.onEngine(state.currentEngine);
    });
    const langSelect = shadow.getElementById("tts-zen-lang");
    langSelect.value = state.lang;
    langSelect.addEventListener("change", function() {
      state.lang = langSelect.value;
      window.__tts_zen_state.lang = langSelect.value;
      saveSettings();
      try {
        applyLanguage(shadow);
      } catch (e) {
        console.error(e);
      }
    });
    var readLang = shadow.getElementById("tts-zen-readlang");
    readLang.value = state.readLang;
    readLang.addEventListener("change", function() {
      state.readLang = readLang.value;
      syncShared();
      saveSettings();
      if (handlers.onReadLang) handlers.onReadLang(state.readLang);
      loadVoices();
    });
    shadow.getElementById("tts-zen-try-local").addEventListener("click", function() {
      engineSelect.value = "local";
      engineSelect.dispatchEvent(new Event("change"));
    });
    shadow.getElementById("tts-zen-try-neural").addEventListener("click", function() {
      engineSelect.value = "server";
      engineSelect.dispatchEvent(new Event("change"));
    });
    shadow.getElementById("tts-zen-open-library").addEventListener("click", function() {
      if (window.location.protocol === "moz-extension:") {
        window.location.href = browser.runtime.getURL("library.html");
        return;
      }
      browser.runtime.sendMessage({ action: "open_library" }).catch(function() {
      });
    });
    var autoOpen = shadow.getElementById("tts-zen-autoopen");
    autoOpen.addEventListener("change", function() {
      setAutoSite(currentHost(), autoOpen.checked);
    });
    loadAutoSites();
    var inlineTr = shadow.getElementById("tts-zen-inline-tr");
    inlineTr.checked = state.inlineTr;
    inlineTr.addEventListener("change", function() {
      state.inlineTr = inlineTr.checked;
      syncShared();
      saveSettings();
      if (handlers.onInlineTr) handlers.onInlineTr(state.inlineTr);
    });
    var trMode = shadow.getElementById("tts-zen-trmode");
    trMode.value = state.trMode;
    trMode.addEventListener("change", function() {
      state.trMode = trMode.value;
      syncShared();
      saveSettings();
    });
    shadow.getElementById("tts-zen-pick").addEventListener("click", function() {
      if (handlers.onPick) handlers.onPick();
    });
    translateHandlers = handlers.onTranslate || null;
    ["download", "online", "original"].forEach(function(choice) {
      shadow.getElementById("tts-zen-tr-" + choice).addEventListener("click", function() {
        if (translateHandlers) translateHandlers(choice);
      });
    });
    applyCorner();
    refreshPacks();
    const speedSlider = shadow.getElementById("tts-zen-speed");
    const speedLabel = shadow.getElementById("tts-zen-speed-label");
    speedSlider.addEventListener("input", function() {
      state.currentRate = speedSlider.value / 100;
      window.__tts_zen_state.currentRate = state.currentRate;
      speedLabel.textContent = state.currentRate.toFixed(1) + "x";
      if (handlers.onRate) handlers.onRate(state.currentRate);
      saveSettings();
    });
    var readBtn = shadow.getElementById("tts-zen-read");
    var pauseBtn = shadow.getElementById("tts-zen-pause");
    var stopBtn = shadow.getElementById("tts-zen-stop");
    var prevBtn = shadow.getElementById("tts-zen-prev");
    var nextBtn = shadow.getElementById("tts-zen-next");
    readBtn.addEventListener("click", handlers.onRead);
    pauseBtn.addEventListener("click", handlers.onPause);
    stopBtn.addEventListener("click", handlers.onStop);
    prevBtn.addEventListener("click", handlers.onPrev);
    nextBtn.addEventListener("click", handlers.onNext);
    shadow.getElementById("tts-zen-restart").addEventListener("click", handlers.onRestart);
    shadow.getElementById("tts-zen-pick").title = t("pick");
    speedSlider.value = Math.round(state.currentRate * 100);
    speedLabel.textContent = state.currentRate.toFixed(1) + "x";
    loadVoices();
    try {
      applyLanguage(shadow);
    } catch (e) {
      console.error("applyLanguage error:", e);
    }
  }
  var detectedLang = null;
  var offer = null;
  var translateHandlers = null;
  function renderReadLangOptions() {
    var sel = getEl("tts-zen-readlang");
    if (!sel) return;
    sel.options[0].textContent = tf("autoLang", languageName(uiLang()));
    sel.options[1].textContent = t("original");
  }
  function renderDetected() {
    var row = getEl("tts-zen-detected-row");
    var el = getEl("tts-zen-detected");
    if (!row || !el) return;
    row.hidden = !detectedLang;
    if (detectedLang) el.textContent = tf("detected", languageName(detectedLang));
  }
  function setDetectedLanguage(code) {
    detectedLang = code;
    renderDetected();
    loadVoices();
  }
  function renderTranslateBar() {
    var bar = getEl("tts-zen-translate-bar");
    if (!bar) return;
    if (!offer) {
      closeTranslateBar(bar);
      return;
    }
    clearTimeout(bar._closing);
    bar.classList.remove("closing");
    bar.hidden = false;
    var msg = tf("trFound", languageName(offer.from));
    if (offer.pivot) msg += " " + tf("trNeedsTwo", offer.pivot.join(" + "));
    getEl("tts-zen-translate-msg").textContent = msg;
    var dl = getEl("tts-zen-tr-download");
    var pair = offer.from.toUpperCase() + "\u2192" + offer.to.toUpperCase();
    if (offer.progress != null) setFill(dl, tf("trDownloading", Math.round(offer.progress * 100) + " %"), offer.progress);
    else setFill(dl, tf("trDownload", pair, offer.sizeMB), null);
    dl.hidden = offer.supported === false;
    var busy = offer.progress != null;
    getEl("tts-zen-tr-online").hidden = !offer.online || busy;
    getEl("tts-zen-tr-online").textContent = t("trOnline");
    getEl("tts-zen-tr-original").hidden = busy;
    getEl("tts-zen-tr-original").textContent = tf("trOriginal", languageName(offer.from));
  }
  function closeTranslateBar(bar) {
    if (bar.hidden || bar.classList.contains("closing")) return;
    bar.classList.add("closing");
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    bar._closing = setTimeout(function() {
      bar.hidden = true;
      bar.classList.remove("closing");
    }, reduce ? 0 : 300);
  }
  function setTranslateOffer(info) {
    offer = info;
    renderTranslateBar();
  }
  function setTranslateProgress(fraction) {
    if (!offer) return;
    offer.progress = fraction;
    renderTranslateBar();
  }
  function packRow(label, detail, title, onRemove) {
    var row = document.createElement("div");
    row.className = "pack-row";
    var name = document.createElement("span");
    name.textContent = label;
    var info = document.createElement("span");
    info.textContent = detail;
    var del = document.createElement("button");
    del.type = "button";
    del.title = title;
    del.textContent = "\u2715";
    del.addEventListener("click", onRemove);
    row.append(name, info, del);
    return row;
  }
  var CHOICE_LABEL = { offline: "trOffline", online: "trOnlineMode", original: "trNever" };
  async function refreshPacks() {
    var box = getEl("tts-zen-packs");
    var choices = getEl("tts-zen-trchoices");
    if (!box) return;
    var list = [];
    try {
      var resp = await browser.runtime.sendMessage({ action: "tr_list" });
      list = resp && resp.packs || [];
    } catch (_) {
    }
    box.replaceChildren();
    if (!list.length) {
      var empty = document.createElement("div");
      empty.className = "packs-empty";
      empty.textContent = t("noPacks");
      box.appendChild(empty);
    }
    list.forEach(function(pk) {
      box.appendChild(packRow(languageName(pk.from) + " \u2192 " + languageName(pk.to), Math.round(pk.bytes / 1048576) + " MB", t("remove"), async function() {
        try {
          await browser.runtime.sendMessage({ action: "tr_remove", pair: pk.from + "-" + pk.to });
        } catch (_) {
        }
        refreshPacks();
      }));
    });
    if (!choices) return;
    var stored = {};
    try {
      stored = await browser.storage.local.get(null);
    } catch (_) {
    }
    choices.replaceChildren();
    Object.keys(stored).filter(function(k) {
      return k.indexOf("trChoice:") === 0;
    }).sort().forEach(function(k) {
      var pair = k.slice(9).split("-");
      choices.appendChild(packRow(languageName(pair[0]) + " \u2192 " + languageName(pair[1]), t(CHOICE_LABEL[stored[k]] || "trAsk"), t("forget"), async function() {
        try {
          await browser.storage.local.remove(k);
        } catch (_) {
        }
        refreshPacks();
      }));
    });
    choices.hidden = !choices.childElementCount;
  }
  var TABS = ["voice", "read", "tr", "look"];
  function selectTab(shadow, name, focus) {
    var i = Math.max(0, TABS.indexOf(name));
    var prev = TABS.indexOf(state.tab);
    state.tab = TABS[i];
    var tabs = shadow.getElementById("tts-zen-tabs");
    tabs.style.setProperty("--tab", i);
    tabs.querySelectorAll("button").forEach(function(b) {
      var on = b.dataset.tab === state.tab;
      b.setAttribute("aria-selected", String(on));
      b.tabIndex = on ? 0 : -1;
      if (on && focus) b.focus();
    });
    shadow.querySelectorAll(".tab-page").forEach(function(pg) {
      var on = pg.dataset.page === state.tab;
      if (on) pg.style.setProperty("--from", (i >= prev ? 12 : -12) + "px");
      else pg.style.setProperty("--from", (TABS.indexOf(pg.dataset.page) < i ? -12 : 12) + "px");
      pg.classList.toggle("active", on);
      pg.setAttribute("aria-hidden", String(!on));
    });
    fitTabHeight(shadow);
    if (state.tab === "tr") refreshPacks();
  }
  function fitTabHeight(shadow) {
    var pages = shadow.querySelector(".tab-pages");
    var active2 = shadow.querySelector(".tab-page.active");
    if (pages && active2) pages.style.height = active2.offsetHeight + "px";
  }
  function setupTabs(shadow) {
    var tabs = shadow.getElementById("tts-zen-tabs");
    tabs.addEventListener("click", function(e) {
      var b = e.target.closest("button[data-tab]");
      if (!b) return;
      selectTab(shadow, b.dataset.tab);
      saveSettings();
    });
    tabs.addEventListener("keydown", function(e) {
      var i = TABS.indexOf(state.tab);
      if (e.key === "ArrowRight") i = (i + 1) % TABS.length;
      else if (e.key === "ArrowLeft") i = (i + TABS.length - 1) % TABS.length;
      else return;
      e.preventDefault();
      selectTab(shadow, TABS[i], true);
      saveSettings();
    });
    selectTab(shadow, state.tab);
    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(function() {
        fitTabHeight(shadow);
      });
      shadow.querySelectorAll(".tab-page").forEach(function(pg) {
        ro.observe(pg);
      });
    }
  }
  function setPickActive(on) {
    var b = getEl("tts-zen-pick");
    if (!b) return;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  }
  function applyCorner() {
    var corner = state.corner || "br";
    ["tts-zen-panel", "tts-zen-collapsed", "tts-zen-bubble-ghost"].forEach(function(id) {
      var el = getEl(id);
      if (el) el.dataset.corner = corner;
    });
  }
  function setCorner(corner) {
    state.corner = corner;
    saveSettings();
    applyCorner();
  }
  var suppressClick = false;
  function nearestCorner(cx, cy) {
    return (cy < window.innerHeight / 2 ? "t" : "b") + (cx < window.innerWidth / 2 ? "l" : "r");
  }
  function setupBubble(shadow) {
    var bubble = shadow.getElementById("tts-zen-collapsed");
    var ghost = shadow.getElementById("tts-zen-bubble-ghost");
    var drag = null;
    var reduce = function() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };
    function frame() {
      if (!drag || !drag.moved) return;
      var k = reduce() ? 1 : 0.35;
      drag.cx += (drag.tx - drag.cx) * k;
      drag.cy += (drag.ty - drag.cy) * k;
      bubble.style.transform = "translate(" + drag.cx.toFixed(1) + "px," + drag.cy.toFixed(1) + "px) scale(1.08)";
      var r = drag.home;
      var corner = nearestCorner(r.left + r.width / 2 + drag.cx, r.top + r.height / 2 + drag.cy);
      if (ghost.dataset.corner !== corner) ghost.dataset.corner = corner;
      drag.raf = requestAnimationFrame(frame);
    }
    bubble.addEventListener("pointerdown", function(e) {
      if (e.button !== 0) return;
      var home = bubble.getBoundingClientRect();
      drag = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId, home, tx: 0, ty: 0, cx: 0, cy: 0 };
      bubble.setPointerCapture(e.pointerId);
    });
    bubble.addEventListener("pointermove", function(e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 5) return;
      var r = drag.home, m = 6;
      drag.tx = Math.max(m - r.left, Math.min(window.innerWidth - m - r.right, dx));
      drag.ty = Math.max(m - r.top, Math.min(window.innerHeight - m - r.bottom, dy));
      if (!drag.moved) {
        drag.moved = true;
        bubble.getAnimations().forEach(function(a) {
          a.cancel();
        });
        bubble.classList.add("dragging");
        ghost.dataset.corner = state.corner || "br";
        ghost.classList.add("show");
        drag.raf = requestAnimationFrame(frame);
      }
    });
    function end() {
      if (!drag) return;
      var d = drag;
      drag = null;
      cancelAnimationFrame(d.raf);
      ghost.classList.remove("show");
      if (!d.moved) return;
      suppressClick = true;
      var before = bubble.getBoundingClientRect();
      var corner = nearestCorner(before.left + before.width / 2, before.top + before.height / 2);
      bubble.style.transform = "";
      setCorner(corner);
      var after = bubble.getBoundingClientRect();
      var dx = before.left - after.left, dy = before.top - after.top;
      bubble.classList.remove("dragging");
      if (reduce() || !bubble.animate) return;
      var dist = Math.hypot(dx, dy);
      bubble.animate([
        { transform: "translate(" + dx + "px," + dy + "px) scale(1.08)" },
        { transform: "translate(0,0) scale(1)" }
      ], { duration: Math.round(Math.max(350, Math.min(650, 300 + dist * 0.45))), easing: "cubic-bezier(.34,1.3,.64,1)" });
    }
    bubble.addEventListener("pointerup", end);
    bubble.addEventListener("pointercancel", end);
    bubble.addEventListener("click", function(e) {
      if (suppressClick) {
        suppressClick = false;
        e.stopImmediatePropagation();
      }
    });
    bubble.addEventListener("keydown", function(e) {
      var c = state.corner || "br";
      var v = c[0], h = c[1];
      if (e.key === "ArrowUp") v = "t";
      else if (e.key === "ArrowDown") v = "b";
      else if (e.key === "ArrowLeft") h = "l";
      else if (e.key === "ArrowRight") h = "r";
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleCollapse();
        return;
      } else return;
      e.preventDefault();
      moveBubbleTo(v + h);
    });
  }
  function moveBubbleTo(corner) {
    var bubble = getEl("tts-zen-collapsed");
    if (!bubble || corner === state.corner) return;
    var before = bubble.getBoundingClientRect();
    setCorner(corner);
    var after = bubble.getBoundingClientRect();
    if (!bubble.animate || window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    bubble.animate([
      { transform: "translate(" + (before.left - after.left) + "px," + (before.top - after.top) + "px)" },
      { transform: "translate(0,0)" }
    ], { duration: 480, easing: "cubic-bezier(.34,1.3,.64,1)" });
  }
  var panelCollapsed = false;
  async function loadCollapsedState() {
    try {
      const stored = await browser.storage.local.get("collapsed");
      if (stored.collapsed) {
        panelCollapsed = true;
        applyCollapsed();
      }
    } catch (_) {
    }
  }
  async function saveCollapsedState() {
    try {
      await browser.storage.local.set({ collapsed: panelCollapsed });
    } catch (_) {
    }
  }
  function applyCollapsed() {
    const panel = getEl("tts-zen-panel");
    const collapsedBtn = getEl("tts-zen-collapsed");
    if (!panel || !collapsedBtn) return;
    if (panelCollapsed) {
      panel.classList.add("collapsed");
      collapsedBtn.classList.remove("hidden");
    } else {
      panel.classList.remove("collapsed");
      collapsedBtn.classList.add("hidden");
    }
  }
  function toggleCollapse() {
    panelCollapsed = !panelCollapsed;
    applyCollapsed();
    saveCollapsedState();
  }
  var lastExtractedText = "";
  function showPreview(text) {
    lastExtractedText = text || lastExtractedText || window.__tts_zen_last_text || "";
    var overlay = getEl("tts-zen-preview-overlay");
    var content = getEl("tts-zen-preview-content");
    if (!overlay || !content) return;
    renderPreviewContent(content);
    applyPreviewStyle();
    overlay.classList.remove("hidden");
    suppressCaption(true);
  }
  function renderPreviewContent(content) {
    var sentences2 = window.__tts_zen_sentences || [];
    content.replaceChildren();
    if (sentences2.length > 0) {
      for (var i = 0; i < sentences2.length; i++) {
        var p = document.createElement("p");
        p.style.cssText = "margin:0 0 6px 0;line-height:inherit;";
        var span = document.createElement("span");
        span.className = "sentence";
        span.id = "tts-zen-preview-s-" + i;
        span.textContent = sentences2[i].text;
        p.appendChild(span);
        content.appendChild(p);
      }
    } else {
      var paragraphs2 = (lastExtractedText || "Sin texto \u2014 click en Leer primero.").split(/\n\n+/).filter(function(l) {
        return l.trim();
      });
      for (var j = 0; j < paragraphs2.length; j++) {
        var p2 = document.createElement("p");
        p2.style.cssText = "margin:0 0 10px 0;line-height:inherit;";
        p2.textContent = paragraphs2[j].trim();
        content.appendChild(p2);
      }
    }
  }
  function updatePreviewSentences() {
    var overlay = getEl("tts-zen-preview-overlay");
    if (!overlay || overlay.classList.contains("hidden")) return;
    var content = getEl("tts-zen-preview-content");
    if (content) renderPreviewContent(content);
  }
  function closeOverlay(overlay) {
    if (!overlay || overlay.classList.contains("hidden")) return;
    suppressCaption(false);
    overlay.classList.add("closing");
    overlay.style.opacity = "0";
    setTimeout(function() {
      overlay.classList.add("hidden");
      overlay.classList.remove("closing");
      overlay.style.opacity = "";
    }, 190);
  }
  function hidePreview() {
    closeOverlay(getEl("tts-zen-preview-overlay"));
  }
  var previewFont = "serif";
  var previewSize = 17;
  var previewSpacing = 1.7;
  function applyPreviewStyle() {
    var content = getEl("tts-zen-preview-content");
    if (!content) return;
    var family = previewFont === "serif" ? '"Georgia", "Times New Roman", serif' : previewFont === "mono" ? '"JetBrains Mono", "Fira Code", monospace' : '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    content.style.setProperty("font-family", family, "important");
    content.style.setProperty("font-size", previewSize + "px", "important");
    content.style.setProperty("line-height", String(previewSpacing), "important");
  }
  function setupPreviewTools(shadow) {
    var tools = shadow.querySelectorAll(".preview-tool");
    tools.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var font = this.dataset.font;
        var size = this.dataset.size;
        var spacing = this.dataset.spacing;
        if (font) {
          previewFont = font;
          tools.forEach(function(b) {
            if (b.dataset.font) b.classList.remove("active");
          });
          this.classList.add("active");
        }
        if (size === "up") previewSize = Math.min(24, previewSize + 1);
        if (size === "down") previewSize = Math.max(11, previewSize - 1);
        if (spacing === "up") previewSpacing = Math.min(2.8, +(previewSpacing + 0.1).toFixed(1));
        if (spacing === "down") previewSpacing = Math.max(1.2, +(previewSpacing - 0.1).toFixed(1));
        applyPreviewStyle();
      });
    });
  }
  var PLAY_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5,3 19,12 5,21"></polygon></svg>';
  var PAUSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
  function setPauseIcon(isPlaying) {
    var btn = getEl("tts-zen-pause");
    if (!btn) return;
    btn.textContent = "";
    var iconHtml = isPlaying ? PAUSE_ICON : PLAY_ICON;
    var parsedIcon = new DOMParser().parseFromString(iconHtml, "text/html");
    while (parsedIcon.body.firstChild) {
      btn.appendChild(parsedIcon.body.firstChild);
    }
  }
  var PRESETS = [
    { id: "archiveofourown.org", name: "Archive of Our Own", icon: "icons/sites/ao3.svg", what: "presetNext" },
    { id: "fanfiction.net", name: "FanFiction.net", icon: "icons/sites/fanfiction.png", what: "presetNext" },
    { id: "wattpad.com", name: "Wattpad", icon: "icons/sites/wattpad.svg", what: "presetNext" },
    { id: "webnovel.com", name: "Webnovel", icon: "icons/sites/webnovel.png", what: "presetScroll" }
  ];
  var autoSites = [];
  function currentHost() {
    return window.location.hostname;
  }
  async function loadAutoSites() {
    try {
      autoSites = (await browser.storage.local.get("autoSites")).autoSites || [];
    } catch (_) {
      autoSites = [];
    }
    renderAutoOpen();
  }
  async function saveAutoSites() {
    try {
      await browser.storage.local.set({ autoSites });
    } catch (_) {
    }
    renderAutoOpen();
  }
  function setAutoSite(host, on) {
    if (!host) return;
    autoSites = autoSites.filter(function(h) {
      return h !== host;
    });
    if (on) autoSites.push(host);
    saveAutoSites();
  }
  function renderAutoOpen() {
    var box = getEl("tts-zen-autoopen");
    if (box) {
      box.checked = autoSites.includes(currentHost());
      box.disabled = !currentHost() || window.location.protocol === "moz-extension:";
    }
    var row = getEl("tts-zen-autoopen-row");
    if (row) row.hidden = !currentHost() || window.location.protocol === "moz-extension:";
    var overlay = getEl("tts-zen-sites-overlay");
    if (overlay && !overlay.classList.contains("hidden")) renderSitesList();
  }
  function iconUrl(path) {
    try {
      return browser.runtime.getURL(path);
    } catch (_) {
      return "";
    }
  }
  function renderSitesList() {
    var list = getEl("tts-zen-sites-list");
    if (!list) return;
    list.replaceChildren();
    function section(text) {
      var h = document.createElement("div");
      h.className = "sites-section";
      h.textContent = text;
      list.appendChild(h);
    }
    function row(icon, name, detail, action) {
      var r = document.createElement("div");
      r.className = "site-row";
      var left = document.createElement("div");
      left.className = "site-row-left";
      if (icon) {
        var img = document.createElement("img");
        img.className = "site-row-icon";
        img.src = icon;
        img.width = 20;
        img.height = 20;
        img.alt = "";
        left.appendChild(img);
      } else {
        var dot = document.createElement("div");
        dot.className = "site-row-icon";
        dot.textContent = "\u25C6";
        left.appendChild(dot);
      }
      var info = document.createElement("div");
      info.className = "site-row-info";
      var n = document.createElement("div");
      n.className = "site-row-name";
      n.textContent = name;
      var d = document.createElement("div");
      d.className = "site-row-domain";
      d.textContent = detail;
      info.append(n, d);
      left.appendChild(info);
      r.appendChild(left);
      if (action) r.appendChild(action);
      list.appendChild(r);
    }
    section(t("presetsTitle"));
    PRESETS.forEach(function(p) {
      row(iconUrl(p.icon), p.name, p.id + " \xB7 " + t(p.what));
    });
    row(null, t("generic"), t("presetGeneric"));
    section(t("autoTitle"));
    var hint = document.createElement("p");
    hint.className = "sites-hint";
    hint.textContent = t("autoHint");
    list.appendChild(hint);
    autoSites.slice().sort().forEach(function(host) {
      var del = document.createElement("button");
      del.type = "button";
      del.className = "site-remove";
      del.textContent = "\u2715";
      del.setAttribute("data-tip", t("remove"));
      del.setAttribute("aria-label", t("remove") + " " + host);
      del.addEventListener("click", function() {
        setAutoSite(host, false);
      });
      var preset = PRESETS.find(function(p) {
        return host.endsWith(p.id);
      });
      row(preset ? iconUrl(preset.icon) : null, host, preset ? preset.name : t("generic"), del);
    });
    var addRow = document.createElement("div");
    addRow.className = "site-row site-add-row";
    var input = document.createElement("input");
    input.id = "tts-zen-add-site-input";
    input.type = "text";
    input.placeholder = t("addSitePlaceholder");
    var addBtn = document.createElement("button");
    addBtn.id = "tts-zen-add-site-btn";
    addBtn.type = "button";
    addBtn.textContent = t("addSite");
    addRow.append(input, addBtn);
    list.appendChild(addRow);
    addBtn.addEventListener("click", function() {
      var domain = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!domain.includes(".") || autoSites.includes(domain)) return;
      setAutoSite(domain, true);
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") addBtn.click();
    });
  }
  function showSitesModal() {
    renderSitesList();
    var overlay = getEl("tts-zen-sites-overlay");
    if (overlay) {
      overlay.classList.remove("hidden");
      suppressCaption(true);
    }
  }
  function hideSitesModal() {
    closeOverlay(getEl("tts-zen-sites-overlay"));
  }
  function setPanelVisible(on) {
    var host = document.getElementById("tts-zen-host");
    if (!host) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (on) {
      host.style.display = "";
      if (!reduce && host.animate) host.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: "ease-out" });
      return;
    }
    var done = function() {
      host.style.display = "none";
    };
    if (reduce || !host.animate) {
      done();
      return;
    }
    host.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-in" }).onfinish = done;
  }

  // src/sites.js
  function visibleText(el) {
    return (el.textContent || "").replace(/\s+/g, " ").trim();
  }
  function paragraphsIn(container, selector) {
    var out = [];
    var nodes = container.querySelectorAll(selector);
    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i];
      if (el.parentElement && el.parentElement.closest(selector) && container.contains(el.parentElement.closest(selector))) continue;
      if (visibleText(el).length >= 2) out.push(el);
    }
    if (out.length === 0 && visibleText(container).length > 0) out.push(container);
    return out;
  }
  function absolute(href, base) {
    try {
      return new URL(href, base).href;
    } catch (_) {
      return null;
    }
  }
  function relNext(doc, url) {
    var link = doc.querySelector('link[rel="next"][href], a[rel="next"][href]');
    return link ? absolute(link.getAttribute("href"), url) : null;
  }
  var BLOCKS = "p, h1, h2, h3, h4, h5, h6, li, blockquote, pre";
  function textOf(doc, sel) {
    var el = doc.querySelector(sel);
    return el ? visibleText(el) : "";
  }
  function titleParts(doc) {
    return (doc.title || "").split(/\s+[-|–—]\s+/).map(function(x) {
      return x.trim();
    }).filter(Boolean);
  }
  var SITES = [
    {
      id: "ao3",
      test: function(host) {
        return host.includes("archiveofourown.org");
      },
      container: function(doc) {
        return doc.querySelector("#chapters .userstuff");
      },
      paragraphs: function(c) {
        return paragraphsIn(c, BLOCKS).filter(function(el) {
          return !el.classList.contains("landmark");
        });
      },
      chapterKey: function(url) {
        var m = url.pathname.match(/\/works\/(\d+)(?:\/chapters\/(\d+))?/);
        return m ? "ao3:" + m[1] + ":" + (m[2] || "1") : null;
      },
      nextUrl: function(doc, url) {
        var a = doc.querySelector("li.chapter.next a[href], .chapter.next a[href]");
        return a ? absolute(a.getAttribute("href"), url) : null;
      },
      // The work this chapter belongs to, for the library's Web shelf
      work: function(doc, url) {
        var m = url.pathname.match(/\/works\/(\d+)/);
        if (!m) return null;
        var total = (textOf(doc, "dd.chapters").split("/")[1] || "").trim();
        var sel = doc.querySelector("#selected_id");
        return {
          key: "ao3:" + m[1],
          title: textOf(doc, "h2.title") || titleParts(doc)[0],
          author: textOf(doc, 'a[rel="author"]'),
          workUrl: url.origin + "/works/" + m[1],
          chapterTitle: textOf(doc, ".chapter.preface h3.title, .chapter h3.title"),
          chapterNum: sel ? sel.selectedIndex + 1 : 1,
          chapters: /^\d+$/.test(total) ? +total : null
        };
      }
    },
    {
      id: "ffn",
      test: function(host) {
        return host.includes("fanfiction.net") || host.includes("fictionpress.com");
      },
      container: function(doc) {
        return doc.querySelector("#storytext, .storytext");
      },
      paragraphs: function(c) {
        return paragraphsIn(c, "p");
      },
      chapterKey: function(url) {
        var m = url.pathname.match(/\/s\/(\d+)(?:\/(\d+))?/);
        return m ? "ffn:" + m[1] + ":" + (m[2] || "1") : null;
      },
      nextUrl: function(doc, url) {
        var m = url.pathname.match(/\/s\/(\d+)(?:\/(\d+))?(\/.*)?/);
        if (!m) return null;
        var n = parseInt(m[2] || "1", 10) + 1;
        var sel = doc.querySelector("#chap_select");
        if (!sel || !sel.querySelector('option[value="' + n + '"]')) return null;
        return absolute("/s/" + m[1] + "/" + n + (m[3] || "/"), url);
      },
      work: function(doc, url) {
        var m = url.pathname.match(/\/s\/(\d+)(?:\/(\d+))?/);
        if (!m) return null;
        var sel = doc.querySelector("#chap_select");
        var opt = sel && sel.options[sel.selectedIndex];
        return {
          key: "ffn:" + m[1],
          title: textOf(doc, "#profile_top b.xcontrast_txt") || titleParts(doc)[0],
          author: textOf(doc, '#profile_top a.xcontrast_txt[href^="/u/"]'),
          workUrl: url.origin + "/s/" + m[1],
          chapterTitle: opt ? opt.textContent.trim() : "",
          chapterNum: parseInt(m[2] || "1", 10),
          chapters: sel ? sel.options.length : 1
        };
      }
    },
    {
      id: "wattpad",
      test: function(host) {
        return host.includes("wattpad.com");
      },
      // The header panel (.text-center) holds metadata, not the story
      container: function(doc) {
        return doc.querySelector(".panel.panel-reading:not(.text-center) pre") || doc.querySelector(".panel.panel-reading:not(.text-center)");
      },
      paragraphs: function(c) {
        var ps = c.querySelectorAll("p[data-p-id]");
        return ps.length ? Array.prototype.filter.call(ps, function(el) {
          return visibleText(el).length >= 2;
        }) : paragraphsIn(c, "p");
      },
      chapterKey: function(url) {
        var m = url.pathname.match(/^\/(\d+)/);
        return m ? "wattpad:" + m[1] : null;
      },
      nextUrl: function(doc, url) {
        var a = doc.querySelector("a.next-part-link[href], .next-part a[href]");
        return a ? absolute(a.getAttribute("href"), url) : relNext(doc, url);
      },
      work: function(doc, url) {
        var link = doc.querySelector('a[href*="/story/"]');
        var m = link && link.getAttribute("href").match(/\/story\/(\d+)/);
        var parts = titleParts(doc);
        var title = link && visibleText(link) || parts[1] || parts[0];
        return {
          key: "wattpad:" + (m ? m[1] : title.toLowerCase()),
          title,
          workUrl: m ? absolute(link.getAttribute("href"), url) : url.href,
          chapterTitle: textOf(doc, "h1.h2, .part-title, h1") || parts[0]
        };
      }
    },
    {
      id: "webnovel",
      // Chapters load one after another in the same page (infinite scroll), so
      // the "next chapter" is found in the page itself: see content.js
      inPage: true,
      test: function(host) {
        return host.includes("webnovel.com");
      },
      container: function(doc) {
        return webnovelChapter(doc);
      },
      paragraphs: function(c) {
        return paragraphsIn(c, "p");
      },
      chapterKey: function(url, container) {
        var id = container && chapterIdOf(container);
        return "webnovel:" + (id || url.pathname);
      },
      nextUrl: function() {
        return null;
      },
      work: function(doc, url) {
        var m = url.pathname.match(/\/book\/(?:[^/]*?_)?(\d{6,})/);
        if (!m) return null;
        var parts = titleParts(doc);
        var chapter = active && active.querySelector("h3, h2, .cha-tit");
        return {
          key: "webnovel:" + m[1],
          title: textOf(doc, ".det-hd h1, .cha-hd-mn-text a, .j_bookName") || parts[1] || parts[0],
          workUrl: url.origin + "/book/" + m[1],
          chapterTitle: chapter ? visibleText(chapter) : parts[0]
        };
      },
      nextContainer: function(doc, current2) {
        return chapterAfter(doc, current2);
      },
      pullMore: function(current2) {
        pullMore(current2);
      },
      nextControl: function(doc, current2, url) {
        return nextControl(doc, current2, url);
      },
      isLocked: function(el) {
        return isLocked(el);
      }
    }
  ];
  var CHAPTER_SEL = '.cha-content, .cha-words, .chapter-content, .read-content, [class*="cha-content"], [class*="cha-words"]';
  var active = null;
  function setActiveChapter(el) {
    active = el;
  }
  function deepQueryAll(root, selector) {
    var out = Array.prototype.slice.call(root.querySelectorAll(selector));
    var walker = (root.ownerDocument || root).createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    for (var n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.shadowRoot) out = out.concat(deepQueryAll(n.shadowRoot, selector));
    }
    return out;
  }
  function chapterNodes(doc) {
    return deepQueryAll(doc, CHAPTER_SEL).filter(function(el) {
      var up = el.parentElement && el.parentElement.closest(CHAPTER_SEL);
      return !up;
    });
  }
  function idFromUrl(href) {
    var m = String(href || "").match(/\/book\/[^/]*?(\d{6,})[^/]*\/[^/]*?(\d{6,})/) || String(href || "").match(/(\d{8,})(?!.*\d{8,})/);
    return m ? m[m.length - 1] : null;
  }
  function chapterIdOf(el) {
    for (var n = el; n && n.nodeType === 1; n = n.parentElement) {
      var v = n.getAttribute("data-cid") || n.getAttribute("data-chapter-id") || n.getAttribute("data-chapterid") || n.getAttribute("data-id");
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
      var byId = list.find(function(el) {
        return chapterIdOf(el) === id;
      });
      if (byId) return byId;
    }
    if (doc.defaultView) {
      var h = doc.defaultView.innerHeight;
      var seen = list.find(function(el) {
        var r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < h;
      });
      if (seen) return seen;
    }
    return list[0];
  }
  function chapterAfter(doc, current2) {
    var list = chapterNodes(doc);
    var i = list.indexOf(current2);
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
  function pullMore(current2) {
    var last = current2 && (current2.lastElementChild || current2);
    if (last && last.scrollIntoView) last.scrollIntoView({ block: "end" });
    var box = scrollerOf(current2);
    if (box) {
      box.scrollTop = box.scrollHeight;
      box.dispatchEvent(new Event("scroll"));
    }
    var doc = current2 && current2.ownerDocument || document;
    var win = doc.defaultView || window;
    win.scrollTo(0, doc.documentElement.scrollHeight);
    win.dispatchEvent(new Event("scroll"));
  }
  var NEXT_WORDS = /^\s*(next(\s+chapter)?|siguiente(\s+cap[ií]tulo)?|cap[ií]tulo\s+siguiente|pr[oó]ximo(\s+cap[ií]tulo)?|下一章)\s*[›»>→]*\s*$/i;
  function labelOf(el) {
    return [el.textContent, el.getAttribute("title"), el.getAttribute("aria-label")].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
  }
  function nextControl(doc, current2, url) {
    var rel = doc.querySelector('link[rel="next"][href], a[rel="next"][href]');
    if (rel) return { href: absolute(rel.getAttribute("href"), url) };
    var candidates = deepQueryAll(doc, 'a, button, [role="button"]').filter(function(el2) {
      if (el2.disabled || el2.getAttribute("aria-disabled") === "true") return false;
      var label = labelOf(el2);
      var cls = (typeof el2.className === "string" ? el2.className : "") + " " + (el2.id || "");
      return label.length < 40 && NEXT_WORDS.test(label) || /(^|[\s_-])next([\s_-]|chapter|$)/i.test(cls);
    });
    for (var i = 0; i < candidates.length; i++) {
      var el = candidates[i];
      var href = el.tagName === "A" && el.getAttribute("href");
      if (href && !/^(#|javascript:)/i.test(href)) return { href: absolute(href, url) };
      if (el.tagName !== "A" || href) return { button: el };
    }
    var id = current2 && chapterIdOf(current2) || idFromUrl(url && url.href);
    if (id) {
      var links = deepQueryAll(doc, 'a[href*="/book/"]');
      var at = links.findIndex(function(a) {
        return idFromUrl(a.href) === id;
      });
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
    if (LOCKED.test(visibleText(el).slice(0, 4e3))) return true;
    return Array.prototype.some.call(el.querySelectorAll('[class*="ock"]'), function(n) {
      return /(^|[\s_-])(un)?lock(ed)?([\s_-]|$)/i.test(typeof n.className === "string" ? n.className : "");
    });
  }
  var GENERIC = {
    id: "generic",
    test: function() {
      return true;
    },
    container: function(doc) {
      return doc.querySelector('article, main, [role="main"]') || doc.body;
    },
    paragraphs: function(c) {
      return paragraphsIn(c, BLOCKS + ", td, th");
    },
    chapterKey: function(url) {
      return "page:" + url.origin + url.pathname;
    },
    nextUrl: relNext
  };
  function siteFor(host) {
    for (var i = 0; i < SITES.length; i++) {
      if (SITES[i].test(host)) return SITES[i];
    }
    return GENERIC;
  }

  // src/engines/native.js
  var voicesCache = [];
  function refreshVoices() {
    voicesCache = speechSynthesis.getVoices();
    return voicesCache;
  }
  if (typeof speechSynthesis !== "undefined") {
    refreshVoices();
    speechSynthesis.addEventListener("voiceschanged", refreshVoices);
  }
  function nativeVoices() {
    return voicesCache.length ? voicesCache : refreshVoices();
  }
  function pickNativeVoice(name, lang) {
    var voices = nativeVoices();
    var byName = voices.find(function(v) {
      return v.name === name || v.voiceURI === name;
    });
    if (byName) return byName;
    var prefix = (lang || "").slice(0, 2).toLowerCase();
    return voices.find(function(v) {
      return v.lang.toLowerCase().startsWith(prefix);
    }) || null;
  }
  function createNativeEngine() {
    var running = null;
    function speak(text, opts, onWord) {
      return new Promise(function(resolve, reject) {
        var u = new SpeechSynthesisUtterance(text);
        u.onboundary = function(e) {
          if (!e.name || e.name === "word") onWord(e.charIndex);
        };
        var voice = pickNativeVoice(opts.voice, opts.lang);
        try {
          if (voice) {
            u.voice = voice;
            u.lang = voice.lang;
          } else if (opts.lang) {
            u.lang = opts.lang;
          }
        } catch (_) {
          if (opts.lang) u.lang = opts.lang;
        }
        u.rate = opts.rate();
        u.onend = function() {
          resolve();
        };
        u.onerror = function(e) {
          if (e.error === "canceled" || e.error === "interrupted") resolve();
          else reject(new Error("speech: " + e.error));
        };
        speechSynthesis.speak(u);
      });
    }
    function wordStart(text, at) {
      while (at > 0 && !/\s/.test(text[at - 1])) at--;
      return at;
    }
    return {
      name: "native",
      available: function() {
        return Promise.resolve(typeof speechSynthesis !== "undefined");
      },
      // Speaks sentences[start..]; calls ctx.onSentence(i) as each begins.
      // Pausing cancels the utterance (speech-dispatcher on Linux ignores
      // speechSynthesis.pause()) and resuming speaks again from the last word.
      play: async function(start, ctx) {
        var run = { cancelled: false, paused: null, word: 0 };
        running = run;
        for (var i = start; i < ctx.sentences.length; i++) {
          if (run.cancelled) return;
          ctx.onSentence(i);
          var text = ctx.sentences[i].text;
          var from = 0;
          for (; ; ) {
            run.word = from;
            var base = from;
            await speak(text.slice(from), ctx, function(k, off) {
              run.word = base + off;
              ctx.onWord(k, base + off);
            }.bind(null, i));
            if (run.cancelled) return;
            if (!run.paused) break;
            await run.paused.promise;
            if (run.cancelled) return;
            from = wordStart(text, Math.min(run.word, text.length - 1));
          }
        }
      },
      pause: function() {
        if (!running || running.paused) return;
        var p = {};
        p.promise = new Promise(function(r) {
          p.resolve = r;
        });
        running.paused = p;
        speechSynthesis.cancel();
      },
      resume: function() {
        if (!running || !running.paused) return;
        var p = running.paused;
        running.paused = null;
        p.resolve();
      },
      stop: function() {
        if (running) {
          running.cancelled = true;
          if (running.paused) running.paused.resolve();
        }
        speechSynthesis.cancel();
      }
    };
  }

  // src/engines/audio.js
  function blobFromBase64(b64, type) {
    var bytes = Uint8Array.from(atob(b64), function(c) {
      return c.charCodeAt(0);
    });
    return new Blob([bytes], { type });
  }
  function createAudioPlayer() {
    var audio = null;
    var finish = null;
    var frame = null;
    function release() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = null;
      }
      if (!audio) return;
      audio.ontimeupdate = audio.onended = audio.onerror = null;
      audio.pause();
      URL.revokeObjectURL(audio.src);
      audio = null;
    }
    return {
      play: function(blob, rate, onTime, startAt) {
        release();
        return new Promise(function(resolve, reject) {
          var a = new Audio(URL.createObjectURL(blob));
          audio = a;
          finish = resolve;
          a.playbackRate = rate || 1;
          if (startAt) a.currentTime = startAt;
          a.ontimeupdate = function() {
            if (onTime) onTime(a.currentTime, a.duration);
          };
          function tick() {
            if (audio !== a) return;
            if (!a.paused && onTime) onTime(a.currentTime, a.duration);
            frame = requestAnimationFrame(tick);
          }
          frame = requestAnimationFrame(tick);
          a.onended = function() {
            release();
            resolve();
          };
          a.onerror = function() {
            release();
            reject(new Error("audio"));
          };
          a.play().catch(function(e) {
            release();
            reject(e);
          });
        });
      },
      pause: function() {
        if (audio) audio.pause();
      },
      resume: function() {
        if (audio) audio.play();
      },
      setRate: function(rate) {
        if (audio) audio.playbackRate = rate;
      },
      stop: function() {
        var done = finish;
        finish = null;
        release();
        if (done) done();
      }
    };
  }

  // src/engines/server.js
  var MAX_SEGMENT = 2500;
  function segmentFrom(sentences2, start) {
    var end = start;
    var len = 0;
    while (end < sentences2.length && sentences2[end].refIdx === sentences2[start].refIdx) {
      if (len > 0 && len + sentences2[end].text.length > MAX_SEGMENT) break;
      len += sentences2[end].text.length + 1;
      end++;
    }
    return { start, end };
  }
  function norm(s) {
    return s.replace(/\s+/g, " ").trim();
  }
  function bare(s) {
    return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  }
  function wordTimes(ourSentences, words) {
    var tokens = [];
    ourSentences.forEach(function(s, k) {
      var re = /\S+/g, m;
      while (m = re.exec(s.text)) tokens.push({ k, offset: m.index, key: bare(m[0]) });
    });
    var out = ourSentences.map(function() {
      return [];
    });
    var j = 0;
    (words || []).forEach(function(w) {
      var key = bare(w.text || "");
      if (!key) return;
      for (var look = j; look < Math.min(tokens.length, j + 6); look++) {
        if (tokens[look].key && tokens[look].key.includes(key)) {
          out[tokens[look].k].push({ offset: tokens[look].offset, time: w.start });
          j = look + 1;
          return;
        }
      }
    });
    return out;
  }
  function sentenceTimes(ourSentences, cues) {
    var cueStarts = [];
    var pos = 0;
    cues.forEach(function(c) {
      cueStarts.push({ at: pos, start: c.start, end: c.end, len: norm(c.text).length });
      pos += norm(c.text).length + 1;
    });
    var total = pos || 1;
    var ourTotal = ourSentences.reduce(function(n, s) {
      return n + norm(s.text).length + 1;
    }, 0) || 1;
    var times = [];
    var at = 0;
    ourSentences.forEach(function(s) {
      var target = at * total / ourTotal;
      var cue = cueStarts[0];
      for (var i = 0; i < cueStarts.length; i++) {
        if (cueStarts[i].at <= target) cue = cueStarts[i];
        else break;
      }
      var t2 = 0;
      if (cue) {
        var within = cue.len ? Math.min(1, (target - cue.at) / cue.len) : 0;
        t2 = cue.start + within * (cue.end - cue.start);
      }
      times.push(t2);
      at += norm(s.text).length + 1;
    });
    return times;
  }
  function wordsAsCues(words) {
    return (words || []).map(function(w) {
      return { text: w.text, start: w.start, end: w.end };
    });
  }
  function wordAt(audio, k, t2, duration, len) {
    var list = audio.words[k];
    if (list && list.length) {
      var off = list[0].offset;
      for (var i = 0; i < list.length && list[i].time <= t2; i++) off = list[i].offset;
      return off;
    }
    var start = audio.times[k];
    var end = k + 1 < audio.times.length ? audio.times[k + 1] : duration;
    if (!(end > start)) return 0;
    return Math.floor(Math.min(0.999, (t2 - start) / (end - start)) * len);
  }
  function createServerEngine() {
    var player2 = createAudioPlayer();
    var running = null;
    async function synth(ctx, seg) {
      var text = ctx.sentences.slice(seg.start, seg.end).map(function(s) {
        return s.text;
      }).join(" ");
      var resp = await browser.runtime.sendMessage({ action: "read_page_sync", text, voice: ctx.voice, rate: "+0%", words: true });
      if (!resp || !resp.success || !resp.audio) throw new Error(resp && resp.error || "edge-tts");
      var ours = ctx.sentences.slice(seg.start, seg.end);
      var cues = resp.sentences && resp.sentences.length ? resp.sentences : wordsAsCues(resp.words);
      return {
        blob: blobFromBase64(resp.audio, "audio/mpeg"),
        times: sentenceTimes(ours, cues),
        words: wordTimes(ours, resp.words)
      };
    }
    return {
      name: "server",
      available: async function() {
        try {
          var r = await browser.runtime.sendMessage({ action: "health" });
          return !!(r && r.success);
        } catch (_) {
          return false;
        }
      },
      play: async function(start, ctx) {
        var run = { cancelled: false };
        running = run;
        var seg = segmentFrom(ctx.sentences, start);
        var pending2 = synth(ctx, seg);
        while (seg.start < ctx.sentences.length) {
          var audio;
          try {
            audio = await pending2;
          } catch (e) {
            e.at = seg.start;
            throw e;
          }
          if (run.cancelled) return;
          var next = seg.end < ctx.sentences.length ? segmentFrom(ctx.sentences, seg.end) : null;
          if (next) {
            pending2 = synth(ctx, next);
            pending2.catch(function() {
            });
          }
          var current2 = seg.start;
          ctx.onSentence(current2);
          var s = seg;
          await player2.play(audio.blob, ctx.rate(), function(t2, duration) {
            for (var k = audio.times.length - 1; k >= 0; k--) {
              if (t2 >= audio.times[k]) {
                if (s.start + k !== current2) {
                  current2 = s.start + k;
                  ctx.onSentence(current2);
                }
                ctx.onWord(current2, wordAt(audio, k, t2, duration, ctx.sentences[current2].text.length));
                break;
              }
            }
          });
          if (run.cancelled || !next) return;
          seg = next;
        }
      },
      pause: function() {
        player2.pause();
      },
      resume: function() {
        player2.resume();
      },
      setRate: function(r) {
        player2.setRate(r);
      },
      stop: function() {
        if (running) running.cancelled = true;
        player2.stop();
      }
    };
  }

  // src/engines/local.js
  var AHEAD = 4;
  var MAX_PIECE = 160;
  function piecesOf(text) {
    var out = [];
    var start = 0;
    while (text.length - start > MAX_PIECE) {
      var span = text.slice(start, start + MAX_PIECE);
      var cut = -1;
      var re = /[,;:—–]\s/g, m;
      while (m = re.exec(span)) if (m.index > 40) cut = m.index + 1;
      if (cut < 0) cut = span.lastIndexOf(" ");
      if (cut <= 0) cut = MAX_PIECE;
      out.push({ text: text.slice(start, start + cut).trim(), offset: start });
      start += cut;
      while (text[start] === " ") start++;
    }
    if (start < text.length) out.push({ text: text.slice(start).trim(), offset: start });
    return out.filter(function(p) {
      return p.text;
    });
  }
  function wavMs(buf) {
    try {
      var v = new DataView(buf);
      var rate = v.getUint32(24, true), bytesPerSample = v.getUint16(34, true) / 8 * v.getUint16(22, true);
      return (buf.byteLength - 44) / (rate * bytesPerSample) * 1e3;
    } catch (_) {
      return 0;
    }
  }
  var speed = { voice: null, samples: [] };
  function report(voice, ms, audioMs) {
    if (!(audioMs > 0) || !(ms >= 0)) return;
    if (speed.voice !== voice) speed = { voice, samples: [] };
    speed.samples.push(ms / audioMs);
    if (speed.samples.length > 8) speed.samples.shift();
    if (speed.samples.length < 3) return;
    var avg = speed.samples.reduce(function(a, b) {
      return a + b;
    }, 0) / speed.samples.length;
    try {
      window.dispatchEvent(new CustomEvent("zentts-voice-speed", { detail: { voice, ratio: avg } }));
    } catch (_) {
    }
  }
  function createLocalEngine() {
    var player2 = createAudioPlayer();
    var running = null;
    function synth(ctx, piece) {
      var voice = ctx.localVoice;
      return browser.runtime.sendMessage({ action: "local_speak", text: piece.text, voiceId: voice }).then(function(resp) {
        if (!resp || !resp.success) throw new Error(resp && resp.error || "piper");
        report(voice, resp.ms, wavMs(resp.audio));
        return new Blob([resp.audio], { type: "audio/wav" });
      });
    }
    return {
      name: "local",
      // Usable only when a voice has been downloaded
      available: async function(ctx) {
        try {
          var r = await browser.runtime.sendMessage({ action: "local_voices" });
          var stored = r && r.stored || [];
          if (stored.length === 0) return false;
          if (ctx && !stored.includes(ctx.localVoice)) ctx.localVoice = stored[0];
          return true;
        } catch (_) {
          return false;
        }
      },
      play: async function(start, ctx) {
        var run = { cancelled: false };
        running = run;
        var pieces = [];
        var nextSentence = start;
        function fill(upTo) {
          while (pieces.length <= upTo && nextSentence < ctx.sentences.length) {
            var i = nextSentence++;
            piecesOf(ctx.sentences[i].text).forEach(function(p, k2) {
              pieces.push({ i, first: k2 === 0, text: p.text, offset: p.offset });
            });
          }
        }
        var queue = {};
        function want(n2) {
          fill(n2);
          if (n2 < pieces.length && !queue[n2]) {
            queue[n2] = synth(ctx, pieces[n2]);
            queue[n2].catch(function() {
            });
          }
        }
        for (var n = 0; ; n++) {
          fill(n);
          if (n >= pieces.length) return;
          for (var k = 0; k <= AHEAD; k++) want(n + k);
          var piece = pieces[n];
          var blob;
          try {
            blob = await queue[n];
          } catch (e) {
            e.at = piece.i;
            throw e;
          }
          delete queue[n];
          if (run.cancelled) return;
          if (piece.first) ctx.onSentence(piece.i);
          await player2.play(blob, ctx.rate(), function(t2, duration) {
            if (duration > 0 && isFinite(duration)) ctx.onWord(piece.i, piece.offset + Math.floor(Math.min(0.999, t2 / duration) * piece.text.length));
          });
          if (run.cancelled) return;
        }
      },
      pause: function() {
        player2.pause();
      },
      resume: function() {
        player2.resume();
      },
      setRate: function(r) {
        player2.setRate(r);
      },
      stop: function() {
        if (running) running.cancelled = true;
        player2.stop();
      }
    };
  }

  // src/player.js
  var FALLBACK = { server: ["local", "native"], local: ["native"], native: [] };
  function createPlayer(hooks) {
    var engines = {
      native: createNativeEngine(),
      server: createServerEngine(),
      local: createLocalEngine()
    };
    var sentences2 = [];
    var current2 = -1;
    var engine = null;
    var runId = 0;
    var state2 = "idle";
    function setState(s) {
      state2 = s;
      hooks.onState(s);
    }
    function context(run2) {
      var localOverride = null;
      return {
        sentences: sentences2,
        get voice() {
          return hooks.options().voice;
        },
        get localVoice() {
          return localOverride || hooks.options().localVoice;
        },
        set localVoice(v) {
          localOverride = v;
        },
        get lang() {
          return hooks.options().lang;
        },
        rate: function() {
          return hooks.options().rate;
        },
        onSentence: function(i) {
          if (run2 !== runId) return;
          current2 = i;
          hooks.onSentence(i);
        },
        // charOffset: where the spoken word starts inside sentence i
        onWord: function(i, charOffset) {
          if (run2 !== runId || i !== current2 || !hooks.onWord) return;
          hooks.onWord(i, charOffset);
        }
      };
    }
    async function run(start, name) {
      var id = ++runId;
      engine = engines[name];
      setState("playing");
      var ctx = context(id);
      try {
        await engine.play(start, ctx);
        if (id !== runId) return;
        setState("idle");
        hooks.onEnd();
      } catch (err) {
        if (id !== runId) return;
        var from = typeof err.at === "number" ? err.at : Math.max(start, current2);
        for (var i = 0; i < FALLBACK[name].length; i++) {
          var alt = FALLBACK[name][i];
          if (await engines[alt].available(ctx)) {
            hooks.onFallback(name, alt, err);
            return run(from, alt);
          }
        }
        setState("idle");
        hooks.onError(name, err);
      }
    }
    function halt() {
      runId++;
      if (engine) engine.stop();
    }
    return {
      engines,
      get state() {
        return state2;
      },
      get index() {
        return current2;
      },
      get count() {
        return sentences2.length;
      },
      load: function(list) {
        halt();
        sentences2 = list;
        current2 = -1;
        setState("idle");
      },
      // Appends sentences (e.g. translated chunks of an infinite-scroll page)
      append: function(list) {
        sentences2.push.apply(sentences2, list);
      },
      start: function(index, name) {
        halt();
        if (!sentences2.length) return;
        current2 = Math.max(0, Math.min(index || 0, sentences2.length - 1));
        run(current2, name);
      },
      jump: function(index) {
        if (!engine || !sentences2.length) return;
        var name = engine.name;
        halt();
        current2 = Math.max(0, Math.min(index, sentences2.length - 1));
        run(current2, name);
      },
      pause: function() {
        if (state2 !== "playing" || !engine) return;
        engine.pause();
        setState("paused");
      },
      resume: function() {
        if (state2 !== "paused" || !engine) return;
        engine.resume();
        setState("playing");
      },
      setRate: function(r) {
        if (engine && engine.setRate) engine.setRate(r);
      },
      stop: function() {
        halt();
        current2 = -1;
        setState("idle");
      }
    };
  }

  // src/progress.js
  var PREFIX = "progress:";
  var MAX_ENTRIES = 300;
  var WRITE_EVERY_MS = 3e3;
  var pending = null;
  var timer = null;
  function textHash(text) {
    var s = text.slice(0, 300);
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = (h << 5) + h + s.charCodeAt(i) | 0;
    return (h >>> 0).toString(36);
  }
  async function loadProgress(key) {
    if (!key) return null;
    try {
      var got = await browser.storage.local.get(PREFIX + key);
      return got[PREFIX + key] || null;
    } catch (_) {
      return null;
    }
  }
  function flush() {
    timer = null;
    if (!pending) return;
    var item = {};
    item[PREFIX + pending.key] = pending.data;
    pending = null;
    browser.storage.local.set(item).catch(function() {
    });
  }
  function saveProgress(key, data) {
    if (!key) return;
    pending = { key, data: Object.assign({ updatedAt: Date.now() }, data) };
    if (!timer) timer = setTimeout(flush, WRITE_EVERY_MS);
  }
  function flushProgress() {
    if (timer) {
      clearTimeout(timer);
      flush();
    }
  }
  async function clearProgress(key) {
    if (!key) return;
    if (pending && pending.key === key) pending = null;
    try {
      await browser.storage.local.remove(PREFIX + key);
    } catch (_) {
    }
  }
  async function pruneProgress() {
    try {
      var all = await browser.storage.local.get(null);
      var keys = Object.keys(all).filter(function(k) {
        return k.startsWith(PREFIX);
      });
      if (keys.length <= MAX_ENTRIES) return;
      keys.sort(function(a, b) {
        return (all[b].updatedAt || 0) - (all[a].updatedAt || 0);
      });
      await browser.storage.local.remove(keys.slice(MAX_ENTRIES));
    } catch (_) {
    }
  }

  // src/content.js
  var RESTRICTED_PROTOCOLS = ["edge:", "about:", "file:", "chrome:", "moz-extension:"];
  var embed = window.__zentts_embed || null;
  window.__tts_zen_state = {
    currentVoice: "es-ES-AlvaroNeural",
    localVoice: "es_ES-davefx-medium",
    currentRate: 1,
    currentEngine: "native",
    serverAvailable: false,
    lang: "es",
    readLang: "auto",
    speechLang: null,
    autoNext: true,
    wordHighlight: true,
    trMode: "ask",
    inlineTr: true
  };
  function st() {
    return window.__tts_zen_state;
  }
  function ts(key, arg) {
    var T2 = {
      es: {
        ready: "Listo",
        playing: "Reproduciendo\u2026",
        paused: "Pausado",
        stopped: "Detenido",
        starting: "Preparando lectura\u2026",
        translating: "Traduciendo\u2026",
        trChoose: "Elige c\xF3mo leer este texto",
        trDownloadingPack: "Descargando paquete de traducci\xF3n\u2026",
        trProgress: "traduciendo %s",
        trFailed: "No se pudo traducir \u2014 leyendo en el idioma original",
        picking: "Haz clic en la frase por la que quieres empezar \xB7 Esc para cancelar",
        noTextFound: "No se encontr\xF3 texto en esta p\xE1gina",
        voiceError: "No se pudo leer con ninguna voz",
        fallback_local: "edge-tts no respondi\xF3 \u2014 usando voz local",
        fallback_native: "Sin voz neural \u2014 usando la voz del navegador",
        nextLoading: "Cargando el cap\xEDtulo siguiente\u2026",
        nextFailed: "No se pudo cargar el cap\xEDtulo siguiente",
        nextNotFound: "No se encontr\xF3 el cap\xEDtulo siguiente",
        nextLocked: "El cap\xEDtulo siguiente est\xE1 bloqueado",
        chapterDone: "Cap\xEDtulo terminado",
        pressRead: "Pulsa Leer para continuar"
      },
      en: {
        ready: "Ready",
        playing: "Playing\u2026",
        paused: "Paused",
        stopped: "Stopped",
        starting: "Getting ready\u2026",
        translating: "Translating\u2026",
        trChoose: "Choose how to read this text",
        trDownloadingPack: "Downloading translation pack\u2026",
        trProgress: "translating %s",
        trFailed: "Could not translate \u2014 reading in the original language",
        picking: "Click the sentence you want to start from \xB7 Esc to cancel",
        noTextFound: "No text found on this page",
        voiceError: "Could not read with any voice",
        fallback_local: "edge-tts did not answer \u2014 using the local voice",
        fallback_native: "No neural voice \u2014 using the browser voice",
        nextLoading: "Loading the next chapter\u2026",
        nextFailed: "Could not load the next chapter",
        nextNotFound: "Could not find the next chapter",
        nextLocked: "The next chapter is locked",
        chapterDone: "Chapter finished",
        pressRead: "Press Read to continue"
      }
    };
    var s = (T2[st().lang] || T2.es)[key] || key;
    return arg !== void 0 ? s.replace("%s", arg) : s;
  }
  var site = embed ? {
    id: "pdf",
    container: function() {
      return null;
    },
    paragraphs: function() {
      return [];
    },
    chapterKey: function() {
      return embed.key;
    },
    nextUrl: function() {
      return null;
    }
  } : siteFor(window.location.hostname);
  var chapterDoc = document;
  var chapterUrl = new URL(window.location.href);
  function isHidden(el) {
    if (el.ownerDocument !== document) return false;
    var cs = window.getComputedStyle(el);
    return cs.display === "none" || cs.visibility === "hidden";
  }
  function cleanText(text) {
    return text.replace(/[\t ]+/g, " ").replace(/\.{3,}/g, "\u2026").replace(/\s+([.,!?])/g, "$1").replace(/\.([A-ZÁÉÍÓÚÑ])/g, ". $1").replace(/ {2,}/g, " ").trim();
  }
  function extractParagraphs() {
    if (embed) {
      return embed.paragraphs().map(function(p) {
        return { el: p.el, text: cleanText(p.text) };
      }).filter(function(p) {
        return p.text.length >= 2;
      });
    }
    var container = site.container(document);
    if (container) {
      var paras = site.paragraphs(container).filter(function(el) {
        return !isHidden(el);
      }).map(function(el) {
        return { el, text: cleanText(el.innerText || el.textContent || "") };
      }).filter(function(p) {
        return p.text.length >= 2;
      });
      var total = paras.reduce(function(n, p) {
        return n + p.text.length;
      }, 0);
      if (total > 50) return paras;
    }
    try {
      var article = new import_readability.Readability(document.cloneNode(true)).parse();
      if (article && article.textContent && article.textContent.trim().length > 50) {
        return article.textContent.split(/\n\s*\n/).map(function(t2) {
          return { el: null, text: cleanText(t2) };
        }).filter(function(p) {
          return p.text.length >= 2;
        });
      }
    } catch (_) {
    }
    return [];
  }
  function splitIntoSentences(text) {
    var parts = text.match(/(?:[^.!?…\n]|\.(?=\d))+[.!?…]*["'»”’)]*\s*/g) || [text];
    return parts.map(function(p) {
      return p.trim();
    }).filter(function(p) {
      return p.length > 0;
    });
  }
  function wordsOf(text) {
    var out = [], re = /\S+/g, m;
    while (m = re.exec(text)) out.push({ start: m.index, text: m[0] });
    return out;
  }
  function sentencesOf(text, refIdx) {
    var hint = 0;
    return splitIntoSentences(text).map(function(s) {
      var item = { text: s, refIdx, words: wordsOf(s), hint };
      hint += compact(s).length;
      return item;
    });
  }
  function buildSentences(paras) {
    var list = [];
    paras.forEach(function(p, i) {
      list.push.apply(list, sentencesOf(p.text, i));
    });
    return list;
  }
  function normLang(code) {
    if (!code) return null;
    var c = String(code).toLowerCase().replace("-", "_");
    if (c === "zh_hant" || c === "zh_tw" || c === "zh_hk") return "zh_hant";
    return c.split("_")[0] || null;
  }
  async function detectLanguage(text) {
    try {
      var r = await browser.i18n.detectLanguage(text);
      var top = r && r.languages && r.languages[0];
      if (top && (r.isReliable || top.percentage >= 80) && top.language !== "und") return normLang(top.language);
    } catch (_) {
    }
    return normLang(document.documentElement.lang);
  }
  function targetLanguage() {
    var want = st().readLang || "auto";
    if (want === "original") return null;
    if (want === "auto") {
      try {
        return normLang(browser.i18n.getUILanguage());
      } catch (_) {
        return normLang(st().lang);
      }
    }
    return normLang(want);
  }
  var chapterTranslation = null;
  var pendingOffer = null;
  function withTexts(paras, texts) {
    return paras.map(function(p, i) {
      return { el: p.el, text: cleanText(texts[i] || p.text) };
    });
  }
  async function translateWith(mode, paras, from, to) {
    var texts = paras.map(function(p) {
      return p.text;
    });
    var resp = await browser.runtime.sendMessage(mode === "offline" ? { action: "tr_translate", from, to, texts } : { action: "translate", from, to, texts });
    if (!resp || !Array.isArray(resp.texts) || resp.texts.length !== paras.length) throw new Error(resp && resp.error || "translate");
    return withTexts(paras, resp.texts);
  }
  async function serverUp() {
    try {
      var r = await browser.runtime.sendMessage({ action: "health" });
      return !!(r && r.success);
    } catch (_) {
      return false;
    }
  }
  function choiceKey(from, to) {
    return "trChoice:" + from + "-" + to;
  }
  function askTranslation(info) {
    setTranslateOffer(info);
    setStatus(ts("trChoose"));
    return new Promise(function(resolve) {
      pendingOffer = resolve;
    });
  }
  function onTranslateChoice(choice) {
    if (pendingOffer) {
      var r = pendingOffer;
      pendingOffer = null;
      r(choice);
    }
  }
  async function remember(from, to, choice) {
    try {
      await browser.storage.local.set({ [choiceKey(from, to)]: choice });
    } catch (_) {
    }
    refreshPacks();
  }
  async function downloadPack(info) {
    setTranslateOffer(Object.assign({}, info, { progress: 0 }));
    setStatus(ts("trDownloadingPack"));
    try {
      var dl = await browser.runtime.sendMessage({ action: "tr_download", from: info.from, to: info.to });
      if (!dl || !dl.success) throw new Error(dl && dl.error || "download");
      setTranslateProgress(1);
      await new Promise(function(r) {
        setTimeout(r, 300);
      });
    } finally {
      setTranslateOffer(null);
      refreshPacks();
    }
  }
  async function decideLanguage(paras) {
    var sample = paras.map(function(p) {
      return p.text;
    }).join("\n").slice(0, 2500);
    var from = await detectLanguage(sample);
    var to = targetLanguage();
    var none = { mode: null, from, to };
    setDetectedLanguage(from);
    if (!from || !to || from === to) return none;
    var mode = st().trMode || "ask";
    if (mode === "never") return none;
    var status = await browser.runtime.sendMessage({ action: "tr_status", from, to }).catch(function() {
      return null;
    });
    if (status && status.needed === false) return none;
    var ready = !!(status && status.ready);
    var supported2 = !!(status && status.supported);
    var info = {
      from,
      to,
      supported: supported2,
      sizeMB: status && status.sizeMB,
      pivot: status && status.pairs && status.pairs.length > 1 ? status.pairs : null
    };
    var online = await serverUp();
    info.online = online;
    try {
      if (mode === "offline") {
        if (ready) return { mode: "offline", from, to };
        if (supported2) {
          await downloadPack(info);
          return { mode: "offline", from, to };
        }
        return online ? { mode: "online", from, to } : none;
      }
      if (mode === "online") {
        if (online) return { mode: "online", from, to };
        return ready ? { mode: "offline", from, to } : none;
      }
      if (ready) return { mode: "offline", from, to };
      var remembered = (await browser.storage.local.get(choiceKey(from, to)))[choiceKey(from, to)];
      if (remembered === "original") return none;
      if (remembered === "online" && online) return { mode: "online", from, to };
      if (remembered === "offline" && supported2) {
        await downloadPack(info);
        return { mode: "offline", from, to };
      }
      if (!supported2 && !online) return none;
      var choice = await askTranslation(info);
      if (choice === "original") {
        setTranslateOffer(null);
        await remember(from, to, "original");
        return none;
      }
      if (choice === "online") {
        setTranslateOffer(null);
        await remember(from, to, "online");
        return { mode: "online", from, to };
      }
      await remember(from, to, "offline");
      await downloadPack(info);
      return { mode: "offline", from, to };
    } catch (e) {
      console.error("[zenTTS] translation:", e.message || e);
      setTranslateOffer(null);
      setStatus(ts("trFailed"), true);
      return none;
    }
  }
  var FIRST_CHARS = 1200;
  var BATCH = 8;
  var background = null;
  var chapterGen = 0;
  var chapterEls = /* @__PURE__ */ new Set();
  function leadCount(paras) {
    var n = 0, chars = 0;
    while (n < paras.length && (n === 0 || chars < FIRST_CHARS)) {
      chars += paras[n].text.length;
      n++;
    }
    return n;
  }
  function notifyWaiters() {
    if (!background) return;
    var w = background.waiters;
    background.waiters = [];
    w.forEach(function(fn) {
      fn();
    });
  }
  function moreSentences() {
    if (!background || background.done) return Promise.resolve();
    return new Promise(function(r) {
      background.waiters.push(r);
    });
  }
  async function translateRest(rest, gen) {
    var plan = chapterTranslation;
    var total = rest.length;
    var bg = background = { gen, done: false, progress: 0, waiters: [] };
    try {
      for (var k = 0; k < rest.length; k += BATCH) {
        while (plan.mode === "offline" && st().currentEngine === "local" && player.state === "playing" && gen === chapterGen && paragraphs.length - readingParagraph() > BATCH * 2) {
          await nextSentenceTick();
        }
        if (gen !== chapterGen) return;
        var batch = rest.slice(k, k + BATCH);
        var out;
        try {
          out = await translateWith(plan.mode, batch, plan.from, plan.to);
        } catch (e) {
          console.error("[zenTTS] translation:", e.message || e);
          out = batch;
        }
        if (gen !== chapterGen) return;
        var base = paragraphs.length;
        paragraphs.push.apply(paragraphs, out);
        var more = [];
        out.forEach(function(p, i) {
          more.push.apply(more, sentencesOf(p.text, base + i));
        });
        player.append(more);
        window.__tts_zen_last_text = paragraphs.map(function(p) {
          return p.text;
        }).join("\n\n");
        bg.progress = Math.min(1, (k + batch.length) / total);
        if (player.state === "playing") setStatus(playingStatus());
        if (player.index >= 0) setCounter(player.index + 1, sentences.length);
        updatePreviewSentences();
        notifyWaiters();
      }
    } finally {
      bg.done = true;
      notifyWaiters();
      if (gen === chapterGen && player.state === "playing") setStatus(playingStatus());
    }
  }
  function readingParagraph() {
    var s = sentences[player.index];
    return s ? s.refIdx : 0;
  }
  var sentenceTicks = [];
  function nextSentenceTick() {
    return new Promise(function(r) {
      sentenceTicks.push(r);
      setTimeout(r, 4e3);
    });
  }
  function playingStatus() {
    var base = engineNote || ts("playing");
    if (background && !background.done && background.gen === chapterGen) {
      return base + " \xB7 " + ts("trProgress", Math.round(background.progress * 100) + " %");
    }
    return base;
  }
  async function translateMore(paras) {
    if (!chapterTranslation) return paras;
    try {
      return await translateWith(chapterTranslation.mode, paras, chapterTranslation.from, chapterTranslation.to);
    } catch (_) {
      return paras;
    }
  }
  function clearHighlight() {
    clear();
    hideCaption();
  }
  var currentWord = -1;
  function highlightPreview(i) {
    var host = document.getElementById("tts-zen-host");
    if (!host || !host.shadowRoot) return;
    var root = host.shadowRoot;
    var overlay = root.getElementById("tts-zen-preview-overlay");
    if (!overlay || overlay.classList.contains("hidden")) return;
    if (!root.getElementById("tts-zen-preview-s-" + (sentences.length - 1))) updatePreviewSentences();
    var prev = root.querySelector("#tts-zen-preview-content .sentence.active");
    if (prev) {
      prev.classList.remove("active");
      prev.classList.add("played");
    }
    var el = root.getElementById("tts-zen-preview-s-" + i);
    if (el) {
      el.classList.add("active");
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }
  var SITE_NAMES = { ao3: "Archive of Our Own", ffn: "FanFiction.net", wattpad: "Wattpad", webnovel: "Webnovel" };
  var lastWorkSave = 0;
  var lastWorkChapter = null;
  function workInfo() {
    var url = new URL(window.location.href);
    var host = url.hostname.replace(/^www\./, "");
    var w = null;
    try {
      w = site.work ? site.work(document, url) : null;
    } catch (_) {
    }
    if (!w) {
      var parts = (document.title || host).split(/\s+[-|–—]\s+/);
      w = { key: "web:" + host + url.pathname, title: parts[0], workUrl: url.href, chapterTitle: "" };
    }
    var og = document.querySelector('meta[property="og:image"][content]');
    return Object.assign({
      kind: "web",
      site: site.id,
      siteName: SITE_NAMES[site.id] || host,
      host,
      image: og ? og.getAttribute("content") : null
    }, w);
  }
  async function recordWork(force) {
    if (embed || !chapterKey) return;
    var now = Date.now();
    if (!force && now - lastWorkSave < 15e3 && lastWorkChapter === chapterKey) return;
    lastWorkSave = now;
    lastWorkChapter = chapterKey;
    try {
      var got = await browser.storage.local.get(["webWorks", "rememberWeb"]);
      if (got.rememberWeb === false) return;
      var info = workInfo();
      if (!info.title) return;
      var store = got.webWorks || { works: {} };
      var prev = store.works[info.key] || { addedAt: now, tags: [] };
      store.works[info.key] = Object.assign(prev, info, {
        chapterUrl: window.location.href,
        chapterKey,
        chapterProgress: sentences.length && player.index >= 0 ? +((player.index + 1) / sentences.length).toFixed(3) : prev.chapterProgress || 0,
        openedAt: now
      });
      await browser.storage.local.set({ webWorks: store });
    } catch (e) {
      console.error("[zenTTS] web shelf:", e.message || e);
    }
  }
  var paragraphs = [];
  var sentences = [];
  var chapterKey = null;
  var currentContainer = null;
  var chapterHash = null;
  var resumeAt = null;
  var prepared = false;
  var nextChapter = null;
  var engineNote = null;
  var player = createPlayer({
    options: function() {
      var s = st();
      var lang = s.speechLang || normLang(document.documentElement.lang) || "es";
      return { voice: s.currentVoice, localVoice: s.localVoice, rate: s.currentRate || 1, lang };
    },
    onSentence: function(i) {
      var ticks = sentenceTicks;
      sentenceTicks = [];
      ticks.forEach(function(r) {
        r();
      });
      var s = sentences[i];
      setCounter(i + 1, sentences.length);
      currentWord = -1;
      var el = s && paragraphs[s.refIdx] ? paragraphs[s.refIdx].el : null;
      if (embed && el) window.dispatchEvent(new CustomEvent("zentts-reading", { detail: { el } }));
      showSentence(el, s ? s.text : "", s ? s.words : [], s ? s.hint : 0);
      if (chapterTranslation && st().inlineTr !== false && s && el) showCaption(el, s.text, s.words);
      else hideCaption();
      highlightPreview(i);
      saveProgress(chapterKey, { index: i, total: sentences.length, hash: chapterHash, title: document.title });
      recordWork(false);
      if (i >= sentences.length * 0.8) prefetchNextChapter();
    },
    onWord: function(i, offset) {
      if (st().wordHighlight === false) return;
      var words = sentences[i] && sentences[i].words;
      if (!words || !words.length) return;
      var k = 0;
      while (k + 1 < words.length && words[k + 1].start <= offset) k++;
      if (k === currentWord) return;
      currentWord = k;
      showWord(k);
      showCaptionWord(k);
    },
    onState: function(state2) {
      var playing = state2 === "playing";
      var active2 = state2 !== "idle";
      setButtonsEnabled({ read: !active2, pause: active2, stop: active2, prev: active2, next: active2 });
      setPauseIcon(playing);
      if (state2 === "playing") setStatus(playingStatus());
      if (state2 === "paused") setStatus(ts("paused"));
    },
    onEnd: async function() {
      if (background && !background.done && background.gen === chapterGen) {
        var at = sentences.length;
        setStatus(ts("translating"));
        await moreSentences();
        if (sentences.length > at) {
          player.start(at, st().currentEngine || "native");
          return;
        }
      }
      clearHighlight();
      clearProgress(chapterKey);
      resumeAt = null;
      setResume(null);
      if (st().autoNext) goToNextChapter();
      else setStatus(ts("chapterDone"));
    },
    onFallback: function(from, to) {
      engineNote = ts("fallback_" + to);
      setStatus(engineNote);
      st().serverAvailable = from === "server" ? false : st().serverAvailable;
    },
    onError: function(name, err) {
      console.error("[zenTTS] " + name + ":", err && (err.message || err));
      setStatus(ts("voiceError"), true);
    }
  });
  async function prepareChapter() {
    var paras = extractParagraphs();
    if (!paras.length) {
      await new Promise(function(r) {
        setTimeout(r, 2e3);
      });
      paras = extractParagraphs();
    }
    if (!paras.length) return false;
    var gen = ++chapterGen;
    chapterEls = new Set(paras.map(function(p) {
      return p.el;
    }));
    background = null;
    chapterTranslation = null;
    st().speechLang = null;
    currentContainer = site.container(document);
    if (site.inPage) setActiveChapter(currentContainer);
    chapterKey = site.chapterKey(chapterUrl, currentContainer);
    chapterHash = textHash(paras.map(function(p) {
      return p.text;
    }).join("\n"));
    var plan = await decideLanguage(paras);
    if (gen !== chapterGen) return false;
    var rest = [];
    if (plan.mode) {
      var n = leadCount(paras);
      setStatus(ts("translating"));
      try {
        paragraphs = await translateWith(plan.mode, paras.slice(0, n), plan.from, plan.to);
        chapterTranslation = plan;
        rest = paras.slice(n);
      } catch (e) {
        console.error("[zenTTS] translation:", e.message || e);
        setStatus(ts("trFailed"), true);
        paragraphs = paras;
      }
    } else {
      paragraphs = paras;
    }
    if (gen !== chapterGen) return false;
    st().speechLang = chapterTranslation ? plan.to : plan.from;
    setDetectedLanguage(plan.from);
    sentences = buildSentences(paragraphs);
    window.__tts_zen_sentences = sentences;
    window.__tts_zen_last_text = paragraphs.map(function(p) {
      return p.text;
    }).join("\n\n");
    player.load(sentences);
    prepared = true;
    if (rest.length) translateRest(rest, gen);
    return true;
  }
  async function startReading(fromIndex) {
    setStatus(ts("starting"));
    if (!prepared && !await prepareChapter()) {
      if (!prepared) setStatus(ts("noTextFound"), true);
      return;
    }
    startContentObserver();
    engineNote = null;
    while (fromIndex >= sentences.length && background && !background.done) {
      setStatus(ts("translating"));
      await moreSentences();
    }
    player.start(fromIndex || 0, st().currentEngine || "native");
  }
  async function offerResume() {
    var key = site.chapterKey(chapterUrl, site.container(document));
    var saved = await loadProgress(key);
    resumeAt = saved && saved.index > 0 ? saved : null;
    setResume(resumeAt ? { index: resumeAt.index, total: resumeAt.total } : null);
  }
  async function handleRead() {
    if (player.state === "paused") {
      player.resume();
      return;
    }
    var from = 0;
    if (resumeAt) {
      if (!prepared && !await prepareChapter()) {
        setStatus(ts("noTextFound"), true);
        return;
      }
      if (resumeAt.hash === chapterHash && resumeAt.index < Math.max(sentences.length, resumeAt.total)) from = resumeAt.index;
    }
    resumeAt = null;
    setResume(null);
    startReading(from);
  }
  function handleRestart() {
    clearProgress(chapterKey || site.chapterKey(chapterUrl, site.container(document)));
    resumeAt = null;
    setResume(null);
    startReading(0);
  }
  async function fetchChapter(url) {
    var resp = await fetch(url, { credentials: "include" });
    if (!resp.ok) {
      var err = new Error("HTTP " + resp.status);
      err.status = resp.status;
      throw err;
    }
    var doc = new DOMParser().parseFromString(await resp.text(), "text/html");
    var container = site.container(doc);
    if (!container) throw new Error("no chapter content");
    return { url, doc, container };
  }
  function prefetchNextChapter() {
    if (nextChapter || !st().autoNext) return;
    var url = site.nextUrl(chapterDoc, chapterUrl);
    if (!url) return;
    nextChapter = { url, promise: fetchChapter(url) };
    nextChapter.promise.catch(function() {
    });
  }
  function waitFor(test, ms) {
    return new Promise(function(resolve) {
      var found = test();
      if (found) {
        resolve(found);
        return;
      }
      var done = false;
      function finish(v) {
        if (done) return;
        done = true;
        mo.disconnect();
        clearInterval(nudge);
        clearTimeout(timer2);
        resolve(v);
      }
      var mo = new MutationObserver(function() {
        var v = test();
        if (v) finish(v);
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
      var nudge = setInterval(function() {
        var v = test();
        if (v) finish(v);
        else if (site.pullMore) site.pullMore(currentContainer);
      }, 1500);
      var timer2 = setTimeout(function() {
        finish(test() || null);
      }, ms);
    });
  }
  async function readInPage(next) {
    setActiveChapter(next);
    chapterUrl = new URL(window.location.href);
    prepared = false;
    clearHighlight();
    next.scrollIntoView({ behavior: "smooth", block: "start" });
    startReading(0);
  }
  async function advanceInPage() {
    setStatus(ts("nextLoading"));
    stopContentObserver();
    var cur = currentContainer;
    var next = site.nextContainer(document, cur);
    if (!next) {
      site.pullMore(cur);
      next = await waitFor(function() {
        return site.nextContainer(document, cur);
      }, 1e4);
    }
    if (next) {
      if (site.isLocked(next)) {
        setStatus(ts("nextLocked"), true);
        return;
      }
      return readInPage(next);
    }
    var ctl = site.nextControl(document, cur, chapterUrl);
    if (ctl && ctl.href) {
      try {
        await browser.storage.local.set({ pendingAutoplay: { url: ctl.href, ts: Date.now() } });
      } catch (_) {
      }
      window.location.href = ctl.href;
      return;
    }
    if (ctl && ctl.button) {
      var before = window.location.href;
      ctl.button.click();
      next = await waitFor(function() {
        var n = site.nextContainer(document, cur);
        if (n) return n;
        var now = site.container(document);
        return window.location.href !== before && now && now !== cur && now.isConnected ? now : null;
      }, 1e4);
      if (next) return site.isLocked(next) ? setStatus(ts("nextLocked"), true) : readInPage(next);
    }
    setStatus(site.isLocked(cur) ? ts("nextLocked") : ts("nextNotFound"), true);
  }
  async function goToNextChapter() {
    if (site.inPage) return advanceInPage();
    prefetchNextChapter();
    if (!nextChapter) {
      setStatus(ts("chapterDone"));
      return;
    }
    var target = nextChapter;
    nextChapter = null;
    setStatus(ts("nextLoading"));
    stopContentObserver();
    var loaded;
    try {
      loaded = await target.promise;
    } catch (e) {
      console.error("[zenTTS] next chapter:", e.message || e);
      if (e.status === 404 || e.status === 410) {
        setStatus(ts("nextFailed"), true);
        return;
      }
      try {
        await browser.storage.local.set({ pendingAutoplay: { url: target.url, ts: Date.now() } });
      } catch (_) {
      }
      window.location.href = target.url;
      return;
    }
    var live = site.container(document);
    if (!live) {
      window.location.href = target.url;
      return;
    }
    var fresh = document.importNode(loaded.container, true);
    live.replaceWith(fresh);
    history.pushState(null, "", loaded.url);
    if (loaded.doc.title) document.title = loaded.doc.title;
    chapterDoc = loaded.doc;
    chapterUrl = new URL(loaded.url);
    prepared = false;
    clearHighlight();
    fresh.scrollIntoView({ behavior: "smooth", block: "start" });
    startReading(0);
  }
  async function checkPendingAutoplay() {
    try {
      var got = await browser.storage.local.get("pendingAutoplay");
      var p = got.pendingAutoplay;
      if (!p) return;
      await browser.storage.local.remove("pendingAutoplay");
      var target = new URL(p.url);
      if (target.hostname !== window.location.hostname || Date.now() - p.ts > 12e4) return;
      setStatus(ts("pressRead"));
      startReading(0);
    } catch (_) {
    }
  }
  var contentObserver = null;
  var observedLength = 0;
  function startContentObserver() {
    stopContentObserver();
    if (site.id !== "webnovel" && site.id !== "generic") return;
    var target = site.container(document) || document.body;
    var root = site.inPage ? target : target.parentElement || document.body;
    observedLength = paragraphs.length;
    contentObserver = new MutationObserver(function() {
      checkForNewParagraphs(root);
    });
    contentObserver.observe(root, { childList: true, subtree: true });
  }
  function stopContentObserver() {
    if (contentObserver) {
      contentObserver.disconnect();
      contentObserver = null;
    }
  }
  var checking = false;
  async function checkForNewParagraphs(root) {
    if (checking) return;
    checking = true;
    try {
      var known = new Set(chapterEls);
      paragraphs.forEach(function(p) {
        known.add(p.el);
      });
      var fresh = [];
      root.querySelectorAll("p").forEach(function(el) {
        if (known.has(el) || isHidden(el)) return;
        var text = cleanText(el.innerText || el.textContent || "");
        if (text.length >= 20) fresh.push({ el, text });
      });
      if (!fresh.length) return;
      fresh.forEach(function(p) {
        chapterEls.add(p.el);
      });
      fresh = await translateMore(fresh);
      var base = paragraphs.length;
      paragraphs.push.apply(paragraphs, fresh);
      var more = [];
      fresh.forEach(function(p, i) {
        more.push.apply(more, sentencesOf(p.text, base + i));
      });
      player.append(more);
      updatePreviewSentences();
    } finally {
      checking = false;
    }
  }
  var picking = false;
  function pickStyle(on) {
    var id = "zentts-pick-style";
    var el = document.getElementById(id);
    if (on && !el) {
      el = document.createElement("style");
      el.id = id;
      el.textContent = "html.zentts-picking, html.zentts-picking * { cursor: crosshair !important; }";
      (document.head || document.documentElement).appendChild(el);
    }
    document.documentElement.classList.toggle("zentts-picking", on);
  }
  function fromPanel(e) {
    var host = document.getElementById("tts-zen-host");
    return host && e.composedPath && e.composedPath().includes(host);
  }
  function sentenceUnder(e) {
    var i = sentenceAtPoint(e.clientX, e.clientY, paragraphs, sentences);
    return i;
  }
  function onPickMove(e) {
    if (fromPanel(e)) {
      clearPick();
      return;
    }
    var i = sentenceUnder(e);
    if (i < 0) {
      clearPick();
      return;
    }
    var s = sentences[i];
    showPick(paragraphs[s.refIdx].el, s.text, s.hint);
  }
  function onPickClick(e) {
    if (fromPanel(e)) return;
    e.preventDefault();
    e.stopPropagation();
    var i = sentenceUnder(e);
    endPick();
    if (i >= 0) {
      resumeAt = null;
      setResume(null);
      player.start(i, st().currentEngine || "native");
    }
  }
  function onPickKey(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      endPick();
      setStatus(ts("ready"));
    }
  }
  function endPick() {
    if (!picking) return;
    picking = false;
    setPickActive(false);
    pickStyle(false);
    clearPick();
    document.removeEventListener("mousemove", onPickMove, true);
    document.removeEventListener("click", onPickClick, true);
    document.removeEventListener("keydown", onPickKey, true);
  }
  async function togglePick() {
    if (picking) {
      endPick();
      setStatus(ts("ready"));
      return;
    }
    if (!prepared) {
      setStatus(ts("starting"));
      if (!await prepareChapter()) {
        setStatus(ts("noTextFound"), true);
        return;
      }
    }
    if (player.state === "playing") player.pause();
    picking = true;
    setPickActive(true);
    pickStyle(true);
    setStatus(ts("picking"));
    document.addEventListener("mousemove", onPickMove, true);
    document.addEventListener("click", onPickClick, true);
    document.addEventListener("keydown", onPickKey, true);
  }
  browser.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.action === "tr_progress") setTranslateProgress(msg.fraction);
  });
  var restartOnResume = false;
  function handlePause() {
    if (player.state === "playing") player.pause();
    else if (player.state === "paused") {
      if (restartOnResume) {
        restartOnResume = false;
        player.start(player.index, st().currentEngine || "native");
      } else player.resume();
    }
  }
  function applyVoiceChange() {
    if (player.state === "playing") player.start(player.index, st().currentEngine || "native");
    else if (player.state === "paused") restartOnResume = true;
  }
  function handleStop() {
    restartOnResume = false;
    stopContentObserver();
    player.stop();
    clearHighlight();
    flushProgress();
    setStatus(ts("stopped"));
    offerResume();
  }
  function handlePrev() {
    if (player.index >= 0) player.jump(player.index - 1);
  }
  function handleNext() {
    if (player.index >= 0) player.jump(player.index + 1);
  }
  var panelReady = null;
  function injectPanel() {
    const host = document.createElement("div");
    host.id = "tts-zen-host";
    host.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    return createPanel(shadow, {
      onRead: handleRead,
      onRestart: handleRestart,
      onPause: handlePause,
      onStop: handleStop,
      onPrev: handlePrev,
      onNext: handleNext,
      onRate: function(r) {
        player.setRate(r);
      },
      onPick: togglePick,
      onTranslate: onTranslateChoice,
      onVoice: applyVoiceChange,
      onEngine: applyVoiceChange,
      onInlineTr: function(on) {
        if (!on) {
          hideCaption();
          return;
        }
        var s = sentences[player.index];
        if (chapterTranslation && s && player.state !== "idle" && paragraphs[s.refIdx]) showCaption(paragraphs[s.refIdx].el, s.text, s.words);
      },
      // A different "read in" language applies from the next reading
      onReadLang: function() {
        if (player.state === "idle") {
          prepared = false;
          st().speechLang = null;
        }
      }
    }).then(function() {
      offerResume();
      checkPendingAutoplay();
      pruneProgress();
    });
  }
  function whenBody() {
    return new Promise(function(r) {
      (function wait() {
        if (document.body) r();
        else requestAnimationFrame(wait);
      })();
    });
  }
  async function showPanel() {
    if (!panelReady) {
      panelReady = whenBody().then(injectPanel);
      window.addEventListener("pagehide", flushProgress);
      window.addEventListener("popstate", function() {
        if (chapterUrl.href !== window.location.href) window.location.reload();
      });
    } else {
      await panelReady;
      setPanelVisible(true);
    }
  }
  async function hidePanel() {
    if (!panelReady) return;
    await panelReady;
    endPick();
    if (player.state !== "idle") handleStop();
    setPanelVisible(false);
  }
  window.addEventListener("zentts-seek", function(e) {
    if (player.state === "idle" || !e.detail) return;
    var p = paragraphs.findIndex(function(x) {
      return x.el === e.detail.el;
    });
    if (p < 0) return;
    var i = sentences.findIndex(function(s) {
      return s.refIdx === p;
    });
    if (i >= 0) player.jump(i);
  });
  browser.runtime.onMessage.addListener(function(msg) {
    if (msg && msg.action === "panel_toggle") {
      if (msg.on) showPanel();
      else hidePanel();
    }
  });
  async function boot() {
    if (embed) {
      showPanel();
      return;
    }
    if (RESTRICTED_PROTOCOLS.includes(window.location.protocol) || window.top !== window) return;
    var state2 = null;
    try {
      state2 = await browser.runtime.sendMessage({ action: "panel_state" });
    } catch (_) {
    }
    if (state2 && state2.on) showPanel();
  }
  boot();
})();
