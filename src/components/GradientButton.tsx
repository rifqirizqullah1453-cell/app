import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GradientButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

export default function GradientButton({ children, onClick, disabled = false, className = '', variant = 'primary', size = 'md', icon }: GradientButtonProps) {
  const sizeClasses = {
    sm: 'py-2.5 px-4 text-xs',
    md: 'py-3.5 px-6 text-sm',
    lg: 'py-4 px-8 text-sm',
  };

  const variants = {
    primary: 'btn-grad',
    danger: 'bg-red-500 text-white font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:scale-95',
    ghost: 'btn-ghost',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`${variants[variant]} ${sizeClasses[size]} flex items-center justify-center gap-2 rounded-2xl transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      {icon}
      {children}
    </motion.button>
  );
}
