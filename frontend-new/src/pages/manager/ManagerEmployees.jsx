import React, { useState } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth, firebaseConfig } from '../../services/firebase';

import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext'; // Added useAuth import
import EmployeeList from '../../components/manager/EmployeeList';

const ManagerEmployees = () => {
    const { currentUser } = useAuth(); // Moved useAuth call to component level
    const isSuperAdmin = currentUser?.role === 'super-admin' || currentUser?.email === 'rishabhtomar9999@gmail.com'; // Updated isSuperAdmin definition
    const [showInstructions, setShowInstructions] = useState(false);
    const [authEmail, setAuthEmail] = useState('');
    const [empName, setEmpName] = useState('');
    const [empEmail, setEmpEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const { addToast } = useToast();

    const handleAuthorizeManager = async (e) => {
        e.preventDefault();
        if (!isSuperAdmin) {
            addToast('Only Super Admin can authorize managers', 'error');
            return;
        }
        if (!authEmail) return;
        setLoading(true);

        try {
            const emailKey = authEmail.trim().toLowerCase();
            await setDoc(doc(db, 'authorized_managers', emailKey), {
                email: emailKey,
                authorizedBy: auth.currentUser.email,
                createdAt: serverTimestamp()
            });
            addToast(`Email ${emailKey} authorized as Manager`, 'success');
            setAuthEmail('');
        } catch (error) {
            console.error(error);
            addToast('Error authorizing manager', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        if (!empName || !empEmail) return;
        setCreating(true);

        if (!currentUser?.companyId) { // Added check for companyId
            addToast("Manager's company information missing.", 'error');
            setCreating(false);
            return;
        }

        // Auto-generate stable temporary password
        const tempPassword = `Griva@${Math.floor(1000 + Math.random() * 9000)}`;

        // Use a temporary app to create the user without logging out the manager
        const tempAppName = `temp-app-${Date.now()}`;
        const tempApp = initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);

        try {
            // 1. Create Auth Account
            const userCredential = await createUserWithEmailAndPassword(tempAuth, empEmail, tempPassword);
            const newUser = userCredential.user;

            // 2. Create Firestore Profile
            await setDoc(doc(db, 'users', newUser.uid), {
                uid: newUser.uid,
                name: empName,
                email: empEmail,
                role: 'employee',
                companyId: currentUser.companyId,
                employeeId: `EMP${Math.floor(1000 + Math.random() * 9000)}`,
                tempPassword: tempPassword,
                passwordChanged: false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            addToast(`Employee ${empName} created with password: ${tempPassword}`, 'success');
            setEmpName('');
            setEmpEmail('');
        } catch (error) {
            console.error("Employee Creation Error:", error);
            let message = 'Error creating employee account';

            if (error.code === 'auth/email-already-in-use') {
                message = 'This email is already registered. Use a different email or manage the existing account below.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Please enter a valid email address.';
            } else if (error.code === 'auth/weak-password') {
                message = 'The generated password was too weak. Try again.';
            }

            addToast(message, 'error');
        } finally {
            await deleteApp(tempApp);
            setCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">User & Employee Management</h1>
                    {isSuperAdmin && <p className="text-xs text-indigo-600 font-medium">Logged in as Super Admin</p>}
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium rounded-lg transition-colors flex items-center space-x-2 border border-indigo-100"
                    >
                        <i className="w-5 h-5 flex items-center justify-center font-bold">?</i>
                        <span>{showInstructions ? 'Hide Help' : 'Help'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Manager Auth + Employee Create Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Authorization Form - ONLY FOR SUPER ADMIN */}
                    {isSuperAdmin && (
                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-xl shadow-lg border border-indigo-500">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                                <span className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center mr-2 text-sm border border-white/30">SA</span>
                                Authorize New Manager
                            </h3>
                            <form onSubmit={handleAuthorizeManager} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-indigo-100 mb-1">Google Email</label>
                                    <input
                                        type="email"
                                        value={authEmail}
                                        onChange={(e) => setAuthEmail(e.target.value)}
                                        placeholder="manager@gmail.com"
                                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 focus:ring-2 focus:ring-white outline-none transition-all placeholder:text-white/40 text-white"
                                        required
                                    />
                                    <p className="mt-2 text-xs text-indigo-100/70">Managers can create employees but not other managers.</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-white text-indigo-600 font-bold py-2 rounded-lg transition-all hover:bg-indigo-50 disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'Authorize Manager'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Employee Form - FOR ALL MANAGERS */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mr-2 text-sm">EM</span>
                            Add New Employee
                        </h3>
                        <form onSubmit={handleCreateEmployee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={empName}
                                    onChange={(e) => setEmpName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={empEmail}
                                    onChange={(e) => setEmpEmail(e.target.value)}
                                    placeholder="emp@griva.com"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                    required
                                />
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-xs text-emerald-700 flex items-center leading-relaxed">
                                    <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                                    Employee will use "Employee Login" with a temporary password.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition-all shadow-lg shadow-emerald-100 disabled:opacity-50"
                            >
                                {creating ? 'Creating Account...' : 'Create Employee Account'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Instructions */}
                <div className={`${showInstructions ? 'block' : 'hidden'} lg:col-span-2 space-y-6`}>
                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200 animate-fade-in h-fit shadow-inner">
                        <h3 className="text-lg font-bold text-indigo-900 mb-3 font-['Outfit']">Access Levels</h3>
                        <div className="space-y-4">
                            {isSuperAdmin && (
                                <div className="bg-white/60 p-4 rounded-xl border border-indigo-200">
                                    <p className="text-sm font-bold text-indigo-900 mb-1 flex items-center">
                                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                        Super Admin Dashboard
                                    </p>
                                    <p className="text-xs text-indigo-800 opacity-80 leading-relaxed">
                                        You are the only person who can authorize other Managers. Be careful with authorization as Managers have full access to policy data.
                                    </p>
                                </div>
                            )}
                            <div className="bg-white/60 p-4 rounded-xl border border-emerald-100">
                                <p className="text-sm font-bold text-emerald-900 mb-1 flex items-center">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                    Manager Capabilities
                                </p>
                                <p className="text-xs text-emerald-800 opacity-80 leading-relaxed">
                                    Managers can create employee accounts, view all policies, and manage banks. They cannot promote other users to Manager status.
                                </p>
                            </div>
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-800 leading-relaxed">
                                <p className="font-bold flex items-center mb-1">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                                    Password Reset Protocol
                                </p>
                                When an employee resets their password, their **"tempPassword"** remains listed for your records until you refresh.
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <EmployeeList />
            </div>
        </div>
    );
};

export default ManagerEmployees;
