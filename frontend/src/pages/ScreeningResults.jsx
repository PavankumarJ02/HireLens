import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function ScreeningResults({ 
  selectedJobId, 
  setSelectedJobId, 
  setView, 
  setSelectedResumeId,
  setCompareResumeIds
}) {
  const [jobs, setJobs] = useState([]);
  const [results, setResults] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState(null);
  
  // Compare selection list
  const [selectedToCompare, setSelectedToCompare] = useState([]);

  // Load all jobs for selection dropdown
  const loadJobsList = async () => {
    setLoadingJobs(true);
    try {
      const data = await api.getJobs();
      setJobs(data);
      if (data.length > 0 && !selectedJobId) {
        setSelectedJobId(data[0].id);
      }
      setLoadingJobs(false);
    } catch (err) {
      setError(err.message);
      setLoadingJobs(false);
    }
  };

  // Load screening results for selected job description
  const loadScreeningData = async () => {
    if (!selectedJobId) return;
    setLoadingResults(true);
    setError(null);
    try {
      const data = await api.getScreeningResults(selectedJobId);
      setResults(data.results || []);
      setSelectedToCompare([]); // Reset selection on change
      setLoadingResults(false);
    } catch (err) {
      setError(err.message);
      setLoadingResults(false);
    }
  };

  useEffect(() => {
    loadJobsList();
  }, []);

  useEffect(() => {
    loadScreeningData();
  }, [selectedJobId]);

  const handleToggleCompare = (id) => {
    setSelectedToCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(rid => rid !== id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 candidates at a time.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const triggerCompare = () => {
    if (selectedToCompare.length < 2) {
      alert('Please select at least 2 candidates to compare.');
      return;
    }
    setCompareResumeIds(selectedToCompare);
    setView('compare');
  };

  if (loadingJobs) return <Loader message="Loading active vacancies list..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Screening Results</h1>
          <p className="text-slate-500 text-sm mt-1">Review AI evaluation scores and deterministic rank structures.</p>
        </div>

        {/* Dropdown Job selector */}
        {jobs.length > 0 && (
          <div className="flex items-center space-x-3 self-start sm:self-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Role</span>
            <select
              value={selectedJobId || ''}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="rounded-xl border border-slate-250 bg-white p-2.5 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer"
            >
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && <ErrorAlert message={error} onRetry={loadScreeningData} />}

      {loadingResults ? (
        <Loader message="Loading ranked candidates list..." />
      ) : results.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-400">No candidates have been screened for this job yet.</p>
          <button
            onClick={() => setView('screening')}
            className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow transition"
          >
            Launch Screening Session
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Action header bar */}
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500">
              {selectedToCompare.length} of {results.length} selected for comparison
            </span>
            <button
              onClick={triggerCompare}
              disabled={selectedToCompare.length < 2}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition disabled:opacity-40"
            >
              Compare Selected Candidates
            </button>
          </div>

          {/* Results table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 text-xs font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 w-12 text-center">Rank</th>
                    <th className="px-6 py-4 w-12 text-center">Select</th>
                    <th className="px-6 py-4">Candidate</th>
                    <th className="px-6 py-4 text-center">Score</th>
                    <th className="px-6 py-4 text-center">Skills</th>
                    <th className="px-6 py-4 text-center">Experience</th>
                    <th className="px-6 py-4 text-center">Projects</th>
                    <th className="px-6 py-4 text-center">Education</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((cand) => {
                    const status = cand.overall_score >= 80 ? 'Shortlisted' : 
                                   cand.overall_score >= 60 ? 'Reviewed' : 'Unmet';

                    return (
                      <tr key={cand.resume_id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-center font-extrabold text-slate-800 text-sm">
                          #{cand.rank}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedToCompare.includes(cand.resume_id)}
                            onChange={() => handleToggleCompare(cand.resume_id)}
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="block text-sm font-semibold text-slate-900">{cand.candidate_name}</span>
                            <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Resume ID: {cand.resume_id}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-slate-900 text-base">
                          {cand.overall_score}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600 text-sm">
                          {cand.score_breakdown?.skills || 0}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600 text-sm">
                          {cand.score_breakdown?.experience || 0}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600 text-sm">
                          {cand.score_breakdown?.projects || 0}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-slate-600 text-sm">
                          {cand.score_breakdown?.education || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            status === 'Reviewed' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedResumeId(cand.resume_id);
                              setView('candidateDetails');
                            }}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-3 rounded-xl border border-indigo-100 transition"
                          >
                            View Candidate
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
