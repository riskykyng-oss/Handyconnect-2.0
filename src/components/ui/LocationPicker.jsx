import { useState, useEffect } from 'react';
import { Loader2, MapPin, Crosshair, Check, AlertCircle } from 'lucide-react';
import useGeolocation from '@/hooks/useGeolocation';
import MapView from './MapView';
import { reverseGeocode } from '@/services/maps/geocodeService';

export default function LocationPicker({ onLocationChange, initialLocation }) {
  const { location: geoLoc, loading: geoLoading, error: geoError, requestLocation } = useGeolocation();
  const [picked, setPicked] = useState(initialLocation?.lat ? initialLocation : null);
  const [address, setAddress] = useState(initialLocation?.address || '');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (!geoLoc || picked) return undefined;
    const raf = requestAnimationFrame(() => {
      setPicked(geoLoc);
      resolveAddress(geoLoc);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoLoc]);

  async function resolveAddress(coords) {
    setResolving(true);
    try {
      const result = await reverseGeocode(coords);
      setAddress(result.address);
      onLocationChange?.({ ...coords, address: result.address });
    } catch {
      // silently fail
    } finally {
      setResolving(false);
    }
  };

  const handleMapClick = async ({ lat, lng }) => {
    const pos = { lat, lng };
    setPicked(pos);
    await resolveAddress(pos);
  };

  const handleDetect = async () => {
    const coords = await requestLocation();
    if (coords) {
      setPicked(coords);
      await resolveAddress(coords);
    }
  };

  const markers = picked ? [{ id: 'picked', position: picked, color: '#f97316' }] : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} className="text-orange-500" />
          {picked ? (
            <span className="truncate">{address || `${picked.lat.toFixed(4)}, ${picked.lng.toFixed(4)}`}</span>
          ) : (
            <span className="text-gray-400">Tap the map or detect your location</span>
          )}
        </div>
        <button
          type="button"
          onClick={handleDetect}
          disabled={geoLoading}
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50"
        >
          {geoLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Crosshair size={14} />
          )}
          Detect
        </button>
      </div>

      {geoError && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <AlertCircle size={14} />
          {geoError}
        </div>
      )}

      <div className="h-48 overflow-hidden rounded-2xl border border-gray-200 sm:h-56">
        <MapView
          center={picked || undefined}
          markers={markers}
          zoom={15}
          onClick={handleMapClick}
        />
      </div>

      {resolving && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Loader2 size={12} className="animate-spin" />
          Resolving address...
        </div>
      )}

      {picked && !resolving && address && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600">
          <Check size={13} />
          Location set
        </div>
      )}
    </div>
  );
}
