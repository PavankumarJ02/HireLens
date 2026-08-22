import React from 'react';

export default function PageHeader({ title, subtitle, backAction, backLabel, action }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
      <div>
        {backAction && (
          <button
            onClick={backAction}
            className="text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors flex items-center mb-1 cursor-pointer"
          >
            &larr; {backLabel || 'Back'}
          </button>
        )}
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="self-start sm:self-auto flex items-center space-x-3">{action}</div>}
    </div>
  );
}
