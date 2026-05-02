import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/* ===== FALLING PIXEL PARTICLES (like confetti) ===== */
export function PixelRain({ count = 20, colors = ['#4FC3F7', '#E040FB', '#69F0AE', '#FF4081', '#FFD740', '#64FFDA'] }: { count?: number; colors?: string[] }) {
  const [particles] = useState(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
    size: 4 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
  })));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            border: '1px solid var(--bg-dark)',
          }}
          initial={{ y: -20, opacity: 0, rotate: 0 }}
          animate={{
            y: ['0vh', '120vh'],
            opacity: [0, 1, 1, 0],
            rotate: [0, p.rotation],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

/* ===== FLOATING PIXEL CLOUDS ===== */
export function PixelClouds({ count = 4 }: { count?: number }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute flex gap-1"
          style={{ top: `${10 + i * 22}%` }}
          initial={{ x: '-20%' }}
          animate={{ x: '120%' }}
          transition={{
            duration: 15 + i * 5,
            delay: i * 3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* Pixel cloud made of small squares */}
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ===== SPARKLE TRAIL ON HOVER ===== */
export function SparkleTrail({ children, color = '#FFD740' }: { children: React.ReactNode; color?: string }) {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  let nextId = 0;

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    const newSparkle = { id: nextId++, x, y };
    setSparkles((prev) => [...prev.slice(-5), newSparkle]);
    setTimeout(() => setSparkles((prev) => prev.filter((s) => s.id !== newSparkle.id)), 600);
  };

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {sparkles.map((s) => (
        <motion.div
          key={s.id}
          className="absolute pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%`, zIndex: 10 }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 1.5, 0], opacity: [1, 1, 0] }}
          transition={{ duration: 0.5 }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5Z" fill={color} />
          </svg>
        </motion.div>
      ))}
      {children}
    </div>
  );
}

/* ===== ANIMATED COUNTER ===== */
export function PixelCounter({ target, duration = 1.5, suffix = '' }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

/* ===== PIXEL STARS BACKGROUND ===== */
export function PixelStars({ count = 30 }: { count?: number }) {
  const stars = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 3,
    duration: 1 + Math.random() * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-sm"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            background: '#FFD740',
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ===== MARQUEE TEXT (scrolling) ===== */
export function PixelMarquee({ text, speed = 20 }: { text: string; speed?: number }) {
  return (
    <div className="overflow-hidden whitespace-nowrap">
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: 'linear' }}
        className="inline-flex"
      >
        <span className="font-pixel text-[8px] tracking-wider mx-4" style={{ color: 'var(--text-muted)' }}>
          {text}
        </span>
        <span className="font-pixel text-[8px] tracking-wider mx-4" style={{ color: 'var(--text-muted)' }}>
          {text}
        </span>
        <span className="font-pixel text-[8px] tracking-wider mx-4" style={{ color: 'var(--text-muted)' }}>
          {text}
        </span>
        <span className="font-pixel text-[8px] tracking-wider mx-4" style={{ color: 'var(--text-muted)' }}>
          {text}
        </span>
      </motion.div>
    </div>
  );
}

/* ===== TYPING EFFECT ===== */
export function TypingText({ text, speed = 50, className = '' }: { text: string; speed?: number; className?: string }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span className={className}>
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-1.5 h-3.5 ml-0.5 align-middle"
        style={{ background: 'var(--purple)' }}
      />
    </span>
  );
}

/* ===== PIXEL CONFETTI BURST (triggered on events) ===== */
export function ConfettiBurst({ trigger }: { trigger: number }) {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    color: string;
    rotation: number;
    scale: number;
  }>>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const colors = ['#4FC3F7', '#E040FB', '#69F0AE', '#FF4081', '#FFD740', '#64FFDA', '#FF5252'];
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 720 - 360,
      scale: 0.5 + Math.random() * 1,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            border: '1px solid var(--bg-dark)',
          }}
          initial={{ scale: 1, opacity: 1, x: 0, y: 0, rotate: 0 }}
          animate={{
            scale: [1, p.scale, 0],
            opacity: [1, 1, 0],
            x: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400],
            y: [(Math.random() - 0.5) * 200, (Math.random() - 0.5) * 400 + 200],
            rotate: p.rotation,
          }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/* ===== CONNECTING DOTS (animated line between points) ===== */
export function ConnectingDots({ steps, activeIndex }: { steps: number; activeIndex: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: steps }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1.5 rounded-sm"
          style={{
            flex: 1,
            background: i <= activeIndex ? 'var(--green)' : 'var(--border)',
            border: '1px solid var(--bg-dark)',
          }}
          initial={false}
          animate={{
            scaleY: i === activeIndex ? [1, 1.8, 1] : 1,
            background: i <= activeIndex ? 'var(--green)' : 'var(--border)',
          }}
          transition={{ duration: 0.4 }}
        />
      ))}
    </div>
  );
}
