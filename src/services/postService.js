import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Create a new post
export const createPost = async (authorId, authorName, authorRole, text, imageUrl = null) => {
  await addDoc(collection(db, 'posts'), {
    authorId,
    authorName,
    authorRole,
    text,
    imageUrl, // Optional: we will just use text for now
    likes: [], // Array of user UIDs who liked it
    createdAt: serverTimestamp()
  });
};

// Listen for posts in real-time
export const subscribeToPosts = (callback) => {
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate() || new Date()
      };
    });
    callback(posts);
  });

  return unsubscribe;
};

// Like or Unlike a post
export const toggleLike = async (postId, userId, isLiked) => {
  const postRef = doc(db, 'posts', postId);
  // If already liked, remove user ID. If not liked, add user ID.
  await updateDoc(postRef, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
};