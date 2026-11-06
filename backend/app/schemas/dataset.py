from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class DatasetMeta(BaseModel):
    id: str
    name: str
    filename: str
    file_size_bytes: int
    row_count: int
    is_sample: bool = False
    columns: List[str]
    has_bounding_boxes: bool = True


class DatasetInspection(BaseModel):
    id: str
    name: str
    row_count: int
    columns: List[str]
    dtypes: Dict[str, str]
    missing_values: Dict[str, int]
    duplicate_rows: int
    coordinate_ranges: Dict[str, Dict[str, float]]
    first_rows: List[Dict[str, Any]]
    fps: float = 30.0
    estimated_duration_sec: float
    out_of_bounds_count: int


class TrajectoryPoint(BaseModel):
    frame: int
    time_sec: float
    x: float
    y: float
    w: float
    h: float
    center_x: float
    center_y: float
    speed_px_sec: float
    acceleration_px_sec2: float
    direction_deg: float


class SpatialGridSummary(BaseModel):
    grid_rows: int = 4
    grid_cols: int = 4
    occupancy_matrix: List[List[int]]


class DatasetProcessResult(BaseModel):
    dataset_id: str
    dataset_name: str
    total_frames: int
    fps: float = 30.0
    duration_sec: float
    avg_speed_px_sec: float
    max_speed_px_sec: float
    total_displacement_px: float
    spatial_coverage_pct: float
    trajectories: List[TrajectoryPoint]
    grid_occupancy: SpatialGridSummary
    speed_percentiles: Dict[str, float]
