// hook to get the user's lat/lng. falls back to delhi if denied.

import { useEffect, useState } from 'react';

interface GeoState {
  lat: number | null;
  lng: number | null;
  error: string | null;
  loading: boolean;
}

// new delhi -- works as a sane default if location is blocked
const DEFAULT: { lat: number; lng: number } = { lat: 28.6139, lng: 77.209 };

export function useGeolocation(fallback = DEFAULT): GeoState {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ lat: fallback.lat, lng: fallback.lng, error: 'Geolocation unavailable', loading: false });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setState({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null,
          loading: false,
        }),
      (err) =>
        setState({ lat: fallback.lat, lng: fallback.lng, error: err.message, loading: false }),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  }, [fallback.lat, fallback.lng]);

  return state;
}
