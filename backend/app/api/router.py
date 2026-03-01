from fastapi import APIRouter
from app.api.endpoints import patients, sessions

api_router = APIRouter()
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
