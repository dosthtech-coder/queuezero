import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PhysioMimica Engine API"
    API_V1_STR: str = "/api/v1"
    
    # SQLite Database Configuration
    DATABASE_URL: str = "sqlite+aiosqlite:///./queuezero.db"
    
    # Cross-Origin Resource Sharing
    BACKEND_CORS_ORIGINS: list[str] = ["*"]  # For edge kiosk, allowing all or specific local IP
    
    # Storage paths
    REPORTS_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "reports")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure reports directory exists
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
