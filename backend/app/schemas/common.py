from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Any, Optional


def get_utc_now():
    return datetime.now(timezone.utc)


class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    project: str = "CrowdPulse"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=get_utc_now)
    environment: dict[str, Any] = Field(default_factory=dict)


class GenericSuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Any] = None


class JobStatusResponse(BaseModel):
    job_id: str
    status: str  # "pending", "running", "completed", "failed"
    progress: float = 0.0  # 0.0 to 100.0
    current_step: str = ""
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=get_utc_now)
    completed_at: Optional[datetime] = None
    result_id: Optional[str] = None

