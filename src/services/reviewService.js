import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

export const createReview = async ({ jobId, handymanId, clientId, clientName, rating, comment }) => {
  const value = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  const ref = await addDoc(collection(db, 'reviews'), {
    jobId: jobId || null,
    handymanId,
    clientId,
    clientName: clientName || 'Client',
    rating: value,
    comment: (comment || '').trim(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const subscribeToHandymanReviews = (handymanId, callback) => {
  const q = query(
    collection(db, 'reviews'),
    where('handymanId', '==', handymanId),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(
    q,
    (snap) => {
      const list = snap.docs.map((d) => {
        const data = d.data();
        return { id: d.id, ...data, createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date() };
      });
      callback(list);
    },
    () => callback([])
  );
};
