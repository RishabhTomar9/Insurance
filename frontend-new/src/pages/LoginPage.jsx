import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    linkWithCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, ShieldCheck, ArrowRight, Building, UserCheck, Briefcase, Link as LinkIcon } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [managerLoading, setManagerLoading] = useState(false);
    const [pendingCred, setPendingCred] = useState(null);

    const navigate = useNavigate();
    const { currentUser, refreshUserData } = useAuth();

    useEffect(() => {
        if (currentUser && !pendingCred) {
            if (currentUser.role === 'super-admin') navigate('/super-admin');
            else if (currentUser.role === 'manager') navigate('/manager');
            else if (currentUser.role === 'employee') navigate('/employee');
        }
    }, [currentUser, navigate, pendingCred]);

    const handleEmployeeLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            if (pendingCred) {
                try {
                    await linkWithCredential(userCredential.user, pendingCred);
                    setPendingCred(null);
                } catch (linkError) {
                    console.error("Link Error:", linkError);
                    setError("Failed to merge account. Access granted via password.");
                }
            }
        } catch (error) {
            console.error("Login Error:", error);
            setError('Invalid credentials.');
            setLoading(false);
        }
    };

    const handleManagerLogin = async () => {
        setError('');
        setManagerLoading(true);
        setPendingCred(null);

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user document exists
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (!userDoc.exists()) {
                // Check if they are an authorized manager
                const authSnap = await getDoc(doc(db, 'authorized_managers', user.email.toLowerCase()));
                if (authSnap.exists()) {
                    const authData = authSnap.data();
                    // Auto-provision manager document
                    await setDoc(doc(db, 'users', user.uid), {
                        uid: user.uid,
                        email: user.email,
                        name: user.displayName || 'Authorized Manager',
                        role: 'manager',
                        companyId: authData.companyId, // Assign to authorized company
                        employeeId: `MGR${Math.floor(1000 + Math.random() * 9000)}`, // Generate Manager ID
                        status: 'active',
                        createdAt: serverTimestamp(),
                        updatedAt: serverTimestamp()
                    });
                    if (refreshUserData) await refreshUserData();
                } else {
                    setError('Unauthorized manager access. Please contact your Super Admin.');
                    await auth.signOut();
                }
            }
        } catch (error) {
            console.error("Manager Login Error:", error);
            if (error.code === 'auth/account-exists-with-different-credential') {
                const credential = GoogleAuthProvider.credentialFromError(error);
                setPendingCred(credential);
                setEmail(error.customData.email || '');
                setError('Account exists. Enter password below to merge with Google.');
            } else {
                setError('Google authentication failed.');
            }
            setManagerLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[#0b0e1a] font-['DM Sans']">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0d1226] to-[#0b0e1a] flex-col justify-center px-20 border-r border-[#1e2745] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] -mr-64 -mt-64" />

                <div className="z-10 space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold text-white font-['Rajdhani'] tracking-[4px]">SHRIVA-INS</h1>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl font-bold text-white leading-tight">
                            Unified Access <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">
                                Global Workforce.
                            </span>
                        </h2>
                        <p className="text-[#6b7db3] text-lg max-w-lg leading-relaxed">
                            A secure entry point for our managers and employees. Powered by multi-tenant authentication.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[#0b0e1a]">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold text-white font-['Rajdhani'] tracking-widest uppercase">PORTAL LOGIN</h2>
                        <p className="text-[#6b7db3] text-sm uppercase tracking-[2px]">Select your access method</p>
                    </div>

                    {error && (
                        <div className={`p-4 rounded-xl text-xs text-center border ${pendingCred ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            {pendingCred && <LinkIcon className="inline-block w-3 h-3 mr-2 align-middle" />}
                            {error}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Manager Section */}
                        {!pendingCred && (
                            <div className="bg-[#111629] border border-[#1e2745] p-8 rounded-3xl shadow-xl space-y-4">
                                <div className="flex items-center gap-3 text-white mb-2">
                                    <Briefcase className="w-5 h-5 text-blue-500" />
                                    <h3 className="font-bold text-sm uppercase tracking-wider">Manager Access</h3>
                                </div>
                                <button
                                    onClick={handleManagerLogin}
                                    disabled={managerLoading}
                                    className="w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-800 font-bold rounded-xl transition-all hover:bg-slate-50 shadow-lg active:scale-95 disabled:opacity-50"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                                    <span>{managerLoading ? 'Connecting...' : 'Manager Sign In'}</span>
                                </button>
                                <p className="text-[#2a3660] text-[10px] text-center italic">One-tap access for authorized managers</p>
                            </div>
                        )}

                        {/* Divider */}
                        {!pendingCred && (
                            <div className="flex items-center gap-4 text-[#1e2745]">
                                <div className="h-px w-full bg-[#1e2745]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#2a3660]">OR</span>
                                <div className="h-px w-full bg-[#1e2745]" />
                            </div>
                        )}

                        <div className={`bg-[#111629] border rounded-3xl shadow-xl p-8 transition-all ${pendingCred ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-[#1e2745]'}`}>
                            <div className="flex items-center gap-3 text-white mb-6">
                                {pendingCred ? (
                                    <LinkIcon className="w-5 h-5 text-amber-500" />
                                ) : (
                                    <UserCheck className="w-5 h-5 text-emerald-500" />
                                )}
                                <h3 className="font-bold text-sm uppercase tracking-wider">
                                    {pendingCred ? 'Complete Link' : 'Credentials Login'}
                                </h3>
                            </div>
                            <form onSubmit={handleEmployeeLogin} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                        <input
                                            type="email"
                                            placeholder="your@email.com"
                                            value={email}
                                            disabled={!!pendingCred}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660] disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-[#6b7db3] font-bold">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3d7fff]" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0b0e1a] border border-[#1e2745] rounded-xl py-3 pl-12 pr-12 text-sm text-white focus:border-[#3d7fff] outline-none transition-all placeholder:text-[#2a3660]"
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
                                    className={`w-full flex items-center justify-center py-4 text-white font-bold rounded-xl transition-all shadow-xl disabled:opacity-50 ${pendingCred ? 'bg-amber-600 hover:bg-amber-700' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'}`}
                                >
                                    {loading ? 'PROCESSING...' : pendingCred ? 'MERGE ACCOUNTS' : 'SIGN IN'}
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </button>

                                {pendingCred && (
                                    <button
                                        type="button"
                                        onClick={() => { setPendingCred(null); setError(''); }}
                                        className="w-full text-[10px] text-[#6b7db3] uppercase tracking-widest font-bold hover:text-white mt-2"
                                    >
                                        Cancel Merging
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>

                    <div className="text-center pt-4">
                        <button
                            onClick={() => navigate('/login-superadmin')}
                            className="text-[10px] uppercase tracking-widest font-bold text-[#3d7fff] hover:underline"
                        >
                            Looking for Corporate Admin Gateway?
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
