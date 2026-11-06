import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_models_status_endpoint(client):
    response = client.get("/api/models/status")
    assert response.status_code == 200
    data = response.json()
    assert "random_forest" in data
    assert "baseline_logistic_regression" in data
    assert data["random_forest"]["accuracy"] > 0.70
    assert "feature_importances" in data
    assert "confusion_matrix" in data["random_forest"]
    assert "leakage_prevention" in data


def test_models_explain_endpoint(client):
    # Pass 8 features
    sample_features = [8.0, 18.0, 30.0, 0.65, 2.0, 0.45, 0.85, 0.80]
    response = client.post("/api/models/explain", json={"features": sample_features})
    assert response.status_code == 200
    data = response.json()
    assert data["predicted_crowd_state"] in ["Congested", "Elevated Risk"]
    assert "contributing_features" in data
    assert len(data["contributing_features"]) == 8
    assert "scientific_disclaimer" in data


def test_models_simulate_endpoint(client):
    response = client.post("/api/models/simulate", json={"scenario_type": "surge_inflow"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_simulated"] is True
    assert "SIMULATED" in data["simulation_label"]
    assert "assessment" in data
