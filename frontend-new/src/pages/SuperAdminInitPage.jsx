import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const SuperAdminInitPage = () => {
    const [searchParams] = useSearchParams();
    const companyId = searchParams.get('companyId');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!companyId) {
            setError('Missing Company Session. Please register your company first.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // 1. Create User in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Create User Profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                role: 'super-admin',
                companyId: companyId,
                status: 'active',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            // 3. Update Company status and link admin
            await updateDoc(doc(db, 'companies', companyId), {
                status: 'active',
                superAdminId: user.uid,
                updatedAt: serverTimestamp()
            });

            navigate('/login?msg=initialized');
        } catch (err) {
            console.error(err);
            setError(err.message || 'Initialization failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e1a] flex items-center justify-center p-4 font-['DM Sans']">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mb-4 border border-blue-500/20">
                        <ShieldCheck className="w-8 h-8 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-bold text-white tracking-wider uppercase">Initialize Super Admin</h1>
                    <p className="text-[#6b7db3] text-sm uppercase tracking-widest">Phase 1 · Global Control Setup</p>
                </div>

                <div className="bg-[#111629] border border-[#1e2745] rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Super Admin Name"
                                    className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Official Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@company.com"
                                    className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Mobile Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    required
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    placeholder="Mobile"
                                    className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 px-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative flex items-center justify-center py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'ACTIVATE SUPER ADMIN'}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                </div>

                <p className="text-center text-[#6b7db3] text-[10px] tracking-widest uppercase">
                    Secured by Griva Auth Infrastructure
                </p>
            </div>
        </div>
    );
};

export default SuperAdminInitPage;
