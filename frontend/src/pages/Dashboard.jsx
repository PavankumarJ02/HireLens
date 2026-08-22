import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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
        matches: 0,
        shortlisted: resumes.filter(r => r.structured_data).length
      });

      setAllJobs(jobs);
      setRecentJobs(jobs.slice(-3).reverse());

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
    <div className="space-y-6 animate-fade-in">
      {/* Title block */}
      <PageHeader 
        title="Recruitment Dashboard" 
        subtitle="Recruiter-centric overview of candidates and active vacancies."
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { name: 'Total Vacancies', count: stats.jobs, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { name: 'Ingested Resumes', count: stats.resumes, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { name: 'Screened Profiles', count: stats.shortlisted, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
          { name: 'Shortlisted Candidates', count: stats.shortlisted, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' }
        ].map((card, i) => (
          <Card key={i} className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.name}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-2">{card.count}</h3>
            </div>
            <div className={`h-12 w-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
              </svg>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Vacancies */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Active Job Postings</h2>
              <button 
                onClick={() => setView('jobs')} 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Manage Jobs &rarr;
              </button>
            </div>

            {recentJobs.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm font-medium text-slate-400">No active vacancies listed.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                  onClick={() => setView('jobs')}
                >
                  Create Your First Job
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentJobs.map((job) => (
                  <div key={job.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">ID: {getJobDisplayId(job.id)} &bull; Created {new Date(job.created_at).toLocaleDateString()}</p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedJobId(job.id);
                        setView('jobDetails');
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Quick Action card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm border border-slate-800 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-bold text-white">Launch Screen Session</h3>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                Run batch candidate resume match evaluations against job descriptions utilizing evidence-based scoring.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              className="mt-6 w-full"
              onClick={() => setView('screening')}
            >
              Start Screen Evaluation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
