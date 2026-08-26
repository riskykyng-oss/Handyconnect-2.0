import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, MapPin, ArrowRight, Plus, DollarSign, Search, Wrench,
  X, Clock, CheckCircle2, MessageSquare,
} from 'lucide-react';
import useClientJobs from '@/hooks/useClientJobs';
import { acceptQuote } from '@/services/jobService';
import { timeAgo } from '@/utils/time';
import { categoryIcons } from '@/constants/categories';
import { JobCardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';

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
  'in-progress': 'bg-hc-accent-50 text-hc-accent',
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
  const { jobs, loading, refetch } = useClientJobs();
  const [activeTab, setActiveTab] = useState('open');
  const [query, setQuery] = useState('');
  const [quoteJob, setQuoteJob] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

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

  const handleAcceptQuote = async (job, quote) => {
    setAcceptingId(`${job.id}-${quote.handymanId}`);
    try {
      await acceptQuote(job.id, quote);
      setQuoteJob(null);
      if (refetch) await refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingId(null);
    }
  };

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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
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
              const quoteCount = job.quotes?.length || 0;
              const hasPendingQuotes = job.tab === 'open' && quoteCount > 0;
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

                    {/* Quotes received — tappable to open detail */}
                    {hasPendingQuotes && (
                      <button
                        onClick={() => setQuoteJob(job)}
                        className="mt-4 flex w-full items-center gap-3 rounded-xl bg-hc-brand-50 border border-hc-brand-200 px-4 py-3 text-left transition-colors hover:bg-hc-brand-100"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hc-brand text-white">
                          <MessageSquare size={16} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-hc-brand-700">
                            {quoteCount} {quoteCount === 1 ? 'quote' : 'quotes'} received
                          </p>
                          <p className="text-xs text-hc-ink-2">Tap to view and accept</p>
                        </div>
                        <ArrowRight size={16} className="text-hc-brand" />
                      </button>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-hc-hairline pt-4">
                      <p className="text-[11px] font-medium text-hc-ink-3">
                        {job.tab === 'open' ? (quoteCount > 0 ? 'Quotes pending review' : 'Waiting for quotes') : job.tab === 'in-progress' ? 'In progress' : 'Completed'}
                      </p>
                      <button
                        onClick={() => navigate(job.status === 'assigned' ? `/client/chat/${job.id}` : '/client/jobs')}
                        className="flex items-center gap-1 rounded-lg border border-hc-hairline bg-white px-3.5 py-1.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-hc-brand hover:text-hc-brand"
                      >
                        {job.status === 'assigned' ? 'Open Chat' : 'View Details'} <ArrowRight size={12} />
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

      {/* Quote Detail Modal */}
      <AnimatePresence>
        {quoteJob && (
          <QuoteDetailModal
            job={quoteJob}
            onClose={() => setQuoteJob(null)}
            onAccept={handleAcceptQuote}
            acceptingId={acceptingId}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function QuoteDetailModal({ job, onClose, onAccept, acceptingId }) {
  const quotes = job.quotes || [];
  const [selectedQuote, setSelectedQuote] = useState(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-hc-hairline px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-hc-ink">Quotes for {job.title}</h2>
            <p className="text-xs text-hc-ink-2">{quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'} received</p>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-hc-ink-3 hover:bg-hc-brand-50 hover:text-hc-brand">
            <X size={18} />
          </button>
        </div>

        {/* Quote list */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-3">
          {quotes.map((q, i) => {
            const isAccepted = q.status === 'accepted';
            const isRejected = q.status === 'rejected';
            const isActive = selectedQuote?.handymanId === q.handymanId && selectedQuote?.createdAt?.seconds === q.createdAt?.seconds;
            const isBusy = acceptingId === `${job.id}-${q.handymanId}`;

            return (
              <div
                key={`${q.handymanId}-${i}`}
                className={`rounded-xl border p-4 transition-all ${
                  isAccepted ? 'border-emerald-300 bg-emerald-50' :
                  isRejected ? 'border-gray-200 bg-gray-50 opacity-60' :
                  isActive ? 'border-hc-brand ring-2 ring-hc-brand/20 bg-hc-brand-50' :
                  'border-hc-hairline bg-white hover:border-hc-brand/40'
                }`}
                onClick={() => !isAccepted && !isRejected && setSelectedQuote(q)}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hc-accent-50 text-sm font-bold text-hc-accent">
                    {(q.handymanName || 'P')[0].toUpperCase()}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-hc-ink truncate">{q.handymanName || 'Professional'}</p>
                      {isAccepted && (
                        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <CheckCircle2 size={10} /> Accepted
                        </span>
                      )}
                      {isRejected && (
                        <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">
                          Not selected
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-lg font-bold text-hc-brand">
                        <DollarSign size={16} />{q.price}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-hc-ink-3">
                        <Clock size={11} /> {timeAgo(q.createdAt)}
                      </span>
                    </div>

                    {q.message && (
                      <p className="mt-2 text-sm text-hc-ink-2 leading-relaxed">{q.message}</p>
                    )}

                    {/* Accept button — only for pending quotes */}
                    {!isAccepted && !isRejected && isActive && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onAccept(job, q); }}
                        disabled={isBusy}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-hc-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-60"
                      >
                        {isBusy ? 'Accepting...' : (
                          <>
                            <CheckCircle2 size={16} />
                            Accept Quote — ${q.price}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
