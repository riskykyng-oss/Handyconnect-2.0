import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, Smartphone, Landmark, Globe, Loader2, CheckCircle2, Plus } from 'lucide-react';
import { WalletModal, MethodSelect } from '@/features/wallet/components/WalletModal';
import SecurityGate from '@/features/wallet/components/SecurityGate';
import { addFunds } from '@/services/paymentService';
import { securityRequired } from '@/services/securityService';
import { useAuth } from '@/features/auth/context/AuthContext';

const METHODS = [
  { id: 'Visa', label: 'Visa •• 4242', icon: CreditCard },
  { id: 'Mastercard', label: 'Mastercard •• 8810', icon: CreditCard },
  { id: 'EcoCash', label: 'EcoCash 0771 •• 12', icon: Smartphone },
  { id: 'OneMoney', label: 'OneMoney •• 45', icon: Smartphone },
  { id: 'ZIPIT', label: 'ZIPIT', icon: Globe },
  { id: 'Bank Account', label: 'Bank •• 9012', icon: Landmark },
];

const QUICK_AMOUNTS = [20, 50, 100];

export default function AddFundsModal({ open, onClose }) {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(METHODS[0].id);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const handleAdd = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await addFunds(currentUser.uid, Number(amount), method);
      setDone(true);
    } catch (err) {
      toast.error(err?.message || 'Could not add funds.');
    } finally {
      setBusy(false);
    }
  };

  const handleAddClick = () => {
    if (securityRequired(currentUser.uid)) {
      setGateOpen(true);
      return;
    }
    handleAdd();
  };

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      icon={done ? <CheckCircle2 size={18} /> : <Plus size={18} />}
      title={done ? 'Funds added' : 'Add Funds'}
      subtitle={done ? 'Your wallet was topped up' : 'Top up your wallet instantly'}
    >
      {done ? (
        <div className="px-6 py-8 text-center">
          <p className="font-display text-3xl font-semibold text-hc-ink dark:text-white">+${Number(amount).toFixed(2)}</p>
          <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">via {method}</p>
          <button
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong"
          >
            Done
          </button>
        </div>
      ) : (
        <div className="p-5">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-8 pr-3.5 text-lg font-bold text-hc-ink outline-none transition-all placeholder:text-gray-400 focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="mt-3 flex gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className="rounded-lg bg-gray-100 px-3.5 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                ${a}
              </button>
            ))}
          </div>
          <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-gray-400">Pay with</label>
          <MethodSelect methods={METHODS} value={method} onChange={setMethod} />
          <button
            onClick={handleAddClick}
            disabled={busy || !Number(amount) || Number(amount) <= 0}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {busy ? 'Adding...' : `Add $${Number(amount) || 0}`}
          </button>
        </div>
      )}

      {gateOpen && (
        <SecurityGate
          uid={currentUser.uid}
          onClose={() => setGateOpen(false)}
          onVerified={() => {
            setGateOpen(false);
            handleAdd();
          }}
        />
      )}
    </WalletModal>
  );
}
