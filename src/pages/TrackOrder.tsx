import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { MapPin, Navigation, Phone, Star, ChevronLeft, CheckCircle, Package, Clock, Radio, MessageCircle, AlertTriangle, FileText, X, CreditCard, Ban, ChevronDown, Camera, Share2, Map as MapIcon } from 'lucide-react';
import { STATUS_LABELS, SERVICE_LABELS, CANCEL_REASONS } from '@/types';
import MapLeaflet from '@/components/MapLeaflet';
import RatingModal from '@/components/RatingModal';
import { openMapsNavigation, shareInvoice as shareInvoiceUtil } from '@/utils/share';

const statusMessages: Record<string, { title: string; sub: string }> = {
  searching_worker: { title: 'Finding Worker', sub: 'Matching with nearest available worker' },
  worker_found: { title: 'Worker Found', sub: 'Worker is heading to pickup' },
  on_the_way: { title: 'On The Way', sub: 'Worker is traveling to your location' },
  arrived: { title: 'Worker Arrived', sub: 'Worker is at pickup location' },
  in_progress: { title: 'In Progress', sub: 'Service is being completed' },
  completed: { title: 'Order Complete', sub: 'Thank you for using BOH!' },
  cancelled: { title: 'Cancelled', sub: 'Order has been cancelled' },
};
const stepLabels = ['Order', 'Accepted', 'Travel', 'Arrive', 'Done'];
const stepMap: Record<string, number> = { searching_worker: 1, worker_found: 2, on_the_way: 3, arrived: 4, in_progress: 4, completed: 5, cancelled: 0 };

const PHOTOS_KEY = (orderId: string) => `boh_photos_${orderId}`;

function loadPhotos(orderId: string) {
  try {
    const stored = localStorage.getItem(PHOTOS_KEY(orderId));
    if (stored) return JSON.parse(stored);
  } catch {}
  return { before: [], after: [] };
}

function savePhotos(orderId: string, photos: { before: string[]; after: string[] }) {
  localStorage.setItem(PHOTOS_KEY(orderId), JSON.stringify(photos));
}

export default function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isCustomer, isWorker } = useAuth();
  const { orders, cancelOrder, rateOrder, updateOrderStatus, sendEmergency, markPaid, refreshOrders } = useOrders();
  const { toast } = useToast();
  const [order, setOrder] = useState<typeof orders[0] | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showSOS, setShowSOS] = useState(false);
  const [sosMessage, setSosMessage] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [photos, setPhotos] = useState<{ before: string[]; after: string[] }>({ before: [], after: [] });
  const [showShareSheet, setShowShareSheet] = useState(false);

  useEffect(() => { if (orderId) { const o = orders.find(x => x.id === orderId); if (o) setOrder(o); } }, [orderId, orders]);
  useEffect(() => { if (orderId) setPhotos(loadPhotos(orderId)); }, [orderId]);

  useEffect(() => {
    if (!order || order.status === 'completed' || order.status === 'cancelled') return;
    const interval = setInterval(() => { refreshOrders(); }, 3000);
    return () => clearInterval(interval);
  }, [order?.id, order?.status, refreshOrders]);

  useEffect(() => {
    if (!order) return;
    if (order.status === 'completed' && !celebrated) {
      setCelebrated(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#2BC5D4', '#4DD4E0', '#F59E0B', '#10B981'] });
    }
    if (order.status === 'completed') {
      if (isCustomer && !order.customerRating) { setShowRating(true); }
      else if (!isCustomer && order.workerId && !order.workerRating) { setShowRating(true); }
    }
  }, [order?.status, order?.customerRating, order?.workerRating]);

  if (!order) return <div className="flex h-screen items-center justify-center" style={{ background: 'var(--bg)' }}><motion.div className="w-10 h-10 border-[3px] rounded-full" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--sky)' }} animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} /></div>;

  const handleRate = (r: number, review: string) => { rateOrder(order.id, r, review, isCustomer); toast('Review submitted!', 'success'); };
  const handleCancel = () => {
    const reason = cancelReason === 'Other' ? customReason : cancelReason;
    cancelOrder(order.id, reason);
    setShowCancel(false);
    toast('Order cancelled', 'info');
    navigate(isCustomer ? '/customer' : '/worker');
  };
  const handleSOS = () => {
    sendEmergency(order.id, sosMessage || 'Emergency! Need immediate assistance.');
    setShowSOS(false);
    setSosMessage('');
    toast('Emergency alert sent!', 'error');
  };
  const handlePay = () => { markPaid(order.id); toast('Payment confirmed!', 'success'); };

  const handlePhotoUpload = (type: 'before' | 'after') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const updated = { ...photos, [type]: [...photos[type], dataUrl] };
        setPhotos(updated);
        savePhotos(order.id, updated);
        toast(`${type === 'before' ? 'Before' : 'After'} photo added!`, 'success');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleShare = async () => {
    const result = await shareInvoiceUtil(order.id, order.price, order.paymentMethod);
    if (result === true) toast('Invoice shared!', 'success');
    else if (result === 'copied') toast('Invoice copied to clipboard!', 'success');
    else toast('Sharing not available', 'info');
    setShowShareSheet(false);
  };

  const st = STATUS_LABELS[order.status];
  const curStep = stepMap[order.status] || 1;
  const statusInfo = statusMessages[order.status] || statusMessages.searching_worker;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Map */}
      <div className="h-[32vh] relative">
        <MapLeaflet pickupLat={order.pickupLat} pickupLng={order.pickupLng} destLat={order.destinationLat} destLng={order.destinationLng} workerLat={order.workerLocation?.lat} workerLng={order.workerLocation?.lng} showRoute={true} interactive={false} height="100%" />
        <motion.button onClick={() => navigate(-1)} whileTap={{ scale: 0.9 }} className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-white card-bg shadow-lg"><ChevronLeft className="w-5 h-5" style={{ color: 'var(--text)' }} /></motion.button>
        {order.workerLocation && order.status !== 'completed' && order.status !== 'cancelled' && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute top-4 right-4 z-20 px-3 py-1.5 rounded-full bg-white card-bg shadow-lg flex items-center gap-1.5">
            <motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
            <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
          </motion.div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="flex-1 -mt-5 relative z-10 rounded-t-3xl bg-white card-bg">
        <div className="w-10 h-1 rounded-full mx-auto mt-3 mb-3" style={{ background: 'var(--border)' }} />
        <div className="px-5 pb-8 max-w-lg mx-auto overflow-y-auto" style={{ maxHeight: 'calc(68vh - 4rem)' }}>

          {/* Status Card */}
          <motion.div className="mb-5 p-4 rounded-2xl" style={{ background: st.bg }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3">
              <motion.div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/80 card-bg/80" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Package className="w-6 h-6" style={{ color: st.color }} />
              </motion.div>
              <div className="flex-1">
                <span className="badge" style={{ background: 'rgba(255,255,255,0.5)', color: st.color }}>{st.label}</span>
                <p className="text-sm font-bold mt-1" style={{ color: 'var(--text)' }}>{statusInfo.title}</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{statusInfo.sub}</p>
              </div>
            </div>
          </motion.div>

          {/* Progress Steps */}
          {order.status !== 'cancelled' && (
            <div className="mb-6 px-1">
              <div className="flex items-center justify-between mb-2 relative">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className="flex flex-col items-center z-10 w-10">
                    <motion.div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black" animate={s === curStep ? { scale: [1,1.15,1] } : {}} transition={{ duration: 1.5, repeat: Infinity }} style={{ background: s <= curStep ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : 'var(--bg)', color: s <= curStep ? 'white' : '#CBD5E1', border: s === curStep ? '2px solid var(--sky)' : '2px solid var(--border)' }}>
                      {s < curStep ? <CheckCircle className="w-4 h-4" /> : s}
                    </motion.div>
                    <span className="text-[8px] mt-1 font-bold" style={{ color: s <= curStep ? 'var(--text)' : '#CBD5E1' }}>{stepLabels[s-1]}</span>
                  </div>
                ))}
              </div>
              <div className="relative h-1 mx-5 -mt-9 mb-8"><div className="absolute inset-0 rounded-full" style={{ background: 'var(--bg)' }} /><motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }} animate={{ width: `${((curStep-1)/4)*100}%` }} /></div>
            </div>
          )}

          {/* Scheduled Badge */}
          {order.isScheduled && order.scheduledAt && (
            <div className="p-3 mb-3 rounded-xl flex items-center gap-2" style={{ background: '#F5F3FF' }}>
              <Clock className="w-4 h-4" style={{ color: '#8B5CF6' }} />
              <p className="text-xs font-bold" style={{ color: '#8B5CF6' }}>Scheduled: {new Date(order.scheduledAt).toLocaleString('tr-TR')}</p>
            </div>
          )}

          {/* Payment Status */}
          <div className={`p-3 mb-3 rounded-xl flex items-center justify-between ${order.paymentStatus === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" style={{ color: order.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }} />
              <span className="text-xs font-bold" style={{ color: order.paymentStatus === 'paid' ? '#10B981' : '#F59E0B' }}>
                {order.paymentStatus === 'paid' ? 'Paid' : `Unpaid — ${order.paymentMethod?.toUpperCase() || 'COD'}`}
              </span>
            </div>
            {order.paymentStatus !== 'paid' && (
              <motion.button onClick={handlePay} whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
                Mark Paid
              </motion.button>
            )}
          </div>

          {/* Invoice & Share */}
          <div className="flex gap-2 mb-3">
            <motion.button onClick={() => navigate(`/invoice/${order.id}`)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-white card-bg border border-[var(--border-light)] border-dark"
              style={{ color: 'var(--text-secondary)' }}>
              <FileText className="w-4 h-4" /> View Invoice
            </motion.button>
            <motion.button onClick={() => setShowShareSheet(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 bg-white card-bg border border-[var(--border-light)] border-dark"
              style={{ color: 'var(--text-secondary)' }}>
              <Share2 className="w-4 h-4" /> Share
            </motion.button>
          </div>

          {/* Locations with Navigate Buttons */}
          <div className="space-y-2 mb-4">
            <motion.div className="p-4 rounded-2xl flex items-start gap-3 bg-white card-bg border border-[var(--border-light)] border-dark" whileHover={{ scale: 1.01 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E8F8FA' }}><MapPin className="w-4 h-4" style={{ color: 'var(--sky)' }} /></div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Pickup</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text)' }}>{order.pickupAddress}</p>
              </div>
              {isWorker && (
                <motion.button onClick={() => openMapsNavigation(order.pickupLat, order.pickupLng, 'Pickup', 'google')} whileTap={{ scale: 0.9 }}
                  className="shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold text-white flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
                  <MapIcon className="w-3 h-3" /> Nav
                </motion.button>
              )}
            </motion.div>
            {order.stops?.map((stop, i) => (
              <motion.div key={i} className="p-3 rounded-xl flex items-start gap-3 bg-white card-bg border border-[var(--border-light)] border-dark ml-4" whileHover={{ scale: 1.01 }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-black" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>{i + 1}</div>
                <div><p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Stop {i + 1}</p><p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--text)' }}>{stop.address}</p></div>
              </motion.div>
            ))}
            <motion.div className="p-4 rounded-2xl flex items-start gap-3 bg-white card-bg border border-[var(--border-light)] border-dark" whileHover={{ scale: 1.01 }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#E8F8FA' }}><Navigation className="w-4 h-4" style={{ color: 'var(--sky)' }} /></div>
              <div className="flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Destination</p>
                <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text)' }}>{order.destinationAddress}</p>
              </div>
              {isWorker && (
                <motion.button onClick={() => openMapsNavigation(order.destinationLat, order.destinationLng, 'Destination', 'google')} whileTap={{ scale: 0.9 }}
                  className="shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold text-white flex items-center gap-1"
                  style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
                  <MapIcon className="w-3 h-3" /> Nav
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="p-4 mb-4 rounded-2xl flex items-center justify-between bg-white card-bg border border-[var(--border-light)] border-dark">
            <div className="flex items-center gap-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              <span className="flex items-center gap-1"><Navigation className="w-4 h-4" style={{ color: 'var(--sky)' }} />{order.distance} km</span>
              <span style={{ color: 'var(--border)' }}>|</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" style={{ color: '#10B981' }} />{SERVICE_LABELS[order.serviceType]}</span>
            </div>
            <span className="text-lg font-black" style={{ color: 'var(--sky)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
          </div>

          {/* Worker Card */}
          <AnimatePresence>
            {order.workerName && order.status !== 'cancelled' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 mb-4 rounded-2xl bg-white card-bg border border-[var(--border-light)] border-dark cursor-pointer"
                onClick={() => order.workerId && navigate(`/worker/${order.workerId}`)}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Your Worker</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-[2px] ring-2 ring-[var(--sky-lighter)]"><img src="/images/c-worker.png" alt={order.workerName} className="w-full h-full object-cover" /></div>
                  <div className="flex-1">
                    <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{order.workerName}</p>
                    <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /><span className="text-xs font-semibold">4.8</span></div>
                  </div>
                  <motion.a href={`tel:${order.workerPhone}`} whileTap={{ scale: 0.9 }} className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}><Phone className="w-4 h-4 text-white" /></motion.a>
                </div>
                {order.workerLocation && order.status !== 'completed' && (
                  <div className="mt-3 p-2.5 rounded-xl flex items-center gap-2" style={{ background: '#ECFDF5' }}>
                    <Radio className="w-4 h-4 text-emerald-500" />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-emerald-600">Tracking Active</p>
                      <p className="text-[10px] text-emerald-500">Updated {Math.round((Date.now() - order.workerLocation.timestamp) / 1000)}s ago</p>
                    </div>
                    <div className="flex items-center gap-1"><motion.div className="w-2 h-2 rounded-full bg-emerald-500" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} /><span className="text-[10px] font-bold text-emerald-600">LIVE</span></div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Photo Evidence (Worker only) */}
          {isWorker && order.status !== 'completed' && order.status !== 'cancelled' && (
            <div className="mb-4 p-4 rounded-2xl bg-white card-bg border border-[var(--border-light)] border-dark">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Photo Evidence</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <motion.button onClick={() => handlePhotoUpload('before')} whileTap={{ scale: 0.97 }}
                  className="py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-dashed border-[var(--border)] border-dark hover:border-[#2BC5D4] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Camera className="w-3.5 h-3.5" /> Before Photo
                </motion.button>
                <motion.button onClick={() => handlePhotoUpload('after')} whileTap={{ scale: 0.97 }}
                  className="py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-dashed border-[var(--border)] border-dark hover:border-[#2BC5D4] transition-colors"
                  style={{ color: 'var(--text-secondary)' }}>
                  <Camera className="w-3.5 h-3.5" /> After Photo
                </motion.button>
              </div>
              {photos.before.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>Before</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.before.map((url, i) => (
                      <img key={i} src={url} alt="Before" className="w-16 h-16 rounded-xl object-cover border border-[var(--border-light)] border-dark" />
                    ))}
                  </div>
                </div>
              )}
              {photos.after.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold mb-1" style={{ color: 'var(--text-muted)' }}>After</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.after.map((url, i) => (
                      <img key={i} src={url} alt="After" className="w-16 h-16 rounded-xl object-cover border border-[var(--border-light)] border-dark" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Chat */}
          {order.workerName && order.status !== 'cancelled' && order.status !== 'completed' && (
            <motion.button onClick={() => navigate(`/chat/${order.id}`)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 mb-2" style={{ background: '#E8F8FA', color: '#2BC5D4' }}>
              <MessageCircle className="w-4 h-4" /> Chat with {isCustomer ? 'Worker' : 'Customer'}
            </motion.button>
          )}

          {/* Live Support */}
          <motion.button onClick={() => navigate('/support-chat')} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 mb-2 bg-white card-bg border border-[var(--border-light)] border-dark"
            style={{ color: 'var(--text-secondary)' }}>
            <MessageCircle className="w-4 h-4" style={{ color: '#8B5CF6' }} /> Live Support
          </motion.button>

          {/* SOS Button (active orders only) */}
          {order.status !== 'completed' && order.status !== 'cancelled' && (
            <motion.button onClick={() => setShowSOS(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 mb-2"
              style={{ background: '#FEF2F2', color: '#EF4444' }}>
              <AlertTriangle className="w-4 h-4" /> Emergency / SOS
            </motion.button>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {isCustomer && order.status === 'searching_worker' && (
              <motion.button onClick={() => setShowCancel(true)} whileTap={{ scale: 0.98 }} className="w-full py-3.5 rounded-2xl text-sm font-bold" style={{ background: '#FEF2F2', color: '#EF4444' }}><Ban className="w-4 h-4 inline mr-1" /> Cancel Order</motion.button>
            )}
            {order.status === 'completed' && !order.workerRating && isCustomer && (
              <motion.button onClick={() => setShowRating(true)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="w-full py-3.5 btn-cyan flex items-center justify-center gap-2 rounded-2xl"><Star className="w-4 h-4" /> Rate Worker</motion.button>
            )}
            {order.status === 'completed' && order.customerRating && isCustomer && (
              <div className="p-4 rounded-2xl" style={{ background: '#ECFDF5' }}>
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= (order.customerRating || 0) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />)}
                  <span className="text-xs font-bold ml-1" style={{ color: '#F59E0B' }}>{order.customerRating}.0</span>
                </div>
                {order.customerReview && <p className="text-xs font-medium text-center mb-1" style={{ color: 'var(--text-secondary)' }}>"{order.customerReview}"</p>}
                <p className="text-xs font-semibold text-center" style={{ color: '#10B981' }}>Your review submitted!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal isOpen={showRating} onClose={() => setShowRating(false)} onSubmit={handleRate}
        title={isCustomer ? 'Rate Your Worker' : 'Rate Your Customer'}
        subtitle={isCustomer ? order.workerName || 'Worker' : order.customerName || 'Customer'} />

      {/* Cancel Reason Modal */}
      <AnimatePresence>
        {showCancel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancel(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md mx-4 mb-4 md:mb-0 bg-white card-bg rounded-3xl p-6 shadow-2xl">
              <div className="w-12 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-center mb-1" style={{ color: 'var(--text)' }}>Cancel Order</h3>
              <p className="text-sm text-center mb-4" style={{ color: 'var(--text-muted)' }}>Please tell us why</p>
              <div className="space-y-2 mb-4">
                {CANCEL_REASONS.map(r => (
                  <button key={r} onClick={() => setCancelReason(r)}
                    className={`w-full p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2 transition-all ${cancelReason === r ? 'border-[1.5px] border-[#2BC5D4] bg-[#E8F8FA] dark:bg-[#1A353A]' : 'border border-[var(--border-light)] border-dark bg-white card-bg'}`}>
                    <div className={`w-4 h-4 rounded-full border-2 ${cancelReason === r ? 'border-[#2BC5D4] bg-[#2BC5D4]' : 'border-[var(--border)]'}`} />
                    {r}
                  </button>
                ))}
                {cancelReason === 'Other' && (
                  <input value={customReason} onChange={e => setCustomReason(e.target.value)} placeholder="Please specify..."
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border-[1.5px] border-[var(--border)] border-dark focus:border-[#2BC5D4] outline-none bg-white card-bg-deep" />
                )}
              </div>
              <div className="flex gap-3">
                <motion.button onClick={() => setShowCancel(false)} whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold border border-[var(--border)] bg-white card-bg" style={{ color: 'var(--text-secondary)' }}>Keep Order</motion.button>
                <motion.button onClick={handleCancel} whileTap={{ scale: 0.98 }} disabled={!cancelReason}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)', opacity: cancelReason ? 1 : 0.4 }}>
                  <Ban className="w-4 h-4" /> Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SOS Modal */}
      <AnimatePresence>
        {showSOS && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div className="absolute inset-0 bg-red-900/40 backdrop-blur-sm" onClick={() => setShowSOS(false)} />
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-sm mx-4 bg-white card-bg rounded-3xl p-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-black text-center mb-1" style={{ color: '#EF4444' }}>Emergency Alert</h3>
              <p className="text-sm text-center mb-4" style={{ color: 'var(--text-muted)' }}>This will notify admin immediately</p>
              <textarea value={sosMessage} onChange={e => setSosMessage(e.target.value)} placeholder="Describe your emergency (optional)..." rows={3}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border-[1.5px] border-red-200 dark:border-red-800 focus:border-red-500 outline-none mb-4 bg-white card-bg-deep" />
              <div className="flex gap-3">
                <motion.button onClick={() => setShowSOS(false)} whileTap={{ scale: 0.95 }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold border border-[var(--border)] bg-white card-bg" style={{ color: 'var(--text-secondary)' }}>Cancel</motion.button>
                <motion.button onClick={handleSOS} whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}>
                  <AlertTriangle className="w-4 h-4" /> Send Alert
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Sheet */}
      <AnimatePresence>
        {showShareSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowShareSheet(false)} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md mx-4 mb-4 md:mb-0 bg-white card-bg rounded-3xl p-6 shadow-2xl">
              <div className="w-12 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-black text-center mb-4" style={{ color: 'var(--text)' }}>Share Invoice</h3>
              <div className="space-y-2">
                <motion.button onClick={handleShare} whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)', color: 'white' }}>
                  <Share2 className="w-4 h-4" /> Share
                </motion.button>
                <motion.button onClick={() => setShowShareSheet(false)} whileTap={{ scale: 0.95 }}
                  className="w-full py-3 rounded-2xl text-sm font-bold border border-[var(--border)] bg-white card-bg" style={{ color: 'var(--text-secondary)' }}>Cancel</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
