// @ts-nocheck
'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

import Preloader from '@/components/landing/Preloader';
import HeroNetworkBG from '@/components/landing/HeroNetworkBG';
import CtaNetworkBG from '@/components/landing/CtaNetworkBG';
import StatsBG from '@/components/landing/StatsBG';
import TrustedBy from '@/components/landing/TrustedBy';
import AboutSection from '@/components/landing/AboutSection';
import FeatureSteps from '@/components/landing/FeatureSteps';
import FaqSection from '@/components/landing/FaqSection';
import FeaturesChess, { ScrollArc } from '@/components/landing/FeaturesChess';
import PricingSection from '@/components/landing/PricingSection';
import OutstandingKOLs from '@/components/landing/OutstandingKOLs';
import BlurText from '@/components/landing/BlurText';
import MotionDiv from '@/components/landing/Motion';
import { useRevealOnScroll } from '@/components/landing/use-reveal-on-scroll';
import Logo from '@/components/Logo';

function AuthErrorRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const errorCode = searchParams.get('error_code') ?? searchParams.get('error');
    if (!errorCode) return;
    const params = new URLSearchParams();
    params.set('error_code', errorCode);
    const desc = searchParams.get('error_description');
    if (desc) params.set('error_description', desc);
    router.replace(`/auth/error?${params}`);
  }, [router, searchParams]);
  return null;
}

/* ---------------- Navbar ---------------- */
function Navbar() {
  return (
    <nav className="fixed top-4 left-0 right-0 z-50 px-8 lg:px-16 py-3">
      <div className="flex items-center justify-between">
        <Logo href="/#top" size="sm" />

        <div className="liquid-glass rounded-full px-1.5 py-1 flex items-center gap-0">
          <Link
            href="/login"
            className="mr-1 md:mr-1.5 rounded-full px-3 md:px-3.5 py-1.5 text-sm font-body font-medium text-white/90 hover:text-white transition"
          >
            登入
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black rounded-full px-3 md:px-3.5 py-1.5 text-sm font-body font-medium flex items-center gap-1 hover:bg-white/90 transition"
          >
            註冊 <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden scroll-mt-0" style={{ height: 780 }}>
      <div className="absolute inset-0 z-0">
        <HeroNetworkBG />
      </div>

      <div className="absolute inset-0 bg-black/10 z-0" />

      <div
        className="absolute top-0 left-0 right-0 z-[1] pointer-events-none"
        style={{
          height: 220,
          background: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: 300, background: 'linear-gradient(to bottom, transparent, #000)' }}
      />

      <div
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
        style={{ paddingTop: 80 }}
      >
        <MotionDiv
          initial={{ opacity: 0, transform: 'translateY(10px)', filter: 'blur(10px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="liquid-glass rounded-full px-1 py-1 flex items-center gap-2 mb-8"
        >
          <span className="bg-white text-black rounded-full px-3 py-1 text-xs font-semibold font-body">New</span>
          <span className="text-xs text-white/90 font-body pr-3">全台最大的行銷生態</span>
        </MotionDiv>

        <BlurText
          text="Connect Brands & Creators"
          delay={100}
          className="text-6xl md:text-7xl lg:text-[5.5rem] font-heading italic text-white leading-[0.8] max-w-2xl mx-auto"
          as="h1"
        />

        <MotionDiv
          as="p"
          initial={{ filter: 'blur(10px)', opacity: 0, transform: 'translateY(20px)' }}
          animate={{ filter: 'blur(0px)', opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-6 text-base md:text-lg text-white font-body font-light leading-tight max-w-xl"
        >
          連結商家與KOL，創造共贏的行銷生態
        </MotionDiv>

        <MotionDiv
          initial={{ filter: 'blur(10px)', opacity: 0, transform: 'translateY(20px)' }}
          animate={{ filter: 'blur(0px)', opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-8 flex items-center gap-4"
        >
          <Link
            href="/signup?role=merchant"
            className="liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-body font-medium text-white flex items-center gap-2"
          >
            商家加入 <ArrowUpRight size={16} />
          </Link>
          <Link
            href="/signup?role=kol"
            className="liquid-glass rounded-full px-5 py-2.5 text-sm font-body font-medium text-white flex items-center gap-2"
          >
            KOL 加入 <ArrowUpRight size={16} />
          </Link>
        </MotionDiv>
      </div>
    </section>
  );
}

/* ---------------- Features Grid (Comparison) ---------------- */
function FeaturesGrid() {
  const ours = [
    '上百位 KOL 任你挑選合作',
    '合作流程透明快速',
    '一鍵建立商案網站',
    '一站式管理：編輯商案、查看客戶、成效表現',
    'AI 分析商案，更進一步提高轉換率',
  ];
  const theirs = [
    '人脈有限，難以找到合適 KOL',
    '合作流程不透明，來回溝通耗時',
    '需自行架站或外包，費時又費錢',
    '邀約、商案、客戶、成效散落各處管理',
    '缺乏數據洞察，轉換率只能靠經驗猜測',
  ];

  const { ref, visible } = useRevealOnScroll({ threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

  const Check = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7.25" stroke="rgba(180,220,255,0.55)" strokeWidth="1" />
      <path d="M5 8.2 L7.2 10.4 L11 6" stroke="rgba(220,240,255,0.95)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const Cross = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="8" cy="8" r="7.25" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
      <path d="M5.5 5.5 L10.5 10.5 M10.5 5.5 L5.5 10.5" stroke="rgba(255,255,255,0.45)" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );

  const rowClass = () =>
    `flex items-center gap-3 py-3.5 px-4 rounded-xl transition-all duration-[700ms] ${
      visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'
    }`;

  return (
    <section ref={ref} className="relative px-6 md:px-12 lg:px-20 py-28 max-w-6xl mx-auto">
      <style>{`
        @keyframes fg-our-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 rgba(140,200,255,0); }
          50%      { box-shadow: 0 0 0 1px rgba(180,220,255,0.32), 0 0 36px rgba(140,200,255,0.18); }
        }
        .fg-our-card { animation: fg-our-glow 6s ease-in-out infinite; }
        @keyframes fg-check-pulse {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(180,220,255,0)); }
          50%      { filter: drop-shadow(0 0 6px rgba(180,220,255,0.6)); }
        }
        .fg-check { animation: fg-check-pulse 3.2s ease-in-out infinite; }
      `}</style>

      <div className="text-center mb-14 relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-3.5 py-1 text-[11px] tracking-[0.28em] uppercase text-white/80 font-body mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          Comparison
        </div>
        <h2 className="font-heading text-white tracking-tight leading-[1.1] text-4xl md:text-5xl lg:text-6xl">
          為何選擇我們<span style={{ fontStyle: 'italic' }} className="text-white/90">而非其他平台</span>
        </h2>
        <p className="mt-6 text-white/60 font-body font-light text-base md:text-lg max-w-2xl">
          比較看看，為什麼越來越多商家與 KOL 選擇我們的平台。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
        <div>
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="10" stroke="rgba(180,220,255,0.7)" strokeWidth="1" />
              <circle cx="11" cy="11" r="3.2" fill="rgba(200,230,255,0.9)" />
              <circle cx="11" cy="11" r="6" stroke="rgba(180,220,255,0.35)" strokeWidth="1" />
            </svg>
            <span className="font-heading italic text-2xl md:text-[1.7rem] text-white">我們的平台</span>
          </div>
          <div className="liquid-glass fg-our-card rounded-2xl p-5 md:p-6">
            <ul className="space-y-1">
              {ours.map((t, i) => (
                <li
                  key={i}
                  className={rowClass()}
                  style={{ transitionDelay: visible ? `${i * 110}ms` : '0ms' }}
                >
                  <span className="fg-check" style={{ animationDelay: `${i * 0.4}s` }}>
                    <Check />
                  </span>
                  <span className="text-white/90 font-body font-light text-sm md:text-[15px] leading-snug">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-2.5 mb-5">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <rect x="4" y="7" width="14" height="10" rx="1.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
              <rect x="6.5" y="5" width="14" height="10" rx="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" fill="none" />
              <rect x="9" y="3" width="14" height="10" rx="1.5" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
            </svg>
            <span className="font-heading italic text-2xl md:text-[1.7rem] text-white/55">其他方式</span>
          </div>
          <div
            className="rounded-2xl p-5 md:p-6 border border-white/[0.07]"
            style={{ background: 'rgba(255,255,255,0.015)' }}
          >
            <ul className="space-y-1">
              {theirs.map((t, i) => (
                <li
                  key={i}
                  className={rowClass()}
                  style={{ transitionDelay: visible ? `${i * 110 + 60}ms` : '0ms' }}
                >
                  <Cross />
                  <span className="text-white/45 font-body font-light text-sm md:text-[15px] leading-snug line-through decoration-white/10">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Stats ---------------- */
function Stats() {
  const stats = [
    { v: '12,000+', l: '合作媒合次數' },
    { v: '5,800+', l: '活躍 KOL 數' },
    { v: '5%', l: '平均轉換率' },
    { v: '500萬', l: '平台總成交量' },
  ];
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0"><StatsBG /></div>
      <div
        className="absolute top-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: 200, background: 'linear-gradient(to bottom, #000, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: 200, background: 'linear-gradient(to top, #000, transparent)' }}
      />
      <div className="relative z-10 px-6 md:px-12 lg:px-20 py-32 max-w-7xl mx-auto">
        <div className="liquid-glass rounded-3xl p-12 md:p-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((s) => (
              <div key={s.l}>
                <div className="text-4xl md:text-5xl lg:text-6xl font-heading italic text-white leading-[0.9]">
                  {s.v}
                </div>
                <div className="mt-3 text-white/60 font-body font-light text-sm">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA Footer ---------------- */
function CtaFooter() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0"><CtaNetworkBG /></div>
      <div
        className="absolute top-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: 200, background: 'linear-gradient(to bottom, #000, transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 z-[1] pointer-events-none"
        style={{ height: 200, background: 'linear-gradient(to top, #000, transparent)' }}
      />

      <div className="relative z-10 px-6 md:px-12 lg:px-20 py-40 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="font-heading text-white tracking-tight leading-[1.1] text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto">
            加入平台，<span style={{ fontStyle: 'italic' }} className="text-white/90">開始合作</span>
          </h2>

          <p className="mt-7 text-white/70 font-body font-light text-base md:text-lg max-w-xl mx-auto">
            無論你是想擴大品牌影響力的商家，還是想接到對的案子的 KOL——
            註冊即可開始媒合，零門檻加入我們的合作生態。
          </p>
          <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
            <Link
              href="/signup?role=merchant"
              className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-body font-medium text-white flex items-center gap-2"
            >
              商家加入 <ArrowUpRight size={16} />
            </Link>
            <Link
              href="/signup?role=kol"
              className="bg-white text-black rounded-full px-6 py-3 text-sm font-body font-medium flex items-center gap-2"
            >
              KOL 加入 <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-32 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/40 text-xs font-body">© 2026 Studio. All rights reserved.</div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="text-white/40 text-xs font-body hover:text-white/80 transition">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add('landing-no-scrollbar');
    return () => document.documentElement.classList.remove('landing-no-scrollbar');
  }, []);
  return (
    <div className="bg-black min-h-screen">
      <Suspense fallback={null}>
        <AuthErrorRedirect />
      </Suspense>
      <Preloader />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <div className="bg-black relative">
          <TrustedBy />
          <AboutSection />
          <FeatureSteps />
          <div className="relative isolate">
            {ScrollArc && (
              <div className="hidden lg:block absolute inset-0 pointer-events-none -z-10">
                <ScrollArc
                  d={`M 0 0
                      C 260 140, 180 280, 390 380
                      C 550 460, 650 520, 620 620
                      C 600 720, 680 780, 820 830
                      C 950 880, 1100 930, 1220 1030
                      C 1360 1140, 1400 1320, 1280 1480
                      C 1150 1620, 950 1680, 780 1730
                      C 600 1780, 480 1900, 450 2040
                      C 440 2120, 460 2200, 490 2230`}
                  W={1200}
                  H={2400}
                  nodeStops={[0.06, 0.2, 0.36, 0.52, 0.72, 0.9]}
                  drawStart={0.03}
                  drawSpan={0.9}
                />
              </div>
            )}
            <FeaturesChess hideArc />
            <FeaturesGrid />
            <PricingSection />
          </div>
          {/* <Stats /> */}
          <OutstandingKOLs />
          <FaqSection />
          <CtaFooter />
        </div>
      </div>
    </div>
  );
}
