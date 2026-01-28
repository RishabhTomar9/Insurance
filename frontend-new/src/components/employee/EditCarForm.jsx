import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { X } from 'lucide-react';

const EditCarForm = ({ car, onUpdate, onCancel, employees = [], isManager = false }) => {
    const [formData, setFormData] = useState({
        vehicleNumber: car.vehicleNumber || '',
        chassisNumber: car.chassisNumber || '',
        engineNumber: car.engineNumber || '',
        cc: car.cc || '',
        category: car.category || 'Private',
        agentName: car.agentDetails?.name || '',
        agentMobile: car.agentDetails?.mobile || '',
        agentEmail: car.agentDetails?.email || '',
        employeeId: car.employeeId || ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = await auth.currentUser.getIdToken();
            const payload = {
                vehicleNumber: formData.vehicleNumber,
                chassisNumber: formData.chassisNumber,
                engineNumber: formData.engineNumber,
                cc: formData.cc,
                category: formData.category,
                employeeId: formData.employeeId,
                agentDetails: {
                    name: formData.agentName,
                    mobile: formData.agentMobile,
                    email: formData.agentEmail
                }
            };

            await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/cars/${car._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            onUpdate();
        } catch (error) {
            setError('Error updating vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white w-full h-full min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                            <span className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4 shadow-sm">
                                <span className="text-xl">✏️</span>
                            </span>
                            Edit Vehicle
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[84px] text-lg">Update vehicle information and assignments.</p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3 rounded-full transition-all border border-slate-100 hover:shadow-md group"
                        title="Close Form"
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8 animate-fadeIn">

                    {/* Employee Assignment (Manager Only) */}
                    {isManager && (
                        <div className="bg-indigo-50/50 p-8 rounded-2xl border border-indigo-100">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-indigo-100 p-2 rounded-lg">
                                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-lg font-bold text-indigo-900 mb-2">Assign Vehicle to Employee</label>
                                    <div className="relative">
                                        <select
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-indigo-200 rounded-xl p-4 pl-5 text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none font-medium"
                                        >
                                            <option value="">-- Assign to Me (Current User) --</option>
                                            {employees.map(emp => (
                                                <option key={emp._id || emp.uid} value={emp._id || emp.uid}>{emp.email} ({emp.displayName || 'No Name'})</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Information */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3"></span>
                            Vehicle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium appearance-none"
                                    >
                                        <option value="Private">Private</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Chassis Number</label>
                                <input
                                    type="text"
                                    name="chassisNumber"
                                    value={formData.chassisNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Engine Number</label>
                                <input
                                    type="text"
                                    name="engineNumber"
                                    value={formData.engineNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Vehicle CC</label>
                                <input
                                    type="number"
                                    name="cc"
                                    value={formData.cc}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Agent Information */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center pt-6 border-t border-slate-100">
                            <span className="w-1.5 h-8 bg-green-500 rounded-full mr-3"></span>
                            Agent Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1 group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Agent Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="agentName"
                                        value={formData.agentName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                            </div>
                            <div className="md:col-span-1 group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Mobile</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="agentMobile"
                                        value={formData.agentMobile}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                </div>
                            </div>
                            <div className="md:col-span-1 group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="agentEmail"
                                        value={formData.agentEmail}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex-1">
                            {error && <p className="text-red-600 text-sm bg-red-50 py-2 px-4 rounded-lg border border-red-100 font-medium inline-block">{error}</p>}
                        </div>
                        <div className="flex justify-end space-x-6">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-4 rounded-xl border-2 border-slate-100 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors font-bold bg-white text-lg"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 font-bold disabled:opacity-50 text-lg flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Updating...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );


};

export default EditCarForm;
