export const getCurrentLocation = (options = {}) => new Promise((resolve, reject) => {
  if (!navigator.geolocation) return reject(new Error('Geolocation is not supported by this browser.'));
  navigator.geolocation.getCurrentPosition(position => resolve({ lat: position.coords.latitude, lng: position.coords.longitude, accuracy: position.coords.accuracy }), reject, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000, ...options });
});
export const distanceInKm = (from, to) => { const rad = value => value * Math.PI / 180; const earth = 6371; const dLat=rad(to.lat-from.lat), dLng=rad(to.lng-from.lng); const a=Math.sin(dLat/2)**2+Math.cos(rad(from.lat))*Math.cos(rad(to.lat))*Math.sin(dLng/2)**2; return earth*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); };
export const isWithinRadius = (from, to, radiusKm) => distanceInKm(from,to) <= radiusKm;
