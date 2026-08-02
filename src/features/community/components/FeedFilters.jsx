import Tabs from '@/components/ui/Tabs';
import { X } from 'lucide-react';

export default function FeedFilters({ role, active, onChange, activeSkill, onClearSkill }) {
  const filters = role === 'handyman'
    ? [
        { id: 'all', label: 'All' },
        { id: 'projects', label: 'Completed Projects' },
        { id: 'tips', label: 'Tips' },
        { id: 'collaboration', label: 'Collaboration' },
        { id: 'following', label: 'Following' },
      ]
    : [
        { id: 'all', label: 'All' },
        { id: 'nearby', label: 'Nearby' },
        { id: 'questions', label: 'Questions' },
        { id: 'projects', label: 'Completed Projects' },
        { id: 'tips', label: 'Tips' },
        { id: 'following', label: 'Following' },
      ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tabs tabs={filters} activeTab={active} onChange={onChange} className="overflow-x-auto scrollbar-hide" />
      {activeSkill && (
        <button
          onClick={onClearSkill}
          className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-200"
        >
          #{activeSkill} <X size={12} />
        </button>
      )}
    </div>
  );
}
