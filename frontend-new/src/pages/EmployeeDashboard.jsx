import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
// Reusing our standardized components for consistent UI since functionality is identical
import ManagerCars from './manager/ManagerCars';
import ManagerOwners from './manager/ManagerOwners';
import ManagerPolicies from './manager/ManagerPolicies';

const EmployeeDashboard = () => {
    const { currentUser } = useAuth();
    const [stats, setStats] = useState({ cars: 0, owners: 0, policies: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            if (currentUser) {
                try {
                    const token = await auth.currentUser.getIdToken();
                    const headers = { 'Authorization': `Bearer ${token}` };

                    const [carsRes, ownersRes, policiesRes] = await Promise.all([
                        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars`, { headers }),
                        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners`, { headers }),
                        fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies`, { headers })
                    ]);

                    const cars = await carsRes.json();
                    const owners = await ownersRes.json();
                    const policies = await policiesRes.json();

                    setStats({
                        cars: cars.length || 0,
                        owners: owners.length || 0,
                        policies: policies.length || 0
                    });
                } catch (e) { console.error(e); }
            }
        };
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
        </div>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">My Dashboard</h1>
                <p className="text-slate-500">Track your performance and manage client portfolios.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="My Policies Sold"
                    value={stats.policies}
                    color="bg-emerald-100 text-emerald-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard
                    title="Vehicles Registered"
                    value={stats.cars}
                    color="bg-blue-100 text-blue-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>}
                />
                <StatCard
                    title="Clients Managed"
                    value={stats.owners}
                    color="bg-orange-100 text-orange-600"
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>}
                />
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
                <h3 className="text-lg font-medium text-slate-800 mb-2">Platform Navigation</h3>
                <p className="text-slate-500">Use the sidebar to navigate between Cars, Owners, and Policies management.</p>
            </div>
        </div>
    );
};

export default EmployeeDashboard;