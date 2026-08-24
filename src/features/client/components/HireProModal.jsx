import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, DollarSign, CheckCircle2, BadgeCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { createJob } from '@/services/jobService';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LocationPicker from '@/components/ui/LocationPicker';

export default function HireProModal({ pro, isOpen, onClose, mode = 'hire' }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isQuote = mode === 'quote';
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jobLocation, setJobLocation] = useState(null);
  const [preferredDate, setPreferredDate] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [budget, setBudget] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setDone(false);
    setJobLocation(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createJob(
        {
          title: title.trim(),
          description: description.trim(),
          budget: Number(budget) || 0,
          location: jobLocation?.address?.trim() || 'Current Location',
          lat: jobLocation?.lat ?? null,
          lng: jobLocation?.lng ?? null,
          preferredDate: preferredDate || null,
          urgent,
          clientName: currentUser?.displayName || 'Client',
        },
        currentUser.uid,
        pro?.id
      );
      setDone(true);
    } catch (err) {
      console.error('Error sending hire request:', err);
      setError('Something went wrong sending your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && pro && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:p-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-950/50"
            onClick={handleClose}
            aria-label="Close"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-gray-200 bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-gray-300" />
            </div>

            {done ? (
              <div className="px-6 pb-8 pt-4 text-center">
                <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
                <h3 className="text-xl font-semibold tracking-tight text-hc-ink">
                  Request sent to {pro.name.split(' ')[0]}!
                </h3>
                <p className="mt-2 text-sm text-hc-ink-2">
                  You&apos;ll be notified when they respond. Track it anytime under My Jobs.
                </p>
                <div className="mt-6 flex gap-3">
                  <Button variant="ghost" className="flex-1" onClick={handleClose}>
                    Done
                  </Button>
                  <Button className="flex-1" onClick={() => { handleClose(); navigate('/client/jobs'); }}>
                    View My Jobs
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-black/[0.06] bg-gray-100">
                    {pro.avatar ? (
                      <img src={pro.avatar} alt={pro.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-hc-ink-2">
                        {pro.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-base font-semibold tracking-tight text-hc-ink">
                      {isQuote ? `Request Quote from ${pro.name.split(' ')[0]}` : `Hire ${pro.name.split(' ')[0]}`}
                      {pro.verified && <BadgeCheck size={15} className="fill-orange-500 text-white" />}
                    </p>
                    <p className="text-xs text-hc-ink-3">{pro.trade}</p>
                  </div>
                </div>

                {isQuote && (
                  <div className="mb-4 rounded-xl bg-gray-50 border border-black/[0.06] px-4 py-3 text-xs font-semibold text-hc-ink-2">
                    No commitment — you&apos;ll review their quote before approving.
                  </div>
                )}

                <div className="space-y-4">
                  <Input
                    label="Job title"
                    placeholder={isQuote ? "e.g., Fix leaking bathroom tap" : "e.g., Fix leaking bathroom tap"}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />

                  <div>
                    <label htmlFor="hire-desc" className="mb-2 block text-sm font-semibold text-gray-700">Describe the work</label>
                    <textarea
                      id="hire-desc"
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What needs to be done? Include details..."
                      className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-base text-gray-900 outline-none transition-all focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10 placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Location</label>
                    <LocationPicker initialLocation={jobLocation} onLocationChange={setJobLocation} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="hire-date" className="mb-2 block text-sm font-semibold text-gray-700">Preferred date</label>
                      <input
                        id="hire-date"
                        type="date"
                        value={preferredDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10"
                      />
                    </div>
                    <div>
                      <label htmlFor="hire-budget" className="mb-2 block text-sm font-semibold text-gray-700">Estimated budget</label>
                      <div className="relative">
                        <DollarSign size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          id="hire-budget"
                          type="number"
                          min="0"
                          placeholder="e.g., 50"
                          value={budget}
                          onChange={(e) => setBudget(e.target.value)}
                          className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-9 pr-4 text-base text-gray-900 outline-none transition-all focus:border-hc-brand focus:ring-2 focus:ring-hc-brand/10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Urgent?</label>
                    <div className="flex gap-2">
                      {[true, false].map((val) => (
                        <button
                          key={String(val)}
                          type="button"
                          onClick={() => setUrgent(val)}
                          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                            urgent === val
                              ? 'bg-gray-900 text-white shadow-sm'
                              : 'border border-black/[0.08] bg-white text-hc-ink-2 hover:bg-gray-50'
                          }`}
                        >
                          <Zap size={14} /> {val ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && (
                    <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={handleClose} disabled={loading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? 'Sending...' : isQuote ? 'Request Quote' : 'Send Hire Request'}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
