'use client';
// @ts-nocheck

import React, { useEffect, useState } from 'react';

// Lightweight motion-like component using CSS transitions.
// Accepts `initial` and `animate` style objects. When `animate` changes (or on mount),
// it transitions from initial -> animate over `duration` with `delay`.
function MotionDiv({
  as = 'div',
  initial = {},
  animate = null,
  transition = {},
  className = '',
  style = {},
  children,
  ...rest
}) {
  const Tag = as;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setCurrent(animate), 20);
    return () => clearTimeout(t);
  }, [JSON.stringify(animate)]);

  const duration = transition.duration ?? 0.6;
  const delay = transition.delay ?? 0;

  const merged = {
    transition: `transform ${duration}s cubic-bezier(0.25,0.1,0.25,1) ${delay}s, opacity ${duration}s ease ${delay}s, filter ${duration}s ease ${delay}s`,
    ...style,
    ...current,
  };

  return (
    <Tag className={className} style={merged} {...rest}>
      {children}
    </Tag>
  );
}

export { MotionDiv };
export default MotionDiv;
