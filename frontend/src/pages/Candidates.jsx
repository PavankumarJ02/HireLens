import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

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

    if (!file.name.toLowerCase().endswith('.pdf')) {
      setUploadError('Only PDF files are supported.');
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
      // Reload candidates
      await loadResumes();
    } catch (err) {
      setUploadError(err.message || 'Failed to upload and parse resume.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Loader message="Loading candidates resume list..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadResumes} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Candidates Profile List</h1>
          <p className="text-slate-500 text-sm mt-1">Upload and manage candidate resumes for screening.</p>
        </div>

        {/* File Upload Button wrapper */}
        <div className="self-start sm:self-auto">
          <label className={`cursor-pointer inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-xl shadow transition ${
            uploading ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <svg className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {uploading ? 'Uploading PDF...' : 'Upload Resume (PDF)'}
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

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
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-400">No resumes available in database. Upload one to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
                {resumes.map((resume) => {
                  const sd = resume.structured_data || {};
                  const candidateName = sd.contact?.name || 'Not Analyzed Yet';
                  const isParsed = !!resume.structured_data;

                  return (
                    <tr key={resume.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4 text-sm font-bold text-slate-400">#{resume.id}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{resume.filename}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-600">{candidateName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isParsed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {isParsed ? 'Parsed' : 'Raw Text'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedResumeId(resume.id);
                            setView('candidateDetails');
                          }}
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 transition"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
