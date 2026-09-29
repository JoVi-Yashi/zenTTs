// Local engine — Piper running in the background page (WASM, offline once the
// voice is downloaded). One request per sentence, two sentences ahead.

import { createAudioPlayer } from './audio.js';

var AHEAD = 2;

export function createLocalEngine() {
  var player = createAudioPlayer();
  var running = null;

  function synth(ctx, i) {
    return browser.runtime.sendMessage({ action: 'local_speak', text: ctx.sentences[i].text, voiceId: ctx.localVoice })
      .then(function(resp) {
        if (!resp || !resp.success) throw new Error((resp && resp.error) || 'piper');
        return new Blob([resp.audio], { type: 'audio/wav' });
      });
  }

  return {
    name: 'local',
    // Usable only when a voice has been downloaded
    available: async function(ctx) {
      try {
        var r = await browser.runtime.sendMessage({ action: 'local_voices' });
        var stored = (r && r.stored) || [];
        if (stored.length === 0) return false;
        if (ctx && !stored.includes(ctx.localVoice)) ctx.localVoice = stored[0];
        return true;
      } catch (_) { return false; }
    },

    play: async function(start, ctx) {
      var run = { cancelled: false };
      running = run;
      var queue = {};
      function want(i) {
        if (i < ctx.sentences.length && !queue[i]) {
          queue[i] = synth(ctx, i);
          queue[i].catch(function() {});
        }
      }
      for (var i = start; i < ctx.sentences.length; i++) {
        for (var k = 0; k <= AHEAD; k++) want(i + k);
        var blob;
        try { blob = await queue[i]; } catch (e) { e.at = i; throw e; }
        delete queue[i];
        if (run.cancelled) return;
        ctx.onSentence(i);
        await player.play(blob, ctx.rate());
        if (run.cancelled) return;
      }
    },
    pause: function() { player.pause(); },
    resume: function() { player.resume(); },
    setRate: function(r) { player.setRate(r); },
    stop: function() {
      if (running) running.cancelled = true;
      player.stop();
    }
  };
}
