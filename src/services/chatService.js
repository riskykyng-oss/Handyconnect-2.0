import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Send a new message
export const sendMessage = async (jobId, senderId, senderName, text) => {
  const messagesRef = collection(db, 'jobs', jobId, 'messages');
  await addDoc(messagesRef, {
    text,
    senderId,
    senderName,
    read: false, // Starts as unread
    createdAt: serverTimestamp()
  });
};

// Listen for messages in real-time
export const subscribeToMessages = (jobId, callback) => {
  const q = query(
    collection(db, 'jobs', jobId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamp to JS Date for easier formatting
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
    callback(messages);
  });

  return unsubscribe;
};

// Mark messages from the other user as "read"
export const markMessagesAsRead = async (jobId, currentUserId) => {
  const q = query(
    collection(db, 'jobs', jobId, 'messages'),
    where('senderId', '!=', currentUserId),
    where('read', '==', false)
  );

  const snapshot = await getDocs(q);
  snapshot.forEach(async (document) => {
    const docRef = doc(db, 'jobs', jobId, 'messages', document.id);
    await updateDoc(docRef, { read: true });
  });
};