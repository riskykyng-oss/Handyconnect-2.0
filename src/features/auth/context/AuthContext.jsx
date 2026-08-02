import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/config';
import { getUserDocument, updateUserRole } from '@/firebase/firestore';
import { loginUser, registerUser, logoutUser, resetPassword, loginWithGoogle } from '@/firebase/auth';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Firebase Auth: User logged in!");
        setCurrentUser(user);
        
        // Fetch user role, but catch errors so the app doesn't freeze
        try {
          const userDoc = await getUserDocument(user.uid);
          console.log("Firestore: User document fetched:", userDoc);
          setUserRole(userDoc?.role || null);
        } catch (error) {
          console.error("Error fetching user document. Check Firestore rules!", error);
          setUserRole(null);
        }
      } else {
        console.log("Firebase Auth: No user logged in.");
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const assignRole = async (role) => {
    if (!currentUser) throw new Error("No user logged in");
    await updateUserRole(currentUser.uid, role);
    setUserRole(role);
  };

  const value = {
    currentUser,
    userRole,
    loading,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    resetPassword: resetPassword,
    loginWithGoogle,
    assignRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};