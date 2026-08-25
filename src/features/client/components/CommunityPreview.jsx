import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Loader2, MessagesSquare, ArrowRight } from 'lucide-react';
import { subscribeToPosts } from '@/services/postService';
import { SectionHeader } from './DashboardUI';
import { timeAgo } from './dashboardUtils';

const TYPE_ACCENTS = {
  question: 'from-blue-500 to-blue-600',
  project: 'from-emerald-500 to-emerald-600',
  tip: 'from-amber-500 to-amber-600',
  default: 'from-orange-500 to-orange-600',
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
          <p className="mt-1 text-[13px] text-hc-caption">Be the first to share something!</p>
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
            const accent = TYPE_ACCENTS[post.type] || TYPE_ACCENTS.default;
            return (
              <button
                key={post.id}
                onClick={() => navigate('/community')}
                className="group flex w-[260px] shrink-0 flex-col overflow-hidden rounded-xl border border-black/[0.06] bg-white shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Image or gradient header */}
                {post.imageUrl ? (
                  <div className="relative h-36 overflow-hidden">
                    <img src={post.imageUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className={`relative h-20 bg-gradient-to-r ${accent}`}>
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <MessagesSquare size={48} className="text-white" />
                    </div>
                  </div>
                )}

                <div className="flex flex-1 flex-col p-3.5">
                  {/* Author */}
                  <div className="flex items-center gap-2">
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt="" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[10px] font-bold text-orange-500">
                        {(post.authorName || '?')[0]}
                      </span>
                    )}
                    <span className="truncate text-xs font-semibold text-hc-ink">{post.authorName || 'Member'}</span>
                    <span className="ml-auto shrink-0 text-[11px] text-hc-caption">{timeAgo(post.createdAt)}</span>
                  </div>

                  {/* Text */}
                  {post.text && (
                    <p className="mt-2 line-clamp-2 text-[13px] leading-[18px] text-hc-ink-2">
                      {post.text}
                    </p>
                  )}

                  {/* Engagement footer */}
                  <div className="mt-auto pt-3 flex items-center gap-3 text-[11px] text-hc-caption">
                    <span className="flex items-center gap-1">
                      <Heart size={12} className={post.likes?.length ? 'fill-hc-brand text-hc-brand' : ''} />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={12} /> {post.commentCount || 0}
                    </span>
                    {post.type && (
                      <span className={`ml-auto rounded-full bg-gradient-to-r ${accent} px-2 py-0.5 text-[10px] font-bold text-white`}>
                        {post.type}
                      </span>
                    )}
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
