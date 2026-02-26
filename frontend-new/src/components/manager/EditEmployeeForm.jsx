import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';
import { X, User, Mail, Shield, Trash2, Check, Loader2, ShieldCheck, UserCheck } from 'lucide-react';

const EditEmployeeForm = ({ employee, onUpdate, onCancel, onDelete }) => {
    const [name, setName] = useState(employee.name);
    const [email, setEmail] = useState(employee.email);
    const [role, setRole] = useState(employee.role || 'employee');
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateDoc(doc(db, 'users', employee.uid), {
                name,
                email,
                role,
                updatedAt: serverTimestamp()
            });
            addToast('Personnel credentials updated', 'success');
            onUpdate();
        } catch (error) {
            console.error(error);
            addToast('Credential update failure', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0b0e1a]/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-[#111629] border border-[#1e2745] w-full max-w-lg rounded-[32px] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.15)] animate-in zoom-in duration-300">
                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-8 right-8 p-3 bg-[#0b0e1a] text-[#6b7db3] hover:text-white rounded-xl border border-[#1e2745] hover:border-indigo-500 transition-all shadow-lg"
                    >
                        <X size={18} />
                    </button>

                    <div className="mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-[20px] mb-6 bg-[#0b0e1a] text-indigo-500 border border-[#1e2745] shadow-[0_0_20px_rgba(79,70,229,0.1)]">
                            <UserCheck size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white font-bold tracking-widest uppercase">Credential Management</h2>
                        <p className="text-[#6b7db3] text-[10px]  uppercase tracking-[3px] mt-2">Personnel Metadata & Privilege Matrix</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Assigned Identity</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2a3660] group-focus-within:text-indigo-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#0b0e1a] border border-[#1e2745] text-white text-xs font-bold rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                                        placeholder="Full Designation"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Comms Node (Email)</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2a3660] group-focus-within:text-indigo-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#0b0e1a] border border-[#1e2745] text-white text-xs font-bold rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-[#2a3660]"
                                        placeholder="node@secure.network"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px]  text-[#2a3660] uppercase tracking-[2px] ml-1">Privilege Classification</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2a3660] group-focus-within:text-indigo-500 transition-colors">
                                        <Shield size={18} />
                                    </div>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-[#0b0e1a] border border-[#1e2745] text-white text-xs font-bold rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="employee">Standard Personnel (Standard Access)</option>
                                        <option value="manager">Lead Principal (Manager Access)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#2a3660]">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 mt-4 border-t border-[#1e2745]">
                            {onDelete ? (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-rose-500/70 hover:bg-rose-500 hover:text-white rounded-xl text-[10px]  uppercase tracking-[2px] transition-all border border-rose-500/20 group"
                                >
                                    <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                                    <span>Sever Connection</span>
                                </button>
                            ) : <div></div>}

                            <div className="flex gap-4 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 sm:flex-none px-8 py-3 bg-[#0b0e1a] text-[#6b7db3] hover:text-white rounded-xl text-[10px]  uppercase tracking-[2px] transition-all border border-[#1e2745]"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-10 py-3 bg-indigo-600 text-white text-[10px]  uppercase tracking-[3px] rounded-xl shadow-lg shadow-indigo-900/10 hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} />
                                            <span>Commit Changes</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEmployeeForm;
