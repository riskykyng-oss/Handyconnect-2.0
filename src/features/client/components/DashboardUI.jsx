import { Star, ChevronRight } from 'lucide-react';

export function Rating({ rating, jobs }) {
  if (rating == null) {
    return (
      <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold text-hc-ink-2">
        New
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[13px] text-hc-ink-2">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-hc-ink">{rating.toFixed(1)}</span>
      {jobs > 0 && <span className="text-hc-caption">({jobs})</span>}
    </span>
  );
}

export function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="mb-4 border-b border-black/[0.07] pb-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-hc-ink lg:text-2xl">{title}</h2>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex shrink-0 items-center gap-1 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[13px] font-medium text-hc-ink-2 transition-colors hover:border-hc-brand/40 hover:text-hc-brand"
          >
            {actionLabel} <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
