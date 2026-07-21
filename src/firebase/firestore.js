import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

// Create or overwrite a user document
export const createUserDocument = async (uid, data) => {
  const userRef = doc(db, 'users', uid);
  await setDoc(userRef, data, { merge: true });
  return userRef;
};

// Get a user document (to check their role)
export const getUserDocument = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Update user role (Client or Handyman)
export const updateUserRole = async (uid, role) => {
  const userRef = doc(db, 'users', uid);
  // setDoc with merge: true will CREATE the document if it's missing, 
  // or UPDATE it if it exists. This is much safer!
  await setDoc(userRef, { role }, { merge: true });
};