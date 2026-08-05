import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

export default function ServiceCard({ service, count = 0, fromPrice = null, rating = null }) {
  const Icon = service.icon;
  return (
    <Link
      to={`/client/explore?q=${encodeURIComponent(service.name)}`}
      className="group flex flex-col rounded-xl border border-hc-hairline bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-md sm:p-5"
    >
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-hc-tile text-hc-brand">
        <Icon size={20} />
      </span>

      <h3 className="mt-4 text-[18px] font-medium text-hc-ink">{service.name}</h3>
      <p className="mt-1 text-sm leading-6 text-hc-ink-2">{service.desc}</p>

      <div className="mt-4 hidden flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-hc-ink-2 sm:flex">
        <span className="font-medium text-hc-ink">{count} available</span>
        {rating != null && (
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-hc-brand text-hc-brand" /> {rating.toFixed(1)}
          </span>
        )}
        {fromPrice != null && <span className="text-hc-ink-3">From ${fromPrice}/hr</span>}
      </div>
    </Link>
  );
}
