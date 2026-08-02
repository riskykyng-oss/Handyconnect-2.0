import { MapPin } from 'lucide-react';

export default function LocationButton({ active, onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl p-2 transition-colors hover:bg-gray-100 ${active ? 'text-blue-500' : 'text-gray-400 hover:text-orange-500'} ${className}`}
    >
      <MapPin size={20} />
    </button>
  );
}
