"""
Pydantic schemas for data validation and serialization.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional, Union
from pydantic import BaseModel, ConfigDict, Field

# --- Candidate Profile Extractions ---

class Contact(BaseModel):
    """Candidate contact info."""
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""

class Experience(BaseModel):
    """Candidate professional experience item."""
    role: Optional[str] = ""
    company: Optional[str] = ""
    duration: Optional[str] = ""
    description: Optional[str] = ""

class Education(BaseModel):
    """Candidate educational history item."""
    degree: Optional[str] = ""
    institution: Optional[str] = ""
    year: Optional[str] = ""

class Project(BaseModel):
    """Candidate project details."""
    name: Optional[str] = ""
    technologies: List[str] = Field(default_factory=list)
    description: Optional[str] = ""

class StructuredResume(BaseModel):
    """Complete candidate structured profile."""
    contact: Contact
    skills: List[str] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)


# --- Job Requirements Extractions ---

class JobRequirements(BaseModel):
    """Job requirements structure parsed from a description."""
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: List[str] = Field(default_factory=list)
    minimum_experience: Optional[str] = ""
    education_requirements: List[str] = Field(default_factory=list)
    responsibilities: List[str] = Field(default_factory=list)
    keywords: List[str] = Field(default_factory=list)


# --- Match Evaluation ---

class Evidence(BaseModel):
    """Granular matching evidence text per-dimension."""
    skills: Optional[str] = ""
    experience: Optional[str] = ""
    projects: Optional[str] = ""
    education: Optional[str] = ""

class ScoreBreakdown(BaseModel):
    """Breakdown of factor scores from 0 to 100."""
    skills: int = Field(..., ge=0, le=100)
    experience: int = Field(..., ge=0, le=100)
    projects: int = Field(..., ge=0, le=100)
    education: int = Field(..., ge=0, le=100)

class LLMMatchResult(BaseModel):
    """Raw evaluation response returned by Gemini."""
    skills_score: int = Field(..., ge=0, le=100)
    experience_score: int = Field(..., ge=0, le=100)
    projects_score: int = Field(..., ge=0, le=100)
    education_score: int = Field(..., ge=0, le=100)
    matching_requirements: List[str] = Field(default_factory=list)
    missing_requirements: List[str] = Field(default_factory=list)
    evidence: Evidence

class MissingRequirements(BaseModel):
    """Categorized missing requirements."""
    required: List[str] = Field(default_factory=list)
    preferred: List[str] = Field(default_factory=list)


# --- API Request / Response Schemas ---

class ResumeBase(BaseModel):
    filename: str

class ResumeOut(ResumeBase):
    id: int
    raw_text: str
    structured_data: Optional[Dict[str, Any]] = None
    extraction_confidence: Optional[Dict[str, Any]] = None
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

class JobDescriptionCreate(BaseModel):
    title: str
    raw_text: str

class JobDescriptionOut(JobDescriptionCreate):
    id: int
    parsed_requirements: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MatchRunRequest(BaseModel):
    resume_id: int
    job_id: int

class MatchOut(BaseModel):
    id: int
    resume_id: int
    job_id: int
    overall_score: int
    score_breakdown: ScoreBreakdown
    matching_requirements: List[str]
    missing_requirements: Union[List[str], MissingRequirements]  # Supports flat list or categorized dict
    justification: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Batch Screening & Candidate Detail Schemas ---

class BatchScreeningRequest(BaseModel):
    job_id: int
    resume_ids: List[int]

class BatchScreeningResultCandidate(BaseModel):
    rank: int
    resume_id: int
    candidate_name: str
    overall_score: int
    score_breakdown: ScoreBreakdown
    matching_requirements: List[str]
    missing_requirements: Union[List[str], MissingRequirements]
    justification: Optional[str] = None

class BatchScreeningResponse(BaseModel):
    job_id: int
    total_candidates: int
    results: List[BatchScreeningResultCandidate]


class CandidateDetailResponse(BaseModel):
    """Combined profile and match metrics schema for candidate-detail view."""
    resume_id: int
    filename: str
    uploaded_at: datetime
    
    # Candidate profile data
    candidate_name: Optional[str] = ""
    contact: Optional[Contact] = None
    skills: List[str] = Field(default_factory=list)
    experience: List[Experience] = Field(default_factory=list)
    education: List[Education] = Field(default_factory=list)
    projects: List[Project] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    
    # Matching details (optional, returned if job_id was evaluated)
    job_id: Optional[int] = None
    overall_score: Optional[int] = None
    score_breakdown: Optional[ScoreBreakdown] = None
    matching_requirements: Optional[List[str]] = None
    missing_requirements: Optional[Union[List[str], MissingRequirements]] = None
    justification: Optional[str] = None
