import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.analytics.crowd_metrics import crowd_analytics, VENUE_ZONES, METRIC_DEFINITIONS


@pytest.fixture
def client():
    return TestClient(app)


def test_metric_definitions_endpoint(client):
    response = client.get("/api/metrics/definitions")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data
    assert "venue_zones" in data
    assert len(data["venue_zones"]) == 4
    assert "directional_conflict_index" in data["metrics"]
    assert "formula" in data["metrics"]["directional_conflict_index"]
    assert "limitations" in data["metrics"]["directional_conflict_index"]


def test_zone_assignment():
    assert crowd_analytics.assign_zone(100, 100) == "zone_1"
    assert crowd_analytics.assign_zone(1200, 100) == "zone_2"
    assert crowd_analytics.assign_zone(100, 700) == "zone_3"
    assert crowd_analytics.assign_zone(1200, 700) == "zone_4"


def test_timeline_metrics_computation():
    mock_timeline = [
        {
            "frame": 0,
            "time_sec": 0.0,
            "pedestrian_count": 2,
            "tracks": [
                {"bbox": [100, 100, 150, 200], "center": {"cx": 125, "cy": 150}, "current_speed_px_sec": 30.0},
                {"bbox": [1100, 100, 1150, 200], "center": {"cx": 1125, "cy": 150}, "current_speed_px_sec": 45.0},
            ]
        },
        {
            "frame": 1,
            "time_sec": 0.033,
            "pedestrian_count": 1,
            "tracks": [
                {"bbox": [105, 100, 155, 200], "center": {"cx": 130, "cy": 150}, "current_speed_px_sec": 28.0},
            ]
        }
    ]

    metrics = crowd_analytics.analyze_timeline_metrics(mock_timeline, fps=30.0)
    assert "primary_crowd_state" in metrics
    assert "zones" in metrics
    assert len(metrics["zones"]) == 4
    assert "congestion_timeline" in metrics
    assert len(metrics["congestion_timeline"]) == 2
    assert metrics["primary_crowd_state"] in ["Stable", "Densifying", "Congested", "Elevated Risk"]
