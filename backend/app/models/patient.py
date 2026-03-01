from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.core.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    mrn = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    sex = Column(String, nullable=False) 
    height_cm = Column(Float, nullable=False)
    weight_kg = Column(Float, nullable=False)
    bmi = Column(Float, nullable=False)
    occupation = Column(String, nullable=False)
    dominant_side = Column(String, nullable=False) # 'Left', 'Right', 'Ambidextrous'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    sessions = relationship("Session", back_populates="patient", cascade="all, delete-orphan")
