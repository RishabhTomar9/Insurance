import React, { useState, useEffect } from 'react';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, collection } from 'firebase/firestore';
import { db, auth, firebaseConfig } from '../../services/firebase';

import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import EmployeeList from '../../components/manager/EmployeeList';
import { UserPlus, ShieldAlert, Cpu, HelpCircle, Mail, User, ShieldCheck, Trash2 } from 'lucide-react';

const AuthorizedManagersList = () => {
    const [list, setList] = useState([]);
    const { currentUser } = useAuth();
    const { addToast } = useToast();

    useEffect(() => {
        if (!currentUser?.companyId) return;
        const q = query(collection(db, 'authorized_managers'), where('companyId', '==', currentUser.companyId));
        return onSnapshot(q, (snap) => {
            setList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
    }, [currentUser]);

    const removeAuth = async (email) => {
        try {
            await deleteDoc(doc(db, 'authorized_managers', email));
            addToast(`Invite removed for: ${email}`, 'info');
        } catch (e) {
            addToast('Error: Could not remove invite', 'error');
        }
    };

    if (list.length === 0) return null;

    return (
        <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-xl shadow-slate-200/50">
            <h4 className="text-[10px] text-slate-400 uppercase tracking-[2px] mb-6 font-bold">Pending Requests</h4>
            <div className="space-y-4">
                {list.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-indigo-500/20 transition-all">
                        <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.email}</p>
                            <p className="text-[9px] text-slate-400 uppercase mt-1 font-medium tracking-widest">
                                Sent: {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                            </p>
                        </div>
                        <button
                            onClick={() => removeAuth(item.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ManagerEmployees = () => {
    const { currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === 'super-admin';
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
            addToast('Access Denied', 'error');
            return;
        }
        if (!authEmail) return;
        setLoading(true);

        try {
            const emailKey = authEmail.trim().toLowerCase();
            await setDoc(doc(db, 'authorized_managers', emailKey), {
                email: emailKey,
                authorizedBy: currentUser.email,
                companyId: currentUser.companyId,
                createdAt: serverTimestamp()
            });
            addToast(`${emailKey} is now invited`, 'success');
            setAuthEmail('');
        } catch (error) {
            console.error(error);
            addToast('Request failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e) => {
        e.preventDefault();
        if (!empName || !empEmail) return;
        setCreating(true);

        if (!currentUser?.companyId) {
            addToast("Company link missing", 'error');
            setCreating(false);
            return;
        }

        const tempPassword = `Griva@${Math.floor(1000 + Math.random() * 9000)}`;
        const tempAppName = `temp-app-${Date.now()}`;
        const tempApp = initializeApp(firebaseConfig, tempAppName);
        const tempAuth = getAuth(tempApp);

        try {
            const userCredential = await createUserWithEmailAndPassword(tempAuth, empEmail, tempPassword);
            const newUser = userCredential.user;

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

            addToast(`Employee added with password: ${tempPassword}`, 'success');
            setEmpName('');
            setEmpEmail('');
        } catch (error) {
            console.error(error);
            let message = 'Creation failed';
            if (error.code === 'auth/email-already-in-use') message = 'Email already exists';
            addToast(message, 'error');
        } finally {
            await deleteApp(tempApp);
            setCreating(false);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 p-4 sm:p-0 font-['DM Sans']">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Users className="text-white w-6 h-6" />
                        </div>
                        Team Members
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm uppercase tracking-[3px] font-medium">Manage organization access & staff</p>
                </div>
                <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="flex items-center gap-3 px-6 py-3 bg-white text-slate-500 hover:text-indigo-600 border border-slate-200 rounded-2xl transition-all shadow-sm active:scale-95 group"
                >
                    <HelpCircle size={18} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{showInstructions ? 'Close Guide' : 'Open Guide'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Control Column */}
                <div className="lg:col-span-1 space-y-10">
                    {/* Manager Invite - SUPER ADMIN ONLY */}
                    {isSuperAdmin && (
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
                                <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3 tracking-widest uppercase">
                                    <ShieldAlert className="w-5 h-5 text-indigo-500" />
                                    Invite Manager
                                </h3>
                                <form onSubmit={handleAuthorizeManager} className="space-y-6">
                                    <div className="group">
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-[1px] ml-1">Official Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input
                                                type="email"
                                                value={authEmail}
                                                onChange={(e) => setAuthEmail(e.target.value)}
                                                placeholder="manager@company.com"
                                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 text-white text-[10px] py-5 rounded-2xl transition-all hover:bg-indigo-700 active:scale-[0.98] uppercase tracking-[3px] font-bold shadow-xl shadow-indigo-600/20 border border-indigo-500"
                                    >
                                        {loading ? 'Processing...' : 'Send Access Invite'}
                                    </button>
                                </form>
                            </div>

                            <AuthorizedManagersList />
                        </div>
                    )}

                    {/* Employee Form */}
                    <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />
                        <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-3 tracking-widest uppercase">
                            <UserPlus className="w-5 h-5 text-emerald-500" />
                            Add Employee
                        </h3>
                        <form onSubmit={handleCreateEmployee} className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-[1px] ml-1">Legal Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="text"
                                        value={empName}
                                        onChange={(e) => setEmpName(e.target.value)}
                                        placeholder="Full Name"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-3 tracking-[1px] ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                    <input
                                        type="email"
                                        value={empEmail}
                                        onChange={(e) => setEmpEmail(e.target.value)}
                                        placeholder="email@company.com"
                                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 italic">
                                <p className="text-[9px] text-emerald-600 font-bold tracking-widest flex items-center uppercase">
                                    <ShieldCheck className="w-4 h-4 mr-3 shrink-0" />
                                    Auto-generated temp password will be issued.
                                </p>
                            </div>
                            <button
                                type="submit"
                                disabled={creating}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] py-5 rounded-2xl transition-all shadow-xl shadow-emerald-600/10 active:scale-[0.98] uppercase tracking-[3px] font-bold border border-emerald-500"
                            >
                                {creating ? 'Processing...' : 'Register Employee'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Personnel Matrix */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Help Section */}
                    {showInstructions && (
                        <div className="bg-indigo-600 p-10 rounded-[40px] text-white shadow-2xl shadow-indigo-600/20 animate-in slide-in-from-top-6 duration-700 relative overflow-hidden">
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mb-32 blur-3xl" />
                            <h3 className="text-2xl font-bold mb-8 uppercase tracking-[4px]">Access Matrix</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                                    <p className="text-[10px] text-indigo-200 mb-3 uppercase tracking-widest font-bold">Authority (Super Admin)</p>
                                    <p className="text-xs font-bold leading-relaxed tracking-wider uppercase opacity-80">
                                        Full node control. Ability to authorize managers & dissolve records.
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10">
                                    <p className="text-[10px] text-indigo-200 mb-3 uppercase tracking-widest font-bold">Operational (Manager)</p>
                                    <p className="text-xs font-bold leading-relaxed tracking-wider uppercase opacity-80">
                                        Personnel management & data logging. Restricted from administrative nodes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white border border-slate-100 rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <div className="p-10 border-b border-slate-50 bg-slate-50/30">
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Operational Personnel</h3>
                            <p className="text-[10px] text-slate-400 uppercase tracking-[4px] mt-2 font-bold">Live Organization Matrix</p>
                        </div>
                        <div className="p-2">
                            <EmployeeList />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManagerEmployees;
