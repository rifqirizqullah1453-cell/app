import { useMemo } from 'react';
import { useOrders } from '@/contexts/OrderContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Package, Users, Wallet, Star } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const easeOut = [0.16, 1, 0.3, 1] as const;

export default function AdminAnalytics() {
  const { orders } = useOrders();
  const { allUsers } = useAuth();

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const totalRevenue = orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.price, 0);
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalUsers = allUsers?.length || 0;
    const activeWorkers = allUsers?.filter((u: any) => u.role === 'worker' && u.isOnline).length || 0;
    const avgRating = 4.7;
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;

    return { totalOrders, completedOrders, totalRevenue, cancelledOrders, totalUsers, activeWorkers, avgRating, completionRate };
  }, [orders, allUsers]);

  const last7Days = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('tr-TR', { weekday: 'short' }));
    }
    return days;
  }, []);

  const ordersByDay = useMemo(() => {
    return last7Days.map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      return orders.filter(o => o.createdAt >= start && o.createdAt < end).length;
    });
  }, [orders, last7Days]);

  const revenueByDay = useMemo(() => {
    return last7Days.map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const end = start + 86400000;
      return orders
        .filter(o => o.createdAt >= start && o.createdAt < end && o.status === 'completed')
        .reduce((s, o) => s + o.price, 0);
    });
  }, [orders, last7Days]);

  const serviceDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    orders.forEach(o => { dist[o.serviceType] = (dist[o.serviceType] || 0) + 1; });
    return dist;
  }, [orders]);

  const statCards = [
    { label: 'Total Orders', value: stats.totalOrders, icon: Package, color: '#2BC5D4', bg: '#E8F8FA', change: '+12%', up: true },
    { label: 'Revenue', value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`, icon: Wallet, color: '#10B981', bg: '#ECFDF5', change: '+8%', up: true },
    { label: 'Users', value: stats.totalUsers, icon: Users, color: '#8B5CF6', bg: '#F5F3FF', change: '+5%', up: true },
    { label: 'Rating', value: stats.avgRating, icon: Star, color: '#F59E0B', bg: '#FFFBEB', change: '0.2', up: true },
  ];

  const lineChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Orders',
        data: ordersByDay,
        borderColor: '#2BC5D4',
        backgroundColor: 'rgba(43, 197, 212, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2BC5D4',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
      },
    ],
  };

  const revenueChartData = {
    labels: last7Days,
    datasets: [
      {
        label: 'Revenue (₺)',
        data: revenueByDay,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(serviceDistribution).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        data: Object.values(serviceDistribution),
        backgroundColor: ['#2BC5D4', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#152B2F',
        titleColor: '#E0F7F9',
        bodyColor: '#A0D8DE',
        borderColor: '#1E3D42',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94A3B8', font: { size: 10 } },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#94A3B8', font: { size: 11 }, padding: 16, usePointStyle: true },
      },
    },
    cutout: '65%',
  };

  return (
    <div className="space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, ease: easeOut }}
            className="p-4 rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42]"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: card.bg }}>
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold ${card.up ? 'text-emerald-500' : 'text-red-500'}`}>
                {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.change}
              </div>
            </div>
            <p className="text-lg font-black" style={{ color: 'var(--text)' }}>{card.value}</p>
            <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Orders Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, ease: easeOut }}
        className="p-4 rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42]"
      >
        <p className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Orders (7 Days)</p>
        <div className="h-48">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </motion.div>

      {/* Revenue + Distribution */}
      <div className="grid grid-cols-1 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: easeOut }}
          className="p-4 rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42]"
        >
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Revenue (7 Days)</p>
          <div className="h-48">
            <Bar data={revenueChartData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, ease: easeOut }}
          className="p-4 rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42]"
        >
          <p className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>Service Distribution</p>
          <div className="h-48">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </motion.div>
      </div>

      {/* Completion Rate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, ease: easeOut }}
        className="p-4 rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42]"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Completion Rate</p>
          <span className="text-lg font-black" style={{ color: '#10B981' }}>{stats.completionRate}%</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #4DD4E0, #10B981)' }}
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 1, ease: easeOut }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
          <span>{stats.completedOrders} completed</span>
          <span>{stats.cancelledOrders} cancelled</span>
        </div>
      </motion.div>
    </div>
  );
}
