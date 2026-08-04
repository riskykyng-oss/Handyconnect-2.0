import { useState } from 'react';
import { TrendingUp } from 'lucide-react';
import useClientJobs from '@/hooks/useClientJobs';
import RailWidget from './RailWidget';

export default function RailWeeklySummary() {
  const { jobs } = useClientJobs();
  const [weekStart] = useState(() => Date.now() - 7 * 86400000);
  const week = jobs.filter((j) => {
    const t = j.createdAt?.toDate?.()?.getTime?.() ?? new Date(j.createdAt).getTime();
    return t >= weekStart;
  });
  const done = week.filter((j) => j.status === 'completed').length;
  const active = week.filter((j) => j.status === 'assigned').length;
  const spent = week
    .filter((j) => j.status === 'completed')
    .reduce((sum, j) => sum + (Number(j.budget) || 0), 0);

  const stats = [
    { label: 'Jobs Done', value: String(done) },
    { label: 'Active', value: String(active) },
    { label: 'Spent', value: `$${spent}` },
  ];

  return (
    <RailWidget icon={TrendingUp} title="This Week">
      <div className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg bg-hc-tile px-2 py-3 text-center">
            <p className="text-base font-semibold text-hc-ink">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-hc-caption">{s.label}</p>
          </div>
        ))}
      </div>
    </RailWidget>
  );
}
