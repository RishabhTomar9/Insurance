import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Plus, FileText, Users, Car, UserCheck, TrendingUp, ArrowUpRight } from 'lucide-react';

const ManagerDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ cars: 0, owners: 0, policies: 0, employees: 0 });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.companyId) return;

        const companyId = currentUser.companyId;

        // Stats listeners - filtered by companyId
        const unsubCars = onSnapshot(query(collection(db, 'cars'), where('companyId', '==', companyId)), (snap) => {
            setStats(prev => ({ ...prev, cars: snap.size }));
        });

        const unsubOwners = onSnapshot(query(collection(db, 'owners'), where('companyId', '==', companyId)), (snap) => {
            setStats(prev => ({ ...prev, owners: snap.size }));
        });

        const unsubPolicies = onSnapshot(query(collection(db, 'policies'), where('companyId', '==', companyId)), (snap) => {
            setStats(prev => ({ ...prev, policies: snap.size }));
        });

        const unsubUsers = onSnapshot(query(collection(db, 'users'), where('companyId', '==', companyId), where('role', '==', 'employee')), (snap) => {
            setStats(prev => ({ ...prev, employees: snap.size }));
        });

        // Recent Activity (Policies)
        const unsubActivity = onSnapshot(
            query(collection(db, 'policies'), where('companyId', '==', companyId), orderBy('createdAt', 'desc'), limit(5)),
            (snap) => {
                const activities = snap.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        title: 'New Policy Created',
                        desc: `Policy for ${data.insuranceCompany || 'Provider'} was issued by ${data.agentName || 'Agent'}.`,
                        time: data.createdAt?.toDate ? new Date(data.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
                    };
                });
                setRecentActivity(activities);
                setLoading(false);
            }
        );

        return () => {
            unsubCars();
            unsubOwners();
            unsubPolicies();
            unsubUsers();
            unsubActivity();
        };
    }, [currentUser]);


    const StatCard = ({ title, value, color, icon: Icon }) => (
        <div className="bg-[#111629] border border-[#1e2745] p-6 rounded-2xl hover:border-[#3d7fff]/50 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-blue-600/10 transition-all" />
            <div className="flex justify-between items-start relative z-10">
                <div className={`p-3 rounded-xl bg-${color}-500/10 border border-${color}-500/20`}>
                    <Icon className={`w-6 h-6 text-${color}-500`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    <TrendingUp className="w-3 h-3" />
                    Live
                </div>
            </div>
            <div className="mt-4 relative z-10">
                <h3 className="text-[#6b7db3] text-[10px] font-bold uppercase tracking-[2px]">{title}</h3>
                <p className="text-2xl font-bold text-white mt-1 group-hover:text-[#3d7fff] transition-colors">{value}</p>
            </div>
        </div>
    );

    if (loading && !stats.policies) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white font-bold tracking-wider uppercase">Manager Dashboard</h1>
                    <p className="text-[#6b7db3] text-xs mt-1 uppercase tracking-[2px]">Welcome Back, {currentUser?.displayName || 'Admin'}</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex-1 md:flex-none px-4 py-2 bg-[#1c243f] border border-[#2a3660] text-white text-[10px] font-bold rounded-lg hover:border-[#3d7fff] transition-all uppercase tracking-widest flex items-center justify-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-blue-500" /> View Logs
                    </button>
                    <button className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white text-[10px] font-bold rounded-lg hover:bg-blue-700 transition-all uppercase tracking-widest shadow-lg shadow-blue-500/20">
                        Add Policy
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Employees" value={stats.employees} icon={Users} color="blue" />
                <StatCard title="Total Policies" value={stats.policies} icon={FileText} color="emerald" />
                <StatCard title="Total Vehicles" value={stats.cars} icon={Car} color="purple" />
                <StatCard title="Total Clients" value={stats.owners} icon={UserCheck} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 bg-[#111629] border border-[#1e2745] rounded-3xl p-6 md:p-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white font-bold uppercase tracking-widest">Recent Activity</h2>
                        <button className="text-[#3d7fff] text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity, i) => (
                                <div key={activity.id || i} className="flex gap-4 p-4 rounded-2xl bg-[#0b0e1a]/50 border border-[#1e2745] hover:border-[#3d7fff]/30 transition-all group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                                        <FileText size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-white truncate">{activity.title}</h4>
                                        <p className="text-xs text-[#6b7db3] mt-0.5 line-clamp-1">{activity.desc}</p>
                                    </div>
                                    <div className="text-[10px] text-[#2a3660] font-bold uppercase shrink-0 pt-1">{activity.time}</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-[#2a3660] font-bold uppercase tracking-widest text-xs">
                                No recent activity found
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-[#111629] border border-[#1e2745] rounded-3xl p-6 md:p-8 space-y-6 h-fit">
                    <h2 className="text-xl font-bold text-white font-bold uppercase tracking-widest">Quick Actions</h2>
                    <div className="grid grid-cols-1 gap-3">
                        <button className="w-full flex items-center justify-between p-4 bg-[#0b0e1a] hover:bg-[#1c243f] rounded-2xl border border-[#1e2745] hover:border-blue-500/50 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <Users size={16} />
                                </div>
                                <span className="text-xs text-white font-bold uppercase tracking-wider">Add User</span>
                            </div>
                            <Plus className="w-4 h-4 text-[#6b7db3] group-hover:text-blue-500 transition-colors" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-[#0b0e1a] hover:bg-[#1c243f] rounded-2xl border border-[#1e2745] hover:border-emerald-500/50 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <FileText size={16} />
                                </div>
                                <span className="text-xs text-white font-bold uppercase tracking-wider">New Policy</span>
                            </div>
                            <Plus className="w-4 h-4 text-[#6b7db3] group-hover:text-emerald-500 transition-colors" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-[#0b0e1a] hover:bg-[#1c243f] rounded-2xl border border-[#1e2745] hover:border-purple-500/50 transition-all group" onClick={() => window.open('/manager/cars')}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                    <Car size={16} />
                                </div>
                                <span className="text-xs text-white font-bold uppercase tracking-wider">Manage Vehicles</span>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-[#6b7db3] group-hover:text-purple-500 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;
