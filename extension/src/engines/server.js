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

function bare(s) { return s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''); }

// Pairs edge-tts word boundaries with the words of our sentences, in order.
// Returns, per sentence, [{offset, time}] (offset = char index in the sentence).
function wordTimes(ourSentences, words) {
  var tokens = [];
  ourSentences.forEach(function(s, k) {
    var re = /\S+/g, m;
    while ((m = re.exec(s.text))) tokens.push({ k: k, offset: m.index, key: bare(m[0]) });
  });
  var out = ourSentences.map(function() { return []; });
  var j = 0;
  (words || []).forEach(function(w) {
    var key = bare(w.text || '');
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

// Sentence cues rebuilt from word boundaries (edge-tts sends one kind or the other)
function wordsAsCues(words) {
  return (words || []).map(function(w) { return { text: w.text, start: w.start, end: w.end }; });
}

// Char offset of the word being spoken in sentence k of a segment
function wordAt(audio, k, t, duration, len) {
  var list = audio.words[k];
  if (list && list.length) {
    var off = list[0].offset;
    for (var i = 0; i < list.length && list[i].time <= t; i++) off = list[i].offset;
    return off;
  }
  // No word timings: estimate from the sentence's share of the audio
  var start = audio.times[k];
  var end = k + 1 < audio.times.length ? audio.times[k + 1] : duration;
  if (!(end > start)) return 0;
  return Math.floor(Math.min(0.999, (t - start) / (end - start)) * len);
}

export function createServerEngine() {
  var player = createAudioPlayer();
  var running = null;

  async function synth(ctx, seg) {
    var text = ctx.sentences.slice(seg.start, seg.end).map(function(s) { return s.text; }).join(' ');
    var resp = await browser.runtime.sendMessage({ action: 'read_page_sync', text: text, voice: ctx.voice, rate: '+0%', words: true });
    if (!resp || !resp.success || !resp.audio) throw new Error((resp && resp.error) || 'edge-tts');
    var ours = ctx.sentences.slice(seg.start, seg.end);
    var cues = resp.sentences && resp.sentences.length ? resp.sentences : wordsAsCues(resp.words);
    return {
      blob: blobFromBase64(resp.audio, 'audio/mpeg'),
      times: sentenceTimes(ours, cues),
      words: wordTimes(ours, resp.words)
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
        await player.play(audio.blob, ctx.rate(), function(t, duration) {
          for (var k = audio.times.length - 1; k >= 0; k--) {
            if (t >= audio.times[k]) {
              if (s.start + k !== current) { current = s.start + k; ctx.onSentence(current); }
              ctx.onWord(current, wordAt(audio, k, t, duration, ctx.sentences[current].text.length));
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
