import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { KeyRound, Loader2, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { WalletModal } from '@/features/wallet/components/WalletModal';
import SecurityGate from '@/features/wallet/components/SecurityGate';
import PaymentSuccessScreen from '@/features/payments/components/PaymentSuccessScreen';
import { getPaymentByCode, confirmPayment } from '@/services/paymentService';
import { securityRequired } from '@/services/securityService';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function PayByCodeModal({ open, onClose }) {
  const { currentUser } = useAuth();
  const [code, setCode] = useState('');
  const [step, setStep] = useState('enter'); // enter | confirm | success
  const [payment, setPayment] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [gateOpen, setGateOpen] = useState(false);

  const handleLookup = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setError('');
    const p = await getPaymentByCode(code);
    setBusy(false);
    if (!p || p.status !== 'pending') {
      setError('No active payment found with that code.');
      return;
    }
    setPayment(p);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await confirmPayment(payment.id, currentUser.uid, currentUser.displayName || currentUser.name || 'Client');
      setStep('success');
    } catch (err) {
      toast.error(err?.message || 'Payment failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmClick = () => {
    if (securityRequired(currentUser.uid)) {
      setGateOpen(true);
      return;
    }
    handleConfirm();
  };

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      icon={step === 'success' ? <CheckCircle2 size={18} /> : <KeyRound size={18} />}
      title={step === 'success' ? 'Payment sent' : step === 'confirm' ? 'Confirm payment' : 'Pay by code'}
      subtitle={step === 'success' ? 'The professional was credited' : 'Enter the 6-character code from the QR'}
    >
      {step === 'success' ? (
        <div className="max-h-[80vh] overflow-y-auto px-2 pb-6 pt-2">
          <PaymentSuccessScreen payment={payment} onDone={onClose} />
        </div>
      ) : step === 'enter' ? (
        <div className="p-5">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AB12CD"
            maxLength={8}
            autoFocus
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-center font-mono text-lg uppercase tracking-[0.3em] text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
          />
          {error && <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-500"><AlertCircle size={13} /> {error}</p>}
          <button
            onClick={handleLookup}
            disabled={!code.trim() || busy}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />}
            {busy ? 'Checking...' : 'Continue'}
          </button>
        </div>
      ) : (
        <div className="p-5">
          <div className="rounded-xl bg-gray-50 p-4 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-gray-500">Amount</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-gray-900">${Number(payment.amount).toFixed(2)}</p>
          </div>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Pay to</dt><dd className="font-bold text-gray-900">{payment.recipientName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Job</dt><dd className="truncate font-bold text-gray-900">{payment.jobTitle}</dd></div>
          </dl>
          <button
            onClick={handleConfirmClick}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
            {busy ? 'Processing...' : `Pay $${Number(payment.amount).toFixed(2)}`}
          </button>
          <button onClick={() => setStep('enter')} className="mt-2 w-full rounded-xl px-4 py-2 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50">
            Enter another code
          </button>
        </div>
      )}

      {gateOpen && (
        <SecurityGate
          uid={currentUser.uid}
          onClose={() => setGateOpen(false)}
          onVerified={() => {
            setGateOpen(false);
            handleConfirm();
          }}
        />
      )}
    </WalletModal>
  );
}
