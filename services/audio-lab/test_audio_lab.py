"""
Deterministic Tests for Beatwave Audio Lab Service.
Generates an in-memory sine wave test fixture with known BPM pulses.
"""

import io
import wave
import numpy as np
import pytest
from fastapi.testclient import TestClient
from main import app
from dsp import (
    estimate_bpm_and_beats,
    detect_transient_onsets,
    find_nearest_zero_crossing,
    generate_4x4_kit_slices
)

client = TestClient(app)

def create_synthetic_wav_bytes(bpm: float = 120.0, duration_sec: float = 4.0, sr: int = 44100) -> bytes:
    """Creates a WAV file with rhythmic impulses at the specified BPM."""
    t = np.linspace(0, duration_sec, int(sr * duration_sec), endpoint=False)
    # Sine carrier at 220Hz
    carrier = np.sin(2 * np.pi * 220 * t)

    # Rhythmic envelope at BPM
    beat_period_sec = 60.0 / bpm
    envelope = np.zeros_like(t)
    num_beats = int(duration_sec / beat_period_sec)
    for b in range(num_beats):
        center_sample = int(b * beat_period_sec * sr)
        pulse_width = int(0.05 * sr) # 50ms pulse
        start = max(0, center_sample)
        end = min(len(t), center_sample + pulse_width)
        envelope[start:end] = np.hanning(end - start)

    audio = (carrier * envelope * 32767).astype(np.int16)

    wav_io = io.BytesIO()
    with wave.open(wav_io, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(audio.tobytes())

    return wav_io.getvalue()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "hardwareAcceleration" in data

def test_analyze_endpoint():
    wav_bytes = create_synthetic_wav_bytes(bpm=120.0, duration_sec=3.0)
    files = {"file": ("test.wav", wav_bytes, "audio/wav")}

    response = client.post("/analyze", files=files)
    assert response.status_code == 200
    data = response.json()
    assert "contentHash" in data
    assert data["durationSec"] == pytest.approx(3.0, abs=0.1)
    assert "estimatedBpm" in data
    assert len(data["beatPositions"]) > 0

def test_zero_crossing_snapping():
    # Signal with known zero crossing at index 50
    signal = np.array([-1.0, -0.5, 0.0, 0.5, 1.0], dtype=np.float32)
    crossing = find_nearest_zero_crossing(signal, 0, search_radius=4)
    # Crossing between negative and positive
    assert crossing in (1, 2)

def test_generate_kit_slices():
    sr = 44100
    audio = np.sin(np.linspace(0, 100, sr * 2, dtype=np.float32))
    onsets = [0.0, 0.25, 0.5, 0.75, 1.0]
    pads = generate_4x4_kit_slices(audio, sr, 120.0, onsets)

    assert len(pads) == 16
    for pad in pads:
        assert pad["startOffsetSec"] >= 0
        assert pad["endOffsetSec"] >= pad["startOffsetSec"]
