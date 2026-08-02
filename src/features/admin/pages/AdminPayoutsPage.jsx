import { useState, useEffect, useMemo } from 'react';
import { Wallet, CircleDollarSign, Receipt, X, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PageHeader from '@/features/admin/components/PageHeader';
import StatCard from '@/features/admin/components/StatCard';
import { listAllWallets, listAllPayouts, adminProcessPayout, subscribeToUsers } from '@/services/adminService';

const PAYOUT_METHODS = ['Mobile Money', 'Bank Transfer', 'Cash'];

export default function AdminPayoutsPage() {
  const [wallets, setWallets] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(PAYOUT_METHODS[0]);
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState(null);

  const refresh = () => {
    listAllWallets().then(setWallets).catch(() => setWallets([]));
    listAllPayouts().then(setPayouts).catch(() => setPayouts([]));
  };

  useEffect(() => {
    refresh();
    return subscribeToUsers(setUsers);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const nameMap = useMemo(() => {
    const map = {};
    users.forEach((u) => { map[u.id] = u.displayName || u.email || u.id; });
    return map;
  }, [users]);

  const due = useMemo(() => wallets.filter((w) => Number(w.balance) > 0), [wallets]);
  const totalAvailable = due.reduce((s, w) => s + Number(w.balance), 0);
  const totalPaid = payouts.reduce((s, p) => s + Number(p.amount), 0);

  const openPayout = (wallet) => {
    setSelected(wallet);
    setAmount(String(Number(wallet.balance) || 0));
    setMethod(PAYOUT_METHODS[0]);
  };

  const doPayout = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await adminProcessPayout(selected.id, Number(amount), method);
      setToast('Payout processed');
      setSelected(null);
      refresh();
    } catch (e) {
      setToast(e.message || 'Payout failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <PageHeader
        title="Wallet Payouts"
        subtitle="Pay out handyman earnings held in platform wallets."
      />

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Available for payout" value={`$${totalAvailable.toLocaleString()}`} icon={Wallet} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" trendLabel={`${due.length} wallets`} />
        <StatCard label="Payouts processed" value={payouts.length} icon={Receipt} accent="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
        <StatCard label="Total paid out" value={`$${totalPaid.toLocaleString()}`} icon={CircleDollarSign} accent="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Pending Withdrawals</h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Handyman wallets with a positive balance</p>
          <div className="space-y-2.5">
            {due.map((wallet) => (
              <div key={wallet.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {(nameMap[wallet.id] || wallet.id[0] || '?').toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{nameMap[wallet.id] || wallet.id.slice(0, 12)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available: <span className="font-bold text-emerald-600 dark:text-emerald-400">${Number(wallet.balance).toLocaleString()}</span>{Number(wallet.pending) > 0 ? ` · Pending: $${Number(wallet.pending)}` : ''}</p>
                </div>
                <button onClick={() => openPayout(wallet)} className="shrink-0 rounded-lg bg-orange-500 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-orange-600">
                  Pay out
                </button>
              </div>
            ))}
            {due.length === 0 && (
              <div className="py-12 text-center">
                <Wallet className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No balances awaiting payout.</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Payout History</h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Recently processed payouts</p>
          <div className="space-y-2.5">
            {payouts.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-50/60 p-3.5 dark:bg-gray-800/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                  <Send size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{nameMap[p.handymanId] || p.handymanId.slice(0, 12)}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.method} · {p.createdAt ? formatDistanceToNow(p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt), { addSuffix: true }) : '—'}</p>
                </div>
                <span className="shrink-0 text-sm font-bold text-emerald-600 dark:text-emerald-400">${Number(p.amount).toLocaleString()}</span>
              </div>
            ))}
            {payouts.length === 0 && (
              <div className="py-12 text-center">
                <Receipt className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No payouts yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-gray-900 dark:text-white">Process payout</h3>
              <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800" aria-label="Close">
                <X size={16} />
              </button>
            </div>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Paying <span className="font-bold text-gray-900 dark:text-white">{nameMap[selected.id] || selected.id.slice(0, 12)}</span>. Available balance: <span className="font-bold text-emerald-600 dark:text-emerald-400">${Number(selected.balance).toLocaleString()}</span>.
            </p>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Amount (USD)</label>
            <input
              type="number"
              min="0"
              max={Number(selected.balance)}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Method</label>
            <div className="grid grid-cols-3 gap-2">
              {PAYOUT_METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-xl border px-2 py-2 text-xs font-bold transition-colors ${method === m ? 'border-orange-400 bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' : 'border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button
              onClick={doPayout}
              disabled={processing || !Number(amount) || Number(amount) > Number(selected.balance)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
            >
              <Send size={15} />
              {processing ? 'Processing...' : `Payout $${Number(amount) || 0}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
