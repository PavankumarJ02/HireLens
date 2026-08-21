# HireLens — Explainable, Evidence-Based Resume Screening System

HireLens is a production-grade recruitment intelligence tool that converts raw resumes and job descriptions into structured profiles and compares them using a hybrid deterministic-AI approach.

## Tech Stack
- **Backend:** FastAPI (Python) + PostgreSQL (SQLAlchemy ORM) + pdfplumber + Google Gemini API (`google-genai` SDK)
- **Frontend:** React (Vite) + Tailwind CSS

---

## 📅 Day 1 — Database & Resume Processing
- **Parsing:** Extract raw plain text from candidate PDFs using `pdfplumber`.
- **API Endpoint:** `POST /resumes/upload` accepts resumes, parses, and saves content to PostgreSQL.

---

## 📅 Day 2 — AI Pipeline & Explainable Scoring

HireLens rejects the "black box" scoring method. Instead of letting an LLM guess a holistic score, HireLens extracts candidate facts, defines job requirements, score-matches individual categories, and calculates the final score deterministically.

### ⚖️ Score Weights (Calculated in Python)
The final match score is computed inside Python using strict weights. This prevents LLMs from skewing metrics and ensures consistency across evaluations:
- **Technical Skills:** 40%
- **Professional Experience:** 25%
- **Project Relevance:** 20%
- **Educational Background:** 15%

---

### 📝 LLM Prompts Used

#### 1. Resume Structured Extraction Prompt (`llm_extractor.py`)
```
You are an expert resume parsing system. Analyze the raw resume text provided below and extract candidate profile details.
CRITICAL RULES:
1. Extract ONLY facts explicitly stated in the text. Do NOT make up, assume, or hallucinate details.
2. If contact info, specific skills, experiences, projects, or certifications are not explicitly mentioned, leave them blank, empty strings, or empty lists as appropriate.
3. Do not evaluate the candidate. Focus purely on accurate extraction and normalization.
4. For candidate name, prioritize extraction from the header of the resume.
```

#### 2. Job Description Extraction Prompt (`llm_job_parser.py`)
```
You are an expert job description parsing agent. Analyze the job description provided below and extract key structured requirements.
CRITICAL RULES:
1. Separate required_skills (must-haves) from preferred_skills (optional/nice-to-haves) strictly based on phrasing in the description. Do NOT hallucinate dependencies.
2. Do not invent requirements that are not mentioned.
3. Preserve exact technical terminology (e.g., framework versions, tool names).
4. Return structured JSON matching the requested schema.
```

#### 3. Match Evaluation Prompt (`llm_matcher.py`)
```
You are an expert HR evaluation assistant. Compare the candidate's structured resume against the job requirements and compute factor scores from 0 to 100.
Evaluation Dimensions:
1. Skills: Match technical/soft skills. Highlight required vs preferred overlap.
2. Experience: Relevance and tenure of past experiences.
3. Projects: Check if project scope and technology stack align with the job responsibilities.
4. Education: Check degree requirements alignment.

CRITICAL RULES:
1. Do NOT calculate the final weighted overall score. You must only evaluate the individual dimensions.
2. CITE concrete evidence from the resume text or experience description for every dimension's score.
3. Do not assume or invent facts. If the resume is missing any requirement, explicitly list it under missing_requirements.
4. Return structured JSON conforming to the requested schema.
```

---

## Getting Started

### Backend Setup
1. Navigate to the `backend/` directory.
2. Copy `.env.example` to `.env` and fill in credentials:
   - `DATABASE_URL` (Supabase Postgres URI)
   - `GEMINI_API_KEY` (Google Gemini API credentials)
   - `GEMINI_MODEL=gemini-2.5-flash-lite`
3. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Running Matches
Match evaluations are run by calling `POST /matches/run` with `resume_id` and `job_id`.
