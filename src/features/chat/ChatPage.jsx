import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getJob } from '@/services/jobService';
import { createConversation, createDirectConversation } from '@/services/chatService';
import { getPublicPro } from '@/services/portfolioService';
import ChatThread from './ChatThread';

export default function ChatPage() {
  const { jobId, convId, otherId } = useParams();
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const messagesPath = `/${userRole === 'handyman' ? 'handyman' : 'client'}/messages`;
  const [conv, setConv] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    let active = true;
    (async () => {
      try {
        if (otherId) {
          // Direct chat with a specific professional — create or reuse the conversation.
          if (otherId === currentUser.uid) { navigate(messagesPath); return; }
          const partner = await getPublicPro(otherId);
          if (!partner) { navigate(messagesPath); return; }
          const cid = await createDirectConversation(currentUser.uid, otherId, {
            aName: currentUser.displayName || currentUser.email,
            aAvatar: currentUser.photoURL || null,
            bName: partner.name,
            bAvatar: partner.avatar,
            bTrade: partner.trade,
          });
          const snap = await getDoc(doc(db, 'conversations', cid));
          if (active && snap.exists()) setConv({ id: cid, ...snap.data() });
        } else if (convId) {
          const snap = await getDoc(doc(db, 'conversations', convId));
          if (active && snap.exists()) setConv({ id: convId, ...snap.data() });
          else if (active) navigate(messagesPath);
        } else if (jobId) {
          const jobData = await getJob(jobId);
          if (!jobData) { navigate(messagesPath); return; }
          const cid = await createConversation(jobId, jobData.clientId, jobData.assignedTo, jobData.title);
          if (active) setConv({ id: cid, type: 'job', jobId });
        }
      } catch {
        if (active) setError(true);
      }
    })();
    return () => { active = false; };
  }, [jobId, convId, otherId, currentUser, navigate]);

  if (error) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center sm:h-[calc(100dvh-5rem)]">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="font-display text-lg font-bold text-gray-900">Could not open this conversation</p>
          <Link to={messagesPath} className="mt-3 inline-block rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-600">
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center sm:h-[calc(100dvh-5rem)]">
        <Loader2 size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return <ChatThread conv={conv} onBack={() => navigate(messagesPath)} />;
}
