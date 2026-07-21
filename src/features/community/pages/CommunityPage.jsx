import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import PostCard from '@/components/cards/PostCard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createPost, subscribeToPosts, toggleLike } from '@/services/postService';
import { Loader2, Send } from 'lucide-react';

export default function CommunityPage() {
  const { currentUser, userRole } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPosts((fetchedPosts) => {
      setPosts(fetchedPosts);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    
    setPosting(true);
    try {
      const authorName = currentUser.displayName || currentUser.email;
      await createPost(currentUser.uid, authorName, userRole, newPostText.trim());
      setNewPostText('');
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId, isLiked) => {
    try {
      await toggleLike(postId, currentUser.uid, isLiked);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Community Feed</h1>
        <p className="text-gray-500 mt-2">Share updates, tips, and showcase your work.</p>
      </div>

      {/* Create Post Box */}
      <Card className="mb-8">
        <form onSubmit={handleCreatePost}>
          <textarea 
            className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
            rows="3"
            placeholder="Share something with the community..."
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
          />
          <div className="flex justify-end mt-3">
            <Button type="submit" disabled={posting || !newPostText.trim()} className="w-auto px-6">
              {posting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="mr-2" />}
              {posting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Posts Feed */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-orange-500" size={32} />
        </div>
      ) : posts.length === 0 ? (
        <Card><p className="text-gray-500 text-center py-8">No posts yet. Be the first to share!</p></Card>
      ) : (
        posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={handleLike} 
            currentUserId={currentUser.uid} 
          />
        ))
      )}
    </div>
  );
}