"""
Audio Lab Service Entrypoint.
Runs with Uvicorn on 127.0.0.1:8765.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import router
from config import config

app = FastAPI(
    title="Beatwave Local Audio Lab",
    description="Local-first audio analysis, beat tracking, and 4x4 auto-kit generation",
    version="0.1.0"
)

# Strict localhost-only CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=config.host, port=config.port, log_level="info")
