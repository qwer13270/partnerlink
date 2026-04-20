'use client';
// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';

// Preloader — elegant 0 → 100 count intro matching the liquid-glass theme.

function Preloader() {
  const [count, setCount] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const rafRef = useRef(0);
  const startRef = useRef(0);

  // Lock scroll while preloader is on screen
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, []);

  // Animate count 0 → 100
  useEffect(() => {
    const DURATION = 2200; // ms
    const easeOut = (t) => 1 - Math.pow(1 - t, 2.2);

    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / DURATION);
      const v = Math.round(easeOut(p) * 100);
      setCount(v);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // Hold at 100 for a beat, then exit
        setTimeout(() => setExiting(true), 280);
        // Remove from DOM after exit transition
        setTimeout(() => {
          setGone(true);
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }, 280 + 900);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (gone) return null;

  // Progress bar width
  const pct = `${count}%`;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black overflow-hidden"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'scale(1.02)' : 'scale(1)',
        transition: 'opacity 0.9s cubic-bezier(0.2,0.8,0.2,1), transform 1.2s cubic-bezier(0.2,0.8,0.2,1)',
        pointerEvents: exiting ? 'none' : 'auto',
      }}
    >
      {/* Ambient glow to match hero */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 45%, rgba(40,90,200,0.18), transparent 55%), radial-gradient(ellipse at 15% 20%, rgba(30,70,160,0.10), transparent 60%)',
        }}
      />

      {/* Faint grid lines — subtle infrastructure cue */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)',
        }}
      />

      {/* Top-left wordmark */}
      <div
        className="absolute top-8 left-8 md:top-10 md:left-10 flex items-center gap-2"
        style={{
          opacity: exiting ? 0 : 1,
          transform: exiting ? 'translateY(-8px)' : 'translateY(0)',
          transition: 'opacity 0.5s ease, transform 0.7s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none" className="relative z-10">
          <defs>
            <linearGradient id="pre-pl-g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#dbeafe" />
              <stop offset="1" stopColor="#7aa8ff" />
            </linearGradient>
            <linearGradient id="pre-pl-g2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="1" stopColor="#6497ff" />
            </linearGradient>
          </defs>
          {/* Left link */}
          <path
            d="M13 6a7 7 0 0 0 0 14h3"
            stroke="url(#pre-pl-g1)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none" />
          {/* Right link */}
          <path
            d="M19 26a7 7 0 0 0 0-14h-3"
            stroke="url(#pre-pl-g2)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none" />
          {/* Connector node */}
          <circle cx="16" cy="16" r="1.8" fill="#ffffff" />
        </svg>
        <span className="font-body font-semibold text-sm text-white leading-none tracking-tight">
          partner<span className="text-white/60">link</span>
        </span>
      </div>

      {/* Top-right status chip */}
      <div
        className="!absolute top-8 right-8 md:top-10 md:right-10 inline-flex w-fit items-center gap-2 liquid-glass rounded-full px-3 py-1"
        style={{
          opacity: exiting ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        <span className="relative flex items-center justify-center w-2 h-2">
          <span className="absolute inset-0 rounded-full bg-blue-300/70 animate-ping" />
          <span className="relative w-1.5 h-1.5 rounded-full bg-blue-200" />
        </span>
        <span className="text-[10px] tracking-[0.2em] text-white/70 font-body uppercase">
          Initializing
        </span>
      </div>

      {/* Center stack */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
        {/* Above-number label */}
        <div
          className="mb-8 text-[10px] tracking-[0.4em] text-white/50 font-body uppercase"
          style={{
            opacity: exiting ? 0 : 1,
            transform: exiting ? 'translateY(-14px)' : 'translateY(0)',
            transition: 'opacity 0.55s ease, transform 0.8s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          Loading Experience
        </div>

        {/* Big counter */}
        <div
          className="relative flex items-baseline leading-none"
          style={{
            opacity: exiting ? 0 : 1,
            transform: exiting ? 'translateY(-30px) scale(0.96)' : 'translateY(0) scale(1)',
            transition: 'opacity 0.6s ease, transform 0.9s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          <span
            className="font-heading italic text-white tracking-tight tabular-nums"
            style={{
              fontSize: 'clamp(6rem, 18vw, 15rem)',
              lineHeight: 0.9,
            }}
          >
            {String(count).padStart(3, '0')}
          </span>
          <span
            className="font-heading italic text-white/50 tracking-tight"
            style={{
              fontSize: 'clamp(2rem, 6vw, 5rem)',
              lineHeight: 1,
              marginLeft: '0.25rem',
            }}
          >
            %
          </span>
        </div>

        {/* Progress bar */}
        <div
          className="mt-14 w-full max-w-md relative"
          style={{
            opacity: exiting ? 0 : 1,
            transform: exiting ? 'translateY(-10px)' : 'translateY(0)',
            transition: 'opacity 0.5s ease, transform 0.9s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        >
          <div className="flex items-center justify-between text-[9px] tracking-[0.25em] text-white/45 font-body uppercase mb-2 font-mono">
            <span>PTL · 01</span>
            <span className="tabular-nums">{pct}</span>
          </div>
          <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: pct,
                background:
                  'linear-gradient(90deg, rgba(180,210,255,0.9) 0%, rgba(100,150,255,1) 100%)',
                boxShadow: '0 0 12px rgba(120,170,255,0.6)',
                transition: 'width 0.12s linear',
              }}
            />
            {/* Leading spark */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-white"
              style={{
                left: `calc(${pct} - 2px)`,
                boxShadow: '0 0 10px rgba(200,220,255,0.9)',
                transition: 'left 0.12s linear',
                opacity: count < 100 ? 1 : 0,
              }}
            />
          </div>
          {/* Loading streams (rotating phrases) */}
          <div className="mt-3 flex justify-between text-[9px] tracking-[0.2em] text-white/30 font-body uppercase font-mono">
            <span>
              {count < 30
                ? 'Connecting nodes'
                : count < 65
                ? 'Syncing creators'
                : count < 95
                ? 'Calibrating network'
                : 'Ready'}
            </span>
            <span>{`${Math.min(count * 142, 14200).toLocaleString()} pts`}</span>
          </div>
        </div>
      </div>

      {/* Bottom tick marks — decorative */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
        style={{
          opacity: exiting ? 0 : 1,
          transition: 'opacity 0.5s ease',
        }}
      >
        {Array.from({ length: 24 }).map((_, i) => {
          const on = (i / 23) * 100 <= count;
          return (
            <span
              key={i}
              className="w-px h-2 rounded-full"
              style={{
                background: on ? 'rgba(200,220,255,0.85)' : 'rgba(255,255,255,0.12)',
                transition: 'background 0.2s ease',
              }}
            />
          );
        })}
      </div>

      {/* Iris-style exit wipe — large ring that expands as we leave */}
      <div
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
        style={{
          opacity: exiting ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: exiting ? '240vmax' : '0vmax',
            height: exiting ? '240vmax' : '0vmax',
            background:
              'radial-gradient(circle, rgba(0,0,0,0) 48%, rgba(0,0,0,0.001) 50%, transparent 51%)',
            border: '1px solid rgba(120,170,255,0.25)',
            transition: 'width 1s cubic-bezier(0.2,0.8,0.2,1), height 1s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
      </div>
    </div>
  );
}

export default Preloader;
