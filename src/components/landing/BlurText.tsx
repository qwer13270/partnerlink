// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

function BlurText({
  text = '',
  delay = 200,
  className = '',
  animateBy = 'words',
  direction = 'bottom',
  as: Tag = 'h1',
  threshold = 0.1,
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  const items = useMemo(() => {
    return animateBy === 'words' ? text.split(' ') : text.split('');
  }, [text, animateBy]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  const fromY = direction === 'bottom' ? 50 : -50;

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {items.map((w, i) => {
        const baseDelay = (i * delay) / 1000;
        const isLast = i === items.length - 1;
        const style = {
          display: 'inline-block',
          marginRight: animateBy === 'words' && !isLast ? '0.25em' : 0,
          willChange: 'transform, filter, opacity',
          transition: `transform 0.7s cubic-bezier(0.25,0.1,0.25,1) ${baseDelay}s, opacity 0.7s ease ${baseDelay}s, filter 0.7s ease ${baseDelay}s`,
          transform: inView ? 'translateY(0)' : `translateY(${fromY}px)`,
          opacity: inView ? 1 : 0,
          filter: inView ? 'blur(0px)' : 'blur(10px)',
        };
        return (
          <span key={i} style={style}>
            {w}
          </span>
        );
      })}
    </Tag>
  );
}

export default BlurText;
