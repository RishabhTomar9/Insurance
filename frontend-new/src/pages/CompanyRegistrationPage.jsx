import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const CompanyRegistrationPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        gstNumber: '',
        cinNumber: '',
        panNumber: '',
        address: '',
        industryType: 'Insurance',
        contactName: '',
        contactMobile: '',
        companyEmail: '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Save company details to Firestore
            const docRef = await addDoc(collection(db, 'companies'), {
                ...formData,
                status: 'pending_init',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // In a real app, we would send an email. 
            // For this demo/task, we navigate directly to the init page with the new companyId.
            navigate(`/superadmin-init?companyId=${docRef.id}`);
        } catch (err) {
            console.error(err);
            setError('Failed to register company. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0b0e1a] px-4 font-['DM Sans']">
                <div className="max-w-md w-full bg-[#111629] border border-[#1e2745] p-10 rounded-2xl text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/10 rounded-full mb-4">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-wider">REGISTRATION SUCCESSFUL</h2>
                    <p className="text-[#6b7db3] text-sm leading-relaxed">
                        We've sent a verification link to <span className="text-white font-medium">{formData.companyEmail}</span>.
                        Please verify your email to initialize your Super Admin account.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all"
                    >
                        GO TO LOGIN
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0b0e1a] text-[#e2e8f8] font-['DM Sans'] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-extrabold font-['Rajdhani'] tracking-[4px] bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent uppercase">
                        Shriva-Ins CRM
                    </h1>
                    <p className="text-[#6b7db3] text-sm tracking-[2px] uppercase">Phase 0 · Company Registration</p>
                </div>

                <div className="bg-[#111629] border border-[#1e2745] rounded-3xl overflow-hidden shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-5">
                        {/* Sidebar Info */}
                        <div className="md:col-span-2 bg-[#0d1226] p-10 space-y-8 border-r border-[#1e2745]">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold font-['Rajdhani'] text-white">Why Register?</h3>
                                <div className="space-y-6">
                                    {[
                                        { title: 'Unified Management', desc: 'Centralize policies for your entire agency.' },
                                        { title: 'Role Hierarchy', desc: 'Assign Managers and Employees with ease.' },
                                        { title: 'Commission Tracking', desc: 'Automate agent payouts and reconciliations.' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-semibold text-white uppercase tracking-wider">{item.title}</h4>
                                                <p className="text-xs text-[#6b7db3] mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-8 border-t border-[#1e2745]">
                                <p className="text-xs text-[#6b7db3]">Already have a company?</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="mt-2 text-sm text-blue-400 font-bold hover:underline"
                                >
                                    Log in to your account
                                </button>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="md:col-span-3 p-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2 col-span-2 sm:col-span-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Business Name</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                            <input
                                                type="text"
                                                name="name"
                                                required
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Enter full company name"
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm focus:border-[#3d7fff] focus:ring-1 focus:ring-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">GST Number</label>
                                        <input
                                            type="text"
                                            name="gstNumber"
                                            required
                                            value={formData.gstNumber}
                                            onChange={handleChange}
                                            placeholder="GSTIN"
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 px-4 text-sm focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Industry Type</label>
                                        <select
                                            name="industryType"
                                            value={formData.industryType}
                                            onChange={handleChange}
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 px-4 text-sm focus:border-[#3d7fff] outline-none transition-all"
                                        >
                                            <option value="Insurance">Insurance Agency</option>
                                            <option value="Broking">Insurance Broking</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Registered Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-[#3d7fff]" />
                                            <textarea
                                                name="address"
                                                required
                                                rows="2"
                                                value={formData.address}
                                                onChange={handleChange}
                                                placeholder="Primary business address"
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Contact Person</label>
                                        <input
                                            type="text"
                                            name="contactName"
                                            required
                                            value={formData.contactName}
                                            onChange={handleChange}
                                            placeholder="Full Name"
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 px-4 text-sm focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Mobile</label>
                                        <input
                                            type="tel"
                                            name="contactMobile"
                                            required
                                            value={formData.contactMobile}
                                            onChange={handleChange}
                                            placeholder="10-digit number"
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 px-4 text-sm focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                        />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Official Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                            <input
                                                type="email"
                                                name="companyEmail"
                                                required
                                                value={formData.companyEmail}
                                                onChange={handleChange}
                                                placeholder="email@company.com"
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full group relative flex items-center justify-center py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50"
                                >
                                    {loading ? 'Processing...' : 'REGISTER COMPANY'}
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyRegistrationPage;
