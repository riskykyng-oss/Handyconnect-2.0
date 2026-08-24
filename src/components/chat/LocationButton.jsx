import { MapPin } from 'lucide-react';

export default function LocationButton({ active, onClick, className = '' }) {
  return (
    <button
      type="button"
      aria-label={active ? 'Stop sharing location' : 'Share location'}
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${active ? 'text-hc-ink' : 'text-gray-400 hover:text-hc-ink-2'} ${className}`}
    >
      <MapPin size={20} />
    </button>
  );
}
