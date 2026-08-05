import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, ArrowRight } from 'lucide-react';

const LOCATIONS = ['Harare', 'Bulawayo', 'Mutare', 'Gweru', 'Victoria Falls', 'Masvingo'];

export default function SearchBar({ initialQuery = '' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState('Harare');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (location) params.set('location', location);
    navigate(`/client/explore${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full max-w-2xl flex-col overflow-hidden rounded-full border-[0.5px] border-hc-hairline bg-white shadow-lg shadow-hc-ink/5 sm:flex-row sm:items-stretch"
    >
      <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 sm:px-5 sm:py-3.5">
        <Search size={19} className="shrink-0 text-hc-brand" />
        <input
          type="search"
          aria-label="Service needed"
          placeholder="Find a pro, service, or community..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full min-w-0 bg-transparent text-base text-hc-ink outline-none placeholder:text-hc-ink-3"
        />
      </label>

      <div className="hidden w-px bg-hc-hairline sm:block" />

      <label className="flex items-center gap-2 px-4 py-3 sm:px-5 sm:py-3.5">
        <MapPin size={17} className="shrink-0 text-hc-brand" />
        <select
          aria-label="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-transparent text-base font-medium text-hc-ink outline-none"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </label>

      <div className="p-2 sm:p-1.5">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-full bg-hc-brand px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-hc-brand-strong hover:shadow-md hover:shadow-hc-brand/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-hc-brand/40 focus-visible:ring-offset-2 active:translate-y-0 active:scale-[0.98] sm:h-full"
        >
          Search <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
