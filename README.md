<div align="center">

# ⚡ HireLens

### *Explainable, Evidence-Based Candidate Screening & Decision-Support Copilot*

> **Transforming recruitment screening from black-box LLM predictions into deterministic, evidence-backed candidate evaluations with complete auditability.**

<br />

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python_3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <br />
  <img src="https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/SQLAlchemy_v2-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy" />
  <img src="https://img.shields.io/badge/Pydantic_v2-E92063?style=for-the-badge&logo=pydantic&logoColor=white" alt="Pydantic" />
  <img src="https://img.shields.io/badge/Google_Gemini_2.5-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/pdfplumber-FF6F61?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="pdfplumber" />
</p>

<br />

</div>

**HireLens** is an explainable candidate evaluation and recruiter decision-support system built for talent acquisition teams, HR professionals, and technical hiring managers. 

Rather than delegating hiring decisions to a black-box AI model, HireLens functions as an **auditable decision-support copilot**. It ingests applicant resumes (`.pdf` and `.txt`), enforces byte-level intake security checks, extracts structured candidate profiles via Google Gemini 2.5 Flash-Lite (`google-genai` SDK), and evaluates applicant fit across four distinct dimensions: **Skills**, **Experience**, **Projects**, and **Education**. To eliminate score drift and hallucinated match numbers, HireLens computes overall candidate scores using a **deterministic Python weighting algorithm**, citing concrete text evidence quotes directly from the candidate's resume for every rating.

---

<div align="center">

## 🎬 Platform Demonstration

https://github.com/user-attachments/assets/6ee92771-535d-426a-95f6-91df3fc174fc

</div>

---

## 🚨 Industry Challenge & Recruitment Bottlenecks

Modern recruitment workflows suffer from critical operational friction:

* 📥 **Application Volume Overhead**: Talent acquisition teams receive hundreds of resumes per vacancy. Manual multi-page resume reviews create severe hiring bottlenecks and inconsistent candidate criteria.
* 📦 **Opaque "Black-Box" Ratings**: Traditional ATS algorithms output arbitrary match percentages (e.g. *"82% Match"*) without explaining how the score was calculated, making shortlist decisions unverifiable.
* 🎲 **LLM Score Fluctuation & Hallucination**: Entrusting holistic scoring entirely to raw LLM prompts introduces score drift and risks hallucinating qualifications absent from the source document.
* 🔍 **Unclassified Qualification Gaps**: Standard search tools match simple keywords but fail to differentiate missing *Required* core skills from missing *Preferred* secondary qualifications.
* ⚠️ **Intake Security Risks**: Malformed resume uploads, empty payloads, and corrupted PDF streams can disrupt automated parser services.

---

## 🔬 The HireLens Decision-Support Solution

HireLens solves these challenges through a transparent, multi-stage processing pipeline:

```
[Job Description Ingestion] ──► [File Intake Security & PDF Parsing] ──► [Gemini Structured Profile Extraction]
                                                                                      │
[Recruiter Side-by-Side View] ◄── [Python Deterministic Weighting] ◄── [Gemini Evidence-Linked Dimension Scoring]
```

1. 📌 **Structured Requirement Ingestion**: Job descriptions are parsed into structured requirement matrices containing required skills, preferred skills, minimum experience, education criteria, and key responsibilities.
2. 🛡️ **Byte-Level File Validation**: Uploads are verified before parsing. PDF files require the `%PDF-` binary signature; `.txt` files require valid UTF-8 encoding without null bytes (`\x00`). `pdfplumber` cleans multi-page whitespace layout noise.
3. 🧬 **Structured Profile Extraction**: Gemini 2.5 Flash-Lite extracts contact info, skills, work history, education, projects, and certifications into validated Pydantic schemas (`StructuredResume`).
4. 📈 **Extraction Confidence Heuristics**: A Python validation engine computes confidence metrics (`high`, `medium`, `low`) across contact, skill, experience, and education fields to flag incomplete profiles.
5. 📜 **Evidence-Linked Dimension Evaluation**: Gemini evaluates four isolated dimensions—Skills (40%), Experience (25%), Projects (20%), and Education (15%)—assigning 0–100 factor scores and citing explicit resume text quotes.
6. 🧮 **Deterministic Python Overall Score**: Overall candidate scores are calculated in Python using fixed dimension weights (`skills * 0.40 + experience * 0.25 + projects * 0.20 + education * 0.15`), eliminating score drift.
7. ⚖️ **Categorized Gap Analysis & Comparison**: Unmatched skills are bucketed into *Required* vs. *Preferred* missing sets. Recruiters can view candidates in ranked order or perform side-by-side comparisons.

---

## ⚡ Core Platform Capabilities

### 💼 Recruiter Control Suite
- **Job Description Management**: Create job vacancies, extract structured requirements, retrieve saved roles, and delete job postings with cascading cleanup.
- **Candidate Roster**: Upload candidate resumes, view structured profiles, inspect field confidence ratings, and remove candidate records.
- **Batch Screening & Deterministic Ranking**: Screen multiple resumes against a job posting in one request, automatically ranked by overall match score with secondary tie-breaking (`-overall_score, resume_id`).
- **Side-by-Side Candidate Comparison**: Select 2–3 candidate profiles from screening results to compare metric grids, score breakdowns, matching points, and skill gaps side-by-side.
- **Sequential UI Row Display**: Displays clean, 1-based sequential row numbers (`1, 2, 3...`) across Candidates, Jobs, Screening, and Compare views while preserving underlying PostgreSQL primary keys (`id`).

### 🔒 Intake Security & Parser Engine
- **Format Guardrail**: Restricts intake strictly to `.pdf` and `.txt` files, blocking empty file payloads.
- **PDF Binary Signature Verification**: Inspects raw byte headers to verify the `%PDF-` signature before parsing.
- **TXT Encoding & Null Byte Guard**: Rejects text files containing null characters (`\x00`) or invalid UTF-8 byte sequences.
- **Layout-Aware PDF Extraction**: Employs `pdfplumber` to extract clean text, stripping multi-page whitespace noise.
- **Confidence Scoring Heuristics**: Evaluates field population completeness and date formatting to flag ambiguous extractions.

### 🧩 Explainable Matching Matrix
- **Four-Dimension Scoring**: Evaluates Skills (0–100), Experience (0–100), Projects (0–100), and Education (0–100).
- **Evidential Citation Summaries**: Generates text justifications citing exact text snippet quotes from the candidate's resume for every evaluated dimension.
- **Categorized Gap Analysis**: Separates missing candidate qualifications into *Required* vs. *Preferred* missing requirement lists.
- **Evaluation Caching**: Caches structured resume profiles, job requirement JSONs, and evaluation results in PostgreSQL to eliminate redundant API calls.

---

## 🤖 AI Reasoning & Hybrid Scoring Architecture

HireLens combines **Google Gemini 2.5 Flash-Lite** for natural language semantic reasoning with **Python deterministic code** for final scoring and ranking.

```mermaid
flowchart TD
    subgraph INTAKE["1. File Intake & Validation"]
        A["📄 Candidate Resume (.pdf / .txt)"] --> B{"🛡️ resume_security.py"}
        B -- "Invalid Magic Bytes / Corrupt" --> ERR["❌ HTTP 400 Bad Request"]
        B -- "Valid PDF" --> C["📑 pdfplumber Text Extraction"]
        B -- "Valid TXT" --> D["📝 UTF-8 Decoder"]
    end

    subgraph EXTRACTION["2. AI Structured Extraction"]
        C & D --> E["⚡ Gemini 2.5 Flash-Lite<br/>(StructuredResume Schema)"]
        E --> F["🔍 Python Confidence Engine<br/>(calculate_extraction_confidence)"]
        F --> G["🗄️ PostgreSQL (resumes table)"]
    end

    subgraph MATCHING["3. AI & Deterministic Evaluation"]
        G --> H["⚡ Gemini 2.5 Flash-Lite<br/>(Dimension Scores + Evidence Quotes)"]
        H --> I["🧮 Python Weighted Scoring Algorithm<br/>(skills:40% + exp:25% + proj:20% + edu:15%)"]
        I --> J["🏷️ Skill Gap Classifier<br/>(Required vs. Preferred)"]
        J --> K["🗄️ PostgreSQL (matches table)"]
    end

    subgraph PRESENTATION["4. Recruiter Decision Support"]
        K --> L["📊 Dashboard / Shortlist View"]
        K --> M["📋 Candidate Profile & Evidence View"]
        K --> N["⚖️ Side-by-Side Comparison"]
    end

    style INTAKE fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style EXTRACTION fill:#1e293b,stroke:#fb923c,color:#f8fafc
    style MATCHING fill:#1e293b,stroke:#f472b6,color:#f8fafc
    style PRESENTATION fill:#0f172a,stroke:#34d399,color:#f8fafc
```

### Deterministic Score Calculation

```python
# Defined in backend/app/services/llm_matcher.py
SCORING_WEIGHTS = {
    "skills": 0.40,
    "experience": 0.25,
    "projects": 0.20,
    "education": 0.15
}

```python
# Defined in backend/app/services/llm_matcher.py
SCORING_WEIGHTS = {
    "skills": 0.40,
    "experience": 0.25,
    "projects": 0.20,
    "education": 0.15
}

overall_score = round(
    (skills_score * 0.40) +
    (experience_score * 0.25) +
    (projects_score * 0.20) +
    (education_score * 0.15)
)
```

---

## 💬 LLM Prompts & Prompt Engineering Architecture

HireLens uses **Google Gemini 2.5 Flash-Lite** (`gemini-2.5-flash-lite`) integrated via the official `google-genai` SDK. Prompt engineering enforces strict type safety, zero-hallucination rules, and mandatory textual evidence citations.

All prompts run with `temperature=0.1` and schema enforcement (`response_mime_type="application/json"` and `response_schema=...`) to ensure deterministic structure.

---

### 1. Candidate Resume Structured Profile Extraction Prompt
**File**: [`backend/app/services/llm_extractor.py`](file:///D:/COMPANY_PROJECT/HireLens/backend/app/services/llm_extractor.py#L106-L127)  
**Schema**: `StructuredResume` (Contact, Skills, Experience, Education, Projects, Certifications)

```python
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
```

---

### 2. Job Description Structured Requirements Parsing Prompt
**File**: [`backend/app/services/llm_job_parser.py`](file:///D:/COMPANY_PROJECT/HireLens/backend/app/services/llm_job_parser.py#L27-L47)  
**Schema**: `JobRequirements` (Required Skills, Preferred Skills, Minimum Experience, Education, Responsibilities)

```python
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
```

---

### 3. Evidence-Linked Candidate Evaluation & Scoring Prompt
**File**: [`backend/app/services/llm_matcher.py`](file:///D:/COMPANY_PROJECT/HireLens/backend/app/services/llm_matcher.py#L53-L79)  
**Schema**: `LLMMatchResult` (Skills 0–100, Experience 0–100, Projects 0–100, Education 0–100, Evidential Quotes, Missing Requirements)

```python
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
```

---

## 📐 System Architecture & Data Flow

HireLens is architected as a single-page React client paired with an asynchronous FastAPI backend, Pydantic v2 schemas, SQLAlchemy ORM, and PostgreSQL storage.

```mermaid
flowchart TD
    subgraph FRONTEND["Frontend — React 19 + Vite + Tailwind CSS v4"]
        NAV["Sidebar.jsx / Header.jsx"]
        DASH["Dashboard.jsx"]
        JOBS["Jobs.jsx / JobDetails.jsx"]
        CAND["Candidates.jsx / CandidateDetails.jsx"]
        SCREEN["ScreenCandidates.jsx / ScreeningResults.jsx"]
        COMPARE["CompareCandidates.jsx"]
        API_CLIENT["services/api.js (Fetch API)"]

        NAV --> DASH & JOBS & CAND & SCREEN & COMPARE
        DASH & JOBS & CAND & SCREEN & COMPARE --> API_CLIENT
    end

    subgraph BACKEND["Backend — FastAPI Async Service Layer"]
        MAIN["app/main.py"]
        R_RESUME["routers/resumes.py"]
        R_JOB["routers/jobs.py"]
        R_MATCH["routers/matches.py"]
        R_SCREEN["routers/screening.py"]

        API_CLIENT <== "REST / JSON" ==> MAIN
        MAIN --> R_RESUME & R_JOB & R_MATCH & R_SCREEN
    end

    subgraph SERVICES["Services & Processing Core"]
        SEC["services/resume_security.py"]
        PDF["services/pdf_parser.py"]
        EXT["services/llm_extractor.py"]
        JOBP["services/llm_job_parser.py"]
        MAT["services/llm_matcher.py"]
        DET["services/deterministic_matcher.py"]

        R_RESUME --> SEC & PDF & EXT
        R_JOB --> JOBP
        R_MATCH --> EXT & JOBP & MAT & DET
        R_SCREEN --> MAT
    end

    subgraph STORAGE["Data & AI Services"]
        GEMINI["Google Gemini 2.5 Flash-Lite API"]
        ORM["SQLAlchemy Models (app/models.py)"]
        DB[(PostgreSQL Database)]

        EXT & JOBP & MAT <== "google-genai SDK" ==> GEMINI
        R_RESUME & R_JOB & R_MATCH & R_SCREEN --> ORM --> DB
    end

    style FRONTEND fill:#0f172a,stroke:#38bdf8,color:#f8fafc
    style BACKEND fill:#1e293b,stroke:#818cf8,color:#f8fafc
    style SERVICES fill:#1e293b,stroke:#fb923c,color:#f8fafc
    style STORAGE fill:#0f172a,stroke:#34d399,color:#f8fafc
```

---

## 💾 Database Models & Entity Relations

PostgreSQL persists application entities via SQLAlchemy ORM models (`Resume`, `JobDescription`, `Match`) with foreign key cascade deletion constraints (`ondelete="CASCADE"`).

```
 +----------------------------------+        +----------------------------------+
 |             resumes              |        |         job_descriptions         |
 +----------------------------------+        +----------------------------------+
 | id                     (PK, Int) |        | id                     (PK, Int) |
 | filename             (String, NN)|        | title                (String, NN)|
 | raw_text               (Text, NN)|        | raw_text               (Text, NN)|
 | structured_data          (JSON)  |        | parsed_requirements      (JSON)  |
 | extraction_confidence    (JSON)  |        | created_at           (DateTime)  |
 | uploaded_at          (DateTime)  |        +----------------------------------+
 +----------------------------------+                         │
                  │ 1                                         │ 1
                  │                                           │
                  │ N (CASCADE)                               │ N (CASCADE)
                  v                                           v
 +------------------------------------------------------------------------------+
 |                                   matches                                    |
 +------------------------------------------------------------------------------+
 | id                     (PK, Integer)                                         |
 | resume_id              (FK -> resumes.id, CASCADE, Integer, NN)              |
 | job_id                 (FK -> job_descriptions.id, CASCADE, Integer, NN)     |
 | overall_score          (Integer, NN)                                         |
 | score_breakdown        (JSON: {skills, experience, projects, education}, NN) |
 | matching_requirements  (JSON: List[str], NN)                               |
 | missing_requirements   (JSON: {required: List[str], preferred: List[str]}, NN)|
 | justification          (Text, Nullable)                                      |
 | created_at             (DateTime)                                            |
 +------------------------------------------------------------------------------+
```

---

## 🌐 REST API Endpoints Specification

FastAPI endpoints are structured under four modular router tags:

| Group | Method | Endpoint | Description | Status Code |
|---|---|---|---|---|
| **Resumes** | `POST` | `/resumes/upload` | Upload PDF/TXT resume, validate security, parse text, extract structured profile | `201 Created` |
| | `GET` | `/resumes/` | Retrieve all uploaded candidate resumes | `200 OK` |
| | `GET` | `/resumes/{resume_id}` | Fetch candidate detail profile (optional `job_id` query param attaches match metrics) | `200 OK` |
| | `DELETE` | `/resumes/{resume_id}` | Delete a candidate resume and cascade clean up related matches | `204 No Content` |
| **Jobs** | `POST` | `/jobs/` | Post and store a new job description | `201 Created` |
| | `GET` | `/jobs/` | List all posted job vacancies | `200 OK` |
| | `GET` | `/jobs/{job_id}` | Retrieve specific job description by ID | `200 OK` |
| | `DELETE` | `/jobs/{job_id}` | Delete a job description and cascade clean up related matches | `204 No Content` |
| **Matches** | `POST` | `/matches/run` | Execute resume-to-job match evaluation, compute scores, and persist match record | `201 Created` |
| | `GET` | `/matches/{match_id}` | Fetch specific match evaluation record by ID | `200 OK` |
| | `DELETE` | `/matches/{match_id}` | Delete a specific match evaluation by match ID | `204 No Content` |
| | `DELETE` | `/matches/job/{job_id}/resume/{resume_id}` | Delete a specific candidate match evaluation | `204 No Content` |
| | `DELETE` | `/matches/job/{job_id}` | Clear all candidate match evaluations for a specific job | `204 No Content` |
| **Screening**| `POST` | `/screening/batch` | Batch screen multiple candidates against a job, sort and rank deterministically | `200 OK` |
| | `GET` | `/screening/{job_id}/results` | Fetch stored screening results for a job in ranked order | `200 OK` |

---

## 🛠️ Technology Stack & Dependencies

| Component | Technology | Version | Description |
|---|---|---|---|
| **Backend API Framework** | FastAPI | `^0.115.0` | Asynchronous REST routing, dependency injection, and OpenAPI docs |
| **Language Runtime** | Python | `3.9+` | Backend application runtime |
| **AI / LLM Model** | Google Gemini 2.5 Flash-Lite | `gemini-2.5-flash-lite` | Structured profile extraction, requirement parsing, and evidence scoring |
| **AI SDK** | `google-genai` | `^0.1.1` | Native Google GenAI SDK with structured Pydantic output schemas |
| **Database Engine** | PostgreSQL | `^14.0+` | Relational database storage |
| **ORM** | SQLAlchemy | `^2.0.0` | Declarative database modeling and cascade management |
| **Data Validation** | Pydantic v2 | `^2.0.0` | Strict data validation, schema enforcement, and JSON serialization |
| **PDF Extraction** | pdfplumber | `^0.11.0` | Plain text extraction from PDF documents |
| **Frontend Framework** | React | `^19.2.8` | Single-page UI rendering dashboard, candidate views, and comparisons |
| **Build Engine** | Vite | `^8.2.0` | Modern frontend bundler and dev server |
| **UI Styling** | Tailwind CSS | `^4.3.3` | Utility-first CSS engine for SaaS recruiter layout |
| **HTTP Transport** | Native Fetch API | ES6+ | Asynchronous REST API client |
| **Environment Config** | python-dotenv | `^1.0.0` | Configuration management (`GEMINI_API_KEY`, `DATABASE_URL`) |

---

## ⚙️ Local Setup & Deployment Guide

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** and `npm`
- **PostgreSQL** instance (local or cloud-hosted)
- **Google Gemini API Key**

---

### 1. Backend Setup

```bash
# Clone repository
git clone https://github.com/PavankumarJ02/HireLens.git
cd HireLens/backend

# Create and activate virtual environment
python -m venv .venv

# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On macOS/Linux:
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables
Create `.env` inside `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hirelens_db
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite
```

#### Start Backend Server

```bash
uvicorn app.main:app --reload
```
API launches at `http://localhost:8000`. Swagger API docs available at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

In a separate terminal:

```bash
cd HireLens/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend application launches at `http://localhost:5173`.

---

## 🛡️ Data Safety, Auditability & Governance

* 🔐 **File Security Guard**: Rejects empty payloads, verifies case-insensitive extensions (`.pdf`, `.txt`), enforces `%PDF-` binary magic bytes for PDFs, and requires valid UTF-8 without null characters (`\x00`) for text files.
* 🤝 **Human-in-the-Loop Decision Support**: HireLens does not perform automated candidate rejection or automated hiring decisions. It functions strictly as an explainable decision-support tool.
* 📜 **Full Auditability**: Every candidate evaluation records concrete text quotes from the resume alongside dimension scores in PostgreSQL for verifiable audit logs.
* 🧮 **Deterministic Calculation**: Final match ratings are computed in Python using fixed dimension weights rather than raw LLM outputs, guaranteeing consistent scoring across candidates.

---

<div align="center">

### 👨‍💻 Designed & Engineered by **Pavan Kumar J**

*Crafted as an explainable, evidence-backed AI recruiter decision-support platform for transparent talent acquisition.*

<br />

<p align="center">
  <a href="https://github.com/PavankumarJ02">
    <img src="https://img.shields.io/badge/GitHub-PavankumarJ02-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Profile" />
  </a>
</p>

</div>
