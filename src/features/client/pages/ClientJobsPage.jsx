import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, MapPin, ArrowRight, Plus, DollarSign, Search, Wrench,
} from 'lucide-react';
import useClientJobs from '@/hooks/useClientJobs';
import { timeAgo } from '@/utils/time';
import { categoryIcons } from '@/constants/categories';

const jobTabs = [
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

function statusOf(job) {
  if (job.status === 'assigned') return 'in-progress';
  if (job.status === 'completed') return 'completed';
  if (job.status === 'cancelled') return 'cancelled';
  return 'open';
}

const statusStyles = {
  open: 'bg-hc-tint text-hc-brand',
  'in-progress': 'bg-blue-50 text-blue-600',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
};

const statusLabels = {
  open: 'Open',
  'in-progress': 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function ClientJobsPage() {
  const navigate = useNavigate();
  const { jobs, loading } = useClientJobs();
  const [activeTab, setActiveTab] = useState('open');
  const [query, setQuery] = useState('');

  const all = useMemo(() => jobs.map((j) => ({ ...j, tab: statusOf(j) })), [jobs]);

  const openJobs = all.filter((j) => j.tab === 'open');
  const progressJobs = all.filter((j) => j.tab === 'in-progress');
  const completedJobs = all.filter((j) => j.tab === 'completed');
  const cancelledJobs = all.filter((j) => j.tab === 'cancelled');

  const totalSpent = useMemo(
    () => completedJobs.reduce((s, j) => s + Number(j.budget || 0), 0),
    [completedJobs]
  );

  const tabJobs = activeTab === 'open' ? openJobs : activeTab === 'in-progress' ? progressJobs : completedJobs;

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q ? tabJobs.filter((j) => (j.title || '').toLowerCase().includes(q) || (j.category || '').toLowerCase().includes(q)) : tabJobs;
  }, [tabJobs, query]);

  const stats = [
    { label: 'Open', value: openJobs.length, tab: 'open' },
    { label: 'In Progress', value: progressJobs.length, tab: 'in-progress' },
    { label: 'Completed', value: completedJobs.length, tab: 'completed' },
    { label: 'Total Spent', value: `$${totalSpent}`, tab: 'completed' },
  ];

  const activeCount = openJobs.length + progressJobs.length;

  return (
    <div className="space-y-6 pb-28 lg:pb-0">
      {/* Hero / Search */}
      <div className="rounded-2xl border border-hc-hairline bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-hc-ink">My Jobs</h1>
        <p className="mt-1 text-sm text-hc-ink-2">
          {activeCount} Active &middot; {completedJobs.length} Completed
          {cancelledJobs.length > 0 ? ` &middot; ${cancelledJobs.length} Cancelled` : ''}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-hc-ink-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs by title or category..."
              className="h-12 w-full rounded-full border border-hc-hairline bg-hc-page pl-11 pr-4 text-sm font-medium text-hc-ink outline-none transition-all placeholder:text-hc-ink-3 focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10"
            />
          </div>
          <button
            onClick={() => navigate('/client/home?post=1')}
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-hc-brand px-6 text-sm font-semibold text-white shadow-sm shadow-hc-brand/30 transition-colors hover:bg-hc-brand-strong"
          >
            <Plus size={18} /> Post New Job
          </button>
        </div>
      </div>

      {/* Overview */}
      <section>
        <h2 className="text-xs font-bold uppercase tracking-wider text-hc-ink-3">Overview</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((s) => {
            const isActive = activeTab === s.tab;
            return (
              <motion.button
                key={s.label}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(s.tab)}
                className={`flex h-20 flex-col justify-between rounded-2xl border bg-white p-3 text-left shadow-sm transition-colors ${
                  isActive ? 'border-hc-brand ring-1 ring-hc-brand/20' : 'border-hc-hairline hover:border-hc-brand/40'
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-hc-ink-3">{s.label}</span>
                <span className={`text-xl font-bold ${isActive ? 'text-hc-brand' : 'text-hc-ink'}`}>{s.value}</span>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* My Jobs */}
      <section>
        <h2 className="mt-8 text-xs font-bold uppercase tracking-wider text-hc-ink-3">My Jobs</h2>

        {/* Pill tabs with counts */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {jobTabs.map((t) => {
            const count = t.id === 'open' ? openJobs.length : t.id === 'in-progress' ? progressJobs.length : completedJobs.length;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isActive ? 'bg-hc-brand text-white shadow-sm shadow-hc-brand/30' : 'bg-hc-tile text-hc-ink-2 hover:bg-hc-hairline hover:text-hc-ink'
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none ${isActive ? 'bg-white/20 text-white' : 'bg-white text-hc-ink-3'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Job cards */}
        <div className="mt-5 flex flex-col gap-5">
          {loading ? (
            <div className="rounded-2xl border border-hc-hairline bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-semibold text-hc-ink-3">Loading jobs...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-hc-hairline bg-white p-12 text-center shadow-sm">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-hc-tint text-hc-brand">
                <Briefcase size={26} />
              </span>
              <p className="text-[15px] font-semibold text-hc-ink">No {activeTab === 'in-progress' ? 'in progress' : activeTab} jobs</p>
              <p className="mt-1 text-[13px] text-hc-ink-2">
                {activeTab === 'open' ? "You haven't posted a job yet." : 'Jobs will appear here when available.'}
              </p>
              {activeTab === 'open' && (
                <button
                  onClick={() => navigate('/client/home?post=1')}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-hc-brand px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
                >
                  <Plus size={15} /> Post Your First Job
                </button>
              )}
            </div>
          ) : (
            filtered.map((job, i) => {
              const Icon = categoryIcons[job.category] || Wrench;
              return (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="rounded-2xl border border-hc-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hc-tint text-hc-brand">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="min-w-0 truncate text-base font-semibold text-hc-ink">{job.title}</h3>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[job.tab]}`}>
                            {statusLabels[job.tab]}
                          </span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-hc-ink-2">
                          <span className="flex items-center gap-1">
                            <DollarSign size={12} className="text-hc-ink-3" /> ${job.budget || '—'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-hc-ink-3" /> {job.location || 'Your area'}
                          </span>
                          <span className="text-hc-ink-3">{timeAgo(job.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {job.description && (
                      <p className="mt-3 text-sm leading-relaxed text-hc-ink-2 line-clamp-2">{job.description}</p>
                    )}

                    {job.tab === 'open' && job.quotes?.length > 0 && (
                      <div className="mt-4 rounded-xl bg-hc-tint/50 px-4 py-3 text-xs font-semibold text-hc-tint-text">
                        {job.quotes.length} {job.quotes.length === 1 ? 'quote' : 'quotes'} received
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-hc-hairline pt-4">
                      <p className="text-[11px] font-medium text-hc-ink-3">
                        {job.tab === 'open' ? 'Waiting for quotes' : job.tab === 'in-progress' ? 'In progress' : 'Completed'}
                      </p>
                      <button
                        onClick={() => navigate(job.status === 'assigned' ? `/client/chat/${job.id}` : '/client/jobs')}
                        className="flex items-center gap-1 rounded-lg border border-hc-hairline bg-white px-3.5 py-1.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-hc-brand hover:text-hc-brand"
                      >
                        View Details <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/client/home?post=1')}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-6 z-40 flex items-center gap-2 rounded-full bg-hc-brand px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-hc-brand/40 transition-colors hover:bg-hc-brand-strong lg:bottom-8"
      >
        <Plus size={20} /> Post New Job
      </motion.button>
    </div>
  );
}
