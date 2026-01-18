import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

const PasswordResetPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await updatePassword(auth.currentUser, newPassword);
      const token = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:3000/api/users/${currentUser.uid}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ passwordChanged: true })
      });
      navigate('/employee');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#1a1a2e',
        fontFamily: "'Poppins', sans-serif",
    }}>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#0f0f1a',
            padding: '3rem',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            color: 'white'
        }}>
            <h1 style={{ marginBottom: '2rem' }}>Reset Password</h1>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <form onSubmit={handlePasswordReset} style={{
                display: 'flex',
                flexDirection: 'column',
                width: '300px'
            }}>
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white' }}
                />
                <button type="submit" disabled={loading} style={{
                    backgroundColor: '#6c5ce7',
                    color: '#fff',
                    padding: '10px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    marginTop: '1rem'
                }}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                </button>
            </form>
        </div>
    </div>
  );
};

export default PasswordResetPage;