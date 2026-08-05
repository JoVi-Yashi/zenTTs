// TTS-zen Background Event Page (Firefox MV3)
// Proxies content-script messages to local FastAPI server on localhost:8765

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'get_voices':
      handleGetVoices()
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'read_page':
      handleReadPage(message.text, message.voice, message.rate)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'read_page_sync':
      handleReadPageSync(message.text, message.voice, message.rate)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    case 'extract_url':
      handleExtractUrl(message.url, message.voice, message.rate)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true;

    default:
      sendResponse({ success: false, error: `unknown action: ${message.action}` });
      return false;
  }
});

async function handleGetVoices() {
  const resp = await fetch('http://localhost:8765/voices?locale=es-');
  if (!resp.ok) {
    throw new Error(`Voices fetch failed: ${resp.status}`);
  }
  const voices = await resp.json();
  return { success: true, voices };
}

async function handleReadPage(text, voice, rate) {
  const body = { text };
  if (voice) body.voice = voice;
  if (rate) body.rate = rate;

  const resp = await fetch('http://localhost:8765/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `TTS server error: ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  return { success: true, data };
}

async function handleReadPageSync(text, voice, rate) {
  const body = { text };
  if (voice) body.voice = voice;
  if (rate) body.rate = rate;

  const resp = await fetch('http://localhost:8765/tts/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `TTS server error: ${resp.status}`);
  }

  const result = await resp.json();
  return {
    success: true,
    audio: result.audio,
    sentences: result.sentences,
  };
}

async function handleExtractUrl(url, voice, rate) {
  const body = { url };
  if (voice) body.voice = voice;
  if (rate) body.rate = rate;

  const resp = await fetch('http://localhost:8765/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Extraction server error: ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  return { success: true, data };
}
