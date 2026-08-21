"""
Service module for parsing Job Descriptions and extracting structured requirements using Gemini.
"""

import json
from typing import Dict, Any
from google import genai
from google.genai import types
from google.genai.errors import APIError
from app.config import settings
from app.schemas import JobRequirements
from app.services.llm_extractor import get_gemini_client

def parse_job_requirements(job_description_text: str) -> Dict[str, Any]:
    """
    Extract structured requirements from raw job description text.
    Args:
        job_description_text (str): Job description content.
    Returns:
        Dict[str, Any]: Structured requirements matching JobRequirements schema.
    """
    if not job_description_text or not job_description_text.strip():
        raise ValueError("Job description text is empty.")

    client = get_gemini_client()

    prompt = (
        "You are an expert job description parsing agent. Analyze the job description provided "
        "below and extract key structured requirements.\n"
        "CRITICAL RULES:\n"
        "1. Separate required_skills (must-haves) from preferred_skills (optional/nice-to-haves) strictly "
        "based on phrasing in the description. Do NOT hallucinate dependencies.\n"
        "2. Do not invent requirements that are not mentioned.\n"
        "3. Preserve exact technical terminology (e.g., framework versions, tool names).\n"
        "4. Return structured JSON matching the requested schema.\n\n"
        f"Job description text:\n{job_description_text}"
    )

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=JobRequirements,
                temperature=0.1
            )
        )

        response_json = json.loads(response.text)
        validated_requirements = JobRequirements.model_validate(response_json)
        return validated_requirements.model_dump()
    except APIError as api_err:
        raise RuntimeError(f"Gemini API failure during job description parsing: {str(api_err)}") from api_err
    except (json.JSONDecodeError, Exception) as parse_err:
        raise ValueError(f"Failed to parse and validate structured job requirements JSON: {str(parse_err)}") from parse_err
