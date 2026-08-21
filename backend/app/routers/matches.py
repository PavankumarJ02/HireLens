"""
Router for running candidate matching evaluations and returning explainable metrics (Day 2 & Day 3).
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

def classify_missing_skills(missing_reqs: list, parsed_job_reqs: dict) -> dict:
    """
    Classifies a flat list of missing requirements into required and preferred buckets
    based on job requirements.
    """
    if not parsed_job_reqs:
        return {"required": missing_reqs, "preferred": []}

    required_skills = {s.lower().strip() for s in parsed_job_reqs.get("required_skills", [])}
    preferred_skills = {s.lower().strip() for s in parsed_job_reqs.get("preferred_skills", [])}

    classified = {
        "required": [],
        "preferred": []
    }

    for req in missing_reqs:
        req_clean = req.lower().strip()
        
        # Check if it overlaps with preferred skills
        is_preferred = False
        for pref in preferred_skills:
            if pref in req_clean or req_clean in pref:
                is_preferred = True
                break
        
        if is_preferred:
            classified["preferred"].append(req)
        else:
            classified["required"].append(req)

    return classified

def evaluate_resume_against_job(resume_id: int, job_id: int, db: Session) -> Match:
    """
    Shared service function to validate files, cache AI parsing, run matching logic,
    calculate final score in Python, and persist/reuse matching record.
    """
    # 1. Retrieve & Validate Resume
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found."
        )
    if not resume.raw_text or not resume.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Resume raw text content for ID {resume_id} is empty."
        )

    # 2. Retrieve & Validate Job Description
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {job_id} not found."
        )
    if not job.raw_text or not job.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Job description text for ID {job_id} is empty."
        )

    # 3. Check if a match record already exists for this pair to avoid duplicate evaluations
    existing_match = db.query(Match).filter(
        Match.resume_id == resume_id,
        Match.job_id == job_id
    ).first()

    if existing_match:
        # Check if missing requirements are already classified. If not, classify on the fly
        if isinstance(existing_match.missing_requirements, list):
            existing_match.missing_requirements = classify_missing_skills(
                existing_match.missing_requirements, 
                job.parsed_requirements
            )
            db.add(existing_match)
            db.commit()
            db.refresh(existing_match)
        return existing_match

    # 4. AI Extraction of Resume details (with cache check)
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

    # 5. AI Extraction of Job Description details (with cache check)
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

    # 6. Matching & Score Evaluation
    try:
        match_result = score_match(structured_resume, parsed_job)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"AI matching evaluation failed: {str(e)}"
        )

    # 7. Python Scoring Calculation
    breakdown_scores = {
        "skills": match_result["skills_score"],
        "experience": match_result["experience_score"],
        "projects": match_result["projects_score"],
        "education": match_result["education_score"]
    }
    final_score = calculate_final_score(breakdown_scores)

    # 8. Evidential summary compilation (justification text)
    justification_evidence = (
        f"Skills evaluation (Score: {breakdown_scores['skills']}): {match_result['evidence']['skills']}\n\n"
        f"Experience evaluation (Score: {breakdown_scores['experience']}): {match_result['evidence']['experience']}\n\n"
        f"Projects evaluation (Score: {breakdown_scores['projects']}): {match_result['evidence']['projects']}\n\n"
        f"Education evaluation (Score: {breakdown_scores['education']}): {match_result['evidence']['education']}"
    )

    # 9. Classify missing requirements
    classified_missing = classify_missing_skills(match_result["missing_requirements"], parsed_job)

    # 10. Save new match record
    db_match = Match(
        resume_id=resume_id,
        job_id=job_id,
        overall_score=final_score,
        score_breakdown=breakdown_scores,
        matching_requirements=match_result["matching_requirements"],
        missing_requirements=classified_missing,
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

@router.post("/run", response_model=MatchOut, status_code=status.HTTP_201_CREATED)
async def run_match(request: MatchRunRequest, db: Session = Depends(get_db)):
    """
    Executes explainable resume-to-job matching evaluation.
    Caches parsed inputs, scores technical metrics, and computes weighted Python scores.
    """
    return evaluate_resume_against_job(request.resume_id, request.job_id, db)
