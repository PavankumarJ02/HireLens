"""
Router for handling job description endpoints.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import JobDescriptionCreate
from app.models import JobDescription

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/")
async def create_job(
    job: JobDescriptionCreate,
    db: Session = Depends(get_db)
):
    """
    Create and persist a new job description.
    """

    new_job = JobDescription(
        title=job.title,
        raw_text=job.raw_text
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return {
        "id": new_job.id,
        "title": new_job.title,
        "message": "Job description created successfully"
    }