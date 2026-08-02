import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, ChevronRight } from 'lucide-react';
import { getUserProfile } from '@/services/userService';

function formatTime(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export default function ConversationItem({ conversation, currentUserId, onClick }) {
  const otherId = conversation.participants?.find((id) => id !== currentUserId);
  const cached = conversation.participantInfo?.[otherId];
  const [partner, setPartner] = useState(null);
  const unread = conversation.unreadCount?.[currentUserId] || 0;
  const lastMsg = conversation.lastMessage;
  const isLastMine = lastMsg?.senderId === currentUserId;

  useEffect(() => {
    if (cached?.name) {
      setPartner({ displayName: cached.name, photoURL: cached.avatar || null });
      return;
    }
    if (otherId) getUserProfile(otherId).then(setPartner);
  }, [otherId, cached?.name, cached?.avatar]);

  const isDirect = conversation.type === 'direct';

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 ${unread > 0 ? 'bg-orange-50/50' : ''}`}
    >
      <div className="relative shrink-0">
        {partner?.photoURL ? (
          <img className="h-12 w-12 rounded-full object-cover shadow-sm" src={partner.photoURL} alt="" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-lg font-bold text-orange-600">
            {partner?.displayName?.[0] || otherId?.[0] || '?'}
          </div>
        )}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white shadow-sm">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`truncate ${unread > 0 ? 'font-extrabold' : 'font-bold'} text-gray-900`}>
            {partner?.displayName || 'Loading...'}
          </h3>
          <span className="shrink-0 text-[11px] text-gray-400">{formatTime(lastMsg?.createdAt)}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5">
          {isLastMine && (lastMsg?.createdAt ? <CheckCheck size={13} className="shrink-0 text-blue-500" /> : <Check size={13} className="shrink-0 text-gray-400" />)}
          <p className={`truncate text-sm ${unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
            {isDirect
              ? (lastMsg?.text || 'Say hello to start a conversation')
              : (conversation.jobTitle ? `Job: ${conversation.jobTitle}` : '') || lastMsg?.text || 'No messages yet'}
          </p>
        </div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-gray-300" />
    </motion.button>
  );
}
