"""
Asynchronous Job Management for Audio Lab with SSE Progress Streaming.
"""

import asyncio
import time
import uuid
from typing import Dict, Any, Optional

class Job:
    def __init__(self, job_id: str, job_type: str, file_path: str):
        self.id = job_id
        self.type = job_type
        self.file_path = file_path
        self.status = "pending" # pending | processing | completed | failed
        self.progress = 0 # 0..100
        self.message = "Queued"
        self.result: Optional[Dict[str, Any]] = None
        self.error: Optional[str] = None
        self.created_at = time.time()
        self.subscribers: list[asyncio.Queue] = []

    def update(self, status: str, progress: int, message: str, result: Any = None, error: str = None):
        self.status = status
        self.progress = progress
        self.message = message
        if result:
            self.result = result
        if error:
            self.error = error

        event_data = {
            "jobId": self.id,
            "status": self.status,
            "progress": self.progress,
            "message": self.message
        }
        for q in self.subscribers:
            try:
                q.put_nowait(event_data)
            except Exception:
                pass

class JobManager:
    def __init__(self):
        self.jobs: Dict[str, Job] = {}

    def create_job(self, job_type: str, file_path: str) -> Job:
        job_id = f"job_{uuid.uuid4().hex[:12]}"
        job = Job(job_id, job_type, file_path)
        self.jobs[job_id] = job
        return job

    def get_job(self, job_id: str) -> Optional[Job]:
        return self.jobs.get(job_id)

    def delete_job(self, job_id: str) -> bool:
        if job_id in self.jobs:
            del self.jobs[job_id]
            return True
        return False

job_manager = JobManager()
