import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const ManagerDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ cars: 0, owners: 0, policies: 0, employees: 0 });

    const fetchStats = async () => {
        if (currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                const headers = { 'Authorization': `Bearer ${token}` };

                // In a real app, these should be specialized count endpoints
                const [carsRes, ownersRes, policiesRes, usersRes] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies`, { headers }),
                    fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users`, { headers }),
                ]);

                const cars = await carsRes.json();
                const owners = await ownersRes.json();
                const policies = await policiesRes.json();
                const users = await usersRes.json();

                setStats({
                    cars: cars.length || 0,
                    owners: owners.length || 0,
                    policies: policies.length || 0,
                    employees: users.length || 0
                });
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        }
    };

    useEffect(() => {
        fetchStats();
    }, [currentUser]);

    const StatCard = ({ title, value, color, icon }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
                    <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
                </div>
                <div className={`p-4 rounded-full ${color}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-emerald-500 font-medium flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                    +5.2%
                </span>
                <span className="ml-2 text-slate-400">from last month</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, here's what's happening at Griva Insurance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Employees"
                    value={stats.employees}
                    color="bg-indigo-100 text-indigo-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>}
                />
                <StatCard
                    title="Active Policies"
                    value={stats.policies}
                    color="bg-emerald-100 text-emerald-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard
                    title="Registered Cars"
                    value={stats.cars}
                    color="bg-blue-100 text-blue-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard
                    title="Client Base"
                    value={stats.owners}
                    color="bg-orange-100 text-orange-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start space-x-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500"></div>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">New Policy Created</p>
                                    <p className="text-xs text-slate-500">A new policy for Toyota Camry was created by Employee #123.</p>
                                    <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors">
                            <div className="mx-auto w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Add User</span>
                        </button>
                        <button className="p-4 bg-slate-50 hover:bg-slate-100 rounded-lg text-center transition-colors">
                            <div className="mx-auto w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full mb-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <span className="text-sm font-medium text-slate-700">Generate Report</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboard;