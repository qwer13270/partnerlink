'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Static data ────────────────────────────────────────────────────────────
const STEPS = [
  { num: '01', icon: '✦', title: '申請加入',    desc: '填寫基本資料，選擇你感興趣的商案類型，完成帳號建立。' },
  { num: '02', icon: '◈', title: '瀏覽商案',    desc: '探索平台上所有合作商案，選擇符合你受眾的專案並提出合作申請。' },
  { num: '03', icon: '⟡', title: '取得推廣連結', desc: '獲得專屬追蹤連結，分享至你的社群平台，每次點擊與預約均可被追蹤。' },
  { num: '04', icon: '◎', title: '收取佣金',    desc: '成交確認後，佣金自動計算並定期撥款至你的帳戶，全程透明可查。' },
]

const BENEFITS = [
  { title: '自訂佣金比例',   desc: '你可以在申請合作時自行設定佣金比例，由商家審核確認，保障雙方利益。' },
  { title: '即時數據儀表板', desc: '點擊、看屋預約、成交數據一目瞭然，掌握每一筆推廣的實際成效。' },
  { title: '嚴選頂級商案',   desc: 'PartnerLink 只與信譽良好的商家合作，讓你的受眾接觸到真正值得信賴的商家品牌。' },
  { title: '零門檻免費加入', desc: '不需要任何費用，只需填寫申請資料，審核通過即可立即開始合作。' },
]

const COMMISSION_BARS = [
  { label: '初階 KOL', width: '35%',  pct: '$20k', gold: false },
  { label: '中階 KOL', width: '62%',  pct: '$65k', gold: false },
  { label: '頂級 KOL', width: '100%', pct: '$200k', gold: true  },
]

const KOL_METRICS = [
  { val: 'NT$84k', label: '本月佣金' },
  { val: '6',      label: '合作商案' },
  { val: '342',    label: '推廣點擊' },
  { val: '12',     label: '看屋預約' },
]

// ── Page ──────────────────────────────────────────────────────────────────
export default function JoinKolPage() {
  return (
    <div className="overflow-x-hidden">

      {/* ── HERO ── */}
      <section className="grid md:grid-cols-2 min-h-screen">

        {/* Left panel */}
        <div className="relative flex flex-col justify-center px-10 py-24 md:px-20">
          {/* Vertical divider */}
          <div className="hidden md:block absolute right-0 top-[15%] bottom-[15%] w-px bg-border" />

          {/* Eyebrow */}
          <motion.div {...fadeUp(0.2)} className="flex items-center gap-3 mb-7">
            <div className="w-8 h-px bg-[#c4913a]" />
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">KOL 合作計畫</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            {...fadeUp(0.35)}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-4"
          >
            用你的影響力<br />
            創造<span className="text-[#b8936a]">真實收益</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.5)}
            className="text-muted-foreground font-light leading-loose text-base mb-12 max-w-md"
          >
            加入 PartnerLink，與台灣各類優質商家合作。<br />
            每一次推薦，都能帶來透明、可追蹤的佣金收入。
          </motion.p>

          {/* CTA buttons */}
          <motion.div {...fadeUp(0.65)} className="flex flex-wrap items-center gap-5">
            <Button
              asChild
              className="rounded-none px-9 h-12 text-xs tracking-widest uppercase bg-foreground text-background hover:bg-foreground/80"
            >
              <Link href="/onboarding">免費申請加入</Link>
            </Button>
            <Link
              href="#how"
              className="group flex items-center gap-3 text-xs tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            >
              了解流程
              <span className="block w-7 h-px bg-current relative transition-all group-hover:w-10">
                <span className="absolute right-0 -top-[3px] block w-1.5 h-1.5 border-r border-t border-current rotate-45" />
              </span>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            {...fadeUp(0.8)}
            className="flex gap-10 mt-16 pt-10 border-t border-border"
          >
            {[
              { num: '120', sup: '+', label: '合作 KOL' },
              { num: '18',  sup: '+', label: '合作商案' },
              { num: '18.4', sup: '%', label: '平均轉換率' },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-serif text-[2.2rem] font-light leading-none">
                  {s.num}
                  <sup className="text-base text-[#c4913a]">{s.sup}</sup>
                </div>
                <div className="text-[0.68rem] tracking-[1.5px] uppercase text-muted-foreground mt-1">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right panel — decorative */}
        <div className="hidden md:flex relative bg-[#f5f0eb] items-center justify-center overflow-hidden">
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                'linear-gradient(#e0d5cc 1px, transparent 1px), linear-gradient(90deg, #e0d5cc 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* KOL card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 bg-white border border-[#e0d5cc] rounded-sm p-8 w-[300px] shadow-2xl"
          >
            {/* Card header */}
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#ede8e3]">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#b8936a] flex items-center justify-center text-white font-serif text-lg shrink-0">
                A
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">陳小安</div>
                <div className="text-[0.68rem] text-muted-foreground tracking-wide mt-0.5">生活風格 · 財經 KOL</div>
              </div>
              <div className="ml-auto text-[0.65rem] bg-green-50 text-green-700 px-2 py-0.5 rounded-full shrink-0">
                ● 合作中
              </div>
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {KOL_METRICS.map((m) => (
                <div key={m.label} className="bg-[#faf7f4] rounded-sm p-3">
                  <div className="font-serif text-[1.4rem] font-light leading-none">{m.val}</div>
                  <div className="text-[0.63rem] text-muted-foreground tracking-wide uppercase mt-1">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="flex justify-between text-[0.7rem] text-muted-foreground mb-1.5">
              <span>本月目標完成度</span>
              <span className="text-[#c4913a]">72%</span>
            </div>
            <div className="h-1 bg-[#ede8e3] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '72%' }}
                transition={{ duration: 1.2, delay: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#d4b89a] to-[#c4913a]"
              />
            </div>
          </motion.div>

          {/* Earnings badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-20 right-12 z-20 bg-foreground text-background rounded-sm px-5 py-4"
          >
            <div className="text-[0.63rem] tracking-[2px] uppercase text-muted-foreground mb-1">累積收益</div>
            <div className="font-serif text-2xl font-light text-[#e8c98a]">NT$420,000</div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="py-24 px-10 md:px-20" style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }}>
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="grid md:grid-cols-2 gap-16 items-end mb-16">
            <div>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
                className="flex items-center gap-3 mb-5"
              >
                <div className="w-7 h-px bg-[#c4913a]" />
                <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">合作流程</span>
              </motion.div>
              <motion.h2
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
                className="font-serif text-4xl md:text-5xl font-light leading-[1.2]"
              >
                四個步驟<br />
                <span className="text-[#b8936a]">開始賺取佣金</span>
              </motion.h2>
            </div>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
              className="text-muted-foreground font-light leading-loose text-sm"
            >
              從申請到收款，PartnerLink 提供全程透明的追蹤機制，讓你專注於創作，我們負責其餘的一切。
            </motion.p>
          </div>

          {/* Steps */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="grid grid-cols-2 md:grid-cols-4 border border-border divide-x divide-y md:divide-y-0 divide-border"
          >
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="bg-background hover:bg-[#f5f0eb] transition-colors duration-200 p-8 md:p-10"
              >
                <div className="font-serif text-5xl font-light text-[#c4913a]/35 leading-none mb-5">{step.num}</div>
                <div className="w-9 h-9 border border-[#c4913a]/40 rounded-sm flex items-center justify-center text-[#b8936a] mb-5 text-base">
                  {step.icon}
                </div>
                <div className="text-sm font-medium mb-2">{step.title}</div>
                <div className="text-xs text-muted-foreground leading-loose">{step.desc}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-24 px-10 md:px-20">
        <div className="max-w-5xl mx-auto">

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-7 h-px bg-[#c4913a]" />
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">為何選擇 PartnerLink</span>
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-16"
          >
            專為 KOL 設計的<br />
            <span className="text-[#b8936a]">合作生態</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Benefit list */}
            <div>
              {BENEFITS.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } },
                  }}
                  className="grid grid-cols-[40px_1fr] gap-5 py-7 border-b border-border first:border-t hover:pl-2 transition-all duration-200 cursor-default"
                >
                  <span className="font-serif text-sm text-muted-foreground pt-0.5">0{i + 1}</span>
                  <div>
                    <div className="text-sm font-medium mb-1.5">{b.title}</div>
                    <div className="text-xs text-muted-foreground leading-loose">{b.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Commission visual */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
              className="rounded-sm p-10"
              style={{
                background: 'hsl(var(--background))',
                border: '1px solid rgba(26,26,26,0.14)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <div className="mb-8">
                <div className="text-[0.68rem] tracking-[2px] uppercase text-muted-foreground mb-2">平均 KOL 月收益</div>
                <div className="font-serif text-5xl font-light leading-none">
                  NT$65,000<span className="text-xl text-[#c4913a]">+</span>
                </div>
                <div className="text-[0.72rem] text-muted-foreground mt-2">根據過去 6 個月合作 KOL 數據</div>
              </div>

              <div className="space-y-4 pt-7 border-t border-border">
                {COMMISSION_BARS.map((bar) => (
                  <div
                    key={bar.label}
                    className="grid grid-cols-[80px_1fr_50px] gap-3 items-center text-xs text-muted-foreground"
                  >
                    <span>{bar.label}</span>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: bar.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          bar.gold
                            ? 'bg-gradient-to-r from-[#b8936a] to-[#c4913a]'
                            : 'bg-gradient-to-r from-[#d4b89a] to-[#b8936a]'
                        }`}
                      />
                    </div>
                    <span className="font-serif text-sm text-foreground text-right">{bar.pct}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <div className="bg-foreground text-background py-24 px-10 md:px-20 text-center">
        <div className="font-serif text-8xl leading-none text-[#b8936a] opacity-40 mb-8">&ldquo;</div>
        <p className="font-serif text-xl md:text-2xl font-light italic leading-relaxed max-w-2xl mx-auto mb-8 text-[#e8e0d8]">
          加入 PartnerLink 之後，我不需要再主動找廠商談合作。平台上的商案資訊清楚、佣金透明，讓我可以專心做內容。
        </p>
        <div className="text-[0.72rem] tracking-[2px] uppercase text-muted-foreground">
          <span className="text-[#c4913a] mr-2">—</span>
          林小雨，生活風格 KOL · 粉絲數 28 萬
        </div>
      </div>

      {/* ── CTA ── */}
      <section id="join" className="py-32 px-10 md:px-20 text-center border-t border-border">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex items-center justify-center gap-3 mb-5"
          >
            <div className="w-7 h-px bg-[#c4913a]" />
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">立即加入</span>
          </motion.div>

          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-5"
          >
            準備好開始<br />
            <span className="text-[#b8936a]">你的第一筆合作</span>了嗎？
          </motion.h2>

          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="text-muted-foreground font-light leading-loose text-sm mb-12"
          >
            現在申請加入 PartnerLink KOL 計畫，免費建立帳號，<br />
            立即瀏覽所有合作商案並開始創造收益。
          </motion.p>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
          >
            <Button
              asChild
              size="lg"
              className="rounded-none px-10 h-12 text-xs tracking-widest uppercase bg-foreground text-background hover:bg-foreground/80"
            >
              <Link href="/onboarding">免費申請加入</Link>
            </Button>
          </motion.div>

          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="text-[0.7rem] text-muted-foreground mt-5 tracking-wide"
          >
            審核通常於 1–2 個工作天內完成 · 完全免費 · 無需信用卡
          </motion.p>
        </div>
      </section>

    </div>
  )
}
