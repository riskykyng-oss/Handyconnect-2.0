import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getUserProfile } from '@/services/userService';

// A handyman's portfolio lives in the real `users/{authorId}/portfolio` subcollection.
// Queries stay single-field (orderBy createdAt) so no composite index is required.

const portfolioCol = (authorId) => collection(db, 'users', authorId, 'portfolio');
const portfolioDoc = (authorId, itemId) => doc(db, 'users', authorId, 'portfolio', itemId);

export const createPortfolioItem = async (authorId, data) => {
  await addDoc(portfolioCol(authorId), {
    authorId,
    title: data.title,
    trade: data.trade,
    description: data.description || null,
    price: data.price || null,
    location: data.location || null,
    images: data.images || [],
    beforeImage: data.beforeImage || null,
    afterImage: data.afterImage || null,
    featured: !!data.featured,
    views: 0,
    createdAt: serverTimestamp(),
  });
};

export const updatePortfolioItem = async (authorId, itemId, data) => {
  const update = {
    title: data.title,
    trade: data.trade,
    description: data.description || null,
    price: data.price || null,
    location: data.location || null,
    images: data.images || [],
    beforeImage: data.beforeImage || null,
    afterImage: data.afterImage || null,
    featured: !!data.featured,
  };
  await updateDoc(portfolioDoc(authorId, itemId), update);
};

export const deletePortfolioItem = async (authorId, itemId) => {
  await deleteDoc(portfolioDoc(authorId, itemId));
};

// Live portfolio items for one professional (used by both the manager and public page)
export const subscribePortfolio = (authorId, callback) => {
  const q = query(portfolioCol(authorId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date() })));
  });
};

// Resolve a pro's public info: real user profile first.
export const getPublicPro = async (proId) => {
  try {
    const user = await getUserProfile(proId);
    if (user) {
      return {
        id: proId,
        name: user.displayName || user.email || 'Handyman',
        trade: user.trade || (user.skills && user.skills.split(',')[0]) || 'Handyman',
        verified: !!user.verified,
        avatar: user.photoURL || null,
        bio: user.bio || '',
        skills: user.skills || '',
        hourlyRate: user.hourlyRate ? Number(user.hourlyRate) : null,
        phone: user.phone || null,
        available: user.available !== false,
        rating: user.rating,
        jobs: user.jobs,
        area: user.address || '',
        location: user.location || null,
      };
    }
  } catch { /* no profile */ }

  return null;
};
