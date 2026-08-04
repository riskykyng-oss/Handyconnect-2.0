import { X } from 'lucide-react';

export default function FeedFilters({ role, active, onChange, activeSkill, onClearSkill }) {
  const filters = role === 'handyman'
    ? [
        { id: 'all', label: 'All' },
        { id: 'projects', label: 'Projects' },
        { id: 'beforeafter', label: 'Before & After' },
        { id: 'tips', label: 'Tips' },
        { id: 'collaboration', label: 'Collaboration' },
        { id: 'following', label: 'Following' },
      ]
    : [
        { id: 'all', label: 'All' },
        { id: 'projects', label: 'Projects' },
        { id: 'questions', label: 'Questions' },
        { id: 'tips', label: 'Tips' },
        { id: 'beforeafter', label: 'Before & After' },
        { id: 'nearby', label: 'Nearby' },
        { id: 'following', label: 'Following' },
      ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <button
          key={f.id}
          onClick={() => onChange(f.id)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            active === f.id ? 'bg-hc-brand text-white shadow-sm' : 'border border-hc-hairline bg-white text-hc-ink-2 hover:border-gray-300 hover:text-hc-ink dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          {f.label}
        </button>
      ))}
      {activeSkill && (
        <button
          onClick={onClearSkill}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          #{activeSkill} <X size={12} />
        </button>
      )}
    </div>
  );
}
