// Native engine — browser SpeechSynthesis, one utterance per sentence

var voicesCache = [];

function refreshVoices() {
  voicesCache = speechSynthesis.getVoices();
  return voicesCache;
}

if (typeof speechSynthesis !== 'undefined') {
  refreshVoices();
  speechSynthesis.addEventListener('voiceschanged', refreshVoices);
}

export function nativeVoices() {
  return voicesCache.length ? voicesCache : refreshVoices();
}

// Picks the saved voice if it exists, otherwise the first voice for `lang`
export function pickNativeVoice(name, lang) {
  var voices = nativeVoices();
  var byName = voices.find(function(v) { return v.name === name || v.voiceURI === name; });
  if (byName) return byName;
  var prefix = (lang || '').slice(0, 2).toLowerCase();
  return voices.find(function(v) { return v.lang.toLowerCase().startsWith(prefix); }) || null;
}

export function createNativeEngine() {
  var running = null;

  function speak(text, opts, onWord) {
    return new Promise(function(resolve, reject) {
      var u = new SpeechSynthesisUtterance(text);
      // Word boundaries, when the platform's speech engine reports them
      u.onboundary = function(e) {
        if (!e.name || e.name === 'word') onWord(e.charIndex);
      };
      var voice = pickNativeVoice(opts.voice, opts.lang);
      try {
        if (voice) { u.voice = voice; u.lang = voice.lang; } else if (opts.lang) { u.lang = opts.lang; }
      } catch (_) { if (opts.lang) u.lang = opts.lang; }
      u.rate = opts.rate();
      u.onend = function() { resolve(); };
      u.onerror = function(e) {
        if (e.error === 'canceled' || e.error === 'interrupted') resolve();
        else reject(new Error('speech: ' + e.error));
      };
      speechSynthesis.speak(u);
    });
  }

  // Word starts from `from` onwards, so a resumed sentence starts on a word
  function wordStart(text, at) {
    while (at > 0 && !/\s/.test(text[at - 1])) at--;
    return at;
  }

  return {
    name: 'native',
    available: function() { return Promise.resolve(typeof speechSynthesis !== 'undefined'); },

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
        for (;;) {
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
      p.promise = new Promise(function(r) { p.resolve = r; });
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
