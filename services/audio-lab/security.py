import os
import uuid
from fastapi import HTTPException
from config import config

def validate_and_save_upload(filename: str, file_bytes: bytes) -> str:
    """
    Validates uploaded file size and extension, and writes to an isolated UUID path
    to prevent path traversal and arbitrary execution.
    """
    if len(file_bytes) > config.max_upload_size_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {config.max_upload_size_bytes // (1024*1024)}MB"
        )

    _, ext = os.path.splitext(filename.lower())
    if ext not in config.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(config.allowed_extensions)}"
        )

    # Secure random UUID filename
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    safe_path = os.path.join(config.temp_dir, safe_filename)

    # Defensive path containment check
    if not os.path.abspath(safe_path).startswith(os.path.abspath(config.temp_dir)):
        raise HTTPException(status_code=400, detail="Invalid path traversal attempt.")

    with open(safe_path, "wb") as f:
        f.write(file_bytes)

    return safe_path

def cleanup_file(path: str) -> None:
    try:
        if os.path.exists(path) and os.path.abspath(path).startswith(os.path.abspath(config.temp_dir)):
            os.remove(path)
    except Exception as e:
        print(f"[AudioLab Security] Cleanup error for {path}: {e}")
