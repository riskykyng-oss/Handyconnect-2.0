import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const getWallet = async (uid) => {
  const snap = await getDoc(doc(db, 'wallets', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : { balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 };
};

export const subscribeToWallet = (uid, callback) => {
  return onSnapshot(doc(db, 'wallets', uid), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : { balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 });
  }, () => callback({ balance: 0, currency: 'USD', pending: 0, coupons: 0, credits: 0 }));
};

export const getTransactions = async (uid) => {
  const q = query(collection(db, 'transactions'), where('uid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
