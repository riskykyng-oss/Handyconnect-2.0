import { motion, useReducedMotion } from 'framer-motion';
import { MapPin, Clock, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';
import { jobCardClass, timeAgo } from './dashboardUtils';

const STATUS_STYLES = {
  open: { label: 'Open', className: 'bg-black/[0.06] text-hc-ink-2' },
  assigned: { label: 'In Progress', className: 'bg-hc-ink text-white' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700' },
};

export default function JobCard({ job, onOpen }) {
  const reduce = useReducedMotion();
  const status = STATUS_STYLES[job.status] || STATUS_STYLES.open;
  const date = job.createdAt?.toDate ? job.createdAt.toDate() : job.createdAt;
  const assigned = job.status === 'assigned';

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reduce ? undefined : { y: -2 }}
      onClick={onOpen}
      className={`${jobCardClass} group cursor-pointer p-4 transition-shadow hover:shadow-md sm:p-5`}
      aria-label={job.title}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-hc-ink">{job.title}</h3>
          <p className="mt-1 flex items-center gap-1 truncate text-[13px] text-hc-caption">
            <MapPin size={13} className="shrink-0" /> {job.location || 'Your area'}
          </p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-4 text-[13px] text-hc-caption">
        <span className="flex items-center gap-1">
          <Clock size={13} /> {timeAgo(date)}
        </span>
        <span className="text-base font-semibold text-hc-ink">${job.budget}</span>
      </div>

      {assigned && job.handymanName && (
        <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-white/80 px-3 py-2 ring-1 ring-inset ring-black/[0.04]">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hc-ink text-[10px] font-bold text-white">
            {job.handymanName[0] || 'H'}
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-hc-ink">{job.handymanName}</p>
          <MessageCircle size={14} className="shrink-0 text-hc-ink-3" />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-hc-hairline pt-3">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-hc-caption">
          <ShieldCheck size={14} className="text-hc-ink-3" /> Secure
        </span>
        <span className="flex items-center gap-1 text-[13px] font-semibold text-hc-ink-2 transition-colors group-hover:text-hc-brand">
          {assigned ? 'View Progress' : 'View Details'} <ArrowRight size={13} />
        </span>
      </div>
    </motion.article>
  );
}
