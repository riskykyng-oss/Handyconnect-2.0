import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOpenJobs, acceptJob } from '@/services/jobService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { MapPin, DollarSign, X, Briefcase, Wrench, Zap } from 'lucide-react';

export default function JobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [search, setSearch] = useState('');

  const fetch = async () => {
    setLoading(true);
    try {
      setJobs(await getOpenJobs());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { const raf = requestAnimationFrame(() => fetch()); return () => cancelAnimationFrame(raf); }, []);

  const handleAccept = async () => {
    if (!selected || !currentUser) return;
    setAccepting(true);
    try {
      await acceptJob(selected.id, currentUser.uid, currentUser.displayName || currentUser.email);
      setSelected(null);
      await fetch();
    } catch (e) {
      console.error(e);
    } finally {
      setAccepting(false);
    }
  };

  const filtered = jobs.filter((j) => j.title?.toLowerCase().includes(search.toLowerCase()) || j.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-5 lg:pb-10">
      <div>
        <p className="text-xs text-gray-500">Find Work</p>
        <h1 className="mt-0.5 text-xl font-bold text-gray-900">Browse open requests</h1>
      </div>

      <div className="flex h-[52px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400" />
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (<JobCardSkeleton key={i} />))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <Briefcase size={28} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No open jobs right now</p>
          <p className="mt-0.5 text-xs text-gray-400">Check back soon</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((job) => (
            <motion.button
              key={job.id}
              layout
              onClick={() => setSelected(job)}
              className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 font-semibold text-sm">
                    {job.title?.[0]?.toUpperCase() || 'J'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{job.title}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin size={10} /> Nearby</p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600">
                  <DollarSign size={11} /> {job.budget}
                </span>
              </div>
              {job.description && <p className="mt-2 text-xs text-gray-500 line-clamp-2">{job.description}</p>}
            </motion.button>
          ))}
        </div>
      )}

      {/* Detail sheet */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20" onClick={() => setSelected(null)} />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg rounded-t-2xl border border-gray-200 bg-white shadow-xl sm:rounded-2xl z-10"
            >
              <div className="flex justify-center pt-3 pb-1"><div className="h-1 w-10 rounded-full bg-gray-300" /></div>
              <div className="px-5 pb-5">
                <div className="flex items-start justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500"><Wrench size={20} /></span>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-900">{selected.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Job details</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                </div>

                <div className="mt-4 inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
                  <DollarSign size={14} /> {selected.budget}
                </div>

                {selected.description && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-900 mb-1.5">Description</p>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}

                <div className="mt-5 flex gap-3">
                  <button onClick={() => setSelected(null)} className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50">Close</button>
                  <button onClick={handleAccept} disabled={accepting} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-60">
                    {accepting ? 'Accepting...' : (<><Zap size={15} /> Accept</>)}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
