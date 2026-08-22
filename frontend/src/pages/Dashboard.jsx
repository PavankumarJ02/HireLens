import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function Dashboard({ setView, setSelectedJobId, setSelectedResumeId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ jobs: 0, resumes: 0, matches: 0, shortlisted: 0 });
  const [recentJobs, setRecentJobs] = useState([]);
  const [topCandidates, setTopCandidates] = useState([]);
  const [allJobs, setAllJobs] = useState([]);

  const getJobDisplayId = (id) => {
    const idx = allJobs.findIndex(j => j.id === id);
    return idx !== -1 ? idx + 1 : id;
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobs, resumes] = await Promise.all([
        api.getJobs(),
        api.getResumes(),
      ]);

      setStats({
        jobs: jobs.length,
        resumes: resumes.length,
        matches: 0, // Fallback placeholder
        shortlisted: resumes.filter(r => r.structured_data).length // Rough proxy
      });

      // Show top 3 recent jobs
      setAllJobs(jobs);
      setRecentJobs(jobs.slice(-3).reverse());

      // Try resolving candidates that have structured extractions
      const parsedResumes = resumes.filter(r => r.structured_data).slice(0, 4);
      setTopCandidates(parsedResumes);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) return <Loader message="Loading recruiter dashboard..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadDashboardData} />;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Title block */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recruitment Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Recruiter-centric overview of candidates and vacancies.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { name: 'Total Vacancies', count: stats.jobs, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { name: 'Ingested Resumes', count: stats.resumes, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { name: 'Screened Profiles', count: stats.shortlisted, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { name: 'Shortlisted Candidates', count: stats.shortlisted, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
        ].map((card, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border ${card.border} shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{card.count}</h3>
            </div>
            <div className={`h-12 w-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Recent Vacancies & Fast Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Active Job Postings</h2>
              <button 
                onClick={() => setView('jobs')} 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Manage Jobs &rarr;
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm font-medium text-slate-400">No active vacancies listed.</p>
                <button 
                  onClick={() => setView('jobs')} 
                  className="mt-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold px-3.5 py-2 rounded-lg transition"
                >
                  Create Your First Job
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <div key={job.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">ID: {getJobDisplayId(job.id)} &bull; Created {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setView('jobDetails');
                      }}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg border border-slate-250 transition"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Quick Navigation actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800">
            <h3 className="text-lg font-bold">Launch Screen Session</h3>
            <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
              Instantly run batch candidate resume match evaluation against job posting utilizing explainable scoring.
            </p>
            <button
              onClick={() => setView('screening')}
              className="mt-5 w-full bg-white hover:bg-slate-50 text-indigo-950 font-bold py-2.5 px-4 rounded-xl shadow-sm text-sm transition"
            >
              Start Screen Evaluation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
