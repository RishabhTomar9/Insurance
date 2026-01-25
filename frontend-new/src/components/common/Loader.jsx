import React from 'react';

const Loader = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-200 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>

                {/* Logo Icon in Center */}
                <div className="absolute inset-0 flex items-center justify-center text-white">
                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                </div>
            </div>
            <p className="mt-4 text-white font-medium tracking-wider text-sm animate-pulse">LOADING GRIVA CRM...</p>
        </div>
    );
};

export default Loader;
