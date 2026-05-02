import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => { setFadeOut(true); setTimeout(onComplete, 600); }, 400);
          return 100;
        }
        return p + Math.random() * 12 + 8;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!fadeOut && (
        <motion.div
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(160deg, #4DD4E0 0%, #2BC5D4 40%, #1BA8B5 100%)' }}
        >
          {/* Animated background orbs */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', top: '-20%', left: '-30%' }}
            animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', bottom: '-10%', right: '-20%' }}
            animate={{ scale: [1, 1.3, 1], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Logo Böh-Hizmet */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
            className="relative mb-8"
          >
            <div className="w-40 h-40 rounded-3xl overflow-hidden shadow-2xl border-[3px] border-white/20 bg-white/10 backdrop-blur flex items-center justify-center p-4">
              <img src="/images/logo-boh.png" alt="Böh-Hizmet" className="w-full h-full object-contain" />
            </div>
            {/* Ripple ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl border-2 border-white/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-white/60 text-sm font-medium tracking-wide"
          >
            Biz hizmetinizdeyiz
          </motion.p>

          {/* Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-10 w-52"
          >
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.6), white)' }}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <motion.p
                className="text-white/30 text-[10px] font-semibold"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Loading
              </motion.p>
              <p className="text-white/30 text-[10px] font-bold">{Math.min(Math.round(progress), 100)}%</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
