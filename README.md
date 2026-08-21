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

## 📅 Day 3 — Batch Screening & Candidate Ranking

Day 3 introduces the capability to screen multiple candidates against one job posting and return a ranked candidate list.

### 🚀 Key Enhancements
- **Batch Evaluation:** A single endpoint `POST /screening/batch` handles processing multiple resumes at once.
- **Cache Reuse:** Avoids repeat LLM API calls by pulling cached structured profiles and job requirements when available.
- **Deterministic Ranking:** Sorts candidate matching outputs descending by `overall_score`. In the event of matching scores, tie-breaking defaults to ascending `resume_id`.
- **Missing Skills Classification:** Automatically separates missing candidate requirements into `required` vs `preferred` skill categories in Python by checking against the job description schema.

### 🔌 Screening Endpoint
- **Endpoint:** `POST /screening/batch`
- **Request Body:**
  ```json
  {
    "job_id": 1,
    "resume_ids": [1, 2, 3]
  }
  ```
- **Response Structure:**
  ```json
  {
    "job_id": 1,
    "total_candidates": 3,
    "results": [
      {
        "rank": 1,
        "resume_id": 2,
        "candidate_name": "Alice Cooper",
        "overall_score": 85,
        "score_breakdown": {
          "skills": 90,
          "experience": 80,
          "projects": 85,
          "education": 80
        },
        "matching_requirements": ["FastAPI", "Python"],
        "missing_requirements": {
          "required": ["Docker"],
          "preferred": ["Kubernetes"]
        },
        "justification": "Skills evaluation... Experience evaluation..."
      }
    ]
  }
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
- Single Match Evaluation: `POST /matches/run` with `resume_id` and `job_id`.
- Batch Match Evaluation: `POST /screening/batch` with `job_id` and a list of `resume_ids`.
