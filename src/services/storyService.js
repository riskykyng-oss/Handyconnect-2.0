import { collection, query, where, orderBy, onSnapshot, addDoc, updateDoc, doc, arrayUnion, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Stories are short-lived (24h) work moments shared by professionals.
// Data lives in the Firestore `stories` collection:
//   { authorId, authorName, avatar, trade, image, caption, audience, viewedBy[], postedAt }

export const STORY_LIFETIME_HOURS = 24;

const STORY_LIFETIME_MS = STORY_LIFETIME_HOURS * 3600 * 1000;

const toDate = (v) => {
  if (!v) return new Date(0);
  if (typeof v.toDate === 'function') return v.toDate();
  return v instanceof Date ? v : new Date(v);
};

// Delete every story older than the 24h lifetime. Best-effort: Firestore rules
// may forbid the signed-in user from deleting other users' stories, so failures
// are swallowed — expired stories are still hidden from the feed regardless.
export const purgeExpiredStories = async () => {
  try {
    const boundary = new Date(Date.now() - STORY_LIFETIME_MS);
    const snap = await getDocs(query(collection(db, 'stories'), where('postedAt', '<', boundary)));
    const ids = snap.docs.map((d) => d.id);
    if (!ids.length) return 0;
    let deleted = 0;
    for (let i = 0; i < ids.length; i += 450) {
      const batch = writeBatch(db);
      ids.slice(i, i + 450).forEach((id) => batch.delete(doc(db, 'stories', id)));
      await batch.commit();
      deleted += Math.min(450, ids.length - i);
    }
    return deleted;
  } catch {
    return 0;
  }
};

const isExpired = (postedAt) => Date.now() - toDate(postedAt).getTime() > STORY_LIFETIME_MS;

// Live subscription. Stories targeting the viewer's role or everyone are shown,
// newest first. Expired stories are filtered out of the feed and their documents
// are purged from Firestore so they disappear automatically once they hit 24h.
// `viewed` is resolved per viewer from the `viewedBy` array so the ring styling
// is correct for each user.
export const subscribeStories = (role, currentUserId, callback) => {
  const q = query(collection(db, 'stories'), orderBy('postedAt', 'desc'));

  let current = [];
  let lastPurge = 0;
  const emit = () => callback(current.filter((s) => !isExpired(s.postedAt)));

  const maybePurge = () => {
    const now = Date.now();
    if (now - lastPurge < 60000) return;
    lastPurge = now;
    purgeExpiredStories();
  };

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      current = snapshot.docs
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
      maybePurge();
      emit();
    },
    () => emit()
  );

  // Sweep every minute so a story that expires while the page is open disappears
  // on time even if no other document change fires a snapshot.
  const sweep = setInterval(() => {
    maybePurge();
    emit();
  }, 60000);

  return () => {
    clearInterval(sweep);
    unsubscribe();
  };
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

export const isStoryExpired = (s) => !s || isExpired(s.postedAt);

export const hoursLeft = (s) => Math.max(0, Math.floor(STORY_LIFETIME_HOURS - (Date.now() - toDate(s.postedAt).getTime()) / 3600000));
