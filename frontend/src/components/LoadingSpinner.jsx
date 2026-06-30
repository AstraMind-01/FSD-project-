import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-b-purple-400 border-t-transparent border-r-transparent border-l-transparent animate-spin [animation-duration:1s] [animation-direction:reverse]"></div>
      </div>
      <p className="mt-4 text-slate-400 text-xs font-semibold tracking-widest animate-pulse">LOADING DEVBOARD...</p>
    </div>
  );
};

export default LoadingSpinner;
