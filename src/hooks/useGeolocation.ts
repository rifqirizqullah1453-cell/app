import { useState, useEffect, useCallback, useRef } from 'react';

interface GeoLocation {
  lat: number;
  lng: number;
}

export function useGeolocation(updateInterval = 10000) {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSuccess = useCallback((pos: GeolocationPosition) => {
    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    setError(null);
    setIsLoading(false);
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let msg = 'Gagal mendapatkan lokasi';
    switch (err.code) {
      case err.PERMISSION_DENIED:
        msg = 'Izin lokasi ditolak. Aktifkan di pengaturan browser.';
        break;
      case err.POSITION_UNAVAILABLE:
        msg = 'Lokasi tidak tersedia.';
        break;
      case err.TIMEOUT:
        msg = 'Waktu habis saat mengambil lokasi.';
        break;
    }
    setError(msg);
    setIsLoading(false);
    // Default to Bartin center
    if (!location) setLocation({ lat: 41.6358, lng: 32.3375 });
  }, [location]);

  const getCurrentPosition = useCallback((): Promise<GeoLocation> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        const fallback = { lat: 41.6358, lng: 32.3375 };
        setLocation(fallback);
        resolve(fallback);
        return;
      }
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLocation(loc);
          setError(null);
          setIsLoading(false);
          resolve(loc);
        },
        () => {
          const fallback = { lat: 41.6358, lng: 32.3375 };
          setLocation(fallback);
          setError(null);
          setIsLoading(false);
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsTracking(true);
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true, timeout: 15000,
    });
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess, handleError,
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 15000 }
    );
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true, timeout: 15000,
      });
    }, updateInterval);
  }, [handleSuccess, handleError, updateInterval]);

  const stopTracking = useCallback(() => {
    setIsTracking(false);
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { location, error, isLoading, isTracking, startTracking, stopTracking, getCurrentPosition };
}
