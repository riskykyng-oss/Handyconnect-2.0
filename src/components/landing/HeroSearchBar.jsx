import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';

const LOCATIONS = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Victoria Falls', 'Masvingo'];

export default function HeroSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Harare');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location) params.set('location', location);
    navigate(`/client/explore${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Find professionals"
      className="flex w-full max-w-[600px] items-center gap-0 rounded-2xl border border-[#E5E7EB] bg-white p-1.5 shadow-[0_4px_20px_rgba(17,24,39,0.06)]"
    >
      {/* Service input */}
      <label className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-3">
        <Search size={18} className="shrink-0 text-[#6B7280]" />
        <input
          type="search"
          aria-label="What service do you need?"
          placeholder="What service do you need?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full min-w-0 bg-transparent text-[15px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
        />
      </label>

      {/* Divider */}
      <div className="hidden w-px self-stretch bg-[#E5E7EB] sm:block" />

      {/* Location */}
      <label className="hidden items-center gap-2 px-4 py-3 sm:flex">
        <MapPin size={16} className="shrink-0 text-[#6B7280]" />
        <select
          aria-label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="bg-transparent text-[15px] font-medium text-[#111827] outline-none"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </label>

      {/* Submit */}
      <button
        type="submit"
        className="flex shrink-0 items-center gap-2 rounded-xl bg-[#F97316] px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#EA580C]"
      >
        Find
        <ArrowRight size={16} />
      </button>
    </form>
  );
}
