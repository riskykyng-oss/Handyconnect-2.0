import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import useConversations from '@/hooks/useConversations';
import RailWidget from './RailWidget';

export default function RailRecentMessages() {
  const navigate = useNavigate();
  const { conversations, currentUser } = useConversations();
  const mine = currentUser?.uid;

  return (
    <RailWidget icon={MessageSquare} title="Recent Messages" actionLabel="View all" onAction={() => navigate('/client/messages')}>
      {conversations.length === 0 ? (
        <p className="rounded-lg bg-hc-page px-3 py-6 text-center text-xs font-medium text-hc-caption">
          No conversations yet.
        </p>
      ) : (
        <ul className="space-y-1">
          {conversations.slice(0, 3).map((c) => {
            const otherId = (c.participants || []).find((p) => p !== mine) || '';
            const other = c.participantInfo?.[otherId] || {};
            const unread = c.unreadCount?.[mine] || 0;
            return (
              <li key={c.id}>
                <button
                  onClick={() => navigate(`/client/chat/d/${c.directKey || c.id}`)}
                  className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-gray-100 ${
                    unread ? 'bg-gray-50' : ''
                  }`}
                >
                  {other.avatar ? (
                    <img src={other.avatar} alt={other.name || 'Contact'} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hc-tile text-xs font-bold text-hc-ink-2">
                      {(other.name || '?')[0]}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className={`truncate text-[13px] ${unread ? 'font-semibold text-hc-ink' : 'font-medium text-hc-ink-2'}`}>
                        {other.name || 'Contact'}
                      </span>
                      {unread > 0 && <span className="h-2 w-2 shrink-0 rounded-full bg-hc-brand" />}
                    </span>
                    <span className="block truncate text-xs text-hc-caption">
                      {c.lastMessage?.text || c.jobTitle || 'New conversation'}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </RailWidget>
  );
}
