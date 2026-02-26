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

                // Fetch Admin Data (already in currentUser but let's be fresh)
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
            addToast('Company details updated', 'success');
        } catch (error) {
            console.error(error);
            addToast('Failed to update company', 'error');
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
            addToast('Profile updated successfully', 'success');
        } catch (error) {
            console.error(error);
            addToast('Failed to update profile', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-[#6b7db3] font-['Rajdhani'] uppercase tracking-widest text-sm">Synchronizing Secure Vault...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1e2745]">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold text-white font-['Rajdhani'] tracking-wider uppercase">Enterprise Control Tower</h1>
                    <p className="text-[#6b7db3] uppercase tracking-[3px] text-xs font-bold flex items-center gap-2">
                        <Shield className="w-3 h-3 text-emerald-500" /> Administrative Hub · {currentUser.companyId}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none">Status</p>
                        <p className="text-xs text-white font-bold uppercase tracking-widest mt-1">Global Active</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#111629] border border-[#1e2745] rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-all" />

                        <div className="relative text-center space-y-4">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 p-[1px] shadow-2xl shadow-blue-500/20 mx-auto">
                                    <div className="w-full h-full bg-[#0b0e1a] rounded-[23px] flex items-center justify-center text-3xl font-bold text-white uppercase font-['Rajdhani']">
                                        {currentUser.name?.[0] || 'A'}
                                    </div>
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-[#1e2745] hover:bg-[#2a3660] text-blue-400 rounded-xl border border-[#2a3660] transition-all">
                                    <Camera size={14} />
                                </button>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white font-['Rajdhani'] tracking-wide">{currentUser.name}</h3>
                                <p className="text-xs text-[#6b7db3] uppercase tracking-widest mt-1">Chief Enterprise Officer</p>
                            </div>
                        </div>

                        <form onSubmit={handleAdminUpdate} className="space-y-4 pt-4 border-t border-[#1e2745]">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest ml-1">Display Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                    <input
                                        type="text"
                                        value={adminData.name}
                                        onChange={e => setAdminData({ ...adminData, name: e.target.value })}
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] py-3 pl-10 pr-4 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest ml-1">Direct Line</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                    <input
                                        type="tel"
                                        value={adminData.mobile}
                                        onChange={e => setAdminData({ ...adminData, mobile: e.target.value })}
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] py-3 pl-10 pr-4 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all font-mono"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/10 active:scale-95 text-xs uppercase tracking-widest"
                            >
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={14} />}
                                Update Identity
                            </button>
                        </form>
                    </div>

                    <div className="bg-[#0d1226]/50 border border-[#1e2745] rounded-3xl p-6 space-y-4">
                        <h4 className="text-[10px] text-white font-bold uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3 h-3 text-blue-500" /> Security Manifest
                        </h4>
                        <div className="space-y-2">
                            <button className="w-full flex items-center justify-between p-4 bg-[#111629] hover:bg-[#1a2038] rounded-2xl border border-[#1e2745] transition-all group">
                                <div className="flex items-center gap-3">
                                    <Globe className="w-4 h-4 text-[#6b7db3]" />
                                    <span className="text-xs text-white font-bold uppercase tracking-wider">Public Profile</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#6b7db3] group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => window.location.href = '/reset-password'}
                                className="w-full flex items-center justify-between p-4 bg-[#111629] hover:bg-[#1a2038] rounded-2xl border border-[#1e2745] transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="w-4 h-4 text-[#6b7db3]" />
                                    <span className="text-xs text-white font-bold uppercase tracking-wider">Change Access Key</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-[#6b7db3] group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Company Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#111629] border border-[#1e2745] rounded-3xl overflow-hidden shadow-xl">
                        <div className="p-8 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 border-b border-[#1e2745] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center border border-blue-400/20">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-white font-['Rajdhani'] uppercase tracking-wider">Enterprise DNA</h2>
                            </div>
                            <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-[2px]">Verified</span>
                        </div>

                        <form onSubmit={handleCompanyUpdate} className="p-10 space-y-10">
                            {/* Core Identity */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-2 border-l-2 border-blue-500 pl-4">Legal Foundation</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest">Business Legal Name</label>
                                        <input
                                            type="text"
                                            value={companyData.name}
                                            onChange={e => setCompanyData({ ...companyData, name: e.target.value })}
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] py-4 px-5 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all font-bold placeholder:text-white/10"
                                            placeholder="Full Enterprise Title"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest">Tax Identification (GST)</label>
                                        <div className="relative">
                                            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]/50" />
                                            <input
                                                type="text"
                                                value={companyData.gstNumber}
                                                onChange={e => setCompanyData({ ...companyData, gstNumber: e.target.value })}
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] py-4 pl-12 pr-5 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest">Corporate ID (CIN)</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]/50" />
                                            <input
                                                type="text"
                                                value={companyData.cinNumber}
                                                onChange={e => setCompanyData({ ...companyData, cinNumber: e.target.value })}
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] py-4 pl-12 pr-5 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Matrix */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] text-blue-500 font-bold uppercase tracking-widest flex items-center gap-2 border-l-2 border-blue-500 pl-4">Communication Core</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest">Enterprise Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]/50" />
                                            <input
                                                type="email"
                                                value={companyData.companyEmail}
                                                onChange={e => setCompanyData({ ...companyData, companyEmail: e.target.value })}
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] py-4 pl-12 pr-5 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest">Support Line</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]/50" />
                                            <input
                                                type="tel"
                                                value={companyData.contactMobile}
                                                onChange={e => setCompanyData({ ...companyData, contactMobile: e.target.value })}
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] py-4 pl-12 pr-5 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] text-[#6b7db3] font-bold uppercase tracking-widest">Global Headquarters</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-[#3d7fff]/50" />
                                            <textarea
                                                rows="3"
                                                value={companyData.address}
                                                onChange={e => setCompanyData({ ...companyData, address: e.target.value })}
                                                className="w-full bg-[#0b0e1a] border border-[#1e2745] py-4 pl-12 pr-5 rounded-2xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full group relative py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-blue-500/10 active:scale-[0.98] uppercase tracking-[4px] text-xs flex items-center justify-center gap-4 border border-blue-400/20"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                        Commit Enterprise Changes
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-3xl flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-bold text-rose-500 uppercase tracking-widest">Danger Protocol</h4>
                            <p className="text-xs text-[#6b7db3] mt-1">Permanently dissolve enterprise data and revoke all access.</p>
                        </div>
                        <button className="px-6 py-3 bg-[#111629] hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest">
                            Initialize Termination
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
