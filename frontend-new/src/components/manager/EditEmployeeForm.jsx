import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { useToast } from '../../contexts/ToastContext';

const EditEmployeeForm = ({ employee, onUpdate, onCancel }) => {
    const [name, setName] = useState(employee.name);
    const [email, setEmail] = useState(employee.email);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/manager/employee/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ uid: employee.uid, name, email })
            });

            if (response.ok) {
                addToast('Employee updated successfully', 'success');
                onUpdate();
            } else {
                const data = await response.json();
                addToast(data.message || 'Error updating employee', 'error');
            }
        } catch (error) {
            addToast('Error updating employee', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-scale-in">
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 bg-indigo-100 text-indigo-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">Edit Employee</h2>
                        <p className="text-slate-500 text-sm">Update account details for this user</p>
                    </div>

                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="Employee Name"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                placeholder="email@company.com"
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditEmployeeForm;
