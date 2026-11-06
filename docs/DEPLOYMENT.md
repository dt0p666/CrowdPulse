# CROWDPULSE — Production Deployment & Cloud Architecture Guide

## 1. Architecture Separation (Static Frontend vs Compute Backend)

CrowdPulse requires a two-tier deployment architecture:
1. **Frontend Client (React + Three.js):**
   - Can be hosted on any static edge CDN: **Vercel**, **Netlify**, or **Cloudflare Pages**.
   - Builds into lightweight static HTML, CSS, and JS chunks (`dist/`).
2. **Backend Engine (Python + OpenCV + PyTorch + FastAPI):**
   - **Cannot** run on static hosting or serverless edge workers because OpenCV video decoding, YOLOv8 model inference, and background threading require persistent memory and continuous CPU/GPU compute.
   - Recommended hosts: **Render**, **Railway**, **Fly.io**, or an **AWS EC2 / DigitalOcean Droplet**.

---

## 2. Hardware Requirements & Realistic Hosting Costs

| Tier | Specifications | Typical Cost | Capabilities & Limitations |
| :--- | :--- | :--- | :--- |
| **Free / Hobby** | 1 vCPU, 512 MB - 1 GB RAM | $0 - $7 / month | Suitable for CSV Dataset Lab and lightweight API requests. Video CV will run slowly or trigger Out-Of-Memory (OOM) on large 1080p video uploads. |
| **Production Standard (CPU)** | 2 - 4 vCPUs, 4 - 8 GB RAM | $20 - $45 / month | Real-time processing of 1080p videos at ~15-25 FPS using CPU PyTorch and YOLOv8n. Recommended for standard venue operations. |
| **High Performance (GPU)** | 4 vCPUs, 16 GB RAM + NVIDIA T4 / A10G | $75 - $150 / month | 60+ FPS high-throughput video processing across multiple concurrent surveillance streams with real-time ByteTrack tracking. |

---

## 3. Containerized Deployment with Docker Compose

To deploy CrowdPulse locally or on a VPS (Ubuntu, Debian, Windows Server):

```bash
# 1. Clone repository
git clone <your-repo-url>
cd CrowdPulse_intel.py

# 2. Build and start containers
docker-compose up --build -d

# 3. Access platform
# Frontend: http://localhost
# Backend API & Swagger: http://localhost:8000/docs
```

---

## 4. Environment Variables Configuration

Create a `.env` file based on `.env.example`:

```ini
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=["https://your-frontend-domain.com"]
DEFAULT_CONF_THRESHOLD=0.25
DEFAULT_FRAME_STRIDE=1
MAX_VIDEO_SIZE_MB=250
MAX_CSV_SIZE_MB=50
```
