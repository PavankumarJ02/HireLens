import React from 'react';

export default function Card({ children, className = '', hover = false }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 ${hover ? 'hover:border-indigo-200 hover:shadow-md transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
}
