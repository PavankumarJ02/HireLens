# HireLens — Explainable, Evidence-Based Resume Screening System

> "Not just a score — a decision you can defend."

HireLens is an intelligent recruitment tool designed to automate candidate screening while maintaining complete explainability. By combining deterministic rule-based verification with Gemini-powered contextual evaluations, HireLens generates structured candidate profiles and computes evidence-linked alignment scores that HR teams can trace, trust, and audit.

---

## 💡 Why HireLens is Different

Standard AI resume screening tools operate as "black boxes," passing candidate resumes and job descriptions directly to LLMs to output a single holistic score (e.g., "7/10"). This approach suffers from:
*   **Lack of Traceability:** Recruiters cannot verify *why* a candidate received a particular rating.
*   **Hallucination Risk:** LLMs can misinterpret or invent candidate experience, skills, or projects.
*   **Bias and Inconsistency:** Holistic ratings fluctuate based on prompt phrasing and contextual temperature changes.

### The HireLens Hybrid Approach:
1.  **Deterministic categories (Objective Facts):** Objective metrics like skill presence, years of experience, and degrees are evaluated deterministically in Python rather than relying on unstructured LLM guesses.
2.  **Granular Factor Breakdown:** Matches are split into four clear dimensions (Skills: 40%, Experience: 25%, Projects: 20%, Education: 15%).
3.  **Strict Evidence Linking:** For each evaluated category, the LLM is forced to extract and cite direct quotes from the candidate's resume and map them against specific requirements.
4.  **Python-Driven Scoring:** Gemini evaluates individual dimension scores (0-100) and supplies evidence. The final score is computed deterministically in Python using weighted logic, ensuring auditing trust.

---

## 🏗️ Architecture & Data Flow

```mermaid
graph TD
    A["📄 Resume Upload + Job Description"] --> B["⚡ FastAPI Endpoints<br/>(/resumes/upload & /jobs/)"]
    B --> C["📑 PDF Text Extraction (pdfplumber)"]
    C --> D["1️⃣ Structured Ingestion<br/>(Gemini 2.5 Flash-Lite)"]
    D --> E["2️⃣ Deterministic Overlap Matcher<br/>(Rule-based skill classification)"]
    E --> F["3️⃣ Evidence-Linked Scoring<br/>(Gemini reasoning + dimension breakdown)"]
    F --> G["🛡️ Stored DB Record (matches table)"]
    F --> H["🗄️ PostgreSQL Cache (structured_data)"]
    G --> I["📊 Dashboard (Ranked Shortlist View)"]

    style A fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style B fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
    style C fill:#1e293b,stroke:#94a3b8,stroke-width:2px,color:#f8fafc
    style D fill:#1e293b,stroke:#fb923c,stroke-width:2px,color:#f8fafc
    style E fill:#1e293b,stroke:#34d399,stroke-width:2px,color:#f8fafc
    style F fill:#1e293b,stroke:#f472b6,stroke-width:2px,color:#f8fafc
    style G fill:#0f172a,stroke:#c084fc,stroke-width:2px,color:#f8fafc
    style H fill:#0f172a,stroke:#94a3b8,stroke-width:2px,color:#f8fafc
    style I fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#f8fafc
```

### Data Flow Pipeline:
1.  **Resume Upload:** Recruiter uploads a PDF resume. The backend extracts plain text using `pdfplumber`.
2.  **Structured Ingestion:** Gemini 2.5 Flash-Lite converts raw resume text into structured JSON (skills, experience list, education list, project details). Results are saved in the `structured_data` column on the `Resume` database table.
3.  **Requirement Extraction:** The raw Job Description (JD) text is parsed by Gemini to extract structured requirements (required skills, preferred skills, minimum experience, education) and cached in `JobDescription.parsed_requirements`.
4.  **Evidence Scoring:** The structured candidate profile and job requirements are matched by Gemini to yield sub-scores and textual evidence quotes.
5.  **Weighted Calculations:** Python reads sub-scores, calculates the rounded overall score, and classifies missing skills into `required` vs `preferred` buckets.
6.  **Dashboard Display:** The final record is persisted in the `matches` table and loaded on the recruiter dashboard.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React (Vite) | Clean, fast SPA recruiter dashboard |
| **Styling** | Tailwind CSS v4 | SaaS responsive user interface layout |
| **Backend** | FastAPI (Python) | Production-grade REST API service |
| **Database** | PostgreSQL (SQLAlchemy ORM) | Relational candidate profiles and matches storage |
| **LLM** | Google Gemini 2.5 Flash-Lite | Contextual extraction, requirement matching, and evidence generation |
| **PDF Parsing** | pdfplumber | Raw text extraction from resume PDF files |

---

## 📂 Project Structure

```
hirelens/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI application setup and router registrations
│   │   ├── models.py             # SQLAlchemy models (Resume, JobDescription, Match)
│   │   ├── database.py           # PostgreSQL DB connections and session dependencies
│   │   ├── schemas.py            # Pydantic validation schemas (Job list, Resume detail, MatchOut)
│   │   ├── routers/
│   │   │   ├── resumes.py        # Endpoints for resume uploads and profile queries
│   │   │   ├── jobs.py           # Endpoints for creating and querying jobs
│   │   │   ├── matches.py        # Single candidate match run and match detail route handlers
│   │   │   └── screening.py      # Batch candidate evaluations and ranking endpoint handlers
│   │   ├── services/
│   │   │   ├── pdf_parser.py     # PDF parsing and whitespace cleaning using pdfplumber
│   │   │   ├── llm_extractor.py  # Gemini service for candidate structured JSON profile extraction
│   │   │   ├── llm_job_parser.py # Gemini service for Job Description structured requirement extraction
│   │   │   └── llm_matcher.py    # Gemini service for dimension matches and Python weighted scorer
│   │   └── config.py             # Configuration loader for database URIs and Gemini API keys
│   ├── requirements.txt          # Python packages list (fastapi, google-genai, sqlalchemy, etc.)
│   ├── .env.example              # Placeholder templates for API credentials
│   └── .gitignore                # Gitignore rules for Python caches and env files
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Layout navigation component
│   │   │   ├── Loader.jsx        # Spinner and loading progress alerts
│   │   │   └── ErrorAlert.jsx    # User-friendly warning banners for network issues
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Overview page for job metrics and vacancies
│   │   │   ├── Jobs.jsx          # Vacancy listing and inline creations form
│   │   │   ├── JobDetails.jsx    # Display full job text and structured job requirements
│   │   │   ├── Candidates.jsx    # Candidate database listing and PDF upload forms
│   │   │   ├── ScreenCandidates.jsx # Multi-select candidate screening initiator
│   │   │   ├── ScreeningResults.jsx # Ranked candidate tables, score breakdowns, and comparisons
│   │   │   ├── CandidateDetails.jsx # Detailed profile view joined with evaluation evidence
│   │   │   └── CompareCandidates.jsx# Candidate side-by-side comparison tables
│   │   ├── services/
│   │   │   └── api.js            # Unified API caller mapping to FastAPI ports
│   │   ├── App.jsx               # Main state router and application framework
│   │   └── index.css             # Tailwind CSS entry directive
│   ├── vite.config.js            # Vite configurations with tailwindcss compiler plugins
│   └── package.json              # Frontend package configurations and scripts
└── README.md                     # Technical project documentation
```

---

## 🚀 Setup Instructions

### Prerequisites
*   **Python:** version 3.11+
*   **Node.js:** version 18+
*   **PostgreSQL:** Active local instance or remote connection URI (e.g. Supabase)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in the variables:
   ```
   DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/resume_screener
   GEMINI_API_KEY=your_gemini_api_key_here
   GEMINI_MODEL=gemini-2.5-flash-lite
   ```
5. Run the FastAPI development server (tables will auto-create on startup):
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend packages:
   ```bash
   npm install
   ```
3. Set your environment parameters. (Optionally configure `VITE_API_BASE_URL` if FastAPI runs on a custom port; defaults to `http://localhost:8000`).
4. Start the frontend server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:5173`.

---

## 🔌 API Reference

### Job Endpoints
*   `POST /jobs/`: Create a job description.
    *   **Request:** `{"title": "AI Engineer", "raw_text": "Required skills: Python, Git..."}`
    *   **Response:** `{"id": 1, "title": "AI Engineer", "raw_text": "..."}`
*   `GET /jobs`: Retrieve all job descriptions.
*   `GET /jobs/{job_id}`: Retrieve a specific job description. Returns `404` if missing.

### Resume Endpoints
*   `POST /resumes/upload`: Upload PDF resume (multipart/form-data). Returns parsed text and database record metadata.
*   `GET /resumes`: Retrieve list of all uploaded resumes.
*   `GET /resumes/{resume_id}`: Retrieve structured candidate details. Accepts optional query parameter `?job_id=1` to append match metrics and evidence.

### Matching & Screening Endpoints
*   `POST /matches/run`: Evaluate a single resume against a job.
    *   **Request:** `{"resume_id": 1, "job_id": 1}`
    *   **Response:** Returns Match details.
*   `GET /matches/{match_id}`: Retrieve specific evaluation record. Returns `404` if missing.
*   `POST /screening/batch`: Evaluate multiple candidates against one job.
    *   **Request:** `{"job_id": 1, "resume_ids": [1, 2, 3]}`
*   `GET /screening/{job_id}/results`: Retrieve ranked matches for a job posting. Sorted by `overall_score DESC` and `resume_id ASC`.

---

## 📝 LLM Prompts Used

### 1. Resume Structured Extraction Prompt (`llm_extractor.py`)
```
You are an expert resume parsing system. Analyze the raw resume text provided below and extract candidate profile details. CRITICAL RULES:
1. Extract ONLY facts explicitly stated in the text. Do NOT make up, assume, or hallucinate details.
2. If contact info, specific skills, experiences, projects, or certifications are not explicitly mentioned, leave them blank, empty strings, or empty lists as appropriate.
3. Do not evaluate the candidate. Focus purely on accurate extraction and normalization.
4. For candidate name, prioritize extraction from the header of the resume.
```

### 2. Job Description Extraction Prompt (`llm_job_parser.py`)
```
You are an expert job description parsing agent. Analyze the job description provided below and extract key structured requirements.
CRITICAL RULES:
1. Separate required_skills (must-haves) from preferred_skills (optional/nice-to-haves) strictly based on phrasing in the description. Do NOT hallucinate dependencies.
2. Do not invent requirements that are not mentioned.
3. Preserve exact technical terminology (e.g., framework versions, tool names).
4. Return structured JSON matching the requested schema.
```

### 3. Evidence-Linked Match Scoring Prompt (`llm_matcher.py`)
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

## 📊 Sample Output (JSON Match Format)

Below is an example match evaluation response retrieved via `GET /matches/{match_id}`:

```json
{
  "id": 1,
  "resume_id": 2,
  "job_id": 1,
  "overall_score": 82,
  "score_breakdown": {
    "skills": 90,
    "experience": 70,
    "projects": 85,
    "education": 80
  },
  "matching_requirements": [
    "Candidate has experience with Python & FastAPI",
    "Candidate holds a B.S. in Computer Science"
  ],
  "missing_requirements": {
    "required": [
      "No production-grade Docker experience listed in resume"
    ],
    "preferred": [
      "No Kubernetes background"
    ]
  },
  "justification": "Skills evaluation (Score: 90): Candidate has strong skills in Python and FastAPI as listed in resume header...\n\nExperience evaluation (Score: 70): Holds 2 years of relevant experience at Acme Corp...",
  "created_at": "2026-08-21T22:45:00"
}
```

---

## ⚠️ Known Limitations & Future Improvements
*   **Rate Limits:** Free-tier Gemini API calls can experience rate limits on rapid, repeated batch screening runs.
*   **Single File Upload Limit:** Resumes must be uploaded one-by-one; batch upload capability is a planned extension.
*   **Lacks Authentication:** Currently built without role-based access control, suitable for internal demo purposes.
*   **Fidelity to Source:** Match evidence relies on Gemini's exact parsing capability, which can sometimes extract paraphrased snippets instead of literal quotes.

### Planned Enhancements:
1.  **Bulk Zip Ingestion:** Allow uploading zip folders of resumes.
2.  **OAuth Integration:** Secure endpoints behind standard JWT authentication.
3.  **Expanded Match Weights:** Allow recruiters to edit category weights dynamically in the UI.
