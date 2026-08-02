import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Clock, MapPin, ChevronRight, MessageCircle, ArrowRight,
  Plus, DollarSign, TrendingUp, CheckCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import useClientJobs from '@/hooks/useClientJobs';

const jobTabs = [
  { id: 'open', label: 'Open' },
  { id: 'in-progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

const toDate = (v) => (v?.toDate ? v.toDate() : v instanceof Date ? v : new Date(v || 0));

function timeAgo(date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function statusOf(job) {
  if (job.status === 'assigned') return 'in-progress';
  if (job.status === 'completed') return 'completed';
  return 'open';
}

export default function ClientJobsPage() {
  const navigate = useNavigate();
  const { jobs, loading } = useClientJobs();
  const [activeTab, setActiveTab] = useState('open');
  const [query, setQuery] = useState('');

  const all = useMemo(() => jobs.map((j) => ({ ...j, tab: statusOf(j) })), [jobs]);

  const openJobs = all.filter((j) => j.tab === 'open');
  const progressJobs = all.filter((j) => j.tab === 'in-progress');
  const completedJobs = all.filter((j) => j.tab === 'completed');

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
    { label: 'Open', value: openJobs.length, tab: 'open', icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'In Progress', value: progressJobs.length, tab: 'in-progress', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Completed', value: completedJobs.length, tab: 'completed', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Total Spent', value: `$${totalSpent}`, tab: 'completed', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const activeCount = openJobs.length + progressJobs.length;

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-gray-900">My Jobs</h1>
          <p className="mt-1 text-sm text-gray-500">{activeCount} Active &middot; {completedJobs.length} Completed</p>
        </div>
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your jobs..."
          className="h-12 w-full rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none shadow-sm transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 placeholder:text-gray-400"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          const isActive = activeTab === s.tab;
          return (
            <motion.button
              key={s.label}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(s.tab)}
              className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 ${
                isActive ? 'border-orange-300 bg-orange-50 shadow-md' : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
              }`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
                <Icon size={20} className={s.color} />
              </div>
              <div className="flex-1">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
              <ChevronRight size={16} className={`shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-300'}`} />
            </motion.button>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs tabs={jobTabs} activeTab={activeTab} onChange={setActiveTab} className="overflow-x-auto" />

      {/* Job Cards */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-sm font-semibold text-gray-400">Loading jobs…</p>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <Briefcase size={40} className="mx-auto mb-4 text-gray-300" />
            <p className="text-base font-bold text-gray-900">No {activeTab === 'in-progress' ? 'in progress' : activeTab} jobs</p>
            <p className="mt-1 text-sm text-gray-500 mb-6">
              {activeTab === 'open' ? "You haven't posted a job yet." : 'Jobs will appear here when available.'}
            </p>
            {activeTab === 'open' && (
              <Button onClick={() => navigate('/client/home?post=1')} className="!w-auto !px-6">
                <Plus size={16} /> Post Your First Job
              </Button>
            )}
          </Card>
        ) : (
          filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover className="!p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-bold text-gray-900">{job.title}</h3>
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" /> {job.location || 'Your area'}
                    </p>
                  </div>
                  <span className={`shrink-0 ml-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    job.tab === 'open' ? 'bg-amber-100 text-amber-700' :
                    job.tab === 'in-progress' ? 'bg-orange-100 text-orange-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {job.tab === 'in-progress' ? 'In Progress' : job.tab === 'open' ? 'Open' : 'Completed'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><DollarSign size={12} className="text-gray-400" /> ${job.budget || '—'}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(toDate(job.createdAt))}</span>
                  {job.category && <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-bold text-gray-600">{job.category}</span>}
                </div>

                {job.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{job.description}</p>
                )}

                {job.tab === 'open' && job.quotes?.length > 0 && (
                  <div className="rounded-xl bg-gray-50 p-4 mb-4">
                    <p className="text-xs font-bold text-gray-900">{job.quotes.length} {job.quotes.length === 1 ? 'Quote' : 'Quotes'} received</p>
                  </div>
                )}

                {job.tab === 'in-progress' && job.handymanName && (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-100 p-3 mb-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white">
                      {(job.handymanName || 'H').charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{job.handymanName}</p>
                      <p className="text-xs text-gray-500">Working on your job</p>
                    </div>
                    <button
                      onClick={() => navigate(`/client/chat/${job.id}`)}
                      className="shrink-0 flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <MessageCircle size={12} /> Message
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={12} className="text-orange-500" />
                    <span className="text-[11px] text-gray-500">{job.tab === 'open' ? 'Waiting for quotes' : job.tab === 'in-progress' ? 'In progress' : 'Completed'}</span>
                  </div>
                  {job.tab === 'open' && (
                    <button className="flex items-center gap-1 rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-bold text-white hover:bg-orange-600 transition-colors">
                      View Details <ArrowRight size={11} />
                    </button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate('/client/home?post=1')}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl shadow-orange-500/40 transition-colors hover:bg-orange-600 lg:bottom-8"
      >
        <Plus size={28} />
      </motion.button>
    </div>
  );
}
