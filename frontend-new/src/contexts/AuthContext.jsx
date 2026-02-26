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
            role: token.claims.role || userData.role || 'employee',
            companyId: userData.companyId || null
          });
        } else {
          // New user logic: document doesn't exist yet
          console.log(`Initial login for UID: ${user.uid}. Awaiting provisioning...`);
          setCurrentUser({
            ...user,
            role: token.claims.role || 'employee',
            companyId: null,
            isNewUser: true
          });
        }
      } catch (error) {
        if (error.code === 'permission-denied') {
          console.error('Core Auth: Permission Denied reading own profile. Check firestore.rules for match /users/{userId}.');
        } else {
          console.error('Core Auth Fetch Error:', error);
        }

        // Fallback to basic auth state to allow the app to boot
        setCurrentUser({
          ...user,
          role: 'employee',
          companyId: null,
          isErrorState: true,
          error: error.message
        });
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
