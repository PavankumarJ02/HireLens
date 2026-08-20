"""
Router for handling resume-to-job matching endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/matches", tags=["Matches"])

@router.post("/compare")
async def match_resume_to_job(resume_id: int, job_id: int, db: Session = Depends(get_db)):
    """
    Endpoint to trigger matching process between a resume and job description.
    Args:
        resume_id (int): Resume database ID.
        job_id (int): Job description database ID.
        db (Session): Database session.
    """
    return {"message": f"Matching resume {resume_id} with job {job_id} (placeholder)"}
