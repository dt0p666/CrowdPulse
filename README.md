# CROWDPULSE
### Crowd-Flow Intelligence & Early Risk Prediction
> **SEE THE FLOW. SENSE THE SHIFT.**

CrowdPulse is a full-stack AI research and spatiotemporal crowd intelligence platform. It combines real-time computer vision pedestrian detection, anonymous multi-object tracking, trajectory reconstruction, directional conflict modeling, and an interactive 3D spatial venue map.

---

## Architecture Overview

```
CrowdPulse/
├── backend/                  # FastAPI Python backend engine
│   ├── app/
│   │   ├── api/routes/       # API route controllers (/health, /datasets, /videos, /analyses)
│   │   ├── core/             # Configuration & path management
│   │   ├── schemas/          # Pydantic data validation schemas
│   │   ├── cv/               # Video decoding, YOLO pedestrian detection & tracking
│   │   ├── analytics/        # Velocity, density, accumulation & directional conflict
│   │   ├── ml/               # Baseline models, crowd-state classification & evaluation
│   │   └── storage/          # Local file persistence management
│   ├── tests/                # Automated backend test suite
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # Layout, charts, maps & 3D visualizations
│   │   ├── pages/            # 7 core views (Overview, Video, Dataset Lab, 3D Map, etc.)
│   │   └── services/         # Client-side API services
├── data/
│   ├── raw/                  # Uploaded user feeds
│   ├── sample/               # Built-in reference datasets (crosswalk, fourway, night)
│   └── processed/            # Normalized trajectories and spatiotemporal tensors
├── models/                   # Pretrained weights and trained classifiers
├── outputs/                  # Analysis reports, metrics JSON and visualizations
└── scripts/                  # Development and runtime helpers
```

---

## Quick Start (Local Development)

### 1. Start the Backend API Server
Open a terminal in the project directory:
```bash
python scripts/run_backend.py
```
- API Base URL: `http://127.0.0.1:8000`
- Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
- Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend Website
In a second terminal window, navigate into `frontend` and start Vite:
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## Running Automated Tests

To run backend tests:
```bash
python -m pytest backend/tests -v
```

To run frontend build checks:
```bash
cd frontend
npm run build
```

---

## Scientific Rigor & Disclaimers

CrowdPulse provides decision support and early movement anomaly indicators. It is not a guaranteed stampede prevention system. Unless true 3D camera calibration homographies are supplied, speed is reported strictly in **pixels per second**.
