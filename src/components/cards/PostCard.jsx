import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, BarChart3, Bookmark, Check, Heart, Link2, MapPin, MessageCircle, MoreHorizontal, Pencil, Send, Share2, Trash2, UserRound, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import BeforeAfterSlider from '@/features/community/components/BeforeAfterSlider';
import MediaCarousel from '@/features/community/components/MediaCarousel';
import { addComment, subscribeToComments } from '@/services/postService';

const REACTIONS = ['👍', '❤️', '👏', '🔥', '💡', '🎉'];
const SAVE_COLLECTIONS = ['Saved Projects', 'Ideas', 'Professionals', 'Tutorials'];

const timeAgo = (date) => {
  const minutes = Math.floor((Date.now() - new Date(date)) / 60000);
  return minutes < 1
    ? 'Just now'
    : minutes < 60
      ? `${minutes}m`
      : minutes < 1440
        ? `${Math.floor(minutes / 60)}h`
        : new Date(date).toLocaleDateString();
};

const renderText = (text, onHashtag) =>
  text.split(/(#[\w-]+|@[\w-]+)/g).map((part, index) =>
    part.startsWith('#') || part.startsWith('@') ? (
      <button
        key={index}
        onClick={() => onHashtag?.(part)}
        className="font-semibold text-orange-600 hover:underline"
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
  const total = options.reduce((sum, o) => sum + (poll.votes?.[o.id] || 0), 0);
  const myChoice = poll?.voters?.[currentUserId];

  return (
    <div className="border-t border-gray-100 px-5 pt-4 pb-5">
      <p className="flex items-center gap-1.5 font-display text-sm font-bold text-gray-900">
        <BarChart3 size={15} className="text-orange-500" /> {poll.question}
      </p>
      <div className="mt-3 space-y-2.5">
        {options.map((opt) => {
          const count = poll.votes?.[opt.id] || 0;
          const pct = total ? Math.round((count / total) * 100) : 0;
          const isMine = myChoice === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onVote?.(post.id, opt.id)}
              className={`w-full rounded-xl border px-3 py-2.5 text-left transition-colors ${
                isMine ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/40'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={`min-w-0 flex-1 truncate text-sm ${isMine ? 'font-bold text-orange-700' : 'font-semibold text-gray-800'}`}>
                  {opt.text}
                </span>
                <span className="shrink-0 text-xs font-bold text-gray-500">{pct}%</span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-orange-500 transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              {isMine && <p className="mt-1 text-[10px] font-bold text-orange-600">Your vote</p>}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] font-semibold text-gray-400">{total} {total === 1 ? 'vote' : 'votes'}</p>
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
      return <BeforeAfterSlider before={post.beforeImage} after={post.afterImage} />;
    }
    if (post.videoUrl) {
      return (
        <video src={post.videoUrl} controls className="max-h-[520px] w-full bg-gray-100" />
      );
    }
    if (post.media?.length > 1) {
      return <MediaCarousel images={post.media} alt={`${post.authorName}'s project`} />;
    }
    const src = post.media?.[0] || post.imageUrl;
    if (src) return <img src={src} alt="Post attachment" className="max-h-[520px] w-full object-cover" />;
    return null;
  };

  return (
    <Card className="mb-5 p-0">
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
            <button type="button" onClick={goProfile} aria-label={`View ${post.authorName}'s profile`} className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-orange-600 transition-colors hover:bg-orange-200">
              <UserRound size={19} />
            </button>
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-orange-100 text-orange-600">
              <UserRound size={19} />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 font-display text-sm font-bold text-gray-900">
              {isPro ? (
                <button type="button" onClick={goProfile} className="truncate hover:underline">{post.authorName}</button>
              ) : (
                <span className="truncate">{post.authorName}</span>
              )}
              {post.authorVerified && <BadgeCheck size={15} className="shrink-0 fill-orange-500 text-white" />}
            </p>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
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
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                isFollowing ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-orange-500 text-white hover:bg-orange-600'
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
                  <div className="absolute right-0 z-40 mt-1 w-40 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
                    <button
                      onClick={() => { setMenuOpen(false); setEditing(true); setEditText(post.text); setEditTrade(post.trade || ''); setEditLocation(post.location || ''); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Pencil size={14} className="text-gray-400" /> Edit post
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); remove(); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
            />
            {isPro && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <input
                  value={editTrade}
                  onChange={(e) => setEditTrade(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500"
                  placeholder="Trade e.g. Electrician"
                />
                <input
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500"
                  placeholder="Area e.g. Borrowdale"
                />
              </div>
            )}
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="rounded-xl px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveEdit} className="rounded-xl bg-orange-500 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-orange-600">
                Save changes
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 pb-4 text-sm leading-7 text-gray-700">{renderText(post.text, onHashtag)}</div>
        )}

        {!editing && post.trade && (
          <div className="px-5 pb-3">
            <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-orange-600">{post.trade}</span>
          </div>
        )}

        {!editing && media()}

        {post.type === 'poll' && post.poll && !editing && (
          <PollBlock post={post} currentUserId={currentUserId} onVote={onVote} />
        )}

        {/* Action bar */}
        <div className="flex items-center gap-1 border-t border-gray-100 px-2.5 py-2 sm:gap-1.5 sm:px-4 sm:py-2.5">
          {/* Reaction (tap to open picker) */}
          <div className="relative">
            <button
              onClick={() => setReactOpen((o) => !o)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition sm:gap-2 sm:px-3 ${
                myReaction ? 'text-orange-500' : 'text-gray-500 hover:bg-gray-100'
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
                <div className="absolute -top-11 left-0 z-40 flex gap-1 rounded-2xl border border-gray-200 bg-white px-2 py-1.5 shadow-lg">
                  {REACTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => { onReact(post.id, r, reactions[r]?.includes(currentUserId)); setReactOpen(false); }}
                      className={`rounded-lg p-1 text-lg transition-transform hover:scale-125 ${myReaction === r ? 'bg-orange-50' : ''}`}
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
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 sm:gap-2 sm:px-3"
          >
            <MessageCircle size={18} />
            {post.commentCount || comments.length || 0}
          </button>

          <button onClick={share} className="flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 sm:gap-2 sm:px-3">
            {copied ? <Check size={18} className="text-emerald-500" /> : <Share2 size={18} />}
            {copied ? 'Copied' : 'Share'}
          </button>

          {/* Save */}
          <div className="relative ml-auto">
            <button
              onClick={() => setSaveOpen(!saveOpen)}
              className={`flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-semibold transition sm:gap-2 sm:px-3 ${
                savedIn.length ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Bookmark size={18} className={savedIn.length ? 'fill-current' : ''} />
              Save
            </button>
            {saveOpen && (
              <>
                <button className="fixed inset-0 z-30 cursor-default" onClick={() => setSaveOpen(false)} aria-label="Close" />
                <div className="absolute right-0 z-40 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg">
                  <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">Save to</p>
                  {SAVE_COLLECTIONS.map((c) => {
                    const saved = savedIn.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => { onSave(post.id, c, saved); setSaveOpen(false); }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Link2 size={14} className="text-gray-400" /> {c}
                        </span>
                        {saved && <Check size={15} className="text-orange-500" />}
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
          <div className="grid grid-cols-2 gap-2.5 border-t border-gray-100 bg-gray-50/60 px-5 py-3.5 sm:grid-cols-3">
            {viewerRole === 'client' && (
              <button
                onClick={() => navigate('/client/home?post=1')}
                className="col-span-2 min-w-0 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white transition-colors hover:bg-orange-600 sm:col-span-1"
              >
                <span className="block truncate">Hire {post.authorName.split(' ')[0]}</span>
              </button>
            )}
            <button
              onClick={() => navigate(`/${viewerRole === 'client' ? 'client' : 'handyman'}/chat/direct/${post.authorId}`)}
              className="min-w-0 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-100"
            >
              Message
            </button>
            <button
              onClick={() => navigate(`/pro/${post.authorId}`)}
              className="min-w-0 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-bold text-gray-800 transition-colors hover:border-gray-300 hover:bg-gray-100"
            >
              {viewerRole === 'client' ? 'View Profile' : 'View Portfolio'}
            </button>
          </div>
        )}

        {/* Comments */}
        {open && (
          <div className="border-t border-gray-100 px-5 py-5">
            <div className="max-h-56 space-y-4 overflow-y-auto">
              {topComments.map((item) => (
                <div key={item.id} className="rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{item.authorName}</span>
                    <span className="text-xs text-gray-400">{timeAgo(item.createdAt)}</span>
                    <button onClick={() => setReplyTo(replyTo?.id === item.id ? null : { id: item.id, name: item.authorName })} className="ml-auto text-xs font-bold text-orange-600">
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
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-orange-500"
                        autoFocus
                      />
                      <button onClick={saveCommentEdit} className="rounded-lg bg-orange-500 px-2.5 text-xs font-bold text-white hover:bg-orange-600">Save</button>
                      <button onClick={() => setEditingCommentId(null)} className="rounded-lg px-2 text-xs font-bold text-gray-500 hover:bg-gray-100"><X size={13} /></button>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-600">{item.text}</p>
                  )}
                  {repliesFor(item.id).map((reply) => (
                    <div key={reply.id} className="mt-2 rounded-lg bg-white p-2.5 pl-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">{reply.authorName}</span>
                        <span className="text-[10px] text-gray-400">{timeAgo(reply.createdAt)}</span>
                        {reply.authorId === currentUserId && (
                          <button
                            onClick={() => onDeleteComment?.(post.id, reply.id).catch(() => {})}
                            className="ml-auto rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                            aria-label="Delete reply"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 text-sm text-gray-600">{reply.text}</p>
                    </div>
                  ))}
                </div>
              ))}
              {!topComments.length && <p className="py-2 text-center text-xs text-gray-400">No comments yet. Start the conversation.</p>}
            </div>

            {replyTo && (
              <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-orange-600">
                Replying to {replyTo.name}
                <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </p>
            )}

            <form onSubmit={comment} className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
                placeholder={replyTo ? `Reply to ${replyTo.name}...` : 'Write a comment...'}
              />
              <button className="shrink-0 rounded-xl bg-orange-500 p-3 text-white transition-colors hover:bg-orange-600" aria-label="Post comment">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </article>
    </Card>
  );
}
