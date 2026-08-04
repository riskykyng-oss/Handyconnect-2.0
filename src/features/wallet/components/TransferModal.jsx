import { useState } from 'react';
import { Loader2, CheckCircle2, Send } from 'lucide-react';
import { WalletModal } from '@/features/wallet/components/WalletModal';

export default function TransferModal({ open, onClose }) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleSend = () => {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setDone(true);
    }, 900);
  };

  return (
    <WalletModal
      open={open}
      onClose={onClose}
      icon={done ? <CheckCircle2 size={18} /> : <Send size={18} />}
      title={done ? 'Transfer sent' : 'Send money'}
      subtitle={done ? '(Demo) No real transfer was made' : 'To another HandyConnect user'}
    >
      {done ? (
        <div className="px-6 py-10 text-center">
          <p className="font-display text-3xl font-semibold text-hc-ink dark:text-white">-${Number(amount).toFixed(2)}</p>
          <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">sent to {phone}</p>
          <button onClick={onClose} className="mt-6 w-full rounded-xl bg-hc-brand px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong">
            Done
          </button>
        </div>
      ) : (
        <div className="p-6">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-gray-400">Phone number</label>
          <div>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0771 234 567"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-hc-ink outline-none transition-all placeholder:text-gray-400 focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <label className="mb-1.5 mt-5 block text-xs font-bold uppercase tracking-wider text-hc-caption dark:text-gray-400">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">$</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-8 pr-3.5 text-sm text-hc-ink outline-none transition-all placeholder:text-gray-400 focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={busy || !phone.trim() || !Number(amount)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {busy ? 'Sending...' : `Send $${Number(amount) || 0}`}
          </button>
        </div>
      )}
    </WalletModal>
  );
}
