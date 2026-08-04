import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1400&q=80';

const POPULAR = ['Electricians', 'Plumbers', 'Cleaning', 'Builders'];

export default function DashboardHero({ greeting, name, stats = {} }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/client/explore?q=${encodeURIComponent(q)}` : '/client/explore');
  };

  return (
    <section
      className="relative min-h-[260px] overflow-hidden rounded-xl lg:min-h-[300px]"
      aria-label="Find a professional"
    >
      <img
        src={HERO_IMAGE}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
      <div className="relative flex h-full max-w-[620px] flex-col justify-center gap-3 p-5 lg:gap-4 lg:p-8">
        <div>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white lg:text-4xl">
            {greeting}, {name}
          </h1>
          <p className="mt-1.5 text-sm text-white/85 lg:text-base">Need a trusted professional today?</p>
        </div>

        <form onSubmit={handleSubmit} role="search" aria-label="Search professionals, services, or jobs">
          <div className="flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 shadow-lg">
            <Search className="h-4 w-4 shrink-0 text-black/40" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search professionals, services, or jobs"
              className="h-8 w-full min-w-0 bg-transparent text-sm text-black outline-none placeholder:text-black/40"
            />
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-2 text-xs text-white/80">
          <span className="font-medium">Popular:</span>
          {POPULAR.map((label) => (
            <button
              key={label}
              onClick={() => navigate(`/client/explore?q=${encodeURIComponent(label)}`)}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/25"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-[13px] text-white/85">
          <span className="font-medium">{stats.pros != null ? `${stats.pros} verified nearby` : ''}</span>
          {stats.nearby != null && <span aria-hidden="true">·</span>}
          <span className="font-medium">{stats.nearby != null ? `${stats.nearby} jobs near you` : ''}</span>
          <button
            onClick={() => navigate('/client/explore')}
            className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-hc-brand px-4 py-2 text-[13px] font-semibold text-white shadow-md transition-colors hover:bg-hc-brand-strong"
            aria-label="Browse professionals"
          >
            Find a Pro <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}
