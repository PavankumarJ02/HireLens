"""
Pydantic schemas for data validation and serialization.
"""

from typing import List, Optional
from pydantic import BaseModel

class ResumeBase(BaseModel):
    """Base schema for Resumes."""
    filename: str

class ResumeCreate(ResumeBase):
    """Schema for creating a Resume."""
    raw_text: str
    parsed_skills: Optional[str] = None
    parsed_experience: Optional[str] = None
    parsed_education: Optional[str] = None

class ResumeResponse(ResumeBase):
    """Response schema for a Resume."""
    id: int
    raw_text: Optional[str]
    parsed_skills: Optional[str]
    parsed_experience: Optional[str]
    parsed_education: Optional[str]

    class Config:
        orm_mode = True


class JobBase(BaseModel):
    """Base schema for Jobs."""
    title: str
    description: str

class JobCreate(JobBase):
    """Schema for creating a Job."""
    pass

class JobResponse(JobBase):
    """Response schema for a Job."""
    id: int

    class Config:
        orm_mode = True


class MatchBase(BaseModel):
    """Base schema for Matches."""
    resume_id: int
    job_id: int
    score: float
    justification: str

class MatchCreate(MatchBase):
    """Schema for creating a Match."""
    pass

class MatchResponse(MatchBase):
    """Response schema for a Match."""
    id: int

    class Config:
        orm_mode = True
