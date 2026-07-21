import React from 'react';
import Card from '@/components/ui/Card';
import { Heart, Briefcase, User } from 'lucide-react';

// Helper to format time (e.g., "2 hours ago")
const formatTimeAgo = (date) => {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date() - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

export default function PostCard({ post, onLike, currentUserId }) {
  const isLiked = post.likes?.includes(currentUserId);

  return (
    <Card className="mb-6">
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
          {post.authorRole === 'handyman' ? <Briefcase size={20} /> : <User size={20} />}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{post.authorName}</h3>
          <p className="text-xs text-gray-500 capitalize">{post.authorRole} • {formatTimeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-gray-800 mb-4 whitespace-pre-wrap">{post.text}</p>

      {/* Post Footer (Likes) */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <button 
          onClick={() => onLike(post.id, isLiked)} 
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group"
        >
          <div className={`p-2 rounded-full transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'group-hover:bg-red-50'}`}>
            <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
          </div>
          <span className="text-sm font-medium">{post.likes?.length || 0} Likes</span>
        </button>
      </div>
    </Card>
  );
}