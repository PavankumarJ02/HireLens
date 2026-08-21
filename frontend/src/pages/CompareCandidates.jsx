import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function CompareCandidates({ resumeIds, jobId, setView }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadComparisonData = async () => {
    setLoading(true);
    setError(null);
    try {
      const promises = resumeIds.map(rid => api.getResume(rid, jobId));
      const data = await Promise.all(promises);
      setCandidates(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeIds && resumeIds.length > 0) {
      loadComparisonData();
    }
  }, [resumeIds, jobId]);

  if (!resumeIds || resumeIds.length < 2) {
    return <ErrorAlert message="Please select at least 2 candidates to compare." />;
  }

  if (loading) return <Loader message="Loading comparison metrics..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadComparisonData} />;

  // Find max value helper to highlight stronger scores
  const getMaxValue = (field, subField = null) => {
    const values = candidates.map(c => {
      if (subField) {
        return c[field]?.[subField] || 0;
      }
      return c[field] || 0;
    });
    return Math.max(...values);
  };

  const maxOverall = getMaxValue('overall_score');
  const maxSkills = getMaxValue('score_breakdown', 'skills');
  const maxExperience = getMaxValue('score_breakdown', 'experience');
  const maxProjects = getMaxValue('score_breakdown', 'projects');
  const maxEducation = getMaxValue('score_breakdown', 'education');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <button
          onClick={() => setView('screeningResults')}
          className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition flex items-center mb-1"
        >
          &larr; Back to screening results
        </button>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Compare Candidates</h1>
        <p className="text-slate-500 text-sm mt-1">Cross-compare scores and category fits side by side.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4 w-48">Metric</th>
                {candidates.map((cand) => (
                  <th key={cand.resume_id} className="px-6 py-4 text-center min-w-64">
                    <span className="block text-sm font-bold text-slate-900">{cand.candidate_name || cand.filename}</span>
                    <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">ID: #{cand.resume_id}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {/* Overall Score */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-bold text-slate-900">Overall Match Score</td>
                {candidates.map((c) => {
                  const isMax = c.overall_score === maxOverall;
                  return (
                    <td key={c.resume_id} className="px-6 py-4 text-center font-extrabold text-lg">
                      <span className={isMax ? 'bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100 shadow-sm' : 'text-slate-800'}>
                        {c.overall_score || 0} <span className="text-xs font-normal text-slate-400">/100</span>
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Skills Score */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-500">Skills Alignment</td>
                {candidates.map((c) => {
                  const score = c.score_breakdown?.skills || 0;
                  const isMax = score === maxSkills;
                  return (
                    <td key={c.resume_id} className={`px-6 py-4 text-center font-bold ${isMax ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {score}
                    </td>
                  );
                })}
              </tr>

              {/* Experience Score */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-500">Experience Alignment</td>
                {candidates.map((c) => {
                  const score = c.score_breakdown?.experience || 0;
                  const isMax = score === maxExperience;
                  return (
                    <td key={c.resume_id} className={`px-6 py-4 text-center font-bold ${isMax ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {score}
                    </td>
                  );
                })}
              </tr>

              {/* Projects Score */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-500">Projects Relevance</td>
                {candidates.map((c) => {
                  const score = c.score_breakdown?.projects || 0;
                  const isMax = score === maxProjects;
                  return (
                    <td key={c.resume_id} className={`px-6 py-4 text-center font-bold ${isMax ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {score}
                    </td>
                  );
                })}
              </tr>

              {/* Education Score */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-500">Education Alignment</td>
                {candidates.map((c) => {
                  const score = c.score_breakdown?.education || 0;
                  const isMax = score === maxEducation;
                  return (
                    <td key={c.resume_id} className={`px-6 py-4 text-center font-bold ${isMax ? 'text-emerald-600' : 'text-slate-800'}`}>
                      {score}
                    </td>
                  );
                })}
              </tr>

              {/* Matching requirements */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-500 align-top pt-4">Matching Skills</td>
                {candidates.map((c) => (
                  <td key={c.resume_id} className="px-6 py-4 align-top">
                    {c.matching_requirements && c.matching_requirements.length > 0 ? (
                      <div className="flex flex-wrap gap-1 justify-center">
                        {c.matching_requirements.map((req, i) => (
                          <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">
                            {req}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic block text-center">None</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Missing Requirements */}
              <tr className="hover:bg-slate-50/50 transition">
                <td className="px-6 py-4 font-semibold text-slate-500 align-top pt-4">Missing Skills</td>
                {candidates.map((c) => {
                  const missingObj = c.missing_requirements || {};
                  const required = Array.isArray(missingObj) ? missingObj : (missingObj.required || []);
                  const preferred = Array.isArray(missingObj) ? [] : (missingObj.preferred || []);

                  return (
                    <td key={c.resume_id} className="px-6 py-4 align-top text-xs text-slate-600 space-y-3">
                      {required.length > 0 && (
                        <div>
                          <span className="block font-bold text-rose-700 text-[10px] uppercase mb-1">Required</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {required.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {preferred.length > 0 && (
                        <div>
                          <span className="block font-bold text-amber-700 text-[10px] uppercase mb-1">Preferred</span>
                          <ul className="list-disc pl-4 space-y-0.5">
                            {preferred.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {required.length === 0 && preferred.length === 0 && (
                        <span className="text-xs text-slate-400 italic block text-center">None missing</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
