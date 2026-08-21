"""
Service module for parsing candidate resumes and extracting structured profiles using Gemini.
"""

import json
import re
from typing import Dict, Any, Tuple
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.config import settings
from app.schemas import StructuredResume

# Lazy initialization function to avoid crash on import if GEMINI_API_KEY is not configured
def get_gemini_client() -> genai.Client:
    """
    Initializes and returns the Google GenAI Client.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")
    return genai.Client(api_key=settings.GEMINI_API_KEY)


def calculate_extraction_confidence(structured_data: dict, raw_text: str) -> dict:
    """
    Calculate a Python-based confidence summary for structured resume extraction.
    """
    confidence = {
        "contact_info": "high",
        "skills": "high",
        "experience": "high",
        "education": "high",
        "overall_confidence": "high"
    }

    # Evaluate contact info
    contact = structured_data.get("contact", {}) or {}
    filled_contact_fields = sum(1 for v in contact.values() if v and str(v).strip())
    if filled_contact_fields <= 1:
        confidence["contact_info"] = "low"
    elif filled_contact_fields <= 3:
        confidence["contact_info"] = "medium"

    # Evaluate skills
    skills = structured_data.get("skills", [])
    if not skills:
        confidence["skills"] = "low"
    elif len(skills) < 3:
        confidence["skills"] = "medium"

    # Evaluate experience (checking if explicit years/duration can be parsed or inferred)
    experience = structured_data.get("experience", [])
    if not experience:
        if "experience" in raw_text.lower() or "work" in raw_text.lower() or "job" in raw_text.lower():
            confidence["experience"] = "low"
    else:
        has_dates = True
        for exp in experience:
            duration = exp.get("duration", "") or ""
            if not re.search(r'\b\d{4}\b', duration):
                has_dates = False
                break
        if not has_dates:
            confidence["experience"] = "medium"

    # Evaluate education
    education = structured_data.get("education", [])
    if not education:
        if "education" in raw_text.lower() or "degree" in raw_text.lower() or "university" in raw_text.lower():
            confidence["education"] = "low"
    else:
        has_degree_years = True
        for edu in education:
            year = edu.get("year", "") or ""
            if not re.search(r'\b\d{4}\b', year):
                has_degree_years = False
                break
        if not has_degree_years:
            confidence["education"] = "medium"

    # Compute overall confidence
    levels = [confidence["contact_info"], confidence["skills"], confidence["experience"], confidence["education"]]
    if "low" in levels:
        confidence["overall_confidence"] = "low"
    elif "medium" in levels:
        confidence["overall_confidence"] = "medium"
    else:
        confidence["overall_confidence"] = "high"

    return confidence


def extract_structured_data(resume_text: str) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Extract structured candidate data from raw resume text using Gemini.
    Args:
        resume_text (str): Cleaned raw text of candidate resume.
    Returns:
        Tuple[Dict[str, Any], Dict[str, Any]]: (structured_resume, confidence_dict)
    """
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty.")

    client = get_gemini_client()

    prompt = (
        "You are an expert resume parsing system. Analyze the raw resume text provided below "
        "and extract candidate profile details.\n\n"
        "CRITICAL RULES:\n"
        "1. Extract ONLY facts explicitly stated in the text. Do NOT make up, assume, or hallucinate details.\n"
        "2. If contact info, specific skills, experiences, projects, or certifications are not explicitly mentioned, "
        "leave them blank, empty strings, or empty lists as appropriate.\n"
        "3. Do not evaluate the candidate. Focus purely on accurate extraction and normalization.\n"
        "4. For candidate name, prioritize extraction from the header of the resume.\n\n"
        f"Resume text:\n{resume_text}"
    )

    try:
        # Requesting Structured JSON output using Pydantic schema validation built into the SDK
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=StructuredResume,
                temperature=0.1
            )
        )
        
        # Parse the JSON response
        response_json = json.loads(response.text)
        
        # Validate structured response using Pydantic model
        validated_resume = StructuredResume.model_validate(response_json)
        structured_data = validated_resume.model_dump()
        
        # Calculate extraction confidence metrics
        confidence_dict = calculate_extraction_confidence(structured_data, resume_text)
        
        return structured_data, confidence_dict
    except APIError as api_err:
        raise RuntimeError(f"Gemini API failure during resume extraction: {str(api_err)}") from api_err
    except (json.JSONDecodeError, Exception) as parse_err:
        raise ValueError(f"Failed to parse and validate structured extraction JSON: {str(parse_err)}") from parse_err
