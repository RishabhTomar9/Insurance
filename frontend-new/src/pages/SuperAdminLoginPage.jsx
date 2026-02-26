import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    linkWithCredential
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, ArrowRight, Building, UserCheck, Mail, Lock, Eye, EyeOff, Link as LinkIcon } from 'lucide-react';

const SuperAdminLoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingCred, setPendingCred] = useState(null);

    const navigate = useNavigate();
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser && !pendingCred) {
            if (currentUser.role === 'super-admin') navigate('/super-admin');
            else if (currentUser.role === 'manager') navigate('/manager');
            else if (currentUser.role === 'employee') navigate('/employee');
        }
    }, [currentUser, navigate, pendingCred]);

    const handleGoogleLogin = async () => {
        setError('');
        setLoading(true);
        setPendingCred(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login Error:", error);
            if (error.code === 'auth/account-exists-with-different-credential') {
                const credential = GoogleAuthProvider.credentialFromError(error);
                setPendingCred(credential);
                setEmail(error.customData.email);
                setError('Account exists. Sign in with password below to link Google.');
            } else {
                setError('Google authentication failed.');
            }
            setLoading(false);
        }
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Merge Accounts if pending cred exists
            if (pendingCred) {
                try {
                    await linkWithCredential(userCredential.user, pendingCred);
                    console.log("Account successfully merged.");
                    setPendingCred(null);
                } catch (linkError) {
                    console.error("Link Error:", linkError);
                    setError("Failed to merge account. Access granted via password.");
                }
            }
        } catch (error) {
            setError('Invalid credentials.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0b0e1a] font-['DM Sans']">
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0d1226] to-[#0b0e1a] flex-col justify-center px-20 border-r border-[#1e2745] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -mr-64 -mt-64" />

                <div className="z-10 space-y-8 text-center lg:text-left">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white font-['Rajdhani'] tracking-[4px]">SHRIVA ADMIN</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-3xl font-bold text-white leading-tight">
                            Hybrid Security <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-400 font-['Rajdhani'] text-5xl font-extrabold tracking-wider">
                                Management Hub.
                            </span>
                        </h2>
                        <p className="text-[#6b7db3] text-lg max-w-lg leading-relaxed">
                            Full-spectrum access for company owners. Merged identity management for seamless transitions between devices.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0b0e1a]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-widest uppercase">CORPORATE ACCESS</h2>
                        <p className="text-[#6b7db3] text-sm uppercase tracking-[2px]">Super Admin Entry Terminal</p>
                    </div>

                    <div className="space-y-6">
                        {!pendingCred && (
                            <div className="bg-[#111629] border border-[#1e2745] p-8 rounded-3xl shadow-2xl text-center group hover:border-indigo-500/30 transition-all">
                                <p className="text-[#6b7db3] text-[10px] mb-6 uppercase tracking-widest font-bold">Encrypted Social Auth</p>
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-800 font-extrabold rounded-xl transition-all hover:bg-slate-50 shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    <span>{loading ? 'SPLICING...' : 'Admin Sign In with Google'}</span>
                                </button>
                            </div>
                        )}

                        {!pendingCred && (
                            <div className="flex items-center gap-4 text-[#1e2745]">
                                <div className="h-px w-full bg-gradient-to-r from-transparent to-[#1e2745]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a3660]">OS-OVERRIDE</span>
                                <div className="h-px w-full bg-gradient-to-l from-transparent to-[#1e2745]" />
                            </div>
                        )}

                        <div className={`bg-[#111629] border p-10 rounded-3xl shadow-2xl transition-all ${pendingCred ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-[#1e2745]'}`}>
                            {error && (
                                <div className={`mb-6 p-4 rounded-xl text-xs text-center border ${pendingCred ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                    {pendingCred && <LinkIcon className="inline-block w-3 h-3 mr-2 align-middle" />}
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleEmailLogin} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Admin Identifier</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                        <input
                                            type="email"
                                            placeholder="admin@shriva.com"
                                            value={email}
                                            disabled={!!pendingCred}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660] disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Master Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-12 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2a3660] hover:text-[#3d7fff]"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full flex items-center justify-center py-5 text-white font-extrabold rounded-2xl transition-all shadow-xl disabled:opacity-50 ${pendingCred ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'}`}
                                >
                                    {loading ? 'PROCESSING...' : pendingCred ? 'MERGE ACCOUNTS' : 'INITIATE CONNECTION'}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </button>

                                {pendingCred && (
                                    <button
                                        type="button"
                                        onClick={() => { setPendingCred(null); setError(''); }}
                                        className="w-full text-[10px] text-[#6b7db3] uppercase tracking-widest font-bold hover:text-white mt-4"
                                    >
                                        Cancel Merging
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-4 text-[#2a3660]">
                            <div className="h-px w-12 bg-[#1e2745]" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-[#6b7db3]">Operational Controls</span>
                            <div className="h-px w-12 bg-[#1e2745]" />
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <button
                                onClick={() => navigate('/register-company')}
                                className="flex items-center justify-center gap-2 py-4 bg-indigo-600/10 border border-indigo-500/30 rounded-xl text-indigo-400 text-[10px] uppercase tracking-widest font-bold hover:bg-indigo-600/20 transition-all"
                            >
                                <Building className="w-4 h-4" /> Initialize New Enterprise
                            </button>
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center justify-center gap-2 py-4 bg-[#111629] border border-[#1e2745] rounded-xl text-[#6b7db3] text-[10px] uppercase tracking-widest font-bold hover:text-white transition-all shadow-lg"
                            >
                                <UserCheck className="w-4 h-4" /> Switch to Global Worker Login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminLoginPage;
