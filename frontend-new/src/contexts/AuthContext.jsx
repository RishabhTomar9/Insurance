import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        
        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token.token}`
                }
            });
            const userData = await response.json();
            setCurrentUser({ ...user, ...userData, role: token.claims.role });
        } catch (error) {
            console.error('Error fetching user data from backend:', error);
            setCurrentUser({ ...user, role: token.claims.role }); // Fallback with only Firebase user data
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
