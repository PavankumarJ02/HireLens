import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function ScreenCandidates({ setView, selectedJobId, setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selection states
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [screening, setScreening] = useState(false);
  const [screeningMessage, setScreeningMessage] = useState('');
  const [screeningError, setScreeningError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsList, resumesList] = await Promise.all([
        api.getJobs(),
        api.getResumes()
      ]);
      setJobs(jobsList);
      setResumes(resumesList);

      // Default select the passed job description if present
      if (selectedJobId && jobsList.some(j => j.id === selectedJobId)) {
        // Leave it
      } else if (jobsList.length > 0) {
        setSelectedJobId(jobsList[0].id);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleResume = (id) => {
    setSelectedResumes(prev => 
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const handleSelectAllResumes = () => {
    if (selectedResumes.length === resumes.length) {
      setSelectedResumes([]);
    } else {
      setSelectedResumes(resumes.map(r => r.id));
    }
  };

  const handleStartScreening = async () => {
    if (!selectedJobId) {
      setScreeningError('Please select a job description.');
      return;
    }
    if (selectedResumes.length === 0) {
      setScreeningError('Please select at least one candidate resume.');
      return;
    }

    setScreening(true);
    setScreeningError('');
    setScreeningMessage(`Analyzing and matching ${selectedResumes.length} candidates...`);

    try {
      await api.runBatchScreening(selectedJobId, selectedResumes);
      // Navigate to results
      setView('screeningResults');
    } catch (err) {
      setScreeningError(err.message || 'Failed to complete screening session.');
      setScreening(false);
    }
  };

  if (loading) return <Loader message="Initializing screening interface..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadData} />;

  if (screening) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center max-w-xl mx-auto my-12 space-y-4 animate-pulse">
        <Loader message={screeningMessage} />
        <p className="text-xs text-slate-400 font-medium">This involves querying Google Gemini 2.5 Flash-Lite, which parses skills, experience, and educational fits. Please do not close this window.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Run Screen Evaluation</h1>
        <p className="text-slate-500 text-sm mt-1">Select a vacancy and select candidates to initiate batch evaluation.</p>
      </div>

      {screeningError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-semibold text-rose-700">
          {screeningError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Select Job description */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">1. Select Job Posting</h3>
            
            {jobs.length === 0 ? (
              <p className="text-xs text-slate-450 italic">No job postings created. Please create one first.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <label
                    key={job.id}
                    className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedJobId === job.id
                        ? 'border-indigo-600 bg-indigo-50/40'
                        : 'border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="selected_job"
                      checked={selectedJobId === job.id}
                      onChange={() => setSelectedJobId(job.id)}
                      className="mt-1 h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-bold text-slate-900">{job.title}</span>
                      <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">ID: {job.id}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Select Candidate resumes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">2. Select Candidate Resumes</h3>
              {resumes.length > 0 && (
                <button
                  onClick={handleSelectAllResumes}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
                >
                  {selectedResumes.length === resumes.length ? 'Clear Selection' : 'Select All'}
                </button>
              )}
            </div>

            {resumes.length === 0 ? (
              <p className="text-xs text-slate-450 italic">No candidate resumes available. Upload resumes first.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2">
                {resumes.map((resume) => {
                  const isChecked = selectedResumes.includes(resume.id);
                  const sd = resume.structured_data || {};
                  const candidateName = sd.contact?.name || 'Not Analyzed';

                  return (
                    <label
                      key={resume.id}
                      className={`flex items-center justify-between py-3.5 px-2 cursor-pointer transition first:pt-0 ${
                        isChecked ? 'bg-slate-50/50 rounded-lg' : ''
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleResume(resume.id)}
                          className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        />
                        <div className="ml-4">
                          <span className="block text-sm font-semibold text-slate-900">{resume.filename}</span>
                          <span className="block text-xs text-slate-450 mt-0.5">Parsed Candidate: {candidateName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">ID: #{resume.id}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Run Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleStartScreening}
                disabled={screening || resumes.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl text-sm shadow transition disabled:opacity-50"
              >
                Screen Candidates ({selectedResumes.length} Selected)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
