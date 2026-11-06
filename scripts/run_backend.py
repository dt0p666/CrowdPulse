"""Helper script to launch the CrowdPulse FastAPI backend server."""
import os
import sys
import uvicorn

# Add project root to sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

if __name__ == "__main__":
    print(f"Starting CrowdPulse Backend from: {PROJECT_ROOT}")
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
