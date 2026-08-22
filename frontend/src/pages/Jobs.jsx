import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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
      
      setTitle('');
      setRawText('');
      setShowCreateForm(false);
      
      await loadJobs();

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
      <PageHeader 
        title="Job Vacancies"
        subtitle="Manage, add, and review requirements for active roles."
        action={
          <Button 
            variant="primary" 
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Job Description
          </Button>
        }
      />

      {/* Creation Drawer */}
      {showCreateForm && (
        <Card className="max-w-3xl border-indigo-100 shadow-md">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">New Job Description</h3>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="text-slate-400 hover:text-slate-600 transition text-xs font-semibold"
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
                rows={7}
                placeholder="Paste the full job details, required skills, and preferred requirements here..."
                className="w-full rounded-xl border border-slate-250 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
            </div>

            {formError && <p className="text-rose-600 text-xs font-medium">{formError}</p>}
            {formSuccess && <p className="text-emerald-600 text-xs font-medium">{formSuccess}</p>}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={formSubmitting}
                variant="primary"
              >
                {formSubmitting ? 'Creating Job...' : 'Create & Save'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Jobs Listing grid */}
      {jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-medium text-slate-400">No job postings created yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, index) => (
            <Card key={job.id} hover className="flex flex-col justify-between">
              <div>
                <Badge variant="neutral">
                  ID: {index + 1}
                </Badge>
                <h3 className="text-base font-bold text-slate-900 mt-3">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-1">Created {new Date(job.created_at).toLocaleDateString()}</p>
                
                <p className="text-xs text-slate-500 mt-4 line-clamp-3 leading-relaxed">
                  {job.raw_text}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteJob(job.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setView('jobDetails');
                  }}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
