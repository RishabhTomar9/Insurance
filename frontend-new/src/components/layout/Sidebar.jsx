import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Users, Car, ShieldAlert,
    FileText, Landmark, UserCheck, ShieldCheck,
    LogOut, Settings, X
} from 'lucide-react';
import { auth } from '../../services/firebase';

const Sidebar = ({ isOpen, onClose }) => {
    const { currentUser } = useAuth();
    const role = currentUser?.role;

    const NavItem = ({ to, icon: Icon, label }) => (
        <NavLink
            to={to}
            end={to === "/manager" || to === "/employee" || to === "/super-admin"}
            onClick={() => {
                if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
                `flex items-center space-x-3 px-6 py-4 text-sm font-medium tracking-wide transition-all ${isActive
                    ? 'bg-indigo-600/10 text-indigo-600 border-r-4 border-indigo-600'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                }`
            }
        >
            <Icon size={18} />
            <span className="font-bold uppercase tracking-widest text-[10px]">{label}</span>
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
        <div className={`
            w-64 bg-white h-screen fixed left-0 top-0 flex flex-col border-r border-slate-200 z-20
            transition-transform duration-300 lg:translate-x-0
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-900 font-bold text-lg tracking-[2px] uppercase">Griva CRM</span>
                </div>
                <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-indigo-600">
                    <X size={20} />
                </button>
            </div>

            <nav className="flex-1 py-8 space-y-1 overflow-y-auto">
                <NavItem to={getBaseRoute()} icon={LayoutDashboard} label="Dashboard" />

                {role === 'super-admin' && (
                    <>
                        <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Management</div>
                        <NavItem to="/super-admin/managers" icon={Users} label="Managers" />
                        <NavItem to="/super-admin/settings" icon={Settings} label="Settings" />
                    </>
                )}

                {role === 'manager' && (
                    <>
                        <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Team</div>
                        <NavItem to="/manager/employees" icon={Users} label="Employees" />
                    </>
                )}

                <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Main Data</div>
                <NavItem to={`${getBaseRoute()}/cars`} icon={Car} label="Vehicles" />
                <NavItem to={`${getBaseRoute()}/owners`} icon={UserCheck} label="Customers" />
                <NavItem to={`${getBaseRoute()}/agents`} icon={ShieldAlert} label="Agents" />

                {(role === 'manager' || role === 'super-admin') && (
                    <NavItem to={`${getBaseRoute()}/banks`} icon={Landmark} label="Bank Accounts" />
                )}

                <div className="px-6 pt-6 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[3px]">Actions</div>
                <NavItem to={`${getBaseRoute()}/policies`} icon={FileText} label="Policies" />
            </nav>

            <div className="p-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold border border-indigo-500 shadow-sm">
                        {currentUser?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">{currentUser?.displayName || 'Admin'}</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{role?.replace('-', ' ')}</p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest border border-transparent hover:border-rose-100"
                >
                    <LogOut size={14} /> Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
