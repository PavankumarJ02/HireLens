import React from 'react';

export default function Loader({ message = 'Loading details...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        <div className="absolute h-5 w-5 bg-indigo-50 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 animate-pulse">
          HL
        </div>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{message}</p>
    </div>
  );
}
