import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Bell, Briefcase, Wallet, MessageCircle, Star, UserPlus, Flag } from 'lucide-react';
import { markNotificationRead } from '@/services/notificationService';

const typeConfig = {
  job: { icon: Briefcase, color: 'text-hc-accent-strong', bg: 'bg-hc-accent-50' },
  payment: { icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  message: { icon: MessageCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
  follow: { icon: UserPlus, color: 'text-pink-600', bg: 'bg-pink-50' },
  review: { icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
  group_report: { icon: Flag, color: 'text-red-600', bg: 'bg-red-50' },
  announcement: { icon: Bell, color: 'text-hc-brand-strong', bg: 'bg-hc-brand-50' },
};

export default function NotificationPopup({ notifications }) {
  const [visible, setVisible] = useState([]);
  const shownRef = useRef(new Set());
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    setVisible((prev) => prev.filter((n) => n.id !== id));
    const t = timersRef.current.get(id);
    if (t) { clearTimeout(t); timersRef.current.delete(id); }
  }, []);

  useEffect(() => {
    if (!notifications.length) return;
    const newest = notifications[0];
    if (!newest || shownRef.current.has(newest.id) || newest.read) return;

    shownRef.current.add(newest.id);

    const queueUpdate = () => {
      setVisible((prev) => [...prev, newest]);
      const timer = setTimeout(() => {
        setVisible((prev) => prev.filter((n) => n.id !== newest.id));
        timersRef.current.delete(newest.id);
      }, 5000);
      timersRef.current.set(newest.id, timer);
    };

    const raf = requestAnimationFrame(queueUpdate);
    return () => cancelAnimationFrame(raf);
  }, [notifications]);

  const handleClick = (n) => {
    markNotificationRead(n.id).catch(() => {});
    dismiss(n.id);
  };

  if (!visible.length) return null;

  return (
    <div className="fixed right-4 top-20 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none" aria-live="polite">
      {visible.map((n) => {
        const cfg = typeConfig[n.type] || { icon: Bell, color: 'text-hc-ink-2', bg: 'bg-hc-brand-50' };
        const Icon = cfg.icon;
        return (
          <div
            key={n.id}
            className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-hc-hairline bg-hc-surface p-4 shadow-[0_8px_30px_rgba(17,24,39,0.12)] animate-[slideIn_0.3s_ease-out]"
            onClick={() => handleClick(n)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleClick(n)}
          >
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${cfg.color} ${cfg.bg}`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-hc-ink line-clamp-2">
                {n.data?.text || n.data?.title || n.type}
              </p>
              <p className="mt-0.5 text-[11px] text-hc-ink-2">Just now</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
              aria-label="Dismiss notification"
              className="shrink-0 rounded-lg p-1 text-hc-ink-3 transition-colors hover:bg-hc-brand-50 hover:text-hc-ink-2"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
