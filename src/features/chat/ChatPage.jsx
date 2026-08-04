import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loader2, Briefcase } from 'lucide-react';
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
  const [notAssigned, setNotAssigned] = useState(false);
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
            bVerified: partner.verified,
            bAvailable: partner.available,
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
          if (!cid) { if (active) setNotAssigned(true); return; }
          const snap = await getDoc(doc(db, 'conversations', cid));
          if (active && snap.exists()) setConv({ id: cid, ...snap.data() });
          else if (active) setNotAssigned(true);
        }
      } catch {
        if (active) setError(true);
      }
    })();
    return () => { active = false; };
  }, [jobId, convId, otherId, currentUser, messagesPath, navigate]);

  if (notAssigned) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center md:h-[calc(100dvh-5rem)]">
        <div className="rounded-xl border border-black/[0.07] bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Briefcase size={32} className="mx-auto mb-4 text-hc-ink-3" />
          <p className="text-lg font-semibold tracking-tight text-hc-ink dark:text-gray-100">Your job is still open</p>
          <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">This chat will open here once a professional accepts your job.</p>
          <Link to={messagesPath} className="mt-4 inline-block rounded-xl bg-hc-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong">
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center md:h-[calc(100dvh-5rem)]">
        <div className="rounded-xl border border-black/[0.07] bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <p className="text-lg font-semibold tracking-tight text-hc-ink dark:text-gray-100">Could not open this conversation</p>
          <Link to={messagesPath} className="mt-3 inline-block rounded-xl bg-hc-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong">
            Back to messages
          </Link>
        </div>
      </div>
    );
  }

  if (!conv) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center md:h-[calc(100dvh-5rem)]">
        <Loader2 size={32} className="animate-spin text-hc-ink-3" />
      </div>
    );
  }

  return <ChatThread conv={conv} onBack={() => navigate(messagesPath)} />;
}
