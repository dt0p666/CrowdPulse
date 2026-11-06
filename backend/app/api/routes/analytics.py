import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from backend.app.core.config import settings
from backend.app.analytics.crowd_metrics import crowd_analytics, METRIC_DEFINITIONS, VENUE_ZONES

router = APIRouter(tags=["Crowd Analytics"])


@router.get("/metrics/definitions")
def get_metric_definitions():
    """Retrieve explicit scientific documentation for all measured and derived metrics."""
    return {
        "venue_zones": VENUE_ZONES,
        "metrics": METRIC_DEFINITIONS
    }


@router.get("/analyses/{analysis_id}/metrics")
def get_analysis_metrics(analysis_id: str):
    """Calculate and return spatiotemporal crowd metrics, zone occupancy, and congestion indexes."""
    analysis_file = settings.ANALYSES_DIR / f"{analysis_id}.json"
    if not analysis_file.exists():
        raise HTTPException(status_code=404, detail="Analysis result not found.")

    with open(analysis_file, "r") as f:
        data = json.load(f)

    timeline = data.get("timeline", [])
    fps = data.get("fps", 30.0)

    metrics = crowd_analytics.analyze_timeline_metrics(timeline, fps=fps)
    return {
        "analysis_id": analysis_id,
        "video_name": data.get("video_name"),
        "total_frames": data.get("total_frames"),
        "duration_sec": data.get("duration_sec"),
        "metrics": metrics
    }


@router.get("/analyses/{analysis_id}/zones")
def get_zone_analytics(analysis_id: str):
    """Retrieve zone occupancy distribution and per-zone temporal curves."""
    analysis_file = settings.ANALYSES_DIR / f"{analysis_id}.json"
    if not analysis_file.exists():
        raise HTTPException(status_code=404, detail="Analysis result not found.")

    with open(analysis_file, "r") as f:
        data = json.load(f)

    timeline = data.get("timeline", [])
    metrics = crowd_analytics.analyze_timeline_metrics(timeline, fps=data.get("fps", 30.0))

    return {
        "analysis_id": analysis_id,
        "zones": metrics["zones"],
        "zone_timelines": metrics["zone_timelines"]
    }
