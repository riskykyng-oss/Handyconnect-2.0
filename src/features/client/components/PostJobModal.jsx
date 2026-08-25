import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { MapPin, Info, AlertTriangle, X, ImagePlus } from 'lucide-react';
import { categoryIcons } from '@/constants/categories';
import { estimatePrice } from '@/services/jobService';
import { uploadFile } from '@/services/storageService';

const generateJobTitle = (cat, desc) => {
  if (!cat) return 'Service Request';
  const words = desc.trim().split(/\s+/).slice(0, 5).join(' ');
  return words ? `${cat}: ${words}...` : cat;
};

export default function PostJobModal({ isOpen, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [noBudget, setNoBudget] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priceGuide = useMemo(() => {
    if (!category) return null;
    return estimatePrice({ category, urgency: 'standard' });
  }, [category]);

  const budgetWarning = useMemo(() => {
    if (!budget || !priceGuide || noBudget) return null;
    const amt = Number(budget);
    if (amt <= 0) return null;
    if (amt < priceGuide.low * 0.5) return { type: 'low', msg: `Well below typical range ($${priceGuide.low}–$${priceGuide.high}). Professionals may not respond.` };
    if (amt < priceGuide.low) return { type: 'low', msg: `Below typical range ($${priceGuide.low}–$${priceGuide.high}). Consider increasing.` };
    if (amt > priceGuide.high * 3) return { type: 'high', msg: `Significantly above typical range ($${priceGuide.low}–$${priceGuide.high}). You may be overpaying.` };
    if (amt > priceGuide.high * 1.5) return { type: 'high', msg: `Above typical range ($${priceGuide.low}–$${priceGuide.high}).` };
    return null;
  }, [budget, priceGuide, noBudget]);

  const resetForm = () => {
    setCategory('');
    setDescription('');
    setBudget('');
    setNoBudget(false);
    setPhotos([]);
    setError('');
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handlePhotoAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 3 - photos.length;
    if (remaining <= 0) return;
    const next = files.slice(0, remaining).map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos((prev) => [...prev, ...next]);
    e.target.value = '';
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let attachments = [];
      if (photos.length > 0) {
        setUploading(true);
        attachments = await Promise.all(
          photos.map((p) => uploadFile(p.file, `jobs/${category}`))
        );
        setUploading(false);
      }

      const title = generateJobTitle(category, description);
      await onSave({
        title,
        category: category || null,
        description: description.trim(),
        budget: noBudget ? null : Number(budget),
        attachments,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error in modal save:', err);
      setUploading(false);
      setError(err.message || 'Something went wrong posting your job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const previewTitle = generateJobTitle(category, description);
  const Icon = category ? categoryIcons[category] : null;

  return (
    <Modal open={isOpen} onClose={handleClose} title="Request a Service" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Category Grid */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(categoryIcons).map(([cat, CatIcon]) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1.5 rounded-xl px-3 py-3 text-[13px] font-medium transition-all border ${
                  category === cat
                    ? 'bg-orange-50 border-orange-300 text-orange-700 shadow-sm'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                }`}
              >
                <CatIcon size={20} className={category === cat ? 'text-orange-500' : 'text-gray-400'} />
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Price Guide */}
        {priceGuide && (
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-800">Suggested for {category}</p>
              <p className="text-sm text-blue-600">${priceGuide.low} – ${priceGuide.high} USD</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label htmlFor="post-job-desc" className="block text-sm font-semibold text-gray-700 mb-2">Describe the problem</label>
          <textarea
            id="post-job-desc"
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all resize-none"
            rows="3"
            placeholder="Include what, where, and when..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {/* Photo upload */}
          <div className="mt-2 flex items-center gap-2">
            <label className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
              photos.length >= 3
                ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
            }`}>
              <ImagePlus size={14} />
              {photos.length === 0 ? 'Add photos' : `${photos.length}/3`}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoAdd}
                disabled={photos.length >= 3}
              />
            </label>
            <span className="text-[11px] text-gray-400">Up to 3 photos</span>
          </div>
          {/* Photo previews */}
          {photos.length > 0 && (
            <div className="mt-2 flex gap-2">
              {photos.map((p, i) => (
                <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-200">
                  <img src={p.preview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="post-job-budget" className="text-sm font-semibold text-gray-700">Budget (USD)</label>
            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={noBudget}
                onChange={(e) => { setNoBudget(e.target.checked); if (e.target.checked) setBudget(''); }}
                className="h-3.5 w-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
              />
              Not sure — let pros send quotes
            </label>
          </div>
          {!noBudget && (
            <>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">$</span>
                <input
                  id="post-job-budget"
                  type="number"
                  min="1"
                  placeholder={priceGuide ? `e.g., ${Math.round((priceGuide.low + priceGuide.high) / 2)}` : 'e.g., 50'}
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all"
                />
              </div>
              {budgetWarning && (
                <div className={`mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-xs ${
                  budgetWarning.type === 'low' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                  <span>{budgetWarning.msg}</span>
                </div>
              )}
            </>
          )}
          {noBudget && (
            <p className="text-xs text-gray-400 italic">Professions will send you quotes based on your description.</p>
          )}
        </div>

        {/* Live title preview */}
        {category && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-[11px] text-gray-400 mb-1">Job title (auto-generated)</p>
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              {Icon && <Icon size={14} className="text-orange-500" />}
              {previewTitle}
            </p>
          </div>
        )}

        {/* Location Hint */}
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <MapPin size={14} className="text-[#F97316]" /> Location: Harare, ZW (Default)
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-center">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={loading || !category}>
            {loading ? (uploading ? 'Uploading photos...' : 'Posting...') : 'Post Job & Get Quotes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
