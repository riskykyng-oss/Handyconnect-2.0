import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

export default function ServiceCard({ service, count = 0, fromPrice = null, rating = null }) {
  const Icon = service.icon;
  return (
    <Link
      to={`/client/explore?q=${encodeURIComponent(service.name)}`}
      className="group flex flex-col rounded-xl border-[0.5px] border-hc-hairline bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-hc-ink/5"
    >
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-hc-tile text-hc-brand transition-colors group-hover:bg-hc-brand group-hover:text-white">
        <Icon size={22} />
      </span>

      <h3 className="mt-5 text-[18px] font-medium text-hc-ink">{service.name}</h3>
      <p className="mt-1 text-sm leading-6 text-hc-ink-2">{service.desc}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-hc-ink-2">
        <span className="font-medium text-hc-ink">{count} available</span>
        {rating != null && (
          <span className="flex items-center gap-1">
            <Star size={12} className="fill-hc-brand text-hc-brand" /> {rating.toFixed(1)}
          </span>
        )}
        {fromPrice != null && <span className="text-hc-ink-3">From ${fromPrice}/hr</span>}
      </div>

      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-hc-brand">
        Browse <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
