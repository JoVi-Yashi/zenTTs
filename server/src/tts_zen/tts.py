"""TTS generation and URL extraction using edge-tts and trafilatura."""

import asyncio
import io
from functools import partial

import edge_tts
import trafilatura


async def generate_tts(text: str, voice: str = "es-ES-AlvaroNeural") -> bytes:
    """Generate MP3 audio bytes from text using Microsoft Edge TTS.

    Uses the async ``edge_tts.Communicate`` API to stream audio chunks
    into an in-memory buffer and returns the complete MP3 as bytes.
    """
    communicate = edge_tts.Communicate(text, voice)
    buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])
    return buffer.getvalue()


async def extract_url(url: str) -> str:
    """Fetch a URL and extract readable text via trafilatura.

    Runs synchronous trafilatura calls in a thread-pool executor to
    keep the async event loop free.
    """
    loop = asyncio.get_running_loop()
    downloaded = await loop.run_in_executor(None, trafilatura.fetch_url, url)
    if not downloaded:
        raise ValueError(f"Could not fetch URL: {url}")

    text = await loop.run_in_executor(
        None,
        partial(trafilatura.extract, downloaded, include_comments=False, include_tables=False),
    )
    if not text:
        raise ValueError(f"Could not extract text from URL: {url}")
    return text
