import { Loader2, MessageCircle } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function ConversationList({ conversations, loading, currentUserId, onSelect, search, selectedId }) {
  const filtered = search
    ? conversations.filter((c) => c.jobTitle?.toLowerCase().includes(search.toLowerCase()))
    : conversations;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-hc-ink-3" />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-hc-ink-3">
        <MessageCircle size={40} className="mb-3 text-hc-ink-3" />
        <p className="text-sm font-medium">
          {search ? 'No conversations found' : 'No conversations yet'}
        </p>
        <p className="mt-1 text-xs">
          {search ? 'Try a different search term' : 'Messages appear when you accept a job'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {filtered.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          currentUserId={currentUserId}
          onClick={() => onSelect(conv)}
          selected={conv.id === selectedId}
        />
      ))}
    </div>
  );
}
