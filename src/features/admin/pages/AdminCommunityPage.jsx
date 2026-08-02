import { useState, useEffect, useMemo } from 'react';
import { Trash2, MessageSquare, Flame, Image as ImageIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PageHeader from '@/features/admin/components/PageHeader';
import FilterTabs from '@/features/admin/components/FilterTabs';
import StatusBadge from '@/features/admin/components/StatusBadge';
import ConfirmDialog from '@/features/admin/components/ConfirmDialog';
import { subscribeToPosts } from '@/services/postService';
import { adminDeletePost } from '@/services/adminService';

const TYPE_BADGES = {
  project: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  beforeafter: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
  tip: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  question: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  collaboration: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  post: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

const toMillis = (v) => (v?.toMillis ? v.toMillis() : v instanceof Date ? v.getTime() : Number(v) || 0);

export default function AdminCommunityPage() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => subscribeToPosts(setPosts), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const counts = useMemo(() => {
    const c = { all: posts.length };
    posts.forEach((p) => { c[p.type] = (c[p.type] || 0) + 1; });
    return c;
  }, [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter !== 'all' && p.type !== filter) return false;
      if (!q) return true;
      return (p.authorName || '').toLowerCase().includes(q) || (p.text || '').toLowerCase().includes(q);
    });
  }, [posts, search, filter]);

  const doDelete = async () => {
    setBusy(true);
    try { await adminDeletePost(toDelete.id); setToast('Post removed from community'); } catch { setToast('Failed to delete post'); }
    finally { setBusy(false); setToDelete(null); }
  };

  const engagement = (post) => {
    const reactions = Object.values(post.reactions || {}).reduce((s, arr) => s + (arr?.length || 0), 0);
    return reactions + (post.likes?.length || 0) + (post.commentCount || 0);
  };

  return (
    <div className="mx-auto max-w-7xl font-sans text-gray-900 dark:text-gray-100">
      <PageHeader
        title="Community Moderation"
        subtitle={`${counts.all} posts on the feed — review engagement and remove anything inappropriate.`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <input
          aria-label="Search posts"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10 dark:border-gray-700 dark:bg-gray-900"
        />
        <FilterTabs
          tabs={[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'project', label: 'Projects', count: counts.project || 0 },
            { key: 'beforeafter', label: 'Before/After', count: counts.beforeafter || 0 },
            { key: 'tip', label: 'Tips', count: counts.tip || 0 },
            { key: 'question', label: 'Questions', count: counts.question || 0 },
            { key: 'collaboration', label: 'Collabs', count: counts.collaboration || 0 },
          ]}
          active={filter}
          onChange={setFilter}
        />
      </div>

      {toast && (
        <div className="fixed right-5 top-5 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((post) => {
          const mediaCount = (post.media?.length || 0) + (post.beforeImage ? 1 : 0) + (post.afterImage ? 1 : 0) + (post.videoUrl ? 1 : 0);
          return (
            <div key={post.id} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50/60 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-sm font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                {post.authorAvatar ? <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" /> : (post.authorName || '?')[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{post.authorName || 'Unknown'}</p>
                  <StatusBadge status={post.authorRole}>{post.authorRole}</StatusBadge>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${TYPE_BADGES[post.type] || TYPE_BADGES.post}`}>{post.type}</span>
                  {post.authorVerified && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">Verified</span>}
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">{post.text}</p>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400">
                  <span>{post.createdAt ? formatDistanceToNow(toMillis(post.createdAt), { addSuffix: true }) : '—'}</span>
                  {post.location && <span>{post.location}</span>}
                  <span className="flex items-center gap-1"><Flame size={12} className="text-orange-400" /> {engagement(post)}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {post.commentCount || 0}</span>
                  {mediaCount > 0 && <span className="flex items-center gap-1"><ImageIcon size={12} /> {mediaCount}</span>}
                </div>
              </div>
              <button
                onClick={() => setToDelete(post)}
                className="flex shrink-0 items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <Trash2 size={13} /> Remove
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-500 dark:text-gray-400">No posts match your filters.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Remove this post?"
        message={`"${(toDelete?.text || '').slice(0, 80)}..." will be permanently deleted from the community feed.`}
        confirmLabel="Remove post"
        loading={busy}
        onConfirm={doDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
