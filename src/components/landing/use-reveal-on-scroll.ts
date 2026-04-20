'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  threshold?: number | number[];
  rootMargin?: string;
  minRatio?: number;
};

// Sets `visible = true` the first time the element crosses the given threshold,
// then disconnects the observer. Used by landing sections for scroll-reveal.
export function useRevealOnScroll<T extends Element = HTMLDivElement>(options: Options = {}) {
  const { threshold = 0.15, rootMargin, minRatio } = options;
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          if (minRatio != null && e.intersectionRatio <= minRatio) continue;
          setVisible(true);
          io.disconnect();
          return;
        }
      },
      { threshold, rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, minRatio, Array.isArray(threshold) ? threshold.join(',') : threshold]);

  return { ref, visible };
}
