import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, Command, Menu } from 'lucide-react';

const Header = ({ onMenuClick }) => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="h-20 bg-white/80 border-b border-slate-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 text-slate-400 hover:text-indigo-600 lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl group focus-within:border-indigo-500 transition-all w-80">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600" />
                    <input
                        type="text"
                        placeholder="QUICK FIND..."
                        className="bg-transparent border-none outline-none text-[10px] text-slate-600 uppercase tracking-widest w-full placeholder:text-slate-300 font-bold"
                    />
                    <div className="flex items-center gap-1 px-1.5 py-1 bg-white border border-slate-200 rounded text-[8px] text-slate-400 font-bold">
                        <Command className="w-2 h-2" /> K
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    < Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                </button>

                <button
                    onClick={() => {
                        const path = currentUser?.role === 'super-admin' ? '/super-admin/settings' : '/settings';
                        navigate(path);
                    }}
                    className="hidden sm:block p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <div className="h-6 w-px bg-slate-200" />

                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-900">
                            {currentUser?.displayName || 'Session Active'}
                        </p>
                        <p className="text-[8px] uppercase tracking-[2px] text-emerald-500 font-bold text-right">Online Now</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 p-[1px] shadow-lg shadow-indigo-500/10">
                        <div className="w-full h-full bg-white rounded-[11px] flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-600 uppercase">{currentUser?.displayName?.[0] || 'A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
