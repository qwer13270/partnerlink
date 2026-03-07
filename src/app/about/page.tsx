'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// ── Animation helpers ─────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Data ──────────────────────────────────────────────────────────────────────
const STATS = [
  { num: '2023', label: '成立年份' },
  { num: '120+', label: '合作 KOL' },
  { num: '18+',  label: '精選商案' },
  { num: '18.4%', label: '平均轉換率' },
]

const VALUES = [
  {
    num: '01',
    title: '透明為本',
    desc: '每一次點擊、每一筆預約、每一組成交，全程追蹤記錄於儀表板。數據真實不造假，合作才能長久。',
  },
  {
    num: '02',
    title: '成效優先',
    desc: '我們不收預付廣告費，只在成交後收取佣金。HomeKey 的利益與你的成效完全一致，我們一起贏。',
  },
  {
    num: '03',
    title: '精準媒合',
    desc: '不廣撒網，而是精準連結。我們為每個商案找到最契合的 KOL 聲音，讓每一次合作都物超所值。',
  },
]

const TIMELINE = [
  { year: '2023 Q1', event: '創立 HomeKey，完成種子輪融資' },
  { year: '2023 Q3', event: '上線首批 20 位合作 KOL，媒合第一筆成交' },
  { year: '2024 Q1', event: '平台累積破百位 KOL，擴展至桃園、台中市場' },
  { year: '2024 Q3', event: '推出即時儀表板，數據追蹤精度提升至分鐘級' },
  { year: '2025',    event: '持續擴展全台版圖，目標覆蓋六都主要建案市場' },
]

const TEAM = [
  {
    name: '陳建宏',
    role: '共同創辦人 & CEO',
    bio: '前信義房屋數位長，深耕台灣不動產市場逾十年，主導多項數位轉型計畫。',
    initial: '陳',
  },
  {
    name: '林佩儀',
    role: '共同創辦人 & CPO',
    bio: '前 Line 台灣產品總監，致力打造直覺易用的平台體驗，深信好設計能改變行為。',
    initial: '林',
  },
  {
    name: '王志明',
    role: 'CTO',
    bio: '前 91APP 技術架構師，主導平台追蹤系統與數據基礎設施，確保每筆數據精準可靠。',
    initial: '王',
  },
  {
    name: '張雅婷',
    role: 'KOL 生態總監',
    bio: '深耕社群媒體行銷八年，建立並維護台灣最活躍的 KOL 不動產合作網絡。',
    initial: '張',
  },
]

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ══ HERO ══ */}
      <section className="grid md:grid-cols-2 min-h-[88vh]">

        {/* Left */}
        <div className="relative flex flex-col justify-center px-10 py-24 md:px-20">
          <div className="hidden md:block absolute right-0 top-[15%] bottom-[15%] w-px bg-border" />

          <motion.div {...fadeUp(0.15)} className="flex items-center gap-3 mb-8">
            <div className="w-8 h-px" style={{ background: '#c4913a' }} />
            <span className="text-[0.68rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>
              關於 HomeKey
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp(0.3)}
            className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] font-light leading-[1.1] mb-6"
          >
            重新定義<br />
            台灣房市的<br />
            <span style={{ color: '#b8936a' }}>合作方式</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.45)}
            className="text-muted-foreground font-light leading-loose text-base mb-12 max-w-md"
          >
            HomeKey 誕生於一個簡單的信念：<br />
            行銷費用應該只在帶來真實成效時才被支付。<br />
            我們連結台灣最具影響力的 KOL 與優質建案，<br />
            讓每一分預算都花在刀口上。
          </motion.p>

          <motion.div
            {...fadeUp(0.55)}
            className="flex gap-10 pt-10"
            style={{ borderTop: '1px solid rgba(26,26,26,0.1)' }}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-[2rem] font-light leading-none">
                  {s.num}
                </div>
                <div className="text-[0.63rem] tracking-[2px] uppercase text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right — dark panel */}
        <div className="hidden md:flex relative bg-foreground items-center justify-center overflow-hidden">
          {/* Grid texture */}
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />
          {/* Corner accents */}
          <div className="absolute top-10 left-10 w-10 h-10 border-t border-l" style={{ borderColor: 'rgba(196,145,58,0.35)' }} />
          <div className="absolute bottom-10 right-10 w-10 h-10 border-b border-r" style={{ borderColor: 'rgba(196,145,58,0.35)' }} />

          {/* Manifesto card */}
          <motion.div
            {...fadeUp(0.7)}
            className="relative z-10 max-w-sm px-10 text-center"
          >
            <div
              className="font-serif text-7xl leading-none mb-8 opacity-25"
              style={{ color: '#c4913a' }}
            >
              &ldquo;
            </div>
            <p className="font-serif text-xl font-light italic leading-relaxed mb-8" style={{ color: '#e8e0d8' }}>
              房市行銷不該是賭注。<br />
              每一分預算，<br />
              都應該帶來<br />
              可量化的回報。
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-px" style={{ background: '#c4913a' }} />
              <span className="text-[0.65rem] tracking-[2px] uppercase" style={{ color: 'rgba(196,145,58,0.7)' }}>
                HomeKey 創立宗旨
              </span>
              <div className="w-6 h-px" style={{ background: '#c4913a' }} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ STORY ══ */}
      <section className="py-28 px-10 md:px-20" style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-[1fr_380px] gap-20 items-start">

            {/* Left: running text */}
            <div>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
                className="flex items-center gap-3 mb-6"
              >
                <div className="w-7 h-px" style={{ background: '#c4913a' }} />
                <span className="text-[0.68rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>
                  我們的故事
                </span>
              </motion.div>

              <motion.h2
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
                className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-10"
              >
                從一個問題<br />
                <span style={{ color: '#b8936a' }}>出發的平台</span>
              </motion.h2>

              {[
                '2023 年初，我們在與多位建商朋友的對話中，反覆聽到同一個痛點：數位廣告費用不斷攀升，但轉換率始終低迷，預算幾乎是在「賭博」。',
                '與此同時，我們也觀察到一個現象——台灣有一群具有真實影響力的 KOL，他們的粉絲信任度遠高於任何廣告版位，卻沒有一個平台能有效媒合他們與不動產建商合作。',
                '於是 HomeKey 誕生了。我們建立一套完整的追蹤機制，讓每一次推薦、每一筆點擊、每一組預約都清晰可查。商家只在成交後付費，KOL 的每一次推廣都能帶來透明的佣金回報。',
                '這不只是一個媒合平台，而是一種新的合作哲學：讓所有參與方的利益真正一致，讓台灣的房市行銷更誠信、更有效率。',
              ].map((text, i) => (
                <motion.p
                  key={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const } },
                  }}
                  className="text-muted-foreground font-light leading-loose text-sm mb-6 last:mb-0"
                >
                  {text}
                </motion.p>
              ))}
            </div>

            {/* Right: timeline */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
              className="md:sticky md:top-28"
            >
              <div
                className="p-8"
                style={{
                  border: '1px solid rgba(26,26,26,0.14)',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                }}
              >
                <div className="text-[0.65rem] tracking-[2px] uppercase text-muted-foreground mb-7">
                  發展里程碑
                </div>
                <div className="space-y-0">
                  {TIMELINE.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[80px_1fr] gap-4 py-4"
                      style={{ borderTop: i > 0 ? '1px solid rgba(26,26,26,0.06)' : undefined }}
                    >
                      <div className="text-[0.65rem] tracking-wide font-medium" style={{ color: '#c4913a' }}>
                        {item.year}
                      </div>
                      <div className="text-xs text-muted-foreground leading-relaxed">
                        {item.event}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ VALUES ══ */}
      <section className="py-28 px-10 md:px-20" style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-7 h-px" style={{ background: '#c4913a' }} />
            <span className="text-[0.68rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>
              核心理念
            </span>
          </motion.div>

          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-16"
          >
            我們相信的<br />
            <span style={{ color: '#b8936a' }}>三件事</span>
          </motion.h2>

          <div>
            {VALUES.map((v, i) => (
              <motion.div
                key={v.num}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const } },
                }}
                className="grid grid-cols-[56px_1fr] md:grid-cols-[80px_1fr_1fr] gap-6 md:gap-12 py-8 hover:pl-2 transition-all duration-200 cursor-default"
                style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}
              >
                <div className="font-serif text-3xl font-light leading-none" style={{ color: 'rgba(196,145,58,0.35)' }}>
                  {v.num}
                </div>
                <div className="text-base font-medium tracking-wide pt-1">{v.title}</div>
                <div className="text-sm text-muted-foreground leading-loose col-span-2 md:col-span-1">{v.desc}</div>
              </motion.div>
            ))}
            <div style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }} />
          </div>
        </div>
      </section>

      {/* ══ TEAM ══ */}
      <section className="py-28 px-10 md:px-20" style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-7 h-px" style={{ background: '#c4913a' }} />
            <span className="text-[0.68rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>
              核心團隊
            </span>
          </motion.div>

          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-16"
          >
            打造 HomeKey<br />
            <span style={{ color: '#b8936a' }}>的人們</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } },
                }}
                className="flex items-start gap-6 p-7"
                style={{
                  background: '#0f0f0f',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {/* Avatar */}
                <div
                  className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center font-serif text-lg font-light"
                  style={{
                    background: 'linear-gradient(135deg, rgba(196,145,58,0.3), rgba(196,145,58,0.1))',
                    border: '1px solid rgba(196,145,58,0.3)',
                    color: '#e8c98a',
                  }}
                >
                  {member.initial}
                </div>

                <div className="min-w-0">
                  <div className="text-white font-medium text-sm mb-0.5">{member.name}</div>
                  <div
                    className="text-[0.65rem] tracking-[1.5px] uppercase mb-3"
                    style={{ color: '#c4913a' }}
                  >
                    {member.role}
                  </div>
                  <p className="text-xs leading-loose" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    {member.bio}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ DUAL CTA ══ */}
      <section className="py-28 px-10 md:px-20" style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-7 h-px" style={{ background: '#c4913a' }} />
            <span className="text-[0.68rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>
              立即加入
            </span>
          </motion.div>

          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-14"
          >
            找到你在<br />
            <span style={{ color: '#b8936a' }}>HomeKey 的位置</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* KOL path */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] as const } } }}
            >
              <Link href="/join/kol" className="group block p-10 border border-black/10 transition-all duration-300 hover:border-[#c4913a]/30 hover:shadow-lg">
                <div className="text-[0.65rem] tracking-[2.5px] uppercase mb-4" style={{ color: '#c4913a' }}>
                  KOL 方案
                </div>
                <h3 className="font-serif text-2xl font-light mb-4">
                  用影響力<br />創造真實收益
                </h3>
                <p className="text-sm text-muted-foreground leading-loose mb-8">
                  加入台灣最大的不動產 KOL 合作網絡。每次推薦帶來透明可追蹤的佣金，讓創作力直接轉化為收入。
                </p>
                <div className="flex items-center gap-2 text-xs tracking-wide text-muted-foreground transition-colors duration-200 group-hover:text-foreground">
                  <span>了解 KOL 方案</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            </motion.div>

            {/* Merchant path */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const } } }}
            >
              <Link href="/join/merchant" className="group block p-10 transition-all duration-300 hover:shadow-xl"
                style={{
                  background: '#0f0f0f',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="text-[0.65rem] tracking-[2.5px] uppercase mb-4" style={{ color: '#c4913a' }}>
                  商家方案
                </div>
                <h3 className="font-serif text-2xl font-light mb-4 text-white">
                  讓頂級 KOL<br />成為銷售引擎
                </h3>
                <p className="text-sm leading-loose mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  刊登商案，HomeKey 為你媒合最適合的 KOL。成交後才付佣金，零風險啟動精準行銷。
                </p>
                <div
                  className="flex items-center gap-2 text-xs tracking-wide transition-colors duration-200"
                  style={{ color: 'rgba(196,145,58,0.7)' }}
                >
                  <span className="group-hover:text-[#c4913a] transition-colors">了解商家方案</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#c4913a]" />
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}
