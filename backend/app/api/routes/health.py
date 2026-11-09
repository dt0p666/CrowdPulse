from fastapi import APIRouter
import sys
try:
    import torch
    TORCH_AVAILABLE = True
    TORCH_VERSION = torch.__version__
    CUDA_AVAILABLE = torch.cuda.is_available()
    DEVICE = "cuda" if CUDA_AVAILABLE else "cpu"
except Exception:
    torch = None
    TORCH_AVAILABLE = False
    TORCH_VERSION = "Unavailable"
    CUDA_AVAILABLE = False
    DEVICE = "cpu"
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
        "torch_available": TORCH_VERSION,
        "cuda_available": CUDA_AVAILABLE,
        "device": DEVICE,
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

