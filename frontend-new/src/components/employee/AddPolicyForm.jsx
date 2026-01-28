import React, { useState } from 'react';
import { auth } from '../../services/firebase';
import { X, FileText, Calendar, IndianRupee, Shield, Clock } from 'lucide-react';

const AddPolicyForm = ({ onAdd, onClose, cars = [], owners = [], employees = [], isManager = false }) => {
    const [formData, setFormData] = useState({
        carId: '',
        ownerId: '',
        policyType: 'Comprehensive',
        premiumAmount: '',
        policyDuration: '1 Year',
        policyStartDate: new Date().toISOString().split('T')[0],
        coverageDetails: '',
        employeeId: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const token = await auth.currentUser.getIdToken();
            const payload = {
                ...formData,
                employeeId: formData.employeeId || (auth.currentUser ? auth.currentUser.uid : '')
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/policies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Failed to create policy');

            onAdd();
            if (onClose) onClose();
        } catch (error) {
            console.error(error);
            setError('Error adding policy. Please ensure usage limits are not exceeded.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white w-full h-full min-h-screen">
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight flex items-center">
                            <span className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mr-4 shadow-sm">
                                <FileText size={28} />
                            </span>
                            Issue New Policy
                        </h2>
                        <p className="text-slate-500 mt-2 ml-[84px] text-lg">Create a new insurance policy for an existing vehicle.</p>
                    </div>
                    {onClose && (
                        <button onClick={onClose} className="bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-3 rounded-full transition-all border border-slate-100 hover:shadow-md">
                            <X size={28} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 animate-fadeIn pb-20">

                    {/* Manager Selection */}
                    {isManager && (
                        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <label className="block text-sm font-bold text-indigo-900 mb-2">Assign to Employee (Optional)</label>
                            <select
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">-- Assign to Me --</option>
                                {employees.map(e => <option key={e.uid || e._id} value={e.uid || e._id}>{e.email}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Car Linking */}
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Select Vehicle *</label>
                            <div className="relative">
                                <select name="carId" required value={formData.carId} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                                    <option value="">-- Choose Vehicle --</option>
                                    {cars.map(c => <option key={c._id} value={c._id}>{c.vehicleNumber} ({c.make} {c.model})</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* Owner Linking */}
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Select Owner *</label>
                            <div className="relative">
                                <select name="ownerId" required value={formData.ownerId} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                                    <option value="">-- Choose Owner --</option>
                                    {owners.map(o => <option key={o._id} value={o._id}>{o.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        {/* Policy Details */}
                        <div className="group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Policy Type *</label>
                            <div className="relative">
                                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select name="policyType" required value={formData.policyType} onChange={handleChange} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none">
                                    <option>Comprehensive</option>
                                    <option>Third Party Liability</option>
                                    <option>Zero Depreciation</option>
                                    <option>Own Damage</option>
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Premium Amount *</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="number" name="premiumAmount" required value={formData.premiumAmount} onChange={handleChange} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="0.00" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Duration *</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input name="policyDuration" required value={formData.policyDuration} onChange={handleChange} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 1 Year" />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Start Date *</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <input type="date" name="policyStartDate" required value={formData.policyStartDate} onChange={handleChange} className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none" />
                            </div>
                        </div>

                        <div className="md:col-span-2 group">
                            <label className="block text-sm font-bold text-slate-500 uppercase mb-2">Coverage Details</label>
                            <textarea name="coverageDetails" value={formData.coverageDetails} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none h-32" placeholder="Enter specific coverage inclusions, exclusions, or notes..." />
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex-1">
                            {error && <p className="text-red-600 bg-red-50 px-4 py-2 rounded-lg inline-block">{error}</p>}
                        </div>
                        <div className="flex justify-end space-x-6">
                            {onClose && <button type="button" onClick={onClose} className="px-8 py-3 text-slate-500 hover:bg-slate-50 rounded-xl font-bold transition-colors">Cancel</button>}
                            <button type="submit" disabled={loading} className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold transition-all transform active:scale-95 flex items-center">
                                {loading ? 'Issuing...' : 'Issue Policy'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Start of helper component
const ChevronDown = ({ size, className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
);

export default AddPolicyForm;
