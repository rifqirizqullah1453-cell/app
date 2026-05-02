import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Home, ClipboardList, UserCircle, Briefcase, ShieldCheck } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';
import PWAInstallPrompt from './PWAInstallPrompt';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile } = useAuth();

  const tabs = useMemo(() => {
    if (!userProfile) return [{ path: '/', label: 'Home', icon: Home }];
    if (userProfile.role === 'worker') return [
      { path: '/worker', label: 'Orders', icon: ClipboardList },
      { path: '/history', label: 'History', icon: Briefcase },
      { path: '/profile', label: 'Profile', icon: UserCircle }
    ];
    if (userProfile.role === 'admin') return [
      { path: '/admin', label: 'Dashboard', icon: ShieldCheck },
      { path: '/history', label: 'Orders', icon: ClipboardList },
      { path: '/profile', label: 'Profile', icon: UserCircle }
    ];
    return [
      { path: '/customer', label: 'Home', icon: Home },
      { path: '/history', label: 'Orders', icon: ClipboardList },
      { path: '/profile', label: 'Profile', icon: UserCircle }
    ];
  }, [userProfile]);

  const isActive = (path: string) => {
    if (path === '/customer' && location.pathname === '/create-order') return true;
    if (path === '/worker' && location.pathname === '/create-order') return true;
    return location.pathname === path;
  };

  const hideNav = ['/login', '/register', '/create-order'].includes(location.pathname) || location.pathname.startsWith('/chat/') || location.pathname.startsWith('/worker/') || location.pathname === '/support-chat';

  if (hideNav) return <Outlet />;

  return (
    <div className="min-h-screen pb-20" style={{ background: 'var(--bg)' }}>
      <PWAInstallPrompt />
      <Outlet />

      <nav className="nav-glass fixed bottom-0 left-0 right-0 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => {
            const active = isActive(tab.path);
            return (
              <motion.button key={tab.path} onClick={() => navigate(tab.path)} whileTap={{ scale: 0.85 }}
                className="flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all relative" style={{ minWidth: 64 }}>
                {active && <motion.div layoutId="activeTab" className="absolute inset-0 rounded-2xl" style={{ background: 'linear-gradient(135deg, #4DD4E0 0%, #2BC5D4 100%)' }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <div className="relative z-10">
                  <tab.icon className="w-5 h-5 transition-colors" style={{ color: active ? 'white' : '#94A3B8' }} />
                </div>
                <span className="relative z-10 text-[10px] font-bold transition-colors" style={{ color: active ? 'white' : '#94A3B8' }}>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
