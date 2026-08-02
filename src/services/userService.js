import { doc, getDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const getUserProfile = async (uid) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};

export const subscribeProfessionals = (callback) => {
  const unsub = onSnapshot(
    query(collection(db, 'users'), where('role', '==', 'handyman')),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => {
      console.error('Professionals subscription error:', err);
      callback([]);
    }
  );
  return unsub;
};

export const updateUserProfile = async (uid, profileData) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, profileData);
};

export const updateUserLocation = async (uid, { lat, lng, address }) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    location: { lat, lng },
    address: address || '',
    updatedAt: new Date(),
  });
};

// Handyman requests a verified badge — reviewed by admins.
export const requestVerification = async (uid) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    verifiedRequest: 'pending',
    verifiedRequestedAt: new Date(),
  });
};
