import { useState, useEffect, useMemo } from 'react';
import { Scale, CircleDollarSign, CalendarRange, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import PageHeader from '@/features/admin/components/PageHeader';
import StatCard from '@/features/admin/components/StatCard';
import StatusBadge from '@/features/admin/components/StatusBadge';
import ConfirmDialog from '@/features/admin/components/ConfirmDialog';
import { subscribeToJobs, adminResolveDispute } from '@/services/adminService';

const toMillis = (v) => (v?.toMillis ? v.toMillis() : v instanceof Date ? v.getTime() : Number(v) || 0);

export default function AdminReportsPage() {
  const [jobs, setJobs] = useState([]);
  const [toResolve, setToResolve] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => subscribeToJobs(setJobs), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const { revenue, completed, disputed, avgJobValue } = useMemo(() => {
    const completed = jobs.filter((j) => j.status === 'completed');
    const disputed = jobs.filter((j) => j.status === 'disputed');
    const revenue = completed.reduce((s, j) => s + (Number(j.budget) || 0), 0);
    const avgJobValue = completed.length ? Math.round(revenue / completed.length) : 0;
    return { revenue, completed, disputed, avgJobValue };
  }, [jobs]);

  const revenueByTrade = useMemo(() => {
    const map = {};
    completed.forEach((j) => {
      const trade = j.category || j.trade || 'Other';
      map[trade] = (map[trade] || 0) + (Number(j.budget) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [completed]);

  const monthly = useMemo(() => {
    const map = {};
    completed.forEach((j) => {
      const key = format(toMillis(j.createdAt), 'MMM yyyy');
      map[key] = map[key] || { count: 0, revenue: 0 };
      map[key].count += 1;
      map[key].revenue += Number(j.budget) || 0;
    });
    return Object.entries(map).slice(-6);
  }, [completed]);

  const doResolve = async () => {
    setBusy(true);
    try { await adminResolveDispute(toResolve.id); setToast('Dispute resolved'); } catch { setToast('Failed to resolve dispute'); }
    finally { setBusy(false); setToResolve(null); }
  };

  const resolvingJob = jobs.find((j) => j.id === toResolve?.id);
  const maxTrade = revenueByTrade[0]?.[1] || 1;

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <PageHeader
        title="Reports & Disputes"
        subtitle="Financial health and open disputes across the platform."
      />

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={`$${revenue.toLocaleString()}`} icon={CircleDollarSign} accent="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300" />
        <StatCard label="Completed Jobs" value={completed.length} icon={TrendingUp} accent="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300" />
        <StatCard label="Avg Job Value" value={`$${avgJobValue.toLocaleString()}`} icon={CalendarRange} accent="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue by trade */}
        <div className="rounded-xl border border-black/[0.07] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Revenue by Trade</h2>
          <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">From completed jobs</p>
          <div className="space-y-4">
            {revenueByTrade.map(([trade, amount]) => (
              <div key={trade} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">{trade}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                  <div className="h-full rounded-full bg-gray-200 dark:bg-gray-700" style={{ width: `${Math.round((amount / maxTrade) * 100)}%` }} />
                </div>
                <span className="w-20 shrink-0 text-right text-sm font-bold text-gray-900 dark:text-white">${amount.toLocaleString()}</span>
              </div>
            ))}
            {revenueByTrade.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No completed jobs yet.</p>}
          </div>

          <h2 className="font-display mt-8 text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Monthly Revenue</h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">Last 6 months of completed work</p>
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Month</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Jobs</th>
                  <th className="px-4 py-2.5 text-right text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {monthly.map(([month, data]) => (
                  <tr key={month} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white">{month}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-500 dark:text-gray-400">{data.count}</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900 dark:text-white">${data.revenue.toLocaleString()}</td>
                  </tr>
                ))}
                {monthly.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-sm text-gray-400">No revenue data yet.</td></tr>
                )}
              </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Disputes queue */}
        <div className="rounded-xl border border-black/[0.07] bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-5 flex items-center gap-2">
            <Scale size={17} className="text-red-500" />
            <h2 className="font-display text-lg font-semibold tracking-tight text-gray-900 dark:text-white">Open Disputes</h2>
            <span className="ml-auto rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-500/10 dark:text-red-400">{disputed.length}</span>
          </div>
          <div className="space-y-3">
            {disputed.map((job) => (
              <div key={job.id} className="rounded-xl border border-red-100 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-500/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900 dark:text-white">{job.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{job.category || 'General'} · ${Number(job.budget) || 0}</p>
                  </div>
                  <StatusBadge status="disputed" />
                </div>
                <div className="mt-2.5 rounded-lg bg-white p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white">{job.dispute?.reason}</p>
                  <p className="mt-0.5 text-gray-400">
                    Opened by {job.dispute?.openedBy} · {job.dispute?.openedAt ? format(job.dispute.openedAt.toDate ? job.dispute.openedAt.toDate() : new Date(job.dispute.openedAt), 'dd MMM, HH:mm') : '—'}
                  </p>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => setToResolve(job)}
                    className="rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
                  >
                    Resolve & reopen
                  </button>
                  <span className="text-[11px] text-gray-400">Reopens the job to new quotes</span>
                </div>
              </div>
            ))}
            {disputed.length === 0 && (
              <div className="py-12 text-center">
                <Scale className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">No open disputes. All clear!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!toResolve}
        title="Resolve this dispute?"
        message={`"${resolvingJob?.title || 'This job'}" will be reopened so clients can accept new quotes.`}
        confirmLabel="Resolve dispute"
        danger={false}
        loading={busy}
        onConfirm={doResolve}
        onCancel={() => setToResolve(null)}
      />
    </div>
  );
}
