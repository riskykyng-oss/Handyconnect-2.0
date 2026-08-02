import { useState, useEffect, useMemo } from 'react';
import { Users, UserCheck, Briefcase, ClipboardCheck, CheckCircle, CircleDollarSign, MessageSquare, TrendingUp, Activity, Megaphone } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import StatCard from '@/features/admin/components/StatCard';
import PendingActions from '@/features/admin/components/PendingActions';
import BroadcastModal from '@/features/admin/components/BroadcastModal';
import { subscribeToUsers, subscribeToJobs } from '@/services/adminService';
import { subscribeToPosts } from '@/services/postService';

const TRADE_ACCENTS = [
  'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  'bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  'bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
];

const toMillis = (v) => (v?.toMillis ? v.toMillis() : v instanceof Date ? v.getTime() : Number(v) || 0);

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const todayLabel = format(new Date(), 'dd MMM');
  return (
    <div className="flex h-44 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-[10px] font-bold text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 dark:text-gray-500">{d.count}</span>
          <div
            className={`w-full rounded-t-md transition-colors ${d.count > 0 ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-100 dark:bg-gray-800'}`}
            style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 8 : 3)}%` }}
          />
          <span className={`text-[10px] text-gray-400 dark:text-gray-500 ${d.isToday ? 'font-bold text-orange-500 dark:text-orange-400' : ''}`}>
            {d.isToday ? todayLabel : format(d.label, 'dd')}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [posts, setPosts] = useState([]);
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  useEffect(() => subscribeToUsers(setUsers), []);
  useEffect(() => subscribeToJobs(setJobs), []);
  useEffect(() => subscribeToPosts(setPosts), []);

  const stats = useMemo(() => {
    const handymen = users.filter((u) => u.role === 'handyman');
    const clients = users.filter((u) => u.role === 'client');
    const active = jobs.filter((j) => j.status === 'assigned' || j.status === 'in-progress');
    const completed = jobs.filter((j) => j.status === 'completed');
    const disputed = jobs.filter((j) => j.status === 'disputed');
    const revenue = completed.reduce((sum, j) => sum + (Number(j.budget) || 0), 0);
    const withPhotos = handymen.filter((h) => h.photoURL || h.avatar);
    return { total: users.length, handymen: handymen.length, clients: clients.length, jobs: jobs.length, active: active.length, completed: completed.length, disputed: disputed.length, revenue, posts: posts.length, proCompletion: handymen.length ? Math.round((withPhotos.length / handymen.length) * 100) : 0 };
  }, [users, jobs, posts]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (13 - i));
      return { label: d, key: d.toDateString(), count: 0, isToday: i === 13 };
    });
    jobs.forEach((job) => {
      const t = toMillis(job.createdAt);
      if (!t) return;
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      const slot = days.find((x) => x.key === d.toDateString());
      if (slot) slot.count += 1;
    });
    return days;
  }, [jobs]);

  const revenueByTrade = useMemo(() => {
    const map = {};
    jobs.filter((j) => j.status === 'completed').forEach((j) => {
      const trade = j.category || j.trade || 'Other';
      map[trade] = (map[trade] || 0) + (Number(j.budget) || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [jobs]);

  const activity = useMemo(() => {
    const jobEvents = jobs.slice(0, 5).map((j) => ({
      id: `j-${j.id}`,
      icon: Briefcase,
      accent: 'bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
      title: `${j.title || 'A job'} posted`,
      detail: j.description ? j.description.slice(0, 60) : `Budget $${j.budget || 0}`,
      time: toMillis(j.createdAt),
    }));
    const userEvents = users.slice(0, 5).map((u) => ({
      id: `u-${u.id}`,
      icon: Users,
      accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
      title: `${u.displayName || u.email} joined`,
      detail: `New ${u.role || 'pending'} account`,
      time: toMillis(u.createdAt),
    }));
    return [...jobEvents, ...userEvents].sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 8);
  }, [jobs, users]);

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <div className="mb-8 flex items-center justify-between rounded-2xl bg-gray-900 p-8 text-white shadow-lg dark:border dark:border-gray-700">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Platform Overview</h1>
          <p className="mt-1 text-gray-400">Monitor users, jobs, revenue and community activity in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setBroadcastOpen(true)}
            className="hidden items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-orange-600 md:flex"
          >
            <Megaphone size={15} /> Broadcast
          </button>
          <div className="hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-orange-400 md:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
            </span>
            Live Data
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Total Users" value={stats.total} icon={Users} accent="bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400" trendLabel={`${stats.handymen} handymen · ${stats.clients} clients`} />
        <StatCard label="Handymen" value={stats.handymen} icon={UserCheck} accent="bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" trendLabel={`${stats.proCompletion}% have a photo`} />
        <StatCard label="Clients" value={stats.clients} icon={Users} accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
        <StatCard label="Total Jobs" value={stats.jobs} icon={Briefcase} accent="bg-violet-100 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400" trendLabel={`${stats.active} active`} />
        <StatCard label="Active Assignments" value={stats.active} icon={ClipboardCheck} accent="bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle} accent="bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" />
        <StatCard label="Revenue" value={`$${stats.revenue.toLocaleString()}`} icon={CircleDollarSign} accent="bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400" trendLabel="From completed jobs" />
        <StatCard label="Community Posts" value={stats.posts} icon={MessageSquare} accent="bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400" />
      </div>

      <div className="mt-6">
        <PendingActions users={users} jobs={jobs} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Jobs Posted</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 14 days</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-orange-500"><TrendingUp size={14} /> {chartData.reduce((s, d) => s + d.count, 0)} this period</span>
          </div>
          <BarChart data={chartData} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-4 flex items-center gap-2">
            <Activity size={16} className="text-orange-500" />
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h2>
          </div>
          <div className="space-y-1">
            {activity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.accent}`}>
                  <item.icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">{item.detail}</p>
                </div>
                <span className="shrink-0 text-[10px] text-gray-400 dark:text-gray-500">
                  {item.time ? formatDistanceToNow(item.time, { addSuffix: true }) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {revenueByTrade.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">Revenue by Trade</h2>
          <p className="mb-5 text-xs text-gray-500 dark:text-gray-400">From completed jobs</p>
          <div className="space-y-4">
            {revenueByTrade.map(([trade, amount], i) => {
              const pct = Math.round((amount / revenueByTrade[0][1]) * 100);
              return (
                <div key={trade} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate text-sm font-semibold text-gray-700 dark:text-gray-200">{trade}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div className={`h-full rounded-full ${TRADE_ACCENTS[i % TRADE_ACCENTS.length].split(' ')[0]}`} style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-bold text-gray-900 dark:text-white">${amount.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
    </div>
  );
}
