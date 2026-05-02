import { useRef, useEffect, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  x?: number;
  scale?: number;
  stagger?: number;
  ease?: string;
}

export default function ScrollReveal({
  children, className = '', delay = 0, duration = 0.8, y = 40, x = 0, scale = 1, ease = 'power3.out'
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!, {
        y, x, scale, opacity: 0, duration, delay, ease,
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 88%',
          end: 'top 50%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    return () => ctx.revert();
  }, [delay, duration, y, x, scale, ease]);

  return <div ref={ref} className={className}>{children}</div>;
}

export function ScrollRevealStagger({
  children, className = '', delay = 0, stagger = 0.1, y = 30, x = 0
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.from(ref.current!.children, {
        y, x, opacity: 0, duration: 0.7, delay, stagger, ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });
    });
    return () => ctx.revert();
  }, [delay, stagger, y, x]);

  return <div ref={ref} className={className}>{children}</div>;
}

export function ParallaxImage({ src, alt, speed = 0.5, className = '' }: { src: string; alt: string; speed?: number; className?: string }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(ref.current!, {
        yPercent: speed * 20,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current!,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [speed]);

  return <img ref={ref} src={src} alt={alt} className={className} />;
}
