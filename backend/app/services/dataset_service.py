from pathlib import Path
import json
import math
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from fastapi import HTTPException

from backend.app.core.config import settings
from backend.app.schemas.dataset import (
    DatasetMeta,
    DatasetInspection,
    TrajectoryPoint,
    SpatialGridSummary,
    DatasetProcessResult,
)


class DatasetService:
    def _resolve_file_path(self, dataset_id: str) -> Path:
        """Resolve dataset file path from sample or raw directories."""
        clean_id = dataset_id.replace(".csv", "")
        filename = f"{clean_id}.csv"
        
        # Check sample dir first
        sample_path = settings.SAMPLE_DATA_DIR / filename
        if sample_path.exists():
            return sample_path
            
        # Check raw dir
        raw_path = settings.RAW_DATA_DIR / filename
        if raw_path.exists():
            return raw_path
            
        # Check root dir for original
        root_path = settings.ROOT_DIR / filename
        if root_path.exists():
            return root_path

        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found.")

    def list_datasets(self) -> List[DatasetMeta]:
        """List all available CSV datasets in sample and raw folders."""
        datasets = []
        seen = set()

        # Check sample datasets
        for p in sorted(settings.SAMPLE_DATA_DIR.glob("*.csv")):
            seen.add(p.name)
            try:
                df = pd.read_csv(p, nrows=5)
                row_count = sum(1 for _ in open(p, "rb")) - 1
                datasets.append(
                    DatasetMeta(
                        id=p.stem,
                        name=p.stem.capitalize(),
                        filename=p.name,
                        file_size_bytes=p.stat().st_size,
                        row_count=max(0, row_count),
                        is_sample=True,
                        columns=list(df.columns),
                        has_bounding_boxes=all(c in df.columns for c in ["x", "y", "w", "h"]),
                    )
                )
            except Exception:
                continue

        # Check uploaded raw datasets
        for p in sorted(settings.RAW_DATA_DIR.glob("*.csv")):
            if p.name in seen:
                continue
            seen.add(p.name)
            try:
                df = pd.read_csv(p, nrows=5)
                row_count = sum(1 for _ in open(p, "rb")) - 1
                datasets.append(
                    DatasetMeta(
                        id=p.stem,
                        name=p.stem.capitalize(),
                        filename=p.name,
                        file_size_bytes=p.stat().st_size,
                        row_count=max(0, row_count),
                        is_sample=False,
                        columns=list(df.columns),
                        has_bounding_boxes=all(c in df.columns for c in ["x", "y", "w", "h"]),
                    )
                )
            except Exception:
                continue

        return datasets

    def inspect_dataset(self, dataset_id: str) -> DatasetInspection:
        """Inspect schema, data quality, duplicates, and bounding box properties."""
        file_path = self._resolve_file_path(dataset_id)
        df = pd.read_csv(file_path)

        req_cols = ["x", "y", "w", "h"]
        missing_required = [c for c in req_cols if c not in df.columns]
        if missing_required:
            raise HTTPException(
                status_code=400,
                detail=f"Dataset lacks required bounding box columns: {missing_required}",
            )

        row_count = len(df)
        dtypes = {col: str(dtype) for col, dtype in df.dtypes.items()}
        missing = {col: int(count) for col, count in df.isnull().sum().items()}
        duplicates = int(df.duplicated().sum())

        coord_ranges = {}
        for col in req_cols:
            coord_ranges[col] = {
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "median": float(df[col].median()),
            }

        # Out-of-bounds detection (1920x1080 canvas)
        oob_mask = (df["x"] < 0) | (df["y"] < 0) | (df["x"] + df["w"] > 1920) | (df["y"] + df["h"] > 1080)
        oob_count = int(oob_mask.sum())

        first_rows = df.head(10).to_dict(orient="records")
        fps = 30.0

        return DatasetInspection(
            id=file_path.stem,
            name=file_path.stem.capitalize(),
            row_count=row_count,
            columns=list(df.columns),
            dtypes=dtypes,
            missing_values=missing,
            duplicate_rows=duplicates,
            coordinate_ranges=coord_ranges,
            first_rows=first_rows,
            fps=fps,
            estimated_duration_sec=round(row_count / fps, 2),
            out_of_bounds_count=oob_count,
        )

    def process_dataset(self, dataset_id: str, fps: float = 30.0) -> DatasetProcessResult:
        """Process trajectory, speed, acceleration, and spatial occupancy."""
        cache_file = settings.PROCESSED_DATA_DIR / f"{dataset_id}_processed.json"
        if cache_file.exists():
            try:
                with open(cache_file, "r") as f:
                    cached_data = json.load(f)
                return DatasetProcessResult(**cached_data)
            except Exception:
                pass

        file_path = self._resolve_file_path(dataset_id)
        df = pd.read_csv(file_path)

        req_cols = ["x", "y", "w", "h"]
        if not all(c in df.columns for c in req_cols):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain {req_cols}",
            )

        dt = 1.0 / fps
        total_frames = len(df)

        cx = df["x"] + df["w"] / 2.0
        cy = df["y"] + df["h"] / 2.0

        dx = cx.diff().fillna(0)
        dy = cy.diff().fillna(0)
        step_disp = np.sqrt(dx**2 + dy**2)

        # Raw instantaneous speed in pixels/second
        raw_speed = step_disp / dt

        # Smooth speed with rolling window to remove single-pixel digitization noise
        smooth_speed = raw_speed.rolling(window=5, min_periods=1, center=True).mean()

        # Acceleration in pixels/second^2
        accel = smooth_speed.diff().fillna(0) / dt

        # Direction in degrees (0 to 360)
        angles_rad = np.arctan2(dy, dx)
        angles_deg = (np.degrees(angles_rad) + 360) % 360

        trajectories: List[TrajectoryPoint] = []
        for i in range(total_frames):
            trajectories.append(
                TrajectoryPoint(
                    frame=i,
                    time_sec=round(i * dt, 3),
                    x=round(float(df.at[i, "x"]), 1),
                    y=round(float(df.at[i, "y"]), 1),
                    w=round(float(df.at[i, "w"]), 1),
                    h=round(float(df.at[i, "h"]), 1),
                    center_x=round(float(cx[i]), 1),
                    center_y=round(float(cy[i]), 1),
                    speed_px_sec=round(float(smooth_speed[i]), 2),
                    acceleration_px_sec2=round(float(accel[i]), 2),
                    direction_deg=round(float(angles_deg[i]), 1),
                )
            )

        # Spatial Grid Occupancy (4x4 across 1920x1080)
        grid_rows, grid_cols = 4, 4
        cell_w, cell_h = 1920 / grid_cols, 1080 / grid_rows
        matrix = [[0 for _ in range(grid_cols)] for _ in range(grid_rows)]

        for i in range(total_frames):
            c_col = int(np.clip(cx[i] // cell_w, 0, grid_cols - 1))
            c_row = int(np.clip(cy[i] // cell_h, 0, grid_rows - 1))
            matrix[c_row][c_col] += 1

        occupied_cells = sum(1 for r in range(grid_rows) for c in range(grid_cols) if matrix[r][c] > 0)
        coverage_pct = round((occupied_cells / (grid_rows * grid_cols)) * 100, 1)

        speeds = smooth_speed.values
        speed_percentiles = {
            "p25": round(float(np.percentile(speeds, 25)), 2),
            "p50": round(float(np.percentile(speeds, 50)), 2),
            "p75": round(float(np.percentile(speeds, 75)), 2),
            "p95": round(float(np.percentile(speeds, 95)), 2),
        }

        result = DatasetProcessResult(
            dataset_id=file_path.stem,
            dataset_name=file_path.stem.capitalize(),
            total_frames=total_frames,
            fps=fps,
            duration_sec=round(total_frames / fps, 2),
            avg_speed_px_sec=round(float(np.mean(speeds)), 2),
            max_speed_px_sec=round(float(np.max(speeds)), 2),
            total_displacement_px=round(float(np.sum(step_disp)), 1),
            spatial_coverage_pct=coverage_pct,
            trajectories=trajectories,
            grid_occupancy=SpatialGridSummary(occupancy_matrix=matrix),
            speed_percentiles=speed_percentiles,
        )

        # Cache result
        try:
            with open(cache_file, "w") as f:
                json.dump(result.model_dump(), f)
        except Exception:
            pass

        return result

    def compare_scenarios(self) -> List[Dict[str, Any]]:
        """Compare all sample scenarios (crosswalk, fourway, night)."""
        comparisons = []
        for name in ["crosswalk", "fourway", "night"]:
            try:
                proc = self.process_dataset(name)
                comparisons.append({
                    "id": proc.dataset_id,
                    "name": proc.dataset_name,
                    "frames": proc.total_frames,
                    "duration_sec": proc.duration_sec,
                    "avg_speed_px_sec": proc.avg_speed_px_sec,
                    "max_speed_px_sec": proc.max_speed_px_sec,
                    "total_displacement_px": proc.total_displacement_px,
                    "spatial_coverage_pct": proc.spatial_coverage_pct,
                    "speed_p50": proc.speed_percentiles["p50"],
                    "speed_p95": proc.speed_percentiles["p95"],
                })
            except Exception:
                pass
        return comparisons


dataset_service = DatasetService()
