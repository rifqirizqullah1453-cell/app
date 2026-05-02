import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverScale?: number;
  hoverY?: number;
  onClick?: () => void;
}

export default function AnimatedCard({ children, className = '', delay = 0, hoverScale = 1.01, hoverY = -3, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: hoverScale, y: hoverY }}
      whileTap={{ scale: 0.98, y: 0 }}
      onClick={onClick}
      className={`card cursor-pointer ${className}`}
      style={{ willChange: 'transform' }}
    >
      {children}
    </motion.div>
  );
}
