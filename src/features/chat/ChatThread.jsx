import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, ChevronRight, User } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import useKeyboardOffset from '@/hooks/useKeyboardOffset';
import { getJob } from '@/services/jobService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import {
  subscribeToMessages, sendMessage, markMessagesAsRead,
} from '@/services/chatService';
import { getPublicPro } from '@/services/portfolioService';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import MessageList from '@/components/chat/MessageList';

export default function ChatThread({ conv, onBack, embedded }) {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const keyboardOffset = useKeyboardOffset();

  const otherId = conv?.participants?.find((id) => id !== currentUser?.uid);

  useEffect(() => {
    if (!conv) return;
    let active = true;
    (async () => {
      if (conv.type === 'direct') {
        const info = conv.participantInfo?.[otherId] || {};
        if (active) setPartner({ id: otherId, displayName: info.name || 'Conversation', photoURL: info.avatar || null, trade: info.trade || null, verified: !!info.verified });
        return;
      }
      if (conv.jobId) {
        const jobData = await getJob(conv.jobId);
        if (active && jobData) setJob(jobData);
      }
      if (otherId) {
        const profile = await getUserProfile(otherId);
        if (active && profile) {
          setPartner({ id: otherId, displayName: profile.displayName || 'Handyman', photoURL: profile.photoURL || null, trade: profile.skills, verified: !!profile.verified });
        } else if (active) {
          const pub = await getPublicPro(otherId);
          if (pub) setPartner({ id: otherId, displayName: pub.name, photoURL: pub.avatar || null, trade: pub.trade, verified: !!pub.verified });
        }
      }
    })();
    return () => { active = false; };
  }, [conv, otherId]);

  useEffect(() => {
    if (!conv) return;
    const unsub = subscribeToMessages(conv, (msgs) => setMessages(msgs));
    return unsub;
  }, [conv]);

  useEffect(() => {
    if (!conv || !currentUser) return;
    markMessagesAsRead(conv, currentUser.uid);
  }, [conv, currentUser, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [keyboardOffset]);

  const handleSend = useCallback(async (text, file, extra) => {
    if (sending || !conv) return;
    setSending(true);
    try {
      let attachment = null;
      if (file) {
        const base = conv.type === 'direct' ? `chats/${conv.id}` : `chats/${conv.jobId}`;
        const url = await uploadFile(file, `${base}/${Date.now()}_${file.name}`);
        attachment = { url, name: file.name, duration: extra?.duration || 0 };
      }
      await sendMessage(conv, currentUser.uid, currentUser.displayName, text, {
        ...extra,
        attachment,
        type: extra?.type || (file?.type?.startsWith('image/') ? 'image' : file?.type?.startsWith('audio/') ? 'voice' : 'text'),
      });
    } finally {
      setSending(false);
    }
  }, [sending, conv, currentUser]);

  const subtitle = conv?.type === 'direct' ? (conv.jobTitle || partner?.trade || 'Direct message') : job?.title;
  const canViewProfile = userRole === 'client' || !!partner?.trade;
  const goProfile = () => { if (partner?.id) navigate(`/pro/${partner.id}`); };

  return (
    <div className={`flex flex-col ${embedded ? 'h-full' : 'h-[100dvh] md:h-[calc(100dvh-5rem)]'}`}>
      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        {onBack && (
          <button onClick={onBack} className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700">
            <ArrowLeft size={20} />
          </button>
        )}
        {canViewProfile ? (
          <button
            onClick={goProfile}
            className="group flex min-w-0 flex-1 items-center gap-3 text-left"
            title="View profile"
          >
            {partner?.photoURL ? (
              <img className="h-10 w-10 rounded-full object-cover shadow-sm" src={partner.photoURL} alt="" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                {partner?.displayName?.[0] || <User size={18} />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-1 truncate font-semibold text-hc-ink dark:text-gray-100">
                {partner?.displayName || 'Loading...'}
                {partner?.verified && <BadgeCheck size={15} className="shrink-0 fill-hc-accent text-white" />}
                <ChevronRight size={16} className="shrink-0 text-hc-ink-3 transition-transform group-hover:translate-x-0.5" />
              </h2>
              <p className="truncate text-xs text-hc-ink-3">{subtitle}</p>
            </div>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {partner?.photoURL ? (
              <img className="h-10 w-10 rounded-full object-cover shadow-sm" src={partner.photoURL} alt="" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
                {partner?.displayName?.[0] || <User size={18} />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-1 truncate font-semibold text-hc-ink dark:text-gray-100">
                {partner?.displayName || 'Loading...'}
                {partner?.verified && <BadgeCheck size={15} className="shrink-0 fill-hc-accent text-white" />}
              </h2>
              <p className="truncate text-xs text-hc-ink-3">{subtitle}</p>
            </div>
          </div>
        )}
      </div>

      <MessageList ref={bottomRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-hc-ink-3">
            <User size={40} className="mb-2 text-hc-ink-3" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="mt-1 text-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUser.uid} />
          ))
        )}
      </MessageList>

      <div className="bg-white dark:bg-gray-800" style={{ paddingBottom: keyboardOffset }}>
        <ChatInput onSend={handleSend} loading={sending} />
      </div>
    </div>
  );
}
