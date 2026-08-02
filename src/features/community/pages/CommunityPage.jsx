import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createPost, reactToPost, subscribeToPosts, toggleSave, votePoll, updatePost, deletePost, updateComment, deleteComment } from '@/services/postService';
import { followUser, unfollowUser, subscribeFollowing } from '@/services/followService';
import { createGroup, subscribeGroups } from '@/services/groupService';
import { subscribeStories, markStorySeen } from '@/services/storyService';
import { uploadFile } from '@/services/storageService';
import StoriesRow from '@/features/community/components/StoriesRow';
import StoryViewer from '@/features/community/components/StoryViewer';
import StoryComposer from '@/features/community/components/StoryComposer';
import CommunityComposer from '@/features/community/components/CommunityComposer';
import FeedFilters from '@/features/community/components/FeedFilters';
import PostCard from '@/components/cards/PostCard';
import GroupsSection from '@/features/community/components/GroupsSection';

export default function CommunityPage() {
  const { currentUser, userRole } = useAuth();
  const isClient = userRole === 'client';

  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [posting, setPosting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState(null);
  const [query, setQuery] = useState('');
  const [groups, setGroups] = useState([]);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [limit, setLimit] = useState(5);
  const [stories, setStories] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStart, setViewerStart] = useState(0);
  const feedRef = useRef(null);

  useEffect(() => subscribeToPosts(setPosts), []);
  useEffect(() => subscribeGroups(setGroups), []);
  useEffect(() => (currentUser ? subscribeFollowing(currentUser.uid, setFollowing) : undefined), [currentUser]);
  useEffect(() => (currentUser ? subscribeStories(userRole, currentUser.uid, setStories) : undefined), [userRole, currentUser]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) || null;

  const filtered = posts.filter((p) => {
    if (activeGroupId && p.groupId !== activeGroupId) return false;
    if (query) {
      const q = query.toLowerCase().replace(/^#/, '');
      const hit =
        (p.text || '').toLowerCase().includes(q) ||
        (p.hashtags || []).some((h) => h.toLowerCase().replace(/^#/, '').includes(q)) ||
        (p.authorName || '').toLowerCase().includes(q) ||
        (p.authorTrade || '').toLowerCase().includes(q);
      if (!hit) return false;
    }
    if (skillFilter) {
      const hasSkill =
        (p.trade && p.trade.toLowerCase().includes(skillFilter.toLowerCase())) ||
        (p.hashtags || []).some((h) => h.toLowerCase().includes(skillFilter.toLowerCase().replace('#', '')));
      if (!hasSkill) return false;
    }
    switch (filter) {
      case 'nearby': return !!p.location;
      case 'questions': return p.type === 'question';
      case 'projects': return p.type === 'project' || p.type === 'beforeafter';
      case 'tips': return p.type === 'tip';
      case 'collaboration': return p.type === 'collaboration';
      case 'following': return following.has(p.authorId);
      default: return true;
    }
  });

  const handlePost = async (data) => {
    setPosting(true);
    try {
      const text = data.text || data.poll?.question || '';
      const imageUrl = data.image ? await uploadFile(data.image, `posts/${currentUser.uid}`) : null;
      const beforeImage = data.beforeImage ? await uploadFile(data.beforeImage, `posts/${currentUser.uid}`) : null;
      const afterImage = data.afterImage ? await uploadFile(data.afterImage, `posts/${currentUser.uid}`) : null;
      await createPost(
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        userRole,
        text,
        imageUrl,
        {
          type: data.type,
          trade: data.trade,
          location: data.location,
          authorAvatar: currentUser.photoURL || null,
          authorVerified: !isClient,
          authorTrade: data.trade || null,
          beforeImage,
          afterImage,
          poll: data.poll,
          groupId: activeGroupId,
        }
      );
    } finally {
      setPosting(false);
    }
  };

  const handleReact = (postId, emoji, active) => reactToPost(postId, currentUser.uid, emoji, active).catch(() => {});
  const handleSave = (postId, collectionName, isSaved) => toggleSave(postId, currentUser.uid, collectionName, isSaved).catch(() => {});
  const handleVote = (postId, optionId) => votePoll(postId, currentUser.uid, optionId).catch(() => {});
  const handleEditPost = (postId, updates) => updatePost(postId, updates).catch(() => {});
  const handleDeletePost = (postId) => deletePost(postId).catch(() => {});
  const handleUpdateComment = (postId, commentId, text) => updateComment(postId, commentId, text).catch(() => {});
  const handleDeleteComment = (postId, commentId) => deleteComment(postId, commentId).catch(() => {});
  const handleFollow = (proId, isFollowing) => {
    if (isFollowing) unfollowUser(currentUser.uid, proId).catch(() => {});
    else followUser(currentUser.uid, proId, currentUser.displayName || currentUser.email).catch(() => {});
  };
  const handleHashtag = (tag) => {
    setQuery(tag);
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleCreateGroup = async (data) => {
    await createGroup({ ...data, createdBy: currentUser.uid, createdByName: currentUser.displayName || currentUser.email });
  };

  const openStory = (story) => {
    if (currentUser && story.id) markStorySeen(story.id, currentUser.uid).catch(() => {});
    const idx = stories.findIndex((s) => s.id === story.id);
    setViewerStart(Math.max(0, idx));
    setViewerOpen(true);
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 lg:py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-wider text-orange-600">
          {isClient ? 'The HandyConnect community' : 'Your marketing platform'}
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-[-0.02em] text-gray-900">
          {isClient ? 'Trusted work, real people.' : 'Grow your business, one post at a time.'}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {isClient
            ? 'Discover professionals through real work — real projects, real reviews, real neighbours.'
            : 'Share your work, build your reputation and turn quality content into real jobs.'}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-sm text-gray-900 shadow-sm outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
          placeholder="Search posts, professionals, hashtags…"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex items-start gap-8">
        <div className="min-w-0 flex-1 max-w-[760px]">

      {/* Stories */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <StoriesRow
          stories={stories}
          currentUserId={currentUser.uid}
          onOpen={openStory}
          onAddStory={() => setComposerOpen(true)}
        />
      </div>

      {/* Groups */}
      <div className="mb-6">
        <GroupsSection
          groups={groups}
          currentUserId={currentUser.uid}
          userRole={userRole}
          activeGroupId={activeGroupId}
          onSelect={setActiveGroupId}
          onCreate={handleCreateGroup}
        />
      </div>

      {/* Composer */}
      <div className="mb-6">
        <CommunityComposer role={userRole} posting={posting} onSubmit={handlePost} group={activeGroup} />
      </div>

      {/* Filters */}
      <div ref={feedRef} className="mb-5 scroll-mt-24">
        <FeedFilters
          role={userRole}
          active={filter}
          onChange={setFilter}
          activeSkill={skillFilter}
          onClearSkill={() => setSkillFilter(null)}
        />
      </div>

      {/* Feed */}
      <div className="mt-3">
        {filtered.slice(0, limit).map((item) => (
          <PostCard
            key={item.id}
            post={item}
            viewerRole={userRole}
            currentUserId={currentUser.uid}
            currentUserName={currentUser.displayName || currentUser.email}
            isFollowing={following.has(item.authorId)}
            onToggleFollow={handleFollow}
            onReact={handleReact}
            onSave={handleSave}
            onVote={handleVote}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onHashtag={handleHashtag}
          />
        ))}

        {!filtered.length && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <p className="font-display text-lg font-bold text-gray-900">Nothing here yet</p>
            <p className="mt-1 text-sm text-gray-500">Be the first to share something with the community.</p>
          </div>
        )}

        {filtered.length > limit && (
          <button
            onClick={() => setLimit(limit + 5)}
            className="w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-bold text-orange-600 shadow-sm transition-colors hover:bg-orange-50"
          >
            Load more posts
          </button>
        )}
      </div>

        </div>
      </div>

      {/* Story viewer */}
      {viewerOpen && (
        <StoryViewer
          stories={stories}
          initialIndex={viewerStart}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* Story composer */}
      <StoryComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        uid={currentUser.uid}
        displayName={currentUser.displayName || currentUser.email}
        photoURL={currentUser.photoURL}
      />
    </div>
  );
}
