import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Navigation, Zap, Wrench,
  Paintbrush, Sparkles, Hammer, Droplet, Shield, Clock,
  ChevronRight, MessageCircle, Heart, X, SlidersHorizontal,
  ArrowUpDown, TrendingUp, HelpCircle, Plus, QrCode,
  Users, AlertTriangle, Briefcase, Map,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import MapView from '@/components/ui/MapView';
import { JOB_CATEGORIES } from '@/constants/categories';
import { subscribeProfessionals } from '@/services/userService';

const filterChips = ['Nearby', 'Verified', 'Available Now', 'Highest Rated', 'Under $20/hr', 'Within 5km', 'Emergency', 'Open Today'];

const sortOptions = ['Nearest', 'Highest Rated', 'Cheapest', 'Fastest Response', 'Most Experienced'];

const categoryColors = {
  Plumbing: { icon: Wrench, bg: 'bg-blue-50', text: 'text-blue-600' },
  Electrical: { icon: Zap, bg: 'bg-amber-50', text: 'text-amber-600' },
  Painting: { icon: Paintbrush, bg: 'bg-pink-50', text: 'text-pink-600' },
  Cleaning: { icon: Sparkles, bg: 'bg-violet-50', text: 'text-violet-600' },
  Carpentry: { icon: Hammer, bg: 'bg-orange-50', text: 'text-orange-600' },
  Roofing: { icon: Wrench, bg: 'bg-rose-50', text: 'text-rose-600' },
  Mechanic: { icon: Wrench, bg: 'bg-gray-50', text: 'text-gray-600' },
  Gardening: { icon: Droplet, bg: 'bg-emerald-50', text: 'text-emerald-600' },
  Moving: { icon: Navigation, bg: 'bg-indigo-50', text: 'text-indigo-600' },
  Construction: { icon: Hammer, bg: 'bg-amber-50', text: 'text-amber-600' },
};

const cardFromUser = (u) => ({
  id: u.id,
  name: u.displayName || u.email || 'Handyman',
  role: u.trade || (u.skills && u.skills.split(',')[0]) || 'Handyman',
  rating: typeof u.rating === 'number' ? u.rating : 5,
  jobs: u.jobs || 0,
  completion: u.completionRate ? `${u.completionRate}%` : '—',
  response: u.avgResponseTime ? `${u.avgResponseTime}` : '—',
  price: u.hourlyRate ? `$${u.hourlyRate}/hr` : '—',
  image: u.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  available: u.available !== false,
  verified: !!u.verified,
  distance: '—',
  eta: '—',
});

function ProCard({ pro, index }) {
  const navigate = useNavigate();
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group flex shrink-0 w-[190px] flex-col rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,0,0,.1)] hover:border-orange-300 overflow-hidden text-left cursor-pointer"
      onClick={() => navigate('/client/messages')}
    >
      <div className="relative h-32 overflow-hidden">
        <img src={pro.image} alt={pro.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {pro.available && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold text-white shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-white" /> Available
          </div>
        )}
        <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <Heart size={12} className="text-gray-600" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5 p-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-gray-900 truncate">{pro.name}</span>
          <Shield size={11} className="shrink-0 text-orange-500" />
        </div>
        <p className="text-xs text-gray-500">{pro.role}</p>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-0.5 font-bold text-gray-900">
            <Star size={10} className="fill-amber-400 text-amber-400" /> {pro.rating}
          </span>
          <span className="text-gray-400">({pro.jobs} jobs)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-500">
          <span className="flex items-center gap-0.5"><Clock size={9} /> {pro.response}</span>
          <span>{pro.completion}</span>
        </div>
        <div className="flex items-center justify-between mt-1 pt-2 border-t border-gray-100">
          <span className="text-sm font-extrabold text-orange-600">{pro.price}</span>
          <div className="flex items-center gap-1 text-[10px] text-gray-400">
            <MapPin size={9} /> {pro.distance}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function ProCardCompact({ pro, index, onMessage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:border-orange-200 group"
    >
      <div className="relative shrink-0">
        <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-orange-200 transition-transform duration-200 group-hover:scale-105">
          <img src={pro.image} alt={pro.name} className="h-full w-full object-cover" />
        </div>
        <span className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${pro.available ? 'bg-emerald-500' : 'bg-gray-300'}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-900 truncate">{pro.name}</p>
          <Shield size={11} className="shrink-0 text-orange-500" />
          <span className={`text-[10px] font-semibold ${pro.available ? 'text-emerald-600' : 'text-gray-400'}`}>
            {pro.available ? 'Available' : 'Busy'}
          </span>
        </div>
        <p className="text-xs text-gray-500">{pro.role}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500">
          <span className="flex items-center gap-0.5 font-bold text-gray-900">
            <Star size={10} className="fill-amber-400 text-amber-400" /> {pro.rating}
          </span>
          <span>{pro.jobs} jobs</span>
          <span className="text-emerald-600 font-semibold">{pro.completion}</span>
          <span className="flex items-center gap-0.5"><MapPin size={9} /> {pro.distance}</span>
          <span className="flex items-center gap-0.5"><Clock size={9} /> {pro.eta}</span>
        </div>
      </div>
      <div className="flex shrink-0 flex-col gap-1.5">
        <Button size="sm" fullWidth={false} className="rounded-xl text-xs !min-h-8 !px-3">Hire Now</Button>
        <button onClick={onMessage} className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 px-3 py-1.5 text-[10px] font-semibold text-gray-600 transition-colors hover:bg-gray-50">
          <MessageCircle size={11} /> Message
        </button>
      </div>
    </motion.div>
  );
}

function SectionHeader({ title, action, actionLabel }) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-display text-lg font-extrabold text-gray-900">{title}</h2>
      {action && (
        <button onClick={action} className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors">
          {actionLabel || 'See all'} <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState(searchParams.get('view') === 'map' ? 'map' : 'list');
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Nearest');
  const [showFAB, setShowFAB] = useState(false);

  const [pros, setPros] = useState([]);
  useEffect(() => subscribeProfessionals(setPros), []);

  const cards = useMemo(() => pros.map(cardFromUser), [pros]);
  const topRated = useMemo(() => [...cards].sort((a, b) => b.rating - a.rating).slice(0, 6), [cards]);
  const availableToday = useMemo(() => cards.filter((c) => c.available).slice(0, 6), [cards]);
  const newPros = useMemo(() => cards.slice(0, 4), [cards]);
  const allPros = cards;
  const trendingServices = useMemo(
    () => [...new Set(pros.map((u) => (u.trade || '').split(',')[0].trim()).filter(Boolean))].slice(0, 8),
    [pros]
  );

  const liveMarkers = useMemo(
    () =>
      pros
        .filter((u) => u.location?.lat != null && u.location?.lng != null)
        .map((u) => ({
          position: { lat: u.location.lat, lng: u.location.lng },
          label: (u.displayName || '?')[0].toUpperCase(),
          title: `${u.displayName || 'Handyman'} — ${u.trade || u.skills || 'Professional'}`,
        })),
    [pros]
  );
  const markers = liveMarkers;

  const toggleFilter = (f) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f); else next.add(f);
      return next;
    });
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-gray-900">Explore Professionals</h1>
          <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
            <MapPin size={14} className="text-orange-500" /> Harare, Zimbabwe
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <motion.div
          animate={{ borderRadius: searchOpen ? '20px' : '9999px' }}
          className="overflow-hidden border border-gray-200 bg-white shadow-sm transition-shadow focus-within:shadow-md focus-within:border-orange-400"
        >
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex h-14 w-full items-center gap-3 px-5"
          >
            <Search size={18} className="text-gray-400" />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900">Search Professionals</p>
              {!searchOpen && <p className="text-xs text-gray-400">Service, skill, or professional name...</p>}
            </div>
            {searchOpen ? <X size={16} className="text-gray-400" /> : <SlidersHorizontal size={16} className="text-gray-400" />}
          </button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-gray-100"
              >
                <div className="p-4 space-y-3">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="What service do you need?"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/10"
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-2">
                    {['Plumber', 'Electrician', 'Cleaner', 'Painter', 'Gardener'].map((s) => (
                      <button
                        key={s}
                        onClick={() => { setQuery(s); setSearchOpen(false); }}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><MapPin size={12} /> Current location</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Available today</span>
                    <span className="flex items-center gap-1"><Star size={12} /> Highest rated</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mt-2">
        {filterChips.map((f) => (
          <button
            key={f}
            onClick={() => toggleFilter(f)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              activeFilters.has(f)
                ? 'bg-orange-500 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {activeFilters.has(f) && <X size={12} />}
            {f}
          </button>
        ))}
        <div className="relative shrink-0">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-gray-300"
          >
            <ArrowUpDown size={12} /> {sortBy}
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-gray-200 bg-white py-2 shadow-lg z-20">
              {sortOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setSortBy(opt); setSortOpen(false); }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-left transition-colors hover:bg-gray-50 ${sortBy === opt ? 'text-orange-600 font-semibold' : 'text-gray-700'}`}
                >
                  {opt === 'Nearest' && <MapPin size={13} />}
                  {opt === 'Highest Rated' && <Star size={13} />}
                  {opt === 'Cheapest' && <ArrowUpDown size={13} />}
                  {opt === 'Fastest Response' && <Clock size={13} />}
                  {opt === 'Most Experienced' && <Briefcase size={13} />}
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommendation Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-5 shadow-lg shadow-orange-500/20">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <TrendingUp size={20} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-base font-bold text-white">Recommended For You</h3>
            <p className="mt-1 text-xs text-orange-100">Based on your previous jobs, location, and budget</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['Gardening', 'Home Cleaning', 'Plumbing'].map((s) => (
                <button key={s} onClick={() => { setQuery(s); setSearchOpen(true); }} className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold text-white hover:bg-white/30 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Rated */}
      <div>
        <SectionHeader title="Top Rated This Week" actionLabel="View all" />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {topRated.map((pro, i) => <ProCard key={pro.id || i} pro={pro} index={i} />)}
        </div>
      </div>

      {/* Available Today */}
      <div>
        <SectionHeader title="Available Today" actionLabel="View all" />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {availableToday.map((pro, i) => <ProCard key={pro.id || i} pro={pro} index={i} />)}
        </div>
      </div>

      {/* New This Week */}
      <div>
        <SectionHeader title="New This Week" actionLabel="View all" />
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {newPros.map((pro, i) => <ProCard key={pro.id || i} pro={pro} index={i} />)}
        </div>
      </div>

      {/* Categories */}
      <div>
        <SectionHeader title="Categories" actionLabel="Browse all" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {JOB_CATEGORIES.slice(0, 8).map((cat) => {
            const meta = categoryColors[cat] || { icon: Wrench, bg: 'bg-gray-50', text: 'text-gray-600' };
            const Icon = meta.icon;
            return (
              <motion.button
                key={cat}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/client/explore?category=${cat.toLowerCase()}`)}
                className={`flex items-center gap-3 rounded-2xl border border-gray-200 ${meta.bg} p-4 shadow-sm transition-all duration-200 hover:shadow-md`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${meta.bg} ${meta.text}`}>
                  <Icon size={18} />
                </div>
                <span className="text-sm font-bold text-gray-900">{cat}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Map Section */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-gray-900">Nearby Map</h2>
          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'map' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Map size={14} className="inline mr-1" />Map
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {viewMode === 'map' ? (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Card className="overflow-hidden !p-0">
                <div className="h-[320px] w-full">
                  <MapView markers={markers} center={markers[0]?.position} zoom={13} />
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Available</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-500" /> Busy</span>
                    <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Offline</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{markers.length} pros near you</span>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <button
                onClick={() => setViewMode('map')}
                className="flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-orange-200 mb-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <MapPin size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">Tap to view map</p>
                    <p className="text-xs text-gray-500">{markers.length} professionals near you</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nearby Professionals */}
      <div>
        <SectionHeader title="Nearby Professionals" actionLabel="View all" />
        <div className="space-y-3">
          {allPros.map((pro, i) => <ProCardCompact key={pro.id || i} pro={pro} index={i} onMessage={() => navigate('/client/messages')} />)}
        </div>
      </div>

      {/* Trending Services */}
      <div>
        <SectionHeader title="Trending Services" />
        <div className="flex flex-wrap gap-2">
          {trendingServices.map((s) => (
            <motion.button
              key={s}
              whileHover={{ y: -1 }}
              onClick={() => { setQuery(s); setSearchOpen(true); }}
              className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 shadow-sm transition-all hover:shadow-md hover:border-orange-300"
            >
              <TrendingUp size={14} className="text-orange-500" />
              <span className="text-sm font-semibold text-gray-900">{s}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Help Banner */}
      <button
        onClick={() => navigate('/client/help')}
        className="flex w-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
          <HelpCircle size={18} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-gray-900">Need help finding a professional?</p>
          <p className="text-xs text-gray-500">Our support team is ready to assist you.</p>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </button>

      {/* FAB Speed Dial */}
      <div className="fixed bottom-24 right-6 z-40 lg:bottom-8">
        <AnimatePresence>
          {showFAB && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-3 flex flex-col items-end gap-2"
            >
              {[
                { label: 'Post Job', icon: Plus, action: () => navigate('/client/home?post=1'), color: 'bg-orange-500' },
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
          className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-2xl shadow-orange-500/40 transition-colors hover:bg-orange-600"
        >
          <motion.div animate={{ rotate: showFAB ? 45 : 0 }} transition={{ duration: 0.2 }}>
            <Plus size={28} />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
