import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Candidates from './pages/Candidates';
import ScreenCandidates from './pages/ScreenCandidates';
import ScreeningResults from './pages/ScreeningResults';
import CandidateDetails from './pages/CandidateDetails';
import CompareCandidates from './pages/CompareCandidates';
import './App.css';

function App() {
  const [view, setView] = useState('dashboard');
  
  // Selection/parameter states for views
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [compareResumeIds, setCompareResumeIds] = useState([]);

  // Render active page view
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            setView={setView} 
            setSelectedJobId={setSelectedJobId} 
            setSelectedResumeId={setSelectedResumeId} 
          />
        );
      case 'jobs':
        return (
          <Jobs 
            setView={setView} 
            setSelectedJobId={setSelectedJobId} 
          />
        );
      case 'jobDetails':
        return (
          <JobDetails 
            jobId={selectedJobId} 
            setView={setView} 
            setSelectedJobId={setSelectedJobId} 
          />
        );
      case 'candidates':
        return (
          <Candidates 
            setView={setView} 
            setSelectedResumeId={setSelectedResumeId} 
          />
        );
      case 'screening':
        return (
          <ScreenCandidates 
            setView={setView} 
            selectedJobId={selectedJobId} 
            setSelectedJobId={setSelectedJobId} 
          />
        );
      case 'screeningResults':
        return (
          <ScreeningResults 
            selectedJobId={selectedJobId} 
            setSelectedJobId={setSelectedJobId} 
            setView={setView} 
            setSelectedResumeId={setSelectedResumeId}
            setCompareResumeIds={setCompareResumeIds}
          />
        );
      case 'candidateDetails':
        return (
          <CandidateDetails 
            resumeId={selectedResumeId} 
            jobId={selectedJobId} 
            setView={setView} 
          />
        );
      case 'compare':
        return (
          <CompareCandidates 
            resumeIds={compareResumeIds} 
            jobId={selectedJobId} 
            setView={setView} 
          />
        );
      default:
        return (
          <Dashboard 
            setView={setView} 
            setSelectedJobId={setSelectedJobId} 
            setSelectedResumeId={setSelectedResumeId} 
          />
        );
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentView={view} setView={setView} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-20 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
              Default Recruiter
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
              Vite + React
            </span>
            <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
              HL
            </div>
          </div>
        </header>

        {/* Dynamic Content Body */}
        <main className="flex-grow p-8 max-w-7xl w-full mx-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
