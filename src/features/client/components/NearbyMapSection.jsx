import { useState, useEffect, useMemo } from 'react';
import MapView from '@/components/ui/MapView';
import { MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { subscribeProfessionals } from '@/services/userService';

export default function NearbyMapSection({ markers: propMarkers }) {
  const navigate = useNavigate();

  const [pros, setPros] = useState([]);
  useEffect(() => subscribeProfessionals(setPros), []);

  const liveMarkers = useMemo(
    () =>
      pros
        .filter((u) => u.location?.lat != null && u.location?.lng != null)
        .map((u) => ({
          position: { lat: u.location.lat, lng: u.location.lng },
          label: (u.displayName || '?')[0].toUpperCase(),
          title: `${u.displayName || 'Handyman'} - ${u.trade || u.skills || 'Pro'}`,
        })),
    [pros]
  );

  const markers = propMarkers?.length ? propMarkers : liveMarkers;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <MapPin size={16} />
          </div>
          <div>
            <h3 className="font-display text-sm font-bold text-gray-900">Nearby Professionals</h3>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> {liveMarkers.length} Available Today
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/client/explore?view=map')}
          className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-800"
        >
          View Full Map <ArrowRight size={12} />
        </button>
      </div>
      <div className="h-[220px] w-full overflow-hidden">
        <MapView
          markers={markers}
          center={markers[0]?.position || { lat: -17.8252, lng: 31.0335 }}
          zoom={13}
        />
      </div>
    </div>
  );
}
