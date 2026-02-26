import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, Car, Users, Layout, Zap } from 'lucide-react';

const EmployeeDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ cars: 0, owners: 0, policies: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser?.companyId) return;

        const employeeId = currentUser.uid;
        const companyId = currentUser.companyId;

        // Stats listeners - Added companyId filter to ensure compliance with security rules
        const carsQuery = query(
            collection(db, 'cars'),
            where('companyId', '==', companyId),
            where('employeeId', '==', employeeId)
        );

        const ownersQuery = query(
            collection(db, 'owners'),
            where('companyId', '==', companyId),
            where('employeeId', '==', employeeId)
        );

        const policiesQuery = query(
            collection(db, 'policies'),
            where('companyId', '==', companyId),
            where('employeeId', '==', employeeId)
        );

        const unsubCars = onSnapshot(carsQuery, (snap) => {
            setStats(prev => ({ ...prev, cars: snap.size }));
        });

        const unsubOwners = onSnapshot(ownersQuery, (snap) => {
            setStats(prev => ({ ...prev, owners: snap.size }));
        });

        const unsubPolicies = onSnapshot(policiesQuery, (snap) => {
            setStats(prev => ({ ...prev, policies: snap.size }));
            setLoading(false);
        });

        return () => {
            unsubCars();
            unsubOwners();
            unsubPolicies();
        };
    }, [currentUser]);


    const StatCard = ({ title, value, color, icon: Icon }) => (
        <div className="bg-[#111629] border border-[#1e2745] p-8 rounded-[32px] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all active:scale-[0.98]">
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 opacity-10 group-hover:opacity-20 transition-all ${color === 'emerald' ? 'bg-emerald-500' : color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'
                }`} />

            <div className="relative z-10 flex flex-col">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                    color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        'bg-orange-500/10 border-orange-500/20 text-orange-500'
                    }`}>
                    <Icon size={24} />
                </div>
                <div className="mt-8">
                    <h3 className="text-[10px]  text-[#2a3660] uppercase tracking-[3px] group-hover:text-white/50 transition-colors">{title}</h3>
                    <p className="mt-2 text-4xl font-bold text-white font-bold  group-hover:text-blue-400 transition-colors leading-none">{value}</p>
                </div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-[#6b7db3] font-bold uppercase tracking-widest text-sm">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white font-bold tracking-widest uppercase flex items-center gap-3">
                        <Zap className="text-blue-500 w-8 h-8 fill-blue-500/10" />
                        Employee Dashboard
                    </h1>
                    <p className="text-[#6b7db3] text-xs mt-1 font-bold uppercase tracking-[3px]">Track your performance and clients</p>
                </div>
                <div className="hidden md:flex items-center gap-3 p-1.5 bg-[#111629] border border-[#1e2745] rounded-2xl">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mx-2" />
                    <span className="text-[10px] text-white/50  uppercase tracking-widest mr-4">System Online</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="POLICIES ISSUED"
                    value={stats.policies}
                    color="emerald"
                    icon={ShieldCheck}
                />
                <StatCard
                    title="VEHICLES ADDED"
                    value={stats.cars}
                    color="blue"
                    icon={Car}
                />
                <StatCard
                    title="TOTAL CLIENTS"
                    value={stats.owners}
                    color="orange"
                    icon={Users}
                />
            </div>

            <div className="bg-[#111629] border border-[#1e2745] p-10 rounded-[40px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10 text-center max-w-xl mx-auto space-y-6">
                    <div className="w-20 h-20 bg-[#0b0e1a] border border-[#1e2745] rounded-3xl flex items-center justify-center mx-auto text-blue-500 shadow-xl self-center">
                        <Layout size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white font-bold uppercase tracking-[4px]">Quick Links</h3>
                    <p className="text-[#6b7db3] text-xs font-medium leading-relaxed uppercase tracking-[2px]">
                        Use the sidebar to manage your vehicles, owners, and policies.
                    </p>
                    <div className="pt-4 grid grid-cols-3 gap-4">
                        {['VEHICLES', 'OWNERS', 'POLICIES'].map(item => (
                            <div key={item} className="p-3 bg-[#0b0e1a] border border-[#1e2745] rounded-xl text-[9px]  text-[#2a3660] uppercase tracking-widest group-hover:border-blue-500/30 group-hover:text-blue-400 transition-all">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default EmployeeDashboard;