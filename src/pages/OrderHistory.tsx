import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Package, Calendar, Star, MapPin, Navigation, Search, X, Filter, RotateCcw } from 'lucide-react';
import { STATUS_LABELS, SERVICE_LABELS, SERVICE_CATEGORIES } from '@/types';
import type { ServiceType } from '@/types';

type FilterTab = 'all' | 'active' | 'completed' | 'cancelled';

export default function OrderHistory() {
  const navigate = useNavigate();
  const { userProfile, isCustomer, isWorker } = useAuth();
  const { orders, createOrder } = useOrders();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [reorderingId, setReorderId] = useState<string | null>(null);

  const myOrders = useMemo(() => orders.filter(o => { if (isCustomer) return o.customerId === userProfile?.uid; if (isWorker) return o.workerId === userProfile?.uid; return true; }).sort((a, b) => b.createdAt - a.createdAt), [orders, userProfile, isCustomer, isWorker]);

  const filtered = useMemo(() => {
    let result = myOrders;
    if (activeFilter === 'active') result = result.filter(o => !['completed', 'cancelled'].includes(o.status));
    else if (activeFilter === 'completed') result = result.filter(o => o.status === 'completed');
    else if (activeFilter === 'cancelled') result = result.filter(o => o.status === 'cancelled');
    if (serviceFilter !== 'all') result = result.filter(o => o.serviceType === serviceFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.pickupAddress.toLowerCase().includes(q) ||
        o.destinationAddress.toLowerCase().includes(q) ||
        o.customerName?.toLowerCase().includes(q) ||
        o.workerName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [myOrders, activeFilter, serviceFilter, searchQuery]);

  const counts = { all: myOrders.length, active: myOrders.filter(o => !['completed', 'cancelled'].includes(o.status)).length, completed: myOrders.filter(o => o.status === 'completed').length, cancelled: myOrders.filter(o => o.status === 'cancelled').length };
  const tabs = [
    { key: 'all' as FilterTab, label: 'All', gradient: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' },
    { key: 'active' as FilterTab, label: 'Active', gradient: 'linear-gradient(135deg, #FB923C, #F59E0B)' },
    { key: 'completed' as FilterTab, label: 'Done', gradient: 'linear-gradient(135deg, #34D399, #10B981)' },
    { key: 'cancelled' as FilterTab, label: 'Cancelled', gradient: 'linear-gradient(135deg, #FB7185, #EF4444)' },
  ];

  const handleReorder = async (order: typeof myOrders[0]) => {
    if (!isCustomer) { toast('Only customers can reorder', 'error'); return; }
    setReorderId(order.id);
    try {
      const newId = await createOrder({
        serviceType: order.serviceType,
        pickupAddress: order.pickupAddress,
        pickupLat: order.pickupLat,
        pickupLng: order.pickupLng,
        destinationAddress: order.destinationAddress,
        destinationLat: order.destinationLat,
        destinationLng: order.destinationLng,
        notes: order.notes,
        stops: order.stops,
        price: order.price,
      });
      toast('Order placed again!', 'success');
      navigate(`/track/${newId}`);
    } catch {
      toast('Failed to reorder', 'error');
    } finally {
      setReorderId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-white card-bg border-b border-[var(--border-light)] border-dark">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-semibold mb-4 hover:text-[#2BC5D4] transition-colors" style={{ color: 'var(--text-muted)' }}>
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>Order History</h1>
        <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-muted)' }}>{myOrders.length} orders total</p>
      </div>

      <div className="px-5 pt-4 max-w-lg mx-auto pb-8">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search orders, addresses, names..."
            className="w-full pl-9 pr-10 py-2.5 text-sm font-medium rounded-xl border-[1.5px] border-[var(--border)] focus:border-[#2BC5D4] outline-none transition-all" style={{ background: 'var(--bg)' }} />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--border-light)]">
              <X className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <motion.button onClick={() => setShowFilters(!showFilters)} whileTap={{ scale: 0.98 }}
          className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-3 bg-white card-bg border border-[var(--border-light)] border-dark"
          style={{ color: 'var(--text-secondary)' }}>
          <Filter className="w-3.5 h-3.5" /> {showFilters ? 'Hide Filters' : 'More Filters'}
        </motion.button>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-3">
              <p className="text-[10px] font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>Service Type</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setServiceFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${serviceFilter === 'all' ? 'bg-[#2BC5D4] text-white' : 'bg-white card-bg border border-[var(--border-light)] border-dark text-[var(--text-muted)]'}`}>
                  All
                </button>
                {SERVICE_CATEGORIES.map(s => (
                  <button key={s.id} onClick={() => setServiceFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${serviceFilter === s.id ? 'text-white' : 'bg-white card-bg border border-[var(--border-light)] border-dark text-[var(--text-muted)]'}`}
                    style={serviceFilter === s.id ? { background: s.color } : {}}>
                    {s.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <motion.button key={tab.key} onClick={() => setActiveFilter(tab.key)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-xl text-[11px] font-bold shrink-0 transition-all border-[1.5px]"
              style={{
                background: activeFilter === tab.key ? tab.gradient : 'white',
                color: activeFilter === tab.key ? 'white' : 'var(--text-muted)',
                borderColor: activeFilter === tab.key ? 'transparent' : 'var(--border)'
              }}>
              {tab.label} {counts[tab.key] > 0 && `(${counts[tab.key]})`}
            </motion.button>
          ))}
        </div>

        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div className="p-8 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <img src="/images/c-empty.png" alt="empty" className="w-24 h-24 mx-auto mb-3 object-contain opacity-50" />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No orders found</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filtered.map((order, i) => {
                const st = STATUS_LABELS[order.status];
                const canReorder = order.status === 'completed' && isCustomer;
                return (
                  <motion.div key={order.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                    onClick={() => navigate(`/track/${order.id}`)}
                    className="bg-white card-bg rounded-2xl p-4 border border-[var(--border-light)] border-dark cursor-pointer hover:shadow-md transition-all active:scale-[0.98]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{SERVICE_LABELS[order.serviceType]}</span>
                      </div>
                      <span className="text-lg font-black" style={{ color: 'var(--sky)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'var(--sky)' }} /><span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{order.pickupAddress}</span></div>
                      <div className="flex items-start gap-2"><Navigation className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} /><span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{order.destinationAddress}</span></div>
                    </div>
                    <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border-light)' }}>
                      <div className="flex items-center gap-2 text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                        <Package className="w-3 h-3" />{order.id}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.customerRating && <div className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /><span className="text-[10px] font-bold">{order.customerRating}</span></div>}
                        <span className="text-[10px] font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}><Calendar className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {/* Quick Reorder */}
                    {canReorder && (
                      <motion.button
                        onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                        whileTap={{ scale: 0.97 }}
                        disabled={reorderingId === order.id}
                        className="w-full mt-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-[var(--border-light)] hover:border-[#2BC5D4] hover:bg-[#E8F8FA] transition-all"
                        style={{ color: 'var(--text-secondary)' }}>
                        {reorderingId === order.id ? (
                          <motion.div className="w-3.5 h-3.5 border-[2px] border-[var(--border)] border-t-[#2BC5D4] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
                        ) : <><RotateCcw className="w-3.5 h-3.5" /> Reorder</>}
                      </motion.button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
