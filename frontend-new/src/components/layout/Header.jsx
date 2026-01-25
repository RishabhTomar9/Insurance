import React from 'react';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const { currentUser } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
            <div className="flex items-center">
                <h2 className="text-xl font-semibold text-slate-800">
                    Welcome back, <span className="text-indigo-600">{currentUser?.displayName?.split(' ')[0]}</span>
                </h2>
            </div>
            <div className="flex items-center space-x-4">
                <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                </button>
                <div className="h-8 w-px bg-slate-200 mx-2"></div>
                <button
                    onClick={() => auth.signOut()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;
