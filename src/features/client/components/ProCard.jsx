import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { cardClass } from './dashboardUtils';
import { Rating } from './DashboardUI';

export default function ProCard({ pro, onHire }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const initials =
    pro.name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?';

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -3 }}
      className={`${cardClass} flex w-[184px] shrink-0 flex-col items-center gap-2 p-4 text-center transition-shadow hover:shadow-md`}
    >
      <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-hc-hairline">
        {pro.image ? (
          <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-hc-tint text-sm font-bold text-hc-tint-text">
            {initials}
          </span>
        )}
        {pro.verified && (
          <BadgeCheck className="absolute -bottom-0.5 -right-1 h-4 w-4 fill-hc-accent text-white" />
        )}
      </div>

      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-hc-ink">{pro.name}</p>
        <p className="mt-0.5 truncate text-xs text-hc-caption">{pro.role}</p>
      </div>

      <Rating rating={pro.rating} jobs={pro.jobs} />

      {pro.rate != null && (
        <span className="text-sm font-semibold text-hc-ink">${pro.rate}/hr</span>
      )}

      <div className="mt-1 flex w-full gap-2">
        <button
          onClick={() => navigate(`/pro/${pro.id}`)}
          className="flex-1 rounded-full border border-black/[0.08] bg-white px-3 py-2 text-[13px] font-medium text-hc-ink transition-colors hover:border-hc-brand hover:text-hc-brand"
        >
          View
        </button>
        {onHire && (
          <button
            onClick={() => onHire(pro)}
            className="flex-1 rounded-full bg-hc-brand px-3 py-2 text-[13px] font-medium text-white transition-colors hover:bg-hc-brand-strong"
          >
            Hire
          </button>
        )}
      </div>
    </motion.div>
  );
}
