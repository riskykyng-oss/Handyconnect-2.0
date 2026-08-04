import { Link } from 'react-router-dom';
import { Star, BadgeCheck, MapPin, Briefcase } from 'lucide-react';
import ColoredAvatar from '@/components/ui/ColoredAvatar';

export default function ProCard({ pro }) {
  const name = pro.displayName || pro.email || 'Handyman';
  const trade = pro.trade || (pro.skills && pro.skills.split(',')[0]) || 'Professional';
  const location = pro.address || 'Zimbabwe';
  const rate = typeof pro.hourlyRate === 'number' ? pro.hourlyRate : 20;

  return (
    <article className="flex w-[280px] shrink-0 snap-start flex-col rounded-xl border-[0.5px] border-hc-hairline bg-white p-4 shadow-sm transition-shadow hover:shadow-lg hover:shadow-hc-ink/5 sm:w-auto">
      <div className="flex items-start gap-3">
        {pro.photoURL ? (
          <img
            src={pro.photoURL}
            alt={name}
            width={80}
            height={80}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-full border-[0.5px] border-hc-hairline object-cover"
          />
        ) : (
          <ColoredAvatar id={pro.id} name={name} size="lg" />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-base font-medium text-hc-ink">
            {name}
            {pro.verified && <BadgeCheck size={15} className="shrink-0 fill-hc-brand text-white" aria-label="Verified" />}
          </p>
          <p className="truncate text-[13px] text-hc-ink-2">{trade}</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-[13px] text-hc-ink-3">
            <MapPin size={12} className="shrink-0" /> {location}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-hc-hairline pt-3 text-[13px]">
        <span className="flex items-center gap-1 font-medium text-hc-ink">
          <Star size={13} className="fill-hc-brand text-hc-brand" />
          {typeof pro.rating === 'number' ? pro.rating.toFixed(1) : 'New'}
        </span>
        {typeof pro.jobs === 'number' && pro.jobs > 0 ? (
          <span className="flex items-center gap-1 text-hc-ink-2">
            <Briefcase size={13} /> {pro.jobs} {pro.jobs === 1 ? 'job' : 'jobs'}
          </span>
        ) : (
          <span className="rounded-full bg-hc-tint px-2 py-0.5 text-[12px] font-medium text-hc-tint-text">New</span>
        )}
        <span className="ml-auto font-medium text-hc-brand">From ${rate}/hr</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link
          to={`/pro/${pro.id}`}
          className="rounded-lg border-[0.5px] border-hc-hairline bg-white py-2.5 text-center text-[13px] font-medium text-hc-ink transition-colors hover:border-hc-brand hover:text-hc-brand"
        >
          View profile
        </Link>
        <Link
          to={`/pro/${pro.id}`}
          className="rounded-lg bg-hc-brand py-2.5 text-center text-[13px] font-medium text-white transition-colors hover:bg-hc-brand-strong"
        >
          Hire
        </Link>
      </div>
    </article>
  );
}
