import React from 'react';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-8 sticky top-0 z-20 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Workspace</span>
        <span className="text-slate-300">/</span>
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-md">
          Default Recruiter
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm" title="Default Recruiter">
          HL
        </div>
      </div>
    </header>
  );
}
