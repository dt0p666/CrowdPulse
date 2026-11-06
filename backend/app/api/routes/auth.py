from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter(prefix="/auth", tags=["Authentication & Role Verification"])


class LoginRequest(BaseModel):
    username: str
    password: str


DEMO_CREDENTIALS = {
    "officer@punepolice.gov.in": {
        "password": "authority2026",
        "role": "authority_officer",
        "name": "Inspector S. Kulkarni",
        "badge": "MH-PUN-4012",
        "department": "Pune Metropolitan Police & Disaster Management",
        "city": "Pune"
    },
    "admin@crowdpulse.internal": {
        "password": "admin2026",
        "role": "admin",
        "name": "Platform Administrator",
        "badge": "SYS-ADM-01",
        "department": "CrowdPulse Core Platform Administration",
        "city": "All"
    }
}


@router.post("/login")
def login(req: LoginRequest):
    """Restricted access login for Authorised Authorities and Platform Administrators."""
    user = DEMO_CREDENTIALS.get(req.username.strip().lower())
    if not user or user["password"] != req.password.strip():
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    return {
        "success": True,
        "token": f"cp-auth-{user['role']}-demo-token",
        "role": user["role"],
        "name": user["name"],
        "badge": user["badge"],
        "department": user["department"],
        "city": user["city"]
    }
