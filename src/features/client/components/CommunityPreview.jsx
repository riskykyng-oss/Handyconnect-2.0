import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ArrowRight, Loader2, ImageIcon } from 'lucide-react';
import { subscribeToPosts } from '@/services/postService';

export default function CommunityPreview({ compact = false }) {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPosts((list) => {
      setPosts(list.slice(0, compact ? 3 : 3));
      setLoading(false);
    });
    return unsub;
  }, [compact]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-gray-900">Community</h3>
        <button onClick={() => navigate('/community')} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:underline">
          See all <ArrowRight size={12} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          <ImageIcon size={28} className="mx-auto mb-2 text-gray-300" />
          <p className="font-medium">No community posts yet</p>
          <p className="mt-1 text-xs">Be the first to share something!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="group cursor-pointer" onClick={() => navigate('/community')}>
              <div className="mb-2 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-700">
                  {post.authorName?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">{post.authorName || 'Unknown'}</p>
                  <p className="text-[10px] text-gray-500">{post.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}</p>
                </div>
              </div>

              {post.imageUrl && (
                <div className="relative mb-2 h-36 overflow-hidden rounded-xl">
                  <img src={post.imageUrl} alt="Post" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
              )}

              {post.text && (
                <p className="mb-2 text-xs text-gray-700 line-clamp-1">{post.text}</p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart size={13} className={post.likes?.length > 0 ? 'fill-red-500 text-red-500' : 'text-gray-400'} />
                    {post.likes?.length || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} className="text-blue-500" />
                    {post.commentCount || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
