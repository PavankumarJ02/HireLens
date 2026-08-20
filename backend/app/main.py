"""
Main application entry point for the HireLens FastAPI backend.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models  # Force model registration on metadata
from app.routers import resumes, jobs, matches

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan handler.
    Creates database tables on application startup.
    """
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(
    title="HireLens Backend API",
    description="Explainable, Evidence-Based Resume Screening System Backend.",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS specifically for React/Vite local development frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(resumes.router)
app.include_router(jobs.router)
app.include_router(matches.router)

@app.get("/")
async def root():
    """
    Root API health check endpoint.
    """
    return {"status": "healthy", "service": "HireLens API"}
