import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';
import { X, User, Mail, Shield, Trash2, Check, Loader2 } from 'lucide-react';

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
            addToast('Employee updated successfully', 'success');
            onUpdate();
        } catch (error) {
            console.error(error);
            addToast('Error updating employee', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all animate-scaleUp">
                <div className="relative p-8">
                    {/* Close Button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4 bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
                            <User size={28} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit User Account</h2>
                        <p className="text-slate-500 mt-1">Update profile details and administrative roles.</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <User size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800"
                                        placeholder="email@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Account Role</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                        <Shield size={18} />
                                    </div>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-slate-800 appearance-none"
                                    >
                                        <option value="employee">Employee (Standard Access)</option>
                                        <option value="manager">Manager (Admin Access)</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                            {onDelete ? (
                                <button
                                    type="button"
                                    onClick={onDelete}
                                    className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all border border-transparent hover:border-red-100 group"
                                >
                                    <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                                    <span>Delete</span>
                                </button>
                            ) : <div></div>}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-6 py-2.5 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={18} />
                                            <span>Save Changes</span>
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
