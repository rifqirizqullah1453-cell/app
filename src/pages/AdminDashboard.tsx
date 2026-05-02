import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useToast } from '@/contexts/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Activity, Star, Bell, TrendingUp, Users, ArrowRight, Calendar, CheckCircle, XCircle, ShieldCheck, Briefcase, Ban, UserCheck, UserX } from 'lucide-react';
import { STATUS_LABELS, SERVICE_LABELS } from '@/types';
import type { UserProfile } from '@/types';
import AdminAnalytics from '@/components/AdminAnalytics';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const easeOut = [0.16, 1, 0.3, 1] as const;

function loadAllUsers(): UserProfile[] {
  try {
    const stored = localStorage.getItem('boh_users_v2');
    if (stored) {
      const users = JSON.parse(stored);
      return Object.values(users).map((u: any) => u.profile).filter(Boolean);
    }
  } catch {}
  return [];
}

function saveUserStatus(email: string, status: string, value: boolean) {
  try {
    const stored = localStorage.getItem('boh_users_v2');
    if (!stored) return;
    const users = JSON.parse(stored);
    if (!users[email]) return;
    if (status === 'approved') users[email].profile.workerStatus = value ? 'approved' : 'rejected';
    if (status === 'suspended') users[email].profile.suspended = value;
    localStorage.setItem('boh_users_v2', JSON.stringify(users));
  } catch {}
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { orders } = useOrders();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'workers' | 'users'>('overview');
  const [allUsers, setAllUsers] = useState<UserProfile[]>(loadAllUsers());

  const refreshUsers = () => setAllUsers(loadAllUsers());

  const handleApprove = (email: string, approve: boolean) => {
    saveUserStatus(email, 'approved', approve);
    refreshUsers();
    toast(approve ? 'Worker approved!' : 'Worker rejected.', 'success');
  };

  const handleSuspend = (email: string, suspend: boolean) => {
    saveUserStatus(email, 'suspended', suspend);
    refreshUsers();
    toast(suspend ? 'User suspended.' : 'User unsuspended.', 'info');
  };

  const stats = useMemo(() => ({
    total: orders.length, active: orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'completed').length,
    revenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.price, 0),
    avgRating: orders.filter(o => o.workerRating).length > 0 ? (orders.filter(o => o.workerRating).reduce((s, o) => s + (o.workerRating || 0), 0) / orders.filter(o => o.workerRating).length) : 0,
  }), [orders]);
  const recentOrders = useMemo(() => [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5), [orders]);
  const statusDist = useMemo(() => { const d: Record<string, number> = {}; orders.forEach(o => { d[o.status] = (d[o.status] || 0) + 1; }); return d; }, [orders]);
  const statusOrder = ['searching_worker', 'worker_found', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled'];

  const statCards = [
    { icon: Package, label: 'Total Orders', value: stats.total, gradient: 'linear-gradient(135deg, #4DD4E0 0%, #2BC5D4 100%)' },
    { icon: Activity, label: 'Active', value: stats.active, gradient: 'linear-gradient(135deg, #FB923C 0%, #F59E0B 100%)' },
    { icon: TrendingUp, label: 'Revenue', value: `₺${stats.revenue.toLocaleString('tr-TR')}`, gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' },
    { icon: Star, label: 'Avg Rating', value: stats.avgRating.toFixed(1), gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)' },
  ];

  const pendingWorkers = allUsers.filter(u => u.role === 'worker' && u.workerStatus === 'pending');
  const approvedWorkers = allUsers.filter(u => u.role === 'worker' && u.workerStatus === 'approved');
  const allCustomers = allUsers.filter(u => u.role === 'customer');

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-6 rounded-b-[32px] gradient-hero relative overflow-hidden">
        <motion.div className="absolute w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', top: '-40%', right: '-20%' }} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity }} />
        <div className="relative z-10 flex items-center justify-between">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin Panel</p>
            <h1 className="text-2xl font-black mt-0.5 text-white tracking-tight">{userProfile?.name || 'Admin'}</h1>
          </motion.div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <motion.button whileHover={{ scale: 1.1, rotate: 10 }} whileTap={{ scale: 0.9 }} className="w-10 h-10 flex items-center justify-center rounded-full glass">
              <Bell className="w-5 h-5 text-white" />
            </motion.button>
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="w-11 h-11 rounded-full overflow-hidden cursor-pointer border-[2.5px] border-white/30 ring-2 ring-white/10 shadow-lg">
              <img src="/images/c-worker.png" alt="avatar" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </div>

      <div className="px-6 pt-5 space-y-6 max-w-lg mx-auto pb-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'overview', label: 'Overview', icon: Package },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'workers', label: 'Workers', icon: Briefcase },
            { key: 'users', label: 'Users', icon: Users },
          ].map(tab => (
            <motion.button key={tab.key} onClick={() => setActiveTab(tab.key as any)} whileTap={{ scale: 0.95 }}
              className="px-4 py-2.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shrink-0"
              style={{
                background: activeTab === tab.key ? 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' : 'white',
                color: activeTab === tab.key ? 'white' : 'var(--text-muted)',
                border: activeTab === tab.key ? 'none' : '1.5px solid var(--border-light)',
              }}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </motion.button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {statCards.map((s, i) => (
                  <motion.div key={s.label} className="p-5 rounded-3xl text-white relative overflow-hidden" style={{ background: s.gradient }}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ scale: 1.02, y: -2 }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.2)' }}><s.icon className="w-5 h-5 text-white" /></div>
                    <p className="text-xl font-black">{s.value}</p>
                    <p className="text-[11px] font-semibold mt-1 text-white/70">{s.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Status Breakdown */}
              <div>
                <h3 className="section-title mb-4">Status Breakdown</h3>
                <div className="p-5 rounded-3xl bg-white card-bg border border-[var(--border-light)] border-dark">
                  {Object.entries(statusDist).length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 opacity-40"><img src="/images/c-empty.png" alt="empty" className="w-full h-full object-cover" /></div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No data yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {statusOrder.filter(st => statusDist[st]).map((status) => {
                        const st = STATUS_LABELS[status as keyof typeof STATUS_LABELS]; if (!st) return null;
                        const count = statusDist[status]; const pct = Math.round((count / orders.length) * 100);
                        return (
                          <div key={status}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold" style={{ color: 'var(--text-secondary)' }}>{st.label}</span>
                              <span className="text-[11px] font-black" style={{ color: st.color }}>{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                              <motion.div className="h-full rounded-full" style={{ background: st.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.2, ease: easeOut }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Orders */}
              <div>
                <div className="section-header"><h3 className="section-title">Recent Orders</h3><button onClick={() => navigate('/history')} className="section-link">All <ArrowRight className="w-3.5 h-3.5" /></button></div>
                <div className="space-y-3">
                  {recentOrders.length === 0 ? (
                    <div className="p-8 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark">
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No orders yet</p>
                    </div>
                  ) : recentOrders.map((order, i) => {
                    const st = STATUS_LABELS[order.status];
                    return (
                      <motion.button key={order.id} onClick={() => navigate(`/track/${order.id}`)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        whileHover={{ scale: 1.01, x: 3 }} className="w-full p-4 rounded-2xl text-left bg-white card-bg border border-[var(--border-light)] border-dark hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                            <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{SERVICE_LABELS[order.serviceType]}</span>
                          </div>
                          <span className="text-sm font-black" style={{ color: 'var(--sky)' }}>₺{order.price.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{order.customerName}</span>
                          <span>{order.distance} km</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminAnalytics />
            </motion.div>
          )}

          {/* WORKERS TAB */}
          {activeTab === 'workers' && (
            <motion.div key="workers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Pending Workers */}
              <div>
                <h3 className="section-title mb-4">Pending Approval ({pendingWorkers.length})</h3>
                {pendingWorkers.length === 0 ? (
                  <div className="p-6 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No pending workers</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingWorkers.map((w, i) => (
                      <motion.div key={w.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-white card-bg border border-[var(--border-light)] border-dark">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden"><img src="/images/c-worker.png" alt="" className="w-full h-full object-cover" /></div>
                          <div className="flex-1">
                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{w.name}</p>
                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{w.email} · {w.phone}</p>
                          </div>
                          <span className="badge" style={{ background: '#FEF3C7', color: '#F59E0B' }}>Pending</span>
                        </div>
                        {w.vehicleType && <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Vehicle: {w.vehicleType}</p>}
                        {w.bio && <p className="text-[11px] font-medium mb-2" style={{ color: 'var(--text-muted)' }}>{w.bio}</p>}
                        <div className="flex gap-2">
                          <motion.button onClick={() => handleApprove(w.email, true)} whileTap={{ scale: 0.95 }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, #34D399, #10B981)' }}>
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </motion.button>
                          <motion.button onClick={() => handleApprove(w.email, false)} whileTap={{ scale: 0.95 }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1" style={{ background: 'linear-gradient(135deg, #FB7185, #EF4444)' }}>
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Approved Workers */}
              <div>
                <h3 className="section-title mb-4">Approved Workers ({approvedWorkers.length})</h3>
                {approvedWorkers.length === 0 ? (
                  <div className="p-6 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No approved workers</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {approvedWorkers.map((w, i) => (
                      <motion.div key={w.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="p-4 rounded-2xl bg-white card-bg border border-[var(--border-light)] border-dark flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden"><img src="/images/c-worker.png" alt="" className="w-full h-full object-cover" /></div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{w.name}</p>
                            <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{w.email} · {w.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge" style={{ background: '#ECFDF5', color: '#10B981' }}>Approved</span>
                          <motion.button onClick={() => handleSuspend(w.email, !w.suspended)} whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg" style={{ background: w.suspended ? '#ECFDF5' : '#FEF2F2' }}>
                            {w.suspended ? <UserCheck className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-red-400" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              <div>
                <h3 className="section-title mb-4">All Users ({allUsers.length})</h3>
                {allUsers.length === 0 ? (
                  <div className="p-6 rounded-3xl text-center bg-white card-bg border border-[var(--border-light)] border-dark">
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>No users found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allUsers.map((u, i) => (
                      <motion.div key={u.uid} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className={`p-4 rounded-2xl bg-white card-bg border ${u.suspended ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-[var(--border-light)] border-dark'}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden"><img src={u.role === 'worker' ? '/images/c-worker.png' : '/images/c-user.png'} alt="" className="w-full h-full object-cover" /></div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{u.name}</p>
                                <span className="badge text-[9px]" style={{ background: u.role === 'admin' ? '#FEF2F2' : u.role === 'worker' ? '#E8F8FA' : '#ECFDF5', color: u.role === 'admin' ? '#EF4444' : u.role === 'worker' ? '#2BC5D4' : '#10B981' }}>{u.role}</span>
                                {u.workerStatus && <span className="badge text-[9px]" style={{ background: u.workerStatus === 'approved' ? '#ECFDF5' : u.workerStatus === 'pending' ? '#FEF3C7' : '#FEF2F2', color: u.workerStatus === 'approved' ? '#10B981' : u.workerStatus === 'pending' ? '#F59E0B' : '#EF4444' }}>{u.workerStatus}</span>}
                              </div>
                              <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{u.email} · {u.phone}</p>
                            </div>
                          </div>
                          <motion.button onClick={() => handleSuspend(u.email, !u.suspended)} whileTap={{ scale: 0.9 }}
                            className="p-2 rounded-lg" style={{ background: u.suspended ? '#ECFDF5' : '#FEF2F2' }}>
                            {u.suspended ? <UserCheck className="w-4 h-4 text-emerald-500" /> : <Ban className="w-4 h-4 text-red-400" />}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
