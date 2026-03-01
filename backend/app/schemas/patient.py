from pydantic import BaseModel, Field, root_validator
from typing import Optional
from datetime import datetime

class PatientBase(BaseModel):
    mrn: str = Field(..., description="Medical Record Number")
    first_name: str
    last_name: str
    age: int = Field(..., ge=0, le=120)
    sex: str = Field(..., description="M, F, or Other")
    height_cm: float = Field(..., gt=0)
    weight_kg: float = Field(..., gt=0)
    occupation: str
    dominant_side: str

class PatientCreate(PatientBase):
    pass

class PatientRead(PatientBase):
    id: int
    bmi: float
    created_at: datetime

    class Config:
        from_attributes = True
