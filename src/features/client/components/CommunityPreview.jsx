import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Loader2, MessagesSquare } from 'lucide-react';
import { subscribeToPosts } from '@/services/postService';
import { SectionHeader } from './DashboardUI';
import { timeAgo } from './dashboardUtils';

export default function CommunityPreview() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPosts((list) => {
      setPosts(list.slice(0, 3));
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <section aria-label="Community">
      <SectionHeader title="Community Highlights" actionLabel="See all" onAction={() => navigate('/community')} />
      <div className={`rounded-xl border border-hc-hairline bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)] sm:p-5`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-hc-caption" />
          </div>
        ) : posts.length === 0 ? (
          <div className="py-8 text-center">
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFF8F0] to-[#FFE9D3] text-hc-brand">
              <MessagesSquare size={26} />
            </span>
            <p className="text-sm font-medium text-hc-ink-2">No community posts yet</p>
            <p className="mt-1 text-[13px] text-hc-caption">Be the first to share something!</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <button
                  onClick={() => navigate('/community')}
                  className="group block w-full text-left"
                  aria-label={`View community post by ${post.authorName || 'a member'}`}
                >
                  <div className="flex items-center gap-2.5">
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName || 'Member'} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hc-tile text-xs font-bold text-hc-ink-2">
                        {(post.authorName || '?')[0]}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-hc-ink">{post.authorName || 'Community member'}</p>
                      <p className="text-[11px] text-hc-caption">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  {post.text && (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-hc-ink-2 transition-colors group-hover:text-hc-ink">
                      {post.text}
                    </p>
                  )}
                  {post.imageUrl && (
                    <div className="relative mt-2 h-32 overflow-hidden rounded-lg">
                      <img src={post.imageUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-xs text-hc-caption">
                    <span className="flex items-center gap-1">
                      <Heart size={13} className={post.likes?.length ? 'fill-hc-brand text-hc-brand' : ''} />
                      {post.likes?.length || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={13} /> {post.commentCount || 0}
                    </span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
