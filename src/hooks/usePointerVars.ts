import { useEffect, type RefObject } from 'react';

/**
 * Tracks a mouse or pen over the element as the CSS custom properties --px and
 * --py (0–1 across its box) and sets data-pointer while it is inside, so CSS
 * can draw a light that follows the cursor or tilt the element toward it
 * (index.css, "Home lower sections"). Does nothing on touch-only devices or
 * under reduced motion; updates at most once a frame and never re-renders.
 */
export function usePointerVars(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let x = 0.5;
    let y = 0.5;
    const apply = () => {
      frame = 0;
      el.style.setProperty('--px', x.toFixed(3));
      el.style.setProperty('--py', y.toFixed(3));
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const box = el.getBoundingClientRect();
      x = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
      y = Math.min(1, Math.max(0, (event.clientY - box.top) / box.height));
      el.dataset.pointer = 'in';
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onLeave = () => {
      delete el.dataset.pointer;
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      delete el.dataset.pointer;
    };
  }, [ref]);
}
