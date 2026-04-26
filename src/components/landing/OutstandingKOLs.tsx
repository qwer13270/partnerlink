// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { UserRound } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';

const KOLS = [
  {
    id: 'mina',
    name: 'Mina',
    title: 'Mina 專職廣告演員',
    body: '以鏡頭前的自然感染力見長，擅長將品牌核心價值轉化為有溫度的畫面語言。無論是精品質感或生活日常風格，都能精準拿捏品牌形象詮釋，為合作夥伴留下深刻且一致的觀眾印象。',
    stats: [
      { value: 19.7, suffix: 'k', label: '粉絲人數' },
      { value: 8, suffix: '', label: '合作過商案數' },
    ],
    photo: '/images/kol1.jpg',
  },
  {
    id: 'ruby',
    name: 'Ruby',
    title: 'Ruby 戶外生活風格創作者',
    body: '熱愛運動、旅遊與美食，擅長用真實的戶外體驗說故事。從登山健行到城市小旅行、在地美食探店，Ruby 以鮮明活力的鏡頭語言與分享節奏，帶領粉絲走進每一次旅程，為品牌打造貼近生活、富有行動感的內容合作。',
    stats: [
      { value: 5000, suffix: '', label: '粉絲人數' },
      { value: 10, suffix: '', label: '合作過商案數' },
    ],
    photo: '/images/kol2.jpg',
  },
];

// Stack position -> visual transform. 0 = active (front), 1 = 1 behind.
// y is a plain number (px) so Framer Motion can interpolate reliably across
// repeated switches. Peek offset is responsive: -28 mobile, -50 md+.
const stackStyle = (pos, peek) =>
  pos === 0
    ? { y: 0,    scale: 1,    opacity: 1,    z: 3 }
    : { y: peek, scale: 0.96, opacity: 0.75, z: 2 };

function usePeekOffset() {
  const [peek, setPeek] = useState(-28);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setPeek(mq.matches ? -50 : -28);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return peek;
}

function CountUp({ target, suffix = '', triggerKey, active }) {
  const val = useMotionValue(0);
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (!active) {
      val.set(0);
      setDisplay('0');
      return;
    }
    val.set(0);
    setDisplay('0');
    const controls = animate(val, target, {
      duration: 1.6,
      delay: 0.15,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) =>
        setDisplay(
          Number.isInteger(target)
            ? Math.round(v).toLocaleString()
            : v.toFixed(1),
        ),
    });
    return () => controls.stop();
  }, [triggerKey, target, val, active]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

function KOLCard({ kol, stackPos, isActive, onActivate, peek }) {
  const s = stackStyle(stackPos, peek);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onClick={isActive ? undefined : onActivate}
      role={isActive ? undefined : 'button'}
      tabIndex={isActive ? -1 : 0}
      aria-label={isActive ? undefined : `切換至 ${kol.name}`}
      onKeyDown={(e) => {
        if (isActive) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
      onHoverStart={() => !isActive && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={{
        y: s.y,
        scale: s.scale,
        opacity: s.opacity,
      }}
      whileHover={
        isActive ? undefined : { y: s.y + 8, opacity: 0.9 }
      }
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        zIndex: s.z,
        cursor: isActive ? 'default' : 'pointer',
        transformOrigin: 'center top',
        position: isActive ? 'relative' : 'absolute',
        left: 0,
        right: 0,
        top: 0,
      }}
      className="liquid-glass rounded-2xl overflow-hidden"
    >
      {/* Active card: blue accent ring. Inactive: subdued border, brightens on hover. */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-[box-shadow] duration-300"
        style={{
          boxShadow: isActive
            ? 'inset 0 0 0 1px rgba(140,200,255,0.45), 0 0 40px rgba(140,200,255,0.12), 0 30px 80px rgba(0,0,0,0.5)'
            : hovered
              ? 'inset 0 0 0 1px rgba(255,255,255,0.35), 0 18px 40px rgba(0,0,0,0.5)'
              : 'inset 0 0 0 1px rgba(255,255,255,0.15), 0 14px 30px rgba(0,0,0,0.45)',
        }}
      />

      {/* Solid-ish backdrop on inactive cards so the active card's blur doesn't pick up their content */}
      {!isActive && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: 'rgba(10,14,22,0.88)' }}
        />
      )}

      {/* Top chrome (peek area on inactive cards) */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] relative z-10">
        <UserRound size={16} className="text-white/40" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6 md:gap-8 p-6 md:p-8 relative z-10">
        <div className="flex flex-col order-2 md:order-none">
          <h3 className="font-heading text-white text-2xl md:text-3xl leading-[1.15] tracking-tight">
            {kol.title}
          </h3>
          <p className="mt-4 font-body font-light text-white/70 text-sm md:text-[15px] leading-relaxed">
            {kol.body}
          </p>

          <div className="mt-6 md:mt-auto pt-6 grid grid-cols-2 gap-3 md:gap-4">
            {kol.stats.map((stat) => (
              <div key={stat.label} className="liquid-glass rounded-xl px-4 py-4">
                <div className="font-heading italic text-white text-3xl md:text-4xl leading-none">
                  <CountUp
                    target={stat.value}
                    suffix={stat.suffix}
                    triggerKey={kol.id}
                    active={isActive}
                  />
                </div>
                <div className="mt-2 font-body font-light text-white/60 text-xs md:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden order-1 md:order-none h-56 md:h-full md:min-h-[280px] bg-white/[0.04]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={kol.photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function OutstandingKOLs() {
  // `order[0]` = active (front), `order[1]` = 1 behind, `order[2]` = 2 behind.
  const [order, setOrder] = useState(() => KOLS.map((k) => k.id));
  const peek = usePeekOffset();

  const activate = (id) => {
    setOrder((prev) => {
      if (prev[0] === id) return prev;
      // Clicked card → front; rest keep relative order but previously-active goes to the back.
      const rest = prev.slice(1).filter((x) => x !== id);
      return [id, ...rest, prev[0]];
    });
  };

  const stackPos = useMemo(() => {
    const map = {};
    order.forEach((id, i) => {
      map[id] = i;
    });
    return map;
  }, [order]);

  return (
    <section
      id="outstanding-kols"
      className="relative px-6 md:px-12 lg:px-20 py-32 md:py-40 max-w-7xl mx-auto"
    >
      {/* Heading */}
      <div className="text-center mb-14 md:mb-16 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 mb-6">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <circle cx="7" cy="4.8" r="2.3" stroke="currentColor" strokeWidth="1.1" className="text-white/70" />
            <path
              d="M2.8 11.6c.7-2 2.3-3 4.2-3s3.5 1 4.2 3"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="text-white/70"
            />
          </svg>
          <span className="text-[11px] tracking-[0.25em] text-white/70 font-body uppercase">
            Our KOLs
          </span>
        </div>

        <h2 className="font-heading text-white tracking-tight leading-[1.05] text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto">
          平台本月傑出 <span className="italic">KOL</span>
        </h2>

        <p className="mt-5 text-white/65 font-body font-light text-base md:text-lg max-w-xl mx-auto">
          探索在 PartnerLink 上脫穎而出的 KOL 合作案例，看見品牌與創作者如何共同成長。
        </p>
      </div>

      {/* Stacked deck — active card drives container height (position: relative);
          inactive cards overlay via position: absolute. */}
      <div className="relative mx-auto w-full max-w-5xl pt-16 md:pt-32">
        <div className="relative">
          {KOLS.map((kol) => (
            <KOLCard
              key={kol.id}
              kol={kol}
              stackPos={stackPos[kol.id]}
              isActive={stackPos[kol.id] === 0}
              onActivate={() => activate(kol.id)}
              peek={peek}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
