import { Heart, MessageCircle } from 'lucide-react';

export default function PortfolioCard({ post }) {
  const { title, image, before, likes, comments, completedAt, by } = post;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border-[0.5px] border-hc-hairline bg-white shadow-sm">
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={title || 'Project photo'}
          width={640}
          height={480}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover"
        />
        {before && (
          <span className="absolute left-3 top-3 rounded-full bg-hc-ink/80 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-sm">
            After
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-[18px] font-medium text-hc-ink">{title}</h3>
        <p className="mt-1 text-[13px] text-hc-ink-3">Completed {completedAt}</p>
        <div className="mt-3 flex items-center justify-between border-t border-hc-hairline pt-3 text-[13px] text-hc-ink-2">
          <span className="truncate font-medium text-hc-ink">{by}</span>
          <span className="flex shrink-0 items-center gap-3">
            <span className="flex items-center gap-1"><Heart size={14} /> {likes}</span>
            <span className="flex items-center gap-1"><MessageCircle size={14} /> {comments}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
