#!/usr/bin/env python3
"""Synthesize text with edge-tts and report when each word is spoken.

The edge-tts command line only writes sentence subtitles, so server.rb calls
this script when the extension asks for word timings.

Usage: edge_words.py VOICE RATE TEXT_FILE AUDIO_OUT
Prints JSON to stdout: [{"text": "Hola", "start": 0.1, "end": 0.42}, ...]
"""

import asyncio
import json
import sys

import edge_tts

TICKS_PER_SECOND = 10_000_000  # edge-tts offsets are in 100 ns units


async def synthesize(voice, rate, text, audio_path):
    communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
    words = []
    with open(audio_path, "wb") as audio:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                words.append({
                    "text": chunk["text"],
                    "start": round(start, 3),
                    "end": round(start + chunk["duration"] / TICKS_PER_SECOND, 3),
                })
    return words


def main():
    if len(sys.argv) != 5:
        sys.exit(__doc__)
    voice, rate, text_file, audio_out = sys.argv[1:]
    with open(text_file, encoding="utf-8") as f:
        text = f.read()
    words = asyncio.run(synthesize(voice, rate, text, audio_out))
    json.dump(words, sys.stdout, ensure_ascii=False)


if __name__ == "__main__":
    main()
