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

  const handleManagerLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const response = await fetch('http://localhost:3000/auth/set-manager-claim', {
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
  
  if(currentUser) {
    if(currentUser.role === 'manager') navigate('/manager');
    if(currentUser.role === 'employee') navigate('/employee');
  }

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
            <h1 style={{ marginBottom: '2rem' }}>Insurance CRM</h1>
            {error && <p style={{ color: '#e74c3c', marginBottom: '1rem' }}>{error}</p>}
            <div style={{
                display: 'flex',
                gap: '2rem'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2rem',
                    border: '1px solid #6c5ce7',
                    borderRadius: '5px',
                }}>
                    <h2>Manager Login</h2>
                    <button onClick={handleManagerLogin} style={{
                        backgroundColor: '#4285F4',
                        color: '#fff',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginTop: '1rem'
                    }}>Login with Google</button>
                </div>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '2rem',
                    border: '1px solid #6c5ce7',
                    borderRadius: '5px',
                }}>
                    <h2>Employee Login</h2>
                    <form onSubmit={handleEmployeeLogin} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '250px'
                    }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white'}}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{padding: '10px', margin: '5px 0', borderRadius: '5px', border: '1px solid #6c5ce7', backgroundColor: '#1a1a2e', color: 'white'}}
                    />
                    <button type="submit" style={{
                        backgroundColor: '#6c5ce7',
                        color: '#fff',
                        padding: '10px 15px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        marginTop: '1rem'
                    }}>Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;
