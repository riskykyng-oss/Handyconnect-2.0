import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  where, getDocs, updateDoc, doc, arrayUnion, setDoc, getDoc, limit,
  arrayRemove, deleteField,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

/* ─── CONVERSATIONS ─── */

export const createConversation = async (jobId, clientId, handymanId, jobTitle) => {
  const participants = [clientId, handymanId].filter(Boolean);
  if (participants.length < 2) return null;

  const q = query(
    collection(db, 'conversations'),
    where('jobId', '==', jobId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const ref = await addDoc(collection(db, 'conversations'), {
    participants,
    jobId,
    jobTitle: jobTitle || 'Untitled job',
    lastMessage: null,
    unreadCount: Object.fromEntries(participants.map((u) => [u, 0])),
    lastActivity: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const subscribeToConversations = (uid, callback) => {
  const q = query(
    collection(db, 'conversations'),
    where('participants', 'array-contains', uid),
    orderBy('lastActivity', 'desc')
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(list);
  }, (err) => {
    console.error('Conversations subscription error:', err);
    callback([]);
  });
};

// Direct (person-to-person) conversations. One per user pair, found by directKey.
export const createDirectConversation = async (aId, bId, { aName, aAvatar, bName, bAvatar, bTrade } = {}) => {
  const participants = [aId, bId].filter(Boolean);
  if (participants.length < 2) return null;
  const directKey = [...participants].sort().join('_');

  const q = query(collection(db, 'conversations'), where('directKey', '==', directKey), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const participantInfo = {
    [aId]: { name: aName || null, avatar: aAvatar || null, trade: null },
    [bId]: { name: bName || null, avatar: bAvatar || null, trade: bTrade || null },
  };

  const ref = await addDoc(collection(db, 'conversations'), {
    type: 'direct',
    directKey,
    participants,
    participantInfo,
    lastMessage: null,
    unreadCount: Object.fromEntries(participants.map((u) => [u, 0])),
    lastActivity: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

// Messages live under jobs/{jobId}/messages (job chats) or conversations/{id}/messages (direct).
const messagesCol = (conv) =>
  conv?.type === 'direct'
    ? collection(db, 'conversations', conv.id, 'messages')
    : collection(db, 'jobs', conv.jobId, 'messages');

// Hide a conversation from the current user's list (removes them as a participant).
export const deleteConversation = async (convId, uid) => {
  const convRef = doc(db, 'conversations', convId);
  await updateDoc(convRef, {
    participants: arrayRemove(uid),
    [`participantInfo.${uid}`]: deleteField(),
    [`unreadCount.${uid}`]: deleteField(),
  });
};

// Batch-fetch public profiles for a list of uids (e.g. suggested contacts column).
export const listProfessionals = async (uids) => {
  if (!uids?.length) return [];
  const results = [];
  for (const uid of uids) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) results.push({ id: uid, ...snap.data() });
    } catch { /* skip missing */ }
  }
  return results;
};

/* ─── MESSAGES ─── */

export const sendMessage = async (conv, senderId, senderName, text, options = {}) => {
  const msg = {
    text: text || '',
    senderId,
    senderName,
    ...options,
    read: false,
    delivered: true,
    createdAt: serverTimestamp(),
  };
  const msgRef = await addDoc(messagesCol(conv), msg);

  if (conv?.id) {
    const convRef = doc(db, 'conversations', conv.id);
    const convSnap = await getDoc(convRef);
    const data = convSnap.data();
    if (data) {
      const newCounts = {};
      Object.keys(data.unreadCount).forEach((uid) => {
        newCounts[uid] = uid === senderId ? 0 : (data.unreadCount[uid] || 0) + 1;
      });
      await updateDoc(convRef, {
        lastMessage: { text: text || (options.type || 'media'), senderId, senderName, createdAt: serverTimestamp() },
        lastActivity: serverTimestamp(),
        unreadCount: newCounts,
      });
    }
  }
  return msgRef.id;
};

export const subscribeToMessages = (conv, callback) => {
  const q = query(messagesCol(conv), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date() })));
  }, (err) => {
    console.error('Messages subscription error:', err);
    callback([]);
  });
};

export const markMessagesAsRead = async (conv, currentUserId) => {
  const q = query(
    messagesCol(conv),
    where('senderId', '!=', currentUserId),
    where('read', '==', false)
  );
  const snap = await getDocs(q);
  snap.forEach(async (document) => {
    await updateDoc(doc(messagesCol(conv), document.id), { read: true });
  });
  if (conv?.id) {
    const convRef = doc(db, 'conversations', conv.id);
    await updateDoc(convRef, { [`unreadCount.${currentUserId}`]: 0 });
  }
};

export const reactToMessage = async (jobId, messageId, emoji) =>
  updateDoc(doc(db, 'jobs', jobId, 'messages', messageId), { reactions: arrayUnion(emoji) });

/* ─── CALL SIGNALING (Firestore-based for MVP) ─── */

export const initiateCall = async (fromId, fromName, toId, convId) => {
  const ref = await addDoc(collection(db, 'calls'), {
    fromId, fromName, toId, convId,
    status: 'ringing',
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const subscribeToCalls = (uid, callback) => {
  const q = query(
    collection(db, 'calls'),
    where('toId', '==', uid),
    where('status', '==', 'ringing')
  );
  return onSnapshot(q, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'added') callback({ id: change.doc.id, ...change.doc.data() });
    });
  });
};

export const answerCall = async (callId) =>
  updateDoc(doc(db, 'calls', callId), { status: 'answered' });

export const endCall = async (callId) =>
  updateDoc(doc(db, 'calls', callId), { status: 'ended' });
