import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mic, Clock, TrendingUp, SlidersHorizontal } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef(null);

  const allServices = ['Plumbing', 'Electrical Wiring', 'House Cleaning', 'Carpentry', 'Painting', 'AC Repair', 'Roofing'];
  const recentSearches = ['Leaking sink', 'Electrician near me', 'Bathroom renovation'];

  const suggestions = query.length > 0
    ? allServices.filter(service => service.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`flex w-full items-center gap-2 rounded-full bg-white/95 px-5 shadow-[0_8px_30px_rgba(0,0,0,.10)] backdrop-blur-md transition-all duration-300 ${
          isFocused ? 'ring-2 ring-orange-500/30 shadow-[0_8px_30px_rgba(249,115,22,.15)]' : ''
        }`}
        style={{ height: '64px' }}
      >
        <Search size={20} className={`shrink-0 transition-colors ${isFocused ? 'text-orange-500' : 'text-gray-400'}`} />

        <input
          type="text"
          placeholder="Search professionals, services, or jobs..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="w-full bg-transparent text-[15px] font-medium text-gray-800 outline-none placeholder:text-gray-400"
        />

        <div className="flex items-center gap-1.5">
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white/80 hover:text-orange-500">
            <Mic size={18} />
          </button>
          <span className="mx-1 h-5 w-px bg-gray-200" />
          <button className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white/80 hover:text-orange-500">
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl"
          >
            {query.length > 0 && (
              <div className="p-2">
                <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Suggestions</p>
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => { setQuery(suggestion); setIsFocused(false); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <Search size={15} className="text-gray-400" />
                      {suggestion}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-gray-500">
                    No services found for &ldquo;{query}&rdquo;
                  </div>
                )}
              </div>
            )}

            {query.length === 0 && (
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Recent</p>
                  <button className="text-[11px] font-semibold text-orange-500 hover:underline">Clear</button>
                </div>
                {recentSearches.map((recent) => (
                  <button
                    key={recent}
                    onClick={() => { setQuery(recent); setIsFocused(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <Clock size={15} className="text-gray-400" />
                    {recent}
                  </button>
                ))}
                <div className="mt-1 border-t border-gray-100 pt-2">
                  <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">Trending</p>
                  <div className="flex flex-wrap gap-2 px-3 pb-2">
                    {['Plumbers', 'Electricians', 'Cleaning', 'Painting'].map((trend) => (
                      <button
                        key={trend}
                        onClick={() => { setQuery(trend); setIsFocused(false); }}
                        className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200"
                      >
                        <TrendingUp size={11} className="text-orange-500" /> {trend}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
