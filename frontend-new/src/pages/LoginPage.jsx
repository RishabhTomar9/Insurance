import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { currentUser } = useAuth();

    React.useEffect(() => {
        if (currentUser) {
            if (currentUser.role === 'manager') navigate('/manager');
            if (currentUser.role === 'employee') navigate('/employee');
        }
    }, [currentUser, navigate]);

    const handleManagerLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/auth/set-manager-claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uid: user.uid })
            });

            if (response.ok) {
                await user.getIdToken(true);
                navigate('/manager');
            } else {
                await auth.signOut();
                setError('You are not authorized to be a manager.');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const handleEmployeeLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/employee');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-['Poppins']">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center px-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="z-10 text-white">
                    <div className="flex items-center space-x-3 mb-8">
                        <span className="text-4xl">⚡</span>
                        <h1 className="text-5xl font-bold tracking-tight">GRIVA CRM</h1>
                    </div>
                    <p className="text-xl text-slate-400 max-w-md leading-relaxed">
                        The next generation insurance management platform. Manage policies, track assets, and empower your workforce.
                    </p>
                    <div className="mt-12 flex space-x-4">
                        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">Secure</div>
                        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">Fast</div>
                        <div className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300">Reliable</div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Forms */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50">
                <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
                        <p className="mt-2 text-sm text-slate-500">Sign in to your account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Manager Login Section */}
                        <div className="pb-6 border-b border-slate-100">
                            <button
                                onClick={handleManagerLogin}
                                className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg transition-all transform hover:scale-[1.02] duration-200 shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Manager Login (Google)</span>
                            </button>
                        </div>

                        {/* Employee Login Section */}
                        <div>
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200"></span></div>
                                <div className="relative bg-white px-4 text-sm text-slate-400">Or Employee Login</div>
                            </div>
                            <form onSubmit={handleEmployeeLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="name@griva.com"
                                        value={email}
                                        name="email"
                                        autoComplete="email"
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        name="password"
                                        autoComplete="current-password"
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all text-slate-800 placeholder-slate-400"
                                    />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-200">
                                    Sign In as Employee
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <p className="mt-8 text-center text-sm text-slate-400">
                    &copy; 2026 Griva Insurance. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
