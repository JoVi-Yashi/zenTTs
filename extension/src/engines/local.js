// Local engine — Piper running in the background page (WASM, offline once the
// voice is downloaded). Long sentences are cut into shorter pieces, so audio
// starts sooner; several pieces are generated ahead of the one playing.

import { createAudioPlayer } from './audio.js';

var AHEAD = 4;
var MAX_PIECE = 160;

// Cuts a sentence into pieces of at most MAX_PIECE characters, preferring
// pauses (, ; : — –) and then spaces. Returns [{text, offset}].
export function piecesOf(text) {
  var out = [];
  var start = 0;
  while (text.length - start > MAX_PIECE) {
    var span = text.slice(start, start + MAX_PIECE);
    var cut = -1;
    var re = /[,;:—–]\s/g, m;
    while ((m = re.exec(span))) if (m.index > 40) cut = m.index + 1;
    if (cut < 0) cut = span.lastIndexOf(' ');
    if (cut <= 0) cut = MAX_PIECE;
    out.push({ text: text.slice(start, start + cut).trim(), offset: start });
    start += cut;
    while (text[start] === ' ') start++;
  }
  if (start < text.length) out.push({ text: text.slice(start).trim(), offset: start });
  return out.filter(function(p) { return p.text; });
}

// Length of a WAV in ms, from its header
function wavMs(buf) {
  try {
    var v = new DataView(buf);
    var rate = v.getUint32(24, true), bytesPerSample = v.getUint16(34, true) / 8 * v.getUint16(22, true);
    return (buf.byteLength - 44) / (rate * bytesPerSample) * 1000;
  } catch (_) { return 0; }
}

// Tells the panel how fast the voice generates compared with how long it
// sounds (ratio > 1: slower than real time on this computer)
var speed = { voice: null, samples: [] };
function report(voice, ms, audioMs) {
  if (!(audioMs > 0) || !(ms >= 0)) return;
  if (speed.voice !== voice) speed = { voice: voice, samples: [] };
  speed.samples.push(ms / audioMs);
  if (speed.samples.length > 8) speed.samples.shift();
  if (speed.samples.length < 3) return;
  var avg = speed.samples.reduce(function(a, b) { return a + b; }, 0) / speed.samples.length;
  try { window.dispatchEvent(new CustomEvent('zentts-voice-speed', { detail: { voice: voice, ratio: avg } })); } catch (_) {}
}

export function createLocalEngine() {
  var player = createAudioPlayer();
  var running = null;

  function synth(ctx, piece) {
    var voice = ctx.localVoice;
    return browser.runtime.sendMessage({ action: 'local_speak', text: piece.text, voiceId: voice })
      .then(function(resp) {
        if (!resp || !resp.success) throw new Error((resp && resp.error) || 'piper');
        report(voice, resp.ms, wavMs(resp.audio));
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
      // Flat list of pieces from `start` on, generated lazily
      var pieces = [];
      var nextSentence = start;
      function fill(upTo) {
        while (pieces.length <= upTo && nextSentence < ctx.sentences.length) {
          var i = nextSentence++;
          piecesOf(ctx.sentences[i].text).forEach(function(p, k) { pieces.push({ i: i, first: k === 0, text: p.text, offset: p.offset }); });
        }
      }
      var queue = {};
      function want(n) {
        fill(n);
        if (n < pieces.length && !queue[n]) {
          queue[n] = synth(ctx, pieces[n]);
          queue[n].catch(function() {});
        }
      }
      for (var n = 0; ; n++) {
        fill(n);
        if (n >= pieces.length) return;
        for (var k = 0; k <= AHEAD; k++) want(n + k);
        var piece = pieces[n];
        var blob;
        try { blob = await queue[n]; } catch (e) { e.at = piece.i; throw e; }
        delete queue[n];
        if (run.cancelled) return;
        if (piece.first) ctx.onSentence(piece.i);
        // Piper gives no timings: estimate the word from how far the audio is
        await player.play(blob, ctx.rate(), function(t, duration) {
          if (duration > 0 && isFinite(duration)) ctx.onWord(piece.i, piece.offset + Math.floor(Math.min(0.999, t / duration) * piece.text.length));
        });
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
