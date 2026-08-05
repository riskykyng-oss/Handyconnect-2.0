import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Check, CheckCheck, ChevronRight } from 'lucide-react';
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

function mediaLabel(last) {
  if (!last?.text) return '';
  if (last.text === 'image') return 'Photo';
  if (last.text === 'voice') return 'Voice message';
  if (last.text === 'media') return 'Attachment';
  return last.text;
}

export default function ConversationItem({ conversation, currentUserId, onClick, selected }) {
  const otherId = conversation.participants?.find((id) => id !== currentUserId);
  const cached = conversation.participantInfo?.[otherId];
  const [fetched, setFetched] = useState(null);
  const unread = conversation.unreadCount?.[currentUserId] || 0;
  const lastMsg = conversation.lastMessage;
  const isLastMine = lastMsg?.senderId === currentUserId;

  useEffect(() => {
    if (cached?.name || !otherId) return undefined;
    let active = true;
    getUserProfile(otherId).then((p) => {
      if (!active || !p) return;
      setFetched({
        displayName: p.displayName || 'Handyman',
        photoURL: p.photoURL || null,
        trade: p.skills || p.trade || null,
        verified: !!p.verified,
        available: p.available ?? null,
      });
    });
    return () => { active = false; };
  }, [otherId, cached?.name]);

  const partner = cached?.name
    ? {
        displayName: cached.name,
        photoURL: cached.avatar || null,
        trade: cached.trade || null,
        verified: !!cached.verified,
        available: cached.available ?? null,
      }
    : fetched;

  const jobTitle = conversation.jobTitle;
  const subtitle = jobTitle
    ? (conversation.jobCount > 1 ? `${jobTitle} +${conversation.jobCount - 1} more` : jobTitle)
    : (partner?.trade || null);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-l-4 px-4 py-3.5 text-left transition-colors ${
        selected ? 'border-gray-900 bg-gray-50 dark:border-gray-200 dark:bg-gray-700/60' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700/40'
      }`}
    >
      <div className="relative shrink-0">
        {partner?.photoURL ? (
          <img className="h-12 w-12 rounded-full object-cover shadow-sm" src={partner.photoURL} alt="" />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg font-semibold text-gray-500">
            {partner?.displayName?.[0] || otherId?.[0] || '?'}
          </div>
        )}
        {partner?.available != null && (
          <span
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-900 ${partner.available ? 'bg-emerald-500' : 'bg-gray-300'}`}
            title={partner.available ? 'Available today' : 'Currently busy'}
          />
        )}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-hc-brand px-1 text-[10px] font-bold text-white shadow-sm">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className={`flex min-w-0 items-center gap-1 truncate ${unread > 0 ? 'font-bold' : 'font-semibold'} text-hc-ink dark:text-gray-100`}>
            <span className="truncate">{partner?.displayName || 'Loading...'}</span>
            {partner?.verified && <BadgeCheck size={14} className="shrink-0 fill-hc-accent text-white" />}
          </h3>
          <span className="shrink-0 text-[11px] text-hc-ink-3">{formatTime(lastMsg?.createdAt)}</span>
        </div>
        {subtitle && <p className="mt-0.5 truncate text-xs text-hc-caption dark:text-gray-400">{subtitle}</p>}
        <div className="mt-0.5 flex items-center gap-1.5">
          {isLastMine && (lastMsg?.createdAt ? <CheckCheck size={13} className="shrink-0 text-emerald-500" /> : <Check size={13} className="shrink-0 text-gray-400" />)}
          <p className={`truncate text-sm ${unread > 0 ? 'font-semibold text-hc-ink' : 'text-hc-caption dark:text-gray-400'}`}>
            {mediaLabel(lastMsg) || 'Say hello to start a conversation'}
          </p>
        </div>
      </div>
      <ChevronRight size={16} className="shrink-0 text-hc-ink-3" />
    </motion.button>
  );
}
