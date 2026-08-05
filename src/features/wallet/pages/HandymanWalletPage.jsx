import { useState, useEffect, useMemo } from 'react';
import { format, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { Loader2, Wallet, BarChart3, Landmark, ReceiptText, Send, History, Download, Check, RefreshCcw, FileText, Settings, QrCode } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { subscribeToWallet, subscribeToTransactions, backfillTransactionHistory } from '@/services/walletService';
import { subscribeToUserPayments, subscribeToMyPayouts, MIN_WITHDRAWAL } from '@/services/paymentService';
import WalletTabs from '@/features/wallet/components/WalletTabs';
import SectionCard from '@/features/wallet/components/SectionCard';
import TransactionList from '@/features/wallet/components/TransactionList';
import QuickActions from '@/features/wallet/components/QuickActions';
import WithdrawModal from '@/features/wallet/components/WithdrawModal';
import TransferModal from '@/features/wallet/components/TransferModal';
import ReceiptModal from '@/features/wallet/components/ReceiptModal';
import SecuritySettingsCard from '@/features/wallet/components/SecuritySettingsCard';
import RequestPaymentModal from '@/features/payments/components/RequestPaymentModal';
import { WalletModal } from '@/features/wallet/components/WalletModal';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Wallet },
  { id: 'earnings', label: 'Earnings', icon: BarChart3 },
  { id: 'withdraw', label: 'Withdraw', icon: Landmark },
  { id: 'history', label: 'History', icon: ReceiptText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const normalizeDate = (value) => (value?.toDate ? value.toDate() : value instanceof Date ? value : new Date(value || 0));

export default function HandymanWalletPage() {
  const { currentUser } = useAuth();

  const [tab, setTab] = useState('overview');
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState(null);

  useEffect(() => {
    if (!currentUser) return undefined;
    const unsubWallet = subscribeToWallet(currentUser.uid, (w) => {
      setWallet(w);
      setLoading(false);
    });
    const unsubTxs = subscribeToTransactions(currentUser.uid, setTransactions);
    backfillTransactionHistory(currentUser.uid).catch(() => {});
    const unsubPayments = subscribeToUserPayments(currentUser.uid, 'recipientId', setPayments);
    const unsubPayouts = subscribeToMyPayouts(currentUser.uid, setPayouts);
    return () => { unsubWallet(); unsubTxs(); unsubPayments(); unsubPayouts(); };
  }, [currentUser]);

  const balance = Number(wallet?.balance || 0);
  const pending = Number(wallet?.pending || 0);

  const creditTxs = useMemo(() => transactions.filter((tx) => tx.kind === 'credit'), [transactions]);
  const lifetime = useMemo(() => creditTxs.reduce((s, tx) => s + Number(tx.amount || 0), 0), [creditTxs]);

  const totalWithdrawn = useMemo(
    () => transactions.filter((tx) => tx.kind === 'debit' && tx.type === 'withdrawal').reduce((s, tx) => s + Number(tx.amount || 0), 0),
    [transactions]
  );

  const breakdown = useMemo(() => {
    const now = new Date();
    const sum = (from) => creditTxs
      .filter((tx) => normalizeDate(tx.createdAt).getTime() >= from.getTime())
      .reduce((s, tx) => s + Number(tx.amount || 0), 0);
    return [
      { label: 'Today', value: sum(startOfDay(now)) },
      { label: 'This Week', value: sum(startOfWeek(now, { weekStartsOn: 1 })) },
      { label: 'This Month', value: sum(startOfMonth(now)) },
      { label: 'This Year', value: sum(startOfYear(now)) },
    ];
  }, [creditTxs]);

  const incomeByMonth = useMemo(() => {
    const map = {};
    creditTxs.forEach((tx) => {
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
  }, [creditTxs]);

  const maxIncome = Math.max(1, ...incomeByMonth.map((m) => m.total));

  const serviceBreakdown = useMemo(() => {
    const map = {};
    creditTxs.forEach((tx) => {
      const c = tx.category || 'General';
      map[c] = (map[c] || 0) + Number(tx.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [creditTxs]);

  const maxService = Math.max(1, ...serviceBreakdown.map(([, total]) => total));
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const invoices = creditTxs.slice(0, 10);
  const linkedAccounts = wallet?.linkedAccounts || [];

  if (loading || !wallet) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-gray-400" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-24 pt-5 lg:pb-10">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-hc-ink dark:text-white">Wallet</h1>
        <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Your earnings, withdrawals and income analytics.</p>
      </div>

      <WalletTabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {tab === 'overview' && (
        <>
          {/* Earnings card */}
          <div className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-hc-caption dark:text-gray-400">Available Balance</p>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <Wallet size={18} />
              </span>
            </div>
            <p className="mt-1 font-display text-4xl font-semibold tracking-tight text-hc-ink dark:text-white">${balance.toFixed(2)}</p>
            <p className="mt-1 text-xs text-gray-400">USD · updates in real time</p>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-200/70 pt-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Pending</p>
                <p className="mt-1 font-display text-lg font-semibold text-amber-600 dark:text-amber-400">${pending.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Lifetime Earnings</p>
                <p className="mt-1 font-display text-lg font-semibold text-emerald-600 dark:text-emerald-400">${lifetime.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Total Withdrawn</p>
                <p className="mt-1 font-display text-lg font-semibold text-hc-ink dark:text-white">-${totalWithdrawn.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">Net After Withdrawals</p>
                <p className="mt-1 font-display text-lg font-semibold text-emerald-600 dark:text-emerald-400">${Math.max(0, lifetime - totalWithdrawn).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <QuickActions
            items={[
              { id: 'receive', label: 'Receive', icon: QrCode, onClick: () => setReceiveOpen(true) },
              { id: 'withdraw', label: 'Withdraw', icon: Landmark, onClick: () => setWithdrawOpen(true) },
              { id: 'transfer', label: 'Transfer', icon: Send, onClick: () => setTransferOpen(true) },
              { id: 'history', label: 'History', icon: History, onClick: () => setTab('history') },
              { id: 'invoices', label: 'Invoices', icon: FileText, onClick: () => setInvoiceOpen(true) },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, onClick: () => setTab('earnings') },
            ]}
          />

          {/* Earnings breakdown */}
          <SectionCard title="Earnings Breakdown" subtitle="Income for the current period">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {breakdown.map((b) => (
                <div key={b.label} className="rounded-xl border border-gray-200/80 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/60">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-hc-caption dark:text-gray-400">{b.label}</p>
                  <p className="mt-1 font-display text-lg font-semibold text-hc-ink dark:text-white">${b.value.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Pending payments */}
          <SectionCard title="Pending Payments" subtitle="Awaiting client confirmation">
            {pendingPayments.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No active payment requests. Tap "Receive" to create a QR code.</div>
            ) : (
              <div className="space-y-2">
                {pendingPayments.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                      <RefreshCcw size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{p.jobTitle}</p>
                      <p className="text-xs text-gray-400">Waiting · code {p.code}</p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-semibold text-hc-ink dark:text-white">${Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Linked accounts */}
          <SectionCard title="Linked Accounts" subtitle="Where you send withdrawals">
            <div className="space-y-2">
              {linkedAccounts.length === 0 && (
                <div className="py-8 text-center text-sm text-gray-400">
                  No linked accounts yet. Withdrawals will land on your account once you link one.
                </div>
              )}
              {linkedAccounts.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    <Landmark size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{a.name || 'Linked account'}</p>
                    <p className="text-xs text-gray-400">{a.detail || a.accountNumber || '—'}</p>
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">LINKED</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      {tab === 'earnings' && (
        <>
          <SectionCard title="Income Analytics" subtitle="Monthly earnings (last 6 months)">
            <div className="flex items-end gap-3">
              {incomeByMonth.map((m) => (
                <div key={m.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-500">{m.total > 0 ? `$${Math.round(m.total)}` : ''}</span>
                  <div className="flex h-28 w-full items-end justify-center rounded-t-lg bg-emerald-500/10">
                    <div className="w-full rounded-t-lg bg-emerald-500 transition-all" style={{ height: `${Math.max(8, (m.total / maxIncome) * 100)}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">{m.label}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Earnings by Service" subtitle="Which services generate the most income">
            {serviceBreakdown.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">Your income by service will appear once clients start paying you.</div>
            ) : (
              <div className="space-y-3">
                {serviceBreakdown.map(([cat, total]) => (
                  <div key={cat}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{cat}</span>
                      <span className="font-display font-semibold text-hc-ink dark:text-white">${Number(total).toFixed(0)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${(Number(total) / maxService) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Bonuses" subtitle="Rewards for quality work">
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-400 dark:border-gray-700">
              Bonuses are awarded for top-rated work — coming soon.
            </div>
          </SectionCard>
        </>
      )}

      {tab === 'withdraw' && (
        <>
          <SectionCard title="Withdraw Funds" subtitle={`Available $${balance.toFixed(2)} · Minimum $${MIN_WITHDRAWAL}`} action={
            <button
              onClick={() => setWithdrawOpen(true)}
              disabled={balance < MIN_WITHDRAWAL}
              className="flex h-11 items-center gap-1.5 rounded-xl bg-hc-brand px-4 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
            >
              <Landmark size={15} /> Withdraw
            </button>
          }>
            <div className="grid grid-cols-3 gap-2">
              {['EcoCash', 'Bank Transfer', 'ZIPIT', 'OneMoney', 'PayPal', 'Visa'].map((m) => (
                <button
                  key={m}
                  onClick={() => setWithdrawOpen(true)}
                  className="flex h-11 items-center justify-center rounded-xl border border-gray-200 px-2 text-xs font-bold text-gray-600 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-hc-ink dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-gray-200/80 bg-gray-50 p-3 text-[11px] leading-relaxed text-hc-caption dark:border-gray-700 dark:bg-gray-800/60 dark:text-gray-400">
              No fees on your first withdrawal. Withdrawals are usually processed within 30 minutes, and the funds go to your linked account. Each payout is recorded in your transaction history.
            </p>
          </SectionCard>

          <SectionCard title="Withdrawal History" subtitle="Your recent payout requests">
            {payouts.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">You haven't made any withdrawals yet.</div>
            ) : (
              <div className="space-y-2">
                {payouts.slice(0, 8).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <Check size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">Withdrawal · {p.method}</p>
                      <p className="text-xs text-gray-400">{p.createdAt ? format(normalizeDate(p.createdAt), 'MMM d, yyyy · h:mm a') : '—'}</p>
                    </div>
                    <span className="shrink-0 font-display text-sm font-semibold text-hc-ink dark:text-white">-${Number(p.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      )}

      {tab === 'history' && (
        <TransactionList transactions={transactions} onOpen={setReceiptTx} emptyText="Your earnings will show up here after clients pay you." />
      )}

      {tab === 'settings' && (
        <SecuritySettingsCard uid={currentUser.uid} />
      )}

      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} balance={balance} />
      <TransferModal open={transferOpen} onClose={() => setTransferOpen(false)} />
      <ReceiptModal tx={receiptTx} onClose={() => setReceiptTx(null)} />
      <RequestPaymentModal open={receiveOpen} onClose={() => setReceiveOpen(false)} job={null} />

      {/* Invoices */}
      <WalletModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} icon={<FileText size={18} />} title="Invoices" subtitle="Automatically generated from payments">
        <div className="p-5">
          {invoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No invoices yet — they are generated when clients pay you.</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((tx) => (
                <div key={tx.id} className="flex items-center gap-3 rounded-xl border border-gray-200/80 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/60">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <FileText size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-hc-ink dark:text-white">{tx.description || 'Payment'}</p>
                    <p className="text-xs text-gray-400">{format(normalizeDate(tx.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                  <span className="shrink-0 font-display text-sm font-semibold text-emerald-600 dark:text-emerald-400">+${Number(tx.amount || 0).toFixed(2)}</span>
                  <button onClick={() => { setInvoiceOpen(false); setReceiptTx(tx); }} className="shrink-0 rounded-lg bg-gray-100 p-2 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700" aria-label="Download invoice">
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </WalletModal>
    </div>
  );
}
