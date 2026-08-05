"""TTS generation and URL extraction using edge-tts and trafilatura."""

import asyncio
import base64
import io
from functools import partial

import edge_tts
import trafilatura


async def list_voices(locale: str | None = None) -> list[dict]:
    """List available voices, optionally filtered by locale prefix (e.g. 'es-')."""
    voices = await edge_tts.list_voices()
    result = []
    for v in voices:
        if locale and not v["Locale"].startswith(locale):
            continue
        result.append({
            "name": v["ShortName"],
            "locale": v["Locale"],
            "gender": v.get("Gender", ""),
            "friendly": v.get("FriendlyName", v["ShortName"]),
        })
    return result


async def generate_tts(
    text: str, voice: str = "es-ES-AlvaroNeural", rate: str = "+0%"
) -> bytes:
    """Generate MP3 audio bytes from text using Microsoft Edge TTS.

    Uses the async ``edge_tts.Communicate`` API to stream audio chunks
    into an in-memory buffer and returns the complete MP3 as bytes.
    """
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    buffer = io.BytesIO()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])
    return buffer.getvalue()


async def generate_tts_sync(
    text: str, voice: str = "es-ES-AlvaroNeural", rate: str = "+0%"
) -> dict:
    """Generate TTS audio with sentence-level timing metadata.

    Returns a dict with base64-encoded MP3 audio and sentence boundaries
    for client-side text highlighting synchronized with playback.
    """
    communicate = edge_tts.Communicate(text, voice, rate=rate)
    buffer = io.BytesIO()
    sentences = []

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            buffer.write(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            # edge-tts offsets/durations are in 100ns ticks
            start_sec = chunk["offset"] / 10_000_000
            end_sec = (chunk["offset"] + chunk["duration"]) / 10_000_000
            sentences.append({
                "text": chunk.get("text", ""),
                "start": round(start_sec, 3),
                "end": round(end_sec, 3),
            })

    audio_b64 = base64.b64encode(buffer.getvalue()).decode("ascii")

    return {
        "audio": audio_b64,
        "mime": "audio/mpeg",
        "sentences": sentences,
        "total_duration": round(sentences[-1]["end"], 3) if sentences else 0,
    }


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
