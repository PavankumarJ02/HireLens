"""
Router for handling job description endpoints.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.schemas import JobDescriptionCreate, JobDescriptionOut
from app.models import JobDescription

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/", response_model=JobDescriptionOut, status_code=status.HTTP_201_CREATED)
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
    return new_job


@router.get("/", response_model=List[JobDescriptionOut], status_code=status.HTTP_200_OK)
async def get_jobs(db: Session = Depends(get_db)):
    """
    Retrieve all job descriptions in the database.
    """
    return db.query(JobDescription).all()


@router.get("/{job_id}", response_model=JobDescriptionOut, status_code=status.HTTP_200_OK)
async def get_job(job_id: int, db: Session = Depends(get_db)):
    """
    Retrieve one specific job description by ID.
    Raises HTTP 404 if the job description is not found.
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {job_id} not found."
        )
    return job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job(job_id: int, db: Session = Depends(get_db)):
    """
    Delete a specific job description. Cascades cleanup of related matches.
    """
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {job_id} not found."
        )
    db.delete(job)
    db.commit()
    return None