import { useState, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { MapPin, Info, AlertTriangle } from 'lucide-react';
import { JOB_CATEGORIES } from '@/constants/categories';
import { estimatePrice } from '@/services/jobService';

export default function PostJobModal({ isOpen, onClose, onSave }) {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const priceGuide = useMemo(() => {
    if (!category) return null;
    return estimatePrice({ category, urgency: 'standard' });
  }, [category]);

  const budgetWarning = useMemo(() => {
    if (!budget || !priceGuide) return null;
    const amt = Number(budget);
    if (amt <= 0) return null;
    if (amt < priceGuide.low * 0.5) return { type: 'low', msg: `This is well below the typical range ($${priceGuide.low}–$${priceGuide.high}). Professionals may not respond.` };
    if (amt < priceGuide.low) return { type: 'low', msg: `Below the typical range ($${priceGuide.low}–$${priceGuide.high}). Consider increasing for better responses.` };
    if (amt > priceGuide.high * 3) return { type: 'high', msg: `This is significantly above the typical range ($${priceGuide.low}–$${priceGuide.high}). You may be overpaying.` };
    if (amt > priceGuide.high * 1.5) return { type: 'high', msg: `Above the typical range ($${priceGuide.low}–$${priceGuide.high}). Make sure this matches your expectations.` };
    return null;
  }, [budget, priceGuide]);

  const resetForm = () => {
    setCategory('');
    setDescription('');
    setBudget('');
    setError('');
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        title: category,
        category: category || null,
        description: description.trim(),
        budget: Number(budget),
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error('Error in modal save:', err);
      setError('Something went wrong posting your job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose} title="Request a Service" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        {/* Category */}
        <div>
          <label htmlFor="post-job-category" className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select
            id="post-job-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all appearance-none"
          >
            <option value="">Select a category</option>
            {JOB_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Price Guide */}
        {priceGuide && (
          <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
            <Info size={16} className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-blue-800">Typical price range</p>
              <p className="text-sm text-blue-600">
                ${priceGuide.low} – ${priceGuide.high} USD for {category.toLowerCase()} services
              </p>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="post-job-desc" className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            id="post-job-desc"
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all resize-none"
            rows="3"
            placeholder="Describe the problem in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="post-job-budget" className="block text-sm font-semibold text-gray-700 mb-2">Budget (USD)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base font-medium">$</span>
            <input
              id="post-job-budget"
              type="number"
              min="1"
              placeholder={priceGuide ? `e.g., ${Math.round((priceGuide.low + priceGuide.high) / 2)}` : 'e.g., 50'}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              required
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
        </div>

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
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Sending...' : 'Request Service'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
