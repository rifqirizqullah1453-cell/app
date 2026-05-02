import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { motion } from 'framer-motion';
import { ChevronLeft, Star, Briefcase, Phone, MapPin } from 'lucide-react';

export default function WorkerProfile() {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const { orders } = useOrders();

  // Get all orders for this worker
  const workerOrders = orders.filter(o => o.workerId === workerId);
  const completedOrders = workerOrders.filter(o => o.status === 'completed');

  // Calculate average rating
  const ratings = completedOrders.map(o => o.customerRating).filter(Boolean) as number[];
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '0.0';

  // Get worker info from first order
  const firstOrder = workerOrders[0];

  if (!firstOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Worker not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-8 bg-white border-b border-[var(--border-light)]">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="p-2 rounded-xl mb-4" style={{ background: '#E8F8FA' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#2BC5D4' }} />
        </motion.button>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 ring-4 ring-[var(--sky-lighter)]">
            <img src="/images/c-worker.png" alt={firstOrder.workerName} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black" style={{ color: 'var(--text)' }}>{firstOrder.workerName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold" style={{ color: '#F59E0B' }}>{avgRating}</span>
              </div>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>({ratings.length} reviews)</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="text-center p-3 rounded-2xl" style={{ background: '#E8F8FA' }}>
            <p className="text-lg font-black" style={{ color: '#2BC5D4' }}>{completedOrders.length}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>Jobs Done</p>
          </div>
          <div className="text-center p-3 rounded-2xl" style={{ background: '#FEF3C7' }}>
            <p className="text-lg font-black" style={{ color: '#F59E0B' }}>{workerOrders.length}</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>Total Orders</p>
          </div>
          <div className="text-center p-3 rounded-2xl" style={{ background: '#ECFDF5' }}>
            <p className="text-lg font-black" style={{ color: '#10B981' }}>{Math.round((completedOrders.length / (workerOrders.length || 1)) * 100)}%</p>
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--text-muted)' }}>Completion</p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="px-5 py-4 bg-white border-b border-[var(--border-light)]">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Contact</h2>
        <motion.a href={`tel:${firstOrder.workerPhone}`} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#E8F8FA' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}>
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Phone</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{firstOrder.workerPhone}</p>
          </div>
        </motion.a>
      </div>

      {/* Reviews */}
      <div className="px-5 py-4">
        <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--text-secondary)' }}>Reviews</h2>
        {completedOrders.length === 0 && (
          <p className="text-sm font-medium text-center py-8" style={{ color: 'var(--text-muted)' }}>No reviews yet</p>
        )}
        <div className="space-y-3">
          {completedOrders.filter(o => o.customerRating).map((order) => (
            <motion.div key={order.id} whileHover={{ scale: 1.01 }}
              className="p-4 rounded-2xl bg-white border border-[var(--border-light)]">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="w-3.5 h-3.5" fill={s <= (order.customerRating || 0) ? '#F59E0B' : '#E2E8F0'} stroke="none" />
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: '#F59E0B' }}>{order.customerRating}.0</span>
              </div>
              {order.customerReview && (
                <p className="text-xs font-medium leading-relaxed mb-2" style={{ color: 'var(--text)' }}>{order.customerReview}</p>
              )}
              <div className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                <MapPin className="w-3 h-3" />
                {order.destinationAddress}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
