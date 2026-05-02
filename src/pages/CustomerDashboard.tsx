import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Package, ShoppingCart, Home as HomeIcon, Truck, Search, Bell, Plus, Clock, Star, ArrowRight, Zap } from 'lucide-react';
import { STATUS_LABELS } from '@/types';

const services = [
  { id: 'delivery', name: 'Delivery', desc: 'Fast delivery anywhere', icon: Package, color: '#2BC5D4', bg: '#E8F8FA', img: '/images/delivery.png' },
  { id: 'shopping', name: 'Shopping', desc: 'Shop from local stores', icon: ShoppingCart, color: '#10B981', bg: '#ECFDF5', img: '/images/shopping.png' },
  { id: 'cleaning', name: 'Cleaning', desc: 'Professional cleaning', icon: HomeIcon, color: '#8B5CF6', bg: '#F5F3FF', img: '/images/cleaning.png' },
  { id: 'moving', name: 'Moving', desc: 'Hassle-free transport', icon: Truck, color: '#EC4899', bg: '#FDF2F8', img: '/images/moving.png' },
];

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { orders, refreshOrders } = useOrders();
  const [showPromo, setShowPromo] = useState(true);

  const { containerRef, PullIndicator, refreshing } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise(r => setTimeout(r, 800));
      refreshOrders();
    },
    disabled: false,
  });

  const myOrders = useMemo(() => orders.filter(o => o.customerId === userProfile?.uid).sort((a, b) => b.createdAt - a.createdAt), [orders, userProfile?.uid]);
  const activeOrders = myOrders.filter(o => !['completed', 'cancelled'].includes(o.status));
  const completedOrders = myOrders.filter(o => o.status === 'completed');

  const greeting = () => { const h = new Date().getHours(); if (h < 12) return 'Good morning'; if (h < 17) return 'Good afternoon'; return 'Good evening'; };

  return (
    <div ref={containerRef} className="min-h-screen relative overflow-y-auto" style={{ background: 'var(--bg)' }}>
      <PullIndicator />
      {/* Header */}
      <div className="px-6 pt-6 pb-6 rounded-b-[32px] gradient-hero relative overflow-hidden">
        <motion.div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', top: '-40%', right: '-20%' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />

        <div className="relative z-10 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: easeOut }}>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{greeting()}</p>
            <h1 className="text-2xl font-black mt-0.5 text-white tracking-tight">{userProfile?.name?.split(' ')[0] || 'User'}</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <motion.button whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 flex items-center justify-center rounded-full glass relative">
              <Bell className="w-5 h-5 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-400 border border-white/30" />
            </motion.button>
            <motion.div onClick={() => navigate('/profile')} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="w-11 h-11 rounded-full overflow-hidden cursor-pointer border-[2.5px] border-white/30 ring-2 ring-white/10 shadow-lg">
              <img src="/images/c-user.png" alt="avatar" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>

        <motion.div className="mt-5 relative" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, ease: easeOut }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'rgba(255,255,255,0.35)' }} />
          <input type="text" placeholder="Search services..." className="w-full py-3.5 pl-12 pr-4 rounded-2xl text-sm font-medium outline-none text-white placeholder-white/35 transition-all focus:ring-2 focus:ring-white/25 glass" />
        </motion.div>
      </div>

      <div className="px-6 pt-5 space-y-6 max-w-lg mx-auto pb-8">
        {/* Promo Banner */}
        <AnimatePresence>
          {showPromo && (
            <motion.div initial={{ opacity: 0, y: 15, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 100 }}
              className="relative p-5 rounded-3xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #4DD4E0 0%, #2BC5D4 50%, #1BA8B5 100%)' }}>
              <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-[0.1]" style={{ background: 'radial-gradient(circle, white 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="relative z-10 flex items-center gap-3">
                <motion.div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden bg-white/10 backdrop-blur"
                  animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                  <img src="/images/c-mascot.png" alt="BOH" className="w-10 h-10 object-cover" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">First Order Discount!</p>
                  <p className="text-[11px] text-white/60 font-medium">Get 20% off your first service today</p>
                </div>
                <button onClick={() => setShowPromo(false)} className="text-white/40 hover:text-white text-xs font-bold w-6 h-6 rounded-full hover:bg-white/10 transition-all flex items-center justify-center">✕</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services Grid */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, ease: easeOut }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="section-title">Services</h2>
              <p className="section-subtitle">What do you need today?</p>
            </div>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((s, i) => (
            <motion.button key={s.id} onClick={() => navigate('/create-order', { state: { serviceType: s.id } })}
              whileHover={{ scale: 1.04, y: -4, boxShadow: '0 8px 32px rgba(12,25,41,0.08)' }} whileTap={{ scale: 0.96 }}
              className="p-4 rounded-3xl text-left bg-white card-bg border border-[var(--border-light)] border-dark hover:border-[var(--sky-lighter)] dark:hover:border-[#2A555C] transition-all group relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.08, ease: easeOut }}>
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04] transition-transform duration-500 group-hover:scale-[2]" style={{ background: s.color, transform: 'translate(30%, -30%)' }} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110" style={{ background: s.bg }}>
                  <img src={s.img} alt={s.name} className="w-7 h-7 object-contain" />
                </div>
                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.name}</p>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.desc}</p>
                <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold" style={{ color: s.color }}>Order now</span>
                  <ArrowRight className="w-3 h-3" style={{ color: s.color }} />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Active Orders */}
        <div>
          <div className="section-header">
            <div>
              <h2 className="section-title">Active Orders</h2>
              {activeOrders.length === 0 && <p className="section-subtitle">No active orders yet</p>}
            </div>
            {activeOrders.length > 0 && <button onClick={() => navigate('/history')} className="section-link">All <ArrowRight className="w-3.5 h-3.5" /></button>}
          </div>
          {activeOrders.length === 0 ? (
            <motion.div className="p-6 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate('/create-order')} whileHover={{ scale: 1.01, y: -2 }} whileTap={{ scale: 0.98 }}>
              <motion.div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 border-2 border-[var(--border-light)]"
                animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
                <img src="/images/c-empty.png" alt="No orders" className="w-full h-full object-cover" />
              </motion.div>
              <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>No active orders</p>
              <p className="text-[11px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>Tap to place your first order</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order, i) => {
                const st = STATUS_LABELS[order.status];
                return (
                  <motion.button key={order.id} onClick={() => navigate(`/track/${order.id}`)}
                    whileHover={{ scale: 1.01, x: 3, boxShadow: '0 4px 16px rgba(12,25,41,0.06)' }}
                    className="w-full p-4 rounded-2xl text-left bg-white card-bg border border-[var(--border-light)] border-dark hover:border-[var(--sky-lighter)] dark:hover:border-[#2A555C] transition-all"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                      <span className="text-sm font-black" style={{ color: 'var(--sky)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--sky)' }} />{order.distance} km
                      <span style={{ color: 'var(--border)' }}>|</span>
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />{new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </div>
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
                <motion.button key={order.id} onClick={() => navigate(`/track/${order.id}`)}
                  whileHover={{ scale: 1.01, x: 3 }}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl text-left bg-white card-bg border border-[var(--border-light)] border-dark hover:border-[var(--sky-lighter)] dark:hover:border-[#2A555C] transition-all"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ECFDF5' }}>
                    <Star className="w-4 h-4" style={{ color: '#10B981' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'var(--text)' }}>{order.pickupAddress}</p>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                  </div>
                  <span className="text-sm font-black" style={{ color: '#10B981' }}>₺{order.price.toLocaleString('tr-TR')}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
