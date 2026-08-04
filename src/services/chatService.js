import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp,
  where, getDocs, updateDoc, doc, arrayUnion, getDoc, limit,
  arrayRemove, deleteField,
} from 'firebase/firestore';
import { db } from '@/firebase/config';

/* ─── CONVERSATIONS ─── */

// Job chats reuse the pair's single direct conversation, so every client–professional
// pair has exactly ONE thread (all jobs + direct messages grouped together).
export const createConversation = async (jobId, clientId, handymanId, jobTitle) => {
  const participants = [clientId, handymanId].filter(Boolean);
  if (participants.length < 2) return null;

  const cid = await createDirectConversation(clientId, handymanId, { bName: jobTitle || 'Untitled job' });
  if (!cid) return null;

  const patch = { jobId, jobTitle: jobTitle || 'Untitled job', jobIds: arrayUnion(jobId) };
  if (jobTitle) patch.jobTitles = arrayUnion(jobTitle);
  await updateDoc(doc(db, 'conversations', cid), patch);
  return cid;
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

// Find an existing direct conversation between two users.
export const findConversation = async (aId, bId) => {
  const q = query(collection(db, 'conversations'), where('participants', 'array-contains', aId), limit(50));
  const snap = await getDocs(q);
  const found = snap.docs.find((d) => {
    const data = d.data();
    const p = data.participants || [];
    return data.type === 'direct' && p.length === 2 && p.includes(bId);
  });
  return found ? { id: found.id, ...found.data() } : null;
};

// Direct (person-to-person) conversations. One per user pair, guaranteed by directKey.
export const createDirectConversation = async (
  aId, bId,
  { aName, aAvatar, aVerified, aAvailable, bName, bAvatar, bTrade, bVerified, bAvailable } = {},
) => {
  const participants = [aId, bId].filter(Boolean);
  if (participants.length < 2) return null;
  const directKey = [...participants].sort().join('_');

  const q = query(collection(db, 'conversations'), where('directKey', '==', directKey), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  // Legacy direct conversations (created before directKey) — reuse instead of duplicating.
  const legacy = await findConversation(aId, bId);
  if (legacy) return legacy.id;

  const participantInfo = {
    [aId]: { name: aName || null, avatar: aAvatar || null, trade: null, verified: !!aVerified, available: aAvailable ?? null },
    [bId]: { name: bName || null, avatar: bAvatar || null, trade: bTrade || null, verified: !!bVerified, available: bAvailable ?? null },
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
        lastMessage: { text: text || (options.type === 'image' ? 'Photo' : options.type === 'voice' ? 'Voice message' : (options.type || 'media')), senderId, senderName, createdAt: serverTimestamp() },
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

