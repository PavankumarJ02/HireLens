"""
Pydantic schemas for data validation and serialization (Day 1).
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, ConfigDict, Field

# --- Resume ---

class ResumeBase(BaseModel):
    """Base schema for Resume details."""
    filename: str

class ResumeCreate(ResumeBase):
    """Schema for creating a Resume database record."""
    raw_text: str
    structured_data: Optional[Dict[str, Any]] = None
    extraction_confidence: Optional[Dict[str, Any]] = None

class ResumeOut(ResumeBase):
    """Response schema for Resume queries."""
    id: int
    raw_text: str
    structured_data: Optional[Dict[str, Any]] = None
    extraction_confidence: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Job Description ---

class JobDescriptionBase(BaseModel):
    """Base schema for Job Description details."""
    title: str
    raw_text: str

class JobDescriptionCreate(JobDescriptionBase):
    """Schema for creating a Job Description record."""
    parsed_requirements: Optional[Dict[str, Any]] = None

class JobDescriptionOut(JobDescriptionBase):
    """Response schema for Job Description query results."""
    id: int
    parsed_requirements: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Match ---

class ScoreBreakdown(BaseModel):
    """Nested schema representing granular matching scores."""
    skills: int = Field(..., ge=1, le=10, description="Granular match score for skills")
    experience: int = Field(..., ge=1, le=10, description="Granular match score for experience")
    education: int = Field(..., ge=1, le=10, description="Granular match score for education")

class MatchBase(BaseModel):
    """Base schema for Matches."""
    resume_id: int
    job_id: int
    overall_score: int = Field(..., ge=1, le=10)
    score_breakdown: ScoreBreakdown
    matching_requirements: List[Any]
    missing_requirements: List[Any]

class MatchCreate(MatchBase):
    """Schema for creating a Match record."""
    pass

class MatchOut(MatchBase):
    """Response schema for Match query results."""
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
