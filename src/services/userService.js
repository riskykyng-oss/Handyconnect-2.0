import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Get a user's profile by their UID
export const getUserProfile = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

// Update a user's profile
export const updateUserProfile = async (uid, profileData) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, profileData);
};