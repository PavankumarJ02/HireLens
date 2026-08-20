import React, { useState } from 'react';
import './App.css';

function App() {
  const [resumes, setResumes] = useState([
    { id: 1, name: 'Alice Smith.pdf', email: 'alice@example.com', score: 9.0, status: 'Shortlisted' },
    { id: 2, name: 'Bob Johnson.pdf', email: 'bob@example.com', score: 7.5, status: 'Reviewed' },
    { id: 3, name: 'Charlie Brown.pdf', email: 'charlie@example.com', score: 4.2, status: 'Rejected' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              HL
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">HireLens Screener</span>
          </div>
          <span className="text-sm font-medium px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
            Admin Panel
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left panel: Actions & Jobs */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Compare Candidates</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Job Description</label>
                  <textarea
                    rows={6}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Paste job details and requirements..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Upload Resumes (PDF/TXT)</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 transition">
                    <span className="text-sm text-slate-600 block">Click to upload files</span>
                    <span className="text-xs text-slate-400 block mt-1">PDF or Text formats</span>
                  </div>
                </div>
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg shadow transition">
                  Screen & Match Resumes
                </button>
              </div>
            </div>
          </div>

          {/* Right panel: Candidates dashboard list */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-900">Screened Candidates</h2>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded">
                  {resumes.length} total
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {resumes.map((candidate) => (
                  <div key={candidate.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-semibold text-lg border border-slate-200">
                        {candidate.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{candidate.name}</h4>
                        <p className="text-sm text-slate-500">{candidate.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Match Score</span>
                        <span className="text-lg font-bold text-slate-900">{candidate.score} <span className="text-sm text-slate-400 font-normal">/10</span></span>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        candidate.status === 'Shortlisted' ? 'bg-emerald-50 text-emerald-700' :
                        candidate.status === 'Reviewed' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {candidate.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
