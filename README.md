# Smart Resume Screener

An automated recruitment assistant to parse resumes, extract key information, match them against job descriptions using Anthropic's Claude LLM, and display insights on a dashboard.

## Tech Stack
- **Backend:** FastAPI (Python) + PostgreSQL (SQLAlchemy ORM) + pdfplumber + Anthropic API
- **Frontend:** React (Vite) + Tailwind CSS

## Getting Started

### Backend Setup
1. Navigate to the `backend/` directory.
2. Create a virtual environment and activate it.
3. Install dependencies: `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and fill in your credentials:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
5. Run the FastAPI development server: `uvicorn app.main:app --reload`

### Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Run the development server: `npm run dev`
