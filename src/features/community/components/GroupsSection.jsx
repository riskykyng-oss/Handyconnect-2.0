import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Image as ImageIcon, Plus, Users, X } from 'lucide-react';
import Card from '@/components/ui/Card';
import { memberCount, GROUP_LOCATIONS_OPTIONS, GROUP_VISIBILITY_OPTIONS } from '@/services/groupService';
import { getUserProfile } from '@/services/userService';
import { uploadFile } from '@/services/storageService';
import { JOB_CATEGORIES } from '@/constants/categories';

const VISIBILITY_LABELS = { public: 'Public', private: 'Private', invite: 'Invite only' };

export default function GroupsSection({ groups, currentUserId, userRole, activeGroupId, onSelect, onCreate }) {
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
      const coverUrl = coverImage ? await uploadFile(coverImage, `groups/${currentUserId}`) : null;
      const logoUrl = logo ? await uploadFile(logo, `groups/${currentUserId}`) : null;
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
    } catch (err) {
      setError(err.message || 'Could not create the group.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <Users size={16} />
          </div>
          <h3 className="font-display text-sm font-bold text-gray-900">Groups</h3>
        </div>
        <button
          onClick={() => { setError(null); setCreating(!creating); }}
          disabled={!canCreate && !creating}
          className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-bold text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creating ? <X size={13} /> : <Plus size={13} />} {creating ? 'Close' : 'Create'}
        </button>
      </div>

      {isHandyman && verified === false && (
        <button
          onClick={() => navigate('/handyman/profile')}
          className="mb-3 flex w-full items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-left text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
        >
          <Check size={14} />
          Only verified handymen can create groups — request your badge.
        </button>
      )}

      {!isHandyman && (
        <p className="mb-3 rounded-xl bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500">
          Only verified handymen can create groups. You can join any group.
        </p>
      )}

      {creating && (
        <form onSubmit={submit} className="mb-3 space-y-2 rounded-xl bg-gray-50 p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500"
            placeholder="Group name e.g. Zimbabwe Electricians"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="2"
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500"
            placeholder="What is this group about?"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500"
            >
              <option value="">Category</option>
              {JOB_CATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500"
            >
              {GROUP_LOCATIONS_OPTIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-orange-500"
          >
            {GROUP_VISIBILITY_OPTIONS.map((v) => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <textarea
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            rows="2"
            className="w-full resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-orange-500"
            placeholder="Rules — one per line (optional)"
          />
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-orange-400 hover:text-orange-600">
              {coverImage ? <img src={URL.createObjectURL(coverImage)} alt="Cover" className="h-7 w-12 rounded object-cover" /> : <ImageIcon size={14} />}
              {coverImage ? 'Cover set' : 'Cover photo'}
              <input type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files?.[0])} className="hidden" />
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs font-semibold text-gray-500 transition-colors hover:border-orange-400 hover:text-orange-600">
              {logo ? <img src={URL.createObjectURL(logo)} alt="Logo" className="h-7 w-7 rounded-full object-cover" /> : <ImageIcon size={14} />}
              {logo ? 'Logo set' : 'Logo'}
              <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files?.[0])} className="hidden" />
            </label>
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
          <button
            disabled={posting}
            className="w-full rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-600 disabled:opacity-60"
          >
            {posting ? 'Creating…' : 'Create group'}
          </button>
        </form>
      )}

      {!groups.length ? (
        <p className="py-2 text-center text-xs text-gray-400">No groups yet.</p>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => {
            const active = activeGroupId === g.id;
            return (
              <div
                key={g.id}
                className={`flex items-center gap-2 rounded-xl border p-2 transition-colors ${
                  active ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
                }`}
              >
                <button
                  onClick={() => navigate(`/community/groups/${g.id}`)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {g.logo ? (
                    <img src={g.logo} alt="" className="h-9 w-9 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-sm font-extrabold text-orange-600">
                      {(g.name || 'G').charAt(0)}
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-bold text-gray-800">{g.name}</span>
                    <span className="block truncate text-[10px] font-semibold text-gray-400">
                      {g.category || 'Community'} · {memberCount(g)} members · {VISIBILITY_LABELS[g.visibility] || 'Public'}
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => onSelect(active ? null : g.id)}
                  title={active ? 'Stop filtering by this group' : 'Show this group\'s posts in the feed'}
                  className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold transition-colors ${
                    active ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {active ? '✓ Feed' : 'Feed'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {activeGroupId && (
        <button
          onClick={() => onSelect(null)}
          className="mt-3 flex items-center gap-1 text-xs font-bold text-orange-600 hover:underline"
        >
          <X size={12} /> Showing posts from this group only
        </button>
      )}
    </Card>
  );
}
