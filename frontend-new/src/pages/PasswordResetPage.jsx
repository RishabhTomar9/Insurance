import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const PasswordResetPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, refreshUserData } = useAuth();
  const { addToast } = useToast();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'warning');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      const token = await auth.currentUser.getIdToken();

      // Update the user's status in MongoDB to indicate password has been changed
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users/${currentUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ passwordChanged: true })
      });

      await refreshUserData();
      addToast('Password changed successfully!', 'success');
      navigate('/employee');
    } catch (error) {
      console.error("Reset error:", error);
      if (error.code === 'auth/requires-recent-login') {
        addToast('Please login again to change your password', 'error');
        // Optionally force logout here
      } else {
        addToast(error.message || 'Error executing password reset', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-700">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.536 9.464l-2.828 2.829-2.829-2.828 6.364-6.364 1.414 1.414m-2.828 4.242l.707-.707 3.172 3.172-.707.707M6.343 11.828l-.707.707m12.728 5.656a2 2 0 11-2.828-2.828 2 2 0 012.828 2.828z"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Setup New Password</h1>
            <p className="text-slate-400">Please choose a secure password for your account.</p>
          </div>

          <form onSubmit={handlePasswordReset} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white placeholder-slate-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white placeholder-slate-500 transition-all"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-500/25 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Processing...' : 'Set Password & Continue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;