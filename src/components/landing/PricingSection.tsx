// @ts-nocheck
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useRevealOnScroll } from '@/components/landing/use-reveal-on-scroll';

const TIERS = [
  {
    nameByType: { property: 'Free', shop: 'Free' },
    tagline: '適合剛起步的品牌',
    priceByType: {
      property: { monthly: 0, yearly: 0, label: 'Free' },
      shop: { monthly: 0, yearly: 0, label: 'Free' },
    },
    featuresByType: {
      property: [
        '1 個建案專屬網站',
        '基礎建案網站模板',
        '區域房價分析報告',
        '每月合作 KOL 上限 10 位',
        '平台成交服務費 2%',
      ],
      shop: [
        '基礎網站模板',
        '3 個商品',
        '每月合作 KOL 上限 10 位',
        '每筆互惠中介費 300',
        '每筆業配服務費 20%',
      ],
    },
    cta: '開始使用',
    popular: false,
  },
  {
    nameByType: { property: 'Pro', shop: 'Pro' },
    tagline: '最受歡迎的成長方案',
    priceByType: {
      property: { monthly: 2800, yearly: 2240 },
      shop: { monthly: 2800, yearly: 2240 },
    },
    featuresByType: {
      property: [
        '3 個建案專屬網站',
        '進階建案網站模板',
        'AI 客群分析 + AI 建案內容匯入',
        '每月合作 KOL 上限 30 位',
        '平台成交服務費 1.5%',
      ],
      shop: [
        '進階網站模板',
        '10 個商品',
        '每月合作 KOL 上限 30 位',
        '每筆互惠中介費 250',
        '每筆業配服務費 15%',
      ],
    },
    cta: '開始使用',
    popular: true,
  },
  {
    nameByType: { property: 'Enterprise', shop: 'Enterprise' },
    tagline: '為大型品牌量身打造',
    priceByType: {
      property: { monthly: null, yearly: null },
      shop: { monthly: null, yearly: null },
    },
    featuresByType: {
      property: [
        '客製化專屬建案網站',
        '自訂網域 + 品牌客製',
        '每月合作 KOL 無上限',
        '專屬客戶經理',
        '平台成交服務費 0.5%',
      ],
      shop: [
        '客製化專屬品牌網站 (含自訂網域)',
        '商品數量無上限',
        '每月合作 KOL 無上限',
        '每筆互惠中介費 100',
        '每筆業配服務費 10%',
      ],
    },
    cta: '開始使用',
    popular: false,
  },
];

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-[4px]">
      <circle cx="8" cy="8" r="7.25" stroke="rgba(180,220,255,0.55)" strokeWidth="1" />
      <path
        d="M5 8.2 L7.2 10.4 L11 6"
        stroke="rgba(220,240,255,0.95)"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingSection() {
  const [mtype, setMtype] = useState<'property' | 'shop'>('property');
  const { ref, visible } = useRevealOnScroll({ threshold: 0.05, rootMargin: '0px 0px -10% 0px' });

  const formatPrice = (tier) => {
    const p = tier.priceByType[mtype];
    if (p.label) return p.label;
    if (p.monthly === null) return null;
    return `NT$${p.yearly.toLocaleString()}`;
  };

  return (
    <section
      ref={ref}
      id="pricing"
      className="relative px-6 md:px-12 lg:px-20 py-28 max-w-7xl mx-auto"
    >
      <style>{`
        @keyframes pr-pro-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(180,220,255,0.18), 0 0 0 rgba(140,200,255,0); }
          50%      { box-shadow: 0 0 0 1px rgba(180,220,255,0.4), 0 0 42px rgba(140,200,255,0.22); }
        }
        .pr-pro-card { animation: pr-pro-glow 6s ease-in-out infinite; }
      `}</style>

      <div className="text-center mb-12 relative z-10 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-3.5 py-1 text-[11px] tracking-[0.28em] uppercase text-white/80 font-body mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
          Pricing
        </div>
        <h2 className="font-heading text-white tracking-tight leading-[1.1] text-4xl md:text-5xl lg:text-6xl">
          彈性方案，<span style={{ fontStyle: 'italic' }} className="text-white/90">適合每個品牌</span>
        </h2>
        <p className="mt-6 text-white/60 font-body font-light text-base md:text-lg max-w-xl">
          選擇最適合你目標的方案，隨著業務成長自由升級。
        </p>

        {/* Billing toggle */}
        <div className="mt-8 liquid-glass rounded-full p-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMtype('property')}
            className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-body font-medium transition-colors ${
              mtype === 'property' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            建案
          </button>
          <button
            type="button"
            onClick={() => setMtype('shop')}
            className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-body font-medium transition-colors ${
              mtype === 'shop' ? 'bg-white text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            商案
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {TIERS.map((tier, i) => {
          const price = formatPrice(tier);
          const isPro = tier.popular;
          const tierName = tier.nameByType[mtype];
          const features = tier.featuresByType[mtype];
          const isFree = tier.priceByType[mtype].label === 'Free';
          return (
            <div
              key={tierName}
              className={`liquid-glass ${isPro ? 'pr-pro-card' : ''} rounded-3xl p-8 md:p-10 flex flex-col gap-7 transition-all duration-[700ms] ${
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: visible ? `${i * 120}ms` : '0ms' }}
            >
              <div className="flex items-center gap-2">
                <span className="font-heading italic text-xl md:text-2xl text-white">{tierName}</span>
                {isPro && (
                  <span className="liquid-glass rounded-full px-2 py-0.5 text-[10px] font-body text-white/90 tracking-wide">
                    Popular
                  </span>
                )}
              </div>

              <div className="min-h-[72px] flex items-end gap-1.5">
                {price ? (
                  <>
                    <span className="font-heading italic text-5xl md:text-6xl text-white leading-none">
                      {price}
                    </span>
                    {!isFree && (
                      <span className="text-white/60 text-sm font-body pb-2">/月</span>
                    )}
                  </>
                ) : (
                  <span className="font-heading italic text-5xl md:text-6xl text-white leading-none">
                    Custom
                  </span>
                )}
              </div>

              <div className="relative">
                {isPro && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-14px] h-5 w-[70%] rounded-full blur-xl"
                    style={{
                      background:
                        'radial-gradient(ellipse at center, rgba(180,220,255,0.75) 0%, rgba(140,200,255,0.35) 45%, rgba(140,200,255,0) 75%)',
                    }}
                  />
                )}
                <Link
                  href="/signup?role=merchant"
                  className="relative liquid-glass-strong text-white hover:bg-white/10 rounded-full px-5 py-2.5 text-sm font-body font-medium flex items-center justify-center gap-2 transition"
                >
                  {tier.cta}
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <ul className="space-y-3.5 pt-3 border-t border-white/10">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check />
                    <span className="text-white/80 font-body font-light text-base md:text-[17px] leading-snug">
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-white/40 text-xs font-body">
        KOL 使用完全免費，僅商家需訂閱方案。
      </p>
    </section>
  );
}
