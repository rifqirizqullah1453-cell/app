import { useMemo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Hand, Power, Bell, ArrowRight, Package, CheckCircle, Wallet, MessageCircle } from 'lucide-react';
import { STATUS_LABELS, SERVICE_LABELS } from '@/types';

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function WorkerDashboard() {
  const navigate = useNavigate();
  const { userProfile, updateUserProfile } = useAuth();
  const { orders, acceptOrder, updateWorkerLocation, refreshOrders } = useOrders();
  const { toast } = useToast();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const { containerRef, PullIndicator, refreshing } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise(r => setTimeout(r, 800));
      refreshOrders();
    },
    disabled: false,
  });

  const myOrders = useMemo(() => orders.filter(o => o.workerId === userProfile?.uid || o.status === 'searching_worker').sort((a, b) => b.createdAt - a.createdAt), [orders, userProfile?.uid]);
  const activeOrders = myOrders.filter(o => o.workerId === userProfile?.uid && !['completed', 'cancelled'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.workerId === userProfile?.uid && o.status === 'completed');
  const availableOrders = myOrders.filter(o => !o.workerId && o.status === 'searching_worker');
  const totalEarnings = completedOrders.reduce((sum, o) => sum + o.price, 0);

  const toggleOnline = () => { updateUserProfile({ isOnline: !userProfile?.isOnline }); toast(userProfile?.isOnline ? 'You are offline' : 'You are online!', userProfile?.isOnline ? 'info' : 'success'); };
  const handleAccept = async (orderId: string) => {
    if (!userProfile?.isOnline) { toast('Go online first!', 'error'); return; }
    setAcceptingId(orderId);
    try { await acceptOrder(orderId); toast('Order accepted!', 'success'); } catch (err: any) { toast(err.message || 'Failed', 'error'); } finally { setAcceptingId(null); }
  };

  // LIVE GPS TRACKING: Broadcast worker location for active orders
  useEffect(() => {
    if (activeOrders.length === 0) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        activeOrders.forEach((order) => {
          updateWorkerLocation(order.id, lat, lng);
        });
      },
      (err) => {
        console.log('GPS tracking error:', err.message);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [activeOrders.map(o => o.id).join(','), updateWorkerLocation]);

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <PullIndicator />
      {/* Header */}
      <div className="px-6 pt-6 pb-6 rounded-b-[32px] gradient-hero relative overflow-hidden">
        <motion.div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', top: '-40%', right: '-20%' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <div className="relative z-10 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Worker Panel</p>
            <h1 className="text-2xl font-black mt-0.5 text-white tracking-tight">{userProfile?.name?.split(' ')[0] || 'Worker'}</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 flex items-center justify-center rounded-full glass relative">
              <Bell className="w-5 h-5 text-white" />
              {availableOrders.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 border border-white/30" />}
            </motion.button>
            <motion.div onClick={() => navigate('/profile')} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="w-11 h-11 rounded-full overflow-hidden cursor-pointer border-[2.5px] border-white/30 ring-2 ring-white/10 shadow-lg">
              <img src="/images/c-worker.png" alt="avatar" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>

        <motion.div className="flex gap-3 mt-5" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: easeOut }}>
          <motion.div className="flex-1 p-3.5 rounded-2xl glass" whileHover={{ scale: 1.02 }}>
            <div className="flex items-center gap-1.5 mb-1"><Wallet className="w-3.5 h-3.5 text-white/60" /><p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Earnings</p></div>
            <p className="text-lg font-black text-white">₺{totalEarnings.toLocaleString('tr-TR')}</p>
          </motion.div>
          <motion.div className="flex-1 p-3.5 rounded-2xl glass" whileHover={{ scale: 1.02 }}>
            <div className="flex items-center gap-1.5 mb-1"><CheckCircle className="w-3.5 h-3.5 text-white/60" /><p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Completed</p></div>
            <p className="text-lg font-black text-white">{completedOrders.length}</p>
          </motion.div>
        </motion.div>

        {/* Online Toggle */}
        <motion.button onClick={toggleOnline} whileTap={{ scale: 0.97 }}
          className="w-full mt-4 p-4 rounded-3xl flex items-center gap-4 bg-white card-bg border border-[var(--border-light)] border-dark shadow-xl transition-shadow hover:shadow-2xl"
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors" style={{ background: userProfile?.isOnline ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : '#F0F7FF' }}>
            <Power className="w-6 h-6" style={{ color: userProfile?.isOnline ? 'white' : '#B8D4E8' }} />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{userProfile?.isOnline ? 'Online!' : 'Offline'}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{userProfile?.isOnline ? 'Receiving orders now' : 'Go online to start'}</p>
          </div>
          <div className="w-12 h-6 rounded-full relative" style={{ background: userProfile?.isOnline ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : '#CBD5E1' }}>
            <motion.div className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm" animate={{ left: userProfile?.isOnline ? 26 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
          </div>
        </motion.button>
      </div>

      <div className="px-6 pt-5 space-y-6 max-w-lg mx-auto pb-8">
        {/* Available Orders */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div>
              <h2 className="section-title">Available Orders</h2>
              {availableOrders.length > 0 && <p className="section-subtitle">{availableOrders.length} orders waiting</p>}
            </div>
            {availableOrders.length > 0 && (
              <motion.span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg text-white ml-auto" style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>{availableOrders.length}</motion.span>
            )}
          </div>
          {availableOrders.length === 0 ? (
            <div className="p-8 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark">
              <motion.div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3" animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                <img src="/images/c-empty.png" alt="empty" className="w-full h-full object-cover opacity-60" />
              </motion.div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No orders available right now</p>
              <p className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Stay online to receive orders</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {availableOrders.map((order, i) => (
                  <motion.div key={order.id} className="p-5 rounded-3xl bg-white card-bg border border-[var(--border-light)] border-dark overflow-hidden shadow-sm"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 100 }}
                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 300 }} style={{ borderLeft: '3px solid var(--sky)' }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{SERVICE_LABELS[order.serviceType]}</span>
                      <span className="text-base font-black" style={{ color: 'var(--sky)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--sky)' }} />
                      <span className="line-clamp-1">{order.pickupAddress}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <span className="text-[11px] px-3 py-1 rounded-lg font-bold" style={{ background: '#E8F8FA', color: '#2BC5D4' }}>{order.distance} km</span>
                      <span className="text-[11px] px-3 py-1 rounded-lg font-bold" style={{ background: '#F5F3FF', color: '#8B5CF6' }}>{order.customerName}</span>
                    </div>
                    <motion.button onClick={() => handleAccept(order.id)} disabled={acceptingId === order.id}
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full mt-4 py-3.5 btn-cyan flex items-center justify-center gap-2 rounded-2xl" style={{ opacity: acceptingId === order.id ? 0.6 : 1 }}>
                      {acceptingId === order.id ? (
                        <motion.div className="w-4 h-4 border-[2.5px] border-white/40 rounded-full border-t-white" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                      ) : <><Hand className="w-4 h-4" /> Accept Order</>}
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Active Jobs */}
        <div>
          <div className="section-header">
            <div>
              <h2 className="section-title">Active Jobs</h2>
              {activeOrders.length === 0 && <p className="section-subtitle">No active jobs</p>}
            </div>
            {activeOrders.length > 0 && <button onClick={() => navigate('/history')} className="section-link">All <ArrowRight className="w-3.5 h-3.5" /></button>}
          </div>
          {activeOrders.length === 0 ? (
            <div className="p-6 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#E8F8FA' }}><Package className="w-6 h-6" style={{ color: 'var(--sky)' }} /></div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No active jobs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order, i) => {
                const st = STATUS_LABELS[order.status];
                return (
                  <motion.button key={order.id} onClick={() => navigate(`/track/${order.id}`)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.02, x: 4, boxShadow: '0 4px 16px rgba(12,25,41,0.06)' }} className="w-full p-5 rounded-3xl text-left bg-white card-bg border border-[var(--border-light)] border-dark hover:border-[var(--sky-lighter)] dark:hover:border-[#2A555C] transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <span className="text-base font-black" style={{ color: 'var(--sky)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}><span className="font-bold" style={{ color: 'var(--text)' }}>{SERVICE_LABELS[order.serviceType]}</span> · {order.distance} km</div>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); navigate(`/chat/${order.id}`); }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      style={{ background: '#E8F8FA', color: '#2BC5D4' }}
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Chat with Customer
                    </motion.button>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed */}
        {completedOrders.length > 0 && (
          <div>
            <div className="section-header"><h2 className="section-title">Completed</h2><button onClick={() => navigate('/history')} className="section-link">All <ArrowRight className="w-3.5 h-3.5" /></button></div>
            <div className="space-y-3">
              {completedOrders.slice(0, 3).map((order, i) => (
                <motion.button key={order.id} onClick={() => navigate(`/track/${order.id}`)} whileHover={{ scale: 1.02, x: 4 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left bg-white card-bg border border-[var(--border-light)] border-dark hover:border-[var(--sky-lighter)] dark:hover:border-[#2A555C] transition-all"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}><CheckCircle className="w-5 h-5 text-white" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{SERVICE_LABELS[order.serviceType]}</p><p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p></div>
                  <span className="text-sm font-black" style={{ color: '#10B981' }}>+₺{order.price.toLocaleString('tr-TR')}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
