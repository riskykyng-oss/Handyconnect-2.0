import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToConversations } from '@/services/chatService';

// Live total of unread messages across all conversations for the current user.
export default function useUnreadCount() {
  const { currentUser } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setCount(0);
      return;
    }
    const unsub = subscribeToConversations(currentUser.uid, (list) => {
      const total = list.reduce((sum, c) => sum + (c.unreadCount?.[currentUser.uid] || 0), 0);
      setCount(total);
    });
    return unsub;
  }, [currentUser]);

  return count;
}
