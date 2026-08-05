"""Tests for the TTS-zen FastAPI application."""

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from tts_zen.main import app

client = TestClient(app)

FAKE_MP3 = b"\xff\xfb\x90\x00"  # Valid-looking MPEG audio frame header


# ----------------------------------------------------------------- Health --


class TestHealth:
    def test_health_returns_200(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


# -------------------------------------------------------------------- TTS --


class TestTTS:
    def test_tts_empty_text_returns_400(self):
        response = client.post("/tts", json={"text": "   "})
        assert response.status_code == 400
        assert "not be empty" in response.json()["detail"]

    def test_tts_missing_body_returns_422(self):
        response = client.post("/tts")
        assert response.status_code == 422

    @patch("tts_zen.main.generate_tts", new_callable=AsyncMock)
    def test_tts_valid_text_returns_mp3(self, mock_generate):
        mock_generate.return_value = FAKE_MP3
        response = client.post("/tts", json={"text": "Hola mundo"})
        assert response.status_code == 200
        assert response.headers["content-type"] == "audio/mpeg"
        assert response.content == FAKE_MP3


# ---------------------------------------------------------------- Extract --


class TestExtract:
    @patch("tts_zen.main.generate_tts", new_callable=AsyncMock)
    @patch("tts_zen.main.extract_url", new_callable=AsyncMock)
    def test_extract_valid_url_returns_mp3(self, mock_extract, mock_generate):
        mock_extract.return_value = "Article content"
        mock_generate.return_value = FAKE_MP3
        response = client.post("/extract", json={"url": "https://example.com"})
        assert response.status_code == 200
        assert response.headers["content-type"] == "audio/mpeg"
        assert response.content == FAKE_MP3

    def test_extract_invalid_url_returns_422(self):
        response = client.post("/extract", json={"url": "not-a-url"})
        assert response.status_code == 422


# ---------------------------------------------------------------- Voices --


class TestVoices:
    def test_voices_returns_list(self):
        """Voices endpoint returns a list of voice objects with metadata."""
        response = client.get("/voices?locale=es-")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        # Each voice object has expected structure
        voice = data[0]
        assert "name" in voice
        assert "locale" in voice
        assert voice["locale"].startswith("es-")
        # Verify legacy voice is present
        names = [v["name"] for v in data]
        assert "es-ES-AlvaroNeural" in names
