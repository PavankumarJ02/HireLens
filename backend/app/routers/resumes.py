"""
Router for handling resume upload and processing endpoints.
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Resume
from app.schemas import ResumeOut
from app.services.pdf_parser import extract_text_from_pdf, PDFParsingError

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Upload a resume PDF, extract raw text, and save the record to the database.
    
    Args:
        file (UploadFile): The resume PDF file.
        db (Session): The database session.
    Returns:
        ResumeOut: The created resume database record.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )

    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_pdf(file_bytes)
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
