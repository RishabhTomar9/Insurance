import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { X, Car, User, Phone, Mail, Settings, Check, Loader2 } from 'lucide-react';

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
                },
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'cars', car.id || car._id), payload);
            onUpdate();
        } catch (error) {
            console.error(error);
            setError('Error updating vehicle');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white w-full h-full min-h-screen animate-fadeIn">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                            <div className="bg-indigo-50 text-indigo-600 p-3.5 rounded-2xl mr-4 shadow-sm border border-indigo-100">
                                <Car size={28} />
                            </div>
                            Edit Vehicle
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[84px] text-lg">Update vehicle information and assignments.</p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3 rounded-full transition-all border border-slate-100 hover:shadow-md group"
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-10">
                    {/* Employee Assignment (Manager Only) */}
                    {isManager && (
                        <div className="bg-indigo-50/40 p-8 rounded-3xl border border-indigo-100/50">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-white p-2.5 rounded-xl shadow-sm border border-indigo-100 text-indigo-600">
                                    <User size={24} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-lg font-bold text-indigo-900 mb-2">Assign Vehicle to Employee</label>
                                    <div className="relative group">
                                        <select
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-indigo-200 rounded-xl p-4 pl-5 text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none font-semibold"
                                        >
                                            <option value="">-- Assign to Me (Current User) --</option>
                                            {employees.map(emp => (
                                                <option key={emp.id || emp.uid} value={emp.id || emp.uid}>{emp.email} ({emp.displayName || 'No Name'})</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Vehicle Information */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3.5"></span>
                            Vehicle Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider ml-1">Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal"
                                    placeholder="e.g., MH12AB1234"
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider ml-1">Category</label>
                                <div className="relative">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold appearance-none"
                                    >
                                        <option value="Private">Private</option>
                                        <option value="Commercial">Commercial</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider ml-1">Chassis Number</label>
                                <input
                                    type="text"
                                    name="chassisNumber"
                                    value={formData.chassisNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal"
                                    placeholder="Enter Chassis No."
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider ml-1">Engine Number</label>
                                <input
                                    type="text"
                                    name="engineNumber"
                                    value={formData.engineNumber}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal"
                                    placeholder="Enter Engine No."
                                />
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider ml-1">Vehicle CC</label>
                                <input
                                    type="number"
                                    name="cc"
                                    value={formData.cc}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal"
                                    placeholder="e.g., 1200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Agent Information */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center pt-8 border-t border-slate-100">
                            <span className="w-1.5 h-8 bg-emerald-500 rounded-full mr-3.5"></span>
                            Agent Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-emerald-600 transition-colors uppercase tracking-wider ml-1">Agent Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="agentName"
                                        value={formData.agentName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold placeholder:font-normal"
                                        placeholder="Full Name"
                                    />
                                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-emerald-600 transition-colors uppercase tracking-wider ml-1">Mobile Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="agentMobile"
                                        value={formData.agentMobile}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold placeholder:font-normal"
                                        placeholder="Mobile No."
                                    />
                                    <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-bold text-slate-500 mb-2 group-focus-within:text-emerald-600 transition-colors uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="agentEmail"
                                        value={formData.agentEmail}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none font-bold placeholder:font-normal"
                                        placeholder="email@example.com"
                                    />
                                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex-1">
                            {error && <p className="text-red-600 text-sm bg-red-50 py-2.5 px-5 rounded-xl border border-red-100 font-bold inline-block">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-4 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-bold bg-white text-base"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-12 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200 transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-95 font-bold disabled:opacity-50 text-base flex items-center gap-3"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Saving Changes...</span>
                                    </>
                                ) : (
                                    <>
                                        <Check size={20} />
                                        <span>Save Update</span>
                                    </>
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
