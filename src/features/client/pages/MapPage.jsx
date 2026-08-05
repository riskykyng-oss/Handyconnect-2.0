import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Star, MessageCircle, BadgeCheck, Search, X, Crosshair, Loader2 } from 'lucide-react';
import MapView from '@/components/ui/MapView';
import HireProModal from '../components/HireProModal';
import { subscribeProfessionals, getUserProfile } from '@/services/userService';
import { useAuth } from '@/features/auth/context/AuthContext';
import useGeolocation from '@/hooks/useGeolocation';
import { haversineKm, formatDistance } from '@/utils/distance';

const filterOptions = ['All', 'Available', 'Verified'];

const cardFromUser = (u, loc) => {
  const km = haversineKm(loc, u.location);
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
    lat: u.location?.lat,
    lng: u.location?.lng,
    distanceKm: km,
    distanceLabel: formatDistance(km) || null,
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

export default function MapPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [pros, setPros] = useState([]);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [center, setCenter] = useState(null);
  const [clientLoc, setClientLoc] = useState(null);
  const [hirePro, setHirePro] = useState(null);
  const { location: geoLoc, loading: locating, requestLocation } = useGeolocation();

  useEffect(() => subscribeProfessionals(setPros), []);

  useEffect(() => {
    if (!currentUser?.uid) return;
    getUserProfile(currentUser.uid)
      .then((p) => setClientLoc(p?.location || null))
      .catch(() => {});
  }, [currentUser]);

  const userLoc = geoLoc || clientLoc;

  const handleLocate = async () => {
    const coords = await requestLocation();
    if (coords) setCenter(coords);
  };

  const cards = useMemo(
    () =>
      pros
        .filter((u) => u.id !== currentUser?.uid && u.location?.lat != null && u.location?.lng != null)
        .map((u) => cardFromUser(u, userLoc)),
    [pros, userLoc, currentUser]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = cards;
    if (q) list = list.filter((c) => `${c.name} ${c.role}`.toLowerCase().includes(q));
    if (activeFilter === 'Available') list = list.filter((c) => c.available);
    if (activeFilter === 'Verified') list = list.filter((c) => c.verified);
    if (userLoc) list = [...list].sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    return list;
  }, [cards, query, activeFilter, userLoc]);

  const markers = useMemo(() => {
    const m = filtered.map((c) => ({
      id: c.id,
      position: { lat: c.lat, lng: c.lng },
      label: c.name.charAt(0).toUpperCase(),
      title: `${c.name} — ${c.role}`,
      color: c.available ? '#10b981' : '#9ca3af',
      pro: c,
    }));
    if (userLoc) {
      m.push({
        id: 'me',
        position: { lat: userLoc.lat, lng: userLoc.lng },
        label: 'You',
        title: 'Your location',
        color: '#2563eb',
      });
    }
    return m;
  }, [filtered, userLoc]);

  const selected = filtered.find((c) => c.id === selectedId) || null;

  const focusPro = (pro) => {
    setSelectedId(pro.id);
    setCenter({ lat: pro.lat, lng: pro.lng });
  };

  return (
    <div className="space-y-6 pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-hc-ink">Nearby Map</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-hc-caption">
            <MapPin size={14} className="text-hc-ink-3" /> Harare, Zimbabwe
          </p>
        </div>
        <span className="rounded-full bg-black/[0.06] px-3 py-1.5 text-xs font-semibold text-hc-ink-2">
          {filtered.length} {filtered.length === 1 ? 'pro' : 'pros'} near you
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-sm">
        <div className="relative">
          <div className="h-[58dvh] min-h-[320px] w-full sm:min-h-[400px]">
            <MapView
              markers={markers}
              center={center}
              zoom={13}
              fitBounds
              zoomPosition="bottomright"
              onMarkerClick={(m) => m.pro && setSelectedId(m.pro.id)}
            />
          </div>

          {/* Search + Locate */}
          <div className="pointer-events-none absolute inset-x-3 top-3 z-[500] flex items-center gap-2">
            <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-black/[0.07] bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
              <Search size={15} className="shrink-0 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search on the map..."
                className="min-w-0 flex-1 bg-transparent text-base text-hc-ink outline-none placeholder:text-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={handleLocate}
              disabled={locating}
              aria-label="Find my location"
              className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.07] bg-white/95 text-hc-ink-2 shadow-lg backdrop-blur transition-colors hover:bg-white disabled:opacity-60"
            >
              {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
            </button>
          </div>

          {/* Filter chips */}
          <div className="absolute inset-x-3 top-14 z-[500] flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold shadow-md transition-colors ${
                  activeFilter === f ? 'bg-gray-900 text-white shadow-sm' : 'border border-black/[0.08] bg-white/95 text-hc-ink-2 backdrop-blur hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Selected pro bottom card */}
          {selected && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] p-3">
              <div className="pointer-events-auto max-h-[48dvh] overflow-y-auto rounded-xl border border-black/[0.07] bg-white p-3.5 shadow-2xl">
                <div className="flex items-center gap-3">
                  <Avatar pro={selected} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-hc-ink">
                      {selected.name}
                      {selected.verified && <BadgeCheck size={14} className="shrink-0 fill-hc-accent text-white" />}
                    </p>
                    <p className="truncate text-xs text-hc-caption">{selected.role}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-hc-ink-2">
                      {selected.rating != null && (
                        <span className="flex items-center gap-1 font-bold text-hc-ink">
                          <Star size={11} className="fill-amber-400 text-amber-400" /> {selected.rating.toFixed(1)}
                        </span>
                      )}
                      {selected.jobs > 0 && <span className="text-hc-caption">{selected.jobs} jobs</span>}
                      {selected.price != null && (
                        <span className="font-semibold text-hc-ink">${selected.price}/hr</span>
                      )}
                      {selected.distanceLabel && (
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} className="text-gray-400" /> {selected.distanceLabel}
                        </span>
                      )}
                      {selected.available && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    aria-label="Close"
                    className="shrink-0 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <X size={15} />
                  </button>
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => navigate('/pro/' + selected.id)}
                    className="rounded-lg border border-black/[0.08] py-2.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-hc-brand hover:text-hc-brand"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => navigate(`/client/chat/direct/${selected.id}`)}
                    className="flex items-center justify-center gap-1 rounded-lg border border-black/[0.08] py-2.5 text-xs font-semibold text-hc-ink-2 transition-colors hover:border-hc-brand hover:text-hc-brand"
                  >
                    <MessageCircle size={11} /> Message
                  </button>
                  <button
                    onClick={() => setHirePro({ id: selected.id, name: selected.name, avatar: selected.image, trade: selected.role, verified: selected.verified })}
                    className="rounded-lg bg-hc-brand py-2.5 text-xs font-semibold text-white transition-colors hover:bg-hc-brand-strong"
                  >
                    Hire
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between border-t border-black/[0.07] px-4 py-2.5">
          <div className="flex items-center gap-3 text-xs text-hc-caption">
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Available</span>
            <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-gray-300" /> Offline</span>
            {userLoc && <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> You</span>}
          </div>
          <span className="text-xs font-semibold text-hc-ink-2">Tap a pin to see who&apos;s there</span>
        </div>
      </div>

      {/* Nearby Professionals */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-hc-ink">Nearby Professionals</h2>
          <span className="text-xs font-semibold text-hc-caption">{filtered.length} shown</span>
        </div>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-hc-hairline bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <Search size={20} />
            </div>
            <p className="text-sm font-semibold text-hc-ink">No professionals match here</p>
            <p className="mt-1 text-xs text-hc-caption">Try clearing filters or searching a different trade.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((pro, i) => (
              <motion.button
                key={pro.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => focusPro(pro)}
                className={`flex items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm transition-all duration-200 hover:shadow-md ${
                  selected?.id === pro.id ? 'border-gray-900 bg-gray-50' : 'border-black/[0.07]'
                }`}
              >
                <Avatar pro={pro} size="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold text-hc-ink">
                    {pro.name}
                    {pro.verified && <BadgeCheck size={13} className="shrink-0 fill-hc-accent text-white" />}
                  </p>
                  <p className="truncate text-xs text-hc-caption">{pro.role}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-hc-ink-2">
                    {pro.rating != null && (
                      <span className="flex items-center gap-1 font-bold text-hc-ink">
                        <Star size={10} className="fill-amber-400 text-amber-400" /> {pro.rating.toFixed(1)}
                      </span>
                    )}
                    {pro.jobs > 0 && <span className="text-hc-caption">{pro.jobs} jobs</span>}
                    {pro.distanceLabel && (
                      <span className="flex items-center gap-0.5">
                        <MapPin size={9} className="text-gray-400" /> {pro.distanceLabel}
                      </span>
                    )}
                    {pro.available && (
                      <span className="flex items-center gap-1 font-semibold text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Available
                      </span>
                    )}
                  </div>
                </div>
                {pro.price != null && (
                  <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                    ${pro.price}/hr
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <HireProModal pro={hirePro} isOpen={!!hirePro} onClose={() => setHirePro(null)} />
    </div>
  );
}
