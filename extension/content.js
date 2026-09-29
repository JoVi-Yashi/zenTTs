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
  function fitAccent(accent, background) {
    var target = luminance(background) > 0.4 ? [0, 0, 0] : [255, 255, 255];
    var out = accent;
    for (var t2 = 0.1; contrast(out, background) < 3.2 && t2 <= 1; t2 += 0.1) out = mix(accent, target, t2);
    return out;
  }
  function themeTokens(theme) {
    var c = theme && theme.colors || {};
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

  // src/panel.js
  var ACCENT_PRESETS = ["#9a3b25", "#2f5d8a", "#3f7a4a", "#7a3b6e", "#b07a1c"];
  var PANEL_HTML = `
<div id="tts-zen-panel">
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
      <button id="tts-zen-minimize" title="Minimizar">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </div>
  </div>

  <div id="tts-zen-body">
    <div id="tts-zen-settings" class="collapsed">
      <div class="setting-row">
        <label id="tts-zen-voice-label">Voz</label>
        <div class="select-wrap">
          <select id="tts-zen-voice"></select>
        </div>
      </div>
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
      <div class="setting-row" id="tts-zen-local-row" hidden>
        <label></label>
        <div class="local-dl">
          <button id="tts-zen-local-dl" type="button">Descargar voz</button>
          <span id="tts-zen-local-progress"></span>
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
      <div class="setting-row section-header">
        <span id="tts-zen-translate-title">Traducci\xF3n</span>
      </div>
      <div class="translate-row">
        <select id="tts-zen-lang-in">
          <option value="auto">Auto</option>
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
          <option value="it">IT</option>
          <option value="pt">PT</option>
          <option value="ja">JA</option>
          <option value="ko">KO</option>
          <option value="zh">ZH</option>
          <option value="ru">RU</option>
        </select>
        <span class="translate-arrow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </span>
        <select id="tts-zen-lang-out">
          <option value="es">ES</option>
          <option value="en">EN</option>
          <option value="fr">FR</option>
          <option value="de">DE</option>
          <option value="it">IT</option>
          <option value="pt">PT</option>
          <option value="ja">JA</option>
          <option value="ko">KO</option>
          <option value="zh">ZH</option>
          <option value="ru">RU</option>
        </select>
      </div>
      <div class="setting-row">
        <label id="tts-zen-speed-text">Velocidad</label>
        <div class="speed-group">
          <input type="range" id="tts-zen-speed" min="50" max="300" value="100" step="10">
          <span id="tts-zen-speed-label">1.0x</span>
        </div>
      </div>
      <label class="check-row">
        <input type="checkbox" id="tts-zen-autonext">
        <span id="tts-zen-autonext-label">Seguir con el siguiente cap\xEDtulo</span>
      </label>
      <div class="setting-row section-header">
        <span id="tts-zen-look-title">Aspecto</span>
      </div>
      <label class="check-row">
        <input type="checkbox" id="tts-zen-follow-theme">
        <span id="tts-zen-follow-label">Usar los colores del tema del navegador</span>
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
    </div>

    <div id="tts-zen-resume-row" hidden>
      <button id="tts-zen-restart" type="button">Desde el inicio</button>
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
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 280px;
  background: var(--sheet);
  border: 1px solid var(--rule); border-radius: 6px;
  color: var(--ink);
  font-family: var(--sans); font-size: 13px; line-height: 1.4;
  box-shadow: var(--shadow);
  user-select: none; overflow: hidden;
}
#tts-zen-panel.collapsed { display: none; }

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

#tts-zen-settings {
  padding: 12px 14px; border-bottom: 1px solid var(--rule);
  display: flex; flex-direction: column; gap: 8px;
  max-height: 640px; overflow: hidden;
  transition: max-height .15s ease, padding .15s ease;
}
#tts-zen-settings.collapsed {
  max-height: 0; padding-top: 0; padding-bottom: 0; border-bottom-color: transparent;
}

.setting-row { display: flex; align-items: center; gap: 10px; }
.setting-row label { min-width: 64px; font-size: 12px; color: var(--ink-soft); }

.select-wrap { flex: 1; min-width: 0; }
.select-wrap select, .translate-row select {
  width: 100%; padding: 5px 22px 5px 8px; border-radius: 4px;
  border: 1px solid var(--rule); background-color: var(--paper);
  color: var(--ink); font: 12px var(--sans); cursor: pointer;
  appearance: none;
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

.speed-group { display: flex; align-items: center; gap: 8px; flex: 1; }
.speed-group input[type="range"] { flex: 1; accent-color: var(--ink); cursor: pointer; }
#tts-zen-speed-label {
  font-size: 12px; color: var(--ink); min-width: 32px; text-align: right;
  font-variant-numeric: tabular-nums;
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

.local-dl { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
#tts-zen-local-dl {
  white-space: nowrap; padding: 4px 10px; border-radius: 4px; border: 1px solid var(--ink);
  background: transparent; color: var(--ink); font: 12px var(--sans); cursor: pointer;
}
#tts-zen-local-dl:hover:not(:disabled) { background: var(--hover); }
#tts-zen-local-dl:disabled { opacity: 0.5; cursor: default; }
#tts-zen-local-progress { font-size: 12px; color: var(--ink-soft); font-variant-numeric: tabular-nums; }
.check-row { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-soft); cursor: pointer; }
.check-row input { accent-color: var(--ink); margin: 0; }
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
.accent-hint { margin: -4px 0 0 74px; font: 10px var(--mono); color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

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
  position: fixed; bottom: 24px; right: 24px; z-index: 999999;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--sheet); border: 1px solid var(--rule);
  display: flex; align-items: center; justify-content: center;
  color: var(--ink); cursor: pointer; box-shadow: var(--shadow);
}
#tts-zen-collapsed.hidden { display: none; }
#tts-zen-collapsed:hover { color: var(--accent); }

/* Modals */
#tts-zen-preview-overlay, #tts-zen-sites-overlay {
  position: fixed; inset: 0; z-index: 9999999;
  background: rgba(20,18,15,0.35);
  display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity .15s ease; pointer-events: none;
}
#tts-zen-preview-overlay:not(.hidden), #tts-zen-sites-overlay:not(.hidden) { opacity: 1; pointer-events: auto; }
#tts-zen-preview-overlay.hidden, #tts-zen-sites-overlay.hidden { display: none; }

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
.site-toggle {
  width: 34px; height: 20px; border-radius: 10px; border: none; padding: 0;
  cursor: pointer; position: relative; background: var(--rule); flex-shrink: 0;
  transition: background .15s ease;
}
.site-toggle.on { background: var(--accent); }
.site-toggle::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%; background: var(--sheet);
  transition: transform .15s ease;
}
.site-toggle.on::after { transform: translateX(14px); }

.site-add-row { padding-top: 12px; }
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
  * { transition: none !important; }
}
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
      otherColor: "Otro color"
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
      otherColor: "Other color"
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
    localVoice: "es_ES-davefx-medium",
    autoNext: true,
    accent: "",
    followTheme: true,
    langIn: "auto",
    langOut: "es",
    lang: "es"
  };
  async function loadSettings() {
    try {
      const stored = await browser.storage.local.get(["voice", "rate", "engine", "lang", "langIn", "langOut", "localVoice", "autoNext", "accent", "followTheme"]);
      if (typeof stored.accent === "string") state.accent = stored.accent;
      if (typeof stored.followTheme === "boolean") state.followTheme = stored.followTheme;
      if (stored.localVoice) state.localVoice = stored.localVoice;
      if (typeof stored.autoNext === "boolean") state.autoNext = stored.autoNext;
      if (stored.voice) state.currentVoice = stored.voice;
      if (stored.rate) state.currentRate = stored.rate;
      if (stored.engine) state.currentEngine = stored.engine;
      if (stored.lang) state.lang = stored.lang;
      if (stored.langIn) state.langIn = stored.langIn;
      if (stored.langOut) state.langOut = stored.langOut;
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
    shared.langIn = state.langIn;
    shared.langOut = state.langOut;
    shared.autoNext = state.autoNext;
  }
  async function saveSettings() {
    try {
      await browser.storage.local.set({ voice: state.currentVoice, rate: state.currentRate, engine: state.currentEngine, lang: state.lang, langIn: state.langIn, langOut: state.langOut, localVoice: state.localVoice, autoNext: state.autoNext, accent: state.accent, followTheme: state.followTheme });
    } catch (_) {
    }
  }
  function outLang() {
    return state.langOut && state.langOut !== "auto" ? state.langOut : state.lang;
  }
  async function loadVoices() {
    var localRow = getEl("tts-zen-local-row");
    if (localRow) localRow.hidden = state.currentEngine !== "local";
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
      return { name: v.name, lang: v.lang, default: v.default };
    });
    populateVoiceDropdown("currentVoice");
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
      var lang = state.langOut === "auto" ? "" : outLang() + "-";
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
    var catalog = (resp && resp.catalog || []).filter(function(v) {
      return v.key.toLowerCase().startsWith(prefix) || localStored.includes(v.key);
    });
    if (!catalog.length) catalog = resp && resp.catalog || [];
    state.voices = catalog.map(function(v) {
      var have = localStored.includes(v.key) ? " \xB7 " + t("downloaded") : "";
      return { name: v.key, label: v.name + " (" + v.quality + ")" + have, lang: v.language, size: v.size };
    });
    if (!state.voices.some(function(v) {
      return v.name === state.localVoice;
    })) {
      var firstStored = state.voices.find(function(v) {
        return localStored.includes(v.name);
      });
      if (firstStored) state.localVoice = firstStored.name;
      else if (state.voices.length) state.localVoice = state.voices[0].name;
    }
    populateVoiceDropdown("localVoice");
    updateLocalRow();
  }
  function updateLocalRow() {
    var btn = getEl("tts-zen-local-dl");
    var progress = getEl("tts-zen-local-progress");
    if (!btn || !progress) return;
    var have = localStored.includes(state.localVoice);
    var voice = (state.voices || []).find(function(v) {
      return v.name === state.localVoice;
    });
    var mb = voice && voice.size ? " \xB7 " + Math.round(voice.size / 1048576) + " MB" : "";
    btn.hidden = have;
    btn.disabled = false;
    btn.textContent = t("downloadVoice") + mb;
    progress.textContent = "";
  }
  async function downloadLocalVoice() {
    var btn = getEl("tts-zen-local-dl");
    var progress = getEl("tts-zen-local-progress");
    var voiceId = state.localVoice;
    if (btn) btn.disabled = true;
    if (progress) progress.textContent = t("downloading");
    try {
      var resp = await browser.runtime.sendMessage({ action: "local_download", voiceId });
      if (!resp || !resp.success) throw new Error(resp && resp.error || "download");
      await loadLocalVoices();
    } catch (e) {
      console.error("[zenTTS] download voice:", e.message || e);
      if (btn) btn.disabled = false;
      if (progress) progress.textContent = t("downloadFailed");
    }
  }
  if (typeof browser !== "undefined" && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener(function(msg) {
      if (!msg || msg.action !== "local_progress" || msg.voiceId !== state.localVoice) return;
      var progress = getEl("tts-zen-local-progress");
      if (progress && msg.total) progress.textContent = Math.round(msg.loaded * 100 / msg.total) + " %";
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
    var groups = {};
    state.voices.forEach(function(v) {
      var lang = v.lang || "";
      (groups[lang] = groups[lang] || []).push(v);
    });
    Object.keys(groups).sort().forEach(function(lang) {
      var optgroup = document.createElement("optgroup");
      optgroup.label = langLabel(lang);
      groups[lang].forEach(function(v) {
        var opt = document.createElement("option");
        opt.value = v.name;
        opt.textContent = v.label || v.name;
        opt.selected = v.name === state[key];
        optgroup.appendChild(opt);
      });
      select.appendChild(optgroup);
    });
  }
  function applyLanguage(shadow) {
    var lang = state.lang;
    [
      ["tts-zen-voice-label", "voice"],
      ["tts-zen-engine-label", "engine"],
      ["tts-zen-lang-label", "langLabel"],
      ["tts-zen-translate-title", "translateTitle"],
      ["tts-zen-speed-text", "speed"],
      ["tts-zen-autonext-label", "autoNext"],
      ["tts-zen-restart", "restart"],
      ["tts-zen-look-title", "look"],
      ["tts-zen-follow-label", "followTheme"],
      ["tts-zen-accent-label", "accent"]
    ].forEach(function(pair) {
      var el = shadow.getElementById(pair[0]);
      if (el) el.textContent = T[lang][pair[1]];
    });
    renderReadLabel();
    updateLocalRow();
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
    el.textContent = current + " / " + total;
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
    if (label) label.textContent = resumeInfo ? t("continueAt") + " \xB7 " + (resumeInfo.index + 1) + " / " + resumeInfo.total : t("read");
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
    applyCollapsed();
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
      if (state.currentEngine === "local") {
        state.localVoice = voiceSelect.value;
        updateLocalRow();
      } else state.currentVoice = voiceSelect.value;
      syncShared();
      saveSettings();
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
    var langIn = shadow.getElementById("tts-zen-lang-in");
    if (langIn) {
      langIn.value = state.langIn;
      langIn.addEventListener("change", function() {
        state.langIn = langIn.value;
        window.__tts_zen_state.langIn = langIn.value;
        saveSettings();
      });
    }
    var langOut = shadow.getElementById("tts-zen-lang-out");
    if (langOut) {
      langOut.value = state.langOut;
      langOut.addEventListener("change", function() {
        state.langOut = langOut.value;
        window.__tts_zen_state.langOut = langOut.value;
        saveSettings();
        loadVoices();
      });
    }
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
    speedSlider.value = Math.round(state.currentRate * 100);
    speedLabel.textContent = state.currentRate.toFixed(1) + "x";
    loadVoices();
    try {
      applyLanguage(shadow);
    } catch (e) {
      console.error("applyLanguage error:", e);
    }
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
  function hidePreview() {
    var overlay = getEl("tts-zen-preview-overlay");
    if (!overlay) return;
    overlay.style.opacity = "0";
    setTimeout(function() {
      overlay.classList.add("hidden");
      overlay.style.opacity = "";
    }, 300);
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
    var path = fallbackIcons[domain];
    if (!path) return "";
    try {
      return browser.runtime.getURL(path);
    } catch (_) {
      return "";
    }
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
    ALL_SITES.forEach(function(site2) {
      var enabled = enabledSites[site2.id] !== false;
      var row = document.createElement("div");
      row.className = "site-row";
      var left = document.createElement("div");
      left.className = "site-row-left";
      if (site2.id === "generic") {
        var iconDiv = document.createElement("div");
        iconDiv.className = "site-row-icon";
        iconDiv.textContent = "+";
        left.appendChild(iconDiv);
      } else {
        var iconImg = document.createElement("img");
        iconImg.className = "site-row-icon";
        iconImg.src = faviconUrl(site2.domain);
        iconImg.width = 20;
        iconImg.height = 20;
        iconImg.onerror = function() {
          var fb = faviconFallback(site2.id);
          if (fb) this.src = fb;
        };
        left.appendChild(iconImg);
      }
      var info = document.createElement("div");
      info.className = "site-row-info";
      var nameEl = document.createElement("div");
      nameEl.className = "site-row-name";
      nameEl.textContent = site2.name;
      var domainEl = document.createElement("div");
      domainEl.className = "site-row-domain";
      domainEl.textContent = site2.domain;
      info.appendChild(nameEl);
      info.appendChild(domainEl);
      left.appendChild(info);
      row.appendChild(left);
      var toggle = document.createElement("button");
      toggle.className = "site-toggle" + (enabled ? " on" : "");
      toggle.dataset.site = site2.id;
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
    addRow.className = "site-row site-add-row";
    var input = document.createElement("input");
    input.id = "tts-zen-add-site-input";
    input.type = "text";
    input.placeholder = t("addSitePlaceholder");
    var addBtn = document.createElement("button");
    addBtn.id = "tts-zen-add-site-btn";
    addBtn.textContent = t("addSite");
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
    if (!overlay) return;
    overlay.style.opacity = "0";
    setTimeout(function() {
      overlay.classList.add("hidden");
      overlay.style.opacity = "";
    }, 300);
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
      }
    },
    {
      id: "webnovel",
      test: function(host) {
        return host.includes("webnovel.com");
      },
      container: function(doc) {
        return doc.querySelector('.cha-words, .cha-content, .chapter-content, .read-content, [class*="cha-words"], [class*="cha-content"]');
      },
      paragraphs: function(c) {
        return paragraphsIn(c, "p");
      },
      chapterKey: function(url) {
        return "webnovel:" + url.pathname;
      },
      // Webnovel already loads chapters by infinite scroll (see the content observer)
      nextUrl: function() {
        return null;
      }
    }
  ];
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
    function speak(text, opts) {
      return new Promise(function(resolve, reject) {
        var u = new SpeechSynthesisUtterance(text);
        var voice = pickNativeVoice(opts.voice, opts.lang);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        } else if (opts.lang) {
          u.lang = opts.lang;
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
    return {
      name: "native",
      available: function() {
        return Promise.resolve(typeof speechSynthesis !== "undefined");
      },
      // Speaks sentences[start..]; calls ctx.onSentence(i) as each begins.
      play: async function(start, ctx) {
        var run = { cancelled: false };
        running = run;
        for (var i = start; i < ctx.sentences.length; i++) {
          if (run.cancelled) return;
          ctx.onSentence(i);
          await speak(ctx.sentences[i].text, ctx);
        }
      },
      pause: function() {
        speechSynthesis.pause();
      },
      resume: function() {
        speechSynthesis.resume();
      },
      stop: function() {
        if (running) running.cancelled = true;
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
    function release() {
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
            if (onTime) onTime(a.currentTime);
          };
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
  function createServerEngine() {
    var player2 = createAudioPlayer();
    var running = null;
    async function synth(ctx, seg) {
      var text = ctx.sentences.slice(seg.start, seg.end).map(function(s) {
        return s.text;
      }).join(" ");
      var resp = await browser.runtime.sendMessage({ action: "read_page_sync", text, voice: ctx.voice, rate: "+0%" });
      if (!resp || !resp.success || !resp.audio) throw new Error(resp && resp.error || "edge-tts");
      return {
        blob: blobFromBase64(resp.audio, "audio/mpeg"),
        times: sentenceTimes(ctx.sentences.slice(seg.start, seg.end), resp.sentences || [])
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
          var current = seg.start;
          ctx.onSentence(current);
          var s = seg;
          await player2.play(audio.blob, ctx.rate(), function(t2) {
            for (var k = audio.times.length - 1; k >= 0; k--) {
              if (t2 >= audio.times[k]) {
                if (s.start + k !== current) {
                  current = s.start + k;
                  ctx.onSentence(current);
                }
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
  var AHEAD = 2;
  function createLocalEngine() {
    var player2 = createAudioPlayer();
    var running = null;
    function synth(ctx, i) {
      return browser.runtime.sendMessage({ action: "local_speak", text: ctx.sentences[i].text, voiceId: ctx.localVoice }).then(function(resp) {
        if (!resp || !resp.success) throw new Error(resp && resp.error || "piper");
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
        var queue = {};
        function want(i2) {
          if (i2 < ctx.sentences.length && !queue[i2]) {
            queue[i2] = synth(ctx, i2);
            queue[i2].catch(function() {
            });
          }
        }
        for (var i = start; i < ctx.sentences.length; i++) {
          for (var k = 0; k <= AHEAD; k++) want(i + k);
          var blob;
          try {
            blob = await queue[i];
          } catch (e) {
            e.at = i;
            throw e;
          }
          delete queue[i];
          if (run.cancelled) return;
          ctx.onSentence(i);
          await player2.play(blob, ctx.rate());
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
    var current = -1;
    var engine = null;
    var runId = 0;
    var state2 = "idle";
    function setState(s) {
      state2 = s;
      hooks.onState(s);
    }
    function context(run2) {
      var opts = hooks.options();
      return {
        sentences: sentences2,
        voice: opts.voice,
        localVoice: opts.localVoice,
        lang: opts.lang,
        rate: function() {
          return hooks.options().rate;
        },
        onSentence: function(i) {
          if (run2 !== runId) return;
          current = i;
          hooks.onSentence(i);
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
        var from = typeof err.at === "number" ? err.at : Math.max(start, current);
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
        return current;
      },
      get count() {
        return sentences2.length;
      },
      load: function(list) {
        halt();
        sentences2 = list;
        current = -1;
        setState("idle");
      },
      // Appends sentences (e.g. translated chunks of an infinite-scroll page)
      append: function(list) {
        sentences2.push.apply(sentences2, list);
      },
      start: function(index, name) {
        halt();
        if (!sentences2.length) return;
        current = Math.max(0, Math.min(index || 0, sentences2.length - 1));
        run(current, name);
      },
      jump: function(index) {
        if (!engine || !sentences2.length) return;
        var name = engine.name;
        halt();
        current = Math.max(0, Math.min(index, sentences2.length - 1));
        run(current, name);
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
        current = -1;
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
  function shouldInject() {
    var proto = window.location.protocol;
    if (RESTRICTED_PROTOCOLS.includes(proto)) return false;
    var sites = window.__tts_zen_enabled_sites || {};
    var host = window.location.hostname;
    for (var siteId in sites) {
      if (siteId === "generic") continue;
      if (host.includes(siteId)) return sites[siteId] !== false;
    }
    return sites["generic"] !== false;
  }
  window.__tts_zen_state = {
    currentVoice: "es-ES-AlvaroNeural",
    localVoice: "es_ES-davefx-medium",
    currentRate: 1,
    currentEngine: "native",
    serverAvailable: false,
    lang: "es",
    langIn: "auto",
    langOut: "es",
    autoNext: true
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
        noTextFound: "No se encontr\xF3 texto en esta p\xE1gina",
        voiceError: "No se pudo leer con ninguna voz",
        fallback_local: "edge-tts no respondi\xF3 \u2014 usando voz local",
        fallback_native: "Sin voz neural \u2014 usando la voz del navegador",
        nextLoading: "Cargando el cap\xEDtulo siguiente\u2026",
        nextFailed: "No se pudo cargar el cap\xEDtulo siguiente",
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
        noTextFound: "No text found on this page",
        voiceError: "Could not read with any voice",
        fallback_local: "edge-tts did not answer \u2014 using the local voice",
        fallback_native: "No neural voice \u2014 using the browser voice",
        nextLoading: "Loading the next chapter\u2026",
        nextFailed: "Could not load the next chapter",
        chapterDone: "Chapter finished",
        pressRead: "Press Read to continue"
      }
    };
    var s = (T2[st().lang] || T2.es)[key] || key;
    return arg !== void 0 ? s.replace("%s", arg) : s;
  }
  var site = siteFor(window.location.hostname);
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
    var parts = text.match(/[^.!?…\n]+[.!?…]*["'»”’)]*\s*/g) || [text];
    return parts.map(function(p) {
      return p.trim();
    }).filter(function(p) {
      return p.length > 0;
    });
  }
  function buildSentences(paras) {
    var list = [];
    paras.forEach(function(p, i) {
      splitIntoSentences(p.text).forEach(function(s) {
        list.push({ text: s, refIdx: i });
      });
    });
    return list;
  }
  async function translateParagraphs(paras) {
    var to = st().langOut;
    if (!to || to === "auto") return paras;
    setStatus(ts("translating"));
    try {
      var resp = await browser.runtime.sendMessage({
        action: "translate",
        texts: paras.map(function(p) {
          return p.text;
        }),
        from: st().langIn || "auto",
        to
      });
      if (resp && Array.isArray(resp.texts) && resp.texts.length === paras.length) {
        return paras.map(function(p, i) {
          return { el: p.el, text: cleanText(resp.texts[i] || p.text) };
        });
      }
    } catch (e) {
      console.error("[zenTTS] translate:", e.message || e);
    }
    return paras;
  }
  var highlighted = null;
  var MARK = "rgba(243, 225, 154, 0.55)";
  function clearHighlight() {
    if (!highlighted) return;
    highlighted.style.removeProperty("background");
    highlighted.style.removeProperty("box-shadow");
    highlighted = null;
  }
  function highlightParagraph(el) {
    if (el === highlighted) return;
    clearHighlight();
    if (!el || !el.isConnected) return;
    el.style.background = MARK;
    el.style.boxShadow = "-6px 0 0 " + MARK + ", 6px 0 0 " + MARK;
    el.style.transition = "background 0.15s ease";
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    highlighted = el;
  }
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
  var paragraphs = [];
  var sentences = [];
  var chapterKey = null;
  var chapterHash = null;
  var resumeAt = null;
  var prepared = false;
  var nextChapter = null;
  var engineNote = null;
  var player = createPlayer({
    options: function() {
      var s = st();
      var lang = s.langOut && s.langOut !== "auto" ? s.langOut : document.documentElement.lang || "es";
      return { voice: s.currentVoice, localVoice: s.localVoice, rate: s.currentRate || 1, lang };
    },
    onSentence: function(i) {
      var s = sentences[i];
      setCounter(i + 1, sentences.length);
      highlightParagraph(s && paragraphs[s.refIdx] ? paragraphs[s.refIdx].el : null);
      highlightPreview(i);
      saveProgress(chapterKey, { index: i, total: sentences.length, hash: chapterHash, title: document.title });
      if (i >= sentences.length * 0.8) prefetchNextChapter();
    },
    onState: function(state2) {
      var playing = state2 === "playing";
      var active = state2 !== "idle";
      setButtonsEnabled({ read: !active, pause: active, stop: active, prev: active, next: active });
      setPauseIcon(playing);
      if (state2 === "playing") setStatus(engineNote || ts("playing"));
      if (state2 === "paused") setStatus(ts("paused"));
    },
    onEnd: function() {
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
    chapterKey = site.chapterKey(chapterUrl);
    chapterHash = textHash(paras.map(function(p) {
      return p.text;
    }).join("\n"));
    paragraphs = await translateParagraphs(paras);
    sentences = buildSentences(paragraphs);
    window.__tts_zen_sentences = sentences;
    window.__tts_zen_last_text = paragraphs.map(function(p) {
      return p.text;
    }).join("\n\n");
    player.load(sentences);
    prepared = true;
    return true;
  }
  async function startReading(fromIndex) {
    setStatus(ts("starting"));
    if (!prepared && !await prepareChapter()) {
      setStatus(ts("noTextFound"), true);
      return;
    }
    startContentObserver();
    engineNote = null;
    player.start(fromIndex || 0, st().currentEngine || "native");
  }
  async function offerResume() {
    var key = site.chapterKey(chapterUrl);
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
      if (resumeAt.hash === chapterHash && resumeAt.index < sentences.length) from = resumeAt.index;
    }
    resumeAt = null;
    setResume(null);
    startReading(from);
  }
  function handleRestart() {
    clearProgress(chapterKey || site.chapterKey(chapterUrl));
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
  async function goToNextChapter() {
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
    highlighted = null;
    fresh.scrollIntoView({ behavior: "smooth", block: "start" });
    startReading(0);
  }
  async function checkPendingAutoplay() {
    try {
      var got = await browser.storage.local.get("pendingAutoplay");
      var p = got.pendingAutoplay;
      if (!p) return;
      await browser.storage.local.remove("pendingAutoplay");
      if (p.url !== window.location.href || Date.now() - p.ts > 12e4) return;
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
    var root = target.parentElement || document.body;
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
      var known = new Set(paragraphs.map(function(p) {
        return p.el;
      }));
      var fresh = [];
      root.querySelectorAll("p").forEach(function(el) {
        if (known.has(el) || isHidden(el)) return;
        var text = cleanText(el.innerText || el.textContent || "");
        if (text.length >= 20) fresh.push({ el, text });
      });
      if (!fresh.length) return;
      fresh = await translateParagraphs(fresh);
      var base = paragraphs.length;
      paragraphs.push.apply(paragraphs, fresh);
      var more = [];
      fresh.forEach(function(p, i) {
        splitIntoSentences(p.text).forEach(function(s) {
          more.push({ text: s, refIdx: base + i });
        });
      });
      player.append(more);
      updatePreviewSentences();
    } finally {
      checking = false;
    }
  }
  function handlePause() {
    if (player.state === "playing") player.pause();
    else if (player.state === "paused") player.resume();
  }
  function handleStop() {
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
  window.__tts_zen_enabled_sites = { "wattpad.com": true, "archiveofourown.org": true, "fanfiction.net": true, "webnovel.com": true, "generic": true };
  function injectPanel() {
    const host = document.createElement("div");
    host.id = "tts-zen-host";
    host.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    createPanel(shadow, {
      onRead: handleRead,
      onRestart: handleRestart,
      onPause: handlePause,
      onStop: handleStop,
      onPrev: handlePrev,
      onNext: handleNext,
      onRate: function(r) {
        player.setRate(r);
      }
    }).then(function() {
      offerResume();
      checkPendingAutoplay();
      pruneProgress();
    });
    window.addEventListener("pagehide", flushProgress);
    window.addEventListener("popstate", function() {
      if (chapterUrl.href !== window.location.href) window.location.reload();
    });
  }
  function tryInject() {
    if (document.body) injectPanel();
    else requestAnimationFrame(tryInject);
  }
  if (shouldInject()) tryInject();
})();
