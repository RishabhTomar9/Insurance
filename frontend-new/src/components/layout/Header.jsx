import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Settings, Command } from 'lucide-react';

const Header = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    return (
        <header className="h-20 bg-[#0b0e1a] border-b border-[#1e2745] flex items-center justify-between px-10 sticky top-0 z-10 backdrop-blur-md bg-opacity-80">
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-[#111629] border border-[#1e2745] rounded-xl group focus-within:border-blue-500 transition-all w-80">
                    <Search className="w-4 h-4 text-[#6b7db3] group-focus-within:text-blue-500" />
                    <input
                        type="text"
                        placeholder="QUICK FIND..."
                        className="bg-transparent border-none outline-none text-xs text-white uppercase tracking-widest w-full placeholder:text-[#2a3660]"
                    />
                    <div className="flex items-center gap-1 px-1.5 py-1 bg-[#0b0e1a] border border-[#1e2745] rounded text-[8px] text-[#6b7db3] font-bold">
                        <Command className="w-2 h-2" /> K
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-[#6b7db3] hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#0b0e1a]" />
                </button>

                <button
                    onClick={() => {
                        const path = currentUser?.role === 'super-admin' ? '/super-admin/settings' : '/settings';
                        navigate(path);
                    }}
                    className="p-2 text-[#6b7db3] hover:text-white transition-colors"
                >
                    <Settings className="w-5 h-5" />
                </button>

                <div className="h-6 w-px bg-[#1e2745]" />

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-white">
                            {currentUser?.displayName || 'Session Active'}
                        </p>
                        <p className="text-[8px] uppercase tracking-[2px] text-emerald-500 font-bold">Online</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-blue-500/10">
                        <div className="w-full h-full bg-[#0b0e1a] rounded-[11px] flex items-center justify-center">
                            <span className="text-xs font-bold text-white uppercase">{currentUser?.displayName?.[0] || 'A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
