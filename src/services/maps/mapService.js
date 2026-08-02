const NOMINATIM = 'https://nominatim.openstreetmap.org';

export const searchPlaces = async (input, location) => {
  const params = new URLSearchParams({ q: input, format: 'jsonv2', limit: '5', addressdetails: '0', 'accept-language': 'en' });
  if (location?.lat) {
    params.set('lat', location.lat);
    params.set('lon', location.lng);
  }
  const response = await fetch(`${NOMINATIM}/search?${params}`);
  if (!response.ok) throw new Error('Place search failed');
  const results = await response.json();
  return results.map(({ place_id, display_name, type, lat, lon }) => ({
    place_id,
    display_name,
    type,
    lat: parseFloat(lat),
    lng: parseFloat(lon),
  }));
};

export const createHandyConnectMarker = ({ id, name, position, type = 'handyman' }) => ({ id, name, position, type, color: type === 'job' ? '#f97316' : '#0ea5e9' });
