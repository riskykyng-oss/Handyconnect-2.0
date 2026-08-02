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
          <p className="font-display text-3xl font-extrabold text-gray-900">-${value.toFixed(2)}</p>
          <p className="mt-1 text-sm text-gray-500">sent to {method} · arrives in ~30 min (demo)</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
            <input
              type="number"
              min={MIN_WITHDRAWAL}
              max={available}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-8 pr-3.5 text-lg font-bold text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setAmount(String(Math.min(available, available)))} className="rounded-lg bg-gray-100 px-3.5 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-200">
              Max
            </button>
            <p className="text-xs text-gray-400">Minimum ${MIN_WITHDRAWAL}</p>
          </div>
          <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-gray-500">Send to</label>
          <MethodSelect methods={METHODS} value={method} onChange={setMethod} />
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-gray-50 p-3">
            <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <p className="text-[11px] leading-relaxed text-gray-500">
              No fees on your first withdrawal. Processing time ~30 minutes (demo instant).
            </p>
          </div>
          <button
            onClick={handleWithdrawClick}
            disabled={busy || value < MIN_WITHDRAWAL || value > available}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600 disabled:opacity-50"
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
