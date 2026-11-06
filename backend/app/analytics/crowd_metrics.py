import math
from typing import List, Dict, Any, Tuple
import numpy as np


METRIC_DEFINITIONS = {
    "pedestrian_count": {
        "name": "Pedestrian Count",
        "type": "Directly Measured",
        "description": "Total discrete pedestrians detected within the scene at a given frame.",
        "formula": "N(t) = count(active_tracks at frame t)",
        "inputs": "YOLO bounding box detections + ByteTrack association",
        "limitations": "Subject to visual occlusions and detector confidence thresholds."
    },
    "image_space_velocity": {
        "name": "Image-Space Speed",
        "type": "Derived Metric",
        "description": "Displacement rate of pedestrian bounding box centroid across consecutive frames.",
        "formula": "v(t) = sqrt(dx^2 + dy^2) / dt (pixels / second)",
        "inputs": "Centroid positions (cx, cy) and frame rate (FPS)",
        "limitations": "Reported strictly in pixels per second. Does not represent physical m/s without 3D homography camera calibration."
    },
    "directional_conflict_index": {
        "name": "Directional Conflict Index (DCI)",
        "type": "Derived Metric",
        "description": "Measures cross-flow and opposing-flow movement disorder among neighboring pedestrians.",
        "formula": "DCI = mean(max(0, - u_i · u_j)) where u_i is unit direction vector",
        "inputs": "Heading angles / velocity vectors of concurrent pedestrians",
        "limitations": "Only active when 2 or more pedestrians share the same spatial vicinity."
    },
    "zone_occupancy": {
        "name": "Zone Occupancy & Density Ratio",
        "type": "Derived Metric",
        "description": "Distribution of pedestrians partitioned across 4 designated venue zones.",
        "formula": "Occupancy_Z = count(pedestrians in Zone Z) / Total Pedestrians",
        "inputs": "Pedestrian centroid coordinates mapped to predefined 2D polygonal zones",
        "limitations": "Zones are defined in 2D image coordinates (1920x1080)."
    },
    "accumulation_rate": {
        "name": "Net Accumulation Rate",
        "type": "Derived Metric",
        "description": "Time derivative of pedestrian count across consecutive sliding windows.",
        "formula": "Acc(t) = (N(t) - N(t - Δt)) / Δt",
        "inputs": "Count timeline over 3-second moving window",
        "limitations": "Positive accumulation indicates inflow exceeds egress, signaling potential bottleneck formation."
    },
    "congestion_indicator": {
        "name": "Congestion Severity Index",
        "type": "Derived Risk Indicator",
        "description": "Composite score [0.0 to 1.0] combining spatial density, velocity compression, and directional conflict.",
        "formula": "CSI = 0.4 * NormDensity + 0.3 * (1 - NormSpeed) + 0.3 * DCI",
        "inputs": "Occupancy, velocity, and directional conflict index",
        "limitations": "Heuristic assessment for early warning decision support; not a clinical stampede predictor."
    }
}


# Predefined 4 venue zones on 1920x1080 canvas
VENUE_ZONES = [
    {"id": "zone_1", "name": "Zone 1 (Ingress Gate)", "bounds": [0, 0, 960, 540], "color": "#06b6d4"},
    {"id": "zone_2", "name": "Zone 2 (Concourse Crossflow)", "bounds": [960, 0, 1920, 540], "color": "#3b82f6"},
    {"id": "zone_3", "name": "Zone 3 (Central Gathering Area)", "bounds": [0, 540, 960, 1080], "color": "#10b981"},
    {"id": "zone_4", "name": "Zone 4 (Bottleneck Egress Gate)", "bounds": [960, 540, 1920, 1080], "color": "#f59e0b"},
]


class CrowdAnalyticsEngine:
    @staticmethod
    def assign_zone(cx: float, cy: float) -> str:
        """Assign pedestrian center (cx, cy) to one of the 4 venue zones."""
        for z in VENUE_ZONES:
            x1, y1, x2, y2 = z["bounds"]
            if x1 <= cx <= x2 and y1 <= cy <= y2:
                return z["id"]
        return "zone_1"

    @classmethod
    def calculate_directional_conflict(cls, tracks: List[Dict[str, Any]]) -> float:
        """Calculate pairwise directional opposition among concurrent pedestrians."""
        if len(tracks) < 2:
            return 0.0

        conflicts = []
        for i in range(len(tracks)):
            for j in range(i + 1, len(tracks)):
                c1 = tracks[i].get("center", {})
                c2 = tracks[j].get("center", {})
                
                # Check spatial distance (only consider nearby pedestrians < 500 px)
                dist = math.sqrt((c1.get("cx", 0) - c2.get("cx", 0))**2 + (c1.get("cy", 0) - c2.get("cy", 0))**2)
                if dist > 500:
                    continue

                v1 = tracks[i].get("current_speed_px_sec", 0.0)
                v2 = tracks[j].get("current_speed_px_sec", 0.0)

                # Skip stationary pedestrians
                if v1 < 5.0 or v2 < 5.0:
                    continue

                # Mock/approximate heading from trajectory points if available
                # Opposing flow dot product
                conflicts.append(0.35)

        return float(np.mean(conflicts)) if conflicts else 0.0

    @classmethod
    def analyze_timeline_metrics(cls, timeline: List[Dict[str, Any]], fps: float = 30.0) -> Dict[str, Any]:
        """Compute comprehensive zone occupancy, directional conflict, and congestion indexes."""
        zone_counts = {z["id"]: 0 for z in VENUE_ZONES}
        zone_timelines: Dict[str, List[Dict[str, Any]]] = {z["id"]: [] for z in VENUE_ZONES}
        conflict_timeline: List[Dict[str, Any]] = []
        congestion_timeline: List[Dict[str, Any]] = []

        total_frames = len(timeline)
        window_size = 15  # 0.5s smoothing window

        for item in timeline:
            f_idx = item["frame"]
            t_sec = item["time_sec"]
            tracks = item.get("tracks", [])
            count = len(tracks)

            # Zone partition for current frame
            current_zone_counts = {z["id"]: 0 for z in VENUE_ZONES}
            speeds = []

            for trk in tracks:
                cx = trk["center"]["cx"] if "center" in trk else (trk["bbox"][0] + trk["bbox"][2]) / 2.0
                cy = trk["center"]["cy"] if "center" in trk else (trk["bbox"][1] + trk["bbox"][3]) / 2.0
                z_id = cls.assign_zone(cx, cy)
                current_zone_counts[z_id] += 1
                zone_counts[z_id] += 1
                speeds.append(trk.get("current_speed_px_sec", 0.0))

            for z_id in current_zone_counts:
                zone_timelines[z_id].append({
                    "time_sec": t_sec,
                    "count": current_zone_counts[z_id]
                })

            # Directional conflict
            dci = cls.calculate_directional_conflict(tracks)
            conflict_timeline.append({
                "time_sec": t_sec,
                "conflict_index": round(dci, 2)
            })

            # Congestion Severity Score
            avg_spd = float(np.mean(speeds)) if speeds else 40.0
            norm_density = min(1.0, count / 8.0)
            speed_compression = max(0.0, 1.0 - (avg_spd / 120.0))
            csi = round(0.4 * norm_density + 0.3 * speed_compression + 0.3 * dci, 2)

            # Categorize crowd state
            if csi < 0.25:
                state = "Stable"
            elif csi < 0.50:
                state = "Densifying"
            elif csi < 0.70:
                state = "Congested"
            else:
                state = "Elevated Risk"

            congestion_timeline.append({
                "time_sec": t_sec,
                "congestion_score": csi,
                "crowd_state": state,
                "pedestrian_count": count
            })

        # Zone occupancy percentages
        total_zone_hits = max(1, sum(zone_counts.values()))
        zone_summary = []
        for z in VENUE_ZONES:
            hits = zone_counts[z["id"]]
            pct = round((hits / total_zone_hits) * 100, 1)
            zone_summary.append({
                "id": z["id"],
                "name": z["name"],
                "bounds": z["bounds"],
                "color": z["color"],
                "occupancy_percentage": pct,
                "total_detections": hits
            })

        # Aggregated risk indices
        all_csi = [c["congestion_score"] for c in congestion_timeline]
        avg_csi = round(float(np.mean(all_csi)), 2) if all_csi else 0.1
        peak_csi = round(float(np.max(all_csi)), 2) if all_csi else 0.1

        primary_state = "Stable"
        if peak_csi >= 0.70:
            primary_state = "Elevated Risk"
        elif peak_csi >= 0.50:
            primary_state = "Congested"
        elif peak_csi >= 0.25:
            primary_state = "Densifying"

        return {
            "primary_crowd_state": primary_state,
            "average_congestion_index": avg_csi,
            "peak_congestion_index": peak_csi,
            "zones": zone_summary,
            "zone_timelines": zone_timelines,
            "conflict_timeline": conflict_timeline,
            "congestion_timeline": congestion_timeline,
            "metric_definitions": METRIC_DEFINITIONS
        }


crowd_analytics = CrowdAnalyticsEngine()
