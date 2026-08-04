import { useState } from 'react';
import { X, Send, Megaphone, CheckCircle2 } from 'lucide-react';
import { broadcastAnnouncement } from '@/services/notificationService';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function BroadcastModal({ open, onClose }) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  if (!open) return null;

  const reset = () => {
    setTitle('');
    setMessage('');
    setResult(null);
    setError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await broadcastAnnouncement({
        text: message.trim(),
        title: title.trim() || undefined,
        fromUid: currentUser?.uid || 'system',
      });
      setResult(res);
    } catch {
      setError('Failed to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div className="w-full max-w-md rounded-xl border border-black/[0.07] bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <Megaphone size={18} />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight text-gray-900 dark:text-white">Broadcast Announcement</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sent to every user on HandyConnect</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {result ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-500" />
            <h3 className="font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Announcement sent</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Delivered to <span className="font-bold text-gray-900 dark:text-white">{result.delivered}</span> of {result.total} users.
            </p>
            <button onClick={handleClose} className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
              Done
            </button>
          </div>
        ) : (
          <div className="p-5">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Title (optional)</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. New feature: Direct messaging"
              maxLength={80}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the announcement for all clients and handymen..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[11px] text-gray-400">{message.length}/500</span>
              {error && <span className="text-[11px] font-semibold text-red-500">{error}</span>}
            </div>
            <button
              onClick={handleSend}
              disabled={!message.trim() || sending}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
            >
              <Send size={15} />
              {sending ? 'Broadcasting...' : 'Send to all users'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
