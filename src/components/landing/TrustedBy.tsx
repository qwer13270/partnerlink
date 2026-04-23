// @ts-nocheck
'use client';

import React from 'react';
import { useRevealOnScroll } from './use-reveal-on-scroll';

// TrustedBy — quiet marquee of partner wordmarks that live between Hero and AboutSection.
// Motion concept matches the site's "network / data" DNA:
//   • Infinite horizontal marquee (dual-track, CSS keyframes — GPU-cheap)
//   • A periodic "scan beam" sweeps across the row left→right; whichever
//     wordmark it crosses momentarily illuminates from gray → bright white
//   • Hairline guide rails above/below the row subtly hint at a data lane
// No real third-party logos — stylized text wordmarks only.

const BRANDS = [
  { name: 'LUMEN',        style: { fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 500, letterSpacing: '-0.02em' } },
  { name: 'northwind',    style: { fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.12em' } },
  { name: 'Orbit/Co',     style: { fontFamily: 'Fraunces, serif', fontWeight: 500, letterSpacing: '-0.01em' } },
  { name: 'KASUMI',       style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.32em' } },
  { name: 'Meridian',     style: { fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 400, letterSpacing: '0' } },
  { name: 'AXIS·9',       style: { fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.18em' } },
  { name: 'Halcyon',      style: { fontFamily: 'Fraunces, serif', fontWeight: 400, letterSpacing: '-0.015em' } },
  { name: 'FIELDNOTE',    style: { fontFamily: 'Inter, sans-serif', fontWeight: 600, letterSpacing: '0.22em' } },
  { name: 'Sana&Co.',     style: { fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 500, letterSpacing: '-0.01em' } },
  { name: 'PRISM',        style: { fontFamily: 'Inter, sans-serif', fontWeight: 700, letterSpacing: '0.4em' } },
  { name: 'Kōyō',         style: { fontFamily: 'Fraunces, serif', fontWeight: 500, letterSpacing: '0' } },
  { name: 'vector/lab',   style: { fontFamily: 'Inter, sans-serif', fontWeight: 300, letterSpacing: '0.08em' } },
];

function TrustedBy() {
  const { ref: rowRef, visible } = useRevealOnScroll({ threshold: 0.15 });

  // Double the list so the marquee can translate by -50% for a seamless loop
  const doubled = [...BRANDS, ...BRANDS];

  return (
    <section
      ref={rowRef}
      className="relative bg-black py-20 md:py-24 overflow-hidden"
      aria-label="Trusted by"
    >
      <style>{`
        @keyframes tb-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes tb-scan {
          0%   { transform: translateX(-10%); opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes tb-rail-flicker {
          0%, 100% { opacity: 0.12; }
          45%, 55% { opacity: 0.28; }
        }
        .tb-track {
          display: flex;
          width: max-content;
          animation: tb-marquee 60s linear infinite;
          will-change: transform;
        }
        .tb-item {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 3rem;
          color: rgba(255,255,255,0.42);
          font-size: 1.5rem;
          white-space: nowrap;
          transition: color 0.35s ease, text-shadow 0.35s ease;
          text-transform: none;
        }
        @media (min-width: 768px) {
          .tb-item { padding: 0 4rem; font-size: 1.85rem; }
        }
        .tb-item:hover {
          color: rgba(255,255,255,0.95);
        }
        /* Scan beam — a narrow white-cyan column that sweeps across the row */
        .tb-scan {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 180px;
          background: linear-gradient(
            to right,
            rgba(140,200,255,0) 0%,
            rgba(200,230,255,0.08) 35%,
            rgba(230,245,255,0.22) 50%,
            rgba(200,230,255,0.08) 65%,
            rgba(140,200,255,0) 100%
          );
          pointer-events: none;
          animation: tb-scan 7s linear infinite;
          mix-blend-mode: screen;
          filter: blur(2px);
        }
        .tb-scan-line {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(220,240,255,0.55),
            transparent
          );
          pointer-events: none;
          animation: tb-scan 7s linear infinite;
          mix-blend-mode: screen;
        }
        /* Items gently light up when the scan beam passes.
           Because the scan is global-left→right and the track scrolls,
           we use a CSS-only approximation: every item has a slow hue-shift
           "heartbeat" on a per-item delay so a subset is always lit. */
        @keyframes tb-item-pulse {
          0%, 85%, 100% { color: rgba(255,255,255,0.40); text-shadow: none; }
          90%           { color: rgba(255,255,255,0.95);
                          text-shadow: 0 0 16px rgba(180,220,255,0.55); }
        }
        .tb-track > .tb-item {
          animation: tb-item-pulse 9s ease-in-out infinite;
        }
        /* Edge fades */
        .tb-mask {
          -webkit-mask-image: linear-gradient(to right,
            transparent 0, black 8%, black 92%, transparent 100%);
                  mask-image: linear-gradient(to right,
            transparent 0, black 8%, black 92%, transparent 100%);
        }
        /* Guide rails */
        .tb-rail {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(to right,
            transparent 0, rgba(180,210,255,0.22) 20%,
            rgba(180,210,255,0.22) 80%, transparent 100%);
          animation: tb-rail-flicker 4.5s ease-in-out infinite;
        }
        /* Reveal */
        .tb-reveal {
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 900ms ease, transform 900ms ease;
        }
        .tb-reveal.tb-in {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .tb-track { animation: none; }
          .tb-scan, .tb-scan-line { animation: none; display: none; }
          .tb-track > .tb-item { animation: none; color: rgba(255,255,255,0.55); }
        }
      `}</style>

      {/* Heading */}
      <div className={`relative z-10 text-center mb-12 md:mb-14 tb-reveal ${visible ? 'tb-in' : ''}`}>
        <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.3em] text-white/40 font-body uppercase">
          <span className="w-6 h-px bg-white/25" />
          Trusted by
          <span className="w-6 h-px bg-white/25" />
        </div>
        <p className="mt-4 text-white/80 font-body font-light text-base md:text-lg max-w-xl mx-auto">
          與我們一起成長的品牌
        </p>
      </div>

      {/* Marquee row */}
      <div className={`tb-row relative tb-mask tb-reveal ${visible ? 'tb-in' : ''}`} style={{ transitionDelay: '120ms' }}>
        <div className="tb-rail" style={{ top: 'calc(50% - 38px)' }} />
        <div className="tb-rail" style={{ top: 'calc(50% + 38px)', animationDelay: '2s' }} />

        <div className="tb-track" role="list">
          {doubled.map((b, i) => (
            <span
              key={i}
              role="listitem"
              className="tb-item"
              style={{
                ...b.style,
                animationDelay: `${(i % BRANDS.length) * 0.75}s`,
              }}
            >
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TrustedBy;
