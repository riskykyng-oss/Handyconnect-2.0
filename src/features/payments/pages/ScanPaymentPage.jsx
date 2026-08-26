import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, ScanLine, Loader2, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import PaymentScanner from '@/features/payments/components/PaymentScanner';
import PaymentSuccessScreen from '@/features/payments/components/PaymentSuccessScreen';
import EcoCashCheckout from '@/components/EcoCashCheckout';
import { decodePaymentToken, getPayment, getPaymentByCode, confirmPayment } from '@/services/paymentService';

export default function ScanPaymentPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [phase, setPhase] = useState('scan'); // scan | confirm | success | error
  const [payment, setPayment] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const resolvePayment = async (payment) => {
    if (payment?.status === 'completed') {
      setPayment(payment);
      setPhase('success');
      return;
    }
    if (payment?.status !== 'pending') {
      setErrorMsg('This payment request is no longer active.');
      setPhase('error');
      return;
    }
    setPayment(payment);
    setPhase('confirm');
  };

  const handleScan = async (text) => {
    const paymentId = decodePaymentToken(text);
    if (!paymentId) {
      toast.error('Not a valid HandyConnect payment code.');
      return;
    }
    const payment = await getPayment(paymentId);
    if (!payment) {
      toast.error('Payment request not found.');
      return;
    }
    resolvePayment(payment);
  };

  const handleManual = async () => {
    if (!codeInput.trim() || busy) return;
    setBusy(true);
    const payment = await getPaymentByCode(codeInput);
    setBusy(false);
    if (!payment) {
      toast.error('No payment request found with that code.');
      return;
    }
    resolvePayment(payment);
  };

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await confirmPayment(
        payment.id,
        currentUser.uid,
        currentUser.displayName || currentUser.name || 'Client'
      );
      setPhase('success');
    } catch (err) {
      toast.error(err?.message || 'Payment could not be completed.');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-full pb-24 lg:pb-0">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-hc-hairline bg-hc-surface p-2.5 text-hc-ink-2 transition-colors hover:bg-hc-brand-50 hover:text-hc-ink"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-hc-ink dark:text-white">Scan &amp; Pay</h1>
          <p className="mt-0.5 text-sm text-hc-caption dark:text-hc-ink-3">Point your camera at the professional's QR code.</p>
        </div>
      </div>

      {phase === 'scan' && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-hc-ink shadow-sm dark:border-hc-ink">
            <PaymentScanner onScan={handleScan} onError={(msg) => toast.error(msg)} />
          </div>

          <div className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm dark:border-hc-ink dark:bg-hc-ink">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-hc-ink dark:text-white">
              <KeyRound size={15} className="text-hc-ink-3" />
              Manual code entry
            </div>
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. AB12CD"
                maxLength={8}
                className="w-full rounded-xl border border-hc-hairline bg-hc-page px-3.5 py-2.5 font-mono text-sm uppercase tracking-widest outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-hc-ink dark:bg-hc-ink dark:text-white"
              />
              <button
                onClick={handleManual}
                disabled={!codeInput.trim() || busy}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-hc-brand px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <ScanLine size={15} />}
                Verify
              </button>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-hc-ink-3">
              <ShieldCheck size={13} className="text-emerald-500" />
              Payments are escrowed and credited instantly to the professional's wallet.
            </p>
          </div>
        </div>
      )}

      {phase === 'confirm' && (
        <div className="rounded-xl border border-black/[0.07] bg-white p-6 shadow-sm dark:border-hc-ink dark:bg-hc-ink">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-hc-hairline text-hc-accent-strong dark:bg-hc-ink dark:text-hc-ink-4">
            <ScanLine size={22} />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-hc-ink dark:text-white">Confirm payment</h2>
          <p className="mt-1 text-sm text-hc-caption dark:text-hc-ink-3">
            You are paying <span className="font-semibold text-hc-ink dark:text-white">{payment.recipientName}</span> for "{payment.jobTitle}".
          </p>

          <div className="mt-5 rounded-xl bg-hc-brand-100/70 p-5 text-center dark:bg-hc-ink/60">
            <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">Amount due</p>
            <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-hc-ink dark:text-white">${Number(payment.amount).toFixed(2)}</p>
            <p className="mt-1 text-xs text-hc-ink-3">USD · EcoCash</p>
          </div>

          {errorMsg && (
            <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-red-500">
              <AlertCircle size={13} /> {errorMsg}
            </p>
          )}

          <div className="mt-5">
            <EcoCashCheckout
              amount={payment.amount}
              recipientName={payment.recipientName}
              onSuccess={handleConfirm}
            />
          </div>
          <button
            onClick={() => setPhase('scan')}
            className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-hc-caption transition-colors hover:bg-hc-hairline dark:text-hc-ink-3 dark:hover:bg-hc-ink"
          >
            Scan again
          </button>
        </div>
      )}

      {phase === 'success' && payment && (
        <PaymentSuccessScreen payment={payment} onDone={() => navigate(-1)} />
      )}

      {phase === 'error' && (
        <div className="rounded-xl border border-black/[0.07] bg-white p-8 text-center shadow-sm dark:border-hc-ink dark:bg-hc-ink">
          <AlertCircle size={44} className="mx-auto mb-3 text-red-500" />
          <h2 className="font-display text-xl font-semibold tracking-tight text-hc-ink dark:text-white">Payment unavailable</h2>
          <p className="mt-1 text-sm text-hc-caption dark:text-hc-ink-3">{errorMsg}</p>
          <button
            onClick={() => { setPhase('scan'); setErrorMsg(''); }}
            className="mt-6 w-full rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
