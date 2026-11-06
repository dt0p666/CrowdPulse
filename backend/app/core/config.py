from pathlib import Path
from pydantic import BaseModel
import os

# Project root is the repository top-level directory (two levels up from app/core)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent


class Settings(BaseModel):
    PROJECT_NAME: str = "CrowdPulse"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # Directory paths relative to project root
    ROOT_DIR: Path = PROJECT_ROOT
    DATA_DIR: Path = PROJECT_ROOT / "data"
    RAW_DATA_DIR: Path = PROJECT_ROOT / "data" / "raw"
    SAMPLE_DATA_DIR: Path = PROJECT_ROOT / "data" / "sample"
    PROCESSED_DATA_DIR: Path = PROJECT_ROOT / "data" / "processed"
    MODELS_DIR: Path = PROJECT_ROOT / "models"
    OUTPUTS_DIR: Path = PROJECT_ROOT / "outputs"
    ANALYSES_DIR: Path = PROJECT_ROOT / "outputs" / "analyses"
    
    # CORS settings
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # File processing constraints
    MAX_VIDEO_SIZE_MB: int = 250
    MAX_CSV_SIZE_MB: int = 50
    ALLOWED_VIDEO_EXTENSIONS: set[str] = {".avi", ".mp4", ".mov", ".mkv"}
    ALLOWED_CSV_EXTENSIONS: set[str] = {".csv"}
    
    # Computer Vision default params
    DEFAULT_CONF_THRESHOLD: float = 0.25
    DEFAULT_FRAME_STRIDE: int = 1  # 1 = every frame, 2 = every other frame
    DEFAULT_YOLO_MODEL: str = "yolov8n.pt"


settings = Settings()

# Ensure runtime directories exist
for path in [
    settings.DATA_DIR,
    settings.RAW_DATA_DIR,
    settings.SAMPLE_DATA_DIR,
    settings.PROCESSED_DATA_DIR,
    settings.MODELS_DIR,
    settings.OUTPUTS_DIR,
    settings.ANALYSES_DIR,
]:
    path.mkdir(parents=True, exist_ok=True)
