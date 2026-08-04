import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { KeyRound, Lock, Loader2, Trash2, ShieldCheck } from 'lucide-react';
import { WalletModal } from '@/features/wallet/components/WalletModal';
import {
  getSecurity,
  setPin,
  setPassword,
  removePin,
  removePassword,
  verifyPin,
  verifyPassword,
  validatePin,
  validatePassword,
} from '@/services/securityService';

export default function SecuritySetupModal({ uid, mode, onClose }) {
  const isPin = mode === 'pin';
  const [step, setStep] = useState(() => (isPin ? getSecurity(uid).pin : getSecurity(uid).password) ? 'verify' : 'create');
  const [current, setCurrent] = useState('');
  const [secret, setSecret] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const label = isPin ? 'Payment PIN' : 'Payment password';
  const placeholder = isPin ? '4-6 digits' : '6+ characters';

  const doVerify = async () => {
    if (!current || busy) return;
    setBusy(true);
    setError('');
    const res = isPin ? await verifyPin(uid, current) : await verifyPassword(uid, current);
    setBusy(false);
    if (res.ok) {
      setCurrent('');
      setStep('change');
    } else {
      setError(res.error || 'Incorrect');
    }
  };

  const doSave = async () => {
    if (!secret) {
      setError(isPin ? 'Enter a PIN' : 'Enter a password');
      return;
    }
    if (isPin && !validatePin(secret)) {
      setError('PIN must be 4-6 digits');
      return;
    }
    if (!isPin && !validatePassword(secret)) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (secret !== confirm) {
      setError('Values do not match');
      return;
    }
    setBusy(true);
    setError('');
    try {
      if (isPin) await setPin(uid, secret);
      else await setPassword(uid, secret);
      toast.success(`${label} saved`);
      onClose();
    } catch (e) {
      setError(e?.message || 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const doRemove = () => {
    if (isPin) removePin(uid);
    else removePassword(uid);
    toast.success(`${label} removed`);
    onClose();
  };

  return (
    <WalletModal
      open
      onClose={onClose}
      icon={isPin ? <KeyRound size={18} /> : <Lock size={18} />}
      title={label}
      subtitle={step === 'verify' ? 'Confirm your current one' : step === 'change' ? 'Choose a new one' : 'Set up your security'}
    >
      <div className="p-5">
        {step === 'verify' && (
          <>
            <input
              type="password"
              inputMode={isPin ? 'numeric' : undefined}
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder={isPin ? 'Current PIN' : 'Current password'}
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            <button
              onClick={doVerify}
              disabled={!current || busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              Continue
            </button>
          </>
        )}

        {step === 'create' && (
          <>
            <input
              type="password"
              inputMode={isPin ? 'numeric' : undefined}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={placeholder}
              maxLength={isPin ? 6 : undefined}
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="password"
              inputMode={isPin ? 'numeric' : undefined}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm"
              maxLength={isPin ? 6 : undefined}
              className="mt-2.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            <button
              onClick={doSave}
              disabled={busy || !secret || !confirm}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              Save {label}
            </button>
          </>
        )}

        {step === 'change' && (
          <>
            <input
              type="password"
              inputMode={isPin ? 'numeric' : undefined}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder={placeholder}
              maxLength={isPin ? 6 : undefined}
              autoFocus
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <input
              type="password"
              inputMode={isPin ? 'numeric' : undefined}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm"
              maxLength={isPin ? 6 : undefined}
              className="mt-2.5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm outline-none transition-all focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}
            <button
              onClick={doSave}
              disabled={busy || !secret || !confirm}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
              Save {label}
            </button>
            <button
              onClick={doRemove}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
            >
              <Trash2 size={14} /> Remove {label}
            </button>
          </>
        )}
      </div>
    </WalletModal>
  );
}
