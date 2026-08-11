import React from 'react';
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';

/**
 * Provides motion's `domAnimation` feature bundle to the `m` components used by
 * the lazy routes (and the lazy GlobalMap). Loaded lazily so `motion` stays off
 * the homepage's critical-path bundle — only routes that actually animate pull
 * it in. Mirrors the single app-wide <LazyMotion> that used to live in App.tsx.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  // reducedMotion="user" makes every `m.*` transform/opacity animation on the
  // lazy routes honour prefers-reduced-motion without touching each call site.
  // It lives on MotionConfig, not LazyMotion.
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  );
}
