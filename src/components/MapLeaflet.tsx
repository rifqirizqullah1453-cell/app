import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, MapPin, Navigation } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapLeafletProps {
  pickupLat: number;
  pickupLng: number;
  destLat?: number;
  destLng?: number;
  workerLat?: number;
  workerLng?: number;
  height?: string;
  showRoute?: boolean;
  interactive?: boolean;
  onMapClick?: (lat: number, lng: number, address?: string) => void;
  centerPinMode?: boolean;
  pinColor?: string;
  // REAL-TIME center coordinates to parent
  onCenterChange?: (lat: number, lng: number, address: string) => void;
}

const BARTIN_CENTER: L.LatLngExpression = [41.6358, 32.3375];

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'tr,en' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export async function searchAddress(query: string): Promise<Array<{ lat: number; lng: number; name: string }>> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Bartın, Turkey')}&limit=5&addressdetails=0`,
      { headers: { 'Accept-Language': 'tr,en' } }
    );
    const data = await res.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      name: item.display_name,
    }));
  } catch {
    return [];
  }
}

export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}

export default function MapLeaflet({
  pickupLat,
  pickupLng,
  destLat,
  destLng,
  workerLat,
  workerLng,
  height = '300px',
  showRoute = false,
  interactive = true,
  onMapClick,
  centerPinMode = false,
  pinColor = '#2BC5D4',
  onCenterChange,
}: MapLeafletProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeRef = useRef<L.Polyline | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Track map center in real-time for center-pin mode
  useEffect(() => {
    if (!centerPinMode || !mapRef.current || !isReady || !onCenterChange) return;

    const map = mapRef.current;
    let timeout: ReturnType<typeof setTimeout>;

    const onMove = () => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        const c = map.getCenter();
        const addr = await reverseGeocode(c.lat, c.lng);
        onCenterChange(c.lat, c.lng, addr);
      }, 500);
    };

    map.on('moveend', onMove);
    // Initial center
    const c = map.getCenter();
    reverseGeocode(c.lat, c.lng).then((addr) => onCenterChange(c.lat, c.lng, addr));

    return () => {
      map.off('moveend', onMove);
      clearTimeout(timeout);
    };
  }, [centerPinMode, isReady, onCenterChange]);

  const handleMapClick = useCallback(
    async (e: L.LeafletMouseEvent) => {
      if (!onMapClick || centerPinMode) return;
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng, 'Loading...');
      const address = await reverseGeocode(lat, lng);
      onMapClick(lat, lng, address);
    },
    [onMapClick, centerPinMode]
  );

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center = pickupLat && pickupLng ? ([pickupLat, pickupLng] as L.LatLngExpression) : BARTIN_CENTER;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 16,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    mapRef.current = map;

    if (onMapClick && interactive && !centerPinMode) {
      map.on('click', handleMapClick);
    }

    setIsReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers & route
  useEffect(() => {
    if (!mapRef.current || !isReady) return;
    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = L.latLngBounds([]);

    if (pickupLat && pickupLng) {
      const pickupIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:linear-gradient(135deg,#4DD4E0,#2BC5D4);width:44px;height:44px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(43,197,212,0.5);"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });
      const m = L.marker([pickupLat, pickupLng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup('<b style="color:#2BC5D4">Pickup</b>', { closeButton: false });
      markersRef.current.push(m);
      bounds.extend([pickupLat, pickupLng]);
    }

    if (destLat && destLng) {
      const destIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:linear-gradient(135deg,#FBBF24,#F59E0B);width:44px;height:44px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(245,158,11,0.5);"><svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
      });
      const m = L.marker([destLat, destLng], { icon: destIcon })
        .addTo(map)
        .bindPopup('<b style="color:#F59E0B">Destination</b>', { closeButton: false });
      markersRef.current.push(m);
      bounds.extend([destLat, destLng]);
    }

    // Worker marker (green, pulsing)
    if (workerLat && workerLng) {
      const workerIcon = L.divIcon({
        className: 'worker-marker',
        html: `<div style="background:linear-gradient(135deg,#34D399,#10B981);width:40px;height:40px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(16,185,129,0.5);animation:pulse 1.5s infinite;"><svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
      const m = L.marker([workerLat, workerLng], { icon: workerIcon, zIndexOffset: 1000 })
        .addTo(map)
        .bindPopup('<b style="color:#10B981">Pekerja (Live)</b>', { closeButton: false });
      markersRef.current.push(m);
      bounds.extend([workerLat, workerLng]);
    }

    if (routeRef.current) routeRef.current.remove();
    if (showRoute && pickupLat && pickupLng && destLat && destLng) {
      routeRef.current = L.polyline(
        [[pickupLat, pickupLng], [destLat, destLng]],
        { color: '#2BC5D4', weight: 6, opacity: 0.9, dashArray: '10, 6', lineCap: 'round' }
      ).addTo(map);
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [80, 80] });
    } else if (pickupLat && pickupLng && !destLat) {
      map.setView([pickupLat, pickupLng], 16);
    }
  }, [pickupLat, pickupLng, destLat, destLng, workerLat, workerLng, isReady, showRoute]);

  const handleLocate = async () => {
    if (!mapRef.current) return;
    setIsLocating(true);
    try {
      const pos = await getCurrentLocation();
      mapRef.current.setView([pos.lat, pos.lng], 18);
    } catch {
      // GPS unavailable
    }
    setIsLocating(false);
  };

  // Pin icon based on mode
  const PinIcon = pinColor === '#F59E0B' ? Navigation : MapPin;

  return (
    <div className="relative w-full h-full">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'var(--bg)' }}>
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-8 h-8 border-[3px] rounded-full mx-auto mb-2"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--cyan)' }}
            />
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              Loading map...
            </p>
          </div>
        </div>
      )}

      {/* GPS Locate Button */}
      {interactive && (
        <motion.button
          onClick={handleLocate}
          disabled={isLocating}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute top-3 right-3 z-[400] p-2.5 rounded-xl shadow-lg bg-white border border-[var(--border-light)]"
          title="My Location"
        >
          {isLocating ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="w-5 h-5 border-2 rounded-full"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--cyan)' }}
            />
          ) : (
            <Crosshair className="w-5 h-5" style={{ color: 'var(--cyan)' }} />
          )}
        </motion.button>
      )}

      {/* Center Pin Visual ONLY — no buttons, no text */}
      {centerPinMode && isReady && (
        <div className="absolute inset-0 z-[500] pointer-events-none flex items-center justify-center">
          <div className="relative" style={{ marginTop: '-40px' }}>
            {/* Pulse ring */}
            <motion.div
              className="absolute rounded-full border-2"
              style={{ inset: '-20px', borderColor: pinColor, opacity: 0.35 }}
              animate={{ scale: [1, 1.6, 1], opacity: [0.35, 0, 0.35] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            {/* Pin */}
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-[3px] border-white"
                style={{ background: pinColor }}
              >
                <PinIcon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              {/* Triangle tip */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -bottom-2"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderTop: `14px solid ${pinColor}`,
                }}
              />
            </motion.div>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
    </div>
  );
}
