import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Image as ImageIcon, MessageCircle, Plus, Sparkles, Users, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import ColoredAvatar from '@/components/ui/ColoredAvatar';
import { memberCount, joinGroup, leaveGroup, isMember, GROUP_LOCATIONS_OPTIONS, GROUP_VISIBILITY_OPTIONS } from '@/services/groupService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import { JOB_CATEGORIES } from '@/constants/categories';

const VISIBILITY_LABELS = { public: 'Public', private: 'Private', invite: 'Invite only' };

export default function GroupsSection({ groups, currentUserId, userRole, activeGroupId, onSelect, onCreate, latestPosts = {} }) {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [posting, setPosting] = useState(false);
  const [verified, setVerified] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('Harare');
  const [visibility, setVisibility] = useState('public');
  const [rules, setRules] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [logo, setLogo] = useState(null);

  const isHandyman = userRole === 'handyman';
  const canCreate = isHandyman && verified === true;

  const joinedGroups = groups.filter((g) => isMember(g, currentUserId));
  const suggestions = groups.filter((g) => !isMember(g, currentUserId)).slice(0, 3);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const profile = currentUserId ? await getUserProfile(currentUserId) : null;
        if (active) setVerified(!!profile?.verified);
      } catch {
        if (active) setVerified(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentUserId]);

  const reset = () => {
    setName('');
    setDescription('');
    setCategory('');
    setLocation('Harare');
    setVisibility('public');
    setRules('');
    setCoverImage(null);
    setLogo(null);
    setError(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (posting) return;
    setPosting(true);
    setError(null);
    try {
      // Best-effort image uploads — never block group creation if they fail.
      const uploads = await Promise.all([
        coverImage ? uploadFile(coverImage, `groups/${currentUserId}`) : Promise.resolve(null),
        logo ? uploadFile(logo, `groups/${currentUserId}`) : Promise.resolve(null),
      ]).catch(() => null);
      const [coverUrl, logoUrl] = uploads || [null, null];
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        category: category || null,
        location: location || null,
        visibility,
        rules: rules.split('\n').map((r) => r.trim()).filter(Boolean),
        coverImage: coverUrl,
        logo: logoUrl,
      });
      reset();
      setCreating(false);
      if (!uploads) setError('Group created, but the images could not be uploaded right now.');
    } catch (err) {
      setError(err.message || 'Could not create the group.');
    } finally {
      setPosting(false);
    }
  };

  const toggleJoin = (g) => {
    if (!currentUserId) return;
    if (isMember(g, currentUserId)) leaveGroup(g.id, currentUserId).catch(() => {});
    else joinGroup(g.id, currentUserId).catch(() => {});
  };

  return (
    <Card className="p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-hc-ink dark:text-gray-100">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-hc-ink-2"><Users size={16} /></span>
            Verified Groups
          </h3>
          <p className="mt-1 text-xs text-hc-caption dark:text-gray-400">Trade communities — created by verified professionals, open to everyone.</p>
        </div>
        <button
          onClick={() => { setError(null); setCreating(!creating); }}
          disabled={!canCreate && !creating}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
        >
          {creating ? <X size={13} /> : <Plus size={13} />} {creating ? 'Close' : 'Create'}
        </button>
      </div>

      {isHandyman && verified === false && (
        <button
          onClick={() => navigate('/handyman/profile')}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-left text-xs font-semibold text-hc-ink-2 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >
          <BadgeCheck size={14} />
          Only verified handymen can create groups — request your badge.
        </button>
      )}

      {creating && (
        <form onSubmit={submit} className="mb-4 space-y-2 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/60">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Group name e.g. Zimbabwe Electricians"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="What is this group about?"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="">Category</option>
              {JOB_CATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {GROUP_LOCATIONS_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {GROUP_VISIBILITY_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows="2"
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-hc-ink outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Rules — one per line (optional)"
          />
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600">
              {coverImage ? <img src={URL.createObjectURL(coverImage)} alt="Cover" className="h-7 w-12 rounded object-cover" /> : <ImageIcon size={14} />}
              {coverImage ? 'Cover set' : 'Cover photo'}
              <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0])} className="hidden" />
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-gray-400 hover:text-gray-600 dark:border-gray-600">
              {logo ? <img src={URL.createObjectURL(logo)} alt="Logo" className="h-7 w-7 rounded-full object-cover" /> : <ImageIcon size={14} />}
              {logo ? 'Logo set' : 'Logo'}
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0])} className="hidden" />
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
          <button
            disabled={posting}
            className="w-full rounded-lg bg-hc-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-60"
          >
            {posting ? 'Creating…' : 'Create group'}
          </button>
        </form>
      )}

      {!creating && error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>
      )}

      {!joinedGroups.length ? (
        <p className="rounded-xl bg-gray-100 px-4 py-5 text-center text-xs font-medium text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">
          You haven&apos;t joined any groups yet. Pick one below or create the first trade community.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {joinedGroups.map((g) => {
            const active = activeGroupId === g.id;
            const joined = isMember(g, currentUserId);
            const latest = latestPosts[g.id];
            const count = memberCount(g);
            return (
              <div
                key={g.id}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${active ? 'border-gray-900 ring-2 ring-gray-300 dark:border-gray-200 dark:ring-gray-600' : 'border-hc-hairline dark:border-gray-700 dark:bg-gray-800'}`}
              >
                <button onClick={() => navigate(`/community/groups/${g.id}`)} className="relative block h-10 w-full overflow-hidden text-left">
                  {g.coverImage ? (
                    <img src={g.coverImage} alt="" className="h-10 w-full object-cover" />
                  ) : (
                    <div className="h-10 w-full bg-gradient-to-r from-gray-200 to-gray-300" />
                  )}
                </button>
                <div className="relative px-3 pb-3 pt-6">
                  <span className="absolute -top-4 left-3 grid h-8 w-8 place-items-center overflow-hidden rounded-lg ring-2 ring-white">
                    {g.logo ? (
                      <img src={g.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ColoredAvatar id={g.id} name={g.name} className="h-full w-full rounded-lg" />
                    )}
                  </span>
                  <p className="truncate text-sm font-medium text-hc-ink">{g.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-hc-ink-3">
                    {g.category || 'Community'} · {count} {count === 1 ? 'member' : 'members'} · {VISIBILITY_LABELS[g.visibility] || 'Public'}
                  </p>
                  {latest && (
                    <p className="mt-2 flex items-start gap-1 truncate rounded-lg bg-gray-100 px-2 py-1.5 text-[11px] text-hc-ink-2 dark:bg-gray-700/60 dark:text-gray-300">
                      <MessageCircle size={11} className="mt-0.5 shrink-0 text-hc-ink-3" />
                      <span className="truncate">{latest.text}</span>
                      {latest.commentCount > 0 && (
                        <span className="shrink-0 text-hc-ink-3">· {latest.commentCount} {latest.commentCount === 1 ? 'reply' : 'replies'}</span>
                      )}
                    </p>
                  )}
                  <div className="mt-2.5 flex gap-1.5">
                    <button
                      onClick={() => toggleJoin(g)}
                      className={`h-8 flex-1 rounded-lg text-xs font-medium transition-colors ${
                        joined ? 'bg-gray-100 text-hc-ink-2 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300' : 'bg-hc-brand text-white hover:bg-hc-brand-strong'
                      }`}
                    >
                      {joined ? 'Joined' : 'Join'}
                    </button>
                    <button
                      onClick={() => onSelect(active ? null : g.id)}
                      title={active ? 'Stop filtering by this group' : 'Show this group\'s posts in the feed'}
                      className={`h-8 flex-1 rounded-lg text-xs font-medium transition-colors ${
                        active ? 'bg-hc-ink text-white' : 'border border-hc-hairline bg-transparent text-hc-ink-2 hover:border-gray-300 hover:text-hc-ink dark:border-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {active ? 'Feed on' : 'Feed'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-hc-ink-2">
            <Sparkles size={13} className="text-hc-ink-3" /> Suggested for you
          </p>
          <div className="space-y-2">
            {suggestions.map((g) => {
              const count = memberCount(g);
              return (
                <div key={g.id} className="flex items-center gap-2.5 rounded-lg border border-hc-hairline bg-white px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800">
                  {g.logo ? (
                    <img src={g.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <ColoredAvatar id={g.id} name={g.name} size="sm" />
                  )}
                  <button onClick={() => navigate(`/community/groups/${g.id}`)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-xs font-medium text-hc-ink dark:text-gray-100">{g.name}</span>
                    <span className="block text-[11px] text-hc-ink-3">{count} {count === 1 ? 'member' : 'members'}</span>
                  </button>
                  <button
                    onClick={() => toggleJoin(g)}
                    className="h-7 shrink-0 rounded-lg bg-hc-brand px-2.5 text-[11px] font-medium text-white transition-colors hover:bg-hc-brand-strong"
                  >
                    Join
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeGroupId && (
        <button
          onClick={() => onSelect(null)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-hc-ink-2 hover:underline"
        >
          <X size={12} /> Showing posts from this group only
        </button>
      )}
    </Card>
  );
}
