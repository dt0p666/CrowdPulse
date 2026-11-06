import uuid
import threading
from pathlib import Path
from typing import List, Dict, Any, Optional
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel

from backend.app.core.config import settings
from backend.app.schemas.common import JobStatusResponse
from backend.app.cv.video_processor import video_processor, JOBS

router = APIRouter(tags=["Video Computer Vision"])


class AnalyzeRequest(BaseModel):
    conf_threshold: float = 0.25
    frame_stride: int = 1


def _resolve_video(video_id: str) -> Path:
    clean_id = video_id
    if not any(clean_id.endswith(ext) for ext in [".avi", ".mp4", ".mov"]):
        clean_id += ".avi"

    # Search in project root first (original videos)
    root_file = settings.ROOT_DIR / clean_id
    if root_file.exists():
        return root_file

    # Search in raw data dir
    raw_file = settings.RAW_DATA_DIR / clean_id
    if raw_file.exists():
        return raw_file

    raise HTTPException(status_code=404, detail=f"Video '{video_id}' not found.")


@router.get("/videos", response_model=List[Dict[str, Any]])
def list_videos():
    """List available video files (both reference AVI files and uploaded videos)."""
    videos = []
    seen = set()

    # Original videos in project root
    for p in settings.ROOT_DIR.glob("*.avi"):
        seen.add(p.name)
        videos.append({
            "id": p.stem,
            "filename": p.name,
            "file_size_bytes": p.stat().st_size,
            "is_sample": True,
        })

    # Uploaded videos in data/raw
    for p in settings.RAW_DATA_DIR.glob("*.*"):
        if p.name in seen or p.suffix.lower() not in settings.ALLOWED_VIDEO_EXTENSIONS:
            continue
        seen.add(p.name)
        videos.append({
            "id": p.stem,
            "filename": p.name,
            "file_size_bytes": p.stat().st_size,
            "is_sample": False,
        })

    return videos


@router.get("/videos/{video_id}")
def get_video_info(video_id: str):
    """Retrieve video resolution, FPS, total frames, and duration."""
    video_path = _resolve_video(video_id)
    try:
        return video_processor.inspect_video(video_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to inspect video: {str(e)}")


@router.post("/videos/upload")
async def upload_video(file: UploadFile = File(...)):
    """Upload a new video file (.avi, .mp4, .mov)."""
    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{ext}'. Allowed: {settings.ALLOWED_VIDEO_EXTENSIONS}",
        )

    dest_path = settings.RAW_DATA_DIR / file.filename
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        info = video_processor.inspect_video(dest_path)
        return {
            "success": True,
            "id": dest_path.stem,
            "filename": file.filename,
            "metadata": info,
        }
    except Exception as e:
        if dest_path.exists():
            dest_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/videos/{video_id}/analyze")
def start_video_analysis(video_id: str, req: AnalyzeRequest = AnalyzeRequest()):
    """Trigger background computer vision analysis (pedestrian detection & tracking)."""
    video_path = _resolve_video(video_id)
    job_id = str(uuid.uuid4())[:8]

    JOBS[job_id] = {
        "job_id": job_id,
        "status": "pending",
        "progress": 0.0,
        "current_step": "Queued",
        "error": None,
        "result_id": None,
    }

    # Start processing thread
    thread = threading.Thread(
        target=video_processor.run_analysis_job,
        args=(job_id, video_path, req.conf_threshold, req.frame_stride),
        daemon=True
    )
    thread.start()

    return {"job_id": job_id, "status": "queued"}


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str):
    """Poll processing progress and status of a video analysis job."""
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found.")
    return JOBS[job_id]


@router.get("/analyses/{analysis_id}")
def get_analysis_result(analysis_id: str):
    """Retrieve full structured analysis output (timeline, active tracks, keyframes)."""
    file_path = settings.ANALYSES_DIR / f"{analysis_id}.json"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Analysis result not found.")
    
    with open(file_path, "r") as f:
        return json.load(f)
