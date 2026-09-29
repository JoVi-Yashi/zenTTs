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
      if (voice) { u.voice = voice; u.lang = voice.lang; } else if (opts.lang) { u.lang = opts.lang; }
      u.rate = opts.rate();
      u.onend = function() { resolve(); };
      u.onerror = function(e) {
        if (e.error === 'canceled' || e.error === 'interrupted') resolve();
        else reject(new Error('speech: ' + e.error));
      };
      speechSynthesis.speak(u);
    });
  }

  return {
    name: 'native',
    available: function() { return Promise.resolve(typeof speechSynthesis !== 'undefined'); },

    // Speaks sentences[start..]; calls ctx.onSentence(i) as each begins.
    play: async function(start, ctx) {
      var run = { cancelled: false };
      running = run;
      for (var i = start; i < ctx.sentences.length; i++) {
        if (run.cancelled) return;
        ctx.onSentence(i);
        await speak(ctx.sentences[i].text, ctx, ctx.onWord.bind(null, i));
        // speechSynthesis keeps a paused utterance pending, so the await above
        // only resolves once it is resumed and finished.
      }
    },
    pause: function() { speechSynthesis.pause(); },
    resume: function() { speechSynthesis.resume(); },
    stop: function() {
      if (running) running.cancelled = true;
      speechSynthesis.cancel();
    }
  };
}
