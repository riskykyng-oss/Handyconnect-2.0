import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Image as ImageIcon, Plus, Sparkles, Users, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import ColoredAvatar from '@/components/ui/ColoredAvatar';
import { memberCount, joinGroup, leaveGroup, isMember, GROUP_LOCATIONS_OPTIONS, GROUP_VISIBILITY_OPTIONS } from '@/services/groupService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import { JOB_CATEGORIES } from '@/constants/categories';

const cardShadow = 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_1px_3px_rgba(0,0,0,0.06)]';

export default function GroupsSection({ groups, currentUserId, userRole, onCreate }) {
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
          <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-hc-caption dark:text-gray-400">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-hc-tile text-hc-ink-2"><Users size={13} /></span>
            Verified Groups
          </h3>
          <p className="mt-1 text-xs text-hc-caption dark:text-gray-400">Trade communities — created by verified professionals, open to everyone.</p>
        </div>
        <button
          onClick={() => { setError(null); setCreating(!creating); }}
          disabled={!canCreate && !creating}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-hc-tile px-2.5 py-1.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:bg-hc-page hover:text-hc-ink disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300"
        >
          {creating ? <X size={13} /> : <Plus size={13} />} {creating ? 'Close' : 'Create'}
        </button>
      </div>

      {isHandyman && verified === false && (
        <button
          onClick={() => navigate('/handyman/profile')}
          className="mb-4 flex w-full items-center gap-2 rounded-xl border border-hc-hairline bg-hc-tile px-3 py-2 text-left text-xs font-semibold text-hc-ink-2 transition-colors hover:bg-hc-page dark:border-gray-700 dark:bg-gray-700 dark:text-gray-300"
        >
          <BadgeCheck size={14} />
          Only verified handymen can create groups — request your badge.
        </button>
      )}

      {creating && (
        <form onSubmit={submit} className="mb-4 space-y-2 rounded-xl bg-hc-page p-3 dark:bg-gray-700/60">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-hc-ink outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Group name e.g. Zimbabwe Electricians"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="w-full resize-none rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-hc-ink outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="What is this group about?"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              <option value="">Category</option>
              {JOB_CATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
            >
              {GROUP_LOCATIONS_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-hc-ink-2 outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"
          >
            {GROUP_VISIBILITY_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows="2"
            className="w-full resize-none rounded-lg border border-black/[0.12] bg-white px-3 py-2 text-sm text-hc-ink outline-none focus:border-hc-brand dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Rules — one per line (optional)"
          />
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.15] px-3 py-2 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-black/[0.3] hover:text-hc-ink-2 dark:border-gray-600">
              {coverImage ? <img src={URL.createObjectURL(coverImage)} alt="Cover" className="h-7 w-12 rounded object-cover" /> : <ImageIcon size={14} />}
              {coverImage ? 'Cover set' : 'Cover photo'}
              <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0])} className="hidden" />
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-black/[0.15] px-3 py-2 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-black/[0.3] hover:text-hc-ink-2 dark:border-gray-600">
              {logo ? <img src={URL.createObjectURL(logo)} alt="Logo" className="h-7 w-7 rounded-full object-cover" /> : <ImageIcon size={14} />}
              {logo ? 'Logo set' : 'Logo'}
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0])} className="hidden" />
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
          <button
            disabled={posting}
            className="w-full rounded-xl bg-hc-brand px-5 py-2.5 text-[15px] font-semibold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-60"
          >
            {posting ? 'Creating…' : 'Create group'}
          </button>
        </form>
      )}

      {!creating && error && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>
      )}

      {!joinedGroups.length ? (
        <p className="rounded-xl bg-hc-tile px-4 py-5 text-center text-xs font-medium text-hc-ink-2 dark:bg-gray-700 dark:text-gray-300">
          You haven&apos;t joined any groups yet. Pick one below or create the first trade community.
        </p>
      ) : (
        <div className="space-y-1.5">
          {joinedGroups.map((g) => {
            const count = memberCount(g);
            return (
              <div key={g.id} className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-hc-page dark:hover:bg-gray-700/50">
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
                  className="h-7 shrink-0 rounded-lg bg-hc-hairline px-2.5 text-[11px] font-medium text-hc-ink-2 transition-colors hover:bg-hc-page dark:bg-gray-700 dark:text-gray-300"
                >
                  Leave
                </button>
              </div>
            );
          })}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-hc-caption">
            <Sparkles size={12} className="text-hc-ink-3" /> Suggested for you
          </p>
          <div className="space-y-2">
            {suggestions.map((g) => {
              const count = memberCount(g);
              return (
                <div key={g.id} className={`flex items-center gap-2.5 rounded-lg border border-hc-hairline bg-white px-2.5 py-2 ${cardShadow} dark:border-gray-700 dark:bg-gray-800`}>
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
    </Card>
  );
}
