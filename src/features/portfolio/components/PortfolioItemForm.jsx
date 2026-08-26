import { useState } from 'react';
import { Camera, Images, Plus, X } from 'lucide-react';
import { uploadFile } from '@/services/storageService';
import { JOB_CATEGORIES } from '@/constants/categories';

const MAX_PHOTOS = 4;

const inputClass = 'w-full rounded-xl border border-black/[0.08] bg-hc-page px-3 py-2 text-sm text-hc-ink outline-none transition-colors placeholder:text-hc-caption focus:border-hc-brand focus:bg-white';

export default function PortfolioItemForm({ uid, initial, saving, onCancel, onSubmit }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [trade, setTrade] = useState(initial?.trade || '');
  const [location, setLocation] = useState(initial?.location || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [existingImages, setExistingImages] = useState(initial?.images || []);
  const [newImages, setNewImages] = useState([]);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [error, setError] = useState(null);

  const existingBefore = initial?.beforeImage || null;
  const existingAfter = initial?.afterImage || null;

  const addPhotos = (files) => {
    const picked = Array.from(files || []).slice(0, Math.max(0, MAX_PHOTOS - existingImages.length - newImages.length));
    setNewImages((list) => [...list, ...picked]);
  };

  const removeNew = (i) => setNewImages((list) => list.filter((_, idx) => idx !== i));
  const removeExisting = (i) => setExistingImages((list) => list.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Add a title so clients know what you did.'); return; }
    if (!trade) { setError('Pick a trade so clients can find you.'); return; }
    setError(null);
    try {
      const uploaded = [];
      for (const f of newImages) uploaded.push(await uploadFile(f, `portfolio/${uid}`));
      const images = [...existingImages, ...uploaded];
      const beforeImage = beforeFile ? await uploadFile(beforeFile, `portfolio/${uid}`) : existingBefore;
      const afterImage = afterFile ? await uploadFile(afterFile, `portfolio/${uid}`) : existingAfter;
      await onSubmit({
        title: title.trim(),
        trade,
        location: location.trim() || null,
        price: price.trim() || null,
        description: description.trim() || null,
        featured,
        images,
        beforeImage,
        afterImage,
      });
    } catch {
      setError('Upload failed. Check your connection and try again.');
    }
  };

  const photosLeft = MAX_PHOTOS - existingImages.length - newImages.length;

  return (
    <form onSubmit={submit} className="rounded-xl border border-black/[0.07] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold tracking-tight text-hc-ink">
          {initial ? 'Edit project' : 'Add a project to your portfolio'}
        </h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-lg p-1.5 text-hc-ink-3 transition-colors hover:bg-hc-hairline hover:text-hc-accent-strong" aria-label="Cancel">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-hc-ink-2">Project title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Full house rewiring in Borrowdale" className={inputClass} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-hc-ink-2">Trade</label>
            <select value={trade} onChange={(e) => setTrade(e.target.value)} className={inputClass}>
              <option value="">Select trade</option>
              {JOB_CATEGORIES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-hc-ink-2">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Avondale" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-hc-ink-2">Price (optional)</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. $850" className={inputClass} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-hc-ink-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="3"
            placeholder="What did you do? What made it great? Clients decide based on your description."
            className={`${inputClass} resize-none`} />
        </div>

        {/* Photos */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-hc-ink-2">Project photos {photosLeft > 0 && <span className="text-hc-caption">({photosLeft} more)</span>}</label>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((src, i) => (
              <div key={`e${i}`} className="relative">
                <img src={src} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <button type="button" onClick={() => removeExisting(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-hc-ink/70 text-white transition-colors hover:bg-hc-ink"><X size={11} /></button>
              </div>
            ))}
            {newImages.map((file, i) => (
              <div key={`n${i}`} className="relative">
                <img src={URL.createObjectURL(file)} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <button type="button" onClick={() => removeNew(i)} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-hc-ink/70 text-white transition-colors hover:bg-hc-ink"><X size={11} /></button>
              </div>
            ))}
            {photosLeft > 0 && (
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-black/[0.12] text-hc-ink-3 transition-colors hover:border-hc-brand hover:text-hc-brand">
                <Plus size={18} />
                <span className="text-[10px] font-semibold">Add photo</span>
                <input type="file" accept="image/*" multiple onChange={(e) => addPhotos(e.target.files)} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Before / After */}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="cursor-pointer rounded-xl border border-dashed border-black/[0.12] p-3 text-center text-xs font-semibold text-hc-caption transition-colors hover:border-hc-brand hover:text-hc-brand">
            {(beforeFile || existingBefore) ? <img src={beforeFile ? URL.createObjectURL(beforeFile) : existingBefore} alt="Before" className="mx-auto mb-1 h-20 w-full rounded-lg object-cover" /> : <Camera size={18} className="mx-auto mb-1" />}
            {beforeFile ? 'Change BEFORE photo' : existingBefore ? 'Replace BEFORE photo' : 'Upload BEFORE'}
            <input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
          <label className="cursor-pointer rounded-xl border border-dashed border-black/[0.12] p-3 text-center text-xs font-semibold text-hc-caption transition-colors hover:border-hc-brand hover:text-hc-brand">
            {(afterFile || existingAfter) ? <img src={afterFile ? URL.createObjectURL(afterFile) : existingAfter} alt="After" className="mx-auto mb-1 h-20 w-full rounded-lg object-cover" /> : <Images size={18} className="mx-auto mb-1" />}
            {afterFile ? 'Change AFTER photo' : existingAfter ? 'Replace AFTER photo' : 'Upload AFTER'}
            <input type="file" accept="image/*" onChange={(e) => setAfterFile(e.target.files?.[0] || null)} className="hidden" />
          </label>
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-hc-ink-2">
          <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 rounded border-hc-ink-4 accent-hc-brand" />
          Feature this project
        </label>

        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          {onCancel && (
            <button type="button" onClick={onCancel} className="rounded-xl border border-black/[0.08] px-4 py-2 text-sm font-semibold text-hc-ink-2 transition-colors hover:bg-hc-hairline">
              Cancel
            </button>
          )}
          <button type="submit" disabled={saving} className="rounded-xl bg-hc-brand px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-hc-brand-strong disabled:opacity-60">
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Publish to portfolio'}
          </button>
        </div>
      </div>
    </form>
  );
}
