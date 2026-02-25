import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user) => {
    if (user) {
      try {
        const token = await user.getIdTokenResult();
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setCurrentUser({
            ...user,
            ...userData,
            role: token.claims.role || userData.role,
            employeeId: userData.employeeId
          });
        } else {
          console.warn('User document not found in Firestore');
          setCurrentUser({
            ...user,
            role: token.claims.role
          });
        }
      } catch (error) {
        console.error('Error fetching user data from Firestore:', error);
        setCurrentUser(user);
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
