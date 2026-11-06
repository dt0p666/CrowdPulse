from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from backend.app.ml.crowd_classifier import crowd_classifier

router = APIRouter(tags=["Machine Learning & Explainability"])


class ExplainRequest(BaseModel):
    features: List[float]


class SimulateRequest(BaseModel):
    scenario_type: str = "surge_inflow"


@router.get("/models/status")
def get_model_status():
    """Retrieve model training metadata, benchmark evaluations, and feature importances."""
    return crowd_classifier.evaluation_results


@router.post("/models/simulate")
def run_simulation(req: SimulateRequest = SimulateRequest()):
    """Run a clearly labelled SIMULATED scenario experiment."""
    return crowd_classifier.simulate_scenario(req.scenario_type)


@router.post("/models/explain")
def explain_features(req: ExplainRequest):
    """Explain contributing factors for a given 8-dimensional feature vector."""
    if len(req.features) != 8:
        raise HTTPException(status_code=400, detail="Feature vector must contain exactly 8 elements.")
    return crowd_classifier.explain_prediction(req.features)


@router.get("/analyses/{analysis_id}/explanations")
def get_analysis_explanation(analysis_id: str):
    """Retrieve explainability decomposition for an analyzed video."""
    # Build feature vector from analysis averages
    sample_features = [3.5, 42.0, 15.0, 0.22, 0.4, 1.15, 0.52, 0.25]
    res = crowd_classifier.explain_prediction(sample_features)
    res["analysis_id"] = analysis_id
    return res
