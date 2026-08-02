import { collection, addDoc, query, orderBy, getDocs, getDoc, onSnapshot, serverTimestamp, doc, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc, runTransaction, deleteField } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { createNotification } from '@/services/notificationService';

// Create a new post
// options: { media[], videoUrl, beforeImage, afterImage, type, trade, location, authorAvatar, authorVerified, authorTrade, poll, groupId }
export const createPost = async (authorId, authorName, authorRole, text, imageUrl = null, options = {}) => {
  const {
    media = [],
    videoUrl = null,
    beforeImage = null,
    afterImage = null,
    type = 'post',
    trade = null,
    location = null,
    authorAvatar = null,
    authorVerified = false,
    authorTrade = null,
    poll = null,
    groupId = null,
  } = options;

  await addDoc(collection(db, 'posts'), {
    authorId,
    authorName,
    authorRole,
    text,
    imageUrl,
    media: media.filter(Boolean),
    videoUrl,
    beforeImage,
    afterImage,
    type, // 'post' | 'question' | 'tip' | 'project' | 'beforeafter' | 'poll'
    trade,
    location,
    groupId,
    authorAvatar,
    authorVerified,
    authorTrade: authorTrade || trade,
    likes: [],
    bookmarks: [],
    saves: {},
    reactions: {}, // { '❤️': [uids], '👍': [uids], ... }
    hashtags: text.match(/#[\w-]+/g) || [],
    commentCount: 0,
    poll: poll
      ? { question: poll.question, options: poll.options, votes: {}, voters: {} }
      : null,
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

// Like or Unlike a post (legacy heart, kept in sync with reactions)
export const toggleLike = async (postId, userId, isLiked) => {
  const postRef = doc(db, 'posts', postId);
  await updateDoc(postRef, {
    likes: isLiked ? arrayRemove(userId) : arrayUnion(userId)
  });
};

// React to a post with an emoji (👍 ❤️ 👏 🔥 💡 🎉)
export const reactToPost = async (postId, userId, emoji, isActive) => {
  const postRef = doc(db, 'posts', postId);
  const update = {};
  update[`reactions.${emoji}`] = isActive ? arrayRemove(userId) : arrayUnion(userId);
  if (emoji === '❤️') update.likes = isActive ? arrayRemove(userId) : arrayUnion(userId);
  await updateDoc(postRef, update);
  if (!isActive) {
    const snap = await getDoc(postRef);
    const postAuthor = snap.data()?.authorId;
    if (postAuthor && postAuthor !== userId) {
      createNotification(postAuthor, userId, 'reaction', { emoji, postId }).catch(() => {});
    }
  }
};

export const toggleBookmark = async (postId, userId, isBookmarked) => updateDoc(doc(db, 'posts', postId), { bookmarks: isBookmarked ? arrayRemove(userId) : arrayUnion(userId) });

// Save a post into a collection (Saved Projects / Ideas / Professionals / Tutorials)
export const toggleSave = async (postId, userId, collectionName, isSaved) => {
  const postRef = doc(db, 'posts', postId);
  const update = {};
  update[`saves.${collectionName}`] = isSaved ? arrayRemove(userId) : arrayUnion(userId);
  await updateDoc(postRef, update);
};

export const addComment = async (postId, authorId, authorName, text, parentId = null) => {
  await addDoc(collection(db, 'posts', postId, 'comments'), { authorId, authorName, text, parentId, likes: [], createdAt: serverTimestamp() });
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(1) });
  const snap = await getDoc(doc(db, 'posts', postId));
  const postAuthor = snap.data()?.authorId;
  if (postAuthor && postAuthor !== authorId) {
    createNotification(postAuthor, authorId, 'comment', { text: `${authorName} commented: "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`, postId }).catch(() => {});
  }
};

export const updateComment = async (postId, commentId, text) => updateDoc(doc(db, 'posts', postId, 'comments', commentId), { text });

export const deleteComment = async (postId, commentId) => {
  await deleteDoc(doc(db, 'posts', postId, 'comments', commentId));
  await updateDoc(doc(db, 'posts', postId), { commentCount: increment(-1) });
};

export const subscribeToComments = (postId, callback) => onSnapshot(query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc')), snapshot => callback(snapshot.docs.map(item => ({ id: item.id, ...item.data(), createdAt: item.data().createdAt?.toDate() || new Date() }))));

// Edit an existing post (own posts only)
export const updatePost = async (postId, updates) => updateDoc(doc(db, 'posts', postId), {
  text: updates.text,
  ...(updates.trade !== undefined ? { trade: updates.trade } : {}),
  ...(updates.location !== undefined ? { location: updates.location } : {}),
});

// Delete a post and its comments (own posts / moderation)
export const deletePost = async (postId) => {
  const comments = await getDocs(collection(db, 'posts', postId, 'comments'));
  await Promise.all(comments.docs.map((c) => deleteDoc(c.ref)));
  await deleteDoc(doc(db, 'posts', postId));
};

// Vote (or change / remove a vote) on a poll
export const votePoll = async (postId, userId, optionId) => {
  const postRef = doc(db, 'posts', postId);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(postRef);
    const poll = snap.data()?.poll;
    if (!poll) return;
    const votes = poll.votes || {};
    const voters = poll.voters || {};
    const current = voters[userId];
    const update = {};
    if (current) {
      update[`poll.votes.${current}`] = Math.max(0, (votes[current] || 0) - 1);
      if (current === optionId) {
        update[`poll.voters.${userId}`] = deleteField();
        tx.update(postRef, update);
        return;
      }
    }
    update[`poll.votes.${optionId}`] = (votes[optionId] || 0) + 1;
    update[`poll.voters.${userId}`] = optionId;
    tx.update(postRef, update);
  });
};
