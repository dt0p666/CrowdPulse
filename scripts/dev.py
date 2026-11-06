"""
CrowdPulse Unified Developer Launcher.
Runs both the FastAPI backend and Vite React frontend concurrently.
"""
import os
import sys
import time
import subprocess
import signal

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")


def main():
    print("=" * 65)
    print("      CROWDPULSE: CROWD-FLOW INTELLIGENCE & EARLY RISK")
    print("               SEE THE FLOW. SENSE THE SHIFT.")
    print("=" * 65)
    print(f"Project Root: {PROJECT_ROOT}\n")

    # Start Backend
    print("[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_cmd = [sys.executable, os.path.join(PROJECT_ROOT, "scripts", "run_backend.py")]
    backend_proc = subprocess.Popen(backend_cmd, cwd=PROJECT_ROOT)

    time.sleep(2)

    # Start Frontend
    print("[2/2] Starting Vite React Frontend on http://localhost:5173 ...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev"], cwd=FRONTEND_DIR)

    print("\n" + "-" * 65)
    print("  CrowdPulse Platform is LIVE!")
    print("  -> Website Application:   http://localhost:5173")
    print("  -> Backend API Engine:    http://127.0.0.1:8000")
    print("  -> OpenAPI Documentation: http://127.0.0.1:8000/docs")
    print("-" * 65)
    print("Press Ctrl+C to terminate both servers safely.\n")

    def signal_handler(sig, frame):
        print("\nShutting down CrowdPulse servers gracefully...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)


if __name__ == "__main__":
    main()
