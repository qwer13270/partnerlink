// @ts-nocheck
'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UserRound } from 'lucide-react';
import { motion, useMotionValue, animate } from 'framer-motion';

const KOLS = [
  {
    id: 'max',
    name: "Max's Real Estate Launch",
    title: 'Max 的建案銷售成功案例',
    body: 'Max 透過 PartnerLink 媒合在地生活風格 KOL，為北台灣新建案打造開箱實走影音與社群話題。預售期即完銷逾七成，帶看轉換率創同類型建案新高。',
    stats: [
      { value: 3000, suffix: '萬', label: '累積成交' },
      { value: 8, suffix: '%', label: '平均轉換率' },
    ],
    photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'emily',
    name: "Emily's E-commerce Success",
    title: 'Emily 的電商成功故事',
    body: 'Emily 運用 PartnerLink 的 AI 客群分析精準媒合美妝 KOL，規劃短影音與開箱合作。三個月內觸及翻倍，並帶動品牌官網轉換率顯著成長。',
    stats: [
      { value: 5000, suffix: '萬', label: '累積成交' },
      { value: 10, suffix: '%', label: '平均轉換率' },
    ],
    photo:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sophia',
    name: "Sophia's Retail Breakthrough",
    title: "Sophia 的零售品牌突破",
    body: 'Sophia 與傳統零售品牌合作，結合內容策展與 KOL 聯名企劃，協助品牌重新定位年輕客群。合作期間社群粉絲成長兩倍，首波聯名商品 48 小時內完售。',
    stats: [
      { value: 2000, suffix: '萬', label: '累積成交' },
      { value: 6, suffix: '%', label: '平均轉換率' },
    ],
    photo:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=80',
  },
];

// Stack position -> visual transform. 0 = active (front), 1 = 1 behind, 2 = 2 behind.
const STACK_STYLES = [
  { y: 0,    scale: 1,    opacity: 1,    z: 3 },
  { y: -50,  scale: 0.96, opacity: 0.75, z: 2 },
  { y: -100, scale: 0.92, opacity: 0.55, z: 1 },
];
// Mobile offsets: tighter to avoid overflow on narrow viewports.
const STACK_STYLES_SM = [
  { y: 0,   scale: 1,    opacity: 1,    z: 3 },
  { y: -28, scale: 0.96, opacity: 0.75, z: 2 },
  { y: -56, scale: 0.92, opacity: 0.55, z: 1 },
];

function useIsMdUp() {
  const [md, setMd] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setMd(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return md;
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
      onUpdate: (v) => setDisplay(Math.round(v).toLocaleString()),
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

function KOLCard({ kol, stackPos, isActive, onActivate, mdUp }) {
  const styles = mdUp ? STACK_STYLES : STACK_STYLES_SM;
  const s = styles[Math.min(stackPos, styles.length - 1)];
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
      whileHover={isActive ? undefined : { y: s.y + 8, opacity: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      style={{
        zIndex: s.z,
        cursor: isActive ? 'default' : 'pointer',
        transformOrigin: 'center top',
        position: 'absolute',
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
        <div className="flex flex-col">
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

        <div className="relative rounded-xl overflow-hidden aspect-[4/5] md:aspect-auto md:h-full md:min-h-[280px] bg-white/[0.04]">
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
  const mdUp = useIsMdUp();

  // `order[0]` = active (front), `order[1]` = 1 behind, `order[2]` = 2 behind.
  const [order, setOrder] = useState(() => KOLS.map((k) => k.id));

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

      {/* Stacked deck — all cards mounted, absolute positioning.
          Extra top padding (`pt-28 md:pt-32`) reserves room for the peeking back cards. */}
      <div className="relative mx-auto w-full max-w-5xl pt-28 md:pt-32">
        <div className="relative" style={{ minHeight: mdUp ? 480 : 540 }}>
          {KOLS.map((kol) => (
            <KOLCard
              key={kol.id}
              kol={kol}
              stackPos={stackPos[kol.id]}
              isActive={stackPos[kol.id] === 0}
              onActivate={() => activate(kol.id)}
              mdUp={mdUp}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
