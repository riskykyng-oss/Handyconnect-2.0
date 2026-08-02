import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const createNotification = async (toUid, fromUid, type, data = {}) => {
  const ref = await addDoc(collection(db, 'notifications'), {
    toUid, fromUid, type, data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

// Send an announcement to every registered user (MVP fan-out).
export const broadcastAnnouncement = async ({ text, title, fromUid = 'system' }) => {
  const snap = await getDocs(collection(db, 'users'));
  const uids = snap.docs.map((d) => d.id);
  const results = await Promise.allSettled(
    uids.map((uid) =>
      addDoc(collection(db, 'notifications'), {
        toUid: uid,
        fromUid,
        type: 'announcement',
        data: { text, title: title || text },
        read: false,
        createdAt: serverTimestamp(),
      })
    )
  );
  return { delivered: results.filter((r) => r.status === 'fulfilled').length, total: uids.length };
};

export const subscribeToNotifications = (uid, callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('toUid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date() }));
    callback(list);
  }, () => callback([]));
};

export const markNotificationRead = async (id) => updateDoc(doc(db, 'notifications', id), { read: true });

export const markAllNotificationsRead = async (uid) => {
  const q = query(collection(db, 'notifications'), where('toUid', '==', uid), where('read', '==', false));
  const snap = await getDocs(q);
  snap.forEach((d) => updateDoc(doc(db, 'notifications', d.id), { read: true }));
};
