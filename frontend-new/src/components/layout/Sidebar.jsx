import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, Car, ShieldAlert,
    FileText, Landmark, UserCheck, ShieldCheck,
    LogOut, Settings
} from 'lucide-react';
import { auth } from '../../services/firebase';

const Sidebar = () => {
    const { currentUser } = useAuth();
    const role = currentUser?.role;

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            end={to === "/manager" || to === "/employee" || to === "/super-admin"}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-6 py-4 text-sm font-medium tracking-wide transition-all ${isActive
                    ? 'bg-blue-600/10 text-blue-500 border-r-4 border-blue-500'
                    : 'text-[#6b7db3] hover:bg-[#111629] hover:text-white'
                }`
            }
        >
            <Icon size={18} />
            <span className="font-['Rajdhani'] uppercase tracking-widest text-xs font-bold">{label}</span>
        </NavLink>
    );

    const handleLogout = () => {
        auth.signOut();
    };

    const getBaseRoute = () => {
        if (role === 'super-admin') return '/super-admin';
        if (role === 'manager') return '/manager';
        return '/employee';
    };

    return (
        <div className="w-64 bg-[#0b0e1a] h-screen fixed left-0 top-0 flex flex-col border-r border-[#1e2745] z-20">
            <div className="h-20 flex items-center justify-center border-b border-[#1e2745]">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white font-bold text-lg font-['Rajdhani'] tracking-[2px]">GRIVA CRM</span>
                </div>
            </div>

            <nav className="flex-1 py-8 space-y-1 overflow-y-auto">
                <NavItem to={getBaseRoute()} icon={LayoutDashboard} label="Dashboard" />

                {role === 'super-admin' && (
                    <>
                        <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-[#2a3660] uppercase tracking-[3px]">Governance</div>
                        <NavItem to="/super-admin/managers" icon={Users} label="Managers" />
                    </>
                )}

                {role === 'manager' && (
                    <>
                        <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-[#2a3660] uppercase tracking-[3px]">Team Control</div>
                        <NavItem to="/manager/employees" icon={Users} label="Employees" />
                    </>
                )}

                <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-[#2a3660] uppercase tracking-[3px]">Master Data</div>
                <NavItem to={`${getBaseRoute()}/cars`} icon={Car} label="Vehicles" />
                <NavItem to={`${getBaseRoute()}/owners`} icon={UserCheck} label="Customers" />
                <NavItem to={`${getBaseRoute()}/agents`} icon={ShieldAlert} label="Agent Master" />

                {(role === 'manager' || role === 'super-admin') && (
                    <NavItem to="/manager/banks" icon={Landmark} label="Bank Catalog" />
                )}

                <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-[#2a3660] uppercase tracking-[3px]">Operations</div>
                <NavItem to={`${getBaseRoute()}/policies`} icon={FileText} label="Policy Control" />
            </nav>

            <div className="p-6 border-t border-[#1e2745] space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-[#111629] rounded-2xl border border-[#1e2745]">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold border border-blue-500/20">
                        {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white uppercase tracking-wider truncate">{currentUser?.displayName || 'Admin'}</p>
                        <p className="text-[10px] text-[#6b7db3] uppercase tracking-widest">{role}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                    <LogOut size={14} /> Terminate Session
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
