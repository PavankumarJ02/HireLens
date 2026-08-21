"""
Service module for matching structured candidate profile against structured job requirements using Gemini.
Includes Python-based deterministic scoring.
"""

import json
from typing import Dict, Any
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.config import settings
from app.schemas import LLMMatchResult
from app.services.llm_extractor import get_gemini_client

# Define scoring weights globally for modularity
SCORING_WEIGHTS = {
    "skills": 0.40,
    "experience": 0.25,
    "projects": 0.20,
    "education": 0.15
}

def calculate_final_score(scores: Dict[str, int]) -> int:
    """
    Calculate overall candidate score deterministically in Python.
    
    Args:
        scores (Dict[str, int]): Dict containing granular scores: skills, experience, projects, education.
    Returns:
        int: Rounded overall score out of 100.
    """
    weighted_sum = (
        scores.get("skills", 0) * SCORING_WEIGHTS["skills"] +
        scores.get("experience", 0) * SCORING_WEIGHTS["experience"] +
        scores.get("projects", 0) * SCORING_WEIGHTS["projects"] +
        scores.get("education", 0) * SCORING_WEIGHTS["education"]
    )
    return int(round(weighted_sum))

def score_match(structured_resume: Dict[str, Any], parsed_job_requirements: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare a structured candidate profile against job requirements using Gemini.
    Provides factor scores (0-100) and evidence.
    
    Args:
        structured_resume (Dict): Structured candidate profile.
        parsed_job_requirements (Dict): Structured job requirements.
    Returns:
        Dict: Match result metrics containing factor scores, matching/missing points, and evidence text.
    """
    client = get_gemini_client()

    prompt = (
        "You are an expert HR evaluation assistant. Compare the candidate's structured resume "
        "against the job requirements and compute factor scores from 0 to 100.\n\n"
        "Evaluation Dimensions:\n"
        "1. Skills: Match technical/soft skills. Highlight required vs preferred overlap.\n"
        "2. Experience: Relevance and tenure of past experiences.\n"
        "3. Projects: Check if project scope and technology stack align with the job responsibilities.\n"
        "4. Education: Check degree requirements alignment.\n\n"
        "CRITICAL RULES:\n"
        "1. Do NOT calculate the final weighted overall score. You must only evaluate the individual dimensions.\n"
        "2. CITE concrete evidence from the resume text or experience description for every dimension's score.\n"
        "3. Do not assume or invent facts. If the resume is missing any requirement, explicitly list it under missing_requirements.\n"
        "4. Return structured JSON conforming to the requested schema.\n\n"
        f"Candidate Structured Resume:\n{json.dumps(structured_resume, indent=2)}\n\n"
        f"Job Description Requirements:\n{json.dumps(parsed_job_requirements, indent=2)}"
    )

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=LLMMatchResult,
                temperature=0.1
            )
        )

        response_json = json.loads(response.text)
        validated_result = LLMMatchResult.model_validate(response_json)
        return validated_result.model_dump()
    except APIError as api_err:
        raise RuntimeError(f"Gemini API failure during candidate matching: {str(api_err)}") from api_err
    except (json.JSONDecodeError, Exception) as parse_err:
        raise ValueError(f"Failed to parse and validate structured match result JSON: {str(parse_err)}") from parse_err
