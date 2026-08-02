import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Stories are short-lived (24h) work moments shared by professionals.
// Data lives in the Firestore `stories` collection:
//   { authorId, authorName, avatar, trade, image, caption, audience, viewedBy[], postedAt }

export const STORY_LIFETIME_HOURS = 24;

const toDate = (v) => {
  if (!v) return new Date(0);
  if (typeof v.toDate === 'function') return v.toDate();
  return v instanceof Date ? v : new Date(v);
};

// Live subscription. Stories targeting the viewer's role or everyone are shown,
// newest first. `viewed` is resolved per viewer from the `viewedBy` array so the
// ring styling is correct for each user.
export const subscribeStories = (role, currentUserId, callback) => {
  const q = query(collection(db, 'stories'), orderBy('postedAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const stories = snapshot.docs
      .map((d) => {
        const data = d.data();
        const audience = data.audience || 'all';
        if (audience !== 'all' && audience !== role) return null;
        return {
          id: d.id,
          name: data.authorName || 'Community member',
          avatar: data.avatar || null,
          trade: data.trade || 'Professional',
          image: data.image,
          caption: data.caption || '',
          postedAt: toDate(data.postedAt),
          viewed: (data.viewedBy || []).includes(currentUserId),
          authorId: data.authorId,
        };
      })
      .filter(Boolean);
    callback(stories);
  });
};

// Publish a new story. Returns the document id.
export const createStory = async ({ authorId, authorName, avatar, trade, image, caption = '', audience = 'all' }) => {
  if (!image) throw new Error('A story needs an image.');
  const ref = await addDoc(collection(db, 'stories'), {
    authorId,
    authorName: authorName || 'Community member',
    avatar: avatar || null,
    trade: trade || 'Professional',
    image,
    caption,
    audience,
    viewedBy: [],
    postedAt: serverTimestamp(),
  });
  return ref.id;
};

// Record that the current viewer has seen a story.
export const markStorySeen = async (storyId, userId) => {
  if (!storyId || !userId) return;
  await updateDoc(doc(db, 'stories', storyId), { viewedBy: arrayUnion(userId) });
};

export const isStoryExpired = (s) => Date.now() - toDate(s.postedAt).getTime() > STORY_LIFETIME_HOURS * 3600 * 1000;

export const hoursLeft = (s) => Math.max(0, Math.floor(STORY_LIFETIME_HOURS - (Date.now() - toDate(s.postedAt).getTime()) / 3600000));
