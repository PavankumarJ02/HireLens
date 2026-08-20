"""
SQLAlchemy models for the Smart Resume Screener.
Defines database schemas for resumes, jobs, and matches.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Resume(Base):
    """
    Represents a candidate's resume uploaded to the system.
    """
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    raw_text = Column(Text, nullable=True)
    parsed_skills = Column(Text, nullable=True)  # Stored as JSON string or text
    parsed_experience = Column(Text, nullable=True)
    parsed_education = Column(Text, nullable=True)

    matches = relationship("Match", back_populates="resume", cascade="all, delete-orphan")


class Job(Base):
    """
    Represents a Job Description posted for matching candidate resumes.
    """
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)

    matches = relationship("Match", back_populates="job", cascade="all, delete-orphan")


class Match(Base):
    """
    Represents the matching details and score between a resume and a job description.
    """
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)
    score = Column(Float, nullable=False)  # 1 to 10 scale
    justification = Column(Text, nullable=False)

    resume = relationship("Resume", back_populates="matches")
    job = relationship("Job", back_populates="matches")
