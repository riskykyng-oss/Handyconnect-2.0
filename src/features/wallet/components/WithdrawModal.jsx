import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Smartphone, Landmark, Globe, Loader2, CheckCircle2, ArrowDownToLine, Info } from 'lucide-react';
import { WalletModal, MethodSelect } from '@/features/wallet/components/WalletModal';
import SecurityGate from '@/features/wallet/components/SecurityGate';
import { requestWithdrawal, MIN_WITHDRAWAL } from '@/services/paymentService';
import { securityRequired } from '@/services/securityService';
import { useAuth } from '@/features/auth/context/AuthContext';

const METHODS = [
  { id: 'EcoCash', label: 'EcoCash', icon: Smartphone },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: Landmark },
  { id: 'ZIPIT', label: 'ZIPIT', icon: Globe },
  { id: 'OneMoney', label: 'OneMoney', icon: Smartphone },
  { id: 'PayPal', label: 'PayPal', icon: Globe },
  { id: 'Visa', label: 'Visa', icon: CreditCard },
];

export default function WithdrawModal({ open, onClose, balance }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(METHODS[0].id);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const available = Number(balance || 0);
  const value = Number(amount) || 0;

  const handleWithdraw = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await requestWithdrawal(currentUser.uid, value, method);
      setDone(true);
    } catch (err) {
      toast.error(err?.message || 'Withdrawal failed.');
    } finally {
      setBusy(false);
    }
  };

  const handleWithdrawClick = () => {
    if (securityRequired(currentUser.uid)) {
      setGateOpen(true);
      return;
    }
    handleWithdraw();
  };

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      icon={done ? <CheckCircle2 size={18} /> : <ArrowDownToLine size={18} />}
      title={done ? 'Withdrawal requested' : 'Withdraw funds'}
      subtitle={done ? 'Money is on its way' : `Available balance $${available.toFixed(2)}`}
    >
      {done ? (
        <div className="px-6 py-10 text-center">
          <p className="font-display text-3xl font-semibold text-hc-ink dark:text-white">-${value.toFixed(2)}</p>
          <p className="mt-1 text-sm text-hc-caption dark:text-hc-ink-3">sent to {method} · arrives in ~30 min (demo)</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-hc-ink-3">$</span>
            <input
              type="number"
              min={MIN_WITHDRAWAL}
              max={available}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border-hc-hairline bg-hc-page py-3 pl-8 pr-3.5 text-lg font-bold text-hc-ink outline-none transition-all placeholder:text-hc-ink-3 focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-hc-ink dark:bg-hc-ink dark:text-white"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setAmount(String(Math.min(available, available)))} className="rounded-lg bg-hc-hairline px-3.5 py-1.5 text-xs font-bold text-hc-accent-strong transition-colors hover:bg-hc-hairline dark:bg-hc-ink dark:text-hc-ink-4 dark:hover:bg-hc-ink">
              Max
            </button>
            <p className="text-xs text-hc-ink-3">Minimum ${MIN_WITHDRAWAL}</p>
          </div>
          <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-hc-ink-3">Send to</label>
          <MethodSelect methods={METHODS} value={method} onChange={setMethod} />
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-hc-page p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-hc-ink-3" />
            <p className="text-[11px] leading-relaxed text-hc-caption dark:text-hc-ink-3">
              No fees on your first withdrawal. Processing time ~30 minutes (demo instant).
            </p>
          </div>
          <button
            onClick={handleWithdrawClick}
            disabled={busy || value < MIN_WITHDRAWAL || value > available}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ArrowDownToLine size={15} />}
            {busy ? 'Processing...' : `Withdraw $${value || 0}`}
          </button>
        </div>
      )}

      {gateOpen && (
        <SecurityGate
          uid={currentUser.uid}
          onClose={() => setGateOpen(false)}
          onVerified={() => {
            setGateOpen(false);
            handleWithdraw();
          }}
        />
      )}
    </WalletModal>
  );
}
