import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, Calendar, Flag, Globe, Hash, Lock, Mail, MapPin, Megaphone,
  MessageSquare, Share2, Shield, Users, X, Send, AlertTriangle, Link2, MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createPost, reactToPost, subscribeToPosts, toggleSave, votePoll, updatePost, deletePost, updateComment, deleteComment } from '@/services/postService';
import { followUser, unfollowUser, subscribeFollowing } from '@/services/followService';
import { subscribeGroup, joinGroup, leaveGroup, memberCount, isMember, roleOf, reportGroup } from '@/services/groupService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import CommunityComposer from '@/features/community/components/CommunityComposer';
import PostCard from '@/components/cards/PostCard';
import { timeAgo } from '@/utils/time';

const VISIBILITY_LABELS = { public: 'Public', private: 'Private', invite: 'Invite only' };
const VISIBILITY_ICONS = { public: Globe, private: Lock, invite: Lock };

const TABS = [
  { id: 'home', label: 'Home', icon: Users },
  { id: 'posts', label: 'Posts', icon: MessageSquare },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'about', label: 'About', icon: Shield },
];

const ROLE_BADGES = {
  owner: { label: 'Owner', className: 'bg-hc-ink text-white' },
  admin: { label: 'Admin', className: 'bg-hc-tint text-hc-tint-text' },
  member: { label: 'Member', className: 'bg-hc-tile text-hc-ink-2' },
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
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reporting, setReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Join "${group?.name || 'this group'}" on HandyConnect`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: group?.name, text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInvite = async (method) => {
    if (method === 'copy') {
      if (navigator.clipboard) await navigator.clipboard.writeText(shareUrl).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    } else if (method === 'sms') {
      window.open(`sms:?body=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank');
    }
    setInviteOpen(false);
  };

  const REPORT_REASONS = [
    'Spam or fake content',
    'Hate speech or harassment',
    'Inappropriate content',
    'Scam or fraud',
    'Misleading information',
    'Other',
  ];

  const handleReport = async () => {
    if (!reportReason || !currentUser) return;
    setReporting(true);
    try {
      await reportGroup(groupId, currentUser.uid, currentUser.displayName || currentUser.email, reportReason, reportDetails);
      setReportSent(true);
      setTimeout(() => { setReportOpen(false); setReportSent(false); setReportReason(''); setReportDetails(''); }, 2500);
    } catch { /* silently fail */ }
    setReporting(false);
  };

  const renderStats = () => (
    <div className="flex items-center divide-x divide-hc-hairline rounded-lg border border-hc-hairline bg-white px-4 py-2 dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
      <span className="flex items-center gap-1.5 pr-4 text-xs font-semibold text-hc-ink dark:text-gray-100">
        <Users size={13} className="text-hc-ink-3" /> {totalMembers} members
      </span>
      <span className="flex items-center gap-1.5 px-4 text-xs font-semibold text-hc-ink dark:text-gray-100">
        <MessageSquare size={13} className="text-hc-ink-3" /> {groupPosts.length} posts
      </span>
      <span className="flex items-center gap-1.5 pl-4 text-xs font-semibold text-hc-ink dark:text-gray-100">
        <Calendar size={13} className="text-hc-ink-3" /> {formatDate(group?.createdAt).split(' ').slice(1).join(' ') || ''}
      </span>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-4">
      {renderStats()}

      <div className="flex items-center gap-2 rounded-lg bg-hc-tile px-3 py-2 text-[11px] font-semibold text-hc-ink-2 dark:bg-gray-800 dark:text-gray-300">
        <Megaphone size={13} />
        Pinned announcements coming soon.
      </div>

      <div>
        <div className="mb-2 flex items-baseline justify-between">
          <h3 className="text-sm font-semibold text-hc-ink dark:text-gray-100">Latest discussions</h3>
          {groupPosts.length > 3 && (
            <button onClick={() => setTab('posts')} className="text-[11px] font-semibold text-hc-brand hover:underline">
              View all ({groupPosts.length})
            </button>
          )}
        </div>
        {groupPosts.length ? (
          <div className="divide-y divide-hc-hairline rounded-lg border border-hc-hairline bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
            {groupPosts.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() => setTab('posts')}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-hc-page dark:hover:bg-gray-700/50"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-hc-tile text-[10px] font-semibold text-hc-ink-3">
                  {(p.authorName || '?').charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold text-hc-ink dark:text-gray-100">{p.authorName}</span>
                  <span className="block truncate text-xs text-hc-ink-2">{p.text}</span>
                </span>
                <span className="shrink-0 text-[10px] text-hc-ink-3">{timeAgo(p.createdAt)}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-hc-hairline px-4 py-6 text-center dark:border-gray-700">
            <p className="text-xs font-semibold text-hc-ink dark:text-gray-100">No discussions yet</p>
            <p className="mt-0.5 text-[11px] text-hc-caption dark:text-gray-400">{joined ? 'Post something to start.' : 'Join the group to participate.'}</p>
          </div>
        )}
      </div>

      {/* Top members — inline row */}
      {memberList.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-hc-ink dark:text-gray-100">Members</h3>
          <div className="flex items-center gap-3">
            {memberList.slice(0, 5).map((m) => (
              <Link key={m.uid} to={`/pro/${m.uid}`} className="flex flex-col items-center gap-1">
                {m.profile.avatar ? (
                  <img src={m.profile.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-hc-tile text-xs font-semibold text-hc-ink-3">
                    {(m.profile.name || '?').charAt(0)}
                  </span>
                )}
                <span className="max-w-[64px] truncate text-[10px] font-medium text-hc-ink-2">{m.profile.name?.split(' ')[0]}</span>
              </Link>
            ))}
            {memberList.length > 5 && (
              <button onClick={() => setTab('members')} className="text-[10px] font-semibold text-hc-brand hover:underline">+{memberList.length - 5} more</button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderPosts = () => (
    <div className="max-w-[860px] space-y-4">
      {joined ? (
        <CommunityComposer role={userRole} posting={posting} onSubmit={handlePost} group={group} user={currentUser} />
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-hc-hairline px-4 py-3 dark:border-gray-700">
          <p className="flex-1 text-xs font-semibold text-hc-ink dark:text-gray-100">Join the group to post.</p>
          <button onClick={handleJoin} className="rounded-lg bg-hc-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-hc-brand-strong">
            Join
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
        <div className="rounded-lg border border-dashed border-hc-hairline px-4 py-6 text-center dark:border-gray-700">
          <p className="text-xs font-semibold text-hc-ink dark:text-gray-100">No posts yet</p>
          <p className="mt-0.5 text-[11px] text-hc-caption dark:text-gray-400">Be the first to share something.</p>
        </div>
      )}
    </div>
  );

  const renderMembers = () => (
    <div className="max-w-[860px]">
      <div className="divide-y divide-hc-hairline rounded-lg border border-hc-hairline bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
        {memberList.map((m) => {
          const badge = ROLE_BADGES[m.role];
          return (
            <div key={m.uid} className="flex items-center gap-2.5 px-3 py-2.5">
              {m.profile.avatar ? (
                <img src={m.profile.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hc-tile text-xs font-semibold text-hc-ink-3">
                  {(m.profile.name || '?').charAt(0)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-hc-ink dark:text-gray-100">
                    {m.profile.name} {m.me && <span className="font-normal text-hc-ink-3">(You)</span>}
                  </span>
                  {m.profile.verified && <BadgeCheck size={12} className="shrink-0 fill-hc-brand text-white" />}
                  {badge && (
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${badge.className}`}>{badge.label}</span>
                  )}
                </span>
                <p className="truncate text-[11px] text-hc-ink-3">{m.profile.trade || 'Professional'}</p>
              </div>
              <Link
                to={`/pro/${m.uid}`}
                className="shrink-0 rounded-md px-2 py-1 text-[10px] font-semibold text-hc-ink-3 transition-colors hover:bg-hc-page hover:text-hc-ink dark:hover:bg-gray-700"
              >
                View
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="max-w-[860px] space-y-4">
      <div className="rounded-lg border border-hc-hairline bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-1.5 text-xs font-bold uppercase tracking-wider text-hc-ink-3">About</h3>
        <p className="text-[13px] leading-relaxed text-hc-ink-2 dark:text-gray-300">{group.description || 'No description yet.'}</p>
      </div>

      <div className="rounded-lg border border-hc-hairline bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-hc-ink-3">Details</h3>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
          {[
            { label: 'Owner', value: group.createdByName || group.createdBy },
            { label: 'Category', value: group.category || 'Community' },
            { label: 'Location', value: group.location || '—' },
            { label: 'Visibility', value: VISIBILITY_LABELS[group.visibility] || 'Public' },
            { label: 'Created', value: formatDate(group.createdAt) },
            { label: 'Members', value: totalMembers },
          ].map((row) => (
            <div key={row.label}>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-hc-ink-3">{row.label}</dt>
              <dd className="mt-0.5 text-xs font-semibold text-hc-ink dark:text-gray-100">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-lg border border-hc-hairline bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-hc-ink-3">Group rules</h3>
        {group.rules?.length ? (
          <ol className="space-y-1.5">
            {group.rules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px] text-hc-ink-2 dark:text-gray-300">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-hc-tile text-[9px] font-semibold text-hc-ink-3">{i + 1}</span>
                {rule}
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[11px] text-hc-caption dark:text-gray-400">No rules set.</p>
        )}
      </div>
    </div>
  );

  if (!loaded) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-10 text-center">
        <p className="text-xs font-medium text-hc-ink-3">Loading group…</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-[1120px] px-4 py-10">
        <div className="rounded-lg border border-hc-hairline bg-white p-6 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm font-semibold text-hc-ink dark:text-gray-100">Group not found</p>
          <p className="mt-0.5 text-xs text-hc-caption dark:text-gray-400">This group may have been removed.</p>
          <Link to="/community" className="mt-3 inline-flex items-center gap-1 rounded-lg bg-hc-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-hc-brand-strong">
            <ArrowLeft size={12} /> Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-4 lg:py-6">
      <Link to="/community" className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-hc-ink-2 transition-colors hover:text-hc-ink dark:text-gray-300">
        <ArrowLeft size={13} /> Back to Community
      </Link>

      {/* Header */}
      <div className="overflow-hidden rounded-xl border border-hc-hairline bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {group.coverImage ? (
          <img src={group.coverImage} alt="" className="h-24 w-full object-cover sm:h-28" />
        ) : (
          <div className="h-24 w-full bg-gradient-to-r from-hc-brand to-hc-brand-strong sm:h-28" />
        )}

        <div className="px-4 pb-4 sm:px-6">
          <div className="-mt-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-3">
              {group.logo ? (
                <img src={group.logo} alt="" className="h-14 w-14 rounded-xl border-2 border-white object-cover shadow dark:border-gray-900" />
              ) : (
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-white bg-hc-tile text-xl font-bold text-hc-ink-2 shadow dark:border-gray-900">
                  {(group.name || 'G').charAt(0)}
                </span>
              )}
              <div className="min-w-0 pb-0.5">
                <h1 className="truncate text-xl font-bold tracking-tight text-hc-ink dark:text-gray-100">{group.name}</h1>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium text-hc-ink-2 dark:text-gray-400">
                  {group.category && (
                    <span className="flex items-center gap-0.5"><Hash size={11} /> {group.category}</span>
                  )}
                  {group.location && (
                    <span className="flex items-center gap-0.5"><MapPin size={11} /> {group.location}</span>
                  )}
                  <span className="flex items-center gap-0.5"><VisibilityIcon size={11} /> {VISIBILITY_LABELS[group.visibility] || 'Public'}</span>
                  <span className="flex items-center gap-0.5"><Users size={11} /> {totalMembers}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {joined ? (
                <>
                  {myRole === 'owner' && (
                    <button
                      onClick={() => setManageHint(true)}
                      className="rounded-lg border border-hc-hairline bg-white px-3 py-1.5 text-xs font-semibold text-hc-ink-2 shadow-sm transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      Manage
                    </button>
                  )}
                  <button
                    onClick={handleLeave}
                    className="rounded-lg border border-hc-hairline bg-white px-3 py-1.5 text-xs font-semibold text-hc-ink-2 shadow-sm transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    Leave
                  </button>
                </>
              ) : (
                <button
                  onClick={handleJoin}
                  className="flex items-center gap-1.5 rounded-lg bg-hc-brand px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-hc-brand-strong"
                >
                  <Users size={13} /> Join
                </button>
              )}
              <button
                onClick={() => setInviteOpen(true)}
                className="flex items-center gap-1 rounded-lg border border-hc-hairline bg-white px-3 py-1.5 text-xs font-semibold text-hc-ink-2 shadow-sm transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Mail size={13} /> Invite
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 rounded-lg border border-hc-hairline bg-white px-3 py-1.5 text-xs font-semibold text-hc-ink-2 shadow-sm transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                <Share2 size={13} /> Share
              </button>
              <button
                onClick={() => setReportOpen(true)}
                title="Report group"
                className="rounded-lg border border-hc-hairline bg-white p-1.5 text-hc-ink-3 shadow-sm transition-colors hover:bg-red-50 hover:text-red-500 dark:border-gray-700 dark:bg-gray-800"
              >
                <Flag size={13} />
              </button>
            </div>
          </div>

          {group.description && (
            <p className="mt-2.5 max-w-2xl text-xs leading-relaxed text-hc-ink-2 dark:text-gray-300">
              {group.description}
            </p>
          )}

          {manageHint && (
            <div className="mt-2 flex items-center gap-2 rounded-lg bg-hc-tile px-2.5 py-1.5 text-[11px] font-semibold text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">
              <Shield size={12} />
              Group management coming soon.
              <button onClick={() => setManageHint(false)} className="ml-auto text-hc-ink-3 hover:text-hc-ink-2">✕</button>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {inviteOpen && (
        <>
          <button className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setInviteOpen(false)} aria-label="Close" />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-hc-hairline bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold text-hc-ink dark:text-gray-100">Invite to group</h3>
              <button onClick={() => setInviteOpen(false)} className="rounded-lg p-1 text-hc-ink-3 hover:bg-hc-page dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <p className="mb-4 text-sm text-hc-caption dark:text-gray-400">Share this group with friends and colleagues.</p>
            <div className="space-y-2.5">
              <button onClick={() => handleInvite('copy')} className="flex w-full items-center gap-3 rounded-xl border border-hc-hairline bg-white px-4 py-3 text-left text-[15px] font-semibold text-hc-ink-2 transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Link2 size={18} className="text-hc-brand" />
                <div>
                  <p className="font-semibold">Copy link</p>
                  <p className="text-xs font-normal text-hc-caption">Copy the group URL to clipboard</p>
                </div>
              </button>
              <button onClick={() => handleInvite('whatsapp')} className="flex w-full items-center gap-3 rounded-xl border border-hc-hairline bg-white px-4 py-3 text-left text-[15px] font-semibold text-hc-ink-2 transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <MessageCircle size={18} className="text-emerald-500" />
                <div>
                  <p className="font-semibold">WhatsApp</p>
                  <p className="text-xs font-normal text-hc-caption">Share via WhatsApp message</p>
                </div>
              </button>
              <button onClick={() => handleInvite('sms')} className="flex w-full items-center gap-3 rounded-xl border border-hc-hairline bg-white px-4 py-3 text-left text-[15px] font-semibold text-hc-ink-2 transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Send size={18} className="text-hc-accent" />
                <div>
                  <p className="font-semibold">Text message</p>
                  <p className="text-xs font-normal text-hc-caption">Send an SMS with the invite link</p>
                </div>
              </button>
            </div>
            {copied && (
              <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-center text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                Link copied!
              </p>
            )}
          </div>
        </>
      )}

      {/* Report Modal */}
      {reportOpen && (
        <>
          <button className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => { setReportOpen(false); setReportSent(false); setReportReason(''); setReportDetails(''); }} aria-label="Close" />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-hc-hairline bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            {reportSent ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <AlertTriangle size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-hc-ink dark:text-gray-100">Report submitted</p>
                <p className="mt-1 text-sm text-hc-caption dark:text-gray-400">Our team will review this group. Thank you for helping keep HandyConnect safe.</p>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-hc-ink dark:text-gray-100">Report group</h3>
                  <button onClick={() => setReportOpen(false)} className="rounded-lg p-1 text-hc-ink-3 hover:bg-hc-page dark:hover:bg-gray-700"><X size={18} /></button>
                </div>
                <p className="mb-4 text-sm text-hc-caption dark:text-gray-400">Why are you reporting this group? All reports are sent to the admin team.</p>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setReportReason(r)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[15px] font-medium transition-colors ${
                        reportReason === r
                          ? 'border-hc-brand bg-hc-tint text-hc-brand'
                          : 'border-hc-hairline bg-white text-hc-ink-2 hover:border-hc-hairline dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${reportReason === r ? 'border-hc-brand' : 'border-hc-hairline dark:border-gray-600'}`}>
                        {reportReason === r && <div className="h-2 w-2 rounded-full bg-hc-brand" />}
                      </div>
                      {r}
                    </button>
                  ))}
                </div>
                {reportReason && (
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Add any extra details (optional)…"
                    rows={3}
                    className="mt-3 w-full rounded-xl border border-hc-hairline bg-white px-4 py-3 text-sm text-hc-ink outline-none transition-colors focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                )}
                <button
                  onClick={handleReport}
                  disabled={!reportReason || reporting}
                  className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-[15px] font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {reporting ? 'Submitting…' : 'Submit report'}
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Tabs */}
      <div className="mt-3 flex gap-1 overflow-x-auto rounded-lg border border-hc-hairline bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.id ? 'bg-hc-brand text-white shadow-sm' : 'text-hc-ink-2 hover:bg-hc-page dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            <t.icon size={13} /> {t.label}
            {t.id === 'members' && (
              <span className={`rounded-full px-1 text-[9px] ${tab === t.id ? 'bg-white/20' : 'bg-hc-tile'}`}>{totalMembers}</span>
            )}
            {t.id === 'posts' && (
              <span className={`rounded-full px-1 text-[9px] ${tab === t.id ? 'bg-white/20' : 'bg-hc-tile'}`}>{groupPosts.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === 'home' && renderHome()}
        {tab === 'posts' && renderPosts()}
        {tab === 'members' && renderMembers()}
        {tab === 'about' && renderAbout()}
      </div>
    </div>
  );
}
