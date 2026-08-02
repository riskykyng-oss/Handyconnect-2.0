const OSRM = 'https://router.project-osrm.org';

const point = (value) => (typeof value === 'string' ? value : `${value.lng},${value.lat}`);

const formatDistance = (meters) => (meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`);

const formatDuration = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)} secs`;
  const mins = seconds / 60;
  if (mins < 60) return `${Math.round(mins)} mins`;
  return `${Math.floor(mins / 60)} hr ${Math.round(mins % 60)} mins`;
};

export const getDirections = async (origin, destination, mode = 'driving') => {
  const profile = { driving: 'driving', walking: 'foot', bicycling: 'bike' }[mode] || 'driving';
  const response = await fetch(`${OSRM}/route/v1/${profile}/${point(origin)};${point(destination)}?overview=full&geometries=polyline&steps=true&alternatives=false`);
  if (!response.ok) throw new Error('No route available');
  const result = await response.json();
  if (result.code !== 'Ok' || !result.routes?.length) throw new Error('No route available');
  const route = result.routes[0];
  const leg = route.legs[0];
  return {
    distance: { text: formatDistance(leg.distance), value: leg.distance },
    duration: { text: formatDuration(leg.duration), value: leg.duration },
    polyline: route.geometry,
    steps: leg.steps || [],
  };
};
