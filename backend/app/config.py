"""
Configuration module for the Smart Resume Screener backend.
Handles environment variables and application settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings class holding configuration values."""
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/resume_screener")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")

settings = Settings()
