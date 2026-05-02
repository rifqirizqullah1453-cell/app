import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Navigation, ArrowRight,
  AlertCircle, ChevronLeft, Sparkles,
  Search, X, Check, Crosshair, FileText
} from 'lucide-react';
import type { ServiceType } from '@/types';
import { SERVICE_CATEGORIES, SERVICE_LABELS } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import MapLeaflet, { searchAddress, getCurrentLocation } from '@/components/MapLeaflet';

const DEFAULT_CENTER = { lat: 41.6358, lng: 32.3375 };

function CheckIcon(props: any) {
  return (
    <svg {...props} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function CreateOrder() {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile } = useAuth();
  const { createOrder } = useOrders();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [serviceType, setServiceType] = useState<ServiceType>('delivery');
  const [locationStep, setLocationStep] = useState<'pickup' | 'destination' | 'review'>('pickup');

  // Pickup
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupLat, setPickupLat] = useState(DEFAULT_CENTER.lat);
  const [pickupLng, setPickupLng] = useState(DEFAULT_CENTER.lng);
  const [pickupConfirmed, setPickupConfirmed] = useState(false);

  // Destination
  const [destinationAddress, setDestinationAddress] = useState('');
  const [destLat, setDestLat] = useState(0);
  const [destLng, setDestLng] = useState(0);
  const [destConfirmed, setDestConfirmed] = useState(false);

  // REAL-TIME map center (from MapLeaflet onCenterChange)
  const [mapCenterLat, setMapCenterLat] = useState(DEFAULT_CENTER.lat);
  const [mapCenterLng, setMapCenterLng] = useState(DEFAULT_CENTER.lng);
  const [mapCenterAddress, setMapCenterAddress] = useState('');

  // Promo, multi-stop, scheduled, payment
  const [promoCode, setPromoCode] = useState('');
  const [stops, setStops] = useState<Array<{ address: string; lat: number; lng: number }>>([]);
  const [scheduledAt, setScheduledAt] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showScheduleInput, setShowScheduleInput] = useState(false);
  const [showStopsInput, setShowStopsInput] = useState(false);

  // Detail alamat lengkap
  const [pickupDetail, setPickupDetail] = useState('');
  const [destDetail, setDestDetail] = useState('');

  // Other
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [error, setError] = useState('');

  // Search with autocomplete
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lng: number }>>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Autocomplete search (debounced, 300ms)
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchAddress(searchQuery);
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
      setIsSearching(false);
    }, 300);
  }, [searchQuery]);

  // Auto GPS on first enter step 2
  useEffect(() => {
    if (step === 2 && locationStep === 'pickup' && !pickupConfirmed && !pickupAddress) {
      handleGpsPickup();
    }
  }, [step, locationStep]);

  // GPS: Set pickup to real GPS location
  const handleGpsPickup = async () => {
    setIsGpsLoading(true);
    try {
      const pos = await getCurrentLocation();
      setPickupLat(pos.lat);
      setPickupLng(pos.lng);
      setPickupAddress('GPS Location');
      toast('GPS location detected!', 'success');
    } catch {
      setPickupLat(DEFAULT_CENTER.lat);
      setPickupLng(DEFAULT_CENTER.lng);
      setPickupAddress('Bartın Merkez');
      toast('GPS unavailable. Using default.', 'info');
    }
    setIsGpsLoading(false);
  };

  // GPS: Set destination to real GPS location
  const handleGpsDestination = async () => {
    setIsGpsLoading(true);
    try {
      const pos = await getCurrentLocation();
      setDestLat(pos.lat);
      setDestLng(pos.lng);
      setDestinationAddress('GPS Location');
      setDestConfirmed(true);
      toast('Destination set to GPS!', 'success');
      setLocationStep('review');
    } catch {
      toast('GPS failed. Enable location services.', 'error');
    }
    setIsGpsLoading(false);
  };

  // Map center changed (real-time from MapLeaflet)
  const handleCenterChange = (lat: number, lng: number, address: string) => {
    setMapCenterLat(lat);
    setMapCenterLng(lng);
    setMapCenterAddress(address);
  };

  // Confirm pickup from center pin
  const confirmPickupFromPin = () => {
    setPickupLat(mapCenterLat);
    setPickupLng(mapCenterLng);
    setPickupAddress(mapCenterAddress || 'Selected Location');
    setPickupConfirmed(true);
    toast('Pickup confirmed!', 'success');
    setLocationStep('destination');
  };

  // Confirm destination from center pin
  const confirmDestFromPin = () => {
    setDestLat(mapCenterLat);
    setDestLng(mapCenterLng);
    setDestinationAddress(mapCenterAddress || 'Selected Location');
    setDestConfirmed(true);
    toast('Destination confirmed!', 'success');
    setLocationStep('review');
  };

  // Select from search dropdown
  const selectSearchResult = (result: { name: string; lat: number; lng: number }) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    if (locationStep === 'pickup') {
      setPickupLat(result.lat);
      setPickupLng(result.lng);
      setPickupAddress(result.name);
      setPickupConfirmed(true);
      toast('Pickup set!', 'success');
      setLocationStep('destination');
    } else {
      setDestLat(result.lat);
      setDestLng(result.lng);
      setDestinationAddress(result.name);
      setDestConfirmed(true);
      toast('Destination set!', 'success');
      setLocationStep('review');
    }
  };

  const handleSubmit = async () => {
    if (!pickupAddress || !destinationAddress) {
      setError('Confirm both pickup and destination');
      return;
    }
    setError('');
    setIsLoading(true);
    // Combine notes with address details
    const fullNotes = [
      pickupDetail && `Pickup Detail: ${pickupDetail}`,
      destDetail && `Destination Detail: ${destDetail}`,
      notes,
    ].filter(Boolean).join('\n\n');
    try {
      const id = await createOrder({
        serviceType, pickupAddress, pickupLat, pickupLng,
        destinationAddress, destinationLat: destLat, destinationLng: destLng,
        notes: fullNotes, price: 0,
        stops: stops.length > 0 ? stops : undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt).getTime() : undefined,
        paymentMethod,
        promoCode: promoCode || undefined,
      });
      toast('Order created!', 'success');
      navigate(`/track/${id}`);
    } catch (err: any) {
      setError(err.message || 'Failed');
      setIsLoading(false);
    }
  };

  const serviceColors: Record<string, { bg: string; border: string }> = {
    delivery: { bg: '#E8F8FA', border: '#2BC5D4' },
    shopping: { bg: '#ECFDF5', border: '#10B981' },
    cleaning: { bg: '#F5F3FF', border: '#8B5CF6' },
    moving: { bg: '#FDF2F8', border: '#EC4899' },
  };

  const modeColor = locationStep === 'pickup' ? '#2BC5D4' : '#F59E0B';

  // ===== STEP 1 =====
  if (step === 1) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="px-5 pt-5 pb-4 bg-white border-b border-[var(--border-light)]">
            <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm font-semibold mb-4 hover:text-[#2BC5D4] transition-colors" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text)' }}>Choose Service</h1>
            <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>What do you need today?</p>
          </div>
          <div className="px-5 pt-4 pb-10 max-w-lg mx-auto space-y-3">
            {SERVICE_CATEGORIES.map((s, i) => (
              <motion.button key={s.id} onClick={() => setServiceType(s.id)}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.01, x: 4 }} whileTap={{ scale: 0.98 }}
                className="w-full p-4 rounded-3xl text-left flex items-center gap-4 bg-white border-[1.5px] hover:shadow-xl transition-all"
                style={{ borderColor: serviceType === s.id ? serviceColors[s.id]?.border : 'var(--border-light)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0" style={{ background: serviceColors[s.id]?.bg }}>
                  <img src={s.img} alt={s.name} className="w-12 h-12 object-contain" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-bold" style={{ color: 'var(--text)' }}>{s.name}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{SERVICE_LABELS[s.id]}</p>
                </div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: serviceType === s.id ? 'linear-gradient(135deg,#4DD4E0,#2BC5D4)' : 'var(--bg)', border: serviceType === s.id ? 'none' : '1.5px solid #CBD5E1' }}>
                  {serviceType === s.id && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </div>
              </motion.button>
            ))}
            <motion.button onClick={() => setStep(2)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-4 btn-cyan flex items-center justify-center gap-2 rounded-2xl mt-2">
              Continue <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== STEP 2: SPLIT LAYOUT =====
  return (
    <div className="h-screen flex flex-col md:flex-row" style={{ background: 'var(--bg)' }}>
      {/* MAP AREA — full, clean, no overlays except tiny header */}
      <div className="flex-1 relative min-h-[55vh] md:min-h-0 md:h-full">
        {/* Floating header — small, transparent */}
        <div className="absolute top-0 left-0 right-0 z-[400] px-3 py-2 flex items-center gap-2 pointer-events-none">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => {
            if (locationStep === 'destination') setLocationStep('pickup');
            else if (locationStep === 'review') setLocationStep('destination');
            else { setStep(1); navigate('/'); }
          }} className="p-2 rounded-xl bg-white/90 backdrop-blur shadow-md border border-[var(--border-light)] pointer-events-auto">
            <ChevronLeft className="w-4 h-4" style={{ color: '#2BC5D4' }} />
          </motion.button>
          <div className="flex items-center gap-1 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 shadow-md border border-[var(--border-light)]">
            <div className={`w-2 h-2 rounded-full ${pickupConfirmed ? 'bg-[#2BC5D4]' : 'bg-[var(--border)]'}`} />
            <span className="text-[10px] font-bold" style={{ color: pickupConfirmed ? '#2BC5D4' : 'var(--text-muted)' }}>Pickup</span>
            <div className="w-3 h-px mx-0.5" style={{ background: 'var(--border)' }} />
            <div className={`w-2 h-2 rounded-full ${destConfirmed ? 'bg-[#F59E0B]' : 'bg-[var(--border)]'}`} />
            <span className="text-[10px] font-bold" style={{ color: destConfirmed ? '#F59E0B' : 'var(--text-muted)' }}>Dest</span>
          </div>
        </div>

        {/* The Map */}
        {locationStep === 'review' ? (
          <MapLeaflet pickupLat={pickupLat} pickupLng={pickupLng}
            destLat={destLat || undefined} destLng={destLng || undefined}
            showRoute={true} interactive={true} height="100%" />
        ) : (
          <MapLeaflet
            pickupLat={locationStep === 'pickup' ? pickupLat : 0}
            pickupLng={locationStep === 'pickup' ? pickupLng : 0}
            destLat={locationStep === 'destination' ? destLat || 0 : 0}
            destLng={locationStep === 'destination' ? destLng || 0 : 0}
            showRoute={false} interactive={true} height="100%"
            centerPinMode={true}
            pinColor={modeColor}
            onCenterChange={handleCenterChange}
          />
        )}
      </div>

      {/* SIDE PANEL — all controls, NO overlap with map */}
      <div className="w-full md:w-[380px] lg:w-[400px] shrink-0 bg-white border-t md:border-t-0 md:border-l border-[var(--border-light)] overflow-y-auto">
        <div className="p-4 md:p-5 space-y-3">

          {/* Title */}
          <div>
            <h2 className="text-lg font-black" style={{ color: 'var(--text)' }}>
              {locationStep === 'pickup' && 'Set Pickup'}
              {locationStep === 'destination' && 'Set Destination'}
              {locationStep === 'review' && 'Review Order'}
            </h2>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {locationStep !== 'review' ? 'Drag map to adjust pin' : 'Check your order details'}
            </p>
          </div>

          {/* Search with Autocomplete */}
          {locationStep !== 'review' && (
            <div ref={searchRef} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search address...`}
                className="w-full pl-9 pr-10 py-2.5 text-sm font-medium rounded-xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] outline-none transition-all"
                style={{ background: 'var(--bg)' }}
              />
              {isSearching && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 rounded-full"
                  style={{ borderColor: 'var(--border)', borderTopColor: 'var(--cyan)' }}
                />
              )}

              {/* Autocomplete Dropdown */}
              <AnimatePresence>
                {showSearchDropdown && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-[var(--border-light)] overflow-hidden z-50"
                  >
                    {searchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectSearchResult(result)}
                        className="w-full px-4 py-3 text-left flex items-start gap-3 hover:bg-[var(--bg)] transition-colors border-b border-[var(--border-light)] last:border-0"
                      >
                        <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2BC5D4' }} />
                        <span className="text-xs font-medium leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {result.name}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* GPS Button */}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={locationStep === 'pickup' ? handleGpsPickup : handleGpsDestination}
                disabled={isGpsLoading}
                className="mt-2 w-full py-2.5 flex items-center justify-center gap-2 rounded-xl text-xs font-bold"
                style={{ background: '#E8F8FA', color: '#2BC5D4' }}
              >
                {isGpsLoading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-[#2BC5D4]/30 border-t-[#2BC5D4] rounded-full" />
                ) : (
                  <><Crosshair className="w-3.5 h-3.5" /> Use My GPS Location</>
                )}
              </motion.button>

              {/* Saved Addresses */}
              {userProfile?.savedAddresses && userProfile.savedAddresses.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Saved Addresses</p>
                  <div className="space-y-2">
                    {userProfile.savedAddresses.map((addr) => (
                      <motion.button
                        key={addr.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (locationStep === 'pickup') {
                            setPickupLat(addr.lat);
                            setPickupLng(addr.lng);
                            setPickupAddress(addr.address);
                            setPickupConfirmed(true);
                            toast(`Pickup: ${addr.name}`, 'success');
                            setLocationStep('destination');
                          } else {
                            setDestLat(addr.lat);
                            setDestLng(addr.lng);
                            setDestinationAddress(addr.address);
                            setDestConfirmed(true);
                            toast(`Destination: ${addr.name}`, 'success');
                            setLocationStep('review');
                          }
                        }}
                        className="w-full p-2.5 rounded-xl text-left flex items-center gap-2 bg-white border border-[var(--border-light)] hover:border-[#2BC5D4] transition-all"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E8F8FA' }}>
                          <MapPin className="w-4 h-4" style={{ color: '#2BC5D4' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{addr.name}</p>
                          <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>{addr.address}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-2.5 flex items-start gap-2 rounded-xl" style={{ background: '#FEF2F2' }}>
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#EF4444' }} />
                <p className="text-xs font-medium" style={{ color: '#EF4444' }}>{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pickup Card */}
          <div className={`p-3 rounded-xl border-[1.5px] ${pickupConfirmed ? 'border-[#2BC5D4] bg-[#E8F8FA]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: pickupConfirmed ? '#2BC5D4' : 'var(--border)' }}>
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pickup</p>
                <p className="text-xs font-semibold truncate" style={{ color: pickupConfirmed ? 'var(--text)' : 'var(--text-muted)' }}>
                  {pickupAddress || 'Not set'}
                </p>
              </div>
              {pickupConfirmed && <Check className="w-4 h-4 text-[#2BC5D4] shrink-0" />}
            </div>
          </div>

          {/* Destination Card */}
          <div className={`p-3 rounded-xl border-[1.5px] ${destConfirmed ? 'border-[#F59E0B] bg-[#FEF3C7]' : 'border-[var(--border)] bg-[var(--bg)]'}`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: destConfirmed ? '#F59E0B' : 'var(--border)' }}>
                <Navigation className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Destination</p>
                <p className="text-xs font-semibold truncate" style={{ color: destConfirmed ? 'var(--text)' : 'var(--text-muted)' }}>
                  {destinationAddress || 'Not set'}
                </p>
              </div>
              {destConfirmed && <Check className="w-4 h-4 text-[#F59E0B] shrink-0" />}
            </div>
          </div>

          {/* Notes */}
          {locationStep === 'review' && (
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions..." rows={2}
              className="w-full px-3 py-2 text-xs font-medium resize-none outline-none rounded-xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] transition-all bg-white" />
          )}

          {/* Payment Method */}
          {locationStep === 'review' && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>Payment Method</label>
              <div className="flex gap-2">
                <button onClick={() => setPaymentMethod('cod')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all ${paymentMethod === 'cod' ? 'border-[1.5px] border-[#2BC5D4] bg-[#E8F8FA] text-[#2BC5D4]' : 'border border-[var(--border-light)] bg-white text-[var(--text-muted)]'}`}>
                  Cash on Delivery
                </button>
                <button onClick={() => setPaymentMethod('online')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-center transition-all ${paymentMethod === 'online' ? 'border-[1.5px] border-[#2BC5D4] bg-[#E8F8FA] text-[#2BC5D4]' : 'border border-[var(--border-light)] bg-white text-[var(--text-muted)]'}`}>
                  Online Payment
                </button>
              </div>
            </div>
          )}

          {/* Schedule Toggle */}
          {locationStep === 'review' && (
            <div>
              <motion.button onClick={() => setShowScheduleInput(!showScheduleInput)} whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-between px-3 bg-white border border-[var(--border-light)]">
                <span style={{ color: 'var(--text-secondary)' }}>Schedule for Later</span>
                <span className="text-[10px] font-bold" style={{ color: scheduledAt ? '#2BC5D4' : 'var(--text-muted)' }}>
                  {scheduledAt ? new Date(scheduledAt).toLocaleString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Now'}
                </span>
              </motion.button>
              <AnimatePresence>
                {showScheduleInput && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                    <input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium rounded-xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] outline-none bg-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Promo Code Toggle */}
          {locationStep === 'review' && (
            <div>
              <motion.button onClick={() => setShowPromoInput(!showPromoInput)} whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-between px-3 bg-white border border-[var(--border-light)]">
                <span style={{ color: 'var(--text-secondary)' }}>Promo Code</span>
                <span className="text-[10px] font-bold" style={{ color: promoCode ? '#2BC5D4' : 'var(--text-muted)' }}>
                  {promoCode || 'Add'}
                </span>
              </motion.button>
              <AnimatePresence>
                {showPromoInput && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2">
                    <div className="flex gap-2">
                      <input value={promoCode} onChange={e => setPromoCode(e.target.value.toUpperCase())} placeholder="Enter code"
                        className="flex-1 px-3 py-2 text-xs font-medium rounded-xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] outline-none bg-white" />
                      <motion.button whileTap={{ scale: 0.95 }}
                        className="px-3 py-2 rounded-xl text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
                        Apply
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Multi-Stop Toggle */}
          {locationStep === 'review' && (
            <div>
              <motion.button onClick={() => setShowStopsInput(!showStopsInput)} whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-between px-3 bg-white border border-[var(--border-light)]">
                <span style={{ color: 'var(--text-secondary)' }}>Add Stops</span>
                <span className="text-[10px] font-bold" style={{ color: stops.length > 0 ? '#2BC5D4' : 'var(--text-muted)' }}>
                  {stops.length > 0 ? `${stops.length} stop(s)` : 'None'}
                </span>
              </motion.button>
              <AnimatePresence>
                {showStopsInput && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2">
                    {stops.map((stop, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white border border-[var(--border-light)]">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>{i + 1}</div>
                        <p className="text-xs font-medium flex-1 truncate" style={{ color: 'var(--text)' }}>{stop.address}</p>
                        <button onClick={() => setStops(stops.filter((_, idx) => idx !== i))}
                          className="p-1 rounded-lg hover:bg-red-50"><span className="text-red-400 text-xs font-bold">X</span></button>
                      </div>
                    ))}
                    <button onClick={() => setStops([...stops, { address: 'Stop ' + (stops.length + 1), lat: 41.6358, lng: 32.3375 }])}
                      className="w-full py-2 rounded-xl text-xs font-bold text-center border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[#2BC5D4] hover:text-[#2BC5D4] transition-all">
                      + Add Stop
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Current address preview (when in pin mode) */}
          {locationStep !== 'review' && mapCenterAddress && (
            <div className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border-light)]">
              <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Pin Location</p>
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{mapCenterAddress}</p>
            </div>
          )}

          {/* Detail Alamat Lengkap */}
          {locationStep !== 'review' && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <FileText className="w-3 h-3" />
                {locationStep === 'pickup' ? 'Pickup Address Detail' : 'Destination Address Detail'}
              </label>
              <textarea
                value={locationStep === 'pickup' ? pickupDetail : destDetail}
                onChange={(e) => locationStep === 'pickup' ? setPickupDetail(e.target.value) : setDestDetail(e.target.value)}
                placeholder={locationStep === 'pickup' ? 'e.g. Apartment 5B, 3rd floor, white building...' : 'e.g. Office building, near the park...'}
                rows={3}
                className="w-full px-3 py-2.5 text-xs font-medium resize-none outline-none rounded-xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] transition-all bg-white"
              />
              <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
                Add house number, floor, landmark, or other details to help the driver find the exact location.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2 pt-1">
            <motion.button onClick={() => {
              if (locationStep === 'destination') setLocationStep('pickup');
              else if (locationStep === 'review') setLocationStep('destination');
              else { setStep(1); navigate('/'); }
            }} whileTap={{ scale: 0.95 }}
              className="px-4 py-3 text-xs font-bold rounded-xl border-[1.5px] border-[var(--border)] bg-white"
              style={{ color: 'var(--text-secondary)' }}>Back</motion.button>

            {locationStep !== 'review' ? (
              <motion.button onClick={locationStep === 'pickup' ? confirmPickupFromPin : confirmDestFromPin}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 flex items-center justify-center gap-2 rounded-xl font-bold text-xs text-white"
                style={{ background: modeColor }}>
                <Check className="w-4 h-4" />
                {locationStep === 'pickup' ? 'Confirm Pickup' : 'Confirm Destination'}
              </motion.button>
            ) : (
              <motion.button onClick={handleSubmit} disabled={isLoading || !pickupAddress || !destinationAddress}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 btn-cyan flex items-center justify-center gap-2 rounded-xl"
                style={{ opacity: !pickupAddress || !destinationAddress ? 0.4 : 1 }}>
                {isLoading ? (
                  <motion.div className="w-4 h-4 border-[2.5px] border-white/40 rounded-full border-t-white"
                    animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                ) : <><Sparkles className="w-4 h-4" /> Order Now</>}
              </motion.button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
