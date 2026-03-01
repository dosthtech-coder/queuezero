from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from app.core.database import get_db
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientRead

router = APIRouter()

@router.post("/", response_model=PatientRead, status_code=status.HTTP_201_CREATED)
async def create_patient(patient_in: PatientCreate, db: AsyncSession = Depends(get_db)):
    # Calculate BMI
    bmi = patient_in.weight_kg / ((patient_in.height_cm / 100) ** 2)
    
    # Check if MRN exists
    query = select(Patient).where(Patient.mrn == patient_in.mrn)
    result = await db.execute(query)
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Patient with this MRN already exists.")
        
    db_patient = Patient(
        **patient_in.model_dump(),
        bmi=round(bmi, 1)
    )
    db.add(db_patient)
    await db.commit()
    await db.refresh(db_patient)
    
    return db_patient

@router.get("/{patient_id}", response_model=PatientRead)
async def get_patient(patient_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Patient).where(Patient.id == patient_id)
    result = await db.execute(query)
    patient = result.scalars().first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
