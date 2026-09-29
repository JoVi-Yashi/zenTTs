// zenTTS player — one queue of sentences, three interchangeable engines.
// If the neural engine fails mid-reading, it falls back to the local voice
// (if one is downloaded) or the browser voice, from the same sentence.

import { createNativeEngine } from './engines/native.js';
import { createServerEngine } from './engines/server.js';
import { createLocalEngine } from './engines/local.js';

var FALLBACK = { server: ['local', 'native'], local: ['native'], native: [] };

export function createPlayer(hooks) {
  var engines = {
    native: createNativeEngine(),
    server: createServerEngine(),
    local: createLocalEngine()
  };
  var sentences = [];
  var current = -1;
  var engine = null;
  var runId = 0;
  var state = 'idle'; // idle | playing | paused

  function setState(s) { state = s; hooks.onState(s); }

  function context(run) {
    var opts = hooks.options();
    return {
      sentences: sentences,
      voice: opts.voice,
      localVoice: opts.localVoice,
      lang: opts.lang,
      rate: function() { return hooks.options().rate; },
      onSentence: function(i) {
        if (run !== runId) return;
        current = i;
        hooks.onSentence(i);
      },
      // charOffset: where the spoken word starts inside sentence i
      onWord: function(i, charOffset) {
        if (run !== runId || i !== current || !hooks.onWord) return;
        hooks.onWord(i, charOffset);
      }
    };
  }

  async function run(start, name) {
    var id = ++runId;
    engine = engines[name];
    setState('playing');
    var ctx = context(id);
    try {
      await engine.play(start, ctx);
      if (id !== runId) return;
      setState('idle');
      hooks.onEnd();
    } catch (err) {
      if (id !== runId) return;
      var from = typeof err.at === 'number' ? err.at : Math.max(start, current);
      for (var i = 0; i < FALLBACK[name].length; i++) {
        var alt = FALLBACK[name][i];
        if (await engines[alt].available(ctx)) {
          hooks.onFallback(name, alt, err);
          return run(from, alt);
        }
      }
      setState('idle');
      hooks.onError(name, err);
    }
  }

  function halt() {
    runId++;
    if (engine) engine.stop();
  }

  return {
    engines: engines,
    get state() { return state; },
    get index() { return current; },
    get count() { return sentences.length; },

    load: function(list) { halt(); sentences = list; current = -1; setState('idle'); },
    // Appends sentences (e.g. translated chunks of an infinite-scroll page)
    append: function(list) { sentences.push.apply(sentences, list); },

    start: function(index, name) {
      halt();
      if (!sentences.length) return;
      current = Math.max(0, Math.min(index || 0, sentences.length - 1));
      run(current, name);
    },
    jump: function(index) {
      if (!engine || !sentences.length) return;
      var name = engine.name;
      halt();
      current = Math.max(0, Math.min(index, sentences.length - 1));
      run(current, name);
    },
    pause: function() {
      if (state !== 'playing' || !engine) return;
      engine.pause();
      setState('paused');
    },
    resume: function() {
      if (state !== 'paused' || !engine) return;
      engine.resume();
      setState('playing');
    },
    setRate: function(r) { if (engine && engine.setRate) engine.setRate(r); },
    stop: function() {
      halt();
      current = -1;
      setState('idle');
    }
  };
}
