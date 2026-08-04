import { ArrowRight } from 'lucide-react';
import { iconChip } from './dashboardUtils';

export default function RailWidget({ icon: Icon, title, badge, actionLabel, onAction, children }) {
  return (
    <section className="py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`${iconChip} h-8 w-8 rounded-[10px]`}>
            <Icon size={15} />
          </span>
          <h3 className="text-sm font-semibold text-hc-ink">{title}</h3>
          {badge}
        </div>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="flex shrink-0 items-center gap-1 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-xs font-medium text-hc-ink-2 transition-colors hover:border-hc-brand/40 hover:text-hc-brand"
          >
            {actionLabel} <ArrowRight size={12} />
          </button>
        )}
      </div>
      {children}
    </section>
  );
}
