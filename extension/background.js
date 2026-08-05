// TTS-zen Background Event Page (Firefox MV3)
// Proxies content-script messages to local FastAPI server on localhost:8765
// Top-level runtime.onMessage listener — required for non-persistent Event Pages

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'read_page':
      handleReadPage(message.text)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // keep channel open for async response

    case 'extract_url':
      handleExtractUrl(message.url)
        .then(sendResponse)
        .catch(err => sendResponse({ success: false, error: err.message }));
      return true; // keep channel open for async response

    default:
      sendResponse({ success: false, error: `unknown action: ${message.action}` });
      return false;
  }
});

async function handleReadPage(text) {
  const resp = await fetch('http://localhost:8765/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `TTS server error: ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  return { success: true, data };
}

async function handleExtractUrl(url) {
  const resp = await fetch('http://localhost:8765/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `Extraction server error: ${resp.status}`);
  }

  const data = await resp.arrayBuffer();
  return { success: true, data };
}
