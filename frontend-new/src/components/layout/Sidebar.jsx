import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
    const { currentUser } = useAuth();
    const role = currentUser?.role;

    const NavItem = ({ to, icon, label }) => (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors ${isActive
                    ? 'bg-indigo-600 text-white border-r-4 border-indigo-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
            }
        >
            {icon}
            <span>{label}</span>
        </NavLink>
    );

    // SVGs
    const DashboardIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>;
    const UsersIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>;
    const CarIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 19H5V8h14m-3-5v2.206l-1.6 .8L11 6h-5L2.6 10l-1.6-.8V7h3M3 19v2h2v-2h12v2h2v-2M5 12h14"></path><path d="M14 10l-2 1l-2-1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="7" cy="15" r="2" /><circle cx="17" cy="15" r="2" /></svg>; // Simplified Car
    const FileIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>;
    const HomeIcon = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>;

    return (
        <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20">
            <div className="h-16 flex items-center justify-center border-b border-slate-800 bg-slate-900">
                <div className="flex items-center space-x-2 text-white font-bold text-xl tracking-wider">
                    <span className="text-indigo-500 text-2xl">⚡</span>
                    <span>GRIVA CRM</span>
                </div>
            </div>

            <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                <NavItem to={role === 'manager' ? "/manager" : "/employee"} icon={DashboardIcon} label="Dashboard" />

                {role === 'manager' && (
                    <>
                        <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Management</div>
                        <NavItem to="/manager/employees" icon={UsersIcon} label="Employees" />
                    </>
                )}

                <div className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resources</div>
                <NavItem to={role === 'manager' ? "/manager/cars" : "/employee/cars"} icon={CarIcon} label="Vehicles" />
                <NavItem to={role === 'manager' ? "/manager/owners" : "/employee/owners"} icon={UsersIcon} label="Owners" />
                <NavItem to={role === 'manager' ? "/manager/policies" : "/employee/policies"} icon={FileIcon} label="Policies" />
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center space-x-3 text-slate-400">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                        {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{currentUser?.displayName || 'User'}</p>
                        <p className="text-xs truncate">{currentUser?.role?.toUpperCase()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
