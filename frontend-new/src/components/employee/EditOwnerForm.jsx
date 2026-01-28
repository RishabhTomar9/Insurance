import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { X, User, Phone, MapPin, Mail, CreditCard, FileText } from 'lucide-react';

const EditOwnerForm = ({ owner, onUpdate, onCancel, employees = [], isManager = false }) => {
    const [formData, setFormData] = useState({
        ownerName: owner.name || '',
        mobileNo: owner.phone || '',
        address: owner.address || '',
        email: owner.email || '',
        aadharCard: owner.aadharCard || '',
        drivingLicense: owner.drivingLicense || '',
        employeeId: owner.employeeId || ''
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
            const backendData = {
                name: formData.ownerName,
                phone: formData.mobileNo,
                address: formData.address,
                email: formData.email,
                aadharCard: formData.aadharCard,
                drivingLicense: formData.drivingLicense,
                employeeId: formData.employeeId
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/owners/${owner._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(backendData)
            });

            if (!response.ok) throw new Error('Failed to update owner');

            onUpdate();
        } catch (error) {
            console.error(error);
            setError('Error updating owner details.');
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
                            Edit Owner Details
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[84px] text-lg">Update personal and official information.</p>
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
                                    <User className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-lg font-bold text-indigo-900 mb-2">Assign to Employee</label>
                                    <div className="relative">
                                        <select
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            className="w-full bg-white border border-indigo-200 rounded-xl p-4 pl-5 text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none font-medium"
                                        >
                                            <option value="">-- Assign to Me (Current User) --</option>
                                            {employees.map(emp => (
                                                <option key={emp.uid} value={emp.uid}>{emp.email}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-indigo-400 mt-2 text-sm ml-1">Leave blank to assign to yourself.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Personal Information */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3"></span>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Full Name</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <User className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Mobile Number</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="mobileNo"
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <Phone className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="group md:col-span-2">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Address</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <MapPin className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Email Address</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Official Documents */}
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center pt-6 border-t border-slate-100">
                            <span className="w-1.5 h-8 bg-green-500 rounded-full mr-3"></span>
                            Official Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Aadhar Card Number</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="aadharCard"
                                        value={formData.aadharCard}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <CreditCard className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-sm font-semibold text-slate-500 mb-2 group-focus-within:text-indigo-600 transition-colors uppercase tracking-wider">Driving License</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="drivingLicense"
                                        value={formData.drivingLicense}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 pl-12 text-slate-800 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none font-medium"
                                    />
                                    <FileText className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
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

export default EditOwnerForm;
