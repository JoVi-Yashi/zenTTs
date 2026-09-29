// Server engine — edge-tts through the local Ruby server, one paragraph per request.
// The next paragraph is synthesized while the current one plays, so there is
// no silence between requests.

import { blobFromBase64, createAudioPlayer } from './audio.js';

var MAX_SEGMENT = 2500;

// Groups sentences[start..] into segments that never cross a paragraph
function segmentFrom(sentences, start) {
  var end = start;
  var len = 0;
  while (end < sentences.length && sentences[end].refIdx === sentences[start].refIdx) {
    if (len > 0 && len + sentences[end].text.length > MAX_SEGMENT) break;
    len += sentences[end].text.length + 1;
    end++;
  }
  return { start: start, end: end };
}

function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

// Maps each of our sentences to a start time using the subtitle cues
// edge-tts returns, by comparing character offsets.
function sentenceTimes(ourSentences, cues) {
  var cueStarts = [];
  var pos = 0;
  cues.forEach(function(c) {
    cueStarts.push({ at: pos, start: c.start, end: c.end, len: norm(c.text).length });
    pos += norm(c.text).length + 1;
  });
  var total = pos || 1;
  var ourTotal = ourSentences.reduce(function(n, s) { return n + norm(s.text).length + 1; }, 0) || 1;
  var times = [];
  var at = 0;
  ourSentences.forEach(function(s) {
    // Scale in case edge-tts normalized the text slightly differently
    var target = at * total / ourTotal;
    var cue = cueStarts[0];
    for (var i = 0; i < cueStarts.length; i++) {
      if (cueStarts[i].at <= target) cue = cueStarts[i]; else break;
    }
    var t = 0;
    if (cue) {
      var within = cue.len ? Math.min(1, (target - cue.at) / cue.len) : 0;
      t = cue.start + within * (cue.end - cue.start);
    }
    times.push(t);
    at += norm(s.text).length + 1;
  });
  return times;
}

export function createServerEngine() {
  var player = createAudioPlayer();
  var running = null;

  async function synth(ctx, seg) {
    var text = ctx.sentences.slice(seg.start, seg.end).map(function(s) { return s.text; }).join(' ');
    var resp = await browser.runtime.sendMessage({ action: 'read_page_sync', text: text, voice: ctx.voice, rate: '+0%' });
    if (!resp || !resp.success || !resp.audio) throw new Error((resp && resp.error) || 'edge-tts');
    return {
      blob: blobFromBase64(resp.audio, 'audio/mpeg'),
      times: sentenceTimes(ctx.sentences.slice(seg.start, seg.end), resp.sentences || [])
    };
  }

  return {
    name: 'server',
    available: async function() {
      try {
        var r = await browser.runtime.sendMessage({ action: 'health' });
        return !!(r && r.success);
      } catch (_) { return false; }
    },

    play: async function(start, ctx) {
      var run = { cancelled: false };
      running = run;
      var seg = segmentFrom(ctx.sentences, start);
      var pending = synth(ctx, seg);
      while (seg.start < ctx.sentences.length) {
        var audio;
        try { audio = await pending; } catch (e) { e.at = seg.start; throw e; }
        if (run.cancelled) return;
        var next = seg.end < ctx.sentences.length ? segmentFrom(ctx.sentences, seg.end) : null;
        if (next) {
          pending = synth(ctx, next);
          pending.catch(function() {}); // surfaced when awaited
        }
        var current = seg.start;
        ctx.onSentence(current);
        var s = seg;
        await player.play(audio.blob, ctx.rate(), function(t) {
          for (var k = audio.times.length - 1; k >= 0; k--) {
            if (t >= audio.times[k]) {
              if (s.start + k !== current) { current = s.start + k; ctx.onSentence(current); }
              break;
            }
          }
        });
        if (run.cancelled || !next) return;
        seg = next;
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
