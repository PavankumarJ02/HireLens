import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function Candidates({ setView, setSelectedResumeId }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const loadResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResumes();
      setResumes(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'txt') {
      setUploadError('Only PDF and TXT files are supported.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.uploadResume(formData);
      setUploadSuccess(`Resume "${file.name}" uploaded and parsed successfully!`);
      await loadResumes();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCandidate = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this candidate? This will also remove any screening matches associated with this candidate.')) {
      return;
    }
    try {
      await api.deleteResume(resumeId);
      await loadResumes();
    } catch (err) {
      alert(err.message || 'Failed to delete candidate.');
    }
  };

  if (loading) return <Loader message="Loading candidates resume list..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadResumes} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader 
        title="Candidates Profile List"
        subtitle="Upload and manage candidate resumes for screening."
        action={
          <label className={`cursor-pointer inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-sm transition ${
            uploading ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? 'Uploading PDF...' : 'Upload Resume (PDF/TXT)'}
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        }
      />

      {/* Upload feedback alerts */}
      {uploadError && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 text-xs font-semibold text-rose-700">
          {uploadError}
        </div>
      )}
      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs font-semibold text-emerald-700">
          {uploadSuccess}
        </div>
      )}

      {/* Candidates List Table */}
      {resumes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm font-medium text-slate-400">No resumes available in database. Upload one to get started.</p>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Candidate File Name</th>
                  <th className="px-6 py-4">Extracted Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Uploaded Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resumes.map((resume, index) => {
                  const sd = resume.structured_data || {};
                  const candidateName = sd.contact?.name || 'Not Analyzed Yet';
                  const isParsed = !!resume.structured_data;

                  return (
                    <tr key={resume.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400">#{index + 1}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{resume.filename}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{candidateName}</td>
                      <td className="px-6 py-4">
                        <Badge variant={isParsed ? 'success' : 'warning'}>
                          {isParsed ? 'Parsed' : 'Raw Text'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteCandidate(resume.id)}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedResumeId(resume.id);
                              setView('candidateDetails');
                            }}
                          >
                            View Profile
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
      )}
    </div>
  );
}
