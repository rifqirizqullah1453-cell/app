import { useState, useEffect, type ReactNode, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ChatProvider } from './contexts/ChatContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import './i18n';
import { useSmoothScroll } from './components/SmoothScroll';
import SplashScreen from './components/SplashScreen';
import { useSoundAlert } from './hooks/useSoundAlert';
import { useOrders } from './contexts/OrderContext';

// Direct imports (no lazy) for reliability on mobile Safari
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateOrder from './pages/CreateOrder';
import TrackOrder from './pages/TrackOrder';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import ChatRoom from './pages/ChatRoom';
import WorkerProfile from './pages/WorkerProfile';
import Invoice from './pages/Invoice';
import SupportChat from './pages/SupportChat';
import SetupGuide from './pages/SetupGuide';
import Layout from './components/Layout';

function ErrorFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24, background: 'var(--bg)', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 320 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 28 }}>⚠️</div>
        <h1 style={{ fontSize: 18, fontWeight: 900, color: '#2BC5D4', marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Please try reloading the page.</p>
        <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg,#4DD4E0,#2BC5D4)', color: 'white', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Reload</button>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { userProfile, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: '#2BC5D4', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    </div>
  );
  if (!userProfile) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userProfile.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppInner() {
  const [showSplash, setShowSplash] = useState(true);
  const [hasError, setHasError] = useState(false);
  useSmoothScroll();
  const { isDark } = useTheme();
  const { orders } = useOrders();
  const { alertNewOrder } = useSoundAlert();
  const prevOrderCount = useRef(0);
  const { isWorker } = useAuth();

  useEffect(() => {
    const handler = (e: ErrorEvent) => {
      console.error('App error:', e.error);
      setHasError(true);
    };
    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  // Sound alert for new orders (worker only)
  useEffect(() => {
    if (!isWorker) return;
    const availableCount = orders.filter(o => o.status === 'searching_worker').length;
    if (availableCount > 0 && availableCount > prevOrderCount.current) {
      alertNewOrder();
    }
    prevOrderCount.current = availableCount;
  }, [orders, isWorker, alertNewOrder]);

  if (showSplash) {
    return (
      <ToastProvider>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </ToastProvider>
    );
  }

  if (hasError) return <ErrorFallback />;

  return (
    <ToastProvider>
      <ChatProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/customer" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/worker" element={<ProtectedRoute allowedRoles={['worker']}><WorkerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/create-order" element={<ProtectedRoute allowedRoles={['customer']}><CreateOrder /></ProtectedRoute>} />
            <Route path="/track/:orderId" element={<ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}><TrackOrder /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}><OrderHistory /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/chat/:orderId" element={<ProtectedRoute allowedRoles={['customer', 'worker']}><ChatRoom /></ProtectedRoute>} />
            <Route path="/support-chat" element={<ProtectedRoute><SupportChat /></ProtectedRoute>} />
            <Route path="/worker/:workerId" element={<ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}><WorkerProfile /></ProtectedRoute>} />
            <Route path="/invoice/:orderId" element={<ProtectedRoute allowedRoles={['customer', 'worker', 'admin']}><Invoice /></ProtectedRoute>} />
            <Route path="/setup-guide" element={<SetupGuide />} />
          </Route>
        </Routes>
      </ChatProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
