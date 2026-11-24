import { useEffect, useRef, useState } from 'react';

/**
 * True from the first time the element's top comes `inset` above the bottom of
 * the viewport, and from then on. The home page's lower sections key their
 * one-time entrances off it (index.css, "Home lower sections"), so they play
 * when a visitor reaches them; <Reveal> animates at mount, which for a section
 * far below the fold is over before anyone sees it.
 *
 * A bottom inset rather than an intersection ratio, so a section taller than
 * the viewport (most of them, on a phone) still triggers. Without
 * IntersectionObserver it is true at once.
 */
export function useSeenOnce<T extends Element>(inset = '20%') {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: `0px 0px -${inset} 0px` }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [inset]);

  return [ref, seen] as const;
}
