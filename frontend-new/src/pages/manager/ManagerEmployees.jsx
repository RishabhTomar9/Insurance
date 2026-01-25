import React, { useState } from 'react';
import EmployeeList from '../../components/manager/EmployeeList';
import { auth } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';

const ManagerEmployees = () => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const { addToast } = useToast();

    const handleCreateEmployee = async (e) => {
        e.preventDefault();

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/manager/employee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email })
            });

            const data = await response.json();

            if (response.ok) {
                addToast(`Employee created! ID: ${data.employeeId}`, 'success');
                // You might ideally want to show the password in a dialog or copy it
                alert(`IMPORTANT: Default Password is ${data.defaultPassword}`);
                setName('');
                setEmail('');
                setShowCreateForm(false);
            } else {
                addToast(data.message || 'Error creating employee', 'error');
            }
        } catch (error) {
            addToast('Error creating employee', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Employee Management</h1>
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>{showCreateForm ? 'Cancel' : 'Add Employee'}</span>
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in-down">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Create New Employee Account</h3>
                    <form onSubmit={handleCreateEmployee} className="max-w-md space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                                placeholder="name@company.com"
                            />
                        </div>
                        <button type="submit" className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
                            Create Account
                        </button>
                    </form>
                </div>
            )}



            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <EmployeeList />
            </div>
        </div>
    );
};

export default ManagerEmployees;
