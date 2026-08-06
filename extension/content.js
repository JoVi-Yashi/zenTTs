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
          var pageCacheHtml = page.innerHTML;
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
              page.innerHTML = pageCacheHtml;
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
            tmp.innerHTML = noscript.innerHTML;
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
            var caption = table.getElementsByTagName("caption")[0];
            if (caption && caption.childNodes.length) {
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
            var paragraphs = articleContent.getElementsByTagName("p");
            if (paragraphs.length) {
              metadata.excerpt = paragraphs[0].textContent.trim();
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

  // src/panel.js
  var PANEL_HTML = `
<div id="tts-zen-panel">
  <div id="tts-zen-header">
    <div id="tts-zen-header-left">
      <button id="tts-zen-minimize" title="Minimizar">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
      <span id="tts-zen-logo">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
        TTS-zen
      </span>
    </div>
    <div id="tts-zen-header-right">
      <button id="tts-zen-preview-btn" title="Ver texto extra\xEDdo">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      </button>
      <button id="tts-zen-sites-btn" title="Gestionar sitios">
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
    </div>
  </div>

  <div id="tts-zen-body">
    <div id="tts-zen-settings" class="collapsed">
      <div class="setting-row">
        <label>Voz</label>
        <div class="select-wrap">
          <select id="tts-zen-voice"></select>
        </div>
      </div>
      <div class="setting-row">
        <label>Motor</label>
        <div class="select-wrap">
          <select id="tts-zen-engine">
            <option value="native">Nativo (Browser)</option>
            <option value="server">Neural (edge-tts)</option>
          </select>
        </div>
      </div>
      <div class="setting-row">
        <label id="tts-zen-lang-label">Idioma</label>
        <div class="select-wrap">
          <select id="tts-zen-lang">
            <option value="es">Espa\xF1ol</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <div class="setting-row">
        <label>Velocidad</label>
        <div class="speed-group">
          <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
          <span id="tts-zen-speed-label">1.0x</span>
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

    <div id="tts-zen-controls">
      <button id="tts-zen-read" class="primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="5,3 19,12 5,21"></polygon>
        </svg>
        Leer
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
    </div>

    <div id="tts-zen-status">Listo</div>
  </div>
</div>

<div id="tts-zen-collapsed" class="hidden">
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
        <button class="preview-tool" data-font="serif" title="Serif">Serif</button>
        <button class="preview-tool active" data-font="sans" title="Sans">Sans</button>
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
      <span>Sitios</span>
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
:host { all: initial; }

#tts-zen-panel {
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 290px;
  background: linear-gradient(145deg, #14142b 0%, #1a1a35 100%);
  border: 1px solid rgba(167,139,250,0.12); border-radius: 16px;
  color: #d1d5db;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 13px;
  box-shadow: 0 0 0 1px rgba(167,139,250,0.05), 0 8px 40px rgba(0,0,0,0.5);
  user-select: none; overflow: hidden;
  animation: panel-in .3s cubic-bezier(0.16,1,0.3,1);
  transition: all .35s cubic-bezier(0.4,0,0.2,1), border-color .3s ease;
}
#tts-zen-panel.collapsed {
  width: 44px; height: 44px; border-radius: 50%;
  padding: 0; min-width: 0;
}
#tts-zen-panel.collapsed #tts-zen-header { padding: 0; border-bottom: none; }
#tts-zen-panel.collapsed #tts-zen-body { display: none; }
#tts-zen-panel.collapsed #tts-zen-logo span,
#tts-zen-panel.collapsed #tts-zen-logo svg:not(#tts-zen-mini-icon),
#tts-zen-panel.collapsed #tts-zen-header-right,
#tts-zen-panel.collapsed #tts-zen-minimize svg { display: none; }
#tts-zen-panel.collapsed #tts-zen-minimize {
  width: 44px; height: 44px; border-radius: 50%; background: transparent;
}
#tts-zen-panel.collapsed:hover {
  box-shadow: 0 0 0 1px rgba(167,139,250,0.15), 0 8px 30px rgba(124,58,237,0.3);
}

@keyframes panel-in { from { opacity:0; transform: translateY(12px) scale(0.96); } to { opacity:1; transform: translateY(0) scale(1); } }

#tts-zen-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
#tts-zen-header-left, #tts-zen-header-right { display: flex; align-items: center; gap: 6px; }

#tts-zen-minimize {
  display: flex; align-items: center; justify-content: center;
  width: 12px; height: 12px; border-radius: 50%;
  background: #fbbf24; border: none; cursor: pointer;
  padding: 0; position: relative;
  transition: all .15s ease;
}
#tts-zen-minimize svg { opacity: 0; transition: opacity .15s ease; }
#tts-zen-minimize:hover { background: #f59e0b; }
#tts-zen-minimize:hover svg { opacity: 1; }

#tts-zen-logo {
  display: flex; align-items: center; gap: 6px;
  font-weight: 600; font-size: 12px; color: #a78bfa;
}

#tts-zen-header-right button {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; background: transparent;
  border: 1px solid transparent; border-radius: 7px; color: #6b7280; cursor: pointer;
  transition: all .2s ease;
}
#tts-zen-header-right button:hover {
  background: rgba(167,139,250,0.1); border-color: rgba(167,139,250,0.2); color: #a78bfa;
}
#tts-zen-settings-btn:hover { transform: rotate(30deg); }

#tts-zen-body { transition: opacity .3s ease; }

#tts-zen-settings {
  padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex; flex-direction: column; gap: 8px;
}
#tts-zen-settings.collapsed { display: none; }

.setting-row { display: flex; align-items: center; gap: 8px; }
.setting-row label { min-width: 60px; font-size: 11px; color: #9ca3af; font-weight: 500; }

.select-wrap { flex: 1; position: relative; }
.select-wrap select {
  width: 100%; padding: 5px 8px; border-radius: 6px;
  border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04);
  color: #d1d5db; font-size: 11px; cursor: pointer; outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='9' height='5' viewBox='0 0 9 5' fill='none'%3E%3Cpath d='M1 1l3.5 3L8 1' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 7px center; padding-right: 22px;
}
.select-wrap select:hover { border-color: rgba(167,139,250,0.3); }
.select-wrap select:focus { border-color: #a78bfa; background: rgba(167,139,250,0.06); }

.speed-group { display: flex; align-items: center; gap: 6px; flex: 1; }
.speed-group input[type="range"] {
  flex: 1; height: 4px; appearance: none; background: rgba(255,255,255,0.08);
  border-radius: 2px; outline: none; cursor: pointer;
}
.speed-group input[type="range"]::-webkit-slider-thumb {
  appearance: none; width: 14px; height: 14px; border-radius: 50%;
  background: #a78bfa; cursor: pointer; border: 2px solid #1a1a35;
  box-shadow: 0 2px 8px rgba(167,139,250,0.4);
  transition: transform .15s ease;
}
.speed-group input[type="range"]::-webkit-slider-thumb:hover { transform: scale(1.15); }
#tts-zen-speed-label {
  font-size: 11px; color: #a78bfa; font-weight: 600; min-width: 30px; text-align: right;
}

#tts-zen-counter {
  text-align: center; padding: 10px 12px 4px;
  font-size: 12px; color: #6b7280; font-weight: 500;
}

#tts-zen-nav {
  display: flex; justify-content: center; gap: 14px; padding: 0 12px 6px;
}
#tts-zen-nav button {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 26px; background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08); border-radius: 6px;
  color: #9ca3af; cursor: pointer; transition: all .2s ease;
}
#tts-zen-nav button:hover:not(:disabled) {
  background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); color: #a78bfa;
}
#tts-zen-nav button:disabled { opacity: 0.25; cursor: not-allowed; }

#tts-zen-controls {
  display: flex; gap: 5px; padding: 0 12px 8px;
}
#tts-zen-controls button {
  display: flex; align-items: center; justify-content: center; gap: 4px;
  flex: 1; padding: 7px 8px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 8px; background: rgba(255,255,255,0.04); color: #d1d5db;
  font-size: 11px; font-weight: 500; cursor: pointer;
  transition: all .2s cubic-bezier(0.4,0,0.2,1); outline: none;
}
#tts-zen-controls button:hover:not(:disabled) {
  background: rgba(255,255,255,0.08); border-color: rgba(167,139,250,0.3); transform: translateY(-1px);
}
#tts-zen-controls button:active:not(:disabled) { transform: translateY(0) scale(0.97); }
#tts-zen-controls button:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
#tts-zen-controls button.primary {
  background: #7c3aed; border-color: #7c3aed; color: #fff; font-weight: 600;
  box-shadow: 0 2px 12px rgba(124,58,237,0.3);
}
#tts-zen-controls button.primary:hover:not(:disabled) {
  background: #8b5cf6; box-shadow: 0 4px 20px rgba(124,58,237,0.45);
}

#tts-zen-status {
  padding: 2px 12px 8px; font-size: 11px; color: #6b7280; text-align: center;
}
#tts-zen-status.error { color: #f87171; }

/* Collapsed state */
#tts-zen-collapsed {
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(145deg, #7c3aed, #6d28d9);
  border: none; display: flex; align-items: center; justify-content: center;
  color: #fff; cursor: pointer;
  box-shadow: 0 4px 16px rgba(124,58,237,0.4);
  transition: all .2s ease;
  animation: bump-in .3s cubic-bezier(0.16,1,0.3,1);
}
#tts-zen-collapsed.hidden { display: none; }
#tts-zen-collapsed:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 24px rgba(124,58,237,0.55);
}
@keyframes bump-in { from { opacity:0; transform: scale(0.5); } to { opacity:1; transform: scale(1); } }

/* Preview modal */
#tts-zen-preview-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  animation: fade-in .2s ease;
}
#tts-zen-preview-overlay.hidden { display: none; }
@keyframes fade-in { from { opacity:0; } to { opacity:1; } }

#tts-zen-preview-modal {
  width: 480px; max-width: 90vw; max-height: 80vh;
  background: #1a1a35; border: 1px solid rgba(167,139,250,0.15);
  border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  animation: modal-in .25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes modal-in { from { opacity:0; transform: scale(0.95) translateY(10px); } to { opacity:1; transform: scale(1) translateY(0); } }

#tts-zen-preview-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 14px; border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-wrap: wrap; gap: 6px;
}
#tts-zen-preview-header span { font-weight: 600; color: #a78bfa; font-size: 13px; }
#tts-zen-preview-tools {
  display: flex; align-items: center; gap: 4px;
}
.preview-tool {
  padding: 3px 7px; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 5px; background: rgba(255,255,255,0.04);
  color: #9ca3af; font-size: 10px; cursor: pointer;
  transition: all .15s ease; font-family: inherit;
}
.preview-tool:hover { background: rgba(167,139,250,0.12); border-color: rgba(167,139,250,0.25); color: #d1d5db; }
.preview-tool.active { background: rgba(167,139,250,0.18); border-color: #a78bfa; color: #a78bfa; }
.tool-sep { width: 1px; height: 16px; background: rgba(255,255,255,0.08); margin: 0 2px; }

/* ---- Site Tags ---- */
.sites-section { align-items: flex-start !important; }
#tts-zen-sites {
  display: flex; flex-wrap: wrap; gap: 5px; flex: 1;
}
.site-tag {
  display: flex; align-items: center; gap: 5px;
  padding: 4px 9px; border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  background: rgba(255,255,255,0.03);
  color: #6b7280; font-size: 10px; font-weight: 500;
  transition: all .2s ease; cursor: default;
}
.site-tag.active {
  border-color: rgba(167,139,250,0.2);
  background: rgba(167,139,250,0.08);
  color: #a78bfa;
}
.site-icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(167,139,250,0.15); font-size: 10px; font-weight: 700;
}
.site-tag.active .site-icon { background: rgba(167,139,250,0.3); }
#tts-zen-preview-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; background: transparent; border: none;
  border-radius: 8px; color: #6b7280; cursor: pointer;
  transition: all .15s ease;
}
#tts-zen-preview-close:hover { background: rgba(255,255,255,0.08); color: #d1d5db; }

#tts-zen-preview-content {
  flex: 1; overflow-y: auto; padding: 18px;
  font-size: 13px; line-height: 1.8; color: #9ca3af;
  white-space: pre-wrap;
}
#tts-zen-preview-content::-webkit-scrollbar { width: 4px; }
#tts-zen-preview-content::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.2); border-radius: 2px; }

#tts-zen-preview-content .sentence {
  transition: background .25s ease, color .3s ease;
  border-radius: 3px; padding: 1px 2px;
}
#tts-zen-preview-content .sentence.active {
  background: rgba(167,139,250,0.22); color: #f3f4f6;
}
#tts-zen-preview-content .sentence.played { color: #6b7280; }

/* ---- Sites Modal ---- */
#tts-zen-sites-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;
  animation: fade-in .2s ease;
}
#tts-zen-sites-overlay.hidden { display: none; }
#tts-zen-sites-modal {
  width: 360px; max-width: 90vw; background: #1a1a35;
  border: 1px solid rgba(167,139,250,0.15); border-radius: 16px; overflow: hidden;
  box-shadow: 0 16px 48px rgba(0,0,0,0.6);
  animation: modal-in .25s cubic-bezier(0.16,1,0.3,1);
}
#tts-zen-sites-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.06);
}
#tts-zen-sites-header span { font-weight: 600; color: #a78bfa; font-size: 14px; }
#tts-zen-sites-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; background: transparent; border: none;
  border-radius: 8px; color: #6b7280; cursor: pointer; transition: all .15s ease;
}
#tts-zen-sites-close:hover { background: rgba(255,255,255,0.08); color: #d1d5db; }
#tts-zen-sites-list { padding: 12px 18px; display: flex; flex-direction: column; gap: 6px; max-height: 50vh; overflow-y: auto; }

.site-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all .2s ease;
}
.site-row:hover { border-color: rgba(167,139,250,0.2); background: rgba(167,139,250,0.04); }
.site-row-left { display: flex; align-items: center; gap: 10px; }
.site-row-icon {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px;
  background: rgba(167,139,250,0.12); color: #a78bfa;
  font-size: 13px; font-weight: 700;
}
.site-row-info { display: flex; flex-direction: column; }
.site-row-name { font-size: 13px; color: #d1d5db; font-weight: 500; }
.site-row-domain { font-size: 10px; color: #6b7280; }
.site-toggle {
  width: 42px; height: 24px; border-radius: 12px; border: none;
  cursor: pointer; position: relative; background: rgba(255,255,255,0.1);
  transition: background .2s ease; flex-shrink: 0;
}
.site-toggle.on { background: #7c3aed; }
.site-toggle::after {
  content: ''; position: absolute; top: 2px; left: 2px;
  width: 20px; height: 20px; border-radius: 50%; background: #fff;
  transition: transform .2s ease;
}
.site-toggle.on::after { transform: translateX(18px); }

#tts-zen-add-site-input:focus { border-color: #a78bfa !important; }
#tts-zen-add-site-btn:hover { background: rgba(167,139,250,0.2) !important; }
`;
  var T = {
    es: {
      minimize: "Minimizar",
      preview: "Ver texto extra\xEDdo",
      sites: "Gestionar sitios",
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
      sitesModal: "Sitios",
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
      mono: "Mono"
    },
    en: {
      minimize: "Minimize",
      preview: "View extracted text",
      sites: "Manage sites",
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
      sitesModal: "Sites",
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
      mono: "Mono"
    }
  };
  function t(key) {
    return (T[state.lang] || T["es"])[key] || key;
  }
  var state = {
    voices: [],
    currentVoice: "es-ES-AlvaroNeural",
    currentRate: 1,
    currentEngine: "native",
    lang: "es"
  };
  async function loadSettings() {
    try {
      const stored = await browser.storage.local.get(["voice", "rate", "engine", "lang"]);
      if (stored.voice) state.currentVoice = stored.voice;
      if (stored.rate) state.currentRate = stored.rate;
      if (stored.engine) state.currentEngine = stored.engine;
      if (stored.lang) state.lang = stored.lang;
    } catch (_) {
    }
  }
  async function saveSettings() {
    try {
      await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate, engine: state.currentEngine, lang: state.lang });
    } catch (_) {
    }
  }
  async function loadVoices() {
    if (state.currentEngine === "server") {
      await loadServerVoices();
      return;
    }
    var voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      state.voices = voices.map(function(v) {
        return { name: v.name, lang: v.lang, voiceURI: v.voiceURI, default: v.default };
      });
      populateVoiceDropdown();
      return;
    }
    speechSynthesis.onvoiceschanged = function() {
      if (state.currentEngine !== "native") return;
      var v = speechSynthesis.getVoices();
      state.voices = v.map(function(x) {
        return { name: x.name, lang: x.lang, voiceURI: x.voiceURI, default: x.default };
      });
      populateVoiceDropdown();
    };
  }
  async function loadServerVoices() {
    var select = getEl("tts-zen-voice");
    if (select) {
      while (select.options.length > 0) select.remove(0);
      var opt = document.createElement("option");
      opt.value = "";
      opt.textContent = t("loadingEdgeVoices");
      select.appendChild(opt);
      select.disabled = true;
    }
    try {
      var resp = await browser.runtime.sendMessage({ action: "get_voices" });
      if (resp.success && resp.voices && resp.voices.length > 0) {
        state.voices = resp.voices.map(function(v) {
          return { name: v.name, lang: v.locale, voiceURI: v.name, default: false };
        });
        populateVoiceDropdown();
        window.__tts_zen_state.serverAvailable = true;
      } else {
        state.voices = [];
        populateVoiceDropdown();
        window.__tts_zen_state.serverAvailable = false;
        if (select) {
          while (select.options.length > 0) select.remove(0);
          var opt2 = document.createElement("option");
          opt2.value = "";
          opt2.textContent = t("serverUnavailable");
          select.appendChild(opt2);
          select.disabled = true;
        }
      }
    } catch (_) {
      state.voices = [];
      populateVoiceDropdown();
      window.__tts_zen_state.serverAvailable = false;
      if (select) {
        while (select.options.length > 0) select.remove(0);
        var opt3 = document.createElement("option");
        opt3.value = "";
        opt3.textContent = t("serverUnavailable");
        select.appendChild(opt3);
        select.disabled = true;
      }
    }
  }
  function populateVoiceDropdown() {
    var select = getEl("tts-zen-voice");
    if (!select) return;
    while (select.options.length > 0) select.remove(0);
    select.disabled = false;
    if (!state.voices || state.voices.length === 0) return;
    var groups = {};
    state.voices.forEach(function(v) {
      var lang = v.lang || "desconocido";
      if (!groups[lang]) groups[lang] = [];
      groups[lang].push(v);
    });
    var langNames = {
      "es-ES": "Espa\xF1ol",
      "es-MX": "Espa\xF1ol (MX)",
      "es-US": "Espa\xF1ol (US)",
      "es": "Espa\xF1ol",
      "en-US": "English",
      "en-GB": "English (UK)",
      "en": "English",
      "fr-FR": "Fran\xE7ais",
      "de-DE": "Deutsch",
      "it-IT": "Italiano",
      "pt-BR": "Portugu\xEAs"
    };
    function langLabel(lang) {
      if (langNames[lang]) return langNames[lang];
      if (lang.startsWith("es-")) return "Espa\xF1ol (" + lang.split("-")[1] + ")";
      if (lang.startsWith("en-")) return "English (" + lang.split("-")[1] + ")";
      return lang;
    }
    Object.keys(groups).sort().forEach(function(lang) {
      var voices = groups[lang];
      var label = langLabel(lang);
      var optgroup = document.createElement("optgroup");
      optgroup.label = label;
      voices.forEach(function(v) {
        var opt = document.createElement("option");
        opt.value = v.name;
        opt.textContent = v.name + (v.default ? " (default)" : "");
        if (v.name === state.currentVoice || v.default) opt.selected = true;
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    });
  }
  function applyLanguage(shadow) {
    var lang = state.lang;
    var labels = {
      "tts-zen-voice-label": "voice",
      "tts-zen-engine-label": "engine",
      "tts-zen-speed-label-text": "speed",
      "tts-zen-lang-label": "langLabel",
      "tts-zen-status": null
    };
    var voiceRow = shadow.querySelector(".setting-row:nth-child(1) label");
    if (voiceRow) voiceRow.textContent = T[lang].voice;
    var engineRow = shadow.querySelector(".setting-row:nth-child(2) label");
    if (engineRow) engineRow.textContent = T[lang].engine;
    var langRow = shadow.querySelector(".setting-row:nth-child(3) label");
    if (langRow) langRow.textContent = T[lang].langLabel;
    var speedRow = shadow.querySelector(".setting-row:nth-child(4) label");
    if (speedRow) speedRow.textContent = T[lang].speed;
    var readBtn = shadow.getElementById("tts-zen-read");
    if (readBtn) readBtn.childNodes[readBtn.childNodes.length - 1].textContent = " " + T[lang].read;
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
    if (engineSelect && engineSelect.options.length >= 2) {
      engineSelect.options[0].textContent = T[lang].engineNative;
      engineSelect.options[1].textContent = T[lang].engineNeural;
    }
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
    for (var i = 0; i < ALL_SITES.length; i++) {
      if (ALL_SITES[i].id === "generic") {
        ALL_SITES[i].name = T[lang].generic;
        ALL_SITES[i].domain = T[lang].otherSites;
      }
    }
    var addInput = shadow.getElementById("tts-zen-add-site-input");
    if (addInput) addInput.placeholder = T[lang].addSitePlaceholder;
    var addBtn = shadow.getElementById("tts-zen-add-site-btn");
    if (addBtn) addBtn.textContent = T[lang].addSite;
    if (shadow.getElementById("tts-zen-sites-overlay") && !shadow.getElementById("tts-zen-sites-overlay").classList.contains("hidden")) {
      renderSitesList();
    }
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
  function setCounter(current, total) {
    const el = getEl("tts-zen-counter");
    if (!el) return;
    el.textContent = t("line") + " " + current + " de " + total;
  }
  function setButtonsEnabled(btns) {
    for (const [action, enabled] of [["read", btns.read], ["pause", btns.pause], ["stop", btns.stop], ["prev", btns.prev], ["next", btns.next]]) {
      const btn = getEl("tts-zen-" + action);
      if (btn) btn.disabled = enabled === false;
    }
  }
  async function createPanel(shadow, handlers) {
    await loadSettings();
    await loadCollapsedState();
    await loadSiteSettings();
    if (!isCurrentSiteAllowed()) {
      var hostEl = document.getElementById("tts-zen-host");
      if (hostEl) hostEl.remove();
      return;
    }
    const style = document.createElement("style");
    style.textContent = PANEL_CSS;
    shadow.appendChild(style);
    const container = document.createElement("div");
    container.innerHTML = PANEL_HTML;
    shadow.appendChild(container);
    const minimizeBtn = shadow.getElementById("tts-zen-minimize");
    minimizeBtn.addEventListener("click", toggleCollapse);
    const collapsedBtn = shadow.getElementById("tts-zen-collapsed");
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
    const voiceSelect = shadow.getElementById("tts-zen-voice");
    voiceSelect.addEventListener("change", function() {
      state.currentVoice = voiceSelect.value;
      window.__tts_zen_state.currentVoice = voiceSelect.value;
      saveSettings();
    });
    const engineSelect = shadow.getElementById("tts-zen-engine");
    engineSelect.value = state.currentEngine;
    engineSelect.addEventListener("change", async function() {
      state.currentEngine = engineSelect.value;
      window.__tts_zen_state.currentEngine = engineSelect.value;
      saveSettings();
      await loadVoices();
    });
    const langSelect = shadow.getElementById("tts-zen-lang");
    langSelect.value = state.lang;
    langSelect.addEventListener("change", function() {
      state.lang = langSelect.value;
      window.__tts_zen_state.lang = langSelect.value;
      saveSettings();
      applyLanguage(shadow);
    });
    const speedSlider = shadow.getElementById("tts-zen-speed");
    const speedLabel = shadow.getElementById("tts-zen-speed-label");
    speedSlider.addEventListener("input", function() {
      state.currentRate = speedSlider.value / 100;
      window.__tts_zen_state.currentRate = state.currentRate;
      speedLabel.textContent = state.currentRate.toFixed(1) + "x";
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
    speedSlider.value = Math.round(state.currentRate * 100);
    speedLabel.textContent = state.currentRate.toFixed(1) + "x";
    loadVoices();
    applyLanguage(shadow);
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
  }
  function renderPreviewContent(content) {
    var sentences = window.__tts_zen_sentences || [];
    content.replaceChildren();
    if (sentences.length > 0) {
      for (var i = 0; i < sentences.length; i++) {
        var p = document.createElement("p");
        p.style.cssText = "margin:0 0 6px 0;line-height:inherit;";
        var span = document.createElement("span");
        span.className = "sentence";
        span.id = "tts-zen-preview-s-" + i;
        span.textContent = sentences[i].text;
        p.appendChild(span);
        content.appendChild(p);
      }
    } else {
      var paragraphs = (lastExtractedText || "Sin texto \u2014 click en Leer primero.").split(/\n\n+/).filter(function(l) {
        return l.trim();
      });
      for (var j = 0; j < paragraphs.length; j++) {
        var p2 = document.createElement("p");
        p2.style.cssText = "margin:0 0 10px 0;line-height:inherit;";
        p2.textContent = paragraphs[j].trim();
        content.appendChild(p2);
      }
    }
  }
  function hidePreview() {
    const overlay = getEl("tts-zen-preview-overlay");
    if (overlay) overlay.classList.add("hidden");
  }
  var previewFont = "sans";
  var previewSize = 14;
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
    btn.insertAdjacentHTML("beforeend", isPlaying ? PAUSE_ICON : PLAY_ICON);
  }
  var ALL_SITES = [
    { id: "wattpad.com", name: "Wattpad", domain: "wattpad.com" },
    { id: "archiveofourown.org", name: "AO3", domain: "archiveofourown.org" },
    { id: "fanfiction.net", name: "FanFiction", domain: "fanfiction.net" },
    { id: "webnovel.com", name: "Webnovel", domain: "webnovel.com" },
    { id: "generic", name: "Gen\xE9rico", domain: "otros sitios" }
  ];
  var fallbackIcons = {
    "wattpad.com": "icons/sites/wattpad.svg",
    "archiveofourown.org": "icons/sites/ao3.svg",
    "fanfiction.net": "icons/sites/fanfiction.svg",
    "webnovel.com": "icons/sites/webnovel.svg"
  };
  function faviconUrl(domain) {
    if (domain === "otros sitios") return "";
    return "https://www.google.com/s2/favicons?domain=" + domain + "&sz=32";
  }
  function faviconFallback(domain) {
    return fallbackIcons[domain] || "";
  }
  var enabledSites = {};
  async function loadSiteSettings() {
    try {
      var stored = await browser.storage.local.get(["enabledSites", "customSites"]);
      if (stored.enabledSites) {
        enabledSites = stored.enabledSites;
      } else {
        ALL_SITES.forEach(function(s) {
          enabledSites[s.id] = true;
        });
      }
      if (stored.customSites) {
        stored.customSites.forEach(function(s) {
          if (!ALL_SITES.some(function(x) {
            return x.id === s.id;
          })) {
            ALL_SITES.push(s);
            if (enabledSites[s.id] === void 0) enabledSites[s.id] = true;
          }
        });
      }
      window.__tts_zen_enabled_sites = enabledSites;
    } catch (_) {
      ALL_SITES.forEach(function(s) {
        enabledSites[s.id] = true;
      });
      window.__tts_zen_enabled_sites = enabledSites;
    }
  }
  async function saveSiteSettings() {
    var custom = ALL_SITES.filter(function(s) {
      return !["wattpad.com", "archiveofourown.org", "fanfiction.net", "webnovel.com", "generic"].includes(s.id);
    });
    try {
      await browser.storage.local.set({ enabledSites, customSites: custom });
    } catch (_) {
    }
    window.__tts_zen_enabled_sites = enabledSites;
  }
  function renderSitesList() {
    var list = getEl("tts-zen-sites-list");
    if (!list) return;
    list.replaceChildren();
    ALL_SITES.forEach(function(site) {
      var enabled = enabledSites[site.id] !== false;
      var row = document.createElement("div");
      row.className = "site-row";
      var left = document.createElement("div");
      left.className = "site-row-left";
      if (site.id === "generic") {
        var iconDiv = document.createElement("div");
        iconDiv.className = "site-row-icon";
        iconDiv.style.fontSize = "16px";
        iconDiv.textContent = "+";
        left.appendChild(iconDiv);
      } else {
        var iconImg = document.createElement("img");
        iconImg.className = "site-row-icon";
        iconImg.src = faviconUrl(site.domain);
        iconImg.width = 24;
        iconImg.height = 24;
        iconImg.style.borderRadius = "4px";
        iconImg.onerror = function() {
          var fb = faviconFallback(site.id);
          if (fb) this.src = fb;
        };
        left.appendChild(iconImg);
      }
      var info = document.createElement("div");
      info.className = "site-row-info";
      var nameEl = document.createElement("div");
      nameEl.className = "site-row-name";
      nameEl.textContent = site.name;
      var domainEl = document.createElement("div");
      domainEl.className = "site-row-domain";
      domainEl.textContent = site.domain;
      info.appendChild(nameEl);
      info.appendChild(domainEl);
      left.appendChild(info);
      row.appendChild(left);
      var toggle = document.createElement("button");
      toggle.className = "site-toggle" + (enabled ? " on" : "");
      toggle.dataset.site = site.id;
      row.appendChild(toggle);
      toggle.addEventListener("click", function() {
        var siteId = this.dataset.site;
        enabledSites[siteId] = !(enabledSites[siteId] !== false);
        this.classList.toggle("on", enabledSites[siteId] !== false);
        saveSiteSettings();
      });
      list.appendChild(row);
    });
    var addRow = document.createElement("div");
    addRow.className = "site-row";
    addRow.style.cssText = "padding:6px 10px;gap:8px;";
    var input = document.createElement("input");
    input.id = "tts-zen-add-site-input";
    input.type = "text";
    input.placeholder = t("addSitePlaceholder");
    input.style.cssText = "flex:1;padding:6px 8px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#d1d5db;font-size:11px;outline:none";
    var addBtn = document.createElement("button");
    addBtn.id = "tts-zen-add-site-btn";
    addBtn.textContent = t("addSite");
    addBtn.style.cssText = "padding:6px 12px;border-radius:6px;border:1px solid rgba(167,139,250,0.3);background:rgba(167,139,250,0.1);color:#a78bfa;font-size:11px;cursor:pointer;white-space:nowrap";
    addRow.appendChild(input);
    addRow.appendChild(addBtn);
    list.appendChild(addRow);
    addBtn.addEventListener("click", function() {
      var domain = input.value.trim().toLowerCase();
      if (!domain || domain === "otros sitios") return;
      domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      if (!domain.includes(".")) return;
      if (ALL_SITES.some(function(s) {
        return s.id === domain;
      })) return;
      ALL_SITES.push({ id: domain, name: domain.split(".")[0], domain });
      enabledSites[domain] = true;
      saveSiteSettings();
      input.value = "";
      renderSitesList();
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") addBtn.click();
    });
  }
  function showSitesModal() {
    renderSitesList();
    var overlay = getEl("tts-zen-sites-overlay");
    if (overlay) overlay.classList.remove("hidden");
  }
  function hideSitesModal() {
    var overlay = getEl("tts-zen-sites-overlay");
    if (overlay) overlay.classList.add("hidden");
  }
  function isCurrentSiteAllowed() {
    var sites = window.__tts_zen_enabled_sites || enabledSites;
    var host = window.location.hostname;
    for (var siteId in sites) {
      if (siteId === "generic") continue;
      if (host.includes(siteId)) return sites[siteId] !== false;
    }
    return sites["generic"] !== false;
  }

  // src/content.js
  var RESTRICTED_PROTOCOLS = ["edge:", "about:", "file:", "chrome:", "moz-extension:"];
  function shouldInject() {
    var proto = window.location.protocol;
    if (RESTRICTED_PROTOCOLS.includes(proto)) return false;
    var sites = window.__tts_zen_enabled_sites || {};
    var host = window.location.hostname;
    for (var siteId in sites) {
      if (siteId === "generic") continue;
      if (host.includes(siteId)) {
        return sites[siteId] !== false;
      }
    }
    return sites["generic"] !== false;
  }
  function extractTextWithRefs() {
    const result = { text: "", refs: [] };
    for (const site of SITE_EXTRACTORS) {
      if (site.test && site.test()) {
        const text = site.extract();
        if (text && text.trim().length > 50) {
          return { text, refs: [] };
        }
      }
    }
    return mapParagraphsToText();
  }
  function mapParagraphsToText() {
    const result = { text: "", refs: [] };
    const candidates = document.querySelectorAll(
      "p, pre, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, div.story-text p, .userstuff p, .chapter-content p"
    );
    if (candidates.length === 0) {
      const body = document.body;
      if (body && body.innerText) {
        result.text = body.innerText;
        result.refs.push({ el: body, start: 0, end: body.innerText.length });
        return result;
      }
      return null;
    }
    let offset = 0;
    for (const el of candidates) {
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const txt = el.textContent.trim();
      if (txt.length < 2) continue;
      result.text += txt + "\n\n";
      const start = offset;
      const end = start + txt.length;
      result.refs.push({ el, start, end });
      offset = end + 2;
    }
    if (!result.text.trim()) return null;
    result.text = result.text.trim();
    return result;
  }
  var SITE_EXTRACTORS = [
    {
      test: () => window.location.hostname.includes("wattpad.com"),
      extract: () => {
        const paragraphs = document.querySelectorAll(
          ".panel.panel-reading:not(.text-center) pre p[data-p-id]"
        );
        if (paragraphs.length === 0) return null;
        const parts = [];
        for (const p of paragraphs) {
          const txt = p.textContent.trim();
          if (txt.length > 20) parts.push(txt);
        }
        return parts.length > 0 ? parts.join("\n\n") : null;
      }
    },
    {
      test: () => window.location.hostname.includes("archiveofourown.org"),
      extract: () => {
        const chapter = document.querySelector("#chapters .userstuff");
        return chapter?.textContent || null;
      }
    },
    {
      test: () => window.location.hostname.includes("fanfiction.net"),
      extract: () => {
        const story = document.querySelector(".storytext, #storytext");
        return story?.textContent || null;
      }
    },
    {
      test: () => window.location.hostname.includes("webnovel.com"),
      extract: () => {
        const content = document.querySelector('.cha-content, .chapter-content, .read-content, [class*="cha-words"]');
        return content?.textContent || null;
      }
    }
  ];
  var currentHighlight = null;
  function highlightOnPage(refs, charOffset, charLength) {
    if (currentHighlight) {
      for (const el of currentHighlight) {
        el.style.removeProperty("background");
        el.style.removeProperty("outline");
        el.style.removeProperty("border-radius");
      }
      currentHighlight = null;
    }
    const endOffset = charOffset + charLength;
    const matched = [];
    for (const ref of refs) {
      if (ref.start <= endOffset && ref.end >= charOffset) {
        matched.push(ref.el);
      }
    }
    if (matched.length > 0) {
      for (const el of matched) {
        el.style.background = "rgba(167, 139, 250, 0.15)";
        el.style.outline = "2px solid rgba(167, 139, 250, 0.4)";
        el.style.borderRadius = "4px";
        el.style.transition = "background 0.3s ease, outline 0.3s ease";
      }
      matched[0].scrollIntoView({ behavior: "smooth", block: "center" });
      currentHighlight = matched;
    }
  }
  function clearHighlight() {
    if (currentHighlight) {
      for (const el of currentHighlight) {
        el.style.removeProperty("background");
        el.style.removeProperty("outline");
        el.style.removeProperty("border-radius");
      }
      currentHighlight = null;
    }
  }
  var serverAudio = null;
  var serverSentences = [];
  async function startServerPlayback(text) {
    stopSpeech();
    var st = window.__tts_zen_state || {};
    var voice = st.currentVoice || "es-ES-AlvaroNeural";
    var rate = st.currentRate || 1;
    var rateStr = rate >= 1 ? "+" + Math.round((rate - 1) * 100) + "%" : "-" + Math.round((1 - rate) * 100) + "%";
    setStatus(ts("connecting"));
    try {
      var resp = await browser.runtime.sendMessage({ action: "read_page_sync", text, voice, rate: rateStr });
      if (!resp.success) throw new Error(ts("serverError"));
      if (!resp.sentences || resp.sentences.length === 0) throw new Error(ts("noTiming"));
      serverSentences = resp.sentences;
      window.__tts_zen_sentences = serverSentences;
      window.__tts_zen_state.serverAvailable = true;
      sentenceData = serverSentences.map(function(s) {
        return { text: s.text, start: s.start, end: s.end };
      });
      var audioBytes = Uint8Array.from(atob(resp.audio), function(c) {
        return c.charCodeAt(0);
      });
      var blob = new Blob([audioBytes], { type: "audio/mpeg" });
      var url = URL.createObjectURL(blob);
      if (serverAudio) {
        serverAudio.pause();
        URL.revokeObjectURL(serverAudio.src);
      }
      serverAudio = new Audio(url);
      serverAudio.playbackRate = rate;
      currentSentenceIdx = 0;
      isSpeaking = true;
      setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
      setPauseIcon(true);
      serverAudio.ontimeupdate = function() {
        if (!isSpeaking || serverSentences.length === 0) return;
        var t2 = serverAudio.currentTime;
        for (var i = currentSentenceIdx; i < serverSentences.length; i++) {
          if (t2 >= serverSentences[i].start && t2 < serverSentences[i].end) {
            if (i !== currentSentenceIdx) {
              currentSentenceIdx = i;
              updateHighlightServer(i);
            }
            break;
          }
        }
      };
      serverAudio.onended = function() {
        isSpeaking = false;
        setStatus(ts("ready"));
        setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
        setPauseIcon(false);
      };
      serverAudio.onerror = function() {
        setStatus(ts("audioError"), true);
        setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
        isSpeaking = false;
      };
      await serverAudio.play();
      setStatus(ts("serverMode"));
    } catch (e) {
      window.__tts_zen_state.serverAvailable = false;
      setStatus(ts("noServer") + " \u2014 usando modo Nativo", true);
      startSpeechPlayback(text);
    }
  }
  function updateHighlightServer(idx) {
    if (idx < 0 || idx >= serverSentences.length) return;
    setCounter(idx + 1, serverSentences.length);
    var host = document.getElementById("tts-zen-host");
    if (host && host.shadowRoot) {
      var overlay = host.shadowRoot.getElementById("tts-zen-preview-overlay");
      if (overlay && !overlay.classList.contains("hidden")) {
        refreshPreviewContent(host.shadowRoot);
        var prevActive = host.shadowRoot.querySelector("#tts-zen-preview-content .sentence.active");
        if (prevActive) {
          prevActive.classList.remove("active");
          prevActive.classList.add("played");
        }
        var prevEl = host.shadowRoot.getElementById("tts-zen-preview-s-" + idx);
        if (prevEl) {
          prevEl.classList.add("active");
          prevEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
    var s = serverSentences[idx];
    for (var i = 0; i < extractedRefs.length; i++) {
      var ref = extractedRefs[i];
      var refText = ref.el.textContent.trim();
      var pos = refText.indexOf(s.text);
      if (pos !== -1) {
        highlightOnPage([ref], pos, s.text.length);
        return;
      }
    }
  }
  var sentenceData = [];
  var currentSentenceIdx = -1;
  var extractedRefs = [];
  var isSpeaking = false;
  var isPaused = false;
  function splitIntoSentences(text) {
    var parts = text.match(/[^.!?…\n]+[.!?…]*(\n|$)?/g) || [text];
    return parts.map(function(p) {
      return p.trim();
    }).filter(function(p) {
      return p.length > 0;
    });
  }
  function stopSpeech() {
    speechSynthesis.cancel();
    if (serverAudio) {
      serverAudio.pause();
      URL.revokeObjectURL(serverAudio.src);
      serverAudio = null;
    }
    isSpeaking = false;
    isPaused = false;
    currentSentenceIdx = -1;
    clearHighlight();
    window.__tts_zen_sentences = [];
  }
  function speakSentence(idx) {
    if (idx >= sentenceData.length) {
      setStatus(ts("ready"));
      setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
      setPauseIcon(false);
      isSpeaking = false;
      return;
    }
    currentSentenceIdx = idx;
    var text = sentenceData[idx].text;
    var st = window.__tts_zen_state || {};
    var rate = st.currentRate || 1;
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = "es-ES";
    var selectedVoice = st.currentVoice || "";
    if (selectedVoice && _nativeVoices.length > 0) {
      var match = _nativeVoices.find(function(v) {
        return v.name === selectedVoice || v.voiceURI === selectedVoice;
      });
      if (match) utterance.voice = match;
    }
    utterance.onstart = function() {
      updateHighlight(idx);
      setCounter(idx + 1, sentenceData.length);
      setStatus(ts("playing"));
    };
    utterance.onend = function() {
      if (!isSpeaking) return;
      if (isPaused) {
        isSpeaking = false;
        return;
      }
      speakSentence(idx + 1);
    };
    utterance.onerror = function(e) {
      if (e.error === "canceled" || e.error === "interrupted") return;
      setStatus(ts("voiceError") + ": " + e.error, true);
      setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
      isSpeaking = false;
    };
    speechSynthesis.speak(utterance);
  }
  function startSpeechPlayback(text) {
    stopSpeech();
    var rawSentences = splitIntoSentences(text);
    sentenceData = rawSentences.map(function(s, i) {
      return { text: s, start: i, end: i + 1 };
    });
    window.__tts_zen_sentences = sentenceData;
    isSpeaking = true;
    setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
    setPauseIcon(true);
    speakSentence(0);
  }
  function jumpToSentence(idx) {
    if (idx < 0 || idx >= sentenceData.length) return;
    speechSynthesis.cancel();
    isSpeaking = true;
    setButtonsEnabled({ read: false, pause: true, stop: true, prev: true, next: true });
    setPauseIcon(true);
    speakSentence(idx);
  }
  function updateHighlight(idx) {
    if (idx < 0 || idx >= sentenceData.length) return;
    var s = sentenceData[idx];
    var host = document.getElementById("tts-zen-host");
    if (host && host.shadowRoot) {
      var overlay = host.shadowRoot.getElementById("tts-zen-preview-overlay");
      if (overlay && !overlay.classList.contains("hidden")) {
        refreshPreviewContent(host.shadowRoot);
        var prevActive = host.shadowRoot.querySelector("#tts-zen-preview-content .sentence.active");
        if (prevActive) {
          prevActive.classList.remove("active");
          prevActive.classList.add("played");
        }
        var prevEl = host.shadowRoot.getElementById("tts-zen-preview-s-" + idx);
        if (prevEl) {
          prevEl.classList.add("active");
          prevEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }
    }
    for (var i = 0; i < extractedRefs.length; i++) {
      var ref = extractedRefs[i];
      var refText = ref.el.textContent.trim();
      var pos = refText.indexOf(s.text);
      if (pos !== -1) {
        highlightOnPage([ref], pos, s.text.length);
        setCounter(idx + 1, sentenceData.length);
        return;
      }
    }
    setCounter(idx + 1, sentenceData.length);
  }
  function refreshPreviewContent(shadow) {
    var content = shadow.getElementById("tts-zen-preview-content");
    if (!content) return;
    var sentences = window.__tts_zen_sentences || [];
    if (sentences.length === 0) return;
    content.replaceChildren();
    for (var i = 0; i < sentences.length; i++) {
      var p = document.createElement("p");
      p.style.cssText = "margin:0 0 6px 0;line-height:inherit;";
      var span = document.createElement("span");
      span.className = "sentence";
      span.id = "tts-zen-preview-s-" + i;
      span.textContent = sentences[i].text;
      p.appendChild(span);
      content.appendChild(p);
    }
  }
  async function dispatchReadPage(extractFn) {
    var result = extractFn();
    if (!result || !result.text) {
      setStatus(ts("noTextFound"), true);
      return;
    }
    extractedRefs = result.refs || [];
    var text = result.text;
    window.__tts_zen_last_text = text;
    setStatus(ts("starting"));
    var st = window.__tts_zen_state || {};
    if (st.currentEngine === "server") {
      await startServerPlayback(text);
      return;
    }
    startSpeechPlayback(text);
  }
  function handlePause() {
    if (!isSpeaking) return;
    var st = window.__tts_zen_state || {};
    if (st.currentEngine === "server" && serverAudio) {
      if (isPaused) {
        serverAudio.play();
        isPaused = false;
        setStatus(ts("serverMode"));
        setPauseIcon(true);
      } else {
        serverAudio.pause();
        isPaused = true;
        setStatus(ts("paused"));
        setPauseIcon(false);
      }
      return;
    }
    if (isPaused) {
      speechSynthesis.resume();
      isPaused = false;
      setStatus(ts("playing"));
      setPauseIcon(true);
    } else {
      speechSynthesis.pause();
      isPaused = true;
      setStatus(ts("paused"));
      setPauseIcon(false);
    }
  }
  function handleStop() {
    stopSpeech();
    setStatus(ts("stopped"));
    setButtonsEnabled({ read: true, pause: false, stop: false, prev: false, next: false });
    setPauseIcon(false);
  }
  function handlePrev() {
    if (!sentenceData.length) return;
    var st = window.__tts_zen_state || {};
    if (st.currentEngine === "server" && serverAudio) {
      var idx = Math.max(0, currentSentenceIdx - 2);
      serverAudio.currentTime = serverSentences[idx].start;
      currentSentenceIdx = idx;
      updateHighlightServer(idx);
      return;
    }
    var idx = Math.max(0, currentSentenceIdx - 2);
    jumpToSentence(idx);
  }
  function handleNext() {
    if (!sentenceData.length) return;
    var st = window.__tts_zen_state || {};
    if (st.currentEngine === "server" && serverAudio) {
      var idx = Math.min(sentenceData.length - 1, currentSentenceIdx + 1);
      serverAudio.currentTime = serverSentences[idx].start;
      currentSentenceIdx = idx;
      updateHighlightServer(idx);
      return;
    }
    var idx = Math.min(sentenceData.length - 1, currentSentenceIdx + 1);
    jumpToSentence(idx);
  }
  window.__tts_zen_state = { currentVoice: "es-ES-AlvaroNeural", currentRate: 1, currentEngine: "native", serverAvailable: false, lang: "es" };
  function ts(key) {
    var lang = window.__tts_zen_state && window.__tts_zen_state.lang || "es";
    var T2 = {
      es: {
        ready: "Listo",
        playing: "Reproduciendo...",
        connecting: "Conectando al servidor...",
        serverError: "Error del servidor",
        noTiming: "Sin datos de timing",
        audioError: "Error de audio",
        serverMode: "Reproduciendo (edge-tts)...",
        noServer: "Servidor no disponible \u2014 usa modo Nativo",
        noTextFound: "No se encontr\xF3 texto en esta p\xE1gina",
        starting: "Iniciando lectura...",
        paused: "Pausado",
        stopped: "Detenido",
        voiceError: "Error de voz"
      },
      en: {
        ready: "Ready",
        playing: "Playing...",
        connecting: "Connecting to server...",
        serverError: "Server error",
        noTiming: "No timing data",
        audioError: "Audio error",
        serverMode: "Playing (edge-tts)...",
        noServer: "Server unavailable \u2014 switch to Native mode",
        noTextFound: "No text found on this page",
        starting: "Starting playback...",
        paused: "Paused",
        stopped: "Stopped",
        voiceError: "Voice error"
      }
    };
    return (T2[lang] || T2["es"])[key] || key;
  }
  var _nativeVoices = [];
  function ensureVoices() {
    _nativeVoices = speechSynthesis.getVoices();
    if (_nativeVoices.length === 0) {
      speechSynthesis.onvoiceschanged = function() {
        _nativeVoices = speechSynthesis.getVoices();
      };
      var dummy = new SpeechSynthesisUtterance("");
      dummy.volume = 0;
      speechSynthesis.speak(dummy);
    }
  }
  ensureVoices();
  window.__tts_zen_enabled_sites = { "wattpad.com": true, "archiveofourown.org": true, "fanfiction.net": true, "webnovel.com": true, "generic": true };
  function injectPanel() {
    const host = document.createElement("div");
    host.id = "tts-zen-host";
    host.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    createPanel(shadow, {
      onRead: () => dispatchReadPage(extractTextWithRefs),
      onPause: handlePause,
      onStop: handleStop,
      onPrev: handlePrev,
      onNext: handleNext
    });
  }
  function tryInject() {
    if (document.body) {
      injectPanel();
    } else {
      requestAnimationFrame(tryInject);
    }
  }
  if (shouldInject()) {
    tryInject();
  }
})();
