import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Loader2, Wallet, ScanLine, Plus, Send, History, ReceiptText, Settings, LayoutDashboard, CreditCard, RefreshCcw, ShieldCheck, TrendingDown, ChevronRight, Check, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToWallet, subscribeToTransactions, backfillTransactionHistory } from '@/services/walletService';
import { subscribeToUserPayments } from '@/services/paymentService';
import WalletTabs from '@/features/wallet/components/WalletTabs';
import SectionCard from '@/features/wallet/components/SectionCard';
import TransactionList from '@/features/wallet/components/TransactionList';
import QuickActions from '@/features/wallet/components/QuickActions';
import AddFundsModal from '@/features/wallet/components/AddFundsModal';
import PayByCodeModal from '@/features/wallet/components/PayByCodeModal';
import TransferModal from '@/features/wallet/components/TransferModal';
import ReceiptModal from '@/features/wallet/components/ReceiptModal';
import SecuritySettingsCard from '@/features/wallet/components/SecuritySettingsCard';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'history', label: 'History', icon: ReceiptText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const normalizeDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || 0));

export default function ClientWalletPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('overview');
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [fundsOpen, setFundsOpen] = useState(false);
  const [payByCodeOpen, setPayByCodeOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState(null);

  useEffect(() => {
    if (!currentUser) return undefined;
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => {
      setWallet(w);
      setLoading(false);
    });
    backfillTransactionHistory(currentUser.uid).catch(() => {});
    const unsubTx = subscribeToTransactions(currentUser.uid, setTransactions);
    const unsubPayments = subscribeToUserPayments(currentUser.uid, 'payerId', setPayments);
    return () => { unsubWallet(); unsubTx(); unsubPayments(); };
  }, [currentUser]);

  const methods = wallet?.paymentMethods?.length ? wallet.paymentMethods : [];

  const saveMethods = (next) => {
    setWallet((w) => ({ ...w, paymentMethods: next }));
    updateDoc(doc(db, 'wallets', currentUser.uid), { paymentMethods: next }).catch(() => toast.error('Could not save payment methods.'));
  };

  const setDefaultMethod = (id) => saveMethods(methods.map((m) => ({ ...m, default: m.id === id })));
  const removeMethod = (id) => saveMethods(methods.filter((m) => m.id !== id));

  const addMethod = () => {
    const id = `method-${Date.now()}`;
    saveMethods([...methods, { id, name: 'New Method', last4: '••••', type: 'card', default: methods.length === 0 }]);
    toast.success('Payment method added');
  };

  const balance = Number(wallet?.balance || 0);
  const credits = Number(wallet?.credits || 0);
  const pendingRefunds = Number(wallet?.pending || 0);

  const activePayments = payments.filter((p) => p.status === 'pending' || p.status === 'completed');

  const refunds = transactions.filter((tx) => tx.type === 'refund' || tx.kind === 'refund');

  const spendingByMonth = useMemo(() => {
    const map = {};
    transactions
      .filter((tx) => tx.kind === 'debit' && tx.type === 'payment')
      .forEach((tx) => {
        const d = normalizeDate(tx.createdAt);
        map[`${d.getFullYear()}-${d.getMonth()}`] = (map[`${d.getFullYear()}-${d.getMonth()}`] || 0) + Number(tx.amount || 0);
      });
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ label: format(d, 'MMM'), total: map[`${d.getFullYear()}-${d.getMonth()}`] || 0 });
    }
    return months;
  }, [transactions]);

  const maxSpend = Math.max(1, ...spendingByMonth.map((m) => m.total));

  const categories = useMemo(() => {
    const map = {};
    transactions
      .filter((tx) => tx.kind === 'debit' && tx.type === 'payment')
      .forEach((tx) => {
        const c = tx.category || 'General';
        map[c] = (map[c] || 0) + Number(tx.amount || 0);
      });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  if (loading || !wallet) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-hc-ink dark:text-white">Wallet</h1>
        <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Manage your payments, refunds and receipts.</p>
      </div>

      <WalletTabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'overview' && (
        <>
          {/* Balance card */}
          <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-xs font-medium text-hc-caption dark:text-gray-400">
              <Wallet size={13} className="text-gray-400" /> Wallet Balance
            </div>
            <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-hc-ink dark:text-white">${balance.toFixed(2)}</p>
            <p className="mt-1 text-xs text-gray-400">USD · updates in real time</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-200/70 pt-4 dark:border-gray-700">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Available Credits</p>
                <p className="mt-1 font-display text-lg font-semibold text-emerald-600 dark:text-emerald-400">${credits.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Pending Refunds</p>
                <p className="mt-1 font-display text-lg font-semibold text-amber-600 dark:text-amber-400">${pendingRefunds.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <QuickActions
            items={[
              { id: 'funds', label: 'Add Funds', icon: Plus, onClick: () => setFundsOpen(true) },
              { id: 'scan', label: 'Scan QR', icon: ScanLine, onClick: () => navigate('/client/payments/scan') },
              { id: 'pay', label: 'Pay', icon: CreditCard, onClick: () => setPayByCodeOpen(true) },
              { id: 'transfer', label: 'Transfer', icon: Send, onClick: () => setTransferOpen(true) },
              { id: 'history', label: 'History', icon: History, onClick: () => setTab('history') },
            ]}
          />

          {/* Recent transactions */}
          <SectionCard title="Recent Transactions" subtitle="Your latest activity" action={
            <button onClick={() => setTab('history')} className="flex items-center gap-1 text-xs font-bold text-hc-caption hover:text-hc-ink">
              See all <ChevronRight size={13} />
            </button>
          }>
            <TransactionList transactions={transactions.slice(0, 6)} onOpen={setReceiptTx} />
          </SectionCard>

          {/* Payment methods */}
          <SectionCard title="Payment Methods" subtitle="Cards and mobile money" action={
            <button onClick={addMethod} className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              <Plus size={12} /> Add
            </button>
          }>
            <div className="space-y-2">
              {methods.length === 0 && (
                <div className="py-6 text-center text-sm text-gray-400">
                  No payment methods yet. Add a card or mobile money method to pay faster.
                </div>
              )}
              {methods.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 shadow-sm dark:bg-gray-800 dark:text-gray-300">
                    <CreditCard size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.last4}</p>
                  </div>
                  {m.default ? (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">DEFAULT</span>
                  ) : (
                    <button onClick={() => setDefaultMethod(m.id)} className="rounded-md px-2 py-0.5 text-[10px] font-bold text-gray-400 hover:text-gray-600">
                      SET DEFAULT
                    </button>
                  )}
                  <button onClick={() => removeMethod(m.id)} className="rounded-lg p-1.5 text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500" aria-label="Remove">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      {tab === 'payments' && (
        <>
          {/* Active payments */}
          <SectionCard title="Active Payments" subtitle="Jobs you are paying for">
            {activePayments.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">Payments you start will show up here once a professional confirms them.</div>
            ) : (
              <div className="space-y-2">
                {activePayments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${p.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-500'}`}>
                      {p.status === 'completed' ? <Check size={15} /> : <RefreshCcw size={15} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{p.jobTitle}</p>
                      <p className="text-xs text-gray-400">
                        {p.status === 'completed' ? 'Payment successful' : 'Waiting for confirmation'}
                      </p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-semibold text-hc-ink dark:text-white">${Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Refund centre */}
          <SectionCard title="Refund Centre" subtitle="Track your refund requests">
            <div className="space-y-2">
              {refunds.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">
                  Refund requests will appear here when you raise one.
                </div>
              )}
              {refunds.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                    <RefreshCcw size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{r.description || 'Refund'}</p>
                    <p className="text-xs text-gray-400">{format(normalizeDate(r.createdAt), 'MMM d')} · ${Number(r.amount || 0).toFixed(2)}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold capitalize text-gray-600">
                    {r.status || 'pending'}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Coupons */}
          <SectionCard title="Coupons" subtitle="Discounts and rewards">
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400 dark:border-gray-700">
              Coupons and promo codes are coming soon.
            </div>
          </SectionCard>
        </>
      )}

      {tab === 'history' && (
        <>
          {/* Spending analytics */}
          <SectionCard title="Spending Analytics" subtitle="Where your money goes">
            <div className="flex items-end gap-3">
              {spendingByMonth.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-hc-caption">{m.total > 0 ? `$${Math.round(m.total)}` : ''}</span>
                  <div className="flex h-24 w-full items-end justify-center rounded-t-lg bg-gray-200/60 dark:bg-gray-800">
                    <div className="w-full rounded-t-lg bg-gray-500 transition-all dark:bg-gray-400" style={{ height: `${Math.max(8, (m.total / maxSpend) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
            {categories.length > 0 && (
              <div className="mt-5 border-t border-gray-200/70 pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">Top categories</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map(([cat, total]) => (
                    <span key={cat} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      <TrendingDown size={12} className="text-gray-400" /> {cat} · ${Number(total).toFixed(0)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          <TransactionList transactions={transactions} onOpen={setReceiptTx} emptyText="Your payment history will appear after your first booking." />
        </>
      )}

      {tab === 'settings' && (
        <>
          <SecuritySettingsCard uid={currentUser.uid} />

          <SectionCard title="Wallet Settings" subtitle="Preferences">
            <div className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3.5 dark:border-gray-700 dark:bg-gray-800/60">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"><ShieldCheck size={15} /></span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-hc-ink dark:text-white">Currency</p>
                <p className="text-xs text-gray-400">All amounts shown in USD</p>
              </div>
              <span className="rounded-md bg-gray-200/60 px-2.5 py-1 text-xs font-bold text-gray-600">USD</span>
            </div>
          </SectionCard>
        </>
      )}

      <AddFundsModal open={fundsOpen} onClose={() => setFundsOpen(false)} />
      <PayByCodeModal open={payByCodeOpen} onClose={() => setPayByCodeOpen(false)} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <ReceiptModal tx={receiptTx} onClose={() => setReceiptTx(null)} />
    </div>
  );
}
