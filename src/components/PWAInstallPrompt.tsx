import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('boh_pwa_dismissed') === '1';
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) {
        setTimeout(() => setShow(true), 2000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('boh_pwa_dismissed', '1');
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-20 left-4 right-4 z-[60] max-w-lg mx-auto"
      >
        <div className="p-4 rounded-2xl bg-white dark:bg-[#152B2F] border border-[var(--border-light)] dark:border-[#1E3D42] shadow-xl flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#E8F8FA' }}>
            <Smartphone className="w-5 h-5" style={{ color: '#2BC5D4' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Install Boh-Hizmet</p>
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Add to home screen for quick access</p>
          </div>
          <motion.button
            onClick={handleInstall}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 shrink-0"
            style={{ background: 'linear-gradient(135deg, #4DD4E0, #2BC5D4)' }}
          >
            <Download className="w-3.5 h-3.5" /> Install
          </motion.button>
          <button onClick={handleDismiss} className="p-1.5 rounded-lg hover:bg-[var(--bg)] shrink-0">
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
