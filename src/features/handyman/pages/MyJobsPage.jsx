import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAssignedJobs } from '@/services/jobService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import RequestPaymentModal from '@/features/payments/components/RequestPaymentModal';
import { Briefcase, MapPin, MessageCircle, ChevronRight, QrCode } from 'lucide-react';

export default function MyJobsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentJob, setPaymentJob] = useState(null);

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      try {
        setJobs(await getAssignedJobs(currentUser.uid));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [currentUser]);

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 pb-24 pt-5 lg:pb-10">
      <div>
        <p className="text-xs text-gray-500">Active Work</p>
        <h1 className="mt-0.5 text-xl font-bold text-gray-900">My Jobs</h1>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <JobCardSkeleton /><JobCardSkeleton />
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
          <Briefcase size={28} className="mx-auto text-gray-300" />
          <p className="mt-3 text-sm font-medium text-gray-500">No active jobs</p>
          <p className="mt-0.5 text-xs text-gray-400">Accept a job to get started</p>
          <Link to="/handyman/jobs" className="mt-4 inline-flex items-center gap-1 rounded-lg bg-orange-50 px-4 py-2 text-xs font-medium text-orange-600 hover:bg-orange-100 transition-colors">
            Find work <ChevronRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/handyman/chat/${job.id}`)}
              className="flex cursor-pointer flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-500 font-semibold text-sm">
                    {job.title?.[0]?.toUpperCase() || 'J'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{job.title || 'Untitled'}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5"><MapPin size={10} /> {job.location || 'Your area'}</p>
                  </div>
                </div>
                <span className="flex shrink-0 items-center gap-1 rounded-md bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-600">
                  <MessageCircle size={12} /> Chat
                </span>
              </div>
              {job.description && <p className="mt-2 text-xs text-gray-500 line-clamp-2">{job.description}</p>}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-400">{job.status || 'In progress'}</span>
                {job.paid ? (
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">Paid</span>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPaymentJob(job); }}
                    className="flex items-center gap-1 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white transition-colors hover:bg-orange-600"
                  >
                    <QrCode size={12} /> Request payment
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <RequestPaymentModal key={paymentJob?.id ?? 'closed'} open={!!paymentJob} onClose={() => setPaymentJob(null)} job={paymentJob} />
    </div>
  );
}
