import React, { useEffect, useRef, useState } from 'react';

type RevealProps = {
  /** Element tag to render. Defaults to a div. */
  as?: React.ElementType;
  /** Stagger delay in milliseconds, applied as transition-delay. */
  delay?: number;
  className?: string;
  children?: React.ReactNode;
} & React.HTMLAttributes<HTMLElement>;

/**
 * Reveals its content on scroll into view — a tiny, dependency-free stand-in
 * for motion's `whileInView` fade/slide used across the homepage. Keeping this
 * out of `motion` lets the home route ship without the ~30KB motion runtime on
 * its critical path. Animates once, then disconnects the observer.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // SSR/old browsers without IO: just show the content.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -50px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as any}
      className={`reveal ${visible ? 'reveal-in' : ''} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
