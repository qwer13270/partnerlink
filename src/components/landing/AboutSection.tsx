'use client';
// @ts-nocheck

import React, { useEffect, useRef, useState } from 'react';

// AboutSection — sticky scroll-driven card stack.

const ABOUT_CARDS = [
  {
    tag: '01 · Mission',
    title: '我們的使命',
    body: '讓創作者與商家能更輕鬆建立連結，降低合作門檻，讓每一次合作都能創造真實且長期的價值。',
  },
  {
    tag: '02 · Origin',
    title: '我們看見的問題',
    body: '傳統的合作流程繁琐、效率低落，創作者難以找到合適機會，商家也難以快速找到對的合作夥伴。',
  },
  {
    tag: '03 · Solution',
    title: '我們的解法',
    body: '透過平台化與自動化工具，簡化媒合、合作與分潤流程，讓整個合作體驗更直覺、高效且透明。',
  },
  {
    tag: '04 · Vision',
    title: '我們的願景',
    body: '打造一個持續成長的創作與商業生態，讓每一位創作者都能被看見，每一個品牌都能找到最適合的聲音。',
  },
];

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function AboutSection() {
  const wrapRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh;
      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / total));
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

  const introEnd = 0.16;
  const N = ABOUT_CARDS.length;

  const introOpacity = Math.max(0, 1 - progress / introEnd);
  const cardsVisibleMul = smoothstep(introEnd * 0.75, introEnd + 0.03, progress);

  const rawCp = (Math.max(0, progress - introEnd) / (1 - introEnd)) * N;
  const cp = rawCp - 0.5;

  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const wrapHeight = `${N * 100 + 120}vh`;

  return (
    <section
      id="about"
      ref={wrapRef}
      className="relative w-full scroll-mt-24"
      style={{ height: wrapHeight }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Ambient blue glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 55%, rgba(40,90,200,0.18), transparent 55%), radial-gradient(ellipse at 15% 20%, rgba(30,70,160,0.10), transparent 60%)',
          }}
        />

        {/* Intro */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
          style={{
            opacity: introOpacity,
            transform: `translateY(${(1 - introOpacity) * -30}px)`,
          }}
        >
          <div className="liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body mb-8 whitespace-nowrap">
            About Us
          </div>
          <h2 className="font-heading italic text-white text-center leading-[0.85] text-6xl md:text-8xl lg:text-[9rem] tracking-tight">
            About <span className="text-white/60">Us</span>
          </h2>
          <div className="mt-10 flex flex-col items-center gap-2">
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/60 to-white/90 animate-pulse" />
            <span className="text-[10px] tracking-[0.25em] text-white/50 font-body uppercase">
              Scroll
            </span>
          </div>
        </div>

        {/* Card stack */}
        <div
          className="absolute inset-0 flex items-center justify-center px-6 pointer-events-none"
          style={{
            perspective: '1200px',
            opacity: cardsVisibleMul,
          }}
        >
          <div className="relative w-full max-w-2xl h-[420px] md:h-[440px]">
            {ABOUT_CARDS.map((card, i) => {
              // Linear (non-looping) distance so the last card doesn't trigger
              // the first card to start entering again.
              const d = cp - i;

              let opacity = 0;
              let translateY = 0;
              let scale = 1;
              let rotateX = 0;
              let z = 0;
              let blur = 0;

              if (d >= -1 && d <= 0) {
                const tE = ease(1 + d);
                opacity = tE;
                translateY = (1 - tE) * 40;
                scale = 0.94 + 0.06 * tE;
                rotateX = (1 - tE) * 6;
                z = -40 * (1 - tE);
                blur = (1 - tE) * 4;
              } else if (d > 0 && d <= 1) {
                const tE = ease(d);
                opacity = 1 - tE;
                translateY = -tE * 20;
                scale = 1 - tE * 0.04;
                rotateX = -tE * 3;
                z = -tE * 60;
                blur = tE * 6;
              } else {
                opacity = 0;
              }

              const active = Math.abs(d) < 0.5;

              return (
                <div
                  key={i}
                  className="absolute inset-x-0 top-1/2"
                  style={{
                    transform: `translateY(-50%) translateY(${translateY}px) translateZ(${z}px) rotateX(${rotateX}deg) scale(${scale})`,
                    opacity,
                    filter: `blur(${blur}px)`,
                    transformStyle: 'preserve-3d',
                    willChange: 'transform, opacity, filter',
                    pointerEvents: active ? 'auto' : 'none',
                  }}
                >
                  <div
                    className="relative rounded-3xl p-8 md:p-12 overflow-hidden backdrop-blur-2xl"
                    style={{
                      background:
                        'radial-gradient(120% 80% at 20% 0%, rgba(80,120,190,0.20) 0%, rgba(20,30,55,0.55) 35%, rgba(5,8,16,0.92) 85%)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      boxShadow: [
                        'inset 0 1px 0 rgba(255,255,255,0.22)',
                        'inset 0 -1px 0 rgba(255,255,255,0.04)',
                        'inset 1px 0 0 rgba(255,255,255,0.05)',
                        'inset -1px 0 0 rgba(255,255,255,0.03)',
                        '0 30px 80px rgba(0,0,0,0.55)',
                        '0 8px 24px rgba(0,0,0,0.35)',
                      ].join(', '),
                    }}
                  >
                    {/* Specular top sheen — glass refraction highlight */}
                    <div
                      aria-hidden
                      className="absolute inset-x-0 top-0 pointer-events-none"
                      style={{
                        height: '55%',
                        background:
                          'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 100%)',
                        mixBlendMode: 'overlay',
                      }}
                    />
                    {/* Corner light gleam */}
                    <div
                      aria-hidden
                      className="absolute pointer-events-none"
                      style={{
                        left: '-10%',
                        top: '-15%',
                        width: '55%',
                        height: '70%',
                        background:
                          'radial-gradient(ellipse at 30% 30%, rgba(180,210,255,0.35) 0%, rgba(100,150,220,0.08) 40%, transparent 70%)',
                        filter: 'blur(10px)',
                      }}
                    />
                    {/* Bottom-right counter-shadow for depth */}
                    <div
                      aria-hidden
                      className="absolute pointer-events-none"
                      style={{
                        right: '-10%',
                        bottom: '-10%',
                        width: '50%',
                        height: '50%',
                        background:
                          'radial-gradient(circle at 70% 70%, rgba(30,50,95,0.35) 0%, transparent 65%)',
                      }}
                    />
                    {/* Content wrapper — above the effects */}
                    <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[10px] tracking-[0.25em] text-white/50 font-body uppercase">
                        {card.tag}
                      </span>
                      <span className="flex-1 h-px bg-white/10" />
                    </div>
                    <h3 className="font-heading italic text-white text-3xl md:text-5xl leading-[1.1] tracking-tight">
                      {card.title}
                    </h3>
                    <p className="mt-5 text-white/70 font-body font-light text-base md:text-lg leading-relaxed">
                      {card.body}
                    </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2"
          style={{
            opacity: cardsVisibleMul,
            transition: 'opacity 0.2s linear',
          }}
        >
          {ABOUT_CARDS.map((_, i) => {
            const active = Math.round(cp) === i || (cp >= N - 0.5 && i === N - 1);
            return (
              <span
                key={i}
                className="h-1 rounded-full"
                style={{
                  width: active ? 28 : 10,
                  background: active ? 'rgba(220,235,255,0.95)' : 'rgba(255,255,255,0.25)',
                  transition: 'width 0.4s ease, background 0.4s ease',
                }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
