import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToConversations } from '@/services/chatService';

export default function useConversations() {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setLoading(false);
      return;
    }
    const unsub = subscribeToConversations(currentUser.uid, (list) => {
      setConversations(list);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  return { conversations, loading, currentUser };
}
