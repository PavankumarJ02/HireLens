import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

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

  const reqs = job.parsed_requirements || {};
  const requiredSkills = reqs.required_skills || [];
  const preferredSkills = reqs.preferred_skills || [];
  const responsibilities = reqs.responsibilities || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title={job.title}
        subtitle={`ID: ${getJobDisplayId(job.id)} • Created ${new Date(job.created_at).toLocaleDateString()}`}
        backLabel="Back to jobs list"
        backAction={() => setView('jobs')}
        action={
          <>
            <Button
              variant="primary"
              onClick={() => {
                setSelectedJobId(job.id);
                setView('screening');
              }}
            >
              Screen Candidates
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedJobId(job.id);
                setView('screeningResults');
              }}
            >
              View Screening Results
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Full raw job description text */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Job Details Description</h3>
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
              {job.raw_text}
            </p>
          </Card>
        </div>

        {/* Right Column: Parsed requirements summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Structured Requirements</h3>

            {/* Required Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h4>
              {requiredSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No required skills parsed.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map((skill, index) => (
                    <Badge key={index} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preferred Skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Preferred Skills</h4>
              {preferredSkills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No preferred skills parsed.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {preferredSkills.map((skill, index) => (
                    <Badge key={index} variant="success">
                      {skill}
                    </Badge>
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
                <p className="text-xs text-slate-400 italic">No responsibilities parsed.</p>
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
          </Card>
        </div>
      </div>
    </div>
  );
}
