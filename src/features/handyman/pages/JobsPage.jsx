import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOpenJobs, acceptJob, declineJob, submitQuote } from '@/services/jobService';
import { getUserProfile, updateUserProfile } from '@/services/userService';
import { rankJobsForHandyman } from '@/utils/jobRanking';
import { formatDistance } from '@/utils/distance';
import { useAuth } from '@/features/auth/context/AuthContext';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import { MapPin, DollarSign, X, Briefcase, Wrench, Zap, User, FileText, ToggleRight } from 'lucide-react';

export default function JobsPage() {
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [search, setSearch] = useState('');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteMsg, setQuoteMsg] = useState('');
  const [sending, setSending] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const [open, prof] = await Promise.all([getOpenJobs(), currentUser ? getUserProfile(currentUser.uid) : Promise.resolve(null)]);
      setJobs(open);
      if (prof) {
        setProfile(prof);
        setAvailable(prof.available !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { const raf = requestAnimationFrame(() => fetch()); return () => cancelAnimationFrame(raf); }, [fetch]);

  const goOnline = async () => {
    if (!currentUser) return;
    setAvailable(true);
    try {
      await updateUserProfile(currentUser.uid, { available: true });
    } catch (e) {
      console.error(e);
    }
  };

  // Show general jobs plus any requests targeted directly at this handyman.
  const visible = jobs.filter((j) => !j.handymanId || j.handymanId === currentUser?.uid);
  const ranked = rankJobsForHandyman(visible, profile);

  const filtered = ranked.filter(({ job }) =>
    job.title?.toLowerCase().includes(search.toLowerCase()) ||
    job.description?.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleDecline = async () => {
    if (!selected) return;
    try {
      await declineJob(selected.id);
      setSelected(null);
      await fetch();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendQuote = async () => {
    if (!selected || !currentUser || !quotePrice) return;
    setSending(true);
    try {
      await submitQuote(selected.id, {
        handymanId: currentUser.uid,
        handymanName: currentUser.displayName || currentUser.email,
        price: Number(quotePrice),
        message: quoteMsg.trim(),
      });
      setSelected(null);
      setQuotePrice('');
      setQuoteMsg('');
      setQuoteOpen(false);
      await fetch();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-5 lg:pb-10">
      <div>
        <p className="text-xs text-hc-caption">Find Work</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-hc-ink">Browse open requests</h1>
      </div>

      <div className="flex h-[52px] items-center gap-3 rounded-xl border border-black/[0.07] bg-white px-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="w-full bg-transparent text-sm text-hc-ink outline-none placeholder:text-hc-caption" />
      </div>

      {!available && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-black/[0.07] bg-hc-tile px-4 py-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-sm font-semibold text-hc-ink">You&apos;re offline</p>
            <p className="text-xs text-hc-ink-2">Turn your availability on to get matched with new jobs.</p>
          </div>
          <button onClick={goOnline} className="inline-flex items-center gap-1.5 rounded-lg bg-hc-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-hc-brand-strong">
            <ToggleRight size={14} /> Go online
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (<JobCardSkeleton key={i} />))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-black/[0.07] bg-white p-10 text-center">
          <Briefcase size={28} className="mx-auto text-hc-ink-3" />
          <p className="mt-3 text-sm font-medium text-hc-caption">No open jobs right now</p>
          <p className="mt-0.5 text-xs text-hc-caption">Check back soon</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map(({ job, km, tradeMatch }) => (
            <motion.button
              key={job.id}
              layout
              onClick={() => setSelected(job)}
              className={`flex flex-col rounded-xl border bg-white p-4 text-left transition-colors hover:bg-gray-50 ${job.handymanId ? 'border-hc-brand/50 ring-1 ring-hc-brand/20' : 'border-black/[0.07]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black/[0.06] text-hc-ink-2 font-semibold text-sm">
                    {job.title?.[0]?.toUpperCase() || 'J'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-hc-ink">{job.title}</p>
                    <p className="flex items-center gap-1 text-xs text-hc-caption mt-0.5"><MapPin size={10} /> {km != null ? `${formatDistance(km)} away` : job.location || 'Nearby'}</p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {tradeMatch && (
                    <span className="rounded-full bg-hc-tint px-2 py-0.5 text-[10px] font-bold text-hc-tint-text">Trade match</span>
                  )}
                  <span className="flex items-center gap-0.5 rounded-md bg-black/[0.06] px-2 py-0.5 text-xs font-semibold text-hc-ink-2">
                    <DollarSign size={11} /> {job.budget}
                  </span>
                  {job.handymanId && (
                    <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-bold text-hc-ink-2">New Job Request</span>
                  )}
                </div>
              </div>
              {job.description && <p className="mt-2 text-xs text-hc-caption line-clamp-2">{job.description}</p>}
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
              className="relative flex max-h-[85dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-black/[0.07] bg-white shadow-xl sm:rounded-2xl z-10"
            >
              <div className="flex justify-center pt-3 pb-1 shrink-0"><div className="h-1 w-10 rounded-full bg-black/[0.1]" /></div>
              <div className="overflow-y-auto px-5 pb-5 overscroll-contain">
                <div className="flex items-start justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-black/[0.06] text-hc-ink-2"><Wrench size={20} /></span>
                    <div className="min-w-0">
                      <p className="text-base font-semibold tracking-tight text-hc-ink">{selected.title}</p>
                      <p className="text-xs text-hc-caption mt-0.5">{selected.handymanId ? 'New job request for you' : 'Job details'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100"><X size={15} /></button>
                </div>

                <div className="mt-4 inline-flex items-center gap-1 rounded-md bg-black/[0.06] px-3 py-1 text-sm font-semibold text-hc-ink-2">
                  <DollarSign size={14} /> {selected.budget}
                </div>

                {selected.urgent && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    <Zap size={13} /> Urgent
                  </div>
                )}

                {selected.clientName && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-white">
                      {(selected.clientName || 'C')[0]}
                    </span>
                    <p className="text-sm font-semibold text-hc-ink">{selected.clientName}</p>
                  </div>
                )}

                {selected.description && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-hc-ink mb-1.5">Description</p>
                    <p className="text-sm text-hc-ink-2 leading-relaxed whitespace-pre-wrap">{selected.description}</p>
                  </div>
                )}

                {selected.preferredDate && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-hc-caption">
                    <User size={12} /> Preferred date: {new Date(selected.preferredDate).toLocaleDateString()}
                  </p>
                )}

                {quoteOpen ? (
                  <div className="mt-5 rounded-xl bg-gray-50 p-4">
                    <p className="mb-2 text-xs font-bold text-hc-ink">Send a quote</p>
                    <input
                      type="number"
                      min="0"
                      placeholder="Quote amount ($)"
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      className="w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-hc-brand"
                    />
                    <textarea
                      rows="2"
                      placeholder="Message (optional)"
                      value={quoteMsg}
                      onChange={(e) => setQuoteMsg(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-black/[0.08] bg-white px-3 py-2 text-sm outline-none focus:border-hc-brand resize-none"
                    />
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setQuoteOpen(false)} className="flex-1 rounded-lg border border-black/[0.08] bg-white py-2 text-xs font-semibold text-hc-ink-2 hover:bg-gray-100">Cancel</button>
                      <button onClick={handleSendQuote} disabled={sending || !quotePrice} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-hc-brand py-2 text-xs font-semibold text-white hover:bg-hc-brand-strong disabled:opacity-60">
                        <FileText size={13} /> {sending ? 'Sending...' : 'Send Quote'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-col gap-2">
                    <button onClick={() => setQuoteOpen(true)} className="flex items-center justify-center gap-1.5 rounded-lg border border-black/[0.08] bg-white py-2.5 text-sm font-semibold text-hc-ink-2 transition-colors hover:bg-gray-100">
                      <FileText size={15} /> Send Quote
                    </button>
                    <div className="flex gap-3">
                      <button onClick={handleDecline} className="flex-1 rounded-lg border border-red-200 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50">Decline</button>
                      <button onClick={handleAccept} disabled={accepting} className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-hc-brand py-2.5 text-sm font-medium text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-60">
                        {accepting ? 'Accepting...' : (<><Zap size={15} /> Accept</>)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
