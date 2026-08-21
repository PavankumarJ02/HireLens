import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import Loader from '../components/Loader';
import ErrorAlert from '../components/ErrorAlert';

export default function CandidateDetails({ resumeId, jobId, setView }) {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCandidateDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getResume(resumeId, jobId);
      setCandidate(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeId) {
      loadCandidateDetails();
    }
  }, [resumeId, jobId]);

  if (!resumeId) return <ErrorAlert message="No Candidate Resume ID provided." />;
  if (loading) return <Loader message="Loading candidate detailed profile..." />;
  if (error) return <ErrorAlert message={error} onRetry={loadCandidateDetails} />;

  // Safely extract structured candidate data
  const name = candidate.candidate_name || candidate.filename;
  const contact = candidate.contact || {};
  const skills = candidate.skills || [];
  const experience = candidate.experience || [];
  const education = candidate.education || [];
  const projects = candidate.projects || [];
  const certifications = candidate.certifications || [];

  // Match details (if job_id was matched)
  const isMatched = candidate.overall_score !== null && candidate.overall_score !== undefined;
  
  // Format justification text into clean subsections
  const renderJustification = () => {
    if (!candidate.justification) return null;
    const sections = candidate.justification.split('\n\n');
    return (
      <div className="space-y-4">
        {sections.map((section, idx) => {
          const parts = section.split(':');
          const title = parts[0] + ':';
          const content = parts.slice(1).join(':');
          return (
            <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1.5">{title}</h5>
              <p className="text-xs text-slate-655 leading-relaxed">{content.strip || content.trim()}</p>
            </div>
          );
        })}
      </div>
    );
  };

  // Safe missing skills extraction
  const missingObj = candidate.missing_requirements || {};
  const missingRequired = Array.isArray(missingObj) ? missingObj : (missingObj.required || []);
  const missingPreferred = Array.isArray(missingObj) ? [] : (missingObj.preferred || []);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header breadcrumb & actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <button
            onClick={() => setView(jobId ? 'screeningResults' : 'candidates')}
            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition flex items-center mb-1"
          >
            &larr; Back to {jobId ? 'screening results' : 'candidates list'}
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{name}</h1>
          <p className="text-slate-400 text-xs mt-0.5">Resume ID: #{candidate.resume_id} &bull; Uploaded {new Date(candidate.uploaded_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Col Span 2): Profile details (experience, education, projects) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Experience */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Professional Experience</h3>
            {experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No experience records found.</p>
            ) : (
              <div className="space-y-6">
                {experience.map((exp, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{exp.role}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{exp.company} &bull; {exp.duration}</p>
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Projects</h3>
            {projects.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No project records found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">{proj.name}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Education</h3>
            {education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No education records found.</p>
            ) : (
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{edu.degree}</h4>
                      <p className="text-slate-500 font-semibold mt-0.5">{edu.institution}</p>
                    </div>
                    <span className="text-slate-400 font-semibold">{edu.year}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Col Span 1): Match evaluations details & Skills list */}
        <div className="lg:col-span-1 space-y-6">
          {/* Match Score & breakdown */}
          {isMatched && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Evaluation Match Summary</h3>
              
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Score</span>
                <span className="text-3xl font-extrabold text-slate-900">
                  {candidate.overall_score}
                  <span className="text-xs text-slate-400 font-normal"> /100</span>
                </span>
              </div>

              {/* Progress bars */}
              <div className="space-y-3.5 pt-3">
                {[
                  { name: 'Skills', score: candidate.score_breakdown?.skills || 0, color: 'bg-indigo-600' },
                  { name: 'Experience', score: candidate.score_breakdown?.experience || 0, color: 'bg-indigo-600' },
                  { name: 'Projects', score: candidate.score_breakdown?.projects || 0, color: 'bg-indigo-600' },
                  { name: 'Education', score: candidate.score_breakdown?.education || 0, color: 'bg-indigo-600' },
                ].map((factor, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-650">
                      <span>{factor.name}</span>
                      <span>{factor.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${factor.color}`} style={{ width: `${factor.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Skills & Certifications</h3>
            
            {/* Candidate skills */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h4>
              {skills.length === 0 ? (
                <p className="text-xs text-slate-450 italic">No skills listed.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Certifications</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {certifications.map((c, i) => (
                    <li key={i} className="text-xs text-slate-600">{c}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Missing & Matching requirements */}
          {isMatched && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Requirement Fits</h3>
              
              {/* Matching */}
              <div>
                <h4 className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2 flex items-center">
                  <svg className="h-4 w-4 mr-1 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Matching Requirements
                </h4>
                {candidate.matching_requirements?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None matched.</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {candidate.matching_requirements?.map((req, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-normal">{req}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Missing Required */}
              <div>
                <h4 className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-2 flex items-center">
                  <svg className="h-4 w-4 mr-1 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Missing Required Skills
                </h4>
                {missingRequired.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None missing.</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {missingRequired.map((req, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-normal">{req}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Missing Preferred */}
              {missingPreferred.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2 flex items-center">
                    <svg className="h-4 w-4 mr-1 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Missing Preferred Skills
                  </h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {missingPreferred.map((req, i) => (
                      <li key={i} className="text-xs text-slate-600 leading-normal">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Justification details */}
          {isMatched && candidate.justification && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">AI Evaluation Justification</h3>
              {renderJustification()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
