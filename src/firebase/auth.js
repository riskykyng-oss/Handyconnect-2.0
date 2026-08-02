import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './config';
import { createUserDocument, getUserDocument } from './firestore';

export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    await sendEmailVerification(userCredential.user);
    
    // Create Firestore user document
    await createUserDocument(userCredential.user.uid, {
      email,
      displayName,
      role: null, 
      createdAt: new Date(),
    });

    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const userCredential = await signInWithPopup(auth, provider);
  const existingUser = await getUserDocument(userCredential.user.uid);
  if (!existingUser) {
    await createUserDocument(userCredential.user.uid, {
      email: userCredential.user.email,
      displayName: userCredential.user.displayName || '',
      role: null,
      createdAt: new Date(),
    });
  }
  return userCredential.user;
};
