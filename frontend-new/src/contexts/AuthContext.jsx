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

  const fetchUserData = async (user) => {
    if (user) {
      const token = await user.getIdTokenResult();
      try {
        // Force token refresh to get latest claims if needed, though mostly for backend data here
        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/users/${user.uid}`, {
          headers: {
            'Authorization': `Bearer ${token.token}`
          }
        });
        if (response.ok) {
          const userData = await response.json();
          setCurrentUser({ ...user, ...userData, role: token.claims.role });
        } else {
          console.error('Failed to fetch user data');
          setCurrentUser({ ...user, role: token.claims.role });
        }
      } catch (error) {
        console.error('Error fetching user data from backend:', error);
        setCurrentUser({ ...user, role: token.claims.role });
      }
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await fetchUserData(user);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    refreshUserData: () => fetchUserData(auth.currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
