import { useEffect, useRef, useCallback, useState } from 'react';

interface PullToRefreshOptions {
  onRefresh: () => void | Promise<void>;
  pullDistance?: number;
  disabled?: boolean;
}

export function usePullToRefresh({ onRefresh, pullDistance = 80, disabled = false }: PullToRefreshOptions) {
  const [pulling, setPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAtTop = useCallback(() => {
    const el = containerRef.current;
    if (!el) return false;
    return el.scrollTop <= 5;
  }, []);

  useEffect(() => {
    if (disabled) return;
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!isAtTop()) return;
      startY.current = e.touches[0].clientY;
      currentY.current = startY.current;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (startY.current === 0) return;
      if (!isAtTop()) { startY.current = 0; setPulling(false); return; }
      currentY.current = e.touches[0].clientY;
      const diff = currentY.current - startY.current;
      if (diff > 0 && diff < 200) {
        setPulling(true);
        setPullProgress(Math.min(diff / pullDistance, 1));
      }
    };

    const onTouchEnd = async () => {
      if (!pulling) { startY.current = 0; return; }
      const diff = currentY.current - startY.current;
      startY.current = 0;
      setPulling(false);
      setPullProgress(0);
      if (diff >= pullDistance) {
        setRefreshing(true);
        try { await onRefresh(); } catch {}
        setRefreshing(false);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [disabled, isAtTop, onRefresh, pullDistance, pulling]);

  // Desktop: pull via mouse
  useEffect(() => {
    if (disabled) return;
    const el = containerRef.current;
    if (!el) return;
    let mouseDown = false;

    const onMouseDown = (e: MouseEvent) => {
      if (!isAtTop()) return;
      mouseDown = true;
      startY.current = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown) return;
      if (!isAtTop()) { mouseDown = false; setPulling(false); return; }
      currentY.current = e.clientY;
      const diff = currentY.current - startY.current;
      if (diff > 0 && diff < 200) { setPulling(true); setPullProgress(Math.min(diff / pullDistance, 1)); }
    };
    const onMouseUp = async () => {
      if (!mouseDown) return;
      mouseDown = false;
      const diff = currentY.current - startY.current;
      startY.current = 0;
      setPulling(false);
      setPullProgress(0);
      if (diff >= pullDistance) {
        setRefreshing(true);
        try { await onRefresh(); } catch {}
        setRefreshing(false);
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [disabled, isAtTop, onRefresh, pullDistance]);

  const PullIndicator = () => (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: pulling || refreshing ? 64 : 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      transition: pulling ? 'none' : 'height 0.3s ease',
      overflow: 'hidden',
      pointerEvents: 'none',
    }}>
      <div style={{
        transform: `translateY(${(1 - pullProgress) * -40}px) scale(${0.5 + pullProgress * 0.5})`,
        opacity: pullProgress,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--cyan, #2BC5D4)',
      }}>
        {refreshing ? (
          <div style={{ width: 20, height: 20, border: '2px solid #D6E4F0', borderTopColor: '#2BC5D4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: `rotate(${pullProgress * 180}deg)` }}>
            <path d="M12 5v14M5 12l7-7 7 7" />
          </svg>
        )}
        {refreshing ? 'Refreshing...' : pullProgress >= 1 ? 'Release to refresh' : 'Pull to refresh'}
      </div>
    </div>
  );

  return { containerRef, PullIndicator, refreshing };
}
