"""
Router for handling batch screening operations and ranking queries (Day 3 & Day 4).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.database import get_db
from app.models import Resume, JobDescription, Match
from app.schemas import BatchScreeningRequest, BatchScreeningResponse, BatchScreeningResultCandidate
from app.routers.matches import evaluate_resume_against_job

router = APIRouter(prefix="/screening", tags=["Screening"])

@router.post("/batch", response_model=BatchScreeningResponse, status_code=status.HTTP_200_OK)
async def batch_screen(request: BatchScreeningRequest, db: Session = Depends(get_db)):
    """
    Screen multiple candidates against a single job description.
    Caches parsed documents, evaluates matches, ranks candidates by score.
    """
    # 1. Validate Job Description exists
    job = db.query(JobDescription).filter(JobDescription.id == request.job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {request.job_id} not found."
        )

    # 2. Validate empty resume list
    if not request.resume_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The resume_ids list cannot be empty."
        )

    # 3. Validate all Resume IDs exist in the database up front
    existing_resumes = db.query(Resume).filter(Resume.id.in_(request.resume_ids)).all()
    existing_ids = {r.id for r in existing_resumes}
    
    for rid in request.resume_ids:
        if rid not in existing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Resume with ID {rid} does not exist."
            )

    # 4. Perform match evaluation for each candidate
    match_results = []
    for rid in request.resume_ids:
        try:
            match_record = evaluate_resume_against_job(rid, request.job_id, db)
            match_results.append(match_record)
        except Exception as e:
            # Handle partial evaluation errors cleanly
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Batch evaluation failed on resume ID {rid}: {str(e)}"
            )

    # 5. Extract results, compute ranks, and sort deterministically
    candidates_list = []
    for match in match_results:
        # Fall back to filename if name is not parsed inside structured_data
        candidate_name = match.resume.filename
        if match.resume.structured_data:
            contact_info = match.resume.structured_data.get("contact", {})
            if contact_info and contact_info.get("name"):
                candidate_name = contact_info.get("name")

        candidates_list.append({
            "resume_id": match.resume_id,
            "candidate_name": candidate_name,
            "overall_score": match.overall_score,
            "score_breakdown": match.score_breakdown,
            "matching_requirements": match.matching_requirements,
            "missing_requirements": match.missing_requirements,
            "justification": match.justification
        })

    # Sort descending by overall_score, secondary sort by resume_id ascending for deterministic ranking
    candidates_list.sort(key=lambda x: (-x["overall_score"], x["resume_id"]))

    # Assign rank index (1-based)
    ranked_results = []
    for idx, cand in enumerate(candidates_list, start=1):
        ranked_results.append(
            BatchScreeningResultCandidate(
                rank=idx,
                resume_id=cand["resume_id"],
                candidate_name=cand["candidate_name"],
                overall_score=cand["overall_score"],
                score_breakdown=cand["score_breakdown"],
                matching_requirements=cand["matching_requirements"],
                missing_requirements=cand["missing_requirements"],
                justification=cand["justification"]
            )
        )

    return BatchScreeningResponse(
        job_id=request.job_id,
        total_candidates=len(ranked_results),
        results=ranked_results
    )


@router.get("/{job_id}/results", response_model=BatchScreeningResponse, status_code=status.HTTP_200_OK)
async def get_screening_results(job_id: int, db: Session = Depends(get_db)):
    """
    Retrieve stored screening results for a job description.
    Sorts and ranks candidates deterministically.
    """
    # 1. Validate Job Description exists
    job = db.query(JobDescription).filter(JobDescription.id == job_id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job description with ID {job_id} not found."
        )

    # 2. Retrieve existing matches joined with Resumes
    matches = db.query(Match).options(joinedload(Match.resume)).filter(Match.job_id == job_id).all()

    # 3. Format and rank results
    candidates_list = []
    for match in matches:
        candidate_name = match.resume.filename
        if match.resume.structured_data:
            contact_info = match.resume.structured_data.get("contact", {})
            if contact_info and contact_info.get("name"):
                candidate_name = contact_info.get("name")

        candidates_list.append({
            "resume_id": match.resume_id,
            "candidate_name": candidate_name,
            "overall_score": match.overall_score,
            "score_breakdown": match.score_breakdown,
            "matching_requirements": match.matching_requirements,
            "missing_requirements": match.missing_requirements,
            "justification": match.justification
        })

    # Sort descending by overall_score, secondary sort by resume_id ascending for deterministic ranking
    candidates_list.sort(key=lambda x: (-x["overall_score"], x["resume_id"]))

    ranked_results = []
    for idx, cand in enumerate(candidates_list, start=1):
        ranked_results.append(
            BatchScreeningResultCandidate(
                rank=idx,
                resume_id=cand["resume_id"],
                candidate_name=cand["candidate_name"],
                overall_score=cand["overall_score"],
                score_breakdown=cand["score_breakdown"],
                matching_requirements=cand["matching_requirements"],
                missing_requirements=cand["missing_requirements"],
                justification=cand["justification"]
            )
        )

    return BatchScreeningResponse(
        job_id=job_id,
        total_candidates=len(ranked_results),
        results=ranked_results
    )
