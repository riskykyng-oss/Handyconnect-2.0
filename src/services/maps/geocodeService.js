const NOMINATIM = 'https://nominatim.openstreetmap.org';

export const geocodeAddress = async (address) => {
  const response = await fetch(`${NOMINATIM}/search?format=jsonv2&limit=1&addressdetails=1&accept-language=en&q=${encodeURIComponent(address)}`);
  if (!response.ok) throw new Error('Geocoding failed');
  const results = await response.json();
  if (!results.length) throw new Error('Address not found');
  const item = results[0];
  return { address: item.display_name, lat: parseFloat(item.lat), lng: parseFloat(item.lon), placeId: item.place_id };
};

export const reverseGeocode = async ({ lat, lng }) => {
  const response = await fetch(`${NOMINATIM}/reverse?format=jsonv2&addressdetails=1&accept-language=en&lat=${lat}&lon=${lng}`);
  if (!response.ok) throw new Error('Reverse geocoding failed');
  const item = await response.json();
  if (!item || item.lat === undefined) throw new Error('Address not found');
  return { address: item.display_name, lat: parseFloat(item.lat), lng: parseFloat(item.lon), placeId: item.place_id };
};
