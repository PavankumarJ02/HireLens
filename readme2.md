# HireLens

> **Explainable, Evidence-Based Resume Screening & Recruiter Decision-Support System**

HireLens is an AI-assisted recruitment screening platform that helps recruiters evaluate resumes against job descriptions using structured resume extraction, requirement matching, candidate scoring, ranking, and explainable justifications. Instead of treating an LLM-generated score as an automatic hiring decision, HireLens acts as a **decision-support copilot** that gives recruiters evidence, score breakdowns, matching requirements, missing requirements, and explanations that can be reviewed before making a hiring decision.

**Stack:** Backend — FastAPI + Gemini 2.5 Flash-Lite + SQLAlchemy + Pydantic | Frontend — React + Vite + Tailwind CSS

---

## 1. Problem Statement & Scope

### The Problem

Traditional resume screening is time-consuming and inconsistent when recruiters need to evaluate many candidates against the same job description.

Naive LLM-based screening tools can make this worse by producing a single opaque score such as:

> Candidate Match Score: 84%

without clearly explaining:

- Why the candidate received that score
- Which job requirements were satisfied
- Which requirements were missing
- How education, skills, projects, and experience affected the score
- Whether the extracted information was reliable
- Why one candidate ranked above another

This makes the screening process difficult to audit and potentially risky when used directly for hiring decisions.

### HireLens Approach

HireLens separates resume processing, structured extraction, matching, scoring, and recruiter presentation into distinct stages.

1. **Multi-format Resume Processing**
   - Accepts supported resume formats such as PDF/TXT.
   - Extracts resume content before performing candidate matching.
   - Handles parsing and validation errors instead of silently treating an unreadable resume as a valid candidate.

2. **Structured Resume Extraction**
   - Converts unstructured resume content into structured candidate information.
   - Extracts information such as:
     - Candidate name
     - Contact information
     - Skills
     - Education
     - Experience
     - Projects

3. **Hybrid Candidate Evaluation**
   - Combines deterministic application logic with LLM-based reasoning.
   - Objective information can be compared using deterministic matching logic.
   - Gemini is used for semantic evaluation and explanation where contextual reasoning is required.
   - The system therefore does not depend on one opaque LLM call for the entire screening process.

4. **Explainable Score Breakdown**
   - Candidates receive an overall match score.
   - The evaluation is broken into categories including:
     - Skills
     - Experience
     - Projects
     - Education
   - The recruiter can inspect the reasoning behind the evaluation.

5. **Matching Requirements**
   - The system identifies requirements supported by the candidate's resume.
   - Matching requirements are returned alongside the overall score.

6. **Missing Requirements**
   - Candidates are not represented only by a score.
   - Missing requirements are explicitly returned.
   - Missing requirements can be categorized into:
     - Required
     - Preferred

7. **Batch Candidate Screening**
   - Multiple resumes can be evaluated against a single job description.
   - Candidates are ranked using their calculated overall score.
   - Ranking uses deterministic secondary ordering to keep results stable.

8. **Recruiter Decision Support**
   - HireLens does not automatically hire or reject candidates.
   - The final hiring decision remains with the recruiter.
   - The platform provides structured evidence to support human review.

---

# 2. Architecture Overview

The system is organized into frontend, API, validation, extraction, matching, and persistence layers.

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