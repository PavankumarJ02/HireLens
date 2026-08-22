# HireLens [Smart Resume Screener]

> **Explainable, Evidence-Based Resume Screening & Recruiter Decision-Support System**

HireLens is an AI-assisted recruitment screening and decision-support platform designed to help recruiters evaluate candidate resumes against job descriptions with complete traceability. Instead of outputting a single, black-box match score, HireLens acts as a **recruiter decision-support copilot**. It extracts structured candidate profiles, performs rule-based checks, and uses LLM semantic reasoning to generate granular, evidence-linked alignment scores (citing specific resume snippets alongside job requirements) that HR teams can trace, audit, and trust.

**Stack:** Backend (FastAPI + Gemini 2.5 Flash-Lite + SQLAlchemy + Pydantic), Frontend (React + Vite + Tailwind CSS).

---

## 2. Problem Statement & Scope

### The Problem
Traditional candidate matching systems often treat AI evaluations as a black box, outputting a simple number like `Candidate Match: 85%` without explaining the underlying reasoning. This introduces:
*   **Lack of Traceability:** Recruiters cannot verify *why* a candidate received a particular rating.
*   **Hallucination Risk:** LLMs can misread candidate experience lengths, hallucinate technologies, or assume qualifications not present in the source files.
*   **Bias and Inconsistency:** Holistic ratings fluctuate based on prompt phrasing and contextual temperature changes.

### HireLens Approach
HireLens separates resume processing, structured extraction, matching, scoring, and recruiter presentation into distinct stages:
1.  **Multi-format resume parsing with error handling:** Supports parsing raw resume text (PDF format) with robust error checks for corrupted or unreadable documents.
2.  **Hybrid scoring:** Combines deterministic rule-based checks for objective facts (e.g. skills overlap) with Gemini contextual reasoning for nuanced judgment—avoiding a single black-box LLM call.
3.  **Evidence-linked sub-scores:** Evaluates candidates across four distinct dimensions (Skills, Experience, Projects, Education) where each sub-score cites concrete evidence quotes directly from the candidate's resume.
4.  **Explicit missing-requirements listing:** Provides a clear list of missing required and preferred skills to help recruiters understand gaps, rather than just returning a raw score.
5.  **Confidence flagging capability:** Contains dedicated placeholders and schema structures to flag when extraction is ambiguous (e.g. years of experience inferred, not stated).

---

## 3. Architecture Overview

HireLens is organized into a React client layer, FastAPI service routers, Pydantic validation schemas, AI processing pipelines, and a PostgreSQL database layer.

```mermaid
flowchart TD

    %% =========================
    %% Browser Client
    %% =========================
    subgraph CLIENT["Browser Client - React"]
        APP["App.jsx"]

        DASH["Dashboard.jsx"]
        JOBS["Jobs.jsx"]
        JOBDETAIL["JobDetails.jsx"]
        CAND["Candidates.jsx"]
        SCREEN["ScreenCandidates.jsx"]
        RESULTS["ScreeningResults.jsx"]
        DETAIL["CandidateDetails.jsx"]
        COMPARE["CompareCandidates.jsx"]

        API["services/api.js"]

        APP --> DASH
        APP --> JOBS
        APP --> JOBDETAIL
        APP --> CAND
        APP --> SCREEN
        APP --> RESULTS
        APP --> DETAIL
        APP --> COMPARE

        DASH --> API
        JOBS --> API
        JOBDETAIL --> API
        CAND --> API
        SCREEN --> API
        RESULTS --> API
        DETAIL --> API
        COMPARE --> API
    end

    %% =========================
    %% FastAPI
    %% =========================
    subgraph BACKEND["FastAPI Backend"]
        MAIN["app/main.py"]

        JOBROUTER["routers/jobs.py"]
        RESUMEROUTER["routers/resumes.py"]
        MATCHROUTER["routers/matches.py"]
        SCREENROUTER["routers/screening.py"]

        MAIN --> JOBROUTER
        MAIN --> RESUMEROUTER
        MAIN --> MATCHROUTER
        MAIN --> SCREENROUTER
    end

    %% =========================
    %% Validation
    %% =========================
    subgraph VALIDATION["Validation & Schemas"]
        SCHEMA["schemas.py"]
        VALIDATE["Request / Response Validation"]
    end

    %% =========================
    %% AI Processing
    %% =========================
    subgraph AI["Resume Extraction & AI Matching"]
        PARSER["Resume Parsing"]
        EXTRACT["Structured Resume Extraction"]
        MATCH["Match Evaluation"]
        GEMINI["Gemini 2.5 Flash-Lite"]
        RANK["Deterministic Candidate Ranking"]
    end

    %% =========================
    %% Persistence
    %% =========================
    subgraph DATA["Persistence Layer"]
        MODELS["SQLAlchemy Models"]
        DB["PostgreSQL"]
    end

    %% Connections
    API --> MAIN

    JOBROUTER --> SCHEMA
    RESUMEROUTER --> SCHEMA
    MATCHROUTER --> SCHEMA
    SCREENROUTER --> SCHEMA

    RESUMEROUTER --> PARSER
    PARSER --> EXTRACT

    MATCHROUTER --> MATCH
    SCREENROUTER --> MATCH

    MATCH --> GEMINI
    MATCH --> RANK
    SCREENROUTER --> RANK

    JOBROUTER --> MODELS
    RESUMEROUTER --> MODELS
    MATCHROUTER --> MODELS
    SCREENROUTER --> MODELS

    EXTRACT --> MODELS
    MODELS --> DB

    %% =========================
    %% Styling
    %% =========================
    classDef client fill:#111827,stroke:#6366f1,color:#ffffff;
    classDef backend fill:#172554,stroke:#3b82f6,color:#ffffff;
    classDef validation fill:#312e81,stroke:#8b5cf6,color:#ffffff;
    classDef ai fill:#422006,stroke:#f59e0b,color:#ffffff;
    classDef data fill:#064e3b,stroke:#10b981,color:#ffffff;

    class APP,DASH,JOBS,JOBDETAIL,CAND,SCREEN,RESULTS,DETAIL,COMPARE,API client;
    class MAIN,JOBROUTER,RESUMEROUTER,MATCHROUTER,SCREENROUTER backend;
    class SCHEMA,VALIDATE validation;
    class PARSER,EXTRACT,MATCH,GEMINI,RANK ai;
    class MODELS,DB data;
```
```mermaid
graph TD
    A["📄 Resume Upload + Job Description"] --> B["⚡ FastAPI Endpoint (/matches/run)"]
    B --> C["📑 PDF Text Extraction (pdfplumber)"]
    C --> D["1️⃣ Structured Extraction<br/>(Gemini 2.5 Flash-Lite)"]
    D --> E["2️⃣ Deterministic Matcher<br/>(Rule-based skill/experience overlap)"]
    E --> F["3️⃣ Evidence-Linked Scoring<br/>(Gemini reasoning + citations)"]
    F --> G["🛡️ Score Breakdown + Evidence + Confidence"]
    F --> H["🗄️ PostgreSQL (Match record)"]
    G --> I["📊 Dashboard (Shortlist View)"]

    style A fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style B fill:#1e293b,stroke:#38bdf8,color:#f8fafc
    style C fill:#1e293b,stroke:#94a3b8,color:#f8fafc
    style D fill:#1e293b,stroke:#fb923c,color:#f8fafc
    style E fill:#1e293b,stroke:#34d399,color:#f8fafc
    style F fill:#1e293b,stroke:#f472b6,color:#f8fafc
    style G fill:#0f172a,stroke:#c084fc,color:#f8fafc
    style H fill:#0f172a,stroke:#94a3b8,color:#f8fafc
    style I fill:#0f172a,stroke:#38bdf8,color:#f8fafc
```

---

## 4. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React (Vite) | Single-page application rendering recruiter screens |
| **Styling** | Tailwind CSS v4 | SaaS layout stylesheets, progress bars, and badges |
| **Backend Framework** | FastAPI (Python 3.11+) | Asynchronous routing, middleware processing, and validation |
| **Database** | PostgreSQL | Relational storage for resumes, jobs, and evaluations |
| **ORM** | SQLAlchemy | Object-relational mapper for database transactions |
| **Object Validation** | Pydantic v2 | Model validation for API inputs, outputs, and JSON payloads |
| **LLM Engine** | Gemini 2.5 Flash-Lite | Contextual structured extraction and matches generation |
| **SDK** | `google-genai` | Native Google API integration for Structured Output schemas |
| **PDF Parsing** | pdfplumber | Raw text extraction from resume PDF documents |

---

## 5. Database Schema & Data Models

HireLens structures relational entities in PostgreSQL. Custom JSON columns hold structured resumes and jobs requirement objects, enabling caching.

```
                          +-------------------+
                          |      resumes      |
                          +-------------------+
                          | id: int           | <---+
                          | filename: str     |     |
                          | raw_text: text    |     |
                          | structured_data:  |     |
                          |   JSON            |     |
                          | uploaded_at: date |     |
                          +-------------------+     |
                                                    |
+-------------------+                               |
|  job_descriptions |                               |
+-------------------+                               |
| id: int           | <---+                         |
| title: str        |     |                         |
| raw_text: text    |     |                         |
| parsed_require-   |     |                         |
|   ments: JSON     |     |                         |
| created_at: date  |     |                         |
+-------------------+     |                         |
                          |                         |
                          |   +-----------------+   |
                          |   |     matches     |   |
                          |   +-----------------+   |
                          |   | id: int         |   |
                          +---| job_id: int     |   |
                              | resume_id: int  |---+
                              | overall_score:  |
                              |   int           |
                              | score_break-    |
                              |   down: JSON    |
                              | matching_reqs:  |
                              |   JSON          |
                              | missing_reqs:   |
                              |   JSON          |
                              | justification:  |
                              |   text          |
                              | created_at: date|
                              +-----------------+
```

### Table Properties:

#### 1. Resumes (`resumes`)
*   `id` (Integer, Primary Key): Unique candidate sequence identifier.
*   `filename` (String, Non-Nullable): Original uploaded file name.
*   `raw_text` (Text, Non-Nullable): Text parsed from PDF via pdfplumber.
*   `structured_data` (JSON, Nullable): Candidate structured profile mapping to `StructuredResume`.
*   `extraction_confidence` (JSON, Nullable): Per-field confidence notes parsed by Gemini.
*   `uploaded_at` (DateTime, Default: UTC Now): Ingestion timestamp.

#### 2. Job Descriptions (`job_descriptions`)
*   `id` (Integer, Primary Key): Unique vacancy identifier.
*   `title` (String, Non-Nullable): Target position title.
*   `raw_text` (Text, Non-Nullable): Raw text requirements description.
*   `parsed_requirements` (JSON, Nullable): Structured requirements mapping to `JobRequirements`.
*   `created_at` (DateTime, Default: UTC Now): Creation timestamp.

#### 3. Matches (`matches`)
*   `id` (Integer, Primary Key): Unique match run identifier.
*   `resume_id` (Integer, Foreign Key to `resumes.id`, ON DELETE CASCADE): Target resume.
*   `job_id` (Integer, Foreign Key to `job_descriptions.id`, ON DELETE CASCADE): Target job.
*   `overall_score` (Integer, Non-Nullable): Weighted matching score out of 100.
*   `score_breakdown` (JSON, Non-Nullable): Dimension ratings (skills, experience, projects, education).
*   `matching_requirements` (JSON Array, Non-Nullable): Requirements met by candidate.
*   `missing_requirements` (JSON Object, Non-Nullable): Categorized required vs preferred missing requirements.
*   `justification` (Text, Nullable): Granular AI justification statements separated by double line breaks.
*   `created_at` (DateTime, Default: UTC Now): Evaluation timestamp.

---

## 6. API Reference

API routing base URL defaults to: `http://localhost:8000`.

### Endpoints Table:

| Method | Path | Description | Request Body | Response Body |
|---|---|---|---|---|
| **POST** | `/jobs/` | Create a job posting | [JobDescriptionCreate](#jobdescriptioncreate) | [JobDescriptionOut](#jobdescriptionout) |
| **GET** | `/jobs/` | Get all job descriptions | None | List of [JobDescriptionOut](#jobdescriptionout) |
| **GET** | `/jobs/{job_id}` | Get specific job posting | None | [JobDescriptionOut](#jobdescriptionout) |
| **POST** | `/resumes/upload` | Upload PDF and parse text | Multipart File | [ResumeOut](#resumeout) |
| **GET** | `/resumes/` | Get all uploaded resumes | None | List of [ResumeOut](#resumeout) |
| **GET** | `/resumes/{resume_id}` | Get structured candidate profile | None | [CandidateDetailResponse](#candidatedetailresponse) |
| **POST** | `/matches/run` | Evaluate resume match | [MatchRunRequest](#matchrunrequest) | [MatchOut](#matchout) |
| **GET** | `/matches/{match_id}` | Get specific match details | None | [MatchOut](#matchout) |
| **POST** | `/screening/batch` | Run batch evaluations | [BatchScreeningRequest](#batchscreeningrequest) | [BatchScreeningResponse](#batchscreeningresponse) |
| **GET** | `/screening/{job_id}/results` | Get ranked job matches | None | [BatchScreeningResponse](#batchscreeningresponse) |

### JSON Payload Details:

#### `JobDescriptionCreate`
```json
{
  "title": "Backend AI/ML Engineer",
  "raw_text": "We are looking for a Python dev with FastAPI experience and B.S. in CS."
}
```

#### `JobDescriptionOut`
```json
{
  "id": 1,
  "title": "Backend AI/ML Engineer",
  "raw_text": "We are looking for a Python dev...",
  "parsed_requirements": {
    "required_skills": ["Python", "FastAPI"],
    "preferred_skills": ["Docker"],
    "minimum_experience": "3 years",
    "education_requirements": ["B.S. in Computer Science"],
    "responsibilities": ["Build FastAPI backends"],
    "keywords": ["fastapi", "python"]
  },
  "created_at": "2026-08-21T22:45:00"
}
```

#### `ResumeOut`
```json
{
  "id": 1,
  "filename": "john_doe_resume.pdf",
  "raw_text": "John Doe... Software Dev... Python, FastAPI...",
  "structured_data": null,
  "extraction_confidence": null,
  "uploaded_at": "2026-08-21T22:45:00"
}
```

#### `CandidateDetailResponse` *(supporting optional `?job_id=1` query parameter)*
```json
{
  "resume_id": 1,
  "filename": "john_doe_resume.pdf",
  "uploaded_at": "2026-08-21T22:45:00",
  "candidate_name": "John Doe",
  "contact": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+12345678",
    "linkedin": "linkedin.com/in/johndoe",
    "github": "github.com/johndoe"
  },
  "skills": ["Python", "FastAPI", "SQL"],
  "experience": [
    {
      "role": "Software Developer",
      "company": "Acme Corp",
      "duration": "2 years",
      "description": "Built backend APIs using FastAPI and Python."
    }
  ],
  "education": [
    {
      "degree": "B.S. in Computer Science",
      "institution": "State University",
      "year": "2022"
    }
  ],
  "projects": [
    {
      "name": "E-Commerce Backend",
      "technologies": ["Python", "PostgreSQL"],
      "description": "Engineered transactional payment processing routes."
    }
  ],
  "certifications": ["AWS Certified Developer"],
  "job_id": 1,
  "overall_score": 85,
  "score_breakdown": {
    "skills": 90,
    "experience": 75,
    "projects": 80,
    "education": 95
  },
  "matching_requirements": [
    "FastAPI & Python technical skill alignment",
    "Candidate holds B.S. in Computer Science"
  ],
  "missing_requirements": {
    "required": [],
    "preferred": ["Docker"]
  },
  "justification": "Skills evaluation (Score: 90): Candidate has strong skills in Python...\n\nExperience evaluation (Score: 75)..."
}
```

---

## 7. AI Pipeline & Prompt Quality

HireLens uses Gemini 2.5 Flash-Lite's structured JSON schema feature (Generate Content with JSON response schema validation) to prevent parsing errors and handle JSON object schemas without string parsing.

```
[Raw PDF Text] ----> (Gemini Extractor + StructuredResume Schema) ----> [Structured Profile JSON]
[Raw Job Text] ----> (Gemini Job Parser + JobRequirements Schema) ----> [Structured Requirements JSON]
                                                                                |
                                                                                v
[Structured Match JSON] <---- (Gemini Matcher + LLMMatchResult Schema) <--------+
```

### Prompt 1: Resume Profile Ingestion (`llm_extractor.py`)
This prompt parses unstructured text into standard candidate properties. It instructs the LLM not to assume or evaluate details.
```
You are an expert resume parsing system. Analyze the raw resume text provided below and extract candidate profile details. 
CRITICAL RULES:
1. Extract ONLY facts explicitly stated in the text. Do NOT make up, assume, or hallucinate details.
2. If contact info, specific skills, experiences, projects, or certifications are not explicitly mentioned, leave them blank, empty strings, or empty lists as appropriate.
3. Do not evaluate the candidate. Focus purely on accurate extraction and normalization.
4. For candidate name, prioritize extraction from the header of the resume.
```

### Prompt 2: Job Description Parsing (`llm_job_parser.py`)
This prompt separates job details into required and preferred skills based on description text phrasing.
```
You are an expert job description parsing agent. Analyze the job description provided below and extract key structured requirements.
CRITICAL RULES:
1. Separate required_skills (must-haves) from preferred_skills (optional/nice-to-haves) strictly based on phrasing in the description. Do NOT hallucinate dependencies.
2. Do not invent requirements that are not mentioned.
3. Preserve exact technical terminology (e.g., framework versions, tool names).
4. Return structured JSON matching the requested schema.
```

### Prompt 3: Match Scorer & Evidence Compiler (`llm_matcher.py`)
This prompt evaluates the candidate against parsed job descriptions. It forces the LLM to output sub-scores and cite explicit evidence for every category.
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

## 8. Scoring Rubric & Weights

To prevent model scoring bias, HireLens does not calculate the final weighted match score inside the LLM prompt. Instead, the LLM generates sub-scores for individual categories, and the overall match score is calculated deterministically in the Python application logic.

### Category Scoring Dimensions:
1.  **Technical Skills (40% Weight):** Alignment between candidates' skills and job requirements.
2.  **Work Experience (25% Weight):** Professional career duration and relevance.
3.  **Project Relevance (20% Weight):** Technology matches and scope in candidate projects.
4.  **Education History (15% Weight):** Relevance of degrees and certifications.

### Scorer Formula (`llm_matcher.py`):
```python
weighted_sum = (
    skills_score * 0.40 +
    experience_score * 0.25 +
    projects_score * 0.20 +
    education_score * 0.15
)
overall_score = int(round(weighted_sum))
```

### Deterministic Missing Skills Classification (`matches.py`):
Missing requirements returned by the LLM match run are cross-referenced with parsed required and preferred job skills using Python string matching.
```python
# Required missing requirements are separated from preferred missing requirements
for req in missing_requirements:
    if req.lower() in preferred_skills_set:
        missing_classified["preferred"].append(req)
    else:
        missing_classified["required"].append(req)
```

---

## 9. Batch Screening & Deterministic Ranking

When screening a pool of candidate resumes against a single job posting:
1.  **Post Ingestion:** Request is submitted with `job_id` and a list of `resume_ids` (`POST /screening/batch`).
2.  **Sequential Matches Execution:** The system matches each candidate against the target job.
3.  **Deterministic Sorting:** Candidates are sorted using two fields:
    *   Primary: `overall_score` (Descending)
    *   Secondary: `resume_id` (Ascending)
4.  **Rank Assignment:** Candidates receive a rank index starting at `1` based on this sorted list. The secondary sort ensures that candidate rankings are stable and predictable.

---

## 10. Frontend Architecture & Pages

The React frontend dashboard consumes the FastAPI backend, utilizing Tailwind CSS v4.

### Page View Routing (`App.jsx`):
*   **Dashboard:** Displays metrics for active vacancies, resume uploads, and screened candidate volumes.
*   **Jobs Management:** List of job postings, details, and forms to create new job descriptions.
*   **Job Details:** Displays vacancy descriptions alongside structured candidate requirements and screening action buttons.
*   **Candidates Management:** Candidate list database with drag-and-drop file uploaders that accept resume PDF files.
*   **Screen Candidates:** Selection dashboard mapping candidate resumes to job postings for batch screening runs.
*   **Screening Results:** Grid showing overall scores, status badges, progress bars, and compare checkboxes.
*   **Candidate Details:** Displays candidate details (contact information, work experience, projects) alongside matching requirements and AI evaluation justifications.
*   **Compare Candidates:** Cross-comparison panel showing multiple candidates' metrics side-by-side and highlighting the stronger scores.

---

## 11. Project Structure & Source Code Layout

The codebase separates routing, database models, Pydantic schemas, and processing logic.

```
hirelens/
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI server entry point and CORS setup
│   │   ├── models.py             # SQLAlchemy schemas (resumes, job_descriptions, matches tables)
│   │   ├── database.py           # PostgreSQL DB engine configurations and Session Local
│   │   ├── config.py             # Settings configurations checking env variables
│   │   ├── schemas.py            # Pydantic request validation and output response schemas
│   │   ├── routers/
│   │   │   ├── jobs.py           # Job Description routes (POST /, GET /, GET /{id})
│   │   │   ├── resumes.py        # Resume Ingestion routes (POST /upload, GET /, GET /{id})
│   │   │   ├── matches.py        # Matches evaluation route (POST /run, GET /{id})
│   │   │   └── screening.py      # Batch screening results routes (POST /batch, GET /{job_id}/results)
│   │   └── services/
│   │       ├── pdf_parser.py     # PDF parsing using pdfplumber with error validations
│   │       ├── llm_extractor.py  # Structured profile extraction using Pydantic validation
│   │       ├── llm_job_parser.py # Job Description parser mapping to JobRequirements schema
│   │       └── llm_matcher.py    # Dimension match evaluation using LLMMatchResult structure
│   ├── requirements.txt          # Python packages list (fastapi, google-genai, psycopg2-binary, etc.)
│   └── .env.example              # Placeholder template for database URIs and Gemini API keys
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx       # Layout navigation component
│   │   │   ├── Loader.jsx        # Visual spinner and loading alert banner
│   │   │   └── ErrorAlert.jsx    # Network connection error banner
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx     # Overview metrics page
│   │   │   ├── Jobs.jsx          # Vacancy listing and create forms
│   │   │   ├── JobDetails.jsx    # Job description text and structured requirements
│   │   │   ├── Candidates.jsx    # Candidate list database and PDF upload drag-and-drop
│   │   │   ├── ScreenCandidates.jsx # Selection checklist routing to batch evaluations
│   │   │   ├── ScreeningResults.jsx # Ranked candidate list, progress bars, and compare checkboxes
│   │   │   ├── CandidateDetails.jsx # Structured candidate profiles and justifications
│   │   │   └── CompareCandidates.jsx# Side-by-side comparison tables
│   │   ├── services/
│   │   │   └── api.js            # Unified API caller mapping to backend URLs
│   │   ├── App.jsx               # Navigation page router layout and configurations
│   │   └── index.css             # Tailwind v4 entry imports
│   ├── vite.config.js            # Vite configurations with tailwindcss compiler plugins
│   └── package.json              # Frontend package configs, dependencies, and scripts
└── README.md                     # Technical project documentation
```

---

## 12. Setup Instructions

### Prerequisites
*   **Python:** version 3.11+
*   **Node.js:** version 18+
*   **PostgreSQL:** Active database instance (local or remote Supabase instance)

### Backend Setup
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\Activate.ps1
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Set up environment configurations:
    ```bash
    cp .env.example .env
    ```
    Configure parameters inside `.env`:
    ```
    DATABASE_URL=postgresql://your_db_user:your_db_password@localhost:5432/resume_screener
    GEMINI_API_KEY=your_gemini_api_key_here
    GEMINI_MODEL=gemini-2.5-flash-lite
    ```
5.  Start the FastAPI backend (tables will auto-create on startup):
    ```bash
    uvicorn app.main:app --reload
    ```

### Frontend Setup
1.  Navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install packages:
    ```bash
    npm install
    ```
3.  Start the local Vite development server:
    ```bash
    npm run dev
    ```
4.  Open the web browser at `http://localhost:5173`.

---

## 13. Recruiter Usage Workflow

1.  **Post a Job Vacancy:** Go to **Jobs**, click **Create Job Description**, fill out the title and description, and submit.
2.  **Upload Resumes:** Go to **Candidates**, click **Upload Resume (PDF)**, and upload candidate resumes.
3.  **Start Screening:** Go to **Screening**, select the job vacancy, select candidate resumes, and click **Screen Candidates**.
4.  **Review Ranked List:** The system screens the candidates and redirects to **Screening Results**. Inspect candidates ranked by match score.
5.  **Examine Evidence:** Click **View Candidate** to inspect candidates' profiles, matching requirements, missing requirements, and text justifications.
6.  **Cross-Compare Candidates:** On the results page, check 2-3 candidate checkboxes and click **Compare Selected Candidates** to review their metrics side-by-side.

---

