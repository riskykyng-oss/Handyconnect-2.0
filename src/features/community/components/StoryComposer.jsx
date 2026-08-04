import { useState } from 'react';
import { X, Camera, Loader2, Send, ImagePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { createStory } from '@/services/storyService';
import { uploadFile } from '@/services/storageService';
import { getUserProfile } from '@/services/userService';

export default function StoryComposer({ open, onClose, uid, displayName, photoURL }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const pick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleClose = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setCaption('');
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (busy) return;
    if (!file) return setError('Pick a photo for your story.');
    setBusy(true);
    setError(null);
    try {
      let trade = 'Professional';
      try {
        const profile = await getUserProfile(uid);
        trade = profile?.trade || (profile?.skills && profile.skills.split(',')[0]) || 'Professional';
      } catch { /* keep default */ }
      const image = await uploadFile(file, `stories/${uid}`);
      await createStory({
        authorId: uid,
        authorName: displayName || 'Community member',
        avatar: photoURL || null,
        trade,
        image,
        caption: caption.trim(),
      });
      toast.success('Story shared! It disappears after 24 hours.');
      handleClose();
    } catch (err) {
      setError(err?.message || 'Could not share your story.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={handleClose}>
      <div className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-200 p-[2.5px]">
              <img
                src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'U')}&background=ea580c&color=fff`}
                alt={displayName || 'You'}
                className="h-full w-full rounded-full border-2 border-white object-cover"
              />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-hc-ink dark:text-gray-100">New story</h2>
              <p className="mt-0.5 text-xs text-hc-caption dark:text-gray-400">Visible for 24 hours</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {preview ? (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200">
              <img src={preview} alt="Story preview" className="h-64 w-full object-cover" />
              <button
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                aria-label="Remove photo"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-10 text-center transition-colors hover:border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <Camera size={20} />
              </span>
              <span className="text-sm font-semibold text-hc-ink-2 dark:text-gray-300">Tap to add a photo</span>
              <span className="text-xs text-hc-ink-3">Work moments, before &amp; afters, jobs in progress</span>
              <input type="file" accept="image/*" onChange={pick} className="hidden" />
            </label>
          )}

          <label className="mb-1.5 mt-5 block text-xs font-semibold uppercase tracking-wider text-hc-caption">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="What are you up to?"
            maxLength={90}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 text-sm text-hc-ink outline-none transition-all placeholder:text-hc-ink-3 focus:border-hc-brand focus:bg-white focus:ring-2 focus:ring-hc-brand/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:bg-gray-900"
          />

          {error && <p className="mt-2 text-xs font-semibold text-red-500">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-hc-brand px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-hc-brand-strong disabled:opacity-50"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : file ? <Send size={15} /> : <ImagePlus size={15} />}
            {busy ? 'Sharing...' : 'Share story'}
          </button>
        </div>
      </div>
    </div>
  );
}
