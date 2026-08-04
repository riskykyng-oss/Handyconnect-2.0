import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, BarChart3, Bookmark, Check, Heart, Link2, MapPin, MessageCircle, MoreHorizontal, Pencil, Send, Share2, Trash2, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import ColoredAvatar from '@/components/ui/ColoredAvatar';
import BeforeAfterSlider from '@/features/community/components/BeforeAfterSlider';
import MediaCarousel from '@/features/community/components/MediaCarousel';
import { addComment, subscribeToComments } from '@/services/postService';
import { timeAgo } from '@/utils/time';

const REACTIONS = ['👍', '❤️', '👏', '🔥', '💡', '🎉'];
const SAVE_COLLECTIONS = ['Saved Projects', 'Ideas', 'Professionals', 'Tutorials'];

const renderText = (text, onHashtag) =>
  text.split(/(#[\w-]+|@[\w-]+)/g).map((part, index) =>
    part.startsWith('#') || part.startsWith('@') ? (
      <button
        key={index}
        onClick={() => onHashtag?.(part)}
        className="font-semibold text-hc-ink-2 hover:underline"
      >
        {part}
      </button>
    ) : (
      part
    )
  );

function PollBlock({ post, currentUserId, onVote }) {
  const poll = post.poll;
  const options = poll?.options || [];
  const counts = Object.fromEntries(options.map((o) => [o.id, poll.votes?.[o.id] || 0]));
  const total = options.reduce((sum, o) => sum + counts[o.id], 0);
  const leadingId = options.length ? options.reduce((a, b) => (counts[b.id] > counts[a.id] ? b : a)).id : null;
  const myChoice = poll?.voters?.[currentUserId];

  return (
    <div className="border-t border-gray-100 px-5 pt-4 pb-5">
      <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-hc-ink dark:text-gray-100">
        <BarChart3 size={15} className="text-hc-ink-3" /> {poll.question}
      </p>
      <div className="mt-3 space-y-2.5">
        {options.map((opt) => {
          const count = counts[opt.id];
          const pct = total ? Math.round((count / total) * 100) : 0;
          const isMine = myChoice === opt.id;
          const isLeading = opt.id === leadingId && count > 0;
          return (
            <button
              key={opt.id}
              onClick={() => onVote?.(post.id, opt.id)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
                isMine ? 'border-gray-900 bg-gray-100 dark:border-gray-200 dark:bg-gray-700/60' : isLeading ? 'border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-700/40' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`min-w-0 flex-1 truncate text-sm ${isMine || isLeading ? 'font-semibold text-hc-ink dark:text-gray-100' : 'font-medium text-hc-ink-2 dark:text-gray-300'}`}>
                  {opt.text}
                </span>
                <span className="shrink-0 text-xs font-semibold text-hc-caption dark:text-gray-400">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div className={`h-full rounded-full transition-all duration-500 ${isMine || isLeading ? 'bg-hc-ink dark:bg-gray-200' : 'bg-gray-300 dark:bg-gray-600'}`} style={{ width: `${pct}%` }} />
              </div>
              {isMine && <p className="mt-1 text-[10px] font-semibold text-hc-ink">Your vote</p>}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] font-semibold text-hc-ink-3">{total} {total === 1 ? 'vote' : 'votes'}</p>
    </div>
  );
}

export default function PostCard({
  post,
  viewerRole,
  currentUserId,
  currentUserName,
  isFollowing,
  onToggleFollow,
  onReact,
  onSave,
  onVote,
  onEditPost,
  onDeletePost,
  onUpdateComment,
  onDeleteComment,
  onHashtag,
}) {
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [reactOpen, setReactOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [editTrade, setEditTrade] = useState(post.trade || '');
  const [editLocation, setEditLocation] = useState(post.location || '');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  const reactions = post.reactions || {};
  const reactionTotal = Object.values(reactions).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  const myReaction = REACTIONS.find((r) => reactions[r]?.includes(currentUserId));
  const savedIn = SAVE_COLLECTIONS.filter((c) => (post.saves?.[c] || []).includes(currentUserId));
  const isPro = post.authorRole === 'handyman';
  const isOwn = post.authorId === currentUserId;
  const showFollow = isPro && !isOwn && onToggleFollow;
  const showCTA = isPro && !isOwn;
  const goProfile = () => navigate(`/pro/${post.authorId}`);

  useEffect(() => (open ? subscribeToComments(post.id, setComments) : undefined), [open, post.id]);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const comment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await addComment(post.id, currentUserId, currentUserName || 'Community member', text.trim(), replyTo?.id || null);
      setText('');
      setReplyTo(null);
    } catch { /* Firestore may reject; comment stays in the input for retry */ }
  };

  const share = async () => {
    const url = `${window.location.origin}/community`;
    if (navigator.share) {
      try { await navigator.share({ title: `${post.authorName} on HandyConnect`, text: post.text, url }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); setCopied(true); } catch { /* ignore */ }
    }
  };

  const saveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await onEditPost?.(post.id, { text: editText.trim(), trade: editTrade || null, location: editLocation.trim() || null });
      setEditing(false);
    } catch { /* keep editing open on failure */ }
  };

  const remove = () => {
    if (!window.confirm('Delete this post permanently?')) return;
    onDeletePost?.(post.id).catch(() => {});
  };

  const saveCommentEdit = async () => {
    if (!editingCommentText.trim()) return;
    try {
      await onUpdateComment?.(post.id, editingCommentId, editingCommentText.trim());
      setEditingCommentId(null);
    } catch { /* keep open */ }
  };

  const topComments = comments.filter((c) => !c.parentId);
  const repliesFor = (id) => comments.filter((c) => c.parentId === id);

  const media = () => {
    if (post.beforeImage && post.afterImage) {
      return (
        <div className="overflow-hidden rounded-lg">
          <BeforeAfterSlider before={post.beforeImage} after={post.afterImage} />
        </div>
      );
    }
    if (post.videoUrl) {
      return (
        <div className="aspect-[4/3] max-h-[360px] w-full overflow-hidden bg-gray-100">
          <video src={post.videoUrl} controls className="h-full w-full object-cover" />
        </div>
      );
    }
    if (post.media?.length > 1) {
      return (
        <div className="aspect-[4/3] max-h-[360px] w-full overflow-hidden">
          <MediaCarousel images={post.media} alt={`${post.authorName}'s project`} />
        </div>
      );
    }
    const src = post.media?.[0] || post.imageUrl;
    if (src) {
      return (
        <div className="aspect-[4/3] max-h-[360px] w-full overflow-hidden bg-gray-100">
          <img src={src} alt="Post attachment" className="h-full w-full object-cover" />
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="mb-5 p-0 dark:border-gray-700 dark:bg-gray-800">
      <article>
        <header className="flex items-center gap-3 p-5 pb-3">
          {post.authorAvatar ? (
            isPro ? (
              <button type="button" onClick={goProfile} aria-label={`View ${post.authorName}'s profile`}>
                <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
              </button>
            ) : (
              <Avatar src={post.authorAvatar} name={post.authorName} size="md" />
            )
          ) : isPro ? (
            <button type="button" onClick={goProfile} aria-label={`View ${post.authorName}'s profile`} className="transition-opacity hover:opacity-80">
              <ColoredAvatar id={post.authorId} name={post.authorName} />
            </button>
          ) : (
            <ColoredAvatar id={post.authorId} name={post.authorName} />
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold tracking-tight text-hc-ink dark:text-gray-100">
              {isPro ? (
                <button type="button" onClick={goProfile} className="truncate hover:underline">{post.authorName}</button>
              ) : (
                <span className="truncate">{post.authorName}</span>
              )}
              {post.authorVerified && <BadgeCheck size={15} className="shrink-0 fill-hc-brand text-white" />}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-hc-caption dark:text-gray-400">
              <span className="truncate">{post.authorTrade || <span className="capitalize">{post.authorRole}</span>}</span>
              <span>&middot;</span>
              <span className="shrink-0">{timeAgo(post.createdAt)}</span>
              {post.location && (
                <>
                  <span>&middot;</span>
                  <span className="inline-flex items-center gap-0.5 truncate"><MapPin size={11} /> {post.location}</span>
                </>
              )}
            </p>
          </div>
          {showFollow && (
            <button
              onClick={() => onToggleFollow(post.authorId, isFollowing)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300' : 'bg-hc-brand text-white hover:bg-hc-brand-strong'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
          {isOwn && (
            <div className="relative shrink-0">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                aria-label="Post options"
              >
                <MoreHorizontal size={17} />
              </button>
              {menuOpen && (
                <>
                  <button className="fixed inset-0 z-30 cursor-default" onClick={() => setMenuOpen(false)} aria-label="Close" />
                  <div className="absolute right-0 z-40 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <button
                      onClick={() => { setMenuOpen(false); setEditing(true); setEditText(post.text); setEditTrade(post.trade || ''); setEditLocation(post.location || ''); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <Pencil size={14} className="text-gray-400" /> Edit post
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); remove(); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 size={14} /> Delete post
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </header>

        {editing ? (
          <div className="px-5 pb-4">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows="3"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-hc-ink outline-none transition-colors focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />
            {isPro && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  value={editTrade}
                  onChange={(e) => setEditTrade(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  placeholder="Trade e.g. Electrician"
                />
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  placeholder="Area e.g. Borrowdale"
                />
              </div>
            )}
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="rounded-xl px-3 py-1.5 text-xs font-semibold text-hc-ink-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                Cancel
              </button>
              <button onClick={saveEdit} className="rounded-xl bg-hc-brand px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-hc-brand-strong">
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4 text-sm leading-7 text-hc-ink-2 dark:text-gray-300">{renderText(post.text, onHashtag)}</div>
        )}

        {!editing && post.trade && (
          <div className="px-5 pb-3">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">{post.trade}</span>
          </div>
        )}

        {!editing && media()}

        {post.type === 'poll' && post.poll && !editing && (
          <PollBlock post={post} currentUserId={currentUserId} onVote={onVote} />
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 border-t border-gray-100 px-2.5 py-2 sm:gap-1.5 sm:px-4 sm:py-2.5 dark:border-gray-700">
          {/* Reaction (tap to open picker) */}
          <div className="relative">
            <button
              onClick={() => setReactOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition sm:gap-2 sm:px-3 ${
                myReaction ? 'text-hc-ink' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              aria-haspopup="menu"
              aria-expanded={reactOpen}
            >
              <span className="text-base leading-none">{myReaction || <Heart size={18} className={myReaction ? 'fill-current' : ''} />}</span>
              {reactionTotal || 0}
            </button>
            {reactOpen && (
              <>
                <button className="fixed inset-0 z-30 cursor-default" onClick={() => setReactOpen(false)} aria-label="Close" />
                <div className="absolute -top-11 left-0 z-40 flex gap-1 rounded-2xl border border-gray-200 bg-white px-2 py-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {REACTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => { onReact(post.id, r, reactions[r]?.includes(currentUserId)); setReactOpen(false); }}
                      className={`rounded-lg p-1 text-lg transition-transform hover:scale-125 ${myReaction === r ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      aria-label={`React ${r}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 sm:gap-2 sm:px-3"
          >
            <MessageCircle size={18} />
            {post.commentCount || comments.length || 0}
          </button>

          <button onClick={share} className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 sm:gap-2 sm:px-3">
            {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            {copied ? 'Copied' : 'Share'}
          </button>

          {/* Save */}
          <div className="relative ml-auto">
            <button
              onClick={() => setSaveOpen(!saveOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition sm:gap-2 sm:px-3 ${
                savedIn.length ? 'text-hc-ink hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Bookmark size={18} className={savedIn.length ? 'fill-current' : ''} />
              Save
            </button>
            {saveOpen && (
              <>
                <button className="fixed inset-0 z-30 cursor-default" onClick={() => setSaveOpen(false)} aria-label="Close" />
                <div className="absolute right-0 z-40 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-hc-ink-3">Save to</p>
                  {SAVE_COLLECTIONS.map((c) => {
                    const saved = savedIn.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => { onSave(post.id, c, saved); setSaveOpen(false); }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Link2 size={14} className="text-gray-400" /> {c}
                        </span>
                        {saved && <Check size={15} className="text-hc-ink" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Role-aware CTA row */}
        {showCTA && (
          <div className="flex items-stretch gap-2 border-t border-gray-100 bg-gray-50/60 px-5 py-3.5 dark:border-gray-700 dark:bg-gray-700/40">
            {viewerRole === 'client' && (
              <button
                onClick={() => navigate('/client/home?post=1')}
                className="h-10 min-w-0 flex-1 rounded-lg bg-hc-brand px-3.5 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong"
              >
                <span className="block truncate">Hire {post.authorName.split(' ')[0]}</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/${viewerRole === 'client' ? 'client' : 'handyman'}/chat/direct/${post.authorId}`)}
              className="h-10 shrink-0 rounded-lg border border-black/10 bg-transparent px-3.5 text-sm font-medium text-hc-ink-2 transition-colors hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Message
            </button>
            <button
              onClick={() => navigate(`/pro/${post.authorId}`)}
              className="h-10 shrink-0 rounded-lg border border-black/10 bg-transparent px-3.5 text-sm font-medium text-hc-ink-2 transition-colors hover:bg-white dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {viewerRole === 'client' ? 'View Profile' : 'View Portfolio'}
            </button>
          </div>
        )}

        {/* Comments */}
        {open && (
          <div className="border-t border-gray-100 px-5 py-5 dark:border-gray-700">
            <div className="max-h-56 space-y-4 overflow-y-auto">
              {topComments.map((item) => (
                <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-sm dark:bg-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-hc-ink dark:text-gray-100">{item.authorName}</span>
                    <span className="text-xs text-hc-ink-3">{timeAgo(item.createdAt)}</span>
                    <button onClick={() => setReplyTo(replyTo?.id === item.id ? null : { id: item.id, name: item.authorName })} className="ml-auto text-xs font-semibold text-hc-ink-2 hover:text-hc-ink">
                      Reply
                    </button>
                    {item.authorId === currentUserId && (
                      <>
                        <button
                          onClick={() => { setEditingCommentId(item.id); setEditingCommentText(item.text); }}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
                          aria-label="Edit comment"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => onDeleteComment?.(post.id, item.id).catch(() => {})}
                          className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-red-500"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                  {editingCommentId === item.id ? (
                    <div className="mt-2 flex gap-2">
                      <input
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        autoFocus
                      />
                      <button onClick={saveCommentEdit} className="rounded-lg bg-hc-brand px-2.5 text-xs font-semibold text-white hover:bg-hc-brand-strong">Save</button>
                      <button onClick={() => setEditingCommentId(null)} className="rounded-lg px-2 text-xs font-semibold text-hc-ink-2 hover:bg-gray-100 dark:hover:bg-gray-700"><X size={13} /></button>
                    </div>
                  ) : (
                    <p className="mt-1 text-hc-ink-2 dark:text-gray-300">{item.text}</p>
                  )}
                  {repliesFor(item.id).map((reply) => (
                    <div key={reply.id} className="mt-2 rounded-lg bg-white p-2.5 pl-4 dark:bg-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-hc-ink dark:text-gray-100">{reply.authorName}</span>
                        <span className="text-[10px] text-hc-ink-3">{timeAgo(reply.createdAt)}</span>
                        {reply.authorId === currentUserId && (
                          <button
                            onClick={() => onDeleteComment?.(post.id, reply.id).catch(() => {})}
                            className="ml-auto rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500 dark:hover:bg-gray-700"
                            aria-label="Delete reply"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-hc-ink-2 dark:text-gray-300">{reply.text}</p>
                    </div>
                  ))}
                </div>
              ))}
              {!topComments.length && <p className="py-2 text-center text-xs text-hc-ink-3">No comments yet. Start the conversation.</p>}
            </div>

            {replyTo && (
              <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-hc-ink-2">
                Replying to {replyTo.name}
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </p>
            )}

            <form onSubmit={comment} className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Write a comment...'}
              />
              <button className="shrink-0 rounded-xl bg-hc-brand p-3 text-white transition-colors hover:bg-hc-brand-strong" aria-label="Post comment">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </article>
    </Card>
  );
}
