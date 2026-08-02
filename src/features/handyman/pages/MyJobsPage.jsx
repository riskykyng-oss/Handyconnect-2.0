import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Briefcase, Search, Star, Clock, DollarSign, ArrowDownToLine, Wallet, Image, MessageCircle, RotateCcw } from 'lucide-react';
import { getHandymanJobs, startJob, completeJob, updateJobProgress } from '@/services/jobService';
import { getUserProfile } from '@/services/userService';
import { subscribeToWallet, subscribeToTransactions } from '@/services/walletService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { toast } from '@/app/providers/ToastProvider';
import RequestPaymentModal from '@/features/payments/components/RequestPaymentModal';
import ConfirmDialog from '@/features/admin/components/ConfirmDialog';
import HandymanJobCard from '@/features/handyman/components/HandymanJobCard';
import { deriveJobStatus } from '@/features/handyman/constants/jobStatus';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'awaiting', label: 'Awaiting Payment' },
  { id: 'completed', label: 'Completed' },
];

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const QUICK_ACTIONS = [
  { label: 'Find Work', icon: Search, to: '/handyman/jobs' },
  { label: 'Portfolio', icon: Image, to: '/handyman/portfolio' },
  { label: 'Wallet', icon: Wallet, to: '/handyman/wallet' },
  { label: 'Messages', icon: MessageCircle, to: '/handyman/messages' },
];

const StatCard = ({ icon: Icon, label, value, sub, delta }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={18} />
      </span>
      {delta != null && delta !== 0 && (
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
            delta > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}
        >
          {delta > 0 ? '↑' : '↓'} {Math.abs(delta)}%
        </span>
      )}
    </div>
    <p className="mt-3 font-display text-2xl font-extrabold text-gray-900">{value}</p>
    <p className="mt-0.5 text-xs font-bold text-gray-700">{label}</p>
    {sub && <p className="mt-0.5 text-[11px] text-gray-400">{sub}</p>}
  </div>
);

const StatSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" />
);

export default function MyJobsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [clients, setClients] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [wallet, setWallet] = useState({ balance: 0 });
  const [rating, setRating] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0, yesterday: 0 });
  const [weekly, setWeekly] = useState(WEEKDAY_LABELS.map((label) => ({ label, value: 0 })));
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentJob, setPaymentJob] = useState(null);

  const fetchJobs = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await getHandymanJobs(currentUser.uid);
      setJobs(data);
      const ids = [...new Set(data.map((j) => j.clientId).filter(Boolean))];
      const entries = await Promise.all(ids.map(async (id) => [id, await getUserProfile(id).catch(() => null)]));
      setClients(Object.fromEntries(entries));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => fetchJobs());
    return () => cancelAnimationFrame(raf);
  }, [fetchJobs]);

  useEffect(() => {
    if (!currentUser) return undefined;
    const unsub = subscribeToWallet(currentUser.uid, setWallet);
    const unsubTx = subscribeToTransactions(currentUser.uid, (txns) => {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfDay);
      startOfYesterday.setDate(startOfYesterday.getDate() - 1);
      const dow = (now.getDay() + 6) % 7;
      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow);
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const byDay = {};
      for (let i = 0; i < 7; i += 1) {
        byDay[new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i).toDateString()] = 0;
      }
      const sums = { today: 0, week: 0, month: 0, yesterday: 0 };
      txns.forEach((t) => {
        if (t.kind !== 'credit' || t.type !== 'payment') return;
        const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
        if (Number.isNaN(d.getTime())) return;
        const amt = Number(t.amount) || 0;
        if (d >= startOfDay) sums.today += amt;
        if (d >= startOfYesterday && d < startOfDay) sums.yesterday += amt;
        if (d >= monday) sums.week += amt;
        if (d >= startOfMonth) sums.month += amt;
        if (d.toDateString() in byDay) byDay[d.toDateString()] += amt;
      });
      setEarnings(sums);
      setWeekly(
        WEEKDAY_LABELS.map((label, i) => {
          const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
          return { label, value: byDay[d.toDateString()] || 0 };
        })
      );
    });
    getUserProfile(currentUser.uid)
      .then((p) => {
        setRating(p?.rating ?? null);
        setMyLocation(p?.location || null);
      })
      .catch(() => {});
    return () => { unsub(); unsubTx(); };
  }, [currentUser]);

  const statuses = useMemo(() => jobs.map(deriveJobStatus), [jobs]);
  const activeCount = statuses.filter((s) => s === 'accepted' || s === 'in_progress').length;
  const awaitingCount = statuses.filter((s) => s === 'awaiting_payment').length;
  const completedCount = statuses.filter((s) => s === 'completed' || s === 'paid').length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) => {
      const s = deriveJobStatus(job);
      if (filter === 'active' && !(s === 'accepted' || s === 'in_progress')) return false;
      if (filter === 'awaiting' && s !== 'awaiting_payment') return false;
      if (filter === 'completed' && !(s === 'completed' || s === 'paid')) return false;
      if (q) {
        const clientName = (clients[job.clientId]?.displayName || '').toLowerCase();
        const hay = `${job.title || ''} ${job.description || ''} ${clientName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [jobs, filter, search, clients]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const firstName = (currentUser?.displayName || '').split(' ')[0] || 'there';

  const todayDelta = useMemo(() => {
    if (earnings.yesterday <= 0) return earnings.today > 0 ? 100 : 0;
    return Math.round(((earnings.today - earnings.yesterday) / earnings.yesterday) * 100);
  }, [earnings]);

  const dailyDeltas = useMemo(() => {
    const deltas = [];
    for (let i = 0; i < weekly.length; i += 1) {
      const prev = i > 0 ? weekly[i - 1].value : 0;
      const cur = weekly[i].value;
      deltas.push({ label: weekly[i].label, value: cur, delta: cur - prev });
    }
    return deltas;
  }, [weekly]);

  const maxDelta = useMemo(() => Math.max(...dailyDeltas.map((d) => Math.abs(d.delta)), 0.01), [dailyDeltas]);

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { job, type } = confirmAction;
    setActionLoading(true);
    try {
      if (type === 'start') {
        await startJob(job.id);
        toast.success('Work started — keep the client posted');
      } else {
        await completeJob(job.id, currentUser.uid, job.budget);
        toast.success('Job completed — payment credited to your wallet');
      }
      await fetchJobs();
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleUpdateProgress = async (job, value) => {
    try {
      await updateJobProgress(job.id, value, `Progress updated to ${value}%`);
      toast.success('Progress updated');
      await fetchJobs();
    } catch {
      toast.error('Could not update progress.');
    }
  };

  const handleChat = (job) => navigate(`/handyman/chat/${job.id}`);

  const handleNavigate = (job) => {
    const client = clients[job.clientId];
    const loc = client?.location;
    const url =
      loc?.lat != null && loc?.lng != null
        ? `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client?.address || job.location || 'Harare, Zimbabwe')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 pb-24 pt-5 lg:pb-10">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Here's an overview of today's work.</p>
      </div>

      {/* Stats + Earnings */}
      {loading ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" style={{ height: 180 }} />
            <div className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" style={{ height: 180 }} />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Briefcase} label="Active Jobs" value={activeCount} sub="Currently in progress" />
            <StatCard icon={DollarSign} label="Today's Earnings" value={`$${earnings.today.toFixed(0)}`} delta={todayDelta} sub="vs yesterday" />
            <StatCard icon={Clock} label="Awaiting Payment" value={awaitingCount} sub="Ready to collect" />
            <StatCard icon={Star} label="Rating" value={rating ? Number(rating).toFixed(1) : '—'} sub="Client feedback" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Daily change + month tally */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">Daily Earnings</p>
                <span className="text-[10px] font-semibold text-gray-400">Change vs prior day</span>
              </div>
              <p className="mt-1 font-display text-3xl font-extrabold text-gray-900">${earnings.week.toFixed(2)}</p>
              <div className="mt-5 flex items-end gap-1.5">
                {dailyDeltas.map((d) => {
                  const up = d.delta > 0;
                  const down = d.delta < 0;
                  const h = d.delta !== 0 ? Math.max(8, Math.round((Math.abs(d.delta) / maxDelta) * 48)) : 4;
                  return (
                    <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className={`text-[9px] font-bold ${up ? 'text-emerald-600' : down ? 'text-red-500' : 'text-gray-300'}`}>
                        {d.delta !== 0 ? `${up ? '+' : ''}$${d.delta.toFixed(0)}` : ''}
                      </span>
                      <div
                        className={`w-full rounded-md ${up ? 'bg-emerald-500' : down ? 'bg-red-400' : 'bg-gray-200'}`}
                        style={{ height: h }}
                        title={`${d.label}: ${up ? '+' : ''}$${d.delta.toFixed(2)} ($${d.value.toFixed(2)} total)`}
                      />
                      <span className="text-[10px] font-medium text-gray-400">{d.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Month Tally</p>
                <p className="font-display text-sm font-extrabold text-gray-900">${earnings.month.toFixed(2)}</p>
              </div>
            </div>

            {/* Available balance */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md">
              <p className="text-xs font-medium text-gray-500">Available Balance</p>
              <p className="mt-1 font-display text-3xl font-extrabold text-gray-900">${Number(wallet.balance || 0).toFixed(2)}</p>
              <button
                onClick={() => navigate('/handyman/wallet')}
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                <ArrowDownToLine size={14} /> Withdraw
              </button>
              <p className="mt-2 text-center text-[10px] text-gray-400">This month · ${earnings.month.toFixed(2)}</p>
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:bg-gray-50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
              <a.icon size={18} />
            </span>
            <p className="mt-3 text-sm font-bold text-gray-900">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* My Jobs */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg font-extrabold tracking-tight text-gray-900">My Jobs</h2>
            <p className="mt-0.5 text-xs text-gray-500">Track your work, payments and client updates.</p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
            {FILTERS.map((f) => {
              const count = f.id === 'all' ? jobs.length : f.id === 'active' ? activeCount : f.id === 'awaiting' ? awaitingCount : completedCount;
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                    active ? 'bg-orange-500 text-white shadow-sm' : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex h-[52px] items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 shadow-sm">
            <Search size={15} className="shrink-0 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search jobs, clients or locations..."
              className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100" aria-label="Clear search">
                <RotateCcw size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="mt-4">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <JobCardSkeleton /><JobCardSkeleton /><JobCardSkeleton />
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <Briefcase className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-semibold text-gray-500">No active jobs</p>
              <p className="mt-1 text-xs text-gray-400">
                Browse nearby work and start earning. Everything you take on will show up here.
              </p>
              <Link
                to="/handyman/jobs"
                className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-orange-500 px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
              >
                <Briefcase size={14} /> Find Work
              </Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <Search className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm font-semibold text-gray-500">No matches found</p>
              <p className="mt-1 text-xs text-gray-400">Try a different filter or search term.</p>
              <button
                onClick={() => { setFilter('all'); setSearch(''); }}
                className="mt-4 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-xs font-bold text-gray-600 shadow-sm transition-colors hover:bg-gray-50"
              >
                <RotateCcw size={13} /> Reset filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {filtered.map((job) => (
                <HandymanJobCard
                  key={job.id}
                  job={job}
                  client={clients[job.clientId] || null}
                  userLocation={myLocation}
                  onStart={() => setConfirmAction({ job, type: 'start' })}
                  onComplete={() => setConfirmAction({ job, type: 'complete' })}
                  onRequestPayment={() => setPaymentJob(job)}
                  onUpdateProgress={handleUpdateProgress}
                  onChat={handleChat}
                  onNavigate={handleNavigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.type === 'start' ? 'Start this job?' : 'Complete this job?'}
        message={
          confirmAction?.type === 'start'
            ? `Mark "${confirmAction?.job?.title}" as in progress so the client can follow along.`
            : `Mark "${confirmAction?.job?.title}" as completed and credit $${confirmAction?.job?.budget ?? 0} to your wallet?`
        }
        confirmLabel={confirmAction?.type === 'start' ? 'Start Work' : 'Complete Job'}
        danger={false}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      <RequestPaymentModal key={paymentJob?.id ?? 'closed'} open={!!paymentJob} onClose={() => setPaymentJob(null)} job={paymentJob} />
    </div>
  );
}
