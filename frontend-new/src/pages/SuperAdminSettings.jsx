import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
    Building2, User, Mail, Phone, MapPin,
    Globe, Shield, Save, Loader2, Camera,
    CreditCard, Briefcase, ChevronRight
} from 'lucide-react';

const SuperAdminSettings = () => {
    const { currentUser, refreshUserData } = useAuth();
    const { addToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [companyData, setCompanyData] = useState({
        name: '',
        gstNumber: '',
        cinNumber: '',
        panNumber: '',
        address: '',
        industryType: '',
        contactName: '',
        contactMobile: '',
        companyEmail: ''
    });

    const [adminData, setAdminData] = useState({
        name: '',
        mobile: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser?.companyId) return;
            try {
                // Fetch Company Data
                const companyDoc = await getDoc(doc(db, 'companies', currentUser.companyId));
                if (companyDoc.exists()) {
                    setCompanyData(companyDoc.data());
                }

                // Fetch Admin Data
                setAdminData({
                    name: currentUser.name || '',
                    mobile: currentUser.mobile || ''
                });

                setLoading(false);
            } catch (error) {
                console.error(error);
                addToast('Error loading settings', 'error');
                setLoading(false);
            }
        };
        fetchData();
    }, [currentUser]);

    const handleCompanyUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateDoc(doc(db, 'companies', currentUser.companyId), {
                ...companyData,
                updatedAt: serverTimestamp()
            });
            addToast('Company data saved', 'success');
        } catch (error) {
            console.error(error);
            addToast('Failed to save company data', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAdminUpdate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await updateDoc(doc(db, 'users', currentUser.uid), {
                ...adminData,
                updatedAt: serverTimestamp()
            });
            await refreshUserData();
            addToast('Profile updated', 'success');
        } catch (error) {
            console.error(error);
            addToast('Update failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Node Data...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-20 animate-in fade-in duration-700 font-['DM Sans']">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-8 border-b border-slate-200">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight uppercase">Settings</h1>
                    <p className="text-slate-500 uppercase tracking-[3px] text-[10px] font-bold flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        Administrator node · {currentUser.companyId}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-6 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl shadow-sm">
                        <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-[2px] leading-none mb-1">Status</p>
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Active Core</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white border border-slate-100 rounded-[40px] p-10 space-y-10 relative overflow-hidden group shadow-2xl shadow-slate-200/50">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/10 transition-all" />

                        <div className="relative text-center space-y-6">
                            <div className="relative inline-block">
                                <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-indigo-500 to-blue-500 p-[1px] shadow-2xl shadow-indigo-500/20 mx-auto">
                                    <div className="w-full h-full bg-white rounded-[31px] flex items-center justify-center text-4xl font-bold text-indigo-600 uppercase">
                                        {currentUser.name?.[0] || 'A'}
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-3 bg-white hover:bg-indigo-50 text-indigo-600 rounded-2xl shadow-xl border border-slate-100 transition-all active:scale-95">
                                    <Camera size={16} />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{currentUser.name}</h3>
                                <p className="text-[10px] text-indigo-500 uppercase tracking-[2px] font-bold mt-2">Super Administrator</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdminUpdate} className="space-y-6 pt-10 border-t border-slate-50">
                            <div className="space-y-3">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Full Name</label>
                                <div className="relative border-b-2 border-slate-100 focus-within:border-indigo-500 transition-colors pb-1">
                                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="text"
                                        value={adminData.name}
                                        onChange={e => setAdminData({ ...adminData, name: e.target.value })}
                                        className="w-full bg-transparent py-2 pl-8 pr-4 text-sm text-slate-900 outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Phone Number</label>
                                <div className="relative border-b-2 border-slate-100 focus-within:border-indigo-500 transition-colors pb-1">
                                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input
                                        type="tel"
                                        value={adminData.mobile}
                                        onChange={e => setAdminData({ ...adminData, mobile: e.target.value })}
                                        className="w-full bg-transparent py-2 pl-8 pr-4 text-sm text-slate-900 outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 text-[10px] uppercase tracking-[3px] border border-indigo-500"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                                Update Profile
                            </button>
                        </form>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[40px] p-10 space-y-6 shadow-xl shadow-slate-200/50">
                        <h4 className="text-[10px] text-slate-900 font-bold uppercase tracking-[2px] flex items-center gap-3">
                            <Shield className="w-4 h-4 text-indigo-500" /> Security
                        </h4>
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white rounded-[24px] border border-slate-100 hover:border-indigo-200 transition-all group">
                                <div className="flex items-center gap-4">
                                    <Globe className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                                    <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">Public Profile</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => window.location.href = '/reset-password'}
                                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white rounded-[24px] border border-slate-100 hover:border-indigo-200 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <Shield className="w-4 h-4 text-slate-400 group-hover:text-amber-500" />
                                    <span className="text-xs text-slate-600 font-bold uppercase tracking-widest">Change Password</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Company Content */}
                <div className="lg:col-span-2 space-y-12">
                    <div className="bg-white border border-slate-100 rounded-[48px] overflow-hidden shadow-2xl shadow-slate-200/50">
                        <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                    <Building2 className="w-7 h-7 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-widest">Company Info</h2>
                            </div>
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-[2px] border border-indigo-100">Verified Node</span>
                        </div>

                        <form onSubmit={handleCompanyUpdate} className="p-12 space-y-12">
                            {/* Core Identity */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] text-indigo-500 font-bold uppercase tracking-[3px] flex items-center gap-3 border-l-4 border-indigo-500 pl-6">Legal Matrix</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Entity Registered Name</label>
                                        <input
                                            type="text"
                                            value={companyData.name}
                                            onChange={e => setCompanyData({ ...companyData, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 py-5 px-6 rounded-[24px] text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold placeholder:text-slate-200"
                                            placeholder="Company Name"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Tax ID (GST)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="text"
                                                value={companyData.gstNumber}
                                                onChange={e => setCompanyData({ ...companyData, gstNumber: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 rounded-[24px] text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Corporate ID (CIN)</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="text"
                                                value={companyData.cinNumber}
                                                onChange={e => setCompanyData({ ...companyData, cinNumber: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 rounded-[24px] text-sm text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Matrix */}
                            <div className="space-y-8">
                                <h3 className="text-[10px] text-indigo-500 font-bold uppercase tracking-[3px] flex items-center gap-3 border-l-4 border-indigo-500 pl-6">Communication Nodes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Organization Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="email"
                                                value={companyData.companyEmail}
                                                onChange={e => setCompanyData({ ...companyData, companyEmail: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 rounded-[24px] text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Support Contact</label>
                                        <div className="relative">
                                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                            <input
                                                type="tel"
                                                value={companyData.contactMobile}
                                                onChange={e => setCompanyData({ ...companyData, contactMobile: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 rounded-[24px] text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Headquarters</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-5 top-6 w-4 h-4 text-slate-300" />
                                            <textarea
                                                rows="3"
                                                value={companyData.address}
                                                onChange={e => setCompanyData({ ...companyData, address: e.target.value })}
                                                className="w-full bg-slate-50 border border-slate-200 py-5 pl-14 pr-6 rounded-[24px] text-sm text-slate-900 outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full group relative py-6 bg-indigo-600 hover:bg-slate-900 text-white font-bold rounded-[24px] transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 uppercase tracking-[4px] text-[10px] flex items-center justify-center gap-4 border border-indigo-500"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        Save All Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="p-10 bg-rose-50 border border-rose-100 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div>
                            <h4 className="text-sm font-bold text-rose-600 uppercase tracking-widest">Delete Account</h4>
                            <p className="text-[10px] text-rose-400 mt-1 uppercase font-bold tracking-wider">Irreversible node dissolution.</p>
                        </div>
                        <button className="px-8 py-4 bg-white hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 rounded-[20px] transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm active:scale-95">
                            Delete Company
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
