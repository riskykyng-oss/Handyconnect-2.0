import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { markNotificationRead, markAllNotificationsRead } from '@/services/notificationService';
import { timeAgo } from '@/utils/time';

export default function NotificationDropdown({ notifications, unreadCount, open, onClose }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-hc-hairline bg-white py-3 shadow-lg z-50">
      <div className="flex items-center justify-between px-4 pb-2 border-b border-hc-hairline">
        <p className="text-xs font-bold text-hc-ink">Notifications</p>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead(currentUser.uid).catch(() => {})}
            className="text-[10px] font-semibold text-hc-brand hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>
      <div className="px-2 pt-2 space-y-1 max-h-80 overflow-y-auto">
        {!notifications.length && (
          <p className="py-6 text-center text-xs text-hc-ink-3">No notifications yet</p>
        )}
        {notifications.slice(0, 8).map((n) => (
          <button
            key={n.id}
            onClick={() => {
              markNotificationRead(n.id).catch(() => {});
              onClose();
            }}
            className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50 ${!n.read ? 'bg-hc-tile' : ''}`}
          >
            <div className={`h-2 w-2 mt-1 shrink-0 rounded-full ${n.read ? 'bg-hc-hairline' : 'bg-hc-brand'}`} />
            <div className="min-w-0">
              <p className="text-sm text-hc-ink-2">{n.data?.text || n.type}</p>
              <p className="text-[10px] text-hc-ink-3">{timeAgo(n.createdAt)}</p>
            </div>
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          onClose();
          const basePath = userRole === 'handyman' ? '/handyman' : '/client';
          navigate(`${basePath}/notifications`);
        }}
        className="mt-2 w-full text-center text-xs font-semibold text-hc-ink-2 py-2 hover:bg-gray-50 rounded-b-xl"
      >
        View all notifications
      </button>
    </div>
  );
}
