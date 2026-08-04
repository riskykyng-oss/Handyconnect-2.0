import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Star, Loader2, CheckCircle2 } from 'lucide-react';
import { WalletModal } from '@/features/wallet/components/WalletModal';
import { createReview } from '@/services/reviewService';
import { useAuth } from '@/features/auth/context/AuthContext';

const LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function ReviewPromptModal({ payment, initialRating = 0, onClose, onSubmitted }) {
  const { currentUser } = useAuth();
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!rating || busy) return;
    setBusy(true);
    try {
      await createReview({
        jobId: payment.jobId || null,
        handymanId: payment.recipientId,
        clientId: currentUser.uid,
        clientName: currentUser.displayName || currentUser.name || 'Client',
        rating,
        comment,
      });
      setDone(true);
      onSubmitted?.();
      toast.success('Thanks for your review!');
    } catch {
      toast.error('Could not submit your review.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <WalletModal
      open
      onClose={onClose}
      icon={done ? <CheckCircle2 size={18} /> : <Star size={18} />}
      title={done ? 'Review submitted' : 'Leave a review'}
      subtitle={done ? 'Your feedback helps others.' : `How was ${payment.recipientName || 'your professional'}?`}
    >
      {done ? (
        <div className="p-6 text-center">
          <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
          <p className="mt-3 text-lg font-semibold tracking-tight text-hc-ink dark:text-white">Thank you!</p>
          <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Your review helps others find trusted professionals.</p>
          <button onClick={onClose} className="mt-5 w-full rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
            Done
          </button>
        </div>
      ) : (
        <div className="p-5">
          <div className="flex items-center justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = n <= (hover || rating);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  className="transition-transform hover:scale-110"
                >
                  <Star size={32} className={active ? 'fill-amber-400 text-amber-400' : 'text-gray-200 dark:text-gray-600'} />
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
            {rating ? LABELS[rating - 1] : 'Tap a star to rate'}
          </p>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell others about your experience (optional)..."
            maxLength={500}
            rows={3}
            className="mt-4 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />

          <button
            onClick={submit}
            disabled={!rating || busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
            {busy ? 'Submitting...' : 'Submit review'}
          </button>
        </div>
      )}
    </WalletModal>
  );
}
