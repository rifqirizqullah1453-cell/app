import { useState, useCallback, useRef } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import type { GeoLocation } from '@/types';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBOHizvCmyrxkEhpXlx1MYRVCXyyz9e8d0';

setOptions({
  key: GOOGLE_MAPS_API_KEY,
  libraries: ['places', 'geometry'],
});

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const dirRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  const loadLibraries = useCallback(async () => {
    if (isLoaded) return;
    try {
      await importLibrary('maps');
      await importLibrary('places');
      await importLibrary('geometry');
      setIsLoaded(true);
    } catch (err) {
      console.error('Failed to load Google Maps:', err);
    }
  }, [isLoaded]);

  const initMap = useCallback(
    async (container: HTMLDivElement, center?: GeoLocation): Promise<google.maps.Map> => {
      await loadLibraries();
      const map = new google.maps.Map(container, {
        center: center || { lat: 41.6358, lng: 32.3375 },
        zoom: 14,
        mapTypeId: 'roadmap',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
      });
      return map;
    },
    [loadLibraries]
  );

  const addMarker = useCallback(
    (map: google.maps.Map, position: GeoLocation, color: string, title: string) => {
      const marker = new google.maps.Marker({
        position: { lat: position.lat, lng: position.lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: color,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title,
      });
      markersRef.current.push(marker);
      return marker;
    },
    []
  );

  const drawRoute = useCallback(
    (map: google.maps.Map, origin: GeoLocation, destination: GeoLocation): Promise<{ distance: number; duration: number } | null> => {
      return new Promise((resolve) => {
        // Clear old
        markersRef.current.forEach((m) => m.setMap(null));
        markersRef.current = [];
        if (dirRendererRef.current) {
          dirRendererRef.current.setMap(null);
          dirRendererRef.current = null;
        }

        // Add markers
        addMarker(map, origin, '#004AAD', 'Jemput');
        addMarker(map, destination, '#FF5722', 'Tujuan');

        // Draw route
        new google.maps.DirectionsService().route(
          {
            origin: { lat: origin.lat, lng: origin.lng },
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: google.maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === 'OK' && result) {
              const renderer = new google.maps.DirectionsRenderer({
                map,
                directions: result,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#004AAD',
                  strokeWeight: 5,
                  strokeOpacity: 0.8,
                },
              });
              dirRendererRef.current = renderer;

              const leg = result.routes[0]?.legs[0];
              if (leg) {
                const distance = (leg.distance?.value || 0) / 1000;
                const duration = (leg.duration?.value || 0) / 60;
                // Fit bounds
                const bounds = new google.maps.LatLngBounds();
                bounds.extend({ lat: origin.lat, lng: origin.lng });
                bounds.extend({ lat: destination.lat, lng: destination.lng });
                map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
                resolve({ distance: Math.round(distance * 100) / 100, duration: Math.round(duration) });
                return;
              }
            }
            resolve(null);
          }
        );
      });
    },
    [addMarker]
  );

  const geocode = useCallback(
    async (address: string): Promise<GeoLocation | null> => {
      await loadLibraries();
      return new Promise((resolve) => {
        new google.maps.Geocoder().geocode({ address }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            const loc = results[0].geometry.location;
            resolve({ lat: loc.lat(), lng: loc.lng() });
          } else {
            resolve(null);
          }
        });
      });
    },
    [loadLibraries]
  );

  const reverseGeocode = useCallback(
    async (loc: GeoLocation): Promise<string> => {
      await loadLibraries();
      return new Promise((resolve) => {
        new google.maps.Geocoder().geocode({ location: { lat: loc.lat, lng: loc.lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            resolve(results[0].formatted_address);
          } else {
            resolve(`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`);
          }
        });
      });
    },
    [loadLibraries]
  );

  const createAutocomplete = useCallback(
    async (input: HTMLInputElement, onSelect: (place: google.maps.places.PlaceResult) => void) => {
      await loadLibraries();
      const autocomplete = new google.maps.places.Autocomplete(input, {
        componentRestrictions: { country: 'tr' },
        fields: ['formatted_address', 'geometry'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          onSelect(place);
        }
      });
      return autocomplete;
    },
    [loadLibraries]
  );

  return { isLoaded, initMap, addMarker, drawRoute, geocode, reverseGeocode, createAutocomplete };
}
