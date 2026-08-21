import React from 'react';

export default function ErrorAlert({ message, onRetry }) {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 shadow-sm max-w-2xl mx-auto my-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="ml-3.5 flex-1">
          <h3 className="text-sm font-semibold text-rose-800">Connection or Parsing Issue</h3>
          <div className="mt-1 text-xs text-rose-700 font-medium">
            {message || "Unable to connect to the HireLens backend. Make sure the FastAPI service is running on port 8000."}
          </div>
          {onRetry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={onRetry}
                className="bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
