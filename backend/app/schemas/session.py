from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

class SessionBase(BaseModel):
    patient_id: int
    primary_complaint: Optional[str] = None
    vas_score: Optional[int] = Field(None, ge=0, le=10)
    duration_days: Optional[int] = None
    
    heart_rate_bpm: Optional[int] = None
    blood_pressure_sys: Optional[int] = None
    blood_pressure_dia: Optional[int] = None
    respiratory_rate: Optional[int] = None

class SessionCreate(SessionBase):
    pass

class SessionTelemetry(BaseModel):
    session_id: int
    # 3D points mimicking MediaPipe (x, y, z, visibility) for key joints
    # Format: {"left_shoulder": [x, y, z, v], "right_shoulder": [x, y, z, v], ...}
    landmarks: Dict[str, List[float]]

class SessionUpdateResult(BaseModel):
    rom_results: List[Dict[str, Any]]
    compensation_notes: List[str]
    risk_indicators: List[Dict[str, Any]]
    confidence_score: float

class SessionRead(SessionBase):
    id: int
    rom_results: Optional[List[Dict[str, Any]]] = None
    compensation_notes: Optional[List[str]] = None
    risk_indicators: Optional[List[Dict[str, Any]]] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
