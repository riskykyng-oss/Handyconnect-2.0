import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Wrench, Sparkles, BadgeCheck, X, Plus, Users, QrCode, AlertTriangle,
  MapIcon,
} from 'lucide-react';
import { ProCardSkeleton } from '@/components/ui/Skeleton';
import { categoryIcons, JOB_CATEGORIES } from '@/constants/categories';
import HireProModal from '../components/HireProModal';
import PostJobModal from '../components/PostJobModal';
import { subscribeProfessionals, getUserProfile } from '@/services/userService';
import { createJob } from '@/services/jobService';
import { useAuth } from '@/features/auth/context/AuthContext';
import { haversineKm, formatDistance } from '@/utils/distance';
import { cardClass } from '../components/dashboardUtils';

const PAGE_SIZE = 12;

const filterOptions = ['All', 'Nearby', 'Verified', 'Top Rated', 'Available'];

const CATEGORY_SYNONYMS = {
  plumbing: ['plumber', 'plumbing', 'plumbers', 'pipe', 'pipes', 'fitter'],
  electrical: ['electrician', 'electrical', 'electricians', 'wiring', 'sparky'],
  painting: ['painter', 'painting', 'painters', 'decorator'],
  carpentry: ['carpenter', 'carpentry', 'carpenters', 'woodwork', 'joiner'],
  cleaning: ['cleaner', 'cleaning', 'cleaners', 'janitor', 'housekeeping'],
  roofing: ['roofer', 'roofing', 'roofers', 'roof'],
  mechanic: ['mechanic', 'mechanics', 'auto repair', 'motor'],
  gardening: ['gardener', 'gardening', 'gardeners', 'landscaping', 'lawn'],
  moving: ['mover', 'moving', 'movers', 'removals', 'haulage'],
  construction: ['builder', 'construction', 'builders', 'bricklayer', 'masonry'],
};

const matchesCategory = (role, categoryKey) => {
  const keywords = CATEGORY_SYNONYMS[categoryKey];
  if (!keywords) return false;
  const lower = role.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
};

const cardFromUser = (u, clientLoc) => {
  const km = haversineKm(clientLoc, u.location);
  return {
    id: u.id,
    name: u.displayName || u.email || 'Handyman',
    role: u.trade || (u.skills && u.skills.split(',')[0]) || 'Handyman',
    rating: typeof u.rating === 'number' ? u.rating : null,
    reviewCount: typeof u.reviewCount === 'number' ? u.reviewCount : 0,
    jobs: u.jobs || 0,
    image: u.photoURL || null,
    available: u.available !== false,
    verified: !!u.verified,
    priceRange: u.priceRange || null,
    distanceLabel: formatDistance(km) || (u.address || null),
    distanceKm: km,
  };
};

const initials = (name) => name.split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

const truncateLocation = (label) => {
  if (!label) return null;
  const parts = label.split(',').map((s) => s.trim());
  return parts.length > 2 ? `${parts[0]}, ${parts[1]}` : label;
};

function Avatar({ pro, size = 'h-12 w-12' }) {
  return (
    <div className={`${size} shrink-0 overflow-hidden rounded-full bg-orange-50 ring-2 ring-orange-100`}>
      {pro.image ? (
        <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-sm font-bold text-orange-500">
          {initials(pro.name)}
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
      className={`${cardClass} flex flex-col p-5 transition-shadow hover:shadow-md`}
    >
      <div className="flex items-start gap-3">
        <Avatar pro={pro} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-[15px] font-semibold text-hc-ink">
            {pro.name}
            {pro.verified && <BadgeCheck size={15} className="shrink-0 fill-orange-500 text-white" />}
          </p>
          <p className="mt-0.5 truncate text-sm text-hc-caption">{pro.role}</p>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-hc-ink-2">
        {pro.rating != null ? (
          <span className="flex items-center gap-1 font-bold text-hc-ink">
            <Star size={14} className="fill-amber-400 text-amber-400" /> {pro.rating.toFixed(1)}
            <span className="font-normal text-hc-caption">({pro.reviewCount})</span>
          </span>
        ) : (
          <span className="text-sm text-hc-caption">No reviews yet</span>
        )}
        {pro.distanceLabel && (
          <span className="flex items-center gap-1 truncate text-sm" title={pro.distanceLabel}>
            <MapPin size={13} className="shrink-0 text-gray-400" /> {truncateLocation(pro.distanceLabel)}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pro.available && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
          </span>
        )}
        {!pro.available && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
            Offline
          </span>
        )}
        {pro.jobs === 0 && pro.rating == null && (
          <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-600">New</span>
        )}
        {pro.jobs > 0 && (
          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-hc-caption">{pro.jobs} {pro.jobs === 1 ? 'job' : 'jobs'}</span>
        )}
      </div>

      <div className="mt-auto pt-4">
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onView}
            className="rounded-lg bg-hc-brand py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-hc-brand-strong"
          >
            View Profile
          </button>
          <button
            onClick={onHire}
            className="rounded-lg border border-black/[0.08] bg-white py-2.5 text-[13px] font-semibold text-hc-ink-2 transition-colors hover:border-hc-brand hover:text-hc-brand"
          >
            Request Quote
          </button>
        </div>
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
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-hc-ink">{service.name}</p>
        <p className="mt-0.5 text-xs text-hc-caption">
          {service.count} {service.count === 1 ? 'professional' : 'professionals'}
        </p>
      </div>
    </motion.button>
  );
}

function EmptyState({ label, onPostJob }) {
  return (
    <div className={`${cardClass} p-10 text-center`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        <Search size={20} />
      </div>
      <p className="mt-3 text-sm font-semibold text-hc-ink">No professionals found</p>
      <p className="mt-1 text-xs text-hc-caption">{label}</p>
      {onPostJob && (
        <button
          onClick={onPostJob}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-hc-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong"
        >
          <Plus size={14} /> Post a job instead
        </button>
      )}
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
  const [loadingPros, setLoadingPros] = useState(true);
  const [clientLoc, setClientLoc] = useState(null);
  const [showFAB, setShowFAB] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const unsub = subscribeProfessionals((users) => {
      setPros(users);
      setLoadingPros(false);
    });
    return unsub;
  }, []);

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
    if (q) {
      const catKey = selectedCategory?.toLowerCase();
      if (catKey && CATEGORY_SYNONYMS[catKey]) {
        list = list.filter((c) => matchesCategory(c.role, catKey));
      } else {
        list = list.filter((c) => `${c.name} ${c.role}`.toLowerCase().includes(q));
      }
    }

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
    if (selectedCategory) {
      list.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        const aKm = a.distanceKm ?? Infinity;
        const bKm = b.distanceKm ?? Infinity;
        if (aKm !== bKm) return aKm - bKm;
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return (b.rating ?? -1) - (a.rating ?? -1);
      });
    } else if (activeFilter === 'Nearby') {
      list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    } else if (activeFilter === 'Top Rated' || activeFilter === 'Recommended') {
      list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
    }
    return list;
  }, [cards, query, activeFilter, selectedCategory]);

  const services = useMemo(() => {
    const catCounts = new Map();
    for (const c of cards) {
      const role = c.role;
      if (!role || role === 'Handyman') continue;
      let matched = false;
      for (const [cat] of Object.entries(CATEGORY_SYNONYMS)) {
        if (matchesCategory(role, cat)) {
          const key = cat.charAt(0).toUpperCase() + cat.slice(1);
          const entry = catCounts.get(key) || { name: key, count: 0 };
          entry.count += 1;
          catCounts.set(key, entry);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const entry = catCounts.get(role) || { name: role, count: 0 };
        entry.count += 1;
        catCounts.set(role, entry);
      }
    }
    return [...catCounts.values()].sort((a, b) => b.count - a.count);
  }, [cards]);

  const visible = results.slice(0, visibleCount);
  const activeQuery = query.trim();

  const pickFilter = (f) => {
    setActiveFilter(f);
    setSelectedCategory(null);
    setVisibleCount(PAGE_SIZE);
  };

  const onQueryChange = (value) => {
    setQuery(value);
    setSelectedCategory(null);
    setVisibleCount(PAGE_SIZE);
  };

  const pickService = (name) => {
    setQuery(name);
    setSelectedCategory(name);
    setTab('professionals');
    setActiveFilter('All');
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <div className="space-y-6 rounded-2xl bg-hc-page p-4 lg:p-6 pb-24 lg:pb-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-hc-ink">Explore Professionals</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-hc-caption">
            <MapPin size={14} className="text-hc-ink-3" /> Harare, Zimbabwe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/client/map')}
            className="flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3.5 py-2 text-xs font-semibold text-hc-ink-2 transition-colors hover:bg-gray-100 hover:text-hc-ink"
          >
            <MapIcon size={13} /> Map View
          </button>
          <button
            onClick={() => pickFilter(activeFilter === 'Recommended' ? 'All' : 'Recommended')}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeFilter === 'Recommended'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'border border-black/[0.08] bg-white text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
            }`}
          >
            <Sparkles size={13} className={activeFilter === 'Recommended' ? 'text-white' : 'text-gray-400'} />
            Recommended
          </button>
        </div>
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

      {/* Category + Filter chips — single scrollable row */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
        {JOB_CATEGORIES.map((cat) => {
          const Icon = categoryIcons[cat] || Wrench;
          const active = selectedCategory?.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => active ? onQueryChange('') : pickService(cat)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                active
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'border border-black/[0.08] bg-white text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
              }`}
            >
              <Icon size={13} />
              {cat}
            </button>
          );
        })}
        <span className="w-px shrink-0 bg-black/[0.08]" />
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => pickFilter(f)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              activeFilter === f && !selectedCategory
                ? 'bg-gray-900 text-white shadow-sm'
                : 'border border-black/[0.08] bg-white text-hc-ink-2 hover:bg-gray-100 hover:text-hc-ink'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tab toggle */}
      <div className="flex w-48 items-center rounded-xl bg-gray-100 p-1">
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
              {selectedCategory ? `${selectedCategory} Professionals` : activeQuery ? `Results for "${activeQuery}"` : 'Professionals Near You'}
            </h2>
            <span className="text-xs font-semibold text-hc-caption">
              {results.length} {results.length === 1 ? 'professional' : 'professionals'}
            </span>
          </div>

          {loadingPros ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProCardSkeleton key={i} />)}
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              label="Try a different service, skill, or name."
              onPostJob={() => setIsModalOpen(true)}
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              {results.length > visibleCount ? (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                    className="rounded-xl border border-black/[0.08] bg-white px-6 py-2.5 text-sm font-semibold text-hc-ink-2 shadow-sm transition-colors hover:border-hc-brand hover:text-hc-brand"
                  >
                    Load more ({results.length - visibleCount} remaining)
                  </button>
                </div>
              ) : results.length > 0 && results.length <= 3 ? (
                <div className={`${cardClass} flex items-center gap-5 p-6`}>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                    <Sparkles size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold text-hc-ink">Not finding who you need?</p>
                    <p className="mt-0.5 text-sm text-hc-caption">Post a job and let verified professionals come to you.</p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="shrink-0 rounded-lg bg-hc-brand px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-hc-brand-strong"
                  >
                    Post a Job
                  </button>
                </div>
              ) : null}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                { label: 'Request Service', icon: Plus, action: () => setIsModalOpen(true), color: 'bg-hc-brand' },
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
