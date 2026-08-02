import { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, KeyRound, Lock, Loader2, X } from 'lucide-react';
import { getSecurity, lockInfo, verifyPin, verifyPassword, verifyBiometric } from '@/services/securityService';

export default function SecurityGate({ uid, onClose, onVerified }) {
  const [security] = useState(() => getSecurity(uid));
  const [lock, setLock] = useState(() => lockInfo(uid));
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!lock.locked) return undefined;
    const t = setInterval(() => setLock(lockInfo(uid)), 1000);
    return () => clearInterval(t);
  }, [lock.locked, uid]);

  const handlePin = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const res = await verifyPin(uid, pin);
    setBusy(false);
    if (res.ok) {
      onVerified();
      return;
    }
    setPin('');
    setLock(lockInfo(uid));
    setError(res.error || 'Incorrect PIN');
  };

  const handlePassword = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    const res = await verifyPassword(uid, password);
    setBusy(false);
    if (res.ok) {
      onVerified();
      return;
    }
    setPassword('');
    setLock(lockInfo(uid));
    setError(res.error || 'Incorrect password');
  };

  const handleBiometric = async () => {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const ok = await verifyBiometric(uid);
      if (ok) {
        onVerified();
        return;
      }
      setError('Could not verify your identity');
    } catch (e) {
      setError(e?.name === 'NotAllowedError' ? 'Biometric check was cancelled.' : 'Biometrics are not available here.');
    } finally {
      setBusy(false);
    }
  };

  const showCountdown = lock.locked && lock.remainingSec > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-gray-100 shadow-2xl dark:border-gray-700 dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200/70 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="font-display text-base font-extrabold text-gray-900 dark:text-white">Confirm your identity</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Secure this transaction</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-800" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {showCountdown ? (
            <div className="rounded-xl bg-amber-50 p-4 text-center dark:bg-amber-500/10">
              <p className="text-sm font-bold text-amber-600">Too many attempts</p>
              <p className="mt-1 text-xs text-amber-500">Try again in {lock.remainingSec}s</p>
            </div>
          ) : (
            <div className="space-y-3">
              {security.biometric && (
                <button
                  onClick={handleBiometric}
                  disabled={busy}
                  className="flex w-full items-center gap-3 rounded-xl border-2 border-gray-200 bg-gray-900 p-4 text-white transition-colors hover:bg-gray-800 disabled:opacity-60 dark:border-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  <Fingerprint size={20} className="shrink-0 text-orange-400 dark:text-orange-500" />
                  <span className="flex-1 text-left text-sm font-bold">Use Face ID / Fingerprint</span>
                  {busy && <Loader2 size={15} className="animate-spin" />}
                </button>
              )}

              {security.pin && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payment PIN</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      inputMode="numeric"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter PIN"
                      maxLength={6}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm tracking-widest outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <button onClick={handlePin} disabled={busy || !pin} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900">
                      <KeyRound size={14} /> Unlock
                    </button>
                  </div>
                </div>
              )}

              {security.password && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Payment password</label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <button onClick={handlePassword} disabled={busy || !password} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-gray-900">
                      <Lock size={14} /> Unlock
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <p className="mt-3 text-xs font-semibold text-red-500">{error}</p>}

          {!showCountdown && (
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
