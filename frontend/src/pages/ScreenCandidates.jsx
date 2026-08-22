import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

      if (selectedJobId && jobsList.some(j => j.id === selectedJobId)) {
        // Keep currently selected job
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

  const getJobDisplayId = (id) => {
    const idx = jobs.findIndex(j => j.id === id);
    return idx !== -1 ? idx + 1 : id;
  };

  const getResumeDisplayId = (id) => {
    const idx = resumes.findIndex(r => r.id === id);
    return idx !== -1 ? idx + 1 : id;
  };

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
    setScreeningMessage(`Evaluating ${selectedResumes.length} candidate profiles...`);

    try {
      await api.runBatchScreening(selectedJobId, selectedResumes);
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
      <Card className="max-w-xl mx-auto my-12 text-center p-12 space-y-4 animate-pulse">
        <Loader message={screeningMessage} />
        <p className="text-xs text-slate-400 font-medium">Analyzing qualifications, technical alignment, and experience match. Please wait...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Run Screen Evaluation"
        subtitle="Select a vacancy and choose candidates to initiate batch evaluation."
      />

      {screeningError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-semibold text-rose-700">
          {screeningError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Select Job description */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">1. Select Job Posting</h3>
            
            {jobs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No job postings created. Please create one first.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <label
                    key={job.id}
                    className={`flex items-start p-3.5 rounded-xl border cursor-pointer transition-all ${
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
                      <span className="block text-[10px] font-semibold text-slate-400 mt-0.5">ID: {getJobDisplayId(job.id)}</span>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Select Candidate resumes */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">2. Select Candidate Resumes</h3>
              {resumes.length > 0 && (
                <button
                  onClick={handleSelectAllResumes}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  {selectedResumes.length === resumes.length ? 'Clear Selection' : 'Select All'}
                </button>
              )}
            </div>

            {resumes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No candidate resumes available. Upload resumes first.</p>
            ) : (
              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto pr-2">
                {resumes.map((resume) => {
                  const isChecked = selectedResumes.includes(resume.id);
                  const sd = resume.structured_data || {};
                  const candidateName = sd.contact?.name || 'Not Analyzed';

                  return (
                    <label
                      key={resume.id}
                      className={`flex items-center justify-between py-3.5 px-2 cursor-pointer transition-colors first:pt-0 ${
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
                          <span className="block text-xs text-slate-400 mt-0.5">Parsed Candidate: {candidateName}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">ID: #{getResumeDisplayId(resume.id)}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Run Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                variant="primary"
                onClick={handleStartScreening}
                disabled={screening || resumes.length === 0}
              >
                Screen Candidates ({selectedResumes.length} Selected)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
