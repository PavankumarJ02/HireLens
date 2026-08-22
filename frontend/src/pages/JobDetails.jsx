import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function JobDetails({ jobId, setView, setSelectedJobId }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobs, setJobs] = useState([]);

  const getJobDisplayId = (id) => {
    const idx = jobs.findIndex(j => j.id === id);
    return idx !== -1 ? idx + 1 : id;
  };

  const loadJobDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsData, data] = await Promise.all([
        api.getJobs(),
        api.getJob(jobId)
      ]);
      setJobs(jobsData);
      setJob(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobId) {
      loadJobDetails();
    }
  }, [jobId]);

  if (!jobId) return <ErrorAlert message="No Job ID provided." />;
  if (loading) return <Loader message="Loading job description details..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadJobDetails} />;

  // Safely extract requirements
  const reqs = job.parsed_requirements || {};
  const requiredSkills = reqs.required_skills || [];
  const preferredSkills = reqs.preferred_skills || [];
  const responsibilities = reqs.responsibilities || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <button
            onClick={() => setView('jobs')}
            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition flex items-center mb-1"
          >
            &larr; Back to jobs list
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{job.title}</h1>
          <p className="text-slate-400 text-xs mt-0.5">ID: {getJobDisplayId(job.id)} &bull; Created {new Date(job.created_at).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            onClick={() => {
              setSelectedJobId(job.id);
              setView('screening');
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow transition"
          >
            Screen Candidates
          </button>
          <button
            onClick={() => {
              setSelectedJobId(job.id);
              setView('screeningResults');
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-4 rounded-xl transition border border-slate-250"
          >
            View Screening Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Full raw job description text */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Job Details Description</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {job.raw_text}
            </p>
          </div>
        </div>

        {/* Right Column: AI parsed requirements summary (if extracted) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Structured Requirements</h3>

            {/* Required Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h4>
              {requiredSkills.length === 0 ? (
                <p className="text-xs text-slate-450 italic">No required skills parsed.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((skill, index) => (
                    <span key={index} className="text-[11px] font-medium bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Skills</h4>
              {preferredSkills.length === 0 ? (
                <p className="text-xs text-slate-450 italic">No preferred skills parsed.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {preferredSkills.map((skill, index) => (
                    <span key={index} className="text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg">
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Minimum Experience */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Experience Requirement</h4>
              <p className="text-xs text-slate-700 font-medium">
                {reqs.minimum_experience || 'Not specified'}
              </p>
            </div>

            {/* Responsibilities */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Responsibilities</h4>
              {responsibilities.length === 0 ? (
                <p className="text-xs text-slate-450 italic">No responsibilities parsed.</p>
              ) : (
                <ul className="list-disc pl-4 space-y-1.5">
                  {responsibilities.map((resp, index) => (
                    <li key={index} className="text-xs text-slate-600 leading-relaxed">
                      {resp}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
