"""
SQLAlchemy models for HireLens (Day 1).
Defines database schemas for Resumes, JobDescriptions, and Matches.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Resume(Base):
    """
    Represents a candidate's uploaded resume with extracted structured data and metadata.
    """
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    structured_data = Column(JSON, nullable=True)  # Will contain parsed details later
    extraction_confidence = Column(JSON, nullable=True)  # Will contain extraction metrics later
    uploaded_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    matches = relationship("Match", back_populates="resume", cascade="all, delete-orphan")


class JobDescription(Base):
    """
    Represents a Job Description posted for matching candidate resumes.
    """
    __tablename__ = "job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    raw_text = Column(Text, nullable=False)
    parsed_requirements = Column(JSON, nullable=True)  # Will contain requirements schema later
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    matches = relationship("Match", back_populates="job", cascade="all, delete-orphan")


class Match(Base):
    """
    Represents the matching status and granular scoring details between a resume and job.
    """
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("job_descriptions.id", ondelete="CASCADE"), nullable=False)
    overall_score = Column(Integer, nullable=False)
    score_breakdown = Column(JSON, nullable=False)
    matching_requirements = Column(JSON, nullable=False)
    missing_requirements = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

    resume = relationship("Resume", back_populates="matches")
    job = relationship("JobDescription", back_populates="matches")
