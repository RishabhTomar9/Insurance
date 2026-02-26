import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { LayoutDashboard, Users, ShieldAlert, FileText, Settings, ArrowUpRight, TrendingUp, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const SuperAdminDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({
        managers: 0,
        employees: 0,
        activePolicies: 0,
        revenue: '₹0'
    });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    useEffect(() => {
        if (!currentUser?.companyId) return;

        const companyId = currentUser.companyId;

        // Managers Count
        const unsubManagers = onSnapshot(
            query(collection(db, 'users'), where('companyId', '==', companyId), where('role', '==', 'manager')),
            (snap) => setStats(prev => ({ ...prev, managers: snap.size }))
        );

        // Workforce Count (Total users in company except managers and super-admin)
        const unsubWorkforce = onSnapshot(
            query(collection(db, 'users'), where('companyId', '==', companyId), where('role', '==', 'employee')),
            (snap) => setStats(prev => ({ ...prev, employees: snap.size }))
        );

        // Active Policies & Revenue
        const unsubPolicies = onSnapshot(
            query(collection(db, 'policies'), where('companyId', '==', companyId)),
            (snap) => {
                const policiesCount = snap.size;
                const totalRevenue = snap.docs.reduce((acc, doc) => {
                    const data = doc.data();
                    return acc + (parseFloat(data.finalPremium) || parseFloat(data.premiumAmount) || 0);
                }, 0);

                setStats(prev => ({
                    ...prev,
                    activePolicies: policiesCount,
                    revenue: formatCurrency(totalRevenue)
                }));
            }
        );

        // Recent Activity (Policies)
        const unsubActivity = onSnapshot(
            query(collection(db, 'policies'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'), limit(5)),
            (snap) => {
                const activities = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        user: data.agentName || 'System',
                        action: `Policy Issued for ${data.insuranceCompany || 'Provider'}`,
                        time: data.createdAt?.toDate ? new Date(data.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                        color: 'indigo'
                    };
                });
                setRecentActivities(activities);
                setLoading(false);
            }
        );

        return () => {
            unsubManagers();
            unsubWorkforce();
            unsubPolicies();
            unsubActivity();
        };
    }, [currentUser]);

    const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
        <div className="bg-white border border-slate-100 p-8 rounded-[32px] hover:border-indigo-500/20 transition-all group shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-full -mr-8 -mt-8`} />
            <div className="flex justify-between items-start relative z-10">
                <div className={`p-4 rounded-2xl bg-${colorClass}-50 border border-${colorClass}-100 shadow-sm`}>
                    <Icon className={`w-6 h-6 text-${colorClass}-600`} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-100 italic">
                        <TrendingUp className="w-3 h-3" />
                        {trend}
                    </div>
                )}
            </div>
            <div className="mt-8 relative z-10">
                <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[2px]">{title}</h3>
                <p className="text-3xl font-bold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors tracking-tight">{value}</p>
            </div>
        </div>
    );

    if (loading && !stats.revenue) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Data Matrix...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 font-['DM Sans']">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">DASHBOARD</h1>
                    <p className="text-slate-500 text-sm mt-1 uppercase tracking-[3px] font-medium italic">Global Command & Operations</p>
                </div>
                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-2xl hover:border-indigo-600/50 hover:text-indigo-600 transition-all uppercase tracking-widest flex items-center gap-3 shadow-sm active:scale-95 group">
                        <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" /> Settings
                    </button>
                    <button className="px-6 py-3 bg-indigo-600 text-white text-[10px] font-bold rounded-2xl hover:bg-indigo-700 transition-all uppercase tracking-[2px] shadow-lg shadow-indigo-600/20 active:scale-95 border border-indigo-500">
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="Team Managers" value={stats.managers} icon={Users} colorClass="indigo" trend="+2 New" />
                <StatCard title="Total Employees" value={stats.employees} icon={Users} colorClass="blue" />
                <StatCard title="Active Policies" value={stats.activePolicies} icon={ShieldAlert} colorClass="emerald" trend="98% Success" />
                <StatCard title="Total Revenue" value={stats.revenue} icon={FileText} colorClass="amber" />
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Recent Activities */}
                <div className="lg:col-span-2 bg-white border border-slate-100 rounded-[40px] p-10 space-y-8 shadow-2xl shadow-slate-200/50">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest flex items-center">
                            <ArrowRight className="mr-3 text-indigo-600 w-5 h-5" /> Recent Operations
                        </h2>
                        <button className="text-indigo-600 text-[10px] font-bold hover:underline uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">View History</button>
                    </div>

                    <div className="space-y-6">
                        {recentActivities.length > 0 ? (
                            recentActivities.map((item, i) => (
                                <div key={item.id || i} className="flex gap-5 p-6 rounded-3xl bg-slate-50/50 border border-slate-100 hover:border-indigo-500/20 hover:bg-white hover:shadow-xl transition-all group">
                                    <div className={`w-1.5 h-12 rounded-full bg-indigo-600 shadow-lg shadow-indigo-600/20`} />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">{item.user}</h4>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">{item.action}</p>
                                    </div>
                                    <div className="text-[10px] text-slate-300 font-bold uppercase tracking-widest self-center">{item.time}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-20 bg-slate-50/50 rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-[4px] text-xs">Awaiting Activity Logs...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Performance Snapshot */}
                <div className="bg-white border border-slate-100 rounded-[40px] p-10 space-y-10 shadow-2xl shadow-slate-200/50">
                    <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-6">System Nodes</h2>
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100 group hover:border-indigo-500/20 transition-all">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Node Company ID</p>
                            <p className="text-sm text-slate-900 font-bold uppercase truncate tracking-wide">{currentUser?.companyId}</p>
                        </div>
                        <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/50 group hover:bg-indigo-50 transition-all">
                            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-2">Access Authority</p>
                            <p className="text-sm text-indigo-600 font-bold uppercase tracking-[2px]">{currentUser?.role?.replace('-', ' ')}</p>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-100">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Last Cache Update</p>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3 text-slate-300" />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{new Date().toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-50">
                        <button className="w-full py-5 bg-slate-900 text-white rounded-[24px] text-[10px] font-bold hover:bg-indigo-600 transition-all uppercase tracking-[3px] flex items-center justify-center gap-3 shadow-xl active:scale-95 group">
                            Archival Report <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
