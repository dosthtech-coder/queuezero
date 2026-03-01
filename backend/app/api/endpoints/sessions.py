from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import datetime

from app.core.database import get_db
from app.models.patient import Patient
from app.models.session import Session
from app.schemas.session import SessionCreate, SessionRead, SessionTelemetry, SessionUpdateResult
from app.services.biomechanics import biomechanics_engine
from app.services.risk_engine import risk_engine
from app.services.export import report_generator

router = APIRouter()

# In-memory store for session telemetry processing (mocking real-time feed in minimal viable product)
ACTIVE_SESSIONS = {}

@router.post("/", response_model=SessionRead, status_code=status.HTTP_201_CREATED)
async def create_session(session_in: SessionCreate, db: AsyncSession = Depends(get_db)):
    # Validate patient exists
    query = select(Patient).where(Patient.id == session_in.patient_id)
    result = await db.execute(query)
    if not result.scalars().first():
        raise HTTPException(status_code=404, detail="Patient not found")
        
    db_session = Session(**session_in.model_dump())
    db.add(db_session)
    await db.commit()
    await db.refresh(db_session)
    
    ACTIVE_SESSIONS[db_session.id] = [] # Initialize telemetry bucket
    
    return db_session

@router.post("/{session_id}/telemetry", status_code=status.HTTP_202_ACCEPTED)
async def post_telemetry(session_id: int, telemetry: SessionTelemetry):
    if session_id not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=404, detail="Active session not found or already concluded.")
    
    # Process angles for the frame
    frame_angles = biomechanics_engine.process_telemetry(telemetry.landmarks)
    ACTIVE_SESSIONS[session_id].append(frame_angles)
    
    return {"status": "Frame processed", "current_angles": frame_angles}

@router.post("/{session_id}/conclude", response_model=SessionUpdateResult)
async def conclude_session(session_id: int, db: AsyncSession = Depends(get_db)):
    if session_id not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=404, detail="Session not active or not found.")
        
    # Get session and patient
    query = select(Session).options(selectinload(Session.patient)).where(Session.id == session_id)
    result = await db.execute(query)
    db_session = result.scalars().first()
    
    if not db_session:
         raise HTTPException(status_code=404, detail="Session database record missing.")
         
    raw_telemetry_series = ACTIVE_SESSIONS.pop(session_id)
    
    # Evaluate Biomechanics
    rom_results, comp_notes = biomechanics_engine.evaluate_session(raw_telemetry_series)
    
    # Evaluate Risk Profile
    patient_context = {
        "age": db_session.patient.age,
        "occupation": db_session.patient.occupation
    }
    risk_indicators = risk_engine.evaluate_risk(patient_context, rom_results)
    
    # Update Session Database Record
    db_session.rom_results = rom_results
    db_session.compensation_notes = comp_notes
    db_session.risk_indicators = risk_indicators
    db_session.confidence_score = 94.5  # Mock confidence from CV
    db_session.completed_at = datetime.datetime.utcnow()
    
    await db.commit()
    
    return SessionUpdateResult(
        rom_results=rom_results,
        compensation_notes=comp_notes,
        risk_indicators=risk_indicators,
        confidence_score=db_session.confidence_score
    )

@router.get("/{session_id}/report")
async def generate_report(session_id: int, db: AsyncSession = Depends(get_db)):
    """Generates the PDF Patient Card and returns file path."""
    query = select(Session).options(selectinload(Session.patient)).where(Session.id == session_id)
    result = await db.execute(query)
    db_session = result.scalars().first()
    
    if not db_session or not db_session.completed_at:
        raise HTTPException(status_code=400, detail="Session not found or incomplete.")
        
    template_data = {
        "date_of_scan": db_session.completed_at.strftime("%Y-%m-%d %H:%M:%S"),
        "patient": db_session.patient.__dict__,
        "vitals": {
            "heart_rate_bpm": db_session.heart_rate_bpm,
            "blood_pressure_sys": db_session.blood_pressure_sys,
            "blood_pressure_dia": db_session.blood_pressure_dia,
            "respiratory_rate": db_session.respiratory_rate
        },
        "rom_results": db_session.rom_results,
        "compensation_notes": db_session.compensation_notes,
        "risk_indicators": db_session.risk_indicators,
        "confidence_score": db_session.confidence_score
    }
    
    pdf_path = report_generator.generate_pdf(template_data)
    
    # In a real API, we'd return a FileResponse. Returning metadata for now.
    return {"status": "Success", "report_url": f"/files/{pdf_path.split('/')[-1]}", "local_path": pdf_path}
