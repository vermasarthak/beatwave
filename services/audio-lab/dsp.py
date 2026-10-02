"""
Audio Digital Signal Processing (DSP) Module.
Computes BPM, onset transients, beat positions, zero-crossing alignment,
and generates musically segmented 4x4 kits.
"""

import hashlib
import wave
import numpy as np
from scipy import signal
from scipy.io import wavfile

def compute_audio_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def decode_audio_wav(file_path: str):
    """
    Decodes audio from WAV file into float32 array in [-1.0, 1.0] and sample rate.
    """
    try:
        sr, data = wavfile.read(file_path)
        if data.dtype == np.int16:
            data = data.astype(np.float32) / 32768.0
        elif data.dtype == np.int32:
            data = data.astype(np.float32) / 2147483648.0
        elif data.dtype == np.uint8:
            data = (data.astype(np.float32) - 128.0) / 128.0

        # Convert stereo to mono
        if len(data.shape) > 1:
            data = np.mean(data, axis=1)

        return data, sr
    except Exception:
        # Fallback using standard library wave module
        with wave.open(file_path, 'rb') as wf:
            sr = wf.getframerate()
            n_frames = wf.getnframes()
            channels = wf.getnchannels()
            raw_bytes = wf.readframes(n_frames)
            data = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
            if channels > 1:
                data = data.reshape(-1, channels).mean(axis=1)
            return data, sr

def estimate_bpm_and_beats(audio: np.ndarray, sr: int):
    """
    Estimates BPM and beat timestamps using onset envelope and autocorrelation.
    """
    hop_length = 512
    # Envelope extraction via half-wave rectified spectral flux
    f, t, Zxx = signal.stft(audio, fs=sr, nperseg=1024, noverlap=512)
    mag = np.abs(Zxx)
    diff = np.diff(mag, axis=1)
    diff[diff < 0] = 0
    onset_env = np.sum(diff, axis=0)

    # Smooth onset envelope
    onset_env = signal.medfilt(onset_env, kernel_size=5)

    # Autocorrelation to find tempo lag
    corr = np.correlate(onset_env, onset_env, mode='full')
    corr = corr[len(corr)//2:]

    # Search in plausible tempo range: 60 BPM to 180 BPM
    fps = sr / hop_length
    min_lag = int(fps * 60 / 180)
    max_lag = int(fps * 60 / 60)

    if max_lag < len(corr):
        search_region = corr[min_lag:max_lag]
        best_lag = min_lag + np.argmax(search_region)
        bpm = (60.0 * fps) / best_lag
    else:
        bpm = 120.0

    bpm = float(np.clip(bpm, 60.0, 180.0))

    # Beat positions
    seconds_per_beat = 60.0 / bpm
    total_duration = len(audio) / sr
    beat_times = np.arange(0, total_duration, seconds_per_beat).tolist()

    return round(bpm, 1), beat_times

def detect_transient_onsets(audio: np.ndarray, sr: int, max_onsets: int = 32):
    """
    Finds sharp transients/peaks in energy for slicing candidate regions.
    """
    # Energy envelope
    window_size = int(sr * 0.02) # 20ms
    energy = np.convolve(audio**2, np.ones(window_size)/window_size, mode='same')
    peaks, props = signal.find_peaks(energy, distance=int(sr * 0.15), prominence=np.max(energy) * 0.05)

    onset_times = (peaks / sr).tolist()
    if len(onset_times) == 0:
        # Fallback to equal intervals
        dur = len(audio) / sr
        onset_times = np.linspace(0, dur * 0.8, 16).tolist()

    return onset_times[:max_onsets]

def find_nearest_zero_crossing(audio: np.ndarray, sample_idx: int, search_radius: int = 128) -> int:
    """
    Snaps cut point to nearest zero crossing to eliminate clicks.
    """
    start = max(0, sample_idx - search_radius)
    end = min(len(audio) - 1, sample_idx + search_radius)
    segment = audio[start:end]
    zero_crossings = np.where(np.diff(np.sign(segment)))[0]
    if len(zero_crossings) > 0:
        best = zero_crossings[np.argmin(np.abs(zero_crossings - (sample_idx - start)))]
        return start + best
    return sample_idx

def generate_4x4_kit_slices(audio: np.ndarray, sr: int, bpm: float, onsets: list):
    """
    Constructs 16 musical pads with zero-crossing snapping and micro-fades.
    """
    kit_pads = []
    total_samples = len(audio)
    seconds_per_beat = 60.0 / bpm

    for i in range(16):
        if i < len(onsets):
            start_sec = onsets[i]
        else:
            start_sec = (i * seconds_per_beat * 0.5) % (total_samples / sr)

        # Approximate slice duration: 1/4 or 1/2 beat
        slice_dur_sec = seconds_per_beat * (0.5 if (i % 2 == 0) else 1.0)
        end_sec = min(total_samples / sr, start_sec + slice_dur_sec)

        start_idx = find_nearest_zero_crossing(audio, int(start_sec * sr))
        end_idx = find_nearest_zero_crossing(audio, int(end_sec * sr))

        kit_pads.append({
            "padIndex": i,
            "label": f"Slice {i+1}",
            "startOffsetSec": round(float(start_idx / sr), 3),
            "endOffsetSec": round(float(end_idx / sr), 3),
            "durationSec": round(float((end_idx - start_idx) / sr), 3),
            "gain": 1.0,
            "pan": 0.0
        })

    return kit_pads
