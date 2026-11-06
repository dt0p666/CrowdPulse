from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any
from pathlib import Path
import shutil

from backend.app.core.config import settings
from backend.app.schemas.dataset import (
    DatasetMeta,
    DatasetInspection,
    DatasetProcessResult,
)
from backend.app.services.dataset_service import dataset_service

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get("", response_model=List[DatasetMeta])
def list_datasets():
    """List all available reference and user-uploaded CSV datasets."""
    return dataset_service.list_datasets()


@router.get("/compare", response_model=List[Dict[str, Any]])
def compare_datasets():
    """Compare cross-scenario metrics across available reference datasets."""
    return dataset_service.compare_scenarios()


@router.get("/{dataset_id}/inspect", response_model=DatasetInspection)
def inspect_dataset(dataset_id: str):
    """Inspect schema, statistics, bounding box coordinate bounds, and anomalies."""
    return dataset_service.inspect_dataset(dataset_id)


@router.post("/{dataset_id}/process", response_model=DatasetProcessResult)
def process_dataset(dataset_id: str):
    """Process trajectory reconstruction, image-space speed, acceleration, and spatial occupancy."""
    return dataset_service.process_dataset(dataset_id)


@router.post("/upload", response_model=DatasetMeta)
async def upload_dataset(file: UploadFile = File(...)):
    """Upload a new CSV dataset for spatiotemporal analysis."""
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only .csv files are supported.")

    dest_path = settings.RAW_DATA_DIR / file.filename
    try:
        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Verify schema immediately
    try:
        inspection = dataset_service.inspect_dataset(dest_path.stem)
        return DatasetMeta(
            id=inspection.id,
            name=inspection.name,
            filename=file.filename,
            file_size_bytes=dest_path.stat().st_size,
            row_count=inspection.row_count,
            is_sample=False,
            columns=inspection.columns,
            has_bounding_boxes=True,
        )
    except Exception as e:
        if dest_path.exists():
            dest_path.unlink()
        raise HTTPException(status_code=400, detail=f"Invalid CSV dataset: {str(e)}")
