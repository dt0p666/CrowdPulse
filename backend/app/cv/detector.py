from pathlib import Path
from typing import List, Dict, Any
import numpy as np
import torch
from ultralytics import YOLO
from backend.app.core.config import settings

_MODEL_INSTANCE: YOLO | None = None


def get_yolo_detector(model_name: str = "yolov8n.pt") -> YOLO:
    """Singleton getter for pretrained YOLO pedestrian detector."""
    global _MODEL_INSTANCE
    if _MODEL_INSTANCE is None:
        weights_path = settings.MODELS_DIR / model_name
        if not weights_path.exists():
            # If model exists in root, use it or copy it
            root_weights = settings.ROOT_DIR / model_name
            if root_weights.exists():
                weights_path = root_weights
            else:
                weights_path = Path(model_name)
        
        _MODEL_INSTANCE = YOLO(str(weights_path))
    return _MODEL_INSTANCE


class PedestrianDetector:
    def __init__(self, conf_threshold: float = 0.25, model_name: str = "yolov8n.pt"):
        self.conf_threshold = conf_threshold
        self.model = get_yolo_detector(model_name)
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

    def detect(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect pedestrians (class 0: person) in a single BGR frame.
        Returns: list of detections with bbox [x1, y1, x2, y2] and confidence.
        """
        results = self.model.predict(
            source=frame,
            classes=[0],  # 0 is 'person' in COCO
            conf=self.conf_threshold,
            device=self.device,
            verbose=False
        )

        detections = []
        if not results or len(results) == 0:
            return detections

        boxes = results[0].boxes
        for box in boxes:
            xyxy = box.xyxy[0].cpu().numpy().tolist()
            conf = float(box.conf[0].cpu().numpy())
            detections.append({
                "bbox": [round(c, 1) for c in xyxy],
                "conf": round(conf, 3),
            })

        return detections
