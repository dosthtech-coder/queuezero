from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router
from app.core.database import engine, Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS for WebGL Frontend and local kiosk requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    logger.info("Initializing PhysioMimica SQLite Database Engine.")
    async with engine.begin() as conn:
        # Check if tables exist. In production, use Alembic. 
        # For this prototype/hackathon setup, create missing tables on boot.
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
def read_root():
    return {"status": "PhysioMimica Engine is operational", "version": "1.0.0"}
