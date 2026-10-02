import os
import tempfile
from pydantic import BaseModel

class AudioLabConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 8765
    max_upload_size_bytes: int = 50 * 1024 * 1024  # 50 MB
    allowed_extensions: tuple = (".wav", ".mp3", ".flac", ".ogg", ".m4a")
    temp_dir: str = os.path.join(tempfile.gettempdir(), "beatwave_audio_lab")
    max_concurrent_jobs: int = 4
    default_sample_rate: int = 44100

config = AudioLabConfig()
os.makedirs(config.temp_dir, exist_ok=True)
