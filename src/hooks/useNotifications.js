import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToNotifications } from '@/services/notificationService';
import { handleNotifications } from '@/services/notificationSound';

export default function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const firstSnapshot = useRef(true);

  useEffect(() => {
    if (!currentUser) return;
    firstSnapshot.current = true;
    const unsub = subscribeToNotifications(currentUser.uid, (list) => {
      handleNotifications(list, { first: firstSnapshot.current });
      firstSnapshot.current = false;
      setNotifications(list);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, loading };
}
