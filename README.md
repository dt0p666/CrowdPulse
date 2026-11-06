# CROWDPULSE
### Crowd-Flow Intelligence & Early Risk Prediction
> **SEE THE FLOW. SENSE THE SHIFT.**

CrowdPulse is a full-stack AI research and public safety crowd intelligence platform. It bridges cutting-edge computer vision movement analysis with an intuitive, human-centered civic portal for ordinary citizens and a dedicated operations command center for authorized emergency personnel.

---

## Key Highlights

* **Figma-Aligned Spatial Flow Centerpiece**: Minimalist editorial visual language featuring a real-time 3D perspective floor grid, live pedestrian flow vectors, directional paths, and radiant hotspot visualization.
* **Public Citizen Safety Portal**: Location-aware service answering the 4 core questions: *What is happening? Where is it? How close to you? What should you do?* Includes genuine OpenStreetMap street layout and direct emergency dials (`112`, `100`, `108`).
* **Authority Operations Command Suite**: Operational triage, incident review, geofenced public safety advisory publisher with live mobile preview, CCTV movement analysis, and accountability audit trail.
* **Universal Dark / Light Mode**: One-click theme switcher available at the top right of all pages with `localStorage` persistence.
* **Computer Vision & Tracking Engine**: Trajectory tracking, directional conflict detection, density heatmaps, and spatial occupancy analysis.
* **Machine Learning & Attribution**: Zero-leakage temporal holdout benchmarks (Random Forest vs Logistic Regression) with SHAP-aligned feature attribution.

---

## Architecture Overview

```
CrowdPulse/
├── backend/                  # FastAPI Python backend engine
│   ├── app/
│   │   ├── api/routes/       # API controllers (/incidents, /videos, /datasets, /models, /auth)
│   │   ├── core/             # Configuration & path management
│   │   ├── cv/               # Video decoding, YOLO pedestrian detection & tracking
│   │   ├── analytics/        # Velocity, density, accumulation & directional conflict
│   │   ├── ml/               # Baseline models, crowd-state classification & evaluation
│   │   └── services/         # Incident lifecycle & audit trail services
│   ├── tests/                # Automated backend test suite (26 Pytest tests)
│   └── requirements.txt      # Python dependencies
├── frontend/                 # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # FigmaSpatialHero, Leaflet maps, 3D Canvas, ThemeToggle
│   │   ├── context/          # ThemeContext (Dark/Light mode)
│   │   ├── layouts/          # PublicLayout, AuthorityLayout, AdminLayout
│   │   ├── pages/            # Public, Authority, Admin, and RoleSelection views
│   │   └── services/         # Typed API clients & demo auth
├── data/
│   ├── sample/               # Ground-truth reference datasets (crosswalk, fourway, night)
│   └── raw/                  # Uploaded camera feeds
├── models/                   # Pretrained weights and trained classifiers
├── scripts/                  # Runtime, dev, and test verification runners
├── docker-compose.yml        # Multi-container orchestration (Backend + Nginx Frontend)
└── README.md
```

---

## Quick Start (Local Development)

### 1. Start the Backend API Server
Open a terminal in the project directory:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```
* API Base URL: `http://127.0.0.1:8000`
* Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`
* Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Start the Frontend Website
In a second terminal window, navigate into `frontend` and start Vite:
```bash
cd frontend
npm install
npm run dev
```
* Web Application: `http://127.0.0.1:5173`

---

## Running Automated Verification Suites

To run backend unit & integration tests:
```bash
python -m pytest backend/tests -v
```

To run frontend TypeScript and Vite packaging verification:
```bash
npm --prefix frontend run build
```

To run the complete end-to-end system acceptance test (all 14 criteria):
```bash
python scripts/test_all.py
```

---

## Docker Deployment

To launch the full containerized environment with Nginx:
```bash
docker-compose up --build
```
* Frontend Web Portal: `http://localhost:80`
* Backend API Server: `http://localhost:8000`

---

## Scientific Rigor & Disclaimers

CrowdPulse provides decision support and early movement anomaly indicators. It is not a guaranteed stampede prevention system. Model confidence scores reflect posterior class probabilities under holdout test splits, not arbitrary certainty.
