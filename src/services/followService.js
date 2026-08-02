import { collection, doc, setDoc, deleteDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { createNotification } from '@/services/notificationService';

const followsDoc = (followerId, followeeId) => doc(db, 'follows', `${followerId}_${followeeId}`);

export const followUser = async (followerId, followeeId, followerName = 'Someone') => {
  await setDoc(followsDoc(followerId, followeeId), { followerId, followeeId, createdAt: serverTimestamp() });
  if (followerId !== followeeId) {
    createNotification(followeeId, followerId, 'follow', { text: `${followerName} started following you` }).catch(() => {});
  }
};

export const unfollowUser = async (followerId, followeeId) => {
  await deleteDoc(followsDoc(followerId, followeeId));
};

// Live set of user IDs the given user is following
export const subscribeFollowing = (userId, callback) => {
  const q = query(collection(db, 'follows'), where('followerId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    callback(new Set(snapshot.docs.map((d) => d.data().followeeId)));
  });
};

// Live follower count for a professional
export const subscribeFollowerCount = (userId, callback) => {
  const q = query(collection(db, 'follows'), where('followeeId', '==', userId));
  return onSnapshot(q, (snapshot) => callback(snapshot.size));
};
