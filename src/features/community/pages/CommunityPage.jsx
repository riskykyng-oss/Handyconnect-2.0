import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BadgeCheck, Briefcase, Flame, Hash, MessageCircle, Star, Users, X } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createPost, reactToPost, subscribeToPosts, toggleSave, votePoll, updatePost, deletePost, updateComment, deleteComment } from '@/services/postService';
import { followUser, unfollowUser, subscribeFollowing } from '@/services/followService';
import { createGroup, subscribeGroups, joinGroup, isMember, memberCount } from '@/services/groupService';
import { subscribeStories, markStorySeen } from '@/services/storyService';
import { subscribeProfessionals } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import StoriesRow from '@/features/community/components/StoriesRow';
import StoryViewer from '@/features/community/components/StoryViewer';
import StoryComposer from '@/features/community/components/StoryComposer';
import CommunityComposer from '@/features/community/components/CommunityComposer';
import FeedFilters from '@/features/community/components/FeedFilters';
import PostCard from '@/components/cards/PostCard';
import GroupsSection from '@/features/community/components/GroupsSection';
import ColoredAvatar from '@/components/ui/ColoredAvatar';

const reactionCount = (p) => Object.values(p.reactions || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);

function Stars({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} className={i <= Math.round(value || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
      ))}
    </span>
  );
}

const cardShadow = 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]';

function Widget({ icon, title, children }) {
  return (
    <div className={`rounded-xl border border-hc-hairline bg-white p-4 ${cardShadow} dark:border-gray-700 dark:bg-gray-800`}>
      <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-hc-caption dark:text-gray-400">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

export default function CommunityPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { currentUser, userRole } = useAuth();
  const isClient = userRole === 'client';

  const [posts, setPosts] = useState([]);
  const [pros, setPros] = useState([]);
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
  useEffect(() => subscribeProfessionals(setPros), []);
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
      case 'projects': return p.type === 'project';
      case 'beforeafter': return p.type === 'beforeafter';
      case 'tips': return p.type === 'tip';
      case 'collaboration': return p.type === 'collaboration';
      case 'following': return following.has(p.authorId);
      default: return true;
    }
  });

  // Featured professionals — ranked by rating then jobs (real data).
  const featuredPros = pros
    .filter((p) => (Number(p.rating) || 0) > 0 || Number(p.jobs) > 0)
    .sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0) || (Number(b.jobs) || 0) - (Number(a.jobs) || 0))
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      name: p.displayName || p.email || 'Professional',
      avatar: p.photoURL || null,
      trade: p.trade || (p.skills && p.skills.split(',')[0]) || 'Professional',
      rating: Number(p.rating) || 0,
      jobs: Number(p.jobs) || 0,
      verified: !!p.verified,
    }));

  // Trending tags from real hashtags.
  const tagCounts = {};
  posts.forEach((p) => (p.hashtags || []).forEach((h) => { tagCounts[h] = (tagCounts[h] || 0) + 1; }));
  const trendingTags = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // Trending — most engaged posts this week.
  const trendingPosts = [...posts].sort((a, b) => ((b.commentCount || 0) + reactionCount(b)) - ((a.commentCount || 0) + reactionCount(a))).slice(0, 3);

  // Suggested groups the user hasn't joined yet (distinct from the joined grid in GroupsSection).
  const suggestedGroups = groups.filter((g) => !isMember(g, currentUser?.uid)).slice(0, 4);

  // Latest post per group (for group cards).
  const groupLastPosts = {};
  posts.forEach((p) => { if (p.groupId && !groupLastPosts[p.groupId]) groupLastPosts[p.groupId] = p; });

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
    setFilter('all');
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const handleCreateGroup = async (data) => {
    await createGroup({ ...data, createdBy: currentUser.uid, createdByName: currentUser.displayName || currentUser.email });
  };
  const handleJoin = (groupId) => joinGroup(groupId, currentUser.uid).catch(() => {});

  // Guests can browse the feed read-only; interactive actions ask them to sign in.
  const authed = (fn) => (...args) => {
    if (!currentUser) {
      navigate('/auth/login', { state: { from: '/community' } });
      return;
    }
    return fn(...args);
  };

  const openStory = (story) => {
    if (currentUser && story.id) markStorySeen(story.id, currentUser.uid).catch(() => {});
    const idx = stories.findIndex((s) => s.id === story.id);
    setViewerStart(Math.max(0, idx));
    setViewerOpen(true);
  };

  return (
    <div className="min-h-[100dvh] bg-hc-page">
      <div className="mx-auto max-w-[960px] px-4 py-8 lg:py-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-hc-ink dark:text-gray-100">Community</h1>
          <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Connect, learn and showcase your work.</p>
        </header>

        <div className="lg:flex lg:items-start lg:gap-6">
          {/* Center feed */}
          <div className="min-w-0 lg:max-w-[640px] lg:flex-1">
            {/* Stories */}
            {currentUser && (
              <div className={`mb-6 rounded-xl border border-hc-hairline bg-white p-5 ${cardShadow} dark:border-gray-700 dark:bg-gray-800`}>
                <StoriesRow
                  stories={stories}
                  currentUserId={currentUser.uid}
                  onOpen={openStory}
                  onAddStory={() => setComposerOpen(true)}
                />
              </div>
            )}

            {/* Featured This Week */}
            {featuredPros.length > 0 && (
              <div className="mb-6">
                <h2 className="mb-3 text-base font-semibold tracking-tight text-hc-ink dark:text-gray-100">Featured This Week</h2>
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                  {featuredPros.map((p) => (
                    <div key={p.id} className={`flex w-[176px] shrink-0 flex-col items-center rounded-xl border border-hc-hairline bg-white p-3.5 text-center ${cardShadow} dark:border-gray-700 dark:bg-gray-800`}>
                      {p.avatar ? (
                        <img src={p.avatar} alt={p.name} className="h-14 w-14 rounded-full border-2 border-gray-100 object-cover dark:border-gray-700" />
                      ) : (
                        <ColoredAvatar id={p.id} name={p.name} size="lg" className="border-2 border-gray-100 dark:border-gray-700" />
                      )}
                      <p className="mt-2 flex max-w-full items-center justify-center gap-1 text-center text-sm font-semibold text-hc-ink dark:text-gray-100">
                        <span className="min-w-0 break-words">{p.name}</span>
                        {p.verified && <BadgeCheck size={14} className="shrink-0 fill-hc-brand text-white" />}
                      </p>
                      <p className="mt-0.5 w-full truncate text-xs font-medium text-hc-ink-2">{p.trade}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Stars value={p.rating} />
                        <span className="text-[11px] font-semibold text-hc-ink dark:text-gray-100">{p.rating ? p.rating.toFixed(1) : 'New'}</span>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-hc-ink-3">
                        <Briefcase size={11} /> {p.jobs} {p.jobs === 1 ? 'job' : 'jobs'}
                      </p>
                      <button
                        onClick={() => navigate(`/pro/${p.id}`)}
                        className="mt-3 h-8 w-full rounded-lg bg-hc-brand text-xs font-semibold text-white transition-colors hover:bg-hc-brand-strong"
                      >
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Groups */}
            {currentUser && (
              <div className="mb-6">
                <GroupsSection
                  groups={groups}
                  currentUserId={currentUser.uid}
                  userRole={userRole}
                  activeGroupId={activeGroupId}
                  onSelect={setActiveGroupId}
                  onCreate={handleCreateGroup}
                  latestPosts={groupLastPosts}
                />
              </div>
            )}

            {/* Composer / join prompt */}
            <div className="mb-6">
              {currentUser ? (
                <CommunityComposer role={userRole} posting={posting} onSubmit={handlePost} group={activeGroup} user={currentUser} />
              ) : (
                <div className={`flex flex-col items-center gap-3 rounded-xl border border-hc-hairline bg-white p-6 text-center ${cardShadow} dark:border-gray-700 dark:bg-gray-800`}>
                  <p className="text-[15px] font-semibold tracking-tight text-hc-ink dark:text-gray-100">
                    Join the conversation
                  </p>
                  <p className="max-w-sm text-sm text-hc-caption dark:text-gray-400">
                    Create a free account to share projects, ask questions and follow local pros.
                  </p>
                  <Link
                    to="/auth/signup"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-hc-brand px-6 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-hc-brand-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-brand/40 active:translate-y-0 active:scale-[0.98]"
                  >
                    Create free account
                  </Link>
                </div>
              )}
            </div>

            {/* Filters */}
            <div ref={feedRef} className="mb-5 scroll-mt-24">
              {query && (
                <div className="mb-3 flex w-fit items-center gap-2 rounded-full border border-hc-hairline bg-hc-tile px-3 py-1.5 text-xs font-semibold text-hc-ink-2 dark:border-gray-700 dark:bg-gray-800">
                  <Hash size={12} /> {query}
                  <button onClick={() => setQuery('')} aria-label="Clear tag filter" className="rounded-full hover:bg-gray-200">
                    <X size={12} />
                  </button>
                </div>
              )}
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
                <motion.div
                  key={item.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                >
                  <PostCard
                    key={item.id}
                    post={item}
                    viewerRole={userRole}
                    currentUserId={currentUser?.uid}
                    currentUserName={currentUser?.displayName || currentUser?.email}
                    isFollowing={following.has(item.authorId)}
                    onToggleFollow={authed(handleFollow)}
                    onReact={authed(handleReact)}
                    onSave={authed(handleSave)}
                    onVote={authed(handleVote)}
                    onEditPost={authed(handleEditPost)}
                    onDeletePost={authed(handleDeletePost)}
                    onUpdateComment={authed(handleUpdateComment)}
                    onDeleteComment={authed(handleDeleteComment)}
                    onHashtag={handleHashtag}
                  />
                </motion.div>
              ))}

              {!filtered.length && (
                <div className={`rounded-xl border border-hc-hairline bg-white p-10 text-center ${cardShadow} dark:border-gray-700 dark:bg-gray-800`}>
                  <p className="text-base font-semibold tracking-tight text-hc-ink dark:text-gray-100">No posts here yet</p>
                  <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Be the first to share something with the community.</p>
                </div>
              )}

              {filtered.length > limit && (
                <button
                  onClick={() => setLimit(limit + 5)}
                  className={`h-11 w-full rounded-xl border border-hc-brand/30 bg-white text-sm font-semibold text-hc-brand shadow-sm transition-colors hover:bg-hc-tint dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300`}
                >
                  Load more posts
                </button>
              )}
            </div>
          </div>

          {/* Right sidebar (desktop) */}
          <aside className="hidden lg:sticky lg:top-24 lg:block lg:w-[200px] lg:shrink-0 lg:space-y-5">
            <Widget icon={<Flame size={13} className="text-hc-ink-3" />} title="Trending">
              {trendingPosts.length > 0 ? (
                <div className="space-y-3">
                  {trendingPosts.map((p) => {
                    const replies = p.commentCount || 0;
                    return (
                      <button
                        key={p.id}
                        onClick={() => { setFilter('all'); setQuery(''); feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                        className="block w-full text-left transition-colors"
                      >
                        <p className="text-[13px] font-medium leading-snug text-hc-ink">{p.text}</p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-hc-ink-3">
                          <MessageCircle size={11} /> {replies} {replies === 1 ? 'reply' : 'replies'}
                          {p.hashtags?.length > 0 && <span> · {p.hashtags[0]}</span>}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs leading-5 text-hc-ink-3">Nothing trending yet — be the first to spark a conversation.</p>
              )}
            </Widget>

            <Widget icon={<Hash size={13} className="text-hc-ink-3" />} title="Trending tags">
              {trendingTags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {trendingTags.map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => handleHashtag(tag)}
                      className="rounded-lg bg-hc-tile px-2.5 py-1 text-xs font-medium text-hc-ink-2 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {tag} <span className="ml-0.5 text-[10px] font-semibold text-hc-ink-3">{count}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-5 text-hc-ink-3">No trending tags yet — tag your post to start one.</p>
              )}
            </Widget>

            <Widget icon={<Users size={13} className="text-hc-ink-3" />} title="Suggested groups">
              {suggestedGroups.length > 0 ? (
                <div className="space-y-2">
                  {suggestedGroups.map((g) => {
                    const count = memberCount(g);
                    return (
                      <div key={g.id} className="flex items-center gap-2">
                        <ColoredAvatar id={g.id} name={g.name} size="sm" />
                        <button onClick={() => navigate(`/community/groups/${g.id}`)} className="min-w-0 flex-1 text-left">
                          <span className="block break-words text-xs font-medium leading-snug text-hc-ink">{g.name}</span>
                          <span className="mt-0.5 block text-[11px] text-hc-ink-3">{count} {count === 1 ? 'member' : 'members'}</span>
                        </button>
                        <button
                          onClick={() => authed(handleJoin)(g.id)}
                          className="h-7 shrink-0 rounded-lg bg-hc-brand px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-hc-brand-strong"
                        >
                          Join
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs leading-5 text-hc-ink-3">You&apos;ve joined all the groups — check back later for new ones.</p>
              )}
            </Widget>
          </aside>
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
