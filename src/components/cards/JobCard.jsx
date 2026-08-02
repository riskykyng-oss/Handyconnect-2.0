import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getUserProfile } from '@/services/userService';
import { completeJob } from '@/services/jobService';
import { DollarSign, Loader2, CheckCircle2, Wrench, PartyPopper } from 'lucide-react';

export default function JobCard({ job, onMessage, isClient }) {
  const [handyman, setHandyman] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(job.status === 'completed');
  const isAssigned = job.status === 'assigned';

  useEffect(() => {
    if (isAssigned && job.handymanId) {
      const fetchHandyman = async () => {
        const profile = await getUserProfile(job.handymanId);
        setHandyman(profile);
      };
      fetchHandyman();
    }
  }, [isAssigned, job.handymanId]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await completeJob(job.id, job.handymanId, job.budget);
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing job:', error);
    } finally {
      setCompleting(false);
    }
  };

  const statusStyles = isCompleted
    ? 'bg-gray-900 text-white' // Deep dark gray for completed
    : isAssigned
    ? 'bg-orange-100 text-orange-700' // Soft orange for assigned
    : 'bg-amber-100 text-amber-700'; // Amber for waiting

  return (
    <Card className="flex flex-col justify-between rounded-2xl hover:shadow-lg transition-shadow duration-300">
      <div>
        <div className="flex justify-between items-start mb-3 gap-3">
          <h3 className="font-display font-bold text-lg text-gray-900">{job.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${statusStyles}`}>
            {job.status}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{job.description}</p>
      </div>

      <div className="flex items-center justify-between mt-2 border-t border-gray-100 pt-4">
        <div className="flex flex-col gap-1">
          <span className="flex items-center font-display font-bold text-[#F97316]">
            <DollarSign size={17} /> {job.budget}
          </span>

          {isAssigned ? (
            handyman ? (
              <div className="text-sm">
                <p className="font-semibold flex items-center gap-1 text-gray-900">
                  <CheckCircle2 size={13} className="text-[#F97316]" /> {handyman.displayName || job.handymanName}
                </p>
                {handyman.skills && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Wrench size={11} /> {handyman.skills}
                  </p>
                )}
              </div>
            ) : (
              <span className="flex items-center text-sm text-gray-400 gap-1">
                <Loader2 size={13} className="animate-spin" /> Loading...
              </span>
            )
          ) : (
            <span className="flex items-center text-sm text-gray-400 gap-1">
              <Loader2 size={13} className="animate-spin" /> Waiting...
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {isClient && isAssigned && !isCompleted && (
            <Button
              variant="secondary"
              onClick={handleComplete}
              disabled={completing}
              className="rounded-full bg-[#F97316] hover:bg-orange-600 text-white border-0 shadow-sm shadow-orange-500/20"
            >
              {completing ? 'Processing...' : 'Mark complete'}
            </Button>
          )}
          {isClient && isCompleted && (
            <span className="flex items-center text-sm font-semibold text-gray-900 gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
              <PartyPopper size={14} className="text-[#F97316]" /> Funds released
            </span>
          )}
          {isAssigned && !isCompleted && onMessage && (
            <Button
              variant="outline"
              onClick={onMessage}
              className="rounded-full border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
            >
              Message
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}