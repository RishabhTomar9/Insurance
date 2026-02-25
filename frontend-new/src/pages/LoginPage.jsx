import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, Building } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { currentUser } = useAuth();

    const msg = searchParams.get('msg');

    useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'super-admin') navigate('/super-admin');
            else if (currentUser.role === 'manager') navigate('/manager');
            else if (currentUser.role === 'employee') navigate('/employee');
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Redirection is handled by the useEffect above
        } catch (error) {
            console.error("Login Error:", error);
            let msg = 'Failed to sign in.';
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                msg = 'Invalid email or password.';
            } else if (error.code === 'auth/too-many-requests') {
                msg = 'Too many failed attempts. Please try again later.';
            } else {
                msg = error.message;
            }
            setError(msg);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0b0e1a] font-['DM Sans']">
            {/* Left Side - Luxury Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0d1226] to-[#0b0e1a] flex-col justify-center px-20 border-r border-[#1e2745] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px] -ml-64 -mb-64" />

                <div className="z-10 space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white font-['Rajdhani'] tracking-[4px]">GRIVA CRM v2</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            The New Standard <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">
                                in Policy Control.
                            </span>
                        </h2>
                        <p className="text-[#6b7db3] text-lg max-w-lg leading-relaxed">
                            Experience a unified ecosystem for insurance management. Secure, multi-tenant architecture designed for scale.
                        </p>
                    </div>

                    <div className="pt-8 flex gap-3">
                        {['RELIABLE', 'SECURE', 'SCALABLE'].map(item => (
                            <div key={item} className="px-4 py-2 bg-[#111629] border border-[#1e2745] rounded-xl text-[10px] text-[#6b7db3] font-bold tracking-[2px]">
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0b0e1a]">
                <div className="w-full max-w-md space-y-10">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-widest uppercase">SIGN IN</h2>
                        <p className="text-[#6b7db3] text-sm uppercase tracking-[2px]">Enter credentials to access portal</p>
                    </div>

                    {msg === 'initialized' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            <span>Initialization successful! You can now log in.</span>
                        </div>
                    )}

                    <div className="bg-[#111629] border border-[#1e2745] p-10 rounded-3xl shadow-2xl relative">
                        {error && (
                            <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl text-rose-400 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                    <input
                                        type="email"
                                        placeholder="your@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Password</label>
                                    <button type="button" onClick={() => navigate('/reset-password')} className="text-[10px] uppercase tracking-widest text-[#3d7fff] font-bold hover:underline">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660] pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2a3660] hover:text-[#3d7fff] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full group relative flex items-center justify-center py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl disabled:opacity-50"
                            >
                                {loading ? 'AUTHENTICATING...' : 'ACCESS PORTAL'}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="flex items-center justify-center gap-4 text-[#2a3660]">
                            <div className="h-px w-12 bg-[#1e2745]" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">New Company?</span>
                            <div className="h-px w-12 bg-[#1e2745]" />
                        </div>
                        <button
                            onClick={() => navigate('/register-company')}
                            className="flex items-center justify-center gap-2 mx-auto py-3 px-6 bg-[#111629] border border-[#1e2745] rounded-xl text-white text-[10px] uppercase tracking-widest font-bold hover:border-[#3d7fff] transition-all"
                        >
                            <Building className="w-4 h-4 text-[#3d7fff]" /> Register Your Business
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
