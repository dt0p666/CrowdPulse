import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_list_datasets(client):
    response = client.get("/api/datasets")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    ids = [d["id"] for d in data]
    assert "crosswalk" in ids
    assert "fourway" in ids
    assert "night" in ids


def test_inspect_crosswalk(client):
    response = client.get("/api/datasets/crosswalk/inspect")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "crosswalk"
    assert data["row_count"] == 378
    assert data["columns"] == ["x", "y", "w", "h"]
    assert data["fps"] == 30.0
    assert data["estimated_duration_sec"] == 12.6
    assert "coordinate_ranges" in data
    assert "x" in data["coordinate_ranges"]


def test_process_crosswalk(client):
    response = client.post("/api/datasets/crosswalk/process")
    assert response.status_code == 200
    data = response.json()
    assert data["dataset_id"] == "crosswalk"
    assert data["total_frames"] == 378
    assert len(data["trajectories"]) == 378
    assert data["avg_speed_px_sec"] > 0
    assert "speed_percentiles" in data
    assert "grid_occupancy" in data
    assert len(data["grid_occupancy"]["occupancy_matrix"]) == 4


def test_compare_scenarios(client):
    response = client.get("/api/datasets/compare")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    names = [d["name"] for d in data]
    assert "Crosswalk" in names
    assert "Fourway" in names
    assert "Night" in names


def test_inspect_nonexistent(client):
    response = client.get("/api/datasets/non_existent_dataset/inspect")
    assert response.status_code == 404
