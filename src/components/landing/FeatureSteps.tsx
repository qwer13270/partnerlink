// @ts-nocheck
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useRevealOnScroll } from './use-reveal-on-scroll';

// FeatureSteps — 3-card feature row with scroll-driven staggered entrance + subtle parallax.

const STEPS = [
  {
    n: '01',
    tag: 'Discover',
    title: '建立商案',
    body: '輕鬆建立專屬一頁式商案，AI 一鍵填入資料，支援模組新增、移除與拖曳排序',
    preview: 'match',
  },
  {
    n: '02',
    tag: 'Collaborate',
    title: '發出合作邀請',
    body: '從邀請、溝通到簽約與進度追蹤，一站式完成，條件清晰、時程明確、交付透明',
    preview: 'campaign',
  },
  {
    n: '03',
    tag: 'Measure',
    title: '自動分潤',
    body: '即時數據對應實際成果，點擊、轉換、收益一目了然，所有數據集中管理',
    preview: 'analytics',
  },
];

function smoothstepFS(e0, e1, x) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/* Simple looping "building a website" animation */
function MatchPreview({ active }) {
  return (
    <div className="w-full h-full relative p-5">
      <style>{`
        @keyframes fs-build-1 { 0%,5% { opacity:0; transform:scaleX(.2); transform-origin:left } 15%,82% { opacity:1; transform:scaleX(1) } 92%,100% { opacity:0 } }
        @keyframes fs-build-2 { 0%,18% { opacity:0; transform:translateY(8px) } 28%,82% { opacity:1; transform:translateY(0) } 92%,100% { opacity:0 } }
        @keyframes fs-build-3 { 0%,32% { opacity:0; transform:scaleX(.2); transform-origin:left } 42%,82% { opacity:1; transform:scaleX(1) } 92%,100% { opacity:0 } }
        @keyframes fs-build-4 { 0%,40% { opacity:0; transform:scaleX(.2); transform-origin:left } 50%,82% { opacity:1; transform:scaleX(1) } 92%,100% { opacity:0 } }
        @keyframes fs-build-5 { 0%,50% { opacity:0; transform:translateY(8px) scale(.9) } 60%,82% { opacity:1; transform:translateY(0) scale(1) } 92%,100% { opacity:0 } }
        @keyframes fs-publish-btn {
          0%,62% { opacity:0; transform:translateY(6px) scale(.92) }
          72%,82% { opacity:1; transform:translateY(0) scale(1) }
          84% { opacity:1; transform: scale(0.9) }
          88% { opacity:1; transform: scale(1.05) }
          91% { opacity: 1; transform: scale(1) }
          92%,100% { opacity: 0; transform: scale(1) }
        }
        @keyframes fs-publish-flash {
          0%,83% { opacity: 0 }
          85% { opacity: 0.75 }
          100% { opacity: 0 }
        }
        @keyframes fs-cursor {
          0%   { left: 10%; top: 10%; opacity: 1; transform: scale(1) }
          25%  { left: 58%; top: 22%; opacity: 1; transform: scale(1) }
          50%  { left: 30%; top: 58%; opacity: 1; transform: scale(1) }
          78%  { left: 78%; top: 82%; opacity: 1; transform: scale(1) }
          84%  { left: 78%; top: 82%; opacity: 1; transform: scale(0.78) }
          88%  { left: 78%; top: 82%; opacity: 1; transform: scale(1) }
          95%,100% { left: 78%; top: 82%; opacity: 0; transform: scale(1) }
        }
      `}</style>
      <div
        className="w-full h-full rounded-xl overflow-hidden flex flex-col"
        style={{
          background: '#000',
          border: '1px solid rgba(255,255,255,0.08)',
          transform: active ? 'translateY(0)' : 'translateY(10px)',
          opacity: active ? 1 : 0.4,
          transition: 'all 0.6s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-1 px-2.5 py-2 border-b border-white/10">
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/25" />
          <div className="ml-2 flex-1 h-2 rounded-full bg-white/5" />
        </div>
        {/* Build-animation stage */}
        <div className="flex-1 relative overflow-hidden">
          {/* Header bar */}
          <div
            className="absolute left-3 right-3 top-3 h-1.5 rounded-full bg-white/50"
            style={{ animation: 'fs-build-1 5s ease-in-out infinite' }}
          />
          {/* Hero block — simple solid with subtle icon mark */}
          <div
            className="absolute left-3 right-3 top-[22%] h-[22%] rounded-md flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              animation: 'fs-build-2 5s ease-in-out infinite',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 opacity-50">
              <rect x="3" y="5" width="18" height="14" rx="1.5" fill="none" stroke="rgba(220,235,255,0.9)" strokeWidth="1.2" />
              <circle cx="8" cy="10" r="1.3" fill="rgba(220,235,255,0.9)" />
              <path d="M3 16 L9 11 L14 15 L21 9" fill="none" stroke="rgba(220,235,255,0.9)" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Text lines */}
          <div
            className="absolute left-3 top-[52%] h-1 rounded-full bg-white/30"
            style={{ width: '70%', animation: 'fs-build-3 5s ease-in-out infinite' }}
          />
          <div
            className="absolute left-3 top-[60%] h-1 rounded-full bg-white/25"
            style={{ width: '55%', animation: 'fs-build-4 5s ease-in-out infinite' }}
          />
          {/* Bottom: left image block (wider) + right publish button — no overlap */}
          <div
            className="absolute left-3 bottom-3 w-[48%] h-[22%] rounded-md bg-white/15"
            style={{ animation: 'fs-build-5 5s ease-in-out infinite' }}
          />
          {/* Publish button — glass */}
          <div
            className="absolute right-3 bottom-3 h-[22%] rounded-md overflow-hidden flex items-center justify-center gap-1 px-2"
            style={{
              width: '32%',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -1px 0 rgba(255,255,255,0.05), 0 2px 8px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              animation: 'fs-publish-btn 5s ease-in-out infinite',
            }}
          >
            {/* Click flash */}
            <div
              className="absolute inset-0 bg-white pointer-events-none"
              style={{ animation: 'fs-publish-flash 5s ease-in-out infinite' }}
            />
            <svg viewBox="0 0 10 10" className="w-2 h-2 relative">
              <path d="M2 5 L4.5 7 L8 3" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="relative text-white font-body font-semibold tracking-wide"
              style={{ fontSize: '8px', letterSpacing: '0.05em' }}
            >
              PUBLISH
            </span>
          </div>
          {/* Cursor */}
          <div
            className="absolute w-2 h-2 pointer-events-none"
            style={{
              animation: 'fs-cursor 5s cubic-bezier(0.45, 0, 0.55, 1) infinite',
            }}
          >
            <svg viewBox="0 0 12 12" className="w-full h-full">
              <path d="M1 1 L10 6 L6 7 L5 11 Z" fill="#ffffff" opacity="0.85" stroke="#000" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignPreview({ active }) {
  // 5 "KOL resume" cards — scan through 0..3, land on #4 (the chosen one)
  const RESUMES = [
    { name: '@mira.k',   tag: 'Fashion',   avatar: 'radial-gradient(circle at 35% 30%, #233456 0%, #070d1c 75%)' },
    { name: '@rey.code', tag: 'Tech',      avatar: 'radial-gradient(circle at 35% 30%, #1d2a47 0%, #05091a 75%)' },
    { name: '@nadia.v',  tag: 'Beauty',    avatar: 'radial-gradient(circle at 35% 30%, #2a3c66 0%, #080f24 75%)' },
    { name: '@leo.fit',  tag: 'Fitness',   avatar: 'radial-gradient(circle at 35% 30%, #1f2d4d 0%, #060b1c 75%)' },
    { name: '@sana.tw',  tag: 'Lifestyle', avatar: 'radial-gradient(circle at 35% 30%, #3a5ea0 0%, #0a1430 80%)' }, // the chosen — brighter blue
  ];

  return (
    <div className="w-full h-full relative p-5">
      <style>{`
        @keyframes fs-resume-scan {
          0%    { transform: translateY(0); opacity: 0 }
          6%    { opacity: 1 }
          55%   { transform: translateY(-80%); opacity: 1 }
          93%   { transform: translateY(-80%); opacity: 1 }
          100%  { transform: translateY(-80%); opacity: 0 }
        }
        @keyframes fs-resume-scanline {
          0%,58%   { opacity: 0.8 }
          68%,100% { opacity: 0 }
        }
        @keyframes fs-resume-chosen {
          0%,50%   { box-shadow: 0 0 0 0 rgba(120,170,255,0); background: rgba(255,255,255,0.04); }
          62%,93% { box-shadow: 0 0 0 1.5px rgba(150,200,255,0.9), 0 0 18px rgba(120,170,255,0.35); background: rgba(120,170,255,0.12); opacity: 1 }
          100% { box-shadow: 0 0 0 1.5px rgba(150,200,255,0.9), 0 0 18px rgba(120,170,255,0.35); background: rgba(120,170,255,0.12); opacity: 0 }
        }
        @keyframes fs-resume-check {
          0%,58%   { opacity: 0; transform: scale(0.6); }
          68%,93% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes fs-invite-btn {
          0%,70% { opacity: 0; transform: translateY(10px) }
          78%,85% { opacity: 1; transform: translateY(0) }
          87% { transform: scale(0.94) }
          89% { transform: scale(1.03) }
          91%,100% { opacity: 0; transform: scale(1) }
        }
        @keyframes fs-invite-cursor {
          0%,74% { opacity: 0 }
          78% { opacity: 1; left: 70%; top: 55% }
          86% { opacity: 1; left: 50%; top: 80% }
          87% { transform: scale(0.8) }
          89% { transform: scale(1) }
          90%,100% { opacity: 0; left: 50%; top: 80% }
        }
        @keyframes fs-invite-flash {
          0%,86% { opacity: 0 }
          87.5% { opacity: 0.7 }
          92%,100% { opacity: 0 }
        }
        @keyframes fs-invite-toast {
          0%,88% { opacity: 0; transform: translate(-50%, 8px) }
          90%,94% { opacity: 1; transform: translate(-50%, 0) }
          98%,100% { opacity: 0; transform: translate(-50%, -4px) }
        }
      `}</style>
      <div
        className="rounded-2xl w-full h-full flex flex-col overflow-hidden relative"
        style={{
          background: '#000',
          border: '1px solid rgba(255,255,255,0.08)',
          transform: active ? 'translateY(0)' : 'translateY(10px)',
          opacity: active ? 1 : 0.4,
          transition: 'all 0.6s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
              <circle cx="5" cy="5" r="3" fill="none" stroke="rgba(220,235,255,0.85)" strokeWidth="1" />
              <line x1="7.3" y1="7.3" x2="10" y2="10" stroke="rgba(220,235,255,0.85)" strokeWidth="1" strokeLinecap="round" />
            </svg>
            <span className="text-[9px] uppercase tracking-widest text-white/60 font-body">Scanning KOLs</span>
          </div>
          <span className="text-[9px] text-white/40 font-mono">{RESUMES.length}</span>
        </div>

        {/* Resume list viewport */}
        <div className="relative flex-1 overflow-hidden">
          {/* Moving strip */}
          <div
            className="absolute inset-x-0 top-0 flex flex-col"
            style={{
              height: `${RESUMES.length * 100}%`,
              animation: active ? 'fs-resume-scan 5s cubic-bezier(0.33, 1, 0.68, 1) infinite' : 'none',
            }}
          >
            {RESUMES.map((r, i) => {
              const isChosen = i === RESUMES.length - 1;
              return (
                <div
                  key={i}
                  className="flex-1 flex items-center gap-2 px-3 relative rounded-md mx-1.5 my-0.5"
                  style={{
                    animation: isChosen
                      ? 'fs-resume-chosen 5s ease-in-out infinite'
                      : undefined,
                    background: !isChosen ? 'rgba(255,255,255,0.04)' : undefined,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      background: r.avatar,
                      border: '1px solid rgba(255,255,255,0.12)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="h-1 w-[70%] bg-white/55 rounded-full mb-1" />
                    <div className="h-[3px] w-[45%] bg-white/25 rounded-full" />
                  </div>
                  <span
                    className="text-[7px] font-mono text-white/50 px-1 py-0.5 rounded"
                    style={{
                      letterSpacing: '0.08em',
                      background: 'rgba(255,255,255,0.06)',
                    }}
                  >
                    {r.tag.toUpperCase()}
                  </span>
                  {/* Check badge — only on chosen */}
                  {isChosen && (
                    <div
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg,#a5c9ff,#3a7bff)',
                        animation: 'fs-resume-check 5s ease-in-out infinite',
                      }}
                    >
                      <svg viewBox="0 0 10 10" className="w-2 h-2">
                        <path d="M2 5 L4.5 7 L8 3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Center highlight ring (fixed) */}
          <div
            className="absolute left-1 right-1 top-1/2 -translate-y-1/2 rounded-md pointer-events-none"
            style={{
              height: '24%',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 0 0 3px rgba(10,20,45,0.35) inset',
            }}
          />

          {/* SEND INVITE button — glass, appears after KOL chosen */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-3 px-3 py-1.5 rounded-md overflow-hidden flex items-center gap-1.5 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))',
              border: '1px solid rgba(255,255,255,0.22)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 4px 14px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              animation: active ? 'fs-invite-btn 5s ease-in-out infinite' : 'none',
            }}
          >
            {/* Click flash */}
            <div
              className="absolute inset-0 bg-white pointer-events-none"
              style={{ animation: active ? 'fs-invite-flash 5s ease-in-out infinite' : 'none' }}
            />
            <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 relative">
              <path d="M1.5 6 L10.5 1.5 L8.5 10.5 L6 7 L1.5 6 Z" fill="none" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
            </svg>
            <span
              className="relative text-white font-body font-semibold tracking-wide"
              style={{ fontSize: '8px', letterSpacing: '0.08em' }}
            >
              SEND INVITE
            </span>
          </div>

          {/* Cursor click on invite btn */}
          <div
            className="absolute w-2.5 h-2.5 pointer-events-none"
            style={{ animation: active ? 'fs-invite-cursor 5s ease-in-out infinite' : 'none' }}
          >
            <svg viewBox="0 0 12 12" className="w-full h-full">
              <path d="M1 1 L10 6 L6 7 L5 11 Z" fill="#ffffff" opacity="0.9" stroke="#000" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Invite sent confirmation toast */}
          <div
            className="absolute left-1/2 top-[38%] px-2 py-1 rounded-md flex items-center gap-1 pointer-events-none"
            style={{
              background: 'rgba(40,200,140,0.18)',
              border: '1px solid rgba(120,230,180,0.45)',
              boxShadow: '0 2px 10px rgba(40,200,140,0.25)',
              animation: active ? 'fs-invite-toast 5s ease-in-out infinite' : 'none',
            }}
          >
            <svg viewBox="0 0 10 10" className="w-2 h-2">
              <path d="M2 5 L4.5 7 L8 3" fill="none" stroke="#8effc9" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span
              className="text-[8px] font-body font-semibold"
              style={{ color: '#8effc9', letterSpacing: '0.06em' }}
            >
              INVITE SENT
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

function AnalyticsPreview({ active }) {
  return (
    <div className="w-full h-full relative p-5">
      <style>{`
        /* Continuous stream of dots flowing brand → KOL.
           Each dot shares the same keyframe but starts at a different delay. */
        @keyframes fs-dot-flow {
          0%   { transform: translate(-50%, -50%) translateX(0px);   opacity: 0; }
          10%  { transform: translate(-50%, -50%) translateX(20px);  opacity: 1; }
          60%  { transform: translate(-50%, -50%) translateX(210px); opacity: 1; }
          75%, 100% { transform: translate(-50%, -50%) translateX(210px); opacity: 0; }
        }
        /* Wire dash flowing left → right */
        @keyframes fs-wire-flow {
          from { stroke-dashoffset: 30 }
          to   { stroke-dashoffset: 0 }
        }
        /* Brand subtle pulse — emits */
        @keyframes fs-brand-pulse {
          0%,90%  { box-shadow: 0 0 0 0 rgba(120,170,255,0); }
          50%     { box-shadow: 0 0 0 6px rgba(120,170,255,0.18); }
          100%    { box-shadow: 0 0 0 0 rgba(120,170,255,0); }
        }
        /* KOL box — continuous soft glow pulse (receiving stream) */
        @keyframes fs-kol-glow {
          0%,100% { box-shadow: 0 0 0 1.5px rgba(255,255,255,0.12); background: rgba(255,255,255,0.05); }
          50%     { box-shadow: 0 0 0 1.5px rgba(150,200,255,0.5), 0 0 14px rgba(120,170,255,0.25); background: rgba(120,170,255,0.08); }
        }
        /* Check: gentle pulse throughout */
        @keyframes fs-kol-check {
          0%,100% { opacity: 0.85; transform: scale(1); }
          50%     { opacity: 1; transform: scale(1.12); }
        }
        /* Counters tick up continuously — feels like live stream */
        @keyframes fs-rev-counter {
          0%,19%   { content: "$2,480"; }
          20%,39%  { content: "$2,680"; }
          40%,59%  { content: "$2,840"; }
          60%,79%  { content: "$3,060"; }
          80%,100% { content: "$3,240"; }
        }
        @keyframes fs-kol-counter {
          0%,19%   { content: "+$148"; }
          20%,39%  { content: "+$234"; }
          40%,59%  { content: "+$312"; }
          60%,79%  { content: "+$398"; }
          80%,100% { content: "+$468"; }
        }
        @keyframes fs-pulse-dot {
          0%,100% { opacity: 0.4; }
          50%     { opacity: 1; }
        }
        .fs-rev-num::after  { content: "$2,480"; animation: fs-rev-counter 8s steps(1) infinite; }
        .fs-kol-num::after  { content: "+$148"; animation: fs-kol-counter 8s steps(1) infinite; }
      `}</style>
      <div
        className="rounded-2xl w-full h-full flex flex-col overflow-hidden relative"
        style={{
          background: '#000',
          border: '1px solid rgba(255,255,255,0.08)',
          transform: active ? 'translateY(0)' : 'translateY(10px)',
          opacity: active ? 1 : 0.4,
          transition: 'all 0.6s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full bg-emerald-300"
              style={{ animation: active ? 'fs-pulse-dot 1.4s ease-in-out infinite' : 'none' }}
            />
            <span className="text-[9px] uppercase tracking-widest text-white/60 font-body">Auto-Payout</span>
          </div>
          <span className="text-[9px] text-white/40 font-mono">LIVE</span>
        </div>

        {/* Main canvas */}
        <div className="flex-1 relative overflow-hidden">
          {/* Revenue pill (top) */}
          <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] uppercase tracking-widest text-white/50 font-body">Revenue</span>
            </div>
            <span className="fs-rev-num font-body font-semibold text-white text-lg leading-none tabular-nums" />
          </div>

          {/* Connector wire + coin */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Ghost wire (straight) */}
            <line
              x1="12" y1="52" x2="88" y2="52"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
            />
            {/* Active wire (straight) */}
            <line
              x1="12" y1="52" x2="88" y2="52"
              stroke="url(#fs-wire-grad)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
              style={{
                animation: active ? 'fs-wire-flow 5s linear infinite' : 'none',
              }}
            />
            <defs>
              <linearGradient id="fs-wire-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="rgba(180,210,255,0.1)" />
                <stop offset="0.5" stopColor="rgba(180,210,255,0.9)" />
                <stop offset="1" stopColor="rgba(180,210,255,0.1)" />
              </linearGradient>
            </defs>
          </svg>

          {/* Brand node (left) */}
          <div
            className="absolute left-3 top-[44%] flex items-center gap-1.5"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(120,170,255,0.9), rgba(60,110,220,0.9))',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset',
                animation: active ? 'fs-brand-pulse 5s ease-out infinite' : 'none',
              }}
            >
              <svg viewBox="0 0 12 12" className="w-3 h-3">
                <path d="M3 3 L9 3 L8 9 L4 9 Z" fill="none" stroke="#fff" strokeWidth="1" strokeLinejoin="round" />
                <circle cx="6" cy="6" r="1" fill="#fff" />
              </svg>
            </div>
            <div>
              <div className="text-[8px] text-white/70 font-body leading-tight">Brand</div>
              <div className="text-[7px] font-mono text-white/40 tracking-wider">TX-284</div>
            </div>
          </div>

          {/* Stream of flowing dots — brand → KOL */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: '52px',
                top: '52%',
                width: '6px',
                height: '6px',
                animation: active ? `fs-dot-flow 2.4s linear ${i * 0.48}s infinite` : 'none',
                willChange: 'transform, opacity',
              }}
            >
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: 'radial-gradient(circle, #ffffff 0%, #93c5fd 55%, rgba(120,170,255,0) 100%)',
                  boxShadow: '0 0 6px rgba(180,210,255,0.8)',
                }}
              />
            </div>
          ))}

          {/* KOL node (right) — continuous receiving glow */}
          <div
            className="absolute right-3 top-[38%] rounded-lg px-2 py-1.5 flex items-center gap-1.5"
            style={{
              background: 'rgba(255,255,255,0.05)',
              boxShadow: '0 0 0 1.5px rgba(255,255,255,0.12)',
              animation: active ? 'fs-kol-glow 2.4s ease-in-out infinite' : 'none',
              willChange: 'box-shadow, background',
            }}
          >
            <div
              className="relative w-6 h-6 rounded-full flex-shrink-0"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #3a5ea0 0%, #0a1430 80%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
            >
              {/* Receive check badge */}
              <div
                className="absolute -right-1 -top-1 w-3 h-3 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg,#a5c9ff,#3a7bff)',
                  animation: active ? 'fs-kol-check 2.4s ease-in-out infinite' : 'none',
                }}
              >
                <svg viewBox="0 0 10 10" className="w-2 h-2">
                  <path d="M2 5 L4.5 7 L8 3" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-[8px] text-white/80 font-body leading-tight">@sana.tw</div>
              <div className="text-[8px] font-mono text-emerald-300 tabular-nums leading-tight">
                <span className="fs-kol-num" />
              </div>
            </div>
          </div>

          {/* Footer: split share line */}
          <div className="absolute left-3 right-3 bottom-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8px] uppercase tracking-widest text-white/40 font-body">Revenue Share</span>
              <span className="text-[8px] font-mono text-white/60 tabular-nums">15%</span>
            </div>
            <div className="relative h-[3px] bg-white/8 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: '15%',
                  background: 'linear-gradient(90deg, rgba(120,170,255,0.9), rgba(220,235,255,1))',
                  boxShadow: '0 0 8px rgba(120,170,255,0.5)',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepCard({ step, index, sectionProgress }) {
  const { ref: cardRef, visible: inView } = useRevealOnScroll({
    threshold: [0, 0.3, 0.6],
    minRatio: 0.3,
  });

  const delay = index * 0.12;

  // Preview block
  const Preview =
    step.preview === 'match' ? MatchPreview :
    step.preview === 'campaign' ? CampaignPreview :
    AnalyticsPreview;

  return (
    <div
      ref={cardRef}
      className="relative"
      style={{
        opacity: inView ? 1 : 0,
        transition: `opacity 0.7s ease ${delay}s`,
      }}
    >
      <div className="liquid-glass rounded-3xl overflow-hidden flex flex-col h-full group" style={{ padding: 14 }}>
        {/* Preview area */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3]"
          style={{
            background: 'radial-gradient(ellipse at 50% 35%, rgba(30,50,90,0.35), rgba(0,0,0,0.9))',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Preview active={inView} />
        </div>

        {/* Body */}
        <div className="px-4 pt-5 pb-3">
          {/* Step eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] tracking-[0.25em] text-white/50 font-body font-medium tabular-nums">
              {String(step.n).padStart(2, '0')}
            </span>
            <span className="w-6 h-px bg-white/15" />
            <span className="text-[10px] tracking-[0.25em] text-white/50 font-body uppercase">
              {step.tag}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading italic text-white text-xl md:text-2xl leading-snug mb-2">
            {step.title}
          </h3>

          {/* Body */}
          <p className="font-body font-light text-white/60 text-[13px] leading-relaxed">
            {step.body}
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureSteps() {
  const sectionRef = useRef(null);
  const [sectionProgress, setSectionProgress] = useState(0.5);
  const { ref: headerRef, visible: headerInView } = useRevealOnScroll({
    threshold: [0, 0.3, 0.6],
    minRatio: 0.3,
  });

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when section just enters bottom, 1 when leaving top
      const p = 1 - (rect.top + rect.height / 2) / vh;
      setSectionProgress(Math.max(0, Math.min(1, (p + 0.5) / 1.5)));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <section
      id="start"
      ref={sectionRef}
      className="relative px-6 md:px-12 lg:px-20 py-32 max-w-7xl mx-auto scroll-mt-24"
    >
      {/* Ambient subtle glow */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(40,90,200,0.12), transparent 60%)',
        }}
      />

      {/* Header */}
      <div
        ref={headerRef}
        className="text-center mb-16 md:mb-20"
        style={{
          opacity: headerInView ? 1 : 0,
          transform: `translateY(${headerInView ? 0 : 24}px)`,
          transition: 'opacity 0.9s cubic-bezier(0.2,0.8,0.2,1), transform 0.9s cubic-bezier(0.2,0.8,0.2,1)',
        }}
      >
        <div className="inline-block liquid-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body mb-6">
          How It Works
        </div>
        <h2 className="font-heading text-white tracking-tight leading-[1.1] text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto">
          三個步驟,<span style={{ fontStyle: 'italic' }} className="text-white/90">啟動你的商案</span>
        </h2>
        <p className="mt-5 text-white/70 font-body font-light text-base md:text-lg max-w-xl mx-auto">
          從建立商案到合作與分潤，所有流程集中於同一平台，簡單又高效
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <StepCard
            key={step.n}
            step={step}
            index={i}
            sectionProgress={sectionProgress}
          />
        ))}
      </div>
    </section>
  );
}

export default FeatureSteps;
