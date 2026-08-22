/**
 * Centralized API service layer for HireLens.
 * Handles all requests to the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Helper to handle fetch responses and handle JSON/text errors.
 */
async function handleResponse(response) {
  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred.';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch {
      try {
        const errText = await response.text();
        errorDetail = errText || errorDetail;
      } catch {}
    }
    throw new Error(errorDetail);
  }
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

export const api = {
  // --- Job API endpoints ---
  async getJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs/`);
    return handleResponse(response);
  },

  async getJob(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
    return handleResponse(response);
  },

  async createJob(jobData) {
    const response = await fetch(`${API_BASE_URL}/jobs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  // --- Resume API endpoints ---
  async getResumes() {
    const response = await fetch(`${API_BASE_URL}/resumes/`);
    return handleResponse(response);
  },

  async getResume(resumeId, jobId = null) {
    let url = `${API_BASE_URL}/resumes/${resumeId}`;
    if (jobId) {
      url += `?job_id=${jobId}`;
    }
    const response = await fetch(url);
    return handleResponse(response);
  },

  async uploadResume(formData) {
    const response = await fetch(`${API_BASE_URL}/resumes/upload`, {
      method: 'POST',
      body: formData, // Multipart form data
    });
    return handleResponse(response);
  },

  // --- Matches API endpoints ---
  async runMatch(resumeId, jobId) {
    const response = await fetch(`${API_BASE_URL}/matches/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resume_id: resumeId, job_id: jobId }),
    });
    return handleResponse(response);
  },

  async getMatch(matchId) {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}`);
    return handleResponse(response);
  },

  // --- Screening API endpoints ---
  async runBatchScreening(jobId, resumeIds) {
    const response = await fetch(`${API_BASE_URL}/screening/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ job_id: jobId, resume_ids: resumeIds }),
    });
    return handleResponse(response);
  },

  async getScreeningResults(jobId) {
    const response = await fetch(`${API_BASE_URL}/screening/${jobId}/results`);
    return handleResponse(response);
  },

  async deleteJob(jobId) {
    const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async deleteResume(resumeId) {
    const response = await fetch(`${API_BASE_URL}/resumes/${resumeId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async clearMatch(jobId, resumeId) {
    const response = await fetch(`${API_BASE_URL}/matches/job/${jobId}/resume/${resumeId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async clearJobMatches(jobId) {
    const response = await fetch(`${API_BASE_URL}/matches/job/${jobId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },

  async deleteMatch(matchId) {
    const response = await fetch(`${API_BASE_URL}/matches/${matchId}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};
