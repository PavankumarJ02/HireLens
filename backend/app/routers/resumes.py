"""
Router for handling resume upload, retrieval, and candidate detail endpoints.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Resume, Match
from app.schemas import ResumeOut, CandidateDetailResponse
from app.services.pdf_parser import extract_text_from_pdf, PDFParsingError
from app.services.resume_security import validate_file, ResumeValidationError

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a resume PDF or TXT, validate, extract raw text, and save to database.
    """
    try:
        file_bytes = await file.read()
        file_type = validate_file(file.filename, file_bytes)
    except ResumeValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    try:
        if file_type == "pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        else: # file_type == "txt"
            raw_text = file_bytes.decode("utf-8").strip()
    except PDFParsingError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during extraction: {str(e)}"
        )

    # Save to PostgreSQL
    db_resume = Resume(
        filename=file.filename,
        raw_text=raw_text,
        structured_data=None,
        extraction_confidence=None
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    return db_resume


@router.get("/", response_model=List[ResumeOut], status_code=status.HTTP_200_OK)
async def get_resumes(db: Session = Depends(get_db)):
    """
    Retrieve all uploaded resumes in the database.
    """
    return db.query(Resume).all()


@router.get("/{resume_id}", response_model=CandidateDetailResponse, status_code=status.HTTP_200_OK)
async def get_resume(resume_id: int, job_id: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Retrieve a specific candidate's structured resume information.
    Optionally includes matching data if job_id is provided and matched.
    Raises HTTP 404 if the resume is not found.
    """
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )

    # Map candidate fields from structured_data JSON if populated
    candidate_name = resume.filename
    contact = None
    skills = []
    experience = []
    education = []
    projects = []
    certifications = []

    if resume.structured_data:
        sd = resume.structured_data
        contact_info = sd.get("contact", {})
        if contact_info:
            candidate_name = contact_info.get("name") or resume.filename
            contact = contact_info
        skills = sd.get("skills", [])
        experience = sd.get("experience", [])
        education = sd.get("education", [])
        projects = sd.get("projects", [])
        certifications = sd.get("certifications", [])

    # Map match fields if job_id query parameter is provided
    match_overall_score = None
    match_score_breakdown = None
    match_matching_requirements = None
    match_missing_requirements = None
    match_justification = None

    if job_id is not None:
        match_record = db.query(Match).filter(
            Match.resume_id == resume_id,
            Match.job_id == job_id
        ).first()
        if match_record:
            match_overall_score = match_record.overall_score
            match_score_breakdown = match_record.score_breakdown
            match_matching_requirements = match_record.matching_requirements
            match_missing_requirements = match_record.missing_requirements
            match_justification = match_record.justification

    return CandidateDetailResponse(
        resume_id=resume.id,
        filename=resume.filename,
        uploaded_at=resume.uploaded_at,
        candidate_name=candidate_name,
        contact=contact,
        skills=skills,
        experience=experience,
        education=education,
        projects=projects,
        certifications=certifications,
        job_id=job_id,
        overall_score=match_overall_score,
        score_breakdown=match_score_breakdown,
        matching_requirements=match_matching_requirements,
        missing_requirements=match_missing_requirements,
        justification=match_justification
    )
