import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { X, User, Phone, MapPin, Mail, CreditCard, FileText } from 'lucide-react';

const AddOwnerForm = ({ onAdd, onCancel, employees = [], isManager = false }) => {
    const [formData, setFormData] = useState({
        ownerName: '',
        mobileNo: '',
        address: '',
        email: '',
        aadharCard: '',
        drivingLicense: '',
        employeeId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) throw new Error('Not authenticated');

            // Find current user's profile for companyId
            const userDocSnap = await getDoc(doc(db, 'users', user.uid));
            const companyId = userDocSnap.exists() ? userDocSnap.data().companyId : null;

            if (!companyId) throw new Error('Company ID not found. Please re-login.');

            const payload = {
                name: formData.ownerName,
                phone: formData.mobileNo,
                address: formData.address,
                email: formData.email,
                aadharCard: formData.aadharCard,
                drivingLicense: formData.drivingLicense,
                employeeId: formData.employeeId || user.uid,
                companyId: companyId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, 'owners'), payload);
            onAdd();
        } catch (error) {
            console.error(error);
            setError('Error adding owner. Please try again.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-[#0b0e1a] w-full h-full min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#1e2745]">
                    <div>
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center">
                            <span className="bg-indigo-600/10 text-indigo-500 p-3 rounded-xl mr-4 border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                                <User size={24} />
                            </span>
                            Add New Owner
                        </h2>
                        <p className="text-[#6b7db3] mt-2 ml-[84px] text-lg uppercase tracking-[2px]">Enter owner details and assign management.</p>
                    </div>

                    <button
                        onClick={onCancel}
                        className="bg-[#111629] text-[#6b7db3] hover:text-white hover:bg-[#1c243f] p-3 rounded-xl transition-all border border-[#1e2745] hover:border-indigo-500/50 hover:shadow-lg group shadow-xl"
                        title="Close"
                    >
                        <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn">
                    {/* Employee Assignment (Manager Only) */}
                    {isManager && (
                        <div className="bg-indigo-600/5 p-8 rounded-2xl border border-indigo-500/20">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 bg-indigo-600/10 p-2.5 rounded-xl border border-indigo-500/20 text-indigo-500">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-lg font-bold text-white mb-2">Assign to Employee</label>
                                    <div className="relative group">
                                        <select
                                            name="employeeId"
                                            value={formData.employeeId}
                                            onChange={handleChange}
                                            className="w-full bg-[#111629] border border-[#1e2745] text-white rounded-xl p-4 pl-5 focus:border-indigo-500 transition-all outline-none appearance-none font-bold"
                                        >
                                            <option value="">-- Assign to Me --</option>
                                            {employees.map(emp => (
                                                <option key={emp.id || emp.uid} value={emp.id || emp.uid}>{emp.email}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#2a3660] group-focus-within:text-indigo-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    <p className="text-[#6b7db3] mt-2 text-sm ml-1 uppercase tracking-widest">Leave blank to assign to yourself.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Owner Information */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                            <span className="w-1.5 h-8 bg-indigo-600 rounded-full mr-3 shadow-[0_0_15px_rgba(79,70,229,0.4)]"></span>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="contact-input-group group">
                                <label className="block text-[10px] font-bold text-[#2a3660] mb-2 group-focus-within:text-indigo-500 transition-colors uppercase tracking-[2px] ml-1">Full Name *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="ownerName"
                                        required
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        className="w-full bg-[#111629] border border-[#1e2745] rounded-xl p-4 pl-12 text-white focus:bg-[#0b0e1a] focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal placeholder:text-[#2a3660]"
                                        placeholder="Full Name"
                                    />
                                    <User className="w-5 h-5 text-[#2a3660] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                            </div>

                            <div className="contact-input-group group">
                                <label className="block text-[10px] font-bold text-[#2a3660] mb-2 group-focus-within:text-indigo-500 transition-colors uppercase tracking-[2px] ml-1">Mobile Number *</label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        name="mobileNo"
                                        required
                                        value={formData.mobileNo}
                                        onChange={handleChange}
                                        className="w-full bg-[#111629] border border-[#1e2745] rounded-xl p-4 pl-12 text-white focus:bg-[#0b0e1a] focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal placeholder:text-[#2a3660]"
                                        placeholder="10-digit number"
                                    />
                                    <Phone className="w-5 h-5 text-[#2a3660] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                            </div>

                            <div className="contact-input-group group md:col-span-2">
                                <label className="block text-[10px] font-bold text-[#2a3660] mb-2 group-focus-within:text-indigo-500 transition-colors uppercase tracking-[2px] ml-1">Address *</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full bg-[#111629] border border-[#1e2745] rounded-xl p-4 pl-12 text-white focus:bg-[#0b0e1a] focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal placeholder:text-[#2a3660]"
                                        placeholder="Residential address"
                                    />
                                    <MapPin className="w-5 h-5 text-[#2a3660] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                            </div>

                            <div className="contact-input-group group">
                                <label className="block text-[10px] font-bold text-[#2a3660] mb-2 group-focus-within:text-indigo-500 transition-colors uppercase tracking-[2px] ml-1">Email Address *</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-[#111629] border border-[#1e2745] rounded-xl p-4 pl-12 text-white focus:bg-[#0b0e1a] focus:border-indigo-500 transition-all outline-none font-bold placeholder:font-normal placeholder:text-[#2a3660]"
                                        placeholder="email@example.com"
                                    />
                                    <Mail className="w-5 h-5 text-[#2a3660] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Official Documents */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center pt-8 border-t border-[#1e2745]">
                            <span className="w-1.5 h-8 bg-emerald-500 rounded-full mr-3 shadow-[0_0_15px_rgba(16,185,129,0.4)]"></span>
                            Official Documents
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="contact-input-group group">
                                <label className="block text-[10px] font-bold text-[#2a3660] mb-2 group-focus-within:text-emerald-500 transition-colors uppercase tracking-[2px] ml-1">Aadhar Card</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="aadharCard"
                                        value={formData.aadharCard}
                                        onChange={handleChange}
                                        className="w-full bg-[#111629] border border-[#1e2745] rounded-xl p-4 pl-12 text-white focus:bg-[#0b0e1a] focus:border-emerald-500 transition-all outline-none font-bold placeholder:font-normal placeholder:text-[#2a3660]"
                                        placeholder="12-digit number"
                                    />
                                    <CreditCard className="w-5 h-5 text-[#2a3660] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                            </div>

                            <div className="contact-input-group group">
                                <label className="block text-[10px] font-bold text-[#2a3660] mb-2 group-focus-within:text-emerald-500 transition-colors uppercase tracking-[2px] ml-1">Driving License</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="drivingLicense"
                                        value={formData.drivingLicense}
                                        onChange={handleChange}
                                        className="w-full bg-[#111629] border border-[#1e2745] rounded-xl p-4 pl-12 text-white focus:bg-[#0b0e1a] focus:border-emerald-500 transition-all outline-none font-bold placeholder:font-normal placeholder:text-[#2a3660]"
                                        placeholder="License number"
                                    />
                                    <FileText className="w-5 h-5 text-[#2a3660] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-emerald-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10 border-t border-[#1e2745] flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex-1 w-full sm:w-auto">
                            {error && <p className="text-rose-500 text-xs bg-rose-500/10 py-3 px-5 rounded-xl border border-rose-500/20 font-bold uppercase tracking-widest inline-block w-full sm:w-auto text-center">{error}</p>}
                        </div>
                        <div className="flex justify-end gap-4 w-full sm:w-auto">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex-1 sm:flex-none px-8 py-4 rounded-xl bg-[#0b0e1a] text-[#6b7db3] hover:text-white border border-[#1e2745] hover:border-[#3d7fff] hover:bg-[#1c243f] transition-all font-bold uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 sm:flex-none px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-900/20 active:scale-95 transition-all font-bold disabled:opacity-50 text-xs uppercase tracking-[2px] flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    'Save Owner'
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOwnerForm;
