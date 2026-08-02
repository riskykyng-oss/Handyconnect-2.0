import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, User, Phone, PhoneOff } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getJob } from '@/services/jobService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import {
  subscribeToMessages, sendMessage, markMessagesAsRead,
  initiateCall, subscribeToCalls, answerCall, endCall,
} from '@/services/chatService';
import { getPublicPro } from '@/services/portfolioService';
import ChatBubble from '@/components/chat/ChatBubble';
import ChatInput from '@/components/chat/ChatInput';
import MessageList from '@/components/chat/MessageList';
import CallButton from '@/components/chat/CallButton';

export default function ChatThread({ conv, onBack, embedded }) {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [callState, setCallState] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const bottomRef = useRef(null);

  const otherId = conv?.participants?.find((id) => id !== currentUser?.uid);

  useEffect(() => {
    if (!conv) return;
    let active = true;
    (async () => {
      if (conv.type === 'direct') {
        const info = conv.participantInfo?.[otherId] || {};
        if (active) setPartner({ id: otherId, displayName: info.name || 'Conversation', photoURL: info.avatar || null, trade: info.trade || null });
        return;
      }
      if (conv.jobId) {
        const jobData = await getJob(conv.jobId);
        if (active && jobData) setJob(jobData);
      }
      if (otherId) {
        const profile = await getUserProfile(otherId);
        if (active && profile) {
          setPartner({ id: otherId, displayName: profile.displayName || 'Handyman', photoURL: profile.photoURL || null, trade: profile.skills });
        } else if (active) {
          const pub = await getPublicPro(otherId);
          if (pub) setPartner({ id: otherId, displayName: pub.name, photoURL: pub.avatar || null, trade: pub.trade });
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
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!currentUser) return;
    const unsub = subscribeToCalls(currentUser.uid, (call) => setIncomingCall(call));
    return unsub;
  }, [currentUser]);

  const handleSend = useCallback(async (text, file, extra) => {
    if (sending || !conv) return;
    setSending(true);
    try {
      let attachment = null;
      if (file) {
        const base = conv.type === 'direct' ? `chats/${conv.id}` : `chats/${conv.jobId}`;
        const url = await uploadFile(file, `${base}/${Date.now()}_${file.name}`);
        attachment = { url, name: file.name };
        if (file.type.startsWith('audio/')) attachment.duration = 0;
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

  const startCall = useCallback(async () => {
    if (!currentUser || !partner || !conv) return;
    await initiateCall(currentUser.uid, currentUser.displayName, partner.id, conv.id);
    setCallState('ringing');
    setTimeout(() => setCallState(null), 30000);
  }, [currentUser, partner, conv]);

  const handleAnswerCall = useCallback(async (callId) => {
    await answerCall(callId);
    setCallState('answered');
    setIncomingCall(null);
  }, []);

  const handleEndCall = useCallback(async () => {
    if (incomingCall) await endCall(incomingCall.id);
    setCallState('ended');
    setIncomingCall(null);
    setTimeout(() => setCallState(null), 2000);
  }, [incomingCall]);

  const subtitle = conv?.type === 'direct' ? (partner?.trade || 'Direct message') : job?.title;
  const canViewProfile = userRole === 'client' || !!partner?.trade;
  const goProfile = () => { if (partner?.id) navigate(`/pro/${partner.id}`); };

  return (
    <div className={`flex flex-col ${embedded ? 'h-full' : 'h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-5rem)]'}`}>
      {incomingCall && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-2xl font-bold text-orange-600">
              {partner?.displayName?.[0] || '?'}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{partner?.displayName || 'Incoming Call'}</h3>
            <p className="mb-6 text-sm text-gray-500">Incoming call...</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleEndCall}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-400"
              >
                <PhoneOff size={24} />
              </button>
              <button
                onClick={() => handleAnswerCall(incomingCall.id)}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all hover:bg-green-400"
              >
                <Phone size={24} />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        {onBack && (
          <button onClick={onBack} className="rounded-xl p-2 text-gray-500 transition-colors hover:bg-gray-100">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                {partner?.displayName?.[0] || <User size={18} />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-1 truncate font-bold text-gray-900">
                {partner?.displayName || 'Loading...'}
                <ChevronRight size={16} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5" />
              </h2>
              <p className="truncate text-xs text-gray-400">{subtitle}</p>
            </div>
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {partner?.photoURL ? (
              <img className="h-10 w-10 rounded-full object-cover shadow-sm" src={partner.photoURL} alt="" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                {partner?.displayName?.[0] || <User size={18} />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-bold text-gray-900">
                {partner?.displayName || 'Loading...'}
              </h2>
              <p className="truncate text-xs text-gray-400">{subtitle}</p>
            </div>
          </div>
        )}
        <CallButton onCall={startCall} onEndCall={handleEndCall} callState={callState} />
      </div>

      <MessageList ref={bottomRef}>
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-gray-400">
            <User size={40} className="mb-2 text-gray-300" />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="mt-1 text-xs">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === currentUser.uid} />
          ))
        )}
      </MessageList>

      <ChatInput onSend={handleSend} loading={sending} />
    </div>
  );
}
