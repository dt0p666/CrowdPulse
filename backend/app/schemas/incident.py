from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone


def get_utc_now():
    return datetime.now(timezone.utc)


class AdvisoryInfo(BaseModel):
    headline: str
    public_action: str
    affected_radius_km: float = 2.0
    published_by: str = "Pune Traffic & Disaster Authority"
    published_at: datetime = Field(default_factory=get_utc_now)
    expires_at: Optional[datetime] = None


class Incident(BaseModel):
    id: str
    title: str
    description: str
    city: str
    locality: str
    state: str
    lat: float
    lng: float
    severity: str  # "GREEN" | "YELLOW" | "RED"
    status: str    # "detected_by_system" | "awaiting_review" | "verified" | "advisory_published" | "resolved" | "dismissed"
    is_verified: bool = False
    source: str = "System CV Observation (Camera 02)"
    is_demonstration: bool = True
    reported_at: datetime = Field(default_factory=get_utc_now)
    updated_at: datetime = Field(default_factory=get_utc_now)
    advisory: Optional[AdvisoryInfo] = None
    supporting_metrics: Dict[str, Any] = Field(default_factory=dict)
    timeline_updates: List[Dict[str, Any]] = Field(default_factory=list)


class VerifyIncidentRequest(BaseModel):
    decision: str  # "verified" | "dismissed"
    officer_name: str
    officer_badge: str
    notes: str


class CreateAdvisoryRequest(BaseModel):
    headline: str
    public_action: str
    severity: str  # "YELLOW" | "RED"
    affected_radius_km: float = 2.5
    officer_name: str


class ResolveIncidentRequest(BaseModel):
    officer_name: str
    resolution_notes: str
