from fastapi import APIRouter
import sys
import torch
from datetime import datetime, timezone
from backend.app.schemas.common import HealthCheckResponse
from backend.app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse, tags=["System"])
def check_health():
    """Verify backend health, runtime environment, and storage availability."""
    sample_files = [f.name for f in settings.SAMPLE_DATA_DIR.glob("*") if f.is_file()]
    
    env_info = {
        "python_version": sys.version.split()[0],
        "torch_available": torch.__version__,
        "cuda_available": torch.cuda.is_available(),
        "device": "cuda" if torch.cuda.is_available() else "cpu",
        "sample_datasets_count": len(sample_files),
        "sample_datasets": sample_files,
        "storage_ready": settings.ANALYSES_DIR.exists() and settings.SAMPLE_DATA_DIR.exists()
    }
    
    return HealthCheckResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        timestamp=datetime.now(timezone.utc),
        environment=env_info
    )

