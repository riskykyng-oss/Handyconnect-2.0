import { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { MapPin } from 'lucide-react';

export default function PostJobModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setBudget('');
    setError('');
  };

  const handleClose = () => {
    if (loading) return; // don't let the modal close mid-submit
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onSave({
        title: title.trim(),
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
    <Modal open={isOpen} onClose={handleClose} title="Post a New Job" className="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5 pt-2">
        <Input
          label="Job Title"
          placeholder="e.g., Leaking kitchen sink"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all resize-none"
            rows="3"
            placeholder="Describe the problem in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
            <div>
              <input
                type="number"
                min="0"
                placeholder="e.g., 50"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all"
              />
            </div>
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
            {loading ? 'Posting...' : 'Post Job'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}