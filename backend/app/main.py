"""
Main application entry point for the Smart Resume Screener FastAPI backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import resumes, jobs, matches

app = FastAPI(
    title="Smart Resume Screener API",
    description="Production-grade API for parsing resumes and matching them to job descriptions.",
    version="1.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production environments
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
    Root endpoint for service verification.
    """
    return {"message": "Smart Resume Screener Backend API is running."}
