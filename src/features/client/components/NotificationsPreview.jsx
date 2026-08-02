import { motion } from 'framer-motion';
import { Bell, MessageCircle, Briefcase, Wallet, Star, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useNotifications from '@/hooks/useNotifications';

const iconMap = {
  message: MessageCircle,
  job: Briefcase,
  payment: Wallet,
  review: Star,
};

const iconBg = {
  message: 'bg-blue-100 text-blue-600',
  job: 'bg-amber-100 text-amber-600',
  payment: 'bg-emerald-100 text-emerald-600',
  review: 'bg-purple-100 text-purple-600',
};

function formatNotifTime(date) {
  if (!date) return '';
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function NotificationsPreview() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading } = useNotifications();

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-orange-500" />
          <h3 className="font-display text-sm font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-orange-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={() => navigate('/notifications')} className="flex items-center gap-1 text-xs font-semibold text-orange-500 hover:underline">
          See all <ArrowRight size={12} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-gray-400" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-6 text-center text-sm text-gray-400">
          <Bell size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.slice(0, 4).map((n) => {
            const Icon = iconMap[n.type] || Bell;
            const bg = iconBg[n.type] || 'bg-gray-100 text-gray-600';
            return (
              <motion.button
                key={n.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-colors hover:bg-gray-50 ${!n.read ? 'bg-orange-50/50' : ''}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm ${!n.read ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {n.data?.text || n.type}
                  </p>
                  <p className="text-[11px] text-gray-400">{formatNotifTime(n.createdAt)}</p>
                </div>
                {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-orange-500" />}
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}
