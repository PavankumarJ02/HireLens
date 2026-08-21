# HireLens — Explainable, Evidence-Based Resume Screening System

HireLens is a production-grade recruitment intelligence tool that converts raw resumes and job descriptions into structured profiles and compares them using a hybrid deterministic-AI approach.

## Tech Stack
- **Backend:** FastAPI (Python) + PostgreSQL (SQLAlchemy ORM) + pdfplumber + Google Gemini API (`google-genai` SDK)
- **Frontend:** React (Vite) + Tailwind CSS

## Architecture & Data Flow
1. **Resume Ingestion:** Upload PDF resume → Parse text via `pdfplumber` → Save raw text to Database.
2. **Structured Extraction (Gemini):** Prompt Gemini 2.5 Flash-Lite to extract candidate profiles (JSON) and cache them in the `structured_data` column on the `Resume` model.
3. **Requirement Extraction (Gemini):** Parse raw Job Description text to identify skills, experience, and educational requirements. Cache on the `JobDescription` model.
4. **Matching & Python Scoring:** Compare candidate profile against requirements. Gemini evaluates individual dimensions (Skills, Experience, Projects, Education) from 0-100 and returns evidence. Python calculates the overall score deterministically.
5. **Deterministic Ranking:** Match scores are ranked descending. In the event of a tie, the candidate with the lower `resume_id` is ranked higher.

---

## ⚖️ Score Weights (Calculated in Python)
The final match score is computed inside Python using strict weights. This prevents LLMs from skewing metrics and ensures consistency across evaluations:
- **Technical Skills:** 40%
- **Professional Experience:** 25%
- **Project Relevance:** 20%
- **Educational Background:** 15%

---

## 🔒 Environment Variables
Create a `backend/.env` file with the following variables:
```
DATABASE_URL=postgresql://user:password@localhost:5432/resume_screener
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash-lite
```

---

## 🔌 API Endpoints Reference

### Job APIs

#### 1. Create a Job Description
- **Endpoint:** `POST /jobs/`
- **Request Body:**
  ```json
  {
    "title": "AI/ML Engineer",
    "raw_text": "We are looking for an AI/ML Engineer with Python, FastAPI..."
  }
  ```
- **Response:**
  ```json
  {
    "id": 1,
    "title": "AI/ML Engineer",
    "raw_text": "We are looking for..."
  }
  ```

#### 2. Get All Jobs
- **Endpoint:** `GET /jobs`
- **Response:** List of job description objects.

#### 3. Get Specific Job
- **Endpoint:** `GET /jobs/{job_id}`
- **Response:** Job description details. Returns `404 Not Found` if job doesn't exist.

---

### Resume APIs

#### 1. Upload Resume
- **Endpoint:** `POST /resumes/upload` (multipart/form-data)
- **Request Parameters:** `file` (PDF file)
- **Response:** Uploaded resume metadata and raw text.

#### 2. Get All Resumes
- **Endpoint:** `GET /resumes`
- **Response:** List of resume metadata and parsed raw texts.

#### 3. Get Resume Details (with optional Match)
- **Endpoint:** `GET /resumes/{resume_id}`
- **Query Parameter (Optional):** `job_id` (integer)
- **Description:** Exposes structured candidate profile (education, experience, projects, skills). If `job_id` is supplied and a match evaluation exists, it appends the matching score breakdown, matching/missing requirements, and text justification.
- **Response:**
  ```json
  {
    "resume_id": 1,
    "filename": "resume.pdf",
    "candidate_name": "Bob Smith",
    "contact": { "email": "bob@example.com" },
    "skills": ["Python", "FastAPI"],
    "experience": [],
    "education": [],
    "projects": [],
    "job_id": 1,
    "overall_score": 85,
    "score_breakdown": {
      "skills": 90,
      "experience": 80,
      "projects": 80,
      "education": 90
    },
    "matching_requirements": ["Python", "FastAPI"],
    "missing_requirements": {
      "required": ["Docker"],
      "preferred": []
    },
    "justification": "Skills evaluation... Experience evaluation..."
  }
  ```

---

### Match APIs

#### 1. Trigger Match Evaluation
- **Endpoint:** `POST /matches/run`
- **Request Body:**
  ```json
  {
    "resume_id": 1,
    "job_id": 1
  }
  ```
- **Response:** Returns the match record, caching results on first runs and reusing cached records on subsequent triggers.

#### 2. Get Specific Match details
- **Endpoint:** `GET /matches/{match_id}`
- **Response:** Persisted match details including score, breakdown, and evidence justification. Returns `404 Not Found` if match record doesn't exist.

---

### Batch Screening APIs

#### 1. Batch Screen Resumes
- **Endpoint:** `POST /screening/batch`
- **Request Body:**
  ```json
  {
    "job_id": 1,
    "resume_ids": [1, 2, 3]
  }
  ```
- **Response:** Returns deterministic candidate ranking and matching profiles.

#### 2. Get Screening Results for Job
- **Endpoint:** `GET /screening/{job_id}/results`
- **Description:** Retrieves all match evaluations for a job posting, sorted descending by overall score and ranked deterministically.
- **Response:**
  ```json
  {
    "job_id": 1,
    "total_candidates": 2,
    "results": [
      {
        "rank": 1,
        "resume_id": 2,
        "candidate_name": "Alice Cooper",
        "overall_score": 85,
        "score_breakdown": { ... },
        "matching_requirements": [...],
        "missing_requirements": {
          "required": [],
          "preferred": []
        },
        "justification": "..."
      }
    ]
  }
  ```

---

## ⚡ Caching Behavior
Whenever a resume or job is evaluated, the structured data extraction is saved in the database under `structured_data` and `parsed_requirements` respectively. When run matches or batch evaluations trigger, cached data is reused to avoid repetitive LLM queries, lowering billing and processing latency.

---

## 🛠️ Error Handling
Standard error codes are returned inside clear FastAPI JSON exceptions:
- **Missing Resource (Job/Resume/Match):** HTTP `404 Not Found`
- **Empty Batch List:** HTTP `400 Bad Request`
- **API/Gemini failure:** HTTP `502 Bad Gateway`
- **Internal Database issues:** HTTP `500 Internal Server Error`

---

## Getting Started

### Backend Setup
1. Navigate to the `backend/` directory.
2. Setup `.env` configuration.
3. Start the application:
   ```bash
   uvicorn app.main:app --reload
   ```
