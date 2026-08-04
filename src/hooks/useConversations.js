import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToConversations } from '@/services/chatService';

const toMillis = (v) => {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (v instanceof Date) return v.getTime();
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
};

const groupKey = (conv) =>
  conv.directKey || [...(conv.participants || [])].sort().join('_');

// Collapse every conversation for the same client–professional pair into ONE inbox
// thread: summed unread count, most recent preview, and job titles attached.
const mergeByPair = (list, me) => {
  const groups = new Map();
  for (const conv of list) {
    const key = groupKey(conv);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(conv);
  }

  const merged = [];
  for (const [key, convs] of groups.entries()) {
    const sorted = [...convs].sort((a, b) => toMillis(b.lastActivity) - toMillis(a.lastActivity));
    const rep = sorted[0];
    const unread = sorted.reduce((sum, c) => sum + (c.unreadCount?.[me] || 0), 0);

    const latestMsg = sorted
      .map((c) => c.lastMessage)
      .filter(Boolean)
      .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt))[0];

    const jobTitles = [...new Set(sorted.map((c) => c.jobTitle).filter(Boolean))];

    const participantInfo = {};
    for (const c of convs) Object.assign(participantInfo, c.participantInfo || {});

    merged.push({
      id: rep.id,
      type: rep.type,
      jobId: rep.jobId,
      directKey: rep.directKey || key,
      participants: rep.participants,
      participantInfo,
      lastMessage: latestMsg || rep.lastMessage || null,
      lastActivity: rep.lastActivity,
      unreadCount: { [me]: unread },
      jobTitle: jobTitles[0] || null,
      jobCount: jobTitles.length,
    });
  }

  return merged.sort((a, b) => toMillis(b.lastActivity) - toMillis(a.lastActivity));
};

export default function useConversations() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return undefined;
    const unsub = subscribeToConversations(currentUser.uid, (list) => {
      setConversations(mergeByPair(list, currentUser.uid));
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  return { conversations, loading, currentUser };
}
