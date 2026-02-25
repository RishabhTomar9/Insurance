import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, ShieldAlert, FileText, Settings, ArrowUpRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        managers: 0,
        employees: 0,
        activePolicies: 0,
        revenue: '₹2,45,000'
    });

    // Mock data for now - Phase 2 will implement live stats
    useEffect(() => {
        setStats({
            managers: 4,
            employees: 28,
            activePolicies: 156,
            revenue: '₹8,92,400'
        });
    }, []);

    const StatCard = ({ title, value, icon: Icon, trend, color }) => (
        <div className="bg-[#111629] border border-[#1e2745] p-6 rounded-2xl hover:border-[#3d7fff]/50 transition-all group">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs font-bold">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-[#6b7db3] text-xs font-bold uppercase tracking-widest">{title}</h3>
                <p className="text-2xl font-bold text-white mt-1 group-hover:text-[#3d7fff] transition-colors">{value}</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-wider">SUPER ADMIN CONSOLE</h1>
                    <p className="text-[#6b7db3] text-sm mt-1 uppercase tracking-[2px]">Enterprise Governance & Oversight</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-[#1c243f] border border-[#2a3660] text-white text-xs font-bold rounded-lg hover:border-[#3d7fff] transition-all uppercase tracking-widest flex items-center gap-2">
                        <Settings className="w-4 h-4" /> System Setup
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Global Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Managers" value={stats.managers} icon={Users} trend="+12%" color="blue" />
                <StatCard title="Total Workforce" value={stats.employees} icon={Users} trend="+5%" color="purple" />
                <StatCard title="Active Policies" value={stats.activePolicies} icon={ShieldAlert} trend="+22%" color="emerald" />
                <StatCard title="Gross Premium" value={stats.revenue} icon={FileText} trend="+18%" color="amber" />
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-[#111629] border border-[#1e2745] rounded-3xl p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-widest">Global Activity Stream</h2>
                        <button className="text-[#3d7fff] text-xs font-bold hover:underline">View All</button>
                    </div>

                    <div className="space-y-6">
                        {[
                            { user: 'Manager Rahul', action: 'Authorized 3 new employees', time: '12 mins ago', color: 'blue' },
                            { user: 'Employee Priya', action: 'Issued Policy #5521 (Maruti Suzuki)', time: '45 mins ago', color: 'emerald' },
                            { user: 'System', action: 'Auto-archived 12 pending quotations', time: '2 hours ago', color: 'purple' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-[#0b0e1a]/50 border border-[#1e2745] hover:border-[#3d7fff]/30 transition-all">
                                <div className={`w-1 h-10 rounded-full bg-${item.color}-500`} />
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-white">{item.user}</h4>
                                    <p className="text-xs text-[#6b7db3] mt-0.5">{item.action}</p>
                                </div>
                                <div className="text-[10px] text-[#2a3660] font-bold uppercase">{item.time}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Performance Snapshot */}
                <div className="bg-[#111629] border border-[#1e2745] rounded-3xl p-8 space-y-6">
                    <h2 className="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-widest">Team Performance</h2>
                    <div className="space-y-8">
                        {[
                            { label: 'Policy Conversion', val: 78, color: 'blue' },
                            { label: 'Payment Collection', val: 92, color: 'emerald' },
                            { label: 'Quote Turnaround', val: 65, color: 'purple' },
                        ].map((bar, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
                                    <span className="text-[#6b7db3]">{bar.label}</span>
                                    <span className="text-white">{bar.val}%</span>
                                </div>
                                <div className="h-2 bg-[#0b0e1a] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-${bar.color}-500 rounded-full`}
                                        style={{ width: `${bar.val}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-[#1e2745]">
                        <button className="w-full py-4 bg-[#0d1226] border border-[#1e2745] rounded-xl text-white text-xs font-bold hover:bg-[#1c243f] transition-all uppercase tracking-[2px] flex items-center justify-center gap-2">
                            Download Audit Log <ArrowUpRight className="w-4 h-4 text-blue-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
