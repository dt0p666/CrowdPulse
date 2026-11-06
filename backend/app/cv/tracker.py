import math
import numpy as np
from typing import List, Dict, Any, Optional


def box_iou(boxA: List[float], boxB: List[float]) -> float:
    """Compute Intersection over Union (IoU) of two boxes [x1, y1, x2, y2]."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])

    interArea = max(0.0, xB - xA) * max(0.0, yB - yA)
    boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    unionArea = boxAArea + boxBArea - interArea

    return interArea / unionArea if unionArea > 0 else 0.0


class Track:
    def __init__(self, track_id: int, bbox: List[float], confidence: float, frame_idx: int):
        self.track_id = track_id
        self.bbox = bbox  # [x1, y1, x2, y2]
        self.confidence = confidence
        self.start_frame = frame_idx
        self.last_frame = frame_idx
        self.age = 1
        self.lost_frames = 0
        
        # Center positions [(frame, cx, cy)]
        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
        self.centers: List[Dict[str, Any]] = [{"frame": frame_idx, "cx": cx, "cy": cy}]
        self.velocities_px_sec: List[float] = [0.0]

    def update(self, bbox: List[float], confidence: float, frame_idx: int, fps: float = 30.0):
        self.bbox = bbox
        self.confidence = confidence
        self.last_frame = frame_idx
        self.age += 1
        self.lost_frames = 0
        
        cx = (bbox[0] + bbox[2]) / 2.0
        cy = (bbox[1] + bbox[3]) / 2.0
        
        # Calculate instantaneous speed from previous point
        prev = self.centers[-1]
        dt = max(1, frame_idx - prev["frame"]) / fps
        dist = math.sqrt((cx - prev["cx"])**2 + (cy - prev["cy"])**2)
        speed = dist / dt
        
        self.centers.append({"frame": frame_idx, "cx": cx, "cy": cy})
        self.velocities_px_sec.append(round(speed, 2))

    def mark_missed(self):
        self.lost_frames += 1


class ByteCentroidTracker:
    """Anonymous multi-pedestrian tracking using IoU and spatial distance gating."""
    def __init__(self, max_lost: int = 15, iou_threshold: float = 0.25):
        self.next_id = 1
        self.max_lost = max_lost
        self.iou_threshold = iou_threshold
        self.tracks: Dict[int, Track] = {}
        self.completed_tracks: List[Track] = []

    def update(self, detections: List[Dict[str, Any]], frame_idx: int, fps: float = 30.0) -> List[Dict[str, Any]]:
        """
        detections: list of dicts with 'bbox' [x1, y1, x2, y2] and 'conf'
        Returns: list of active tracked pedestrians with track_id
        """
        active_ids = list(self.tracks.keys())
        assigned_det = set()
        assigned_track = set()

        # Step 1: Match existing tracks with detections via IoU
        if active_ids and detections:
            cost_matrix = []
            for t_id in active_ids:
                track = self.tracks[t_id]
                row = []
                for det in detections:
                    iou = box_iou(track.bbox, det["bbox"])
                    row.append(iou)
                cost_matrix.append(row)

            # Greedy assignment by highest IoU
            cost_np = np.array(cost_matrix)
            while True:
                if cost_np.size == 0:
                    break
                max_val = np.max(cost_np)
                if max_val < self.iou_threshold:
                    break
                t_idx, d_idx = np.unravel_index(np.argmax(cost_np), cost_np.shape)
                if t_idx in assigned_track or d_idx in assigned_det:
                    cost_np[t_idx, d_idx] = -1.0
                    continue
                
                track_id = active_ids[t_idx]
                self.tracks[track_id].update(detections[d_idx]["bbox"], detections[d_idx]["conf"], frame_idx, fps)
                assigned_track.add(t_idx)
                assigned_det.add(d_idx)
                cost_np[t_idx, :] = -1.0
                cost_np[:, d_idx] = -1.0

        # Step 2: Mark unmatched tracks as lost
        for idx, t_id in enumerate(active_ids):
            if idx not in assigned_track:
                self.tracks[t_id].mark_missed()

        # Step 3: Remove expired tracks
        for t_id in list(self.tracks.keys()):
            if self.tracks[t_id].lost_frames > self.max_lost:
                self.completed_tracks.append(self.tracks[t_id])
                del self.tracks[t_id]

        # Step 4: Create new tracks for unassigned detections
        for d_idx, det in enumerate(detections):
            if d_idx not in assigned_det:
                new_track = Track(self.next_id, det["bbox"], det["conf"], frame_idx)
                self.tracks[self.next_id] = new_track
                self.next_id += 1

        # Return currently active tracks that were updated this frame
        results = []
        for t_id, track in self.tracks.items():
            if track.last_frame == frame_idx:
                results.append({
                    "track_id": track.track_id,
                    "bbox": track.bbox,
                    "confidence": track.confidence,
                    "center": track.centers[-1],
                    "current_speed_px_sec": track.velocities_px_sec[-1],
                    "trajectory_length": len(track.centers),
                })
        return results
