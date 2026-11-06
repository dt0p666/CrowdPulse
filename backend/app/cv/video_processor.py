import cv2
import json
import base64
import uuid
import threading
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np

from backend.app.core.config import settings
from backend.app.cv.detector import PedestrianDetector
from backend.app.cv.tracker import ByteCentroidTracker

# In-memory background jobs registry: job_id -> status dict
JOBS: Dict[str, Dict[str, Any]] = {}


class VideoProcessor:
    @staticmethod
    def inspect_video(video_path: Path) -> Dict[str, Any]:
        """Inspect video file metadata using OpenCV."""
        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise ValueError(f"Unable to decode video at {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Read first frame to verify decoder
        ret, frame = cap.read()
        cap.release()

        # Count total frames by scanning if header is 0
        cap = cv2.VideoCapture(str(video_path))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames <= 0:
            total_frames = 0
            while True:
                r, _ = cap.read()
                if not r:
                    break
                total_frames += 1
        cap.release()

        duration = round(total_frames / fps, 2) if fps > 0 else 0.0

        return {
            "filename": video_path.name,
            "file_size_bytes": video_path.stat().st_size,
            "width": width,
            "height": height,
            "fps": round(fps, 2),
            "total_frames": total_frames,
            "duration_sec": duration,
            "decodable": ret,
        }

    @staticmethod
    def run_analysis_job(
        job_id: str,
        video_path: Path,
        conf_threshold: float = 0.25,
        frame_stride: int = 1,
        max_preview_frames: int = 30,
    ):
        """Execute pedestrian detection and tracking in a background thread."""
        try:
            JOBS[job_id]["status"] = "running"
            JOBS[job_id]["current_step"] = "Initializing detector & video stream"

            cap = cv2.VideoCapture(str(video_path))
            if not cap.isOpened():
                raise RuntimeError(f"Could not open video file: {video_path}")

            fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Count frames if needed
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            if total_frames <= 0:
                # Fallback estimate
                total_frames = 300

            detector = PedestrianDetector(conf_threshold=conf_threshold)
            tracker = ByteCentroidTracker(max_lost=15, iou_threshold=0.25)

            frame_records: List[Dict[str, Any]] = []
            preview_frames: List[Dict[str, Any]] = []
            frame_idx = 0
            actual_frames_read = 0

            preview_interval = max(1, total_frames // max_preview_frames)

            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                actual_frames_read += 1

                # Check stride
                if frame_idx % frame_stride == 0:
                    detections = detector.detect(frame)
                    active_tracks = tracker.update(detections, frame_idx, fps=fps)

                    frame_records.append({
                        "frame": frame_idx,
                        "time_sec": round(frame_idx / fps, 2),
                        "pedestrian_count": len(active_tracks),
                        "tracks": active_tracks,
                    })

                    # Generate annotated preview keyframe
                    if frame_idx % preview_interval == 0 and len(preview_frames) < max_preview_frames:
                        annotated = frame.copy()
                        for trk in active_tracks:
                            b = trk["bbox"]
                            t_id = trk["track_id"]
                            spd = trk.get("current_speed_px_sec", 0.0)
                            # Draw box
                            cv2.rectangle(
                                annotated,
                                (int(b[0]), int(b[1])),
                                (int(b[2]), int(b[3])),
                                (0, 220, 255),
                                2
                            )
                            # Draw label
                            label = f"ID:{t_id} | {spd:.0f}px/s"
                            cv2.putText(
                                annotated,
                                label,
                                (int(b[0]), max(20, int(b[1]) - 8)),
                                cv2.FONT_HERSHEY_SIMPLEX,
                                0.5,
                                (0, 255, 128),
                                2
                            )

                        # Resize preview for lightweight frontend rendering (e.g. 640x360)
                        preview_resized = cv2.resize(annotated, (640, 360))
                        _, buffer = cv2.imencode(".jpg", preview_resized, [cv2.IMWRITE_JPEG_QUALITY, 70])
                        b64_str = base64.b64encode(buffer).decode("utf-8")

                        preview_frames.append({
                            "frame": frame_idx,
                            "time_sec": round(frame_idx / fps, 2),
                            "pedestrian_count": len(active_tracks),
                            "image_base64": f"data:image/jpeg;base64,{b64_str}",
                        })

                frame_idx += 1
                progress = min(99.0, round((actual_frames_read / max(1, total_frames)) * 100, 1))
                JOBS[job_id]["progress"] = progress
                JOBS[job_id]["current_step"] = f"Processed frame {actual_frames_read}/{total_frames}"

            cap.release()

            # Aggregate statistics
            all_counts = [r["pedestrian_count"] for r in frame_records] if frame_records else [0]
            avg_count = round(float(np.mean(all_counts)), 2)
            peak_count = int(np.max(all_counts)) if all_counts else 0
            unique_tracks = tracker.next_id - 1

            all_speeds = []
            for t in tracker.completed_tracks + list(tracker.tracks.values()):
                all_speeds.extend(t.velocities_px_sec)
            avg_speed = round(float(np.mean(all_speeds)), 2) if all_speeds else 0.0

            analysis_id = str(uuid.uuid4())[:8]
            analysis_result = {
                "analysis_id": analysis_id,
                "video_name": video_path.name,
                "duration_sec": round(actual_frames_read / fps, 2),
                "total_frames": actual_frames_read,
                "fps": round(fps, 2),
                "conf_threshold": conf_threshold,
                "frame_stride": frame_stride,
                "unique_pedestrians": unique_tracks,
                "avg_pedestrian_count": avg_count,
                "peak_pedestrian_count": peak_count,
                "avg_speed_px_sec": avg_speed,
                "timeline": frame_records,
                "preview_keyframes": preview_frames,
            }

            # Save to disk
            output_file = settings.ANALYSES_DIR / f"{analysis_id}.json"
            with open(output_file, "w") as f:
                json.dump(analysis_result, f)

            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["progress"] = 100.0
            JOBS[job_id]["current_step"] = "Analysis complete"
            JOBS[job_id]["result_id"] = analysis_id

        except Exception as e:
            JOBS[job_id]["status"] = "failed"
            JOBS[job_id]["error"] = str(e)
            JOBS[job_id]["current_step"] = f"Error: {str(e)}"


video_processor = VideoProcessor()
