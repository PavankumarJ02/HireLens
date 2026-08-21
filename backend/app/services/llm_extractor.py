"""
Service module for parsing candidate resumes and extracting structured profiles using Gemini.
"""

import json
from typing import Dict, Any
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

def extract_structured_data(resume_text: str) -> Dict[str, Any]:
    """
    Extract structured candidate data from raw resume text using Gemini.
    Args:
        resume_text (str): Cleaned raw text of candidate resume.
    Returns:
        Dict[str, Any]: Extracted structured resume profile matching StructuredResume schema.
    """
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text is empty.")

    client = get_gemini_client()

    prompt = (
        "You are an expert resume parsing system. Analyze the raw resume text provided below "
        "and extract candidate profile details. "
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
        return validated_resume.model_dump()
    except APIError as api_err:
        raise RuntimeError(f"Gemini API failure during resume extraction: {str(api_err)}") from api_err
    except (json.JSONDecodeError, Exception) as parse_err:
        raise ValueError(f"Failed to parse and validate structured extraction JSON: {str(parse_err)}") from parse_err
