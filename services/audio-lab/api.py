"""
FastAPI Routes for Beatwave Audio Lab.
Binds to localhost:8765 by default; strictly isolated from third-party networks.
"""

import asyncio
import os
import torch
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from security import validate_and_save_upload, cleanup_file
from dsp import (
    compute_audio_hash,
    decode_audio_wav,
    estimate_bpm_and_beats,
    detect_transient_onsets,
    generate_4x4_kit_slices
)
from jobs import job_manager

router = APIRouter()

def detect_hardware():
    if torch.cuda.is_available():
        return f"CUDA ({torch.cuda.get_device_name(0)})"
    if torch.backends.mps.is_available():
        return "Apple Silicon (MPS)"
    return "CPU"

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "beatwave-audio-lab",
        "hardwareAcceleration": detect_hardware(),
        "demucsAvailable": False, # Optional stem-separation dependency
        "localhostOnly": True
    }

@router.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    contents = await file.read()
    safe_path = validate_and_save_upload(file.filename or "upload.wav", contents)

    try:
        content_hash = compute_audio_hash(contents)
        audio, sr = decode_audio_wav(safe_path)
        duration_sec = len(audio) / sr
        bpm, beats = estimate_bpm_and_beats(audio, sr)
        onsets = detect_transient_onsets(audio, sr)

        return {
            "contentHash": content_hash,
            "sampleRate": sr,
            "durationSec": round(duration_sec, 2),
            "estimatedBpm": bpm,
            "totalBeats": len(beats),
            "totalOnsets": len(onsets),
            "beatPositions": beats[:32],
            "transientOnsets": onsets[:16]
        }
    finally:
        cleanup_file(safe_path)

@router.post("/generate-kit")
async def generate_kit(file: UploadFile = File(...)):
    contents = await file.read()
    safe_path = validate_and_save_upload(file.filename or "upload.wav", contents)
    job = job_manager.create_job("generate_kit", safe_path)

    async def run_kit_generation():
        try:
            job.update("processing", 20, "Decoding audio and calculating hash...")
            await asyncio.sleep(0.05)
            audio, sr = decode_audio_wav(safe_path)

            job.update("processing", 50, "Estimating BPM and detecting transient onsets...")
            bpm, _ = estimate_bpm_and_beats(audio, sr)
            onsets = detect_transient_onsets(audio, sr)

            job.update("processing", 80, "Snapping slices to zero crossings and generating 4x4 kit...")
            kit_pads = generate_4x4_kit_slices(audio, sr, bpm, onsets)

            job.update(
                "completed",
                100,
                "Kit generation completed successfully.",
                result={
                    "bpm": bpm,
                    "sampleRate": sr,
                    "totalPads": len(kit_pads),
                    "pads": kit_pads
                }
            )
        except Exception as e:
            job.update("failed", 100, "Error generating kit", error=str(e))
        finally:
            cleanup_file(safe_path)

    asyncio.create_task(run_kit_generation())

    return {
        "jobId": job.id,
        "status": job.status,
        "eventsUrl": f"/jobs/{job.id}/events"
    }

@router.get("/jobs/{job_id}")
def get_job_status(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    return {
        "jobId": job.id,
        "status": job.status,
        "progress": job.progress,
        "message": job.message,
        "result": job.result,
        "error": job.error
    }

@router.get("/jobs/{job_id}/events")
async def stream_job_events(job_id: str):
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    queue: asyncio.Queue = asyncio.Queue()
    job.subscribers.append(queue)

    async def event_generator():
        try:
            # Yield current state immediately
            yield f"data: {{\"status\": \"{job.status}\", \"progress\": {job.progress}, \"message\": \"{job.message}\"}}\n\n"
            while job.status in ("pending", "processing"):
                data = await queue.get()
                import json
                yield f"data: {json.dumps(data)}\n\n"
        finally:
            if queue in job.subscribers:
                job.subscribers.remove(queue)

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    success = job_manager.delete_job(job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"deleted": True, "jobId": job_id}
