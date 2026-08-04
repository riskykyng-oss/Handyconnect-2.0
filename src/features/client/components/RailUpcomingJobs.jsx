import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import useClientJobs from '@/hooks/useClientJobs';
import RailWidget from './RailWidget';
import { timeAgo } from './dashboardUtils';

export default function RailUpcomingJobs() {
  const navigate = useNavigate();
  const { jobs } = useClientJobs();
  const upcoming = jobs.filter((j) => j.status === 'assigned').slice(0, 3);

  return (
    <RailWidget icon={Clock} title="Upcoming Jobs" actionLabel="View all" onAction={() => navigate('/client/jobs')}>
      {upcoming.length === 0 ? (
        <p className="rounded-lg bg-[#ECEDEF] px-3 py-6 text-center text-xs font-medium text-hc-caption">
          No upcoming jobs scheduled.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((job) => {
            const date = job.createdAt?.toDate ? job.createdAt.toDate() : job.createdAt;
            return (
              <li key={job.id}>
                <button
                  onClick={() => navigate(`/client/chat/${job.id}`)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg bg-[#ECEDEF] p-3 text-left transition-colors hover:bg-[#E4E5E8]"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-hc-ink">{job.title}</span>
                    <span className="block truncate text-xs text-hc-caption">
                      {job.handymanName || 'Professional'} &middot; {timeAgo(date)}
                    </span>
                  </span>
                  <span className="shrink-0 text-[15px] font-semibold text-hc-ink">${job.budget}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </RailWidget>
  );
}
