import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function PostJobModal({ isOpen, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ title, description, budget: Number(budget) });
      setTitle('');
      setDescription('');
      setBudget('');
      onClose();
    } catch (error) {
      console.error("Error in modal save:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Post a New Job</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Job Title" 
            placeholder="e.g., Leaking kitchen sink" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
            <textarea 
              className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
              rows="3"
              placeholder="Describe the problem in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <Input 
            label="Budget ($)" 
            type="number" 
            placeholder="e.g., 50" 
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}