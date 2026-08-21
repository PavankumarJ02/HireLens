"""
Configuration module for the HireLens backend.
Handles environment variables and application settings.
"""

import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application settings class holding configuration values."""
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/resume_screener")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")

settings = Settings()
