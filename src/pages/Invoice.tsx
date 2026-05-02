import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import { motion } from 'framer-motion';
import { ChevronLeft, Download, Printer, CheckCircle, Clock, MapPin, Navigation, Phone, FileText, DollarSign, Share2, X, FileDown } from 'lucide-react';
import { STATUS_LABELS, SERVICE_LABELS } from '@/types';
import { shareInvoice } from '@/utils/share';
import { downloadInvoicePDF } from '@/utils/pdf';

export default function Invoice() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { orders, markPaid } = useOrders();
  const { toast } = useToast();
  const [justPaid, setJustPaid] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Invoice not found</p>
      </div>
    );
  }

  const st = STATUS_LABELS[order.status];
  const handlePay = () => {
    markPaid(order.id);
    setJustPaid(true);
    setTimeout(() => setJustPaid(false), 3000);
  };

  const handleShare = async () => {
    const result = await shareInvoice(order.id, order.price, order.paymentMethod);
    if (result === true) toast('Invoice shared!', 'success');
    else if (result === 'copied') toast('Copied to clipboard!', 'success');
    else toast('Sharing not available', 'info');
    setShowShare(false);
  };

  const handleDownloadPDF = () => {
    downloadInvoicePDF({
      orderId: order.id,
      serviceType: SERVICE_LABELS[order.serviceType],
      customerName: order.customerName || 'Customer',
      workerName: order.workerName || undefined,
      pickupAddress: order.pickupAddress,
      destinationAddress: order.destinationAddress,
      price: order.price,
      discount: order.discountAmount || undefined,
      distance: order.distance || undefined,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      date: new Date(order.createdAt).toLocaleDateString('tr-TR'),
      notes: order.notes || undefined,
    });
    toast('Invoice PDF downloaded!', 'success');
  };

  const formatDate = (ts?: number) => ts ? new Date(ts).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
  const formatTime = (ts?: number) => ts ? new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : '-';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 bg-white card-bg border-b border-[var(--border-light)] border-dark flex items-center gap-3">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)}
          className="p-2 rounded-xl" style={{ background: '#E8F8FA' }}>
          <ChevronLeft className="w-5 h-5" style={{ color: '#2BC5D4' }} />
        </motion.button>
        <div className="flex-1">
          <h1 className="text-lg font-black" style={{ color: 'var(--text)' }}>Invoice</h1>
          <p className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{order.id}</p>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowShare(true)}
          className="p-2.5 rounded-xl" style={{ background: '#E8F8FA' }}>
          <Share2 className="w-5 h-5" style={{ color: '#2BC5D4' }} />
        </motion.button>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6 space-y-4">
        {/* Invoice Card */}
        <div className="bg-white card-bg rounded-3xl p-6 border border-[var(--border-light)] shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-light)]">
            <div>
              <h2 className="text-xl font-black" style={{ color: '#2BC5D4' }}>Boh-Hizmet</h2>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>Bartin, Turkey</p>
            </div>
            <div className="text-right">
              <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
              <p className="text-[10px] font-bold mt-1" style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</p>
            </div>
          </div>

          {/* Customer & Worker */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2BC5D4' }} />
              <div>
                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Customer</p>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{order.customerName}</p>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{order.customerPhone}</p>
              </div>
            </div>
            {order.workerName && (
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#10B981' }} />
                <div>
                  <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Worker</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{order.workerName}</p>
                  <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{order.workerPhone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Locations */}
          <div className="space-y-2 mb-6 p-4 rounded-2xl" style={{ background: 'var(--bg)' }}>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#2BC5D4' }} />
              <div>
                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Pickup</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{order.pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Navigation className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#F59E0B' }} />
              <div>
                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Destination</p>
                <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>{order.destinationAddress}</p>
              </div>
            </div>
          </div>

          {/* Service */}
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4" style={{ color: '#2BC5D4' }} />
            <p className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>{SERVICE_LABELS[order.serviceType]}</p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 mb-4 pt-4" style={{ borderTop: '1px solid var(--border-light)' }}>
            <div className="flex justify-between">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Service Fee</span>
              <span className="text-xs font-bold" style={{ color: 'var(--text)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
            </div>
            {order.discountAmount && order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-xs font-medium" style={{ color: '#10B981' }}>Discount ({order.promoCode})</span>
                <span className="text-xs font-bold" style={{ color: '#10B981' }}>-₺{order.discountAmount.toLocaleString('tr-TR')}</span>
              </div>
            )}
            <div className="flex justify-between pt-2" style={{ borderTop: '1px dashed var(--border)' }}>
              <span className="text-sm font-black" style={{ color: 'var(--text)' }}>Total</span>
              <span className="text-lg font-black" style={{ color: '#2BC5D4' }}>
                ₺{(order.price - (order.discountAmount || 0)).toLocaleString('tr-TR')}
              </span>
            </div>
          </div>

          {/* Payment Status */}
          <div className={`p-3 rounded-xl flex items-center gap-2 mb-4 ${order.paymentStatus === 'paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
            {order.paymentStatus === 'paid' ? (
              <><CheckCircle className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold text-emerald-600">Paid at {formatTime(order.paidAt)}</span></>
            ) : (
              <><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-amber-600">Payment Pending — {order.paymentMethod?.toUpperCase() || 'COD'}</span></>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {order.paymentStatus !== 'paid' && (
              <motion.button
                onClick={handlePay}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
              >
                <CheckCircle className="w-4 h-4" /> Mark as Paid
              </motion.button>
            )}
            <motion.button
              onClick={handleDownloadPDF}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 rounded-2xl text-xs font-bold text-white flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
            >
              <FileDown className="w-4 h-4" /> Download PDF
            </motion.button>
            <motion.button
              onClick={() => window.print()}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 rounded-2xl text-xs font-bold border-[1.5px] border-[var(--border)] bg-white card-bg flex items-center gap-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Printer className="w-4 h-4" /> Print
            </motion.button>
          </div>

          {justPaid && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-center mt-3 text-emerald-600">
              Payment recorded successfully!
            </motion.p>
          )}
        </div>

        {/* Notes */}
        {order.notes && (
          <div className="bg-white card-bg rounded-2xl p-4 border border-[var(--border-light)] border-dark">
            <p className="text-[10px] font-bold uppercase mb-1" style={{ color: 'var(--text-muted)' }}>Notes</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{order.notes}</p>
          </div>
        )}

        {/* Cancel Reason */}
        {order.cancelReason && (
          <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
            <p className="text-[10px] font-bold uppercase mb-1 text-red-400">Cancellation Reason</p>
            <p className="text-xs font-medium text-red-600">{order.cancelReason}</p>
            {order.cancelledBy && <p className="text-[10px] text-red-400 mt-1">by {order.cancelledBy}</p>}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShare && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowShare(false)} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md mx-4 mb-4 md:mb-0 bg-white card-bg rounded-3xl p-6 shadow-2xl">
            <div className="w-12 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-center mb-4" style={{ color: 'var(--text)' }}>Share Invoice</h3>
            <div className="space-y-2">
              <motion.button onClick={handleShare} whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)', color: 'white' }}>
                <Share2 className="w-4 h-4" /> Share Invoice
              </motion.button>
              <motion.button onClick={() => setShowShare(false)} whileTap={{ scale: 0.95 }}
                className="w-full py-3 rounded-2xl text-sm font-bold border border-[var(--border)] bg-white card-bg" style={{ color: 'var(--text-secondary)' }}>Cancel</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
