import React from 'react';

export default function Badge({ children, variant = 'neutral', className = '' }) {
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    primary: "bg-indigo-50 text-indigo-700 border-indigo-100",
    neutral: "bg-slate-100 text-slate-600 border-slate-200"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant] || variants.neutral} ${className}`}>
      {children}
    </span>
  );
}
