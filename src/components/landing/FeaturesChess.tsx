// @ts-nocheck
'use client';

import React, { useEffect, useRef, useState } from 'react';
import BlurText from './BlurText';

// FeaturesChess (redesigned) — "Smarter Services, Built with AI" style
// Layout: 1+1 row (narrow left, wide right) + 3 equal cards row
// Arc integrates: enters from top-left corner of this section,
// threads down-right through the layout, exits bottom-center to continue.

/* ---------- Tiny preview components ---------- */

// 1) Checklist preview (left small card)
function PreviewChecklist() {
  const items = [
    { icon: 'x', label: 'Social media post', state: 'done' },
    { icon: 'people', label: 'KOL 回覆追蹤', state: 'active' },
    { icon: 'clock', label: 'Payment reminder', state: 'done' },
  ];
  const renderIcon = (k) => {
    if (k === 'x') return (
      <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
    );
    if (k === 'people') return (
      <svg viewBox="0 0 14 14" className="w-3.5 h-3.5"><circle cx="5" cy="5" r="2" fill="none" stroke="currentColor" strokeWidth="1.2"/><circle cx="10" cy="6" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M2 12 C2 9.5 3.5 8.5 5 8.5 S8 9.5 8 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/><path d="M9 12 C9 10.5 9.8 9.8 11 9.8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
    );
    return (
      <svg viewBox="0 0 12 12" className="w-3 h-3"><circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.2"/><path d="M6 3.5 L6 6 L8 7.2" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/></svg>
    );
  };
  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center">
      <div className="flex flex-col gap-2.5 w-full max-w-[230px]">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span className="text-white/80 flex-shrink-0">{renderIcon(it.icon)}</span>
            <span className="flex-1 font-body text-[12px] text-white/85">{it.label}</span>
            {it.state === 'done' ? (
              <svg viewBox="0 0 10 10" className="w-3 h-3 text-white/80"><path d="M2 5 L4.5 7 L8 3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            ) : (
              <svg viewBox="0 0 12 12" className="w-3 h-3 text-white/50">
                <path d="M10 6 A 4 4 0 1 1 6 2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M10 2 L10 6 L6 6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 2) Orbit preview (right large card) — central orb + scattered platform icons
function PreviewOrbit() {
  // Icons scattered around central orb — like a wheel of connected tools
  const tiles = [
    { x: 14, y: 22, kind: 'mail' },
    { x: 30, y: 14, kind: 'sparkle' },
    { x: 12, y: 52, kind: 'card' },
    { x: 72, y: 18, kind: 'fig' },
    { x: 88, y: 42, kind: 'x' },
    { x: 32, y: 68, kind: 'layers' },
    { x: 86, y: 68, kind: 'n' },
  ];
  const renderTile = (kind) => {
    const common = { viewBox: '0 0 16 16', className: 'w-4 h-4 text-white/80' };
    switch (kind) {
      case 'mail': return (<svg {...common}><rect x="2" y="4" width="12" height="9" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1"/><path d="M2.5 5 L8 9 L13.5 5" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>);
      case 'sparkle': return (<svg {...common}><path d="M8 2 L9 6.5 L13.5 7.5 L9 8.5 L8 13 L7 8.5 L2.5 7.5 L7 6.5 Z" fill="currentColor"/></svg>);
      case 'card': return (<svg {...common}><rect x="2" y="3" width="12" height="10" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.1"/><circle cx="6" cy="7" r="1.4" fill="currentColor"/><path d="M9 10 L12 10 M9 7 L12 7" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/></svg>);
      case 'fig': return (<svg {...common}><circle cx="5" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="5" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="5" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="9" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1"/><circle cx="9" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1"/></svg>);
      case 'x': return (<svg {...common}><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>);
      case 'layers': return (<svg {...common}><path d="M8 2 L14 5 L8 8 L2 5 Z" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M2 8 L8 11 L14 8" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/><path d="M2 11 L8 14 L14 11" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg>);
      case 'n': return (<svg {...common}><path d="M3 13 L3 3 L13 13 L13 3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>);
      default: return null;
    }
  };
  return (
    <div className="w-full h-full relative overflow-hidden">
      <style>{`
        @keyframes fc-orbit-pulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 0 1px rgba(255,255,255,0.18), 0 0 40px rgba(140,190,255,0.25); }
          50%     { transform: scale(1.06); box-shadow: 0 0 0 1px rgba(255,255,255,0.28), 0 0 60px rgba(140,190,255,0.45); }
        }
        @keyframes fc-orbit-ring {
          from { transform: rotate(0deg) }
          to   { transform: rotate(360deg) }
        }
        @keyframes fc-tile-float {
          0%,100% { transform: translateY(0) }
          50%     { transform: translateY(-4px) }
        }
      `}</style>
      {/* faint connecting rings behind */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
        style={{
          width: '72%', paddingBottom: '72%', transform: 'translate(-50%,-50%)',
          border: '1px dashed rgba(255,255,255,0.08)',
        }}
      />
      <div
        className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
        style={{
          width: '48%', paddingBottom: '48%', transform: 'translate(-50%,-50%)',
          border: '1px dashed rgba(255,255,255,0.10)',
        }}
      />

      {/* Tiles around */}
      {tiles.map((t, i) => (
        <div
          key={i}
          className="absolute rounded-lg flex items-center justify-center"
          style={{
            left: `${t.x}%`, top: `${t.y}%`,
            width: 44, height: 44,
            transform: 'translate(-50%,-50%)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 14px rgba(0,0,0,0.35)',
            animation: `fc-tile-float 4s ease-in-out ${i * 0.4}s infinite`,
          }}
        >
          {renderTile(t.kind)}
        </div>
      ))}

      {/* Central orb */}
      <div
        className="absolute left-1/2 top-1/2 rounded-full flex items-center justify-center"
        style={{
          width: 76, height: 76,
          transform: 'translate(-50%,-50%)',
          background: 'radial-gradient(circle at 35% 30%, #1a2942 0%, #050a18 70%)',
          animation: 'fc-orbit-pulse 3s ease-in-out infinite',
        }}
      >
        <svg viewBox="0 0 20 20" className="w-7 h-7 text-white">
          <path d="M10 2 L11.3 8.5 L17.5 9.8 L11.3 11.2 L10 18 L8.7 11.2 L2.5 9.8 L8.7 8.5 Z" fill="currentColor"/>
          <circle cx="15" cy="4" r="1.1" fill="currentColor"/>
          <circle cx="17" cy="7" r="0.7" fill="currentColor" opacity="0.7"/>
        </svg>
      </div>
    </div>
  );
}

// 3) Search preview (small card 1 in lower row)
function PreviewSearch() {
  const rows = [
    { label: '時尚美妝 Fashion & Beauty', highlight: false },
    { label: '科技 3C Tech & Gadgets',    highlight: true  },
    { label: '美食餐飲 Food & Dining',    highlight: false },
  ];
  return (
    <div className="w-full h-full relative p-6 flex flex-col items-center justify-center gap-2.5">
      {/* search bar */}
      <div
        className="flex items-center gap-2 w-[85%] px-3 py-2 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <svg viewBox="0 0 14 14" className="w-3.5 h-3.5 text-white/50">
          <circle cx="6" cy="6" r="4" fill="none" stroke="currentColor" strokeWidth="1.2"/>
          <line x1="9" y1="9" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="font-body text-[11px] text-white/45 flex-1">搜尋 KOL 分類…</span>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-body font-medium text-white"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >搜尋</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-center gap-2 w-[85%] px-3 py-2 rounded-lg"
          style={{
            background: r.highlight ? 'rgba(120,170,255,0.12)' : 'rgba(255,255,255,0.03)',
            border: r.highlight ? '1px solid rgba(150,200,255,0.55)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))',
              border: '1px solid rgba(255,255,255,0.14)',
            }}
          />
          <span className="flex-1 font-body text-[10.5px] text-white/80">{r.label}</span>
          <svg viewBox="0 0 12 12" className={`w-3 h-3 ${r.highlight ? 'text-cyan-200' : 'text-white/30'}`}>
            <path d="M2 9 L5 6 L7 8 L10 3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

// 4) Code preview (small card 2)
function PreviewCode() {
  const lines = [
    { n: 1, t: <><span className="text-[#b39fff]">class</span> <span className="text-white/90">CampaignAgent</span>:</> },
    { n: 2, t: <><span className="pl-4 text-white/70">def</span> <span className="text-[#8bd0ff]">__init__</span>(<span className="text-[#f4b6a6]">self</span>, <span className="text-[#f4b6a6]">brief</span>):</> },
    { n: 3, t: <><span className="pl-8 text-white/70">self</span>.brief <span className="text-white/40">=</span> <span className="text-[#7bd88f]">brief</span></> },
    { n: 4, t: <><span className="pl-8 text-white/70">self</span>.mode <span className="text-white/40">=</span> <span className="text-[#f4b6a6]">&quot;auto&quot;</span></> },
    { n: 5, t: <><span className="pl-4 text-white/70">def</span> <span className="text-[#8bd0ff]">match</span>(<span className="text-[#f4b6a6]">self</span>, kols):</> },
    { n: 6, t: <><span className="pl-8 text-white/50">#</span> <span className="text-white/40">rank by fit</span></> },
  ];
  return (
    <div className="w-full h-full relative p-4 flex items-center justify-center">
      <div
        className="w-full max-w-[280px] rounded-xl overflow-hidden"
        style={{
          background: 'rgba(10,14,22,0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          </div>
          <span className="ml-auto font-body text-[9px] text-white/40">agent.py</span>
        </div>
        <div className="px-3 py-2.5 font-mono text-[10px] leading-[1.55]">
          {lines.map((l) => (
            <div key={l.n} className="flex gap-3">
              <span className="text-white/25 w-3 text-right flex-shrink-0 select-none">{l.n}</span>
              <span className="whitespace-nowrap overflow-hidden">{l.t}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5) Strategy preview (small card 3) — chart + sparkle
function PreviewStrategy() {
  return (
    <div className="w-full h-full relative p-6 flex items-center justify-center gap-4">
      <style>{`
        @keyframes fc-spark-rot { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
      {/* bars */}
      <div
        className="w-16 h-16 rounded-xl flex items-end justify-center gap-1 p-2"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {[40, 78, 55, 90].map((h, i) => (
          <div
            key={i}
            className="w-1.5 rounded-sm"
            style={{
              height: `${h}%`,
              background: 'linear-gradient(180deg, rgba(220,235,255,0.95), rgba(140,190,255,0.4))',
            }}
          />
        ))}
      </div>
      {/* connector dashes */}
      <div className="flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1 h-0.5 rounded-full bg-white/25" />
        ))}
      </div>
      {/* sparkle circle */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #1a2942 0%, #050a18 70%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 0 30px rgba(140,190,255,0.25)',
        }}
      >
        <svg viewBox="0 0 20 20" className="w-6 h-6 text-white">
          <path d="M10 2 L11.3 8.5 L17.5 9.8 L11.3 11.2 L10 18 L8.7 11.2 L2.5 9.8 L8.7 8.5 Z" fill="currentColor"/>
          <circle cx="15" cy="4" r="1" fill="currentColor"/>
        </svg>
      </div>
    </div>
  );
}

/* ---------- Card shell ---------- */
function Card({ previewH = 220, children, title, body, className = '' }) {
  return (
    <div
      className={`liquid-glass rounded-3xl overflow-hidden flex flex-col ${className}`}
      style={{ padding: 14 }}
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          height: previewH,
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {children}
      </div>
      <div className="px-4 pt-5 pb-3">
        <h3 className="font-heading italic text-white text-xl md:text-2xl leading-snug mb-2">
          {title}
        </h3>
        <p className="font-body font-light text-white/60 text-[13px] leading-relaxed">
          {body}
        </p>
      </div>
    </div>
  );
}

/* ---------- Section Arc (starts top-left, exits bottom) ---------- */
function SectionArc() {
  const ref = useRef(null);
  const pathRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [len, setLen] = useState(1);

  const pointAt = (frac) => {
    if (!pathRef.current || !len) return { x: 0, y: 0 };
    const p = pathRef.current.getPointAtLength(Math.max(0, Math.min(1, frac)) * len);
    return { x: p.x, y: p.y };
  };

  useEffect(() => {
    const measure = () => {
      if (pathRef.current) {
        try {
          const L = pathRef.current.getTotalLength();
          if (L) setLen(L);
        } catch (e) {}
      }
    };
    measure();
    requestAnimationFrame(measure);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const p = Math.max(0, Math.min(1, passed / total));
      setProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    requestAnimationFrame(update);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const drawFrac = Math.max(0, Math.min(1, (progress - 0.05) / 0.82));
  const dashOffset = len * (1 - drawFrac);

  // Path from top-left (0,0) curving down-right through middle, exiting bottom-center
  const W = 1200;
  const H = 1400;
  const d = `M 0 0
             C ${W * 0.22} ${H * 0.12}, ${W * 0.15} ${H * 0.28}, ${W * 0.32} ${H * 0.36}
             S ${W * 0.75} ${H * 0.48}, ${W * 0.58} ${H * 0.62}
             S ${W * 0.2} ${H * 0.82}, ${W * 0.5} ${H}`;

  const nodeStops = [0.08, 0.28, 0.5, 0.72, 0.92];
  const packetFrac = drawFrac;
  const packet = len ? pointAt(packetFrac) : { x: 0, y: 0 };

  return (
    <div ref={ref} className="absolute inset-0 w-full h-full pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        fill="none"
      >
        <defs>
          <linearGradient id="fc-arc-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="rgba(230,245,255,1)" />
            <stop offset="25%"  stopColor="rgba(180,220,255,0.9)" />
            <stop offset="75%"  stopColor="rgba(120,180,255,0.55)" />
            <stop offset="100%" stopColor="rgba(140,190,255,0)" />
          </linearGradient>
          <linearGradient id="fc-arc-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor="rgba(140,190,255,0.4)" />
            <stop offset="60%" stopColor="rgba(90,150,255,0.2)" />
            <stop offset="100%" stopColor="rgba(90,150,255,0)" />
          </linearGradient>
        </defs>

        {/* Dashed track */}
        <path d={d}
          stroke="rgba(180,210,255,0.09)"
          strokeWidth="1"
          strokeDasharray="2 6"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
        {/* Glow */}
        <path d={d}
          stroke="url(#fc-arc-glow)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: len, strokeDashoffset: dashOffset, opacity: 0.85 }}
        />
        {/* Inner stroke */}
        <path ref={pathRef} d={d}
          stroke="url(#fc-arc-stroke)"
          strokeWidth="1.25"
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ strokeDasharray: len, strokeDashoffset: dashOffset }}
        />
        {/* Nodes */}
        {len > 0 && nodeStops.map((f, i) => {
          const pt = pointAt(f);
          const lit = drawFrac >= f;
          return (
            <g key={i}>
              <circle cx={pt.x} cy={pt.y} r={lit ? 10 : 4} fill="rgba(140,190,255,0.18)" style={{ transition: 'r 0.3s ease' }} />
              <circle cx={pt.x} cy={pt.y} r="2.2" fill={lit ? 'rgba(235,245,255,1)' : 'rgba(180,210,255,0.25)'} style={{ transition: 'fill 0.3s ease' }} />
            </g>
          );
        })}
        {/* Packet */}
        {len > 0 && drawFrac > 0.02 && drawFrac < 0.98 && (
          <g>
            <circle cx={packet.x} cy={packet.y} r="16" fill="rgba(160,210,255,0.22)" />
            <circle cx={packet.x} cy={packet.y} r="7"  fill="rgba(200,225,255,0.55)" />
            <circle cx={packet.x} cy={packet.y} r="2.2" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
}

/* ---------- Generic scroll-linked arc ---------- */
function ScrollArc({ d, W = 1200, H = 1400, nodeStops = [0.15, 0.5, 0.85], drawStart = 0.05, drawSpan = 0.82 }) {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const glowRef = useRef(null);
  const nodesRef = useRef([]);
  const packetRef = useRef(null);
  const packetCirclesRef = useRef([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const path = pathRef.current;
    const glow = glowRef.current;
    if (!wrap || !path || !glow) return;

    let len = 1;
    try { len = path.getTotalLength() || 1; } catch (e) {}
    // Initialize dasharray
    path.style.strokeDasharray = String(len);
    glow.style.strokeDasharray = String(len);

    let rafId = 0;
    let pending = false;

    const render = () => {
      pending = false;
      const rect = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height + vh;
      const passed = vh - rect.top;
      const progress = Math.max(0, Math.min(1, passed / total));
      const drawFrac = Math.max(0, Math.min(1, (progress - drawStart) / drawSpan));
      const dashOffset = len * (1 - drawFrac);
      path.style.strokeDashoffset = String(dashOffset);
      glow.style.strokeDashoffset = String(dashOffset);

      // Packet position at draw head
      if (packetRef.current && packetCirclesRef.current.length) {
        if (drawFrac > 0.02 && drawFrac < 0.98) {
          const p = path.getPointAtLength(drawFrac * len);
          packetCirclesRef.current.forEach((c) => {
            if (c) {
              c.setAttribute('cx', p.x);
              c.setAttribute('cy', p.y);
            }
          });
          packetRef.current.style.display = '';
        } else {
          packetRef.current.style.display = 'none';
        }
      }

      // Node lit state
      nodesRef.current.forEach((g, i) => {
        if (!g) return;
        const lit = drawFrac >= nodeStops[i];
        const halo = g.children[0];
        const core = g.children[1];
        if (halo) halo.setAttribute('r', lit ? '10' : '4');
        if (core) core.setAttribute('fill', lit ? 'rgba(235,245,255,1)' : 'rgba(180,210,255,0.25)');
      });
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      rafId = requestAnimationFrame(render);
    };

    render();
    requestAnimationFrame(render);
    const t1 = setTimeout(render, 100);
    const t2 = setTimeout(render, 400);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [d, drawStart, drawSpan]);

  // Place nodes at viewBox coords resolved from path
  const nodePoints = (() => {
    if (!pathRef.current) return nodeStops.map(() => ({ x: 0, y: 0 }));
    try {
      const L = pathRef.current.getTotalLength();
      return nodeStops.map((f) => {
        const p = pathRef.current.getPointAtLength(f * L);
        return { x: p.x, y: p.y };
      });
    } catch {
      return nodeStops.map(() => ({ x: 0, y: 0 }));
    }
  })();

  return (
    <div ref={wrapRef} className="absolute inset-0 w-full h-full pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" fill="none">
        <defs>
          <linearGradient id="sa-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(230,245,255,1)" />
            <stop offset="50%" stopColor="rgba(180,220,255,0.85)" />
            <stop offset="100%" stopColor="rgba(120,180,255,0.4)" />
          </linearGradient>
          <linearGradient id="sa-glow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(140,190,255,0.4)" />
            <stop offset="100%" stopColor="rgba(90,150,255,0)" />
          </linearGradient>
        </defs>
        <path d={d} stroke="rgba(180,210,255,0.09)" strokeWidth="1" strokeDasharray="2 6" fill="none" vectorEffect="non-scaling-stroke" />
        <path ref={glowRef} d={d} stroke="url(#sa-glow)" strokeWidth="8" fill="none" strokeLinecap="round"
          style={{ opacity: 0.85 }} />
        <path ref={pathRef} d={d} stroke="url(#sa-stroke)" strokeWidth="1.8" fill="none" strokeLinecap="round" />

        {nodePoints.map((pt, i) => (
          <g key={i} ref={(el) => { nodesRef.current[i] = el; }}>
            <circle cx={pt.x} cy={pt.y} r={4} fill="rgba(140,190,255,0.18)" style={{ transition: 'r 0.3s ease' }} />
            <circle cx={pt.x} cy={pt.y} r="2.2" fill="rgba(180,210,255,0.25)" style={{ transition: 'fill 0.3s ease' }} />
          </g>
        ))}
        <g ref={packetRef} style={{ display: 'none' }}>
          <circle ref={(el) => { packetCirclesRef.current[0] = el; }} cx={0} cy={0} r="16" fill="rgba(160,210,255,0.22)" />
          <circle ref={(el) => { packetCirclesRef.current[1] = el; }} cx={0} cy={0} r="7" fill="rgba(200,225,255,0.55)" />
          <circle ref={(el) => { packetCirclesRef.current[2] = el; }} cx={0} cy={0} r="2.2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}

/* ---------- Main section ---------- */
function FeaturesChess({ hideArc = false }) {
    return (
    <section id="features" className="relative px-6 md:px-12 lg:px-20 py-28 max-w-7xl mx-auto scroll-mt-24">
      {/* Integrated section arc — starts top-left, curves through the layout */}
      {!hideArc && <SectionArc />}

      {/* Heading */}
      <div className="text-center mb-16 relative z-10">
        <div className="inline-flex items-center gap-1.5 liquid-glass rounded-full px-3.5 py-1 text-[11px] font-medium text-white/80 font-body mb-6 tracking-[0.18em] uppercase">
          <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white/70">
            <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="6" cy="6" r="1.3" fill="currentColor"/>
          </svg>
          Services
        </div>
        <BlurText
          text="完整功能 ／ Built with AI"
          className="font-heading text-white text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1]"
          as="h2"
        />
        <p className="mt-5 text-white/60 font-body font-light text-sm md:text-base max-w-xl mx-auto">
          一站式工具組，從商案建立、KOL 匹配到數據洞察，全部由 AI 驅動。
        </p>
      </div>

      {/* Row 1 — 1fr / 2fr */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 relative z-10">
        <div className="lg:col-span-1">
          <Card
            previewH={240}
            title="自動處理重複工作"
            body="排程社群貼文、追蹤 KOL 回覆、提醒付款——讓 AI 處理繁瑣，讓你專注在策略。"
          >
            <PreviewChecklist />
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card
            previewH={240}
            title="自動化商案工作流程"
            body="從 brief 到上線，AI 串接 IG、TikTok、Figma、郵件等工具，讓整條工作流運轉如一。"
          >
            <PreviewOrbit />
          </Card>
        </div>
      </div>

      {/* Row 2 — 3 equal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <Card
          previewH={200}
          title="即時數據洞察"
          body="依產業、受眾、互動率即時搜尋 KOL,讓每個決策都有數據佐證。"
        >
          <PreviewSearch />
        </Card>
        <Card
          previewH={200}
          title="客製 AI 代理"
          body="針對你的品牌訓練專屬 agent,無縫整合既有工具鏈,自動處理重複任務。"
        >
          <PreviewCode />
        </Card>
        <Card
          previewH={200}
          title="AI 策略顧問"
          body="由專家配合 AI 模型給出具體建議,把洞察落地為可執行的下一步。"
        >
          <PreviewStrategy />
        </Card>
      </div>
    </section>
  );
}

export { ScrollArc as ScrollArc };
export default FeaturesChess;
