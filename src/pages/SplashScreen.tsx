import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + 5;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ background: '#C6DE41' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: '#1A1A1A' }}>BOH</h1>
          <p className="text-sm mt-2 font-medium" style={{ color: 'rgba(26,26,26,0.5)' }}>Hizmet</p>
        </motion.div>

        <div className="absolute bottom-20 left-10 right-10">
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: '#1A1A1A' }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
