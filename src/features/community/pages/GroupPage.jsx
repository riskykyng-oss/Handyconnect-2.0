import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Calendar, Flag, Globe, Hash, Lock, Mail, MapPin, Megaphone,
  MessageSquare, Share2, Shield, Users,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createPost, reactToPost, subscribeToPosts, toggleSave, votePoll, updatePost, deletePost, updateComment, deleteComment } from '@/services/postService';
import { followUser, unfollowUser, subscribeFollowing } from '@/services/followService';
import { subscribeGroup, joinGroup, leaveGroup, memberCount, isMember, roleOf } from '@/services/groupService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import CommunityComposer from '@/features/community/components/CommunityComposer';
import PostCard from '@/components/cards/PostCard';

const VISIBILITY_LABELS = { public: 'Public', private: 'Private', invite: 'Invite only' };
const VISIBILITY_ICONS = { public: Globe, private: Lock, invite: Lock };

const TABS = [
  { id: 'home', label: 'Home', icon: Users },
  { id: 'posts', label: 'Posts', icon: MessageSquare },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'about', label: 'About', icon: Shield },
];

const ROLE_BADGES = {
  owner: { label: 'Owner', className: 'bg-orange-100 text-orange-700' },
  admin: { label: 'Admin', className: 'bg-violet-100 text-violet-700' },
  member: { label: 'Member', className: 'bg-gray-100 text-gray-600' },
};

const timeAgo = (date) => {
  if (!date) return '';
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole } = useAuth();

  const [group, setGroup] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(new Set());
  const [extraMembers, setExtraMembers] = useState([]);
  const [tab, setTab] = useState('home');
  const [posting, setPosting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [manageHint, setManageHint] = useState(false);
  const [reportHint, setReportHint] = useState(false);

  useEffect(
    () => subscribeGroup(groupId, (g) => { setGroup(g); setLoaded(true); }),
    [groupId]
  );
  useEffect(() => subscribeToPosts(setPosts), []);
  useEffect(() => (currentUser ? subscribeFollowing(currentUser.uid, setFollowing) : undefined), [currentUser]);

  useEffect(() => {
    let active = true;
    const uids = group?.members ? Object.keys(group.members) : [];
    const real = uids.filter((u) => u !== currentUser?.uid);
    const load = async () => {
      if (!real.length) {
        if (active) setExtraMembers([]);
        return;
      }
      try {
        const results = await Promise.all(
          real.map(async (u) => {
            const p = await getUserProfile(u);
            if (!p) return null;
            return {
              id: u,
              name: p.displayName || p.name || p.email || u,
              avatar: p.photoURL || null,
              trade: p.trade || p.role || null,
              verified: !!p.verified,
            };
          })
        );
        if (active) setExtraMembers(results.filter(Boolean));
      } catch {
        if (active) setExtraMembers([]);
      }
    };
    load();
    return () => { active = false; };
  }, [group?.members, currentUser?.uid]);

  const groupPosts = posts.filter((p) => p.groupId === groupId);
  const myRole = roleOf(group, currentUser?.uid);
  const joined = isMember(group, currentUser?.uid);
  const totalMembers = memberCount(group);
  const VisibilityIcon = VISIBILITY_ICONS[group?.visibility] || Globe;

  const memberList = useMemo(() => {
    if (!group?.members) return [];
    return Object.keys(group.members).map((uid) => {
      const real = extraMembers.find((m) => m.id === uid);
      const me = uid === currentUser?.uid;
      const profile = me
        ? { name: currentUser.displayName || currentUser.email, avatar: currentUser.photoURL || null, trade: null, verified: false }
        : real || { name: 'HandyConnect member', avatar: null, trade: null, verified: false };
      return { uid, profile, role: roleOf(group, uid), me };
    });
  }, [group, extraMembers, currentUser]);

  const handlePost = async (data) => {
    setPosting(true);
    try {
      const imageUrl = data.image ? await uploadFile(data.image, `posts/${currentUser.uid}`) : null;
      const beforeImage = data.beforeImage ? await uploadFile(data.beforeImage, `posts/${currentUser.uid}`) : null;
      const afterImage = data.afterImage ? await uploadFile(data.afterImage, `posts/${currentUser.uid}`) : null;
      await createPost(
        currentUser.uid,
        currentUser.displayName || currentUser.email,
        userRole,
        data.text || data.poll?.question || '',
        imageUrl,
        {
          type: data.type,
          trade: data.trade,
          location: data.location,
          authorAvatar: currentUser.photoURL || null,
          authorVerified: userRole === 'handyman',
          authorTrade: data.trade || null,
          beforeImage,
          afterImage,
          poll: data.poll,
          groupId,
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
  const handleJoin = () => { if (currentUser) joinGroup(groupId, currentUser.uid).catch(() => {}); };
  const handleLeave = () => { if (currentUser) leaveGroup(groupId, currentUser.uid).catch(() => {}); };
  const copyLink = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const renderStats = () => {
    const stats = [
      { label: 'Members', value: totalMembers, icon: Users },
      { label: 'Posts', value: groupPosts.length, icon: MessageSquare },
      { label: 'Created', value: formatDate(group?.createdAt).split(' ').slice(1).join(' ') || '', icon: Calendar },
    ];
    return (
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <s.icon size={18} className="mx-auto mb-1.5 text-orange-600" />
            <p className="font-display text-lg font-extrabold text-gray-900">{s.value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderHome = () => (
    <div className="grid items-start gap-6 lg:grid-cols-[1fr_280px]">
      <div className="space-y-6">
        {renderStats()}

        <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-semibold text-orange-700">
          <Megaphone size={15} />
          Pinned announcements are coming soon — stay tuned for owner posts you can&apos;t miss.
        </div>

        <div>
          <h3 className="mb-3 font-display text-base font-extrabold text-gray-900">Latest discussions</h3>
          {groupPosts.length ? (
            <div className="space-y-3">
              {groupPosts.slice(0, 3).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setTab('posts')}
                  className="flex w-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition-colors hover:border-orange-300"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-extrabold text-orange-600">
                    {(p.authorName || '?').charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-gray-800">{p.authorName}</span>
                    <span className="block truncate text-sm text-gray-600">{p.text}</span>
                    <span className="mt-0.5 block text-[10px] font-semibold text-gray-400">{timeAgo(p.createdAt)}</span>
                  </span>
                </button>
              ))}
              <button
                onClick={() => setTab('posts')}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-orange-600 shadow-sm transition-colors hover:bg-orange-50"
              >
                See all {groupPosts.length} posts
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <MessageSquare size={22} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold text-gray-800">No discussions yet</p>
              <p className="mt-1 text-xs text-gray-500">{joined ? 'Start the conversation — post something in this group.' : 'Join the group to take part in discussions.'}</p>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h4 className="mb-3 font-display text-sm font-extrabold text-gray-900">Top members</h4>
          <div className="space-y-3">
            {memberList.slice(0, 4).map((m) => (
              <Link key={m.uid} to={`/pro/${m.uid}`} className="flex items-center gap-2">
                {m.profile.avatar ? (
                  <img src={m.profile.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-extrabold text-orange-600">
                    {(m.profile.name || '?').charAt(0)}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate text-xs font-bold text-gray-800">{m.profile.name}</span>
                  <span className="block truncate text-[10px] font-semibold text-gray-400">{m.profile.trade || 'Professional'}</span>
                </span>
              </Link>
            ))}
          </div>
          <button
            onClick={() => setTab('members')}
            className="mt-3 w-full rounded-lg bg-gray-100 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
          >
            View all members
          </button>
        </div>
      </aside>
    </div>
  );

  const renderPosts = () => (
    <div className="max-w-[760px] space-y-6">
      {joined ? (
        <CommunityComposer role={userRole} posting={posting} onSubmit={handlePost} group={group} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-gray-800">Join the group to post</p>
          <p className="mt-1 text-xs text-gray-500">Members can share work, ask questions and help each other out.</p>
          <button onClick={handleJoin} className="mt-3 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
            Join group
          </button>
        </div>
      )}

      {groupPosts.length ? (
        groupPosts.map((item) => (
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
            onHashtag={() => navigate('/community')}
          />
        ))
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <MessageSquare size={24} className="mx-auto mb-2 text-gray-300" />
          <p className="font-display text-lg font-bold text-gray-900">No posts yet</p>
          <p className="mt-1 text-sm text-gray-500">Be the first to share something in this group.</p>
        </div>
      )}
    </div>
  );

  const renderMembers = () => (
    <div className="max-w-[760px] space-y-3">
      {memberList.map((m) => {
        const badge = ROLE_BADGES[m.role];
        return (
          <div key={m.uid} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            {m.profile.avatar ? (
              <img src={m.profile.avatar} alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-base font-extrabold text-orange-600">
                {(m.profile.name || '?').charAt(0)}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-bold text-gray-900">
                  {m.profile.name} {m.me && <span className="font-semibold text-gray-400">(You)</span>}
                </p>
                {m.profile.verified && <BadgeCheck size={15} className="shrink-0 text-sky-500" />}
                {badge && (
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.className}`}>{badge.label}</span>
                )}
              </div>
              <p className="truncate text-xs font-semibold text-gray-400">{m.profile.trade || 'Professional'}</p>
            </div>
            <Link
              to={`/pro/${m.uid}`}
              className="shrink-0 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
            >
              View profile
            </Link>
          </div>
        );
      })}
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-[760px] space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-2 font-display text-base font-extrabold text-gray-900">About this group</h3>
        <p className="text-sm leading-relaxed text-gray-600">{group.description || 'No description yet.'}</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-display text-base font-extrabold text-gray-900">Details</h3>
        <dl className="grid gap-4 sm:grid-cols-2">
          {[
            { label: 'Owner', value: group.createdByName || group.createdBy },
            { label: 'Category', value: group.category || 'Community' },
            { label: 'Location', value: group.location || '—' },
            { label: 'Visibility', value: VISIBILITY_LABELS[group.visibility] || 'Public' },
            { label: 'Created', value: formatDate(group.createdAt) },
            { label: 'Members', value: totalMembers },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-bold text-gray-900">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-3 font-display text-base font-extrabold text-gray-900">Group rules</h3>
        {group.rules?.length ? (
          <ol className="space-y-2">
            {group.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[10px] font-extrabold text-orange-600">{i + 1}</span>
                {rule}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-500">No rules set yet.</p>
        )}
      </div>
    </div>
  );

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-16 text-center">
        <p className="text-sm font-semibold text-gray-400">Loading group…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-16">
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm">
          <p className="font-display text-lg font-bold text-gray-900">Group not found</p>
          <p className="mt-1 text-sm text-gray-500">This group may have been removed.</p>
          <Link to="/community" className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600">
            <ArrowLeft size={15} /> Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 lg:py-10">
      <Link to="/community" className="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 transition-colors hover:text-orange-600">
        <ArrowLeft size={15} /> Back to Community
      </Link>

      {/* Header */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {group.coverImage ? (
          <img src={group.coverImage} alt="" className="h-36 w-full object-cover sm:h-44" />
        ) : (
          <div className="h-36 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 sm:h-44" />
        )}

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {group.logo ? (
                <img src={group.logo} alt="" className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow" />
              ) : (
                <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-orange-500 font-display text-3xl font-extrabold text-white shadow">
                  {(group.name || 'G').charAt(0)}
                </span>
              )}
              <div className="min-w-0 pb-0.5">
                <h1 className="truncate font-display text-2xl font-extrabold tracking-[-0.02em] text-gray-900">{group.name}</h1>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-gray-500">
                  {group.category && (
                    <span className="flex items-center gap-1"><Hash size={12} /> {group.category}</span>
                  )}
                  {group.location && (
                    <span className="flex items-center gap-1"><MapPin size={12} /> {group.location}</span>
                  )}
                  <span className="flex items-center gap-1"><VisibilityIcon size={12} /> {VISIBILITY_LABELS[group.visibility] || 'Public'}</span>
                  <span className="flex items-center gap-1"><Users size={12} /> {totalMembers} members</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {joined ? (
                <>
                  {myRole === 'owner' && (
                    <button
                      onClick={() => setManageHint(true)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                    >
                      Manage group
                    </button>
                  )}
                  <button
                    onClick={handleLeave}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    Leave
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoin}
                  className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
                >
                  <Users size={15} /> Join group
                </button>
              )}
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Mail size={14} /> Invite
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
              >
                <Share2 size={14} /> Share
              </button>
              <button
                onClick={() => setReportHint(true)}
                title="Report group"
                className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Flag size={15} />
              </button>
            </div>
          </div>

          {group.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-600">
              {group.description}
              <span className="ml-1 font-semibold text-gray-400">Created by {group.createdByName || 'a professional'} on {formatDate(group.createdAt)}.</span>
            </p>
          )}

          {copied && (
            <p className="mt-3 inline-block rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600">
              Invite link copied to clipboard.
            </p>
          )}
          {manageHint && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
              <Shield size={13} />
              Group management (edit details, promote admins, remove members) is coming soon.
              <button onClick={() => setManageHint(false)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
          {reportHint && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700">
              <Flag size={13} />
              Reporting is coming soon — our team will review groups that break community guidelines.
              <button onClick={() => setReportHint(false)} className="ml-auto text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-gray-200 bg-white p-1 shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.id ? 'bg-orange-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <t.icon size={15} /> {t.label}
            {t.id === 'members' && (
              <span className={`rounded-full px-1.5 text-[10px] ${tab === t.id ? 'bg-white/20' : 'bg-gray-100'}`}>{totalMembers}</span>
            )}
            {t.id === 'posts' && (
              <span className={`rounded-full px-1.5 text-[10px] ${tab === t.id ? 'bg-white/20' : 'bg-gray-100'}`}>{groupPosts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === 'home' && renderHome()}
        {tab === 'posts' && renderPosts()}
        {tab === 'members' && renderMembers()}
        {tab === 'about' && renderAbout()}
      </div>
    </div>
  );
}
