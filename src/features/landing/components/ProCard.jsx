import { Link } from 'react-router-dom';
import { Star, BadgeCheck } from 'lucide-react';
import ColoredAvatar from '@/components/ui/ColoredAvatar';

export default function ProCard({ pro }) {
  const name = pro.displayName || pro.email || 'Handyman';
  const trade = pro.trade || (pro.skills && pro.skills.split(',')[0]) || 'Professional';

  return (
    <Link
      to={`/pro/${pro.id}`}
      className="group flex flex-col rounded-xl border border-hc-hairline bg-white p-4 transition-all hover:-translate-y-1 hover:shadow-md sm:p-5"
    >
      <div className="flex items-center gap-3">
        {pro.photoURL ? (
          <img
            src={pro.photoURL}
            alt={name}
            width={48}
            height={48}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-full border border-hc-hairline object-cover"
          />
        ) : (
          <ColoredAvatar id={pro.id} name={name} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-base font-medium text-hc-ink">
            {name}
            {pro.verified && <BadgeCheck size={15} className="shrink-0 fill-hc-brand text-white" aria-label="Verified" />}
          </p>
          <p className="text-[13px] text-hc-ink-2">{trade}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-hc-hairline pt-3 text-[13px]">
        <span className="flex items-center gap-1 font-medium text-hc-ink">
          <Star size={13} className="fill-hc-brand text-hc-brand" />
          {typeof pro.rating === 'number' ? pro.rating.toFixed(1) : 'New'}
        </span>
      </div>

      <span className="mt-4 rounded-lg bg-hc-brand py-2.5 text-center text-[13px] font-medium text-white transition-colors group-hover:bg-hc-brand-strong">
        Hire
      </span>
    </Link>
  );
}
