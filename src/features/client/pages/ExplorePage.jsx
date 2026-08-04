import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Wrench, Paintbrush, Sparkles, Hammer, Droplet,
  Navigation, Zap, BadgeCheck, X, Plus, Users, QrCode, AlertTriangle,
} from 'lucide-react';
import HireProModal from '../components/HireProModal';
import PostJobModal from '../components/PostJobModal';
import { subscribeProfessionals, getUserProfile } from '@/services/userService';
import { createJob } from '@/services/jobService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { haversineKm, formatDistance } from '@/utils/distance';
import { cardClass } from '../components/dashboardUtils';

const PAGE_SIZE = 12;

const categoryIcons = {
  Plumbing: Wrench,
  Electrical: Zap,
  Painting: Paintbrush,
  Cleaning: Sparkles,
  Carpentry: Hammer,
  Gardening: Droplet,
  Moving: Navigation,
  Construction: Hammer,
  Mechanic: Wrench,
};

const filterOptions = ['All', 'Nearby', 'Verified', 'Top Rated', 'Available', 'Lowest Price'];

const cardFromUser = (u, clientLoc) => {
  const km = haversineKm(clientLoc, u.location);
  return {
    id: u.id,
    name: u.displayName || u.email || 'Handyman',
    role: u.trade || (u.skills && u.skills.split(',')[0]) || 'Handyman',
    rating: typeof u.rating === 'number' ? u.rating : null,
    jobs: u.jobs || 0,
    price: typeof u.hourlyRate === 'number' ? u.hourlyRate : null,
    image: u.photoURL || null,
    available: u.available !== false,
    verified: !!u.verified,
    distanceLabel: formatDistance(km) || (u.address || null),
    distanceKm: km,
  };
};

function Avatar({ pro, size = 'h-12 w-12' }) {
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-100`}>
      {pro.image ? (
        <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-500">
          {pro.name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?'}
        </span>
      )}
    </div>
  );
}

function ProCard({ pro, index, onView, onHire }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      whileHover={{ y: -3 }}
      className={`${cardClass} flex flex-col p-4 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <Avatar pro={pro} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-hc-ink">
            {pro.name}
            {pro.verified && <BadgeCheck size={14} className="shrink-0 fill-hc-brand text-white" />}
          </p>
          <p className="mt-0.5 truncate text-xs text-hc-caption">{pro.role}</p>
        </div>
        {pro.price != null && (
          <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
            ${pro.price}/hr
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-hc-ink-2">
        {pro.rating != null && (
          <span className="flex items-center gap-1 font-bold text-hc-ink">
            <Star size={12} className="fill-amber-400 text-amber-400" /> {pro.rating.toFixed(1)}
          </span>
        )}
        {pro.jobs > 0 && (
          <span className="text-hc-caption">{pro.jobs} {pro.jobs === 1 ? 'job' : 'jobs'}</span>
        )}
        {pro.jobs === 0 && pro.rating == null && (
          <span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[10px] font-semibold text-hc-ink-2">New Professional</span>
        )}
        {pro.distanceLabel && (
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-gray-400" /> {pro.distanceLabel}
          </span>
        )}
      </div>

      {pro.available && (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
        </p>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-black/[0.07] pt-3">
        <button
          onClick={onView}
          className="rounded-lg border border-black/[0.08] bg-white py-2.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-hc-brand hover:text-hc-brand"
        >
          View Profile
        </button>
        <button
          onClick={onHire}
          className="rounded-lg bg-hc-brand py-2.5 text-xs font-semibold text-white transition-colors hover:bg-hc-brand-strong"
        >
          Hire
        </button>
      </div>
    </motion.div>
  );
}

function ServiceCard({ service, onClick }) {
  const Icon = categoryIcons[service.name] || Wrench;
  return (
    <motion.button
      whileHover={{ y: -3 }}
      onClick={onClick}
      className={`${cardClass} flex items-center gap-3 p-4 text-left transition-shadow hover:shadow-md`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-hc-ink">{service.name}</p>
        <p className="mt-0.5 text-xs text-hc-caption">
          {service.count} {service.count === 1 ? 'professional' : 'professionals'}
          {service.minPrice != null && <> · from ${service.minPrice}/hr</>}
        </p>
      </div>
    </motion.button>
  );
}

function EmptyState({ label }) {
  return (
    <div className={`${cardClass} p-10 text-center`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Search size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-hc-ink">No professionals found</p>
      <p className="mt-1 text-xs text-hc-caption">{label}</p>
    </div>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get('q') || '');
  const [tab, setTab] = useState('professionals');
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hirePro, setHirePro] = useState(null);
  const [pros, setPros] = useState([]);
  const [clientLoc, setClientLoc] = useState(null);
  const [showFAB, setShowFAB] = useState(false);

  useEffect(() => subscribeProfessionals(setPros), []);

  useEffect(() => {
    if (!currentUser?.uid) return;
    getUserProfile(currentUser.uid)
      .then((p) => setClientLoc(p?.location || null))
      .catch(() => {});
  }, [currentUser]);

  const handleSaveJob = async (jobData) => {
    await createJob(jobData, currentUser.uid);
  };

  const cards = useMemo(() => pros.filter((u) => u.id !== currentUser?.uid).map((u) => cardFromUser(u, clientLoc)), [pros, clientLoc, currentUser]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = cards;
    if (q) list = list.filter((c) => `${c.name} ${c.role}`.toLowerCase().includes(q));

    switch (activeFilter) {
      case 'Verified':
        list = list.filter((c) => c.verified);
        break;
      case 'Available':
        list = list.filter((c) => c.available);
        break;
      case 'Recommended':
        list = list.filter((c) => c.verified && c.available);
        break;
      default:
        break;
    }

    list = [...list];
    if (activeFilter === 'Nearby') {
      list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else if (activeFilter === 'Top Rated' || activeFilter === 'Recommended') {
      list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    } else if (activeFilter === 'Lowest Price') {
      list.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    }
    return list;
  }, [cards, query, activeFilter]);

  const services = useMemo(() => {
    const map = new Map();
    for (const c of cards) {
      const name = c.role;
      if (!name || name === 'Handyman') continue;
      const entry = map.get(name) || { name, count: 0, minPrice: null };
      entry.count += 1;
      if (c.price != null) entry.minPrice = entry.minPrice == null ? c.price : Math.min(entry.minPrice, c.price);
      map.set(name, entry);
    }
    return [...map.values()].sort((a, b) => b.count - a.count);
  }, [cards]);

  const visible = results.slice(0, visibleCount);
  const activeQuery = query.trim();

  const pickFilter = (f) => {
    setActiveFilter(f);
    setVisibleCount(PAGE_SIZE);
  };

  const onQueryChange = (value) => {
    setQuery(value);
    setVisibleCount(PAGE_SIZE);
  };

  const pickService = (name) => {
    setQuery(name);
    setTab('professionals');
    setActiveFilter('All');
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-8 pb-24 lg:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-hc-ink">Explore Professionals</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-hc-caption">
            <MapPin size={14} className="text-hc-ink-3" /> Harare, Zimbabwe
          </p>
        </div>
        <button
          onClick={() => pickFilter(activeFilter === 'Recommended' ? 'All' : 'Recommended')}
          className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
            activeFilter === 'Recommended'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'border border-black/[0.08] bg-white text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
          }`}
        >
          <Sparkles size={13} className={activeFilter === 'Recommended' ? 'text-white' : 'text-gray-400'} />
          Recommended for you
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-black/[0.07] bg-white px-4 py-3 shadow-sm focus-within:border-hc-brand focus-within:ring-2 focus-within:ring-hc-brand/10">
        <Search size={16} className="shrink-0 text-gray-400" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search service, skill, or professional name..."
          className="min-w-0 flex-1 bg-transparent text-base text-hc-ink outline-none placeholder:text-gray-400"
        />
        {activeQuery && (
          <button onClick={() => onQueryChange('')} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
            <X size={15} />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => pickFilter(f)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              activeFilter === f
                ? 'bg-gray-900 text-white shadow-sm'
                : 'border border-black/[0.08] bg-white text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
            }`}
          >
            {f === 'All' && activeFilter !== 'All' && <X size={12} />}
            {f}
          </button>
        ))}
      </div>

      <div className="flex w-52 items-center rounded-xl bg-gray-100 p-1">
        {['professionals', 'services'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-colors ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'professionals' ? (
        <>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-hc-ink">
              {activeQuery ? `Results for "${activeQuery}"` : 'Professionals Near You'}
            </h2>
            <span className="text-xs font-semibold text-hc-caption">
              {results.length} {results.length === 1 ? 'professional' : 'professionals'}
            </span>
          </div>

          {results.length === 0 ? (
            <EmptyState label="Try a different service, skill, or name." />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1300px]:grid-cols-3 min-[1600px]:grid-cols-4">
                {visible.map((pro, i) => (
                  <ProCard
                    key={pro.id || i}
                    pro={pro}
                    index={i}
                    onView={() => navigate('/pro/' + pro.id)}
                    onHire={() => setHirePro({ id: pro.id, name: pro.name, avatar: pro.image, trade: pro.role, verified: pro.verified })}
                  />
                ))}
              </div>
              {results.length > visibleCount && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    className="rounded-xl border border-black/[0.08] bg-white px-6 py-2.5 text-sm font-semibold text-hc-ink-2 shadow-sm transition-colors hover:border-hc-brand hover:text-hc-brand"
                  >
                    Load more ({results.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <>
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-hc-ink">Services</h2>
            <span className="text-xs font-semibold text-hc-caption">{services.length} services</span>
          </div>
          {services.length === 0 ? (
            <EmptyState label="Services will appear here as professionals join." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {services.map((s) => (
                <ServiceCard key={s.name} service={s} onClick={() => pickService(s.name)} />
              ))}
            </div>
          )}
        </>
      )}

      <div className="fixed bottom-28 right-6 z-40 lg:bottom-8">
        <AnimatePresence>
          {showFAB && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-3 flex flex-col items-end gap-2"
            >
              {[
                { label: 'Post Job', icon: Plus, action: () => setIsModalOpen(true), color: 'bg-hc-brand' },
                { label: 'Ask Community', icon: Users, action: () => navigate('/community') },
                { label: 'Scan QR', icon: QrCode, action: () => navigate('/client/wallet') },
                { label: 'Report Issue', icon: AlertTriangle, action: () => navigate('/client/help') },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => { item.action(); setShowFAB(false); }}
                  className={`flex items-center gap-2 rounded-full ${item.color || 'bg-gray-800'} px-4 py-2.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105`}
                >
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowFAB(!showFAB)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-hc-brand text-white shadow-2xl shadow-hc-brand/40 transition-colors hover:bg-hc-brand-strong"
        >
          <motion.div animate={{ rotate: showFAB ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus size={28} />
          </motion.div>
        </motion.button>
      </div>

      <PostJobModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveJob} />
      <HireProModal pro={hirePro} isOpen={!!hirePro} onClose={() => setHirePro(null)} />
    </div>
  );
}
