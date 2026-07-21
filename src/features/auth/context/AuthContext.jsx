import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../../firebase/config';
import { getUserDocument, updateUserRole } from '../../../firebase/firestore';
import { loginUser, registerUser, logoutUser, resetPassword } from '../../../firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getUserDocument(user.uid);
        setUserRole(userDoc?.role || null);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // NEW: This function updates Firestore AND the local context state simultaneously
  const assignRole = async (role) => {
    if (!currentUser) throw new Error("No user logged in");
    await updateUserRole(currentUser.uid, role);
    setUserRole(role); // <--- This is the magic line that fixes the redirect!
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    resetPassword: resetPassword,
    assignRole // Expose the new function
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};