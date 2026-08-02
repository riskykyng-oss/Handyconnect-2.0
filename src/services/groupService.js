import { collection, addDoc, doc, query, onSnapshot, serverTimestamp, updateDoc, deleteField } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getUserProfile } from '@/services/userService';

export const GROUP_LOCATIONS_OPTIONS = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Victoria Falls', 'Masvingo', 'Zimbabwe Wide'];
export const GROUP_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public — anyone can see & join' },
  { value: 'private', label: 'Private — visible, approval to join' },
  { value: 'invite', label: 'Invite only — members only' },
];

// Create a group. Only verified handymen can create groups.
export const createGroup = async ({ name, description, category, location, visibility, rules, coverImage, logo, createdBy, createdByName }) => {
  if (!createdBy) throw new Error('You must be signed in to create a group.');
  if (!name?.trim()) throw new Error('Give your group a name.');
  const profile = await getUserProfile(createdBy).catch(() => null);
  if (profile?.role !== 'handyman') throw new Error('Only handymen can create groups.');
  if (!profile?.verified) throw new Error('Only verified handymen can create groups. Request a verified badge from your profile first.');
  await addDoc(collection(db, 'groups'), {
    name: name.trim(),
    description: description?.trim() || '',
    category: category || null,
    location: location || null,
    visibility: visibility || 'public',
    rules: Array.isArray(rules) ? rules.map((r) => r.trim()).filter(Boolean).slice(0, 10) : [],
    coverImage: coverImage || null,
    logo: logo || null,
    ownerId: createdBy,
    createdBy,
    createdByName,
    members: { [createdBy]: true },
    admins: { [createdBy]: true },
    createdAt: serverTimestamp(),
  });
};

export const subscribeGroups = (callback) => {
  const q = query(collection(db, 'groups'));
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            category: data.category || data.trade || null,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        })
      ),
    () => callback([])
  );
};

export const subscribeGroup = (groupId, callback) => {
  if (!groupId) {
    callback(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'groups', groupId),
    (snap) => {
      if (!snap.exists()) return callback(null);
      const data = snap.data();
      callback({ id: snap.id, ...data, category: data.category || data.trade || null, createdAt: data.createdAt?.toDate() || new Date() });
    },
    () => callback(null)
  );
};

export const joinGroup = (groupId, uid) => updateDoc(doc(db, 'groups', groupId), { [`members.${uid}`]: true });

export const leaveGroup = (groupId, uid) =>
  updateDoc(doc(db, 'groups', groupId), { [`members.${uid}`]: deleteField(), [`admins.${uid}`]: deleteField() });

export const memberCount = (group) => (group?.members ? Object.keys(group.members).length : 0);

export const isMember = (group, uid) => !!group?.members?.[uid];

export const roleOf = (group, uid) => {
  if (!group || !uid) return null;
  if (group.ownerId === uid) return 'owner';
  if (group.admins?.[uid]) return 'admin';
  return isMember(group, uid) ? 'member' : null;
};
