"""
Router for running candidate matching evaluations and returning explainable metrics (Day 2).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Resume, JobDescription, Match
from app.schemas import MatchRunRequest, MatchOut
from app.services.llm_extractor import extract_structured_data
from app.services.llm_job_parser import parse_job_requirements
from app.services.llm_matcher import score_match, calculate_final_score

router = APIRouter(prefix="/matches", tags=["Matches"])

@router.post("/run", response_model=MatchOut, status_code=status.HTTP_201_CREATED)
async def run_match(request: MatchRunRequest, db: Session = Depends(get_db)):
    """
    Executes explainable resume-to-job matching evaluation.
    Caches parsed inputs, scores technical metrics, and computes weighted Python scores.
    """
    # 1. Retrieve & Validate Resume
    resume = db.query(Resume).filter(Resume.id == request.resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {request.resume_id} not found."
        )
    if not resume.raw_text or not resume.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume raw text content is empty."
        )

    # 2. Retrieve & Validate Job Description
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {request.job_id} not found."
        )
    if not job.raw_text or not job.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text is empty."
        )

    # 3. AI Extraction of Resume details (with cache check)
    if not resume.structured_data:
        try:
            structured_resume = extract_structured_data(resume.raw_text)
            resume.structured_data = structured_resume
            db.add(resume)
            db.commit()
            db.refresh(resume)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI candidate parsing failed: {str(e)}"
            )
    else:
        structured_resume = resume.structured_data

    # 4. AI Extraction of Job Description details (with cache check)
    if not job.parsed_requirements:
        try:
            parsed_job = parse_job_requirements(job.raw_text)
            job.parsed_requirements = parsed_job
            db.add(job)
            db.commit()
            db.refresh(job)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"AI job description parsing failed: {str(e)}"
            )
    else:
        parsed_job = job.parsed_requirements

    # 5. Matching & Score Evaluation
    try:
        match_result = score_match(structured_resume, parsed_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI matching evaluation failed: {str(e)}"
        )

    # 6. Python Scoring Calculation
    breakdown_scores = {
        "skills": match_result["skills_score"],
        "experience": match_result["experience_score"],
        "projects": match_result["projects_score"],
        "education": match_result["education_score"]
    }
    final_score = calculate_final_score(breakdown_scores)

    # 7. Evidential summary compilation (justification text)
    justification_evidence = (
        f"Skills evaluation (Score: {breakdown_scores['skills']}): {match_result['evidence']['skills']}\n\n"
        f"Experience evaluation (Score: {breakdown_scores['experience']}): {match_result['evidence']['experience']}\n\n"
        f"Projects evaluation (Score: {breakdown_scores['projects']}): {match_result['evidence']['projects']}\n\n"
        f"Education evaluation (Score: {breakdown_scores['education']}): {match_result['evidence']['education']}"
    )

    # 8. Check if a match record already exists for this pair to avoid duplicate match entries
    existing_match = db.query(Match).filter(
        Match.resume_id == request.resume_id,
        Match.job_id == request.job_id
    ).first()

    if existing_match:
        existing_match.overall_score = final_score
        existing_match.score_breakdown = breakdown_scores
        existing_match.matching_requirements = match_result["matching_requirements"]
        existing_match.missing_requirements = match_result["missing_requirements"]
        existing_match.justification = justification_evidence
        db_match = existing_match
    else:
        db_match = Match(
            resume_id=request.resume_id,
            job_id=request.job_id,
            overall_score=final_score,
            score_breakdown=breakdown_scores,
            matching_requirements=match_result["matching_requirements"],
            missing_requirements=match_result["missing_requirements"],
            justification=justification_evidence
        )
        db.add(db_match)

    try:
        db.commit()
        db.refresh(db_match)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save match result to the database."
        )

    return db_match
