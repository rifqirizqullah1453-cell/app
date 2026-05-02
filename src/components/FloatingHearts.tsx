import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';

export function FloatingHearts({ count = 8 }: { count?: number }) {
  const [hearts] = useState(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    size: 12 + Math.random() * 8,
    color: ['#FF4081', '#E040FB', '#FF5252', '#FFD740', '#4FC3F7'][Math.floor(Math.random() * 5)],
  })));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          className="absolute"
          style={{ left: `${h.x}%`, bottom: -20 }}
          initial={{ y: 0, opacity: 0, scale: 0.5 }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight : 800) - 100],
            opacity: [0, 0.8, 0.8, 0],
            scale: [0.5, 1, 1, 0.5],
            rotate: [0, 15, -15, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill={h.color} stroke="var(--bg-dark)" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ===== FLOATING ACTION BUTTON ===== */
export function FAB({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      className="fixed right-5 z-40 flex items-center justify-center rounded-xl"
      style={{
        bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        width: 56,
        height: 56,
        background: 'linear-gradient(135deg, var(--purple) 0%, var(--blue-dark) 100%)',
        border: '3px solid var(--bg-dark)',
        boxShadow: '4px 4px 0px var(--bg-dark)',
      }}
      whileHover={{ scale: 1.15, y: -4 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.5 }}
    >
      <motion.div
        animate={{ rotate: [0, 90, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Plus className="w-6 h-6 text-white" />
      </motion.div>
      {/* Pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-xl"
        style={{ border: '2px solid var(--purple)' }}
        animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
}
