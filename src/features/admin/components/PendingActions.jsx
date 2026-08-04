import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Timer, ShieldOff, DollarSign, BadgeCheck, Wallet, ChevronRight, Inbox } from 'lucide-react';
import { listAllWallets } from '@/services/adminService';

const toMillis = (v) => (v?.toMillis ? v.toMillis() : v instanceof Date ? v.getTime() : Number(v) || 0);

export default function PendingActions({ users, jobs }) {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    listAllWallets().then(setWallets).catch(() => setWallets([]));
  }, []);

  const items = useMemo(() => {
    const openJobs = jobs.filter((j) => j.status === 'open');
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    const aging = openJobs.filter((j) => toMillis(j.createdAt) && toMillis(j.createdAt) < twoDaysAgo);
    const lowBudget = openJobs.filter((j) => Number(j.budget) > 0 && Number(j.budget) < 20);
    const suspended = users.filter((u) => u.suspended);
    const verifications = users.filter((u) => u.verifiedRequest === 'pending');
    const payoutsDue = wallets.filter((w) => Number(w.balance) > 0);

    return [
      { key: 'disputes', icon: Scale, accent: 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400', title: 'Open disputes', desc: 'Need a decision from you', count: jobs.filter((j) => j.status === 'disputed').length, to: '/admin/reports', danger: true },
      { key: 'verifications', icon: BadgeCheck, accent: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300', title: 'Verification requests', desc: 'Approve or reject pro badges', count: verifications.length, to: '/admin/verifications' },
      { key: 'payouts', icon: Wallet, accent: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300', title: 'Payouts due', desc: 'Wallet balances awaiting withdrawal', count: payoutsDue.length, to: '/admin/payouts' },
      { key: 'aging', icon: Timer, accent: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300', title: 'Aging open jobs', desc: 'No handyman assigned in 48h+', count: aging.length, to: '/admin/jobs' },
      { key: 'suspended', icon: ShieldOff, accent: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300', title: 'Suspended users', desc: 'Accounts currently disabled', count: suspended.length, to: '/admin/users' },
      { key: 'lowBudget', icon: DollarSign, accent: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300', title: 'Low-budget flags', desc: 'Open jobs under $20', count: lowBudget.length, to: '/admin/jobs' },
    ];
  }, [users, jobs, wallets, now]);

  const total = items.reduce((s, i) => s + i.count, 0);

  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
            <Inbox size={18} className="text-gray-500 dark:text-gray-400" />
            Needs Attention
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Things that could use your review</p>
        </div>
        {total > 0 && (
          <span className="flex h-7 min-w-[28px] items-center justify-center rounded-full bg-orange-500 px-2 text-xs font-bold text-white">
            {total}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => navigate(item.to)}
            className={`group flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all hover:shadow-sm ${item.danger ? 'border-red-100 bg-red-50/60 hover:bg-red-50 dark:border-red-500/20 dark:bg-red-500/5 dark:hover:bg-red-500/10' : 'border-gray-100 bg-gray-50/60 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-800/40 dark:hover:bg-gray-800'}`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.accent}`}>
              <item.icon size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
            </div>
            <span className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-1.5 text-xs font-bold ${item.count > 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'}`}>
              {item.count}
            </span>
            <ChevronRight size={15} className="shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 dark:text-gray-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
