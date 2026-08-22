import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function Jobs({ setView, setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJobs();
      setJobs(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!title || !title.trim() || !rawText.trim()) {
      setFormError('Job Title and Description are required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');
    setFormSuccess('');

    try {
      const created = await api.createJob({
        title: title.trim(),
        raw_text: rawText.trim()
      });
      setFormSuccess('Job posting created successfully!');
      
      // Reset form fields
      setTitle('');
      setRawText('');
      setShowCreateForm(false);
      
      // Reload jobs
      await loadJobs();

      // Navigate to detail page of the created job description
      if (created && created.id) {
        setSelectedJobId(created.id);
        setView('jobDetails');
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create job posting.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job description? This will also remove any screening matches associated with this job.')) {
      return;
    }
    try {
      await api.deleteJob(jobId);
      await loadJobs();
    } catch (err) {
      alert(err.message || 'Failed to delete job description.');
    }
  };

  if (loading) return <Loader message="Loading job descriptions..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadJobs} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Vacancies</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, add, and review requirements for active roles.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow transition self-start sm:self-auto flex items-center"
        >
          <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Job Description
        </button>
      </div>

      {/* Creation Modal / Inline Drawer */}
      {showCreateForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-3xl animate-slide-down">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-900">New Job Description</h3>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="text-slate-400 hover:text-slate-500 transition"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer"
                className="w-full rounded-xl border border-slate-250 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Job Description</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={8}
                placeholder="Paste the full job details, required skills, and preferred requirements here..."
                className="w-full rounded-xl border border-slate-250 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            {formError && <p className="text-rose-600 text-xs font-medium">{formError}</p>}
            {formSuccess && <p className="text-emerald-600 text-xs font-medium">{formSuccess}</p>}

            <button
              type="submit"
              disabled={formSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition disabled:opacity-50"
            >
              {formSubmitting ? 'Creating Job...' : 'Create & Save'}
            </button>
          </form>
        </div>
      )}

      {/* Jobs Listing grid */}
      {jobs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-400">No job postings created yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-indigo-200 hover:shadow-md transition">
              <div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  ID: {index + 1}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Created {new Date(job.created_at).toLocaleDateString()}</p>
                
                <p className="text-xs text-slate-500 mt-4 line-clamp-3 leading-relaxed">
                  {job.raw_text}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-2">
                <button
                  onClick={() => handleDeleteJob(job.id)}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold py-2 px-3.5 rounded-xl transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setView('jobDetails');
                  }}
                  className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-3.5 rounded-xl transition"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
