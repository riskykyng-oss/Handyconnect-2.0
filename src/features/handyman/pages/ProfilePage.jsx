import { useState, useEffect, useRef } from 'react';
import { getUserProfile, updateUserProfile, updateUserLocation, requestVerification } from '@/services/userService';
import { uploadFile, deleteFile } from '@/services/storageService';
import { useAuth } from '@/features/auth/context/AuthContext';
import LocationPicker from '@/components/ui/LocationPicker';
import { Loader2, Camera, MapPin, User, Star, BadgeCheck, Clock, Trash2 } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const fileRef = useRef(null);
  const [profile, setProfile] = useState({ displayName: '', bio: '', skills: '', photoURL: '' });
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedRequest, setVerifiedRequest] = useState(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState(null);

  useEffect(() => {
    (async () => {
      if (!currentUser) return;
      const data = await getUserProfile(currentUser.uid);
      if (data) {
        setProfile({
          displayName: data.displayName || '',
          bio: data.bio || '',
          skills: data.skills || '',
          photoURL: data.photoURL || '',
        });
        setVerified(!!data.verified);
        setVerifiedRequest(data.verifiedRequest || null);
        if (data.location) setLocation({ ...data.location, address: data.address || '' });
      }
      setLoading(false);
    })();
  }, [currentUser]);

  const handleVerifyRequest = async () => {
    if (!currentUser || verifyBusy) return;
    setVerifyBusy(true);
    setVerifyMsg(null);
    try {
      await requestVerification(currentUser.uid);
      setVerifiedRequest('pending');
      setVerifyMsg('Verification request sent — an admin will review it soon.');
    } catch {
      setVerifyMsg('Could not send the request. Please try again.');
    } finally {
      setVerifyBusy(false);
    }
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      const old = profile.photoURL;
      setProfile((p) => ({ ...p, photoURL: url }));
      await updateUserProfile(currentUser.uid, { photoURL: url });
      if (old) deleteFile(old).catch(() => {});
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!currentUser) return;
    const old = profile.photoURL;
    setProfile((p) => ({ ...p, photoURL: '' }));
    try {
      await updateUserProfile(currentUser.uid, { photoURL: null });
      if (old) deleteFile(old).catch(() => {});
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const trade = (profile.skills || '').split(',').map((s) => s.trim()).filter(Boolean)[0] || null;
      await updateUserProfile(currentUser.uid, { ...profile, trade });
      if (location?.lat && location?.lng) {
        await updateUserLocation(currentUser.uid, { lat: location.lat, lng: location.lng, address: location.address || '' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-hc-ink-3" size={28} /></div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 pb-24 pt-5 lg:pb-10">
      <div>
        <p className="text-xs text-hc-caption">Profile</p>
        <h1 className="mt-0.5 text-xl font-semibold tracking-tight text-hc-ink">Edit your profile</h1>
      </div>

      <div className="rounded-xl border border-black/[0.07] bg-white overflow-hidden">
        {/* Avatar */}
        <div className="flex items-center gap-5 bg-hc-tile p-5 sm:p-6">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-gray-100 shadow-sm">
              {profile.photoURL ? <img src={profile.photoURL} alt="" className="h-full w-full object-cover" /> : <User size={30} className="text-hc-ink-3" />}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="absolute -bottom-0.5 -right-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-hc-brand text-white shadow-sm border-2 border-white hover:bg-hc-brand-strong transition-colors">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
            {profile.photoURL && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                title="Remove photo"
                className="absolute -bottom-0.5 -left-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500 shadow-sm border-2 border-white hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-hc-ink">{profile.displayName || 'Your name'}</p>
              {verified && <BadgeCheck size={16} className="shrink-0 fill-emerald-500 text-white" />}
            </div>
            <div className="flex items-center gap-1 text-sm text-amber-500 mt-0.5"><Star size={13} className="fill-amber-400" /> 0.0</div>
            {!verified && (
              <div className="mt-2">
                {verifiedRequest === 'pending' ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] font-bold text-hc-ink-2">
                    <Clock size={12} /> Verification pending review
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleVerifyRequest}
                    disabled={verifyBusy}
                    className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] font-bold text-hc-ink-2 transition-colors hover:bg-black/[0.1] disabled:opacity-60"
                  >
                    {verifyBusy ? <Loader2 size={12} className="animate-spin" /> : <BadgeCheck size={12} />}
                    {verifiedRequest === 'rejected' ? 'Re-request verification' : 'Request verified badge'}
                  </button>
                )}
              </div>
            )}
            {verifyMsg && <p className="mt-1.5 text-[11px] font-medium text-hc-caption">{verifyMsg}</p>}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 p-5 sm:p-6">
          <div>
            <label className="text-xs font-medium text-hc-ink-2 mb-1 block">Full Name</label>
            <input value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} placeholder="Your full name"
              className="w-full rounded-lg border border-black/[0.08] bg-gray-50 px-3.5 py-2 text-sm text-hc-ink outline-none transition-colors placeholder:text-hc-caption focus:border-hc-brand focus:bg-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-hc-ink-2 mb-1 block">Bio</label>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} rows={3} placeholder="Tell clients about your experience..."
              className="w-full resize-none rounded-lg border border-black/[0.08] bg-gray-50 px-3.5 py-2 text-sm text-hc-ink outline-none transition-colors placeholder:text-hc-caption focus:border-hc-brand focus:bg-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-hc-ink-2 mb-1 block">Trade / Job type</label>
            <input value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} placeholder="Type your trade, e.g. Electrician, Plumber..."
              className="w-full rounded-lg border border-black/[0.08] bg-gray-50 px-3.5 py-2 text-sm text-hc-ink outline-none transition-colors placeholder:text-hc-caption focus:border-hc-brand focus:bg-white" />
            <p className="mt-1 text-[11px] text-hc-caption">Free text. Separate multiple trades with commas — the first one is shown as your primary job type.</p>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-hc-ink-2"><MapPin size={13} className="text-gray-400" /> Service Location</label>
            <LocationPicker initialLocation={location} onLocationChange={(loc) => setLocation(loc)} />
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-hc-brand px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
