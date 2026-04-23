// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

// FaqSection — "常見問題" (FAQ) two-column section:
// Left: sticky intro card ("Still Have Questions?")
// Right: accordion of Q&A items using liquid-glass chips.

const FAQS = [
  {
    q: '平台支援哪些類型的合作案？',
    a: '我們支援各類品牌合作，包含建案、品牌商品、傳產等，各種 B2C 與 B2B 合作案皆可透過平台媒合。無論您是推廣新建案、實體商品，或是專業服務，PartnerLink 都能協助您找到合適的 KOL 夥伴。',
  },
  {
    q: '如果已經有現有網頁，能串接到 PartnerLink 平台嗎？',
    a: '此功能目前正在開發中，未來將開放 API 串接與自訂網域整合。現階段建議先使用我們提供的網站模板，快速建立專屬品牌頁面開始合作。',
  },
  {
    q: 'KOL 的佣金與服務費如何計算？會有隱藏費用嗎？',
    a: '費用完全透明，無任何隱藏收費。建案方案成交時收取 2-0.5% 服務費（依方案而定）；商案方案則依合作類型收取互惠中介費或業配服務費。KOL 佣金 100% 歸 KOL 所有，PartnerLink 不從 KOL 端抽成。',
  },
  {
    q: '如何媒合到適合我品牌的 KOL？',
    a: '平台內建 AI 客群分析系統，會根據您的商品屬性、目標客群與地區，自動推薦合適的 KOL 人選。您也可以主動瀏覽 KOL 資料庫，依粉絲數、合作領域、過往成效等條件篩選，並直接發送合作邀請。',
  },
  {
    q: '成交或合作款項何時撥款？退款政策為何？',
    a: '成交案件確認後，款項將於 7 個工作天內結算至您的帳戶。若合作過程中發生爭議（如 KOL 未依約執行、交易取消等），平台提供爭議處理機制，相關款項將暫緩撥付直至雙方達成共識。詳細條款請參閱服務合約。',
  },
];

function FaqItem({ item, isOpen, onClick, index }) {
  return (
    <div
      className="liquid-glass rounded-2xl overflow-hidden"
      style={{
        transition: 'background 0.3s ease',
      }}
    >
      <button
        type="button"
        onClick={onClick}
        className="w-full px-5 md:px-6 py-4 flex items-center justify-between gap-4 text-left group"
        style={{ cursor: 'pointer' }}
      >
        <span className="font-body text-white text-sm md:text-base leading-snug">
          {item.q}
        </span>
        <span
          className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.06)',
            transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 3.5L5 6.5L8 3.5"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white/70"
            />
          </svg>
        </span>
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden', minHeight: 0 }}>
          <div className="px-5 md:px-6 pb-5 pt-0">
            <div className="h-px bg-white/10 mb-4" />
            <p className="font-body font-light text-white/65 text-sm md:text-base leading-relaxed">
              {item.a}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState(-1);

  return (
    <section id="faq" className="relative px-6 md:px-12 lg:px-20 py-32 md:py-40 max-w-7xl mx-auto scroll-mt-24">
      {/* Heading */}
      <div className="text-center mb-16 md:mb-20">
        {/* Eyebrow tag */}
        <div className="inline-flex items-center gap-2 liquid-glass rounded-full px-4 py-1.5 mb-8">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.1" className="text-white/70" />
            <path
              d="M5.3 5.6c0-.9.8-1.6 1.7-1.6.9 0 1.7.7 1.7 1.6 0 .65-.4 1-1 1.35-.4.25-.7.5-.7 1.05M7 9.8v.05"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              className="text-white/70"
            />
          </svg>
          <span className="text-[11px] tracking-[0.25em] text-white/70 font-body uppercase">
            FAQ
          </span>
        </div>

        <h2 className="font-heading text-white tracking-tight leading-[1.05] text-4xl md:text-5xl lg:text-6xl max-w-4xl mx-auto">
          常見{' '}
          <span className="italic">問題</span>
        </h2>

        <p className="mt-6 text-white/65 font-body font-light text-base md:text-lg max-w-xl mx-auto">
          解答你對平台最常見的疑惑，讓你更快上手。
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 md:gap-8">
        {/* LEFT — Still have questions card */}
        <div className="h-full">
          <div className="liquid-glass rounded-3xl p-8 md:p-10 h-full flex flex-col items-center justify-center text-center">
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'radial-gradient(circle at 35% 30%, rgba(140,190,255,0.25) 0%, rgba(20,40,80,0.4) 70%)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 0 30px rgba(140,190,255,0.15)',
              }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="8.5" stroke="currentColor" strokeWidth="1.3" className="text-white/80" />
                <path
                  d="M8.5 8.8c0-1.4 1.2-2.5 2.6-2.5 1.4 0 2.6 1.1 2.6 2.5 0 1.05-.7 1.65-1.5 2.15-.6.4-1.1.8-1.1 1.7M11 15.7v.05"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  className="text-white/80"
                />
              </svg>
            </div>

            <h3 className="font-heading italic text-white text-2xl md:text-3xl leading-[1.1] tracking-tight mb-3">
              還有問題嗎？
            </h3>

            <p className="font-body font-light text-white/60 text-sm leading-relaxed max-w-[260px]">
              如果你還有其他想了解的地方，歡迎隨時聯絡我們。
            </p>

            <a
              href="#contact"
              className="mt-8 liquid-glass-strong rounded-full px-5 py-2.5 text-sm font-body font-medium text-white flex items-center gap-2 hover:brightness-110 transition"
            >
              聯絡我們
              {ArrowUpRight ? <ArrowUpRight size={14} /> : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 10L10 4M10 4H5M10 4V9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </a>
          </div>
        </div>

        {/* RIGHT — Accordion list */}
        <div className="flex flex-col gap-3 md:gap-4">
          {FAQS.map((item, i) => (
            <FaqItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default FaqSection;
