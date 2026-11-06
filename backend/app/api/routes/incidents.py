from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any

from backend.app.schemas.incident import (
    Incident,
    VerifyIncidentRequest,
    CreateAdvisoryRequest,
    ResolveIncidentRequest,
)
from backend.app.services.incident_service import incident_service

router = APIRouter(tags=["Incident Operations & Public Safety"])


@router.get("/public/advisories")
def get_public_advisories(
    lat: Optional[float] = Query(None, description="User latitude"),
    lng: Optional[float] = Query(None, description="User longitude"),
    city: Optional[str] = Query(None, description="Selected Indian city"),
    radius_km: float = Query(15.0, description="Search radius in km")
):
    """
    Public Safety Gateway:
    Returns verified incidents, severity, distance from user, and recommended actions.
    """
    return incident_service.get_public_nearby_advisories(
        lat=lat, lng=lng, city=city, radius_km=radius_km
    )


@router.get("/incidents", response_model=List[Incident])
def list_incidents(
    city: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    verified_only: bool = False
):
    """Authority endpoint: list all system observations, pending queues, and active incidents."""
    return incident_service.list_incidents(
        city=city, severity=severity, status=status, verified_only=verified_only
    )


@router.get("/incidents/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    """Retrieve full incident details, supporting metrics, and timeline updates."""
    inc = incident_service.get_incident(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found.")
    return inc


@router.post("/incidents/{incident_id}/verify", response_model=Incident)
def verify_incident(incident_id: str, req: VerifyIncidentRequest):
    """Authority verification action: mark incident verified or dismiss as false positive."""
    try:
        return incident_service.verify_incident(incident_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Incident not found.")


@router.post("/incidents/{incident_id}/advisory", response_model=Incident)
def publish_advisory(incident_id: str, req: CreateAdvisoryRequest):
    """Authority action: publish official public safety advisory to geographic area."""
    try:
        return incident_service.create_advisory(incident_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Incident not found.")


@router.post("/incidents/{incident_id}/resolve", response_model=Incident)
def resolve_incident(incident_id: str, req: ResolveIncidentRequest):
    """Authority action: mark situation resolved and withdraw emergency advisory."""
    try:
        return incident_service.resolve_incident(incident_id, req)
    except KeyError:
        raise HTTPException(status_code=404, detail="Incident not found.")


@router.get("/authority/audit")
def get_audit_trail():
    """Retrieve authority action audit log for accountability."""
    return {"audit_log": incident_service.get_audit_log()}
