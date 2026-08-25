import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart, MessageCircle, Loader2, MessagesSquare, ArrowRight,
  HelpCircle, Hammer, Lightbulb,
} from 'lucide-react';
import { subscribeToPosts } from '@/services/postService';
import { SectionHeader } from './DashboardUI';
import { timeAgo } from './dashboardUtils';

const TYPE_STYLES = {
  question: {
    gradient: 'from-hc-accent to-hc-accent-strong',
    bg: 'bg-hc-accent-tint',
    text: 'text-hc-accent',
    border: 'border-l-hc-accent',
    icon: HelpCircle,
    label: 'Question',
  },
  project: {
    gradient: 'from-hc-brand to-hc-brand-strong',
    bg: 'bg-hc-tint',
    text: 'text-hc-brand',
    border: 'border-l-hc-brand',
    icon: Hammer,
    label: 'Project',
  },
  tip: {
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-l-amber-400',
    icon: Lightbulb,
    label: 'Tip',
  },
  default: {
    gradient: 'from-hc-brand to-hc-brand-strong',
    bg: 'bg-hc-tint',
    text: 'text-hc-brand',
    border: 'border-l-hc-brand',
    icon: MessagesSquare,
    label: 'Post',
  },
};

export default function CommunityPreview() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPosts((list) => {
      setPosts(list.slice(0, 6));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <section aria-label="Community">
      <SectionHeader title="Community Highlights" actionLabel="See all" onAction={() => navigate('/community')} />
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin text-hc-caption" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-hc-hairline bg-white p-10 text-center shadow-sm">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-[#FFE9D3] text-hc-brand">
            <MessagesSquare size={26} />
          </span>
          <p className="text-[15px] font-medium text-hc-ink-2">No community posts yet</p>
          <p className="mt-1 text-[13px] text-hc-caption">Be the first to share a project, ask a question, or post a tip!</p>
          <button
            onClick={() => navigate('/community')}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-hc-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
          >
            Go to Community <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
          {posts.map((post) => {
            const style = TYPE_STYLES[post.type] || TYPE_STYLES.default;
            const TypeIcon = style.icon;
            const hasImage = !!post.imageUrl;
            return (
              <button
                key={post.id}
                onClick={() => navigate('/community')}
                className={`group flex w-[272px] shrink-0 flex-col overflow-hidden rounded-xl border border-black/[0.06] border-l-[3px] ${style.border} bg-white shadow-sm transition-all hover:shadow-lg hover:-translate-y-1`}
              >
                {/* Image or type-colored header */}
                {hasImage ? (
                  <div className="relative h-40 overflow-hidden">
                    <img src={post.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    {/* Type badge on image */}
                    <span className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${style.bg} ${style.text} backdrop-blur-sm shadow-sm`}>
                      <TypeIcon size={10} /> {style.label}
                    </span>
                    {/* Author on image */}
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white/80" />
                      ) : (
                        <span className={`flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white/80 ${style.bg} text-[11px] font-bold ${style.text}`}>
                          {(post.authorName || '?')[0]}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-white drop-shadow">{post.authorName || 'Member'}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`relative h-24 bg-gradient-to-r ${style.gradient}`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-15">
                      <TypeIcon size={52} className="text-white" />
                    </div>
                    {/* Author on gradient */}
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      {post.authorAvatar ? (
                        <img src={post.authorAvatar} alt="" className="h-7 w-7 rounded-full object-cover ring-2 ring-white/40" />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-[11px] font-bold text-white backdrop-blur-sm">
                          {(post.authorName || '?')[0]}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-white drop-shadow">{post.authorName || 'Member'}</span>
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-4">
                  {/* Text */}
                  {post.text && (
                    <p className="line-clamp-3 text-[13px] leading-[19px] text-hc-ink-2 transition-colors group-hover:text-hc-ink">
                      {post.text}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="mt-auto pt-3 flex items-center gap-3 border-t border-black/[0.05] text-[11px] text-hc-caption">
                    <span className="flex items-center gap-1">
                      <Heart size={12} className={post.likes?.length ? 'fill-hc-brand text-hc-brand' : ''} />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} /> {post.commentCount || 0}
                    </span>
                    <span className="ml-auto text-[11px] text-hc-ink-3">{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
