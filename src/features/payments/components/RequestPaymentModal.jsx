import { useState, useEffect, useRef } from 'react';
import { X, QrCode, CheckCircle2, Loader2, Copy, Check, Ban, KeyRound, Briefcase } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import {
  createPaymentRequest,
  cancelPayment,
  encodePaymentToken,
  subscribeToPayment,
} from '@/services/paymentService';
import { getAssignedJobs } from '@/services/jobService';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function RequestPaymentModal({ open, onClose, job = null }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState(() => (job?.budget ? String(job.budget) : ''));
  const [note, setNote] = useState('');
  const [jobOptions, setJobOptions] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [step, setStep] = useState('setup'); // setup | active | success
  const [paymentId, setPaymentId] = useState(null);
  const [payment, setPayment] = useState(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const unsub = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (!job) {
      getAssignedJobs(currentUser.uid)
        .then(setJobOptions)
        .catch(() => setJobOptions([]));
    }
    return undefined;
  }, [open, job, currentUser]);

  useEffect(() => {
    if (!paymentId) return undefined;
    unsub.current = subscribeToPayment(paymentId, (p) => {
      if (!p) return;
      setPayment(p);
      if (p.status === 'completed') setStep('success');
    });
    return () => unsub.current?.();
  }, [paymentId]);

  if (!open) return null;

  const handleClose = () => {
    unsub.current?.();
    if (step === 'active') {
      cancelPayment(paymentId).catch(() => {});
    }
    setPaymentId(null);
    setPayment(null);
    setStep('setup');
    setError(null);
    setSelectedJobId('');
    setNote('');
    onClose();
  };

  const handleCreate = async () => {
    const value = Number(amount);
    if (!value || value <= 0 || creating) return;
    setCreating(true);
    setError(null);
    const linkedJob = job || jobOptions.find((j) => j.id === selectedJobId) || null;
    const jobTitle = linkedJob?.title || note.trim() || 'Custom payment';
    try {
      const res = await createPaymentRequest({
        jobId: linkedJob?.id || null,
        jobTitle,
        amount: value,
        recipientId: currentUser.uid,
        recipientName: currentUser.displayName || currentUser.name || 'Handyman',
      });
      setPaymentId(res.id);
      setPayment({ id: res.id, code: res.code, amount: value, status: 'pending' });
      setStep('active');
    } catch (err) {
      const denied = /permission-denied|denied/i.test(err?.message || '');
      setError(
        denied
          ? 'Firestore rules are blocking payment requests — allow writes to the "payments" collection.'
          : err?.message || 'Could not create the payment request.'
      );
    } finally {
      setCreating(false);
    }
  };

  const token = paymentId ? encodePaymentToken(paymentId) : '';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payment?.code || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  };

  const linkedJob = job || jobOptions.find((j) => j.id === selectedJobId) || null;

  const inputClass =
    'w-full rounded-xl border border-hc-hairline bg-hc-page px-3.5 py-3 text-sm text-hc-ink outline-none transition-all placeholder:text-hc-ink-3 focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-hc-ink dark:bg-hc-ink dark:text-white dark:placeholder:text-hc-ink-3';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-y-auto rounded-xl border border-black/[0.07] bg-white shadow-2xl dark:border-hc-ink dark:bg-hc-ink" onClick={(e) => e.stopPropagation()}>
        <div className="relative border-b border-hc-hairline/70 px-5 pb-5 pt-2 dark:border-hc-ink">
          <button
            onClick={handleClose}
            className="absolute right-4 top-3 rounded-full p-2 text-hc-ink-3 transition-colors hover:bg-hc-hairline hover:text-hc-accent-strong dark:hover:bg-hc-ink dark:hover:text-hc-ink-4"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          <div className="flex flex-col items-center pt-2">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-hc-brand-100 bg-hc-brand-50 text-hc-brand-500 dark:border-hc-brand-900/40 dark:bg-hc-brand-500/10 dark:text-hc-brand-400">
              <QrCode size={26} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-hc-ink dark:text-white">Request Payment</h2>
            <p className="mt-2 text-sm text-hc-caption dark:text-hc-ink-3">{linkedJob?.title || 'Receive a payment from a client'}</p>
          </div>
        </div>

        {step === 'setup' && (
          <div className="p-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-hc-ink-3">$</span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className={`${inputClass} pl-8`}
              />
            </div>

            {!job && (
              <>
                <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">Job (optional)</label>
                <div className="relative">
                  <Briefcase size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-hc-ink-3" />
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className={`${inputClass} appearance-none pl-9 pr-8`}
                  >
                    <option value="">Standalone payment (no job)</option>
                    {jobOptions.map((j) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>

                <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What's this payment for?"
                  maxLength={80}
                  className={inputClass}
                />
              </>
            )}

            <div className="mt-5 rounded-xl bg-hc-hairline p-3 text-xs text-hc-accent-strong dark:bg-hc-ink dark:text-hc-ink-4">
              A unique payment code and QR are generated automatically — the client scans the QR or enters the code to pay you.
            </div>
            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={!amount || creating}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
              {creating ? 'Generating...' : 'Generate QR & code'}
            </button>
          </div>
        )}

        {step === 'active' && (
          <div className="p-6">
            <div className="rounded-xl border border-hc-hairline/80 bg-hc-page p-6 text-center dark:border-hc-ink dark:bg-hc-ink/60">
              <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">Scan to Pay</p>
              <div className="mx-auto mt-4 flex w-fit items-center justify-center rounded-2xl bg-white p-5 shadow-sm ring-1 ring-hc-hairline dark:bg-hc-ink dark:ring-hc-ink">
                <QRCodeCanvas value={token} size={216} level="M" includeMargin={false} />
              </div>
              <h3 className="mt-5 font-display text-3xl font-semibold text-hc-ink dark:text-white">
                ${Number(payment?.amount || 0).toFixed(2)}
              </h3>
              <p className="mt-1 text-xs text-hc-caption dark:text-hc-ink-3">
                Ask the client to open <span className="font-semibold text-hc-ink dark:text-white">Scan &amp; Pay</span> and scan this code.
              </p>
            </div>

            <div className="mt-4 rounded-xl border border-hc-hairline/80 bg-hc-page p-4 text-center dark:border-hc-ink dark:bg-hc-ink/60">
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">
                <KeyRound size={11} /> Auto-generated payment code
              </p>
              <p className="mt-1.5 font-mono text-2xl font-semibold tracking-[0.35em] text-hc-ink dark:text-white">
                {payment?.code || '······'}
              </p>
              <button
                onClick={copyCode}
                className="mt-2.5 inline-flex h-9 items-center gap-1.5 rounded-lg border-hc-hairline bg-white px-3 text-xs font-bold text-hc-accent-strong transition-colors hover:bg-hc-hairline dark:border-hc-ink dark:bg-hc-ink dark:text-hc-ink-4 dark:hover:bg-hc-ink"
              >
                {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy code'}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-hc-ink-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Waiting for the client to scan...
            </div>
            <button
              onClick={handleClose}
              className="mt-3 flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-red-50 px-4 text-xs font-bold text-red-500 transition-colors hover:bg-red-100"
            >
              <Ban size={13} /> Cancel request
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="font-display text-xl font-semibold text-hc-ink dark:text-white">Payment received</h3>
            <p className="mt-1.5 text-sm text-hc-caption dark:text-hc-ink-3">
              <span className="font-semibold text-hc-ink dark:text-white">${Number(payment?.amount || 0).toFixed(2)}</span> added to your wallet for "{linkedJob?.title || note || 'Custom payment'}".
            </p>
            <button onClick={handleClose} className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-hc-brand px-8 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
