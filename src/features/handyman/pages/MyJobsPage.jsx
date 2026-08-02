import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Briefcase, Search, Star, Play, CircleDollarSign, Wallet, ChevronRight, RotateCcw } from 'lucide-react';
import { getHandymanJobs, startJob, completeJob, updateJobProgress } from '@/services/jobService';
import { getUserProfile } from '@/services/userService';
import { subscribeToWallet, getTransactions } from '@/services/walletService';
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

const StatCard = ({ icon: Icon, label, value, tint }) => {
  const tints = {
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tints[tint]}`}>
        <Icon size={18} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="text-lg font-extrabold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

const StatSkeleton = () => (
  <div className="h-[74px] animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
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
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
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
    getUserProfile(currentUser.uid)
      .then((p) => setRating(p?.rating ?? null))
      .catch(() => {});
    getTransactions(currentUser.uid)
      .then((txns) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const sums = { today: 0, week: 0, month: 0 };
        txns.forEach((t) => {
          if (t.kind !== 'credit' || t.type !== 'payment') return;
          const d = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
          if (Number.isNaN(d.getTime())) return;
          const amt = Number(t.amount) || 0;
          if (d >= startOfDay) sums.today += amt;
          if (d >= startOfWeek) sums.week += amt;
          if (d >= startOfMonth) sums.month += amt;
        });
        setEarnings(sums);
      })
      .catch(() => {});
    return unsub;
  }, [currentUser]);

  const statuses = useMemo(() => jobs.map(deriveJobStatus), [jobs]);
  const activeCount = statuses.filter((s) => s === 'accepted' || s === 'in_progress').length;
  const inProgressCount = statuses.filter((s) => s === 'in_progress').length;
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
    <div className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-5 lg:pb-10">
      {/* Header */}
      <div>
        <p className="text-xs text-gray-500">{format(new Date(), 'EEEE, MMM d')}</p>
        <h1 className="mt-0.5 text-xl font-bold text-gray-900">My Jobs</h1>
      </div>

      {/* Stats + Earnings */}
      {loading ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
          </div>
          <div className="animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" style={{ height: 110 }} />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard icon={Briefcase} label="Active Jobs" value={activeCount} tint="orange" />
            <StatCard icon={Play} label="In Progress" value={inProgressCount} tint="blue" />
            <StatCard icon={CircleDollarSign} label="Awaiting Payment" value={awaitingCount} tint="purple" />
            <StatCard icon={Star} label="Rating" value={rating ? Number(rating).toFixed(1) : '—'} tint="amber" />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  <Wallet size={12} /> Wallet balance
                </p>
                <p className="mt-1 font-display text-2xl font-extrabold text-orange-600">${Number(wallet.balance || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Today</p>
                <p className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">${earnings.today.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">This week</p>
                <p className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">${earnings.week.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">This month</p>
                <p className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white">${earnings.month.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Filters + search */}
      <div className="flex flex-col gap-3">
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map((f) => {
            const count = f.id === 'all' ? jobs.length : f.id === 'active' ? activeCount : f.id === 'awaiting' ? awaitingCount : completedCount;
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
                  active
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
                }`}
              >
                {f.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${active ? 'bg-white/20' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <Search size={15} className="shrink-0 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job, description or client..."
            className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Clear search">
              <RotateCcw size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <JobCardSkeleton /><JobCardSkeleton /><JobCardSkeleton />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
            <Briefcase size={26} />
          </span>
          <h3 className="mt-4 font-display text-lg font-bold text-gray-900 dark:text-white">No jobs yet</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
            Browse open requests near you, accept a job, and start earning. Everything you work on will show up here.
          </p>
          <Link
            to="/handyman/jobs"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            Find work <ChevronRight size={15} />
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-800">
          <Search size={26} className="mx-auto text-gray-300" />
          <h3 className="mt-3 font-display text-base font-bold text-gray-900 dark:text-white">No matches found</h3>
          <p className="mt-1 text-sm text-gray-500">Try a different filter or search term.</p>
          <button
            onClick={() => { setFilter('all'); setSearch(''); }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <RotateCcw size={13} /> Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <HandymanJobCard
              key={job.id}
              job={job}
              client={clients[job.clientId] || null}
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
