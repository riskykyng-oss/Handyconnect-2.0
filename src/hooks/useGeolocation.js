import { useState, useCallback } from 'react';
import { getCurrentLocation } from '@/services/maps/locationService';

export default function useGeolocation(options) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation(options);
      setLocation(coords);
      return coords;
    } catch (err) {
      const message = err.code === 1
        ? 'Location permission denied. Enable GPS and try again.'
        : 'Could not determine your location.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setLocation(null);
    setError(null);
    setLoading(false);
  }, []);

  return { location, loading, error, requestLocation, reset };
}
