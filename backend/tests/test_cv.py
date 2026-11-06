import pytest
import numpy as np
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.cv.tracker import ByteCentroidTracker, box_iou
from backend.app.cv.detector import PedestrianDetector


@pytest.fixture
def client():
    return TestClient(app)


def test_list_videos(client):
    response = client.get("/api/videos")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    ids = [v["id"] for v in data]
    assert "crosswalk" in ids
    assert "fourway" in ids
    assert "night" in ids


def test_get_video_info(client):
    response = client.get("/api/videos/crosswalk")
    assert response.status_code == 200
    info = response.json()
    assert info["width"] == 1920
    assert info["height"] == 1080
    assert info["fps"] == 30.0
    assert info["decodable"] is True
    assert info["total_frames"] == 378


def test_tracker_logic():
    tracker = ByteCentroidTracker(max_lost=5, iou_threshold=0.2)
    # Frame 0: detection at [100, 100, 150, 200]
    det0 = [{"bbox": [100.0, 100.0, 150.0, 200.0], "conf": 0.85}]
    res0 = tracker.update(det0, frame_idx=0, fps=30.0)
    assert len(res0) == 1
    t_id = res0[0]["track_id"]
    assert t_id == 1

    # Frame 1: shifted slightly to [105, 100, 155, 200]
    det1 = [{"bbox": [105.0, 100.0, 155.0, 200.0], "conf": 0.88}]
    res1 = tracker.update(det1, frame_idx=1, fps=30.0)
    assert len(res1) == 1
    assert res1[0]["track_id"] == t_id  # Maintains anonymous track ID
    assert res1[0]["trajectory_length"] == 2
    assert res1[0]["current_speed_px_sec"] > 0


def test_box_iou():
    boxA = [0, 0, 10, 10]
    boxB = [0, 0, 10, 10]
    assert box_iou(boxA, boxB) == 1.0

    boxC = [20, 20, 30, 30]
    assert box_iou(boxA, boxC) == 0.0
