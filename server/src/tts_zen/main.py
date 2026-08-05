"""FastAPI application — REST API for TTS generation and URL extraction."""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, HttpUrl

from tts_zen.tts import extract_url, generate_tts, generate_tts_sync, list_voices

app = FastAPI(title="TTS-zen")

# Allow all origins for local development (content scripts, localhost pages).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class TTSRequest(BaseModel):
    text: str
    voice: str = "es-ES-AlvaroNeural"
    rate: str = "+0%"


class ExtractRequest(BaseModel):
    url: HttpUrl
    voice: str = "es-ES-AlvaroNeural"
    rate: str = "+0%"


# ----------------------------------------------------------------- Routes --


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/tts")
async def tts(body: TTSRequest):
    """Generate MP3 audio from text via edge-tts.

    Accepts optional ``voice`` and ``rate`` parameters for customization.
    """
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")

    try:
        audio = await generate_tts(text, voice=body.voice, rate=body.rate)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return Response(content=audio, media_type="audio/mpeg")


@app.post("/tts/sync")
async def tts_sync(body: TTSRequest):
    """Generate TTS audio with sentence-level timing metadata.

    Returns a JSON object with base64-encoded MP3 audio, MIME type,
    and an array of sentence boundary events for client-side text
    highlighting synchronized with audio playback.
    """
    text = body.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text must not be empty")

    try:
        result = await generate_tts_sync(text, voice=body.voice, rate=body.rate)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return result


@app.post("/extract")
async def extract(body: ExtractRequest):
    """Fetch a URL, extract readable text, and generate TTS audio."""
    url = str(body.url)

    try:
        text = await extract_url(url)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    if not text.strip():
        raise HTTPException(status_code=400, detail="no text extracted from URL")

    try:
        audio = await generate_tts(text, voice=body.voice, rate=body.rate)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return Response(content=audio, media_type="audio/mpeg")


@app.get("/voices")
async def voices(locale: str | None = Query(None, description="Filter by locale prefix, e.g. 'es-' or 'en-US'")):
    """Return available TTS voices, optionally filtered by locale."""
    try:
        return await list_voices(locale=locale)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
