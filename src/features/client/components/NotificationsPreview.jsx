import { Bell, MessageCircle, Briefcase, Wallet, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '@/hooks/useNotifications';
import { markNotificationRead } from '@/services/notificationService';
import RailWidget from './RailWidget';
import { timeAgo, iconChip } from './dashboardUtils';

const iconMap = {
  message: MessageCircle,
  job: Briefcase,
  payment: Wallet,
  review: Star,
};

export default function NotificationsPreview() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useNotifications();

  return (
    <RailWidget
      icon={Bell}
      title="Notifications"
      actionLabel="See all"
      onAction={() => navigate('/client/notifications')}
      badge={
        unreadCount > 0 ? (
          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-hc-brand px-1.5 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-hc-ink-3" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-6 text-center">
          <span className={`${iconChip} mx-auto mb-3 h-12 w-12 rounded-2xl`}>
            <Bell size={22} />
          </span>
          <p className="text-sm font-medium text-hc-ink-2">No notifications yet</p>
        </div>
      ) : (
        <ul className="space-y-1">
          {notifications.slice(0, 4).map((n) => {
            const Icon = iconMap[n.type] || Bell;
            return (
              <li key={n.id}>
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className={`flex w-full items-center gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-gray-100 ${
                    !n.read ? 'bg-gray-50' : ''
                  }`}
                >
                  <span className={`${iconChip} h-8 w-8 shrink-0 rounded-full`}>
                    <Icon size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[13px] ${!n.read ? 'font-semibold text-hc-ink' : 'text-hc-ink-2'}`}>
                      {n.data?.text || n.type}
                    </span>
                    <span className="block text-[11px] text-hc-caption">{timeAgo(n.createdAt)}</span>
                  </span>
                  {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-hc-brand" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </RailWidget>
  );
}
