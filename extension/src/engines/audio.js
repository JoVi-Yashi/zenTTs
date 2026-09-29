// Shared helpers for engines that play audio files (server, local)

export function blobFromBase64(b64, type) {
  var bytes = Uint8Array.from(atob(b64), function(c) { return c.charCodeAt(0); });
  return new Blob([bytes], { type: type });
}

// Plays one blob; resolves when it ends (or is stopped), rejects on error.
// onTime(currentTime) is called while playing.
export function createAudioPlayer() {
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
        a.ontimeupdate = function() { if (onTime) onTime(a.currentTime); };
        a.onended = function() { release(); resolve(); };
        a.onerror = function() { release(); reject(new Error('audio')); };
        a.play().catch(function(e) { release(); reject(e); });
      });
    },
    pause: function() { if (audio) audio.pause(); },
    resume: function() { if (audio) audio.play(); },
    setRate: function(rate) { if (audio) audio.playbackRate = rate; },
    stop: function() {
      var done = finish;
      finish = null;
      release();
      if (done) done();
    }
  };
}
