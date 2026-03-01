from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    
    # Primary Complaint
    primary_complaint = Column(String, nullable=True)
    vas_score = Column(Integer, nullable=True) # 0-10
    duration_days = Column(Integer, nullable=True)
    
    # Vitals (Optional)
    heart_rate_bpm = Column(Integer, nullable=True)
    blood_pressure_sys = Column(Integer, nullable=True)
    blood_pressure_dia = Column(Integer, nullable=True)
    respiratory_rate = Column(Integer, nullable=True)
    
    # Processed Results Stored as JSON
    rom_results = Column(JSON, nullable=True)
    compensation_notes = Column(JSON, nullable=True)
    risk_indicators = Column(JSON, nullable=True)
    
    confidence_score = Column(Float, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="sessions")
