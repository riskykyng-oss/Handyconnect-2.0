import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { format } from 'date-fns';
import {
  BadgeCheck, ReceiptText, ShieldCheck, Wallet, Star, MessageCircle,
  Search, ClipboardList, CalendarClock, CreditCard, Hash,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getUserProfile } from '@/services/userService';
import PaymentReceiptModal from '@/features/payments/components/PaymentReceiptModal';
import ReviewPromptModal from '@/features/payments/components/ReviewPromptModal';

const normalizeDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || 0));

const deriveJobRef = (jobId, date) => {
  const year = date ? date.getFullYear() : new Date().getFullYear();
  let hash = 0;
  const src = String(jobId || 'HC');
  for (let i = 0; i < src.length; i += 1) hash = (hash * 31 + src.charCodeAt(i)) % 10000;
  return `HCJ-${year}-${String(hash).padStart(4, '0')}`;
};

const txRef = (id) => `HC-PAY-${String(id || '').slice(0, 4)}-${String(id || '').slice(-4)}`.toUpperCase();

const initials = (name = '') =>
  name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'HC';

export default function PaymentSuccessScreen({ payment, onDone }) {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const [recipient, setRecipient] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [presetRating, setPresetRating] = useState(0);

  const amount = Number(payment.amount || 0);
  const completedAt = useMemo(() => normalizeDate(payment.completedAt), [payment.completedAt]);
  const jobRef = useMemo(() => deriveJobRef(payment.jobId, completedAt), [payment.jobId, completedAt]);
  const reference = useMemo(() => txRef(payment.id), [payment.id]);
  const isClient = userRole === 'client';

  useEffect(() => {
    if (!payment.recipientId) return;
    let mounted = true;
    getUserProfile(payment.recipientId)
      .then((p) => { if (mounted) setRecipient(p || {}); })
      .catch(() => {});
    return () => { mounted = false; };
  }, [payment.recipientId]);

  useEffect(() => {
    const colors = ['#f97316', '#10b981', '#3b82f6', '#fbbf24'];
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.35 }, colors });
    const t = setTimeout(() => {
      confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, colors });
      confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors });
    }, 250);
    return () => clearTimeout(t);
  }, []);

  const trade = recipient?.skills || recipient?.trade || recipient?.profession || 'Professional';

  const goTo = (path) => {
    onDone?.();
    setTimeout(() => navigate(path), 0);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30"
        >
          <motion.svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
            <path d="M20 6 9 17l-5-5" />
          </motion.svg>
        </motion.div>
        <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-hc-ink dark:text-white">Payment Successful!</h2>
        <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Your payment has been completed.</p>
      </div>

      <div className="mt-6 rounded-xl border border-black/[0.07] bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <p className="text-[11px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Amount paid</p>
        <p className="mt-1 font-display text-5xl font-semibold tracking-tight text-hc-ink dark:text-white">${amount.toFixed(2)}</p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-hc-caption dark:text-gray-400">
          <Wallet size={13} /> Paid via HandyConnect Balance
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-3 border-b border-gray-200/70 p-4 dark:border-gray-700">
          {recipient?.photoURL ? (
            <img src={recipient.photoURL} alt={payment.recipientName} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
              {initials(payment.recipientName)}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1 truncate text-sm font-semibold text-hc-ink dark:text-white">
              {payment.recipientName}
              {recipient?.verified && <BadgeCheck size={15} className="shrink-0 fill-emerald-500 text-white" />}
            </p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{trade}</p>
          </div>
          {recipient?.verified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck size={11} /> Verified
            </span>
          )}
        </div>

        <dl className="space-y-3 p-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-gray-400"><ClipboardList size={13} /> Service</dt>
            <dd className="truncate text-right font-semibold text-hc-ink dark:text-white">{payment.jobTitle}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-gray-400"><Hash size={13} /> Job number</dt>
            <dd className="font-mono text-xs font-bold text-hc-ink dark:text-white">{jobRef}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-gray-400"><CalendarClock size={13} /> Date &amp; time</dt>
            <dd className="font-semibold text-hc-ink dark:text-white">{format(completedAt, 'MMM d, yyyy · h:mm a')}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-gray-400"><CreditCard size={13} /> Payment method</dt>
            <dd className="font-semibold text-hc-ink dark:text-white">HandyConnect Balance</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-gray-400"><Hash size={13} /> Transaction ID</dt>
            <dd className="font-mono text-xs font-bold text-hc-ink dark:text-white">{reference}</dd>
          </div>
        </dl>

        <div className="flex items-center justify-between border-t border-gray-200/70 bg-emerald-50/70 px-4 py-3 dark:border-gray-700 dark:bg-emerald-500/10">
          <span className="text-xs font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Total paid</span>
          <span className="font-display text-xl font-semibold text-emerald-600 dark:text-emerald-400">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
        <ShieldCheck size={16} className="shrink-0 text-emerald-500" />
        <p className="text-xs text-emerald-700 dark:text-emerald-400">
          <span className="font-bold">Secure payment.</span> This transaction is encrypted and protected by HandyConnect.
        </p>
      </div>

      <button
        onClick={() => setReceiptOpen(true)}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
      >
        <ReceiptText size={15} /> View Receipt
      </button>
      <button
        onClick={onDone}
        className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-hc-caption transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        Done
      </button>

      <div className="mt-5 rounded-xl border border-black/[0.07] bg-white p-5 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-2 flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => { setPresetRating(n); setReviewOpen(true); }} aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}>
              <Star size={18} className="fill-amber-400 text-amber-400 transition-transform hover:scale-125" />
            </button>
          ))}
        </div>
        <p className="font-display text-sm font-semibold text-hc-ink dark:text-white">How was your experience?</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Leave a review and help others find trusted professionals.</p>
      </div>

      {isClient && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={() => { setPresetRating(0); setReviewOpen(true); }} className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <Star size={14} className="text-amber-500" /> Leave a Review
          </button>
          <button onClick={() => goTo(`/client/chat/direct/${payment.recipientId}`)} className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <MessageCircle size={14} className="text-gray-500" /> Message
          </button>
          <button onClick={() => goTo('/client/explore')} className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <Search size={14} className="text-blue-500" /> Book Again
          </button>
          <button onClick={() => goTo('/client/jobs')} className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-100 px-3 py-3 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            <ClipboardList size={14} className="text-violet-500" /> View Job
          </button>
        </div>
      )}

      <PaymentReceiptModal payment={payment} open={receiptOpen} onClose={() => setReceiptOpen(false)} />
      {reviewOpen && (
        <ReviewPromptModal
          payment={payment}
          initialRating={presetRating}
          onClose={() => setReviewOpen(false)}
        />
      )}
    </div>
  );
}
