"""
Router for handling job description endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import JobDescriptionCreate

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/")
async def create_job(job: JobDescriptionCreate, db: Session = Depends(get_db)):
    """
    Endpoint to create a new job description.
    Args:
        job (JobDescriptionCreate): Schema containing job details.
        db (Session): Database session.
    """
    return {"message": "Job description created successfully (placeholder)"}
