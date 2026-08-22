import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
  
  const [selectedToCompare, setSelectedToCompare] = useState([]);
  const [resumes, setResumes] = useState([]);

  const getResumeDisplayId = (resumeId) => {
    const idx = resumes.findIndex(r => r.id === resumeId);
    return idx !== -1 ? idx + 1 : resumeId;
  };

  const loadJobsList = async () => {
    setLoadingJobs(true);
    try {
      const [jobsData, resumesData] = await Promise.all([
        api.getJobs(),
        api.getResumes()
      ]);
      setJobs(jobsData);
      setResumes(resumesData);
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id);
      }
      setLoadingJobs(false);
    } catch (err) {
      setError(err.message);
      setLoadingJobs(false);
    }
  };

  const loadScreeningData = async () => {
    if (!selectedJobId) return;
    setLoadingResults(true);
    setError(null);
    try {
      const data = await api.getScreeningResults(selectedJobId);
      setResults(data.results || []);
      setSelectedToCompare([]);
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

  const handleClearMatch = async (resumeId) => {
    if (!window.confirm('Are you sure you want to clear this match evaluation?')) {
      return;
    }
    try {
      await api.clearMatch(selectedJobId, resumeId);
      await loadScreeningData();
    } catch (err) {
      alert(err.message || 'Failed to clear match evaluation.');
    }
  };

  const handleClearAllMatches = async () => {
    if (!window.confirm('Are you sure you want to clear ALL match evaluations for this job role?')) {
      return;
    }
    try {
      await api.clearJobMatches(selectedJobId);
      await loadScreeningData();
    } catch (err) {
      alert(err.message || 'Failed to clear all match evaluations.');
    }
  };

  if (loadingJobs) return <Loader message="Loading active vacancies list..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Screening Results"
        subtitle="Review evaluation scores and deterministic rank structures."
        action={
          jobs.length > 0 && (
            <div className="flex items-center space-x-3">
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
          )
        }
      />

      {error && <ErrorAlert message={error} onRetry={loadScreeningData} />}

      {loadingResults ? (
        <Loader message="Loading ranked candidates list..." />
      ) : results.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-medium text-slate-400">No candidates have been screened for this job yet.</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => setView('screening')}
          >
            Launch Screening Session
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Action header bar */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-50 p-4 rounded-xl border border-slate-200 gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {selectedToCompare.length} of {results.length} selected for comparison
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={handleClearAllMatches}
              >
                Clear All Matches
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={triggerCompare}
                disabled={selectedToCompare.length < 2}
              >
                Compare Selected Candidates
              </Button>
            </div>
          </div>

          {/* Results table */}
          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
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
                    const badgeVariant = cand.overall_score >= 80 ? 'success' : 
                                         cand.overall_score >= 60 ? 'warning' : 'danger';

                    return (
                      <tr key={cand.resume_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-center font-extrabold text-slate-800 text-sm">
                          #{cand.rank}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedToCompare.includes(cand.resume_id)}
                            onChange={() => handleToggleCompare(cand.resume_id)}
                            className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <span className="block text-sm font-semibold text-slate-900">{cand.candidate_name}</span>
                            <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">Resume ID: {getResumeDisplayId(cand.resume_id)}</span>
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
                          <Badge variant={badgeVariant}>
                            {status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleClearMatch(cand.resume_id)}
                            >
                              Clear Match
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedResumeId(cand.resume_id);
                                setView('candidateDetails');
                              }}
                            >
                              View Candidate
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
