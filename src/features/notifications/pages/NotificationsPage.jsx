import useNotifications from '@/hooks/useNotifications';
import { markNotificationRead, markAllNotificationsRead } from '@/services/notificationService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { timeAgo } from '@/utils/time';
import { Bell, Briefcase, Wallet, MessageCircle, Star, UserPlus, CheckCheck, Flag } from 'lucide-react';

const typeConfig = {
  job: { icon: Briefcase, color: 'text-hc-accent-strong', bg: 'bg-hc-accent-50' },
  payment: { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  message: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  follow: { icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50' },
  review: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  group_report: { icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
  announcement: { icon: Bell, color: 'text-hc-brand-strong', bg: 'bg-hc-brand-50' },
};

export default function NotificationsPage() {
  const { currentUser } = useAuth();
  const { notifications, unreadCount, loading } = useNotifications();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-hc-ink">Notifications</h1>
          {unreadCount > 0 && <p className="mt-1 text-sm text-hc-ink-2">{unreadCount} unread</p>}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllNotificationsRead(currentUser.uid).catch(() => {})}
            className="inline-flex items-center gap-1.5 rounded-xl bg-hc-tile px-4 py-2.5 text-sm font-semibold text-hc-ink-2 transition-colors hover:bg-hc-page"
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {loading && (
          <div className="py-12 text-center">
            <p className="text-sm text-hc-ink-3 animate-pulse">Loading notifications...</p>
          </div>
        )}
        {!loading && !notifications.length && (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-hc-tile">
              <Bell size={24} className="text-hc-ink-3" />
            </div>
            <p className="mt-4 text-sm font-medium text-hc-ink-2">No notifications yet</p>
            <p className="mt-1 text-xs text-hc-ink-3">You&apos;ll see updates about jobs, payments, and messages here.</p>
          </div>
        )}
        {notifications.map((n) => {
          const cfg = typeConfig[n.type] || { icon: Bell, color: 'text-hc-ink-2', bg: 'bg-hc-page' };
          const Icon = cfg.icon;
          return (
            <button
              key={n.id}
              onClick={() => markNotificationRead(n.id).catch(() => {})}
              className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-4 text-left transition-all hover:shadow-sm ${
                n.read
                  ? 'border-hc-hairline bg-white'
                  : 'border-hc-brand/20 bg-hc-brand-50/40'
              }`}
            >
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cfg.color} ${cfg.bg}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-relaxed ${n.read ? 'text-hc-ink-2' : 'font-medium text-hc-ink'}`}>
                  {n.data?.text || n.data?.title || n.type}
                </p>
                <p className="mt-1 text-xs text-hc-ink-3">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-hc-brand" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
