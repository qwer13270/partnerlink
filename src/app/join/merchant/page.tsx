'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, BarChart3, CheckCircle2 } from 'lucide-react'

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
  {
    num: '01', icon: <BarChart3 className="h-4 w-4" />,
    title: '刊登商案',
    desc: '上傳商案資料、平面圖與銷售資訊，設定目標受眾與合作佣金條件。',
  },
  {
    num: '02', icon: <Users className="h-4 w-4" />,
    title: '配對專屬 KOL',
    desc: 'HomeKey 依據商案特性，為你媒合最適合的 KOL，由雙方確認合作條件。',
  },
  {
    num: '03', icon: <TrendingUp className="h-4 w-4" />,
    title: 'KOL 開始推廣',
    desc: 'KOL 透過專屬追蹤連結在各社群平台推廣，帶動精準流量至你的商案頁面。',
  },
  {
    num: '04', icon: <CheckCircle2 className="h-4 w-4" />,
    title: '追蹤成效與成交',
    desc: '即時掌握點擊、預約與成交數據，成交後再支付佣金，零風險零浪費。',
  },
]

const BENEFITS = [
  {
    title: '精準觸及目標客群',
    desc: '透過 KOL 的真實粉絲群體，精準接觸有消費意願的潛在買家，告別傳統廣告的高曝光、低轉換。',
  },
  {
    title: '成效透明可追蹤',
    desc: '每一次點擊、每一筆預約、每一組成交，全程追蹤記錄於儀表板，數據真實不造假。',
  },
  {
    title: '只付成效費用',
    desc: '不同於傳統廣告預先燒錢，HomeKey 採成效計費——有成交才有佣金，將行銷預算用在刀口上。',
  },
  {
    title: '120+ 專業 KOL 網絡',
    desc: '涵蓋生活風格、財經、美食等多元領域 KOL，為不同定位的商案找到最合適的推廣聲音。',
  },
]

const FUNNEL_ROWS = [
  { label: '觸及潛在買家', value: '12,400', width: '100%', note: '月均曝光' },
  { label: '連結點擊',     value: '2,847',  width: '73%',  note: '點擊率 23%' },
  { label: '預約看屋',     value: '43',     width: '42%',  note: '轉換率 18.4%' },
  { label: '成交確認',     value: '8',      width: '18%',  note: '成交率 6.5%', gold: true },
]

// ── Page ──────────────────────────────────────────────────────────────────
export default function JoinMerchantPage() {
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
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">商家合作計畫</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            {...fadeUp(0.35)}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-4"
          >
            讓頂級 KOL<br />
            成為你的<span className="text-[#b8936a]">銷售引擎</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            {...fadeUp(0.5)}
            className="text-muted-foreground font-light leading-loose text-base mb-12 max-w-md"
          >
            HomeKey 連結台灣最具影響力的 KOL 與優質商案。<br />
            精準觸及有消費意願的買家，成效透明，只付成交佣金。
          </motion.p>

          {/* CTA buttons */}
          <motion.div {...fadeUp(0.65)} className="flex flex-wrap items-center gap-5">
            <Button
              asChild
              className="rounded-none px-9 h-12 text-xs tracking-widest uppercase bg-foreground text-background hover:bg-foreground/80"
            >
              <Link href="/login">立即刊登商案</Link>
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
              { num: '120',  sup: '+', label: '合作 KOL' },
              { num: '18',   sup: '+', label: '精選商案' },
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

        {/* Right panel — dark decorative */}
        <div className="hidden md:flex relative bg-foreground items-center justify-center overflow-hidden">
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Corner accent lines */}
          <div className="absolute top-10 left-10 w-12 h-12 border-t border-l border-[#c4913a]/40" />
          <div className="absolute bottom-10 right-10 w-12 h-12 border-b border-r border-[#c4913a]/40" />

          {/* Project dashboard card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 bg-[#1a1614]/80 border border-white/10 rounded-sm p-7 w-[320px] backdrop-blur-sm"
            style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.4)' }}
          >
            {/* Card header */}
            <div className="flex items-start justify-between mb-5 pb-5 border-b border-white/10">
              <div>
                <div className="text-[0.65rem] tracking-[2px] uppercase text-white/40 mb-1">商案追蹤</div>
                <div className="text-white font-medium text-sm">信義豪庭</div>
                <div className="text-[0.68rem] text-white/50 mt-0.5">台北市信義區 · 預售中</div>
              </div>
              <div className="text-[0.65rem] bg-[#c4913a]/20 text-[#e8c98a] px-2.5 py-1 rounded-full border border-[#c4913a]/30">
                ● 推廣中
              </div>
            </div>

            {/* Metric grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[
                { val: '2,847', label: '總點擊數',  sub: '↑ 23% 較上月' },
                { val: '43',    label: '預約看屋',  sub: '↑ 8 本週新增' },
                { val: '8',     label: '成交確認',  sub: '本月累計',     gold: true },
                { val: 'NT$320k', label: '佣金支出', sub: '成效計費' },
              ].map((m) => (
                <div
                  key={m.label}
                  className={`rounded-sm p-3 ${m.gold ? 'bg-[#c4913a]/15 border border-[#c4913a]/30' : 'bg-white/5'}`}
                >
                  <div className={`font-serif text-xl font-light leading-none ${m.gold ? 'text-[#e8c98a]' : 'text-white'}`}>
                    {m.val}
                  </div>
                  <div className="text-[0.63rem] text-white/50 tracking-wide mt-1">{m.label}</div>
                  <div className={`text-[0.6rem] mt-0.5 ${m.gold ? 'text-[#c4913a]' : 'text-white/30'}`}>{m.sub}</div>
                </div>
              ))}
            </div>

            {/* KOL row */}
            <div className="flex items-center gap-2 pt-4 border-t border-white/10">
              <div className="text-[0.63rem] text-white/40 tracking-wide">合作 KOL</div>
              <div className="flex -space-x-2 ml-auto">
                {['林', '陳', '王', '張'].map((char, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border border-[#1a1614] flex items-center justify-center text-[0.55rem] font-medium text-white"
                    style={{ background: `hsl(${30 + i * 15}, 45%, ${45 + i * 5}%)` }}
                  >
                    {char}
                  </div>
                ))}
              </div>
              <div className="text-[0.63rem] text-white/40">× 4 位 KOL</div>
            </div>
          </motion.div>

          {/* Leads badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-20 left-12 z-20 bg-background rounded-sm px-5 py-4 border border-border"
          >
            <div className="text-[0.63rem] tracking-[2px] uppercase text-muted-foreground mb-1">本月潛在買家</div>
            <div className="font-serif text-2xl font-light text-foreground">
              12,400 <span className="text-sm text-[#c4913a]">次觸及</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" className="bg-[#f5f0eb] border-y border-border py-24 px-10 md:px-20">
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
                <span className="text-[#b8936a]">開啟銷售新模式</span>
              </motion.h2>
            </div>
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
              className="text-muted-foreground font-light leading-loose text-sm"
            >
              從刊登到成交，HomeKey 全程提供數據支援與 KOL 媒合服務，讓你的商案精準觸及每一位潛在買家。
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
                className="bg-[#f5f0eb] hover:bg-white transition-colors duration-200 p-8 md:p-10"
              >
                <div className="font-serif text-5xl font-light text-border leading-none mb-5">{step.num}</div>
                <div className="w-9 h-9 border border-[#d4b89a] rounded-sm flex items-center justify-center text-[#b8936a] mb-5">
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
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">為何選擇 HomeKey</span>
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-16"
          >
            重新定義<br />
            <span className="text-[#b8936a]">品牌行銷的方式</span>
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-16 items-start">

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

            {/* Funnel visual */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
              className="bg-[#f5f0eb] border border-border rounded-sm p-10 sticky top-28"
            >
              <div className="mb-8">
                <div className="text-[0.68rem] tracking-[2px] uppercase text-muted-foreground mb-2">典型商案成效漏斗</div>
                <div className="font-serif text-4xl font-light leading-none">
                  成交率 <span className="text-[#c4913a]">6.5%</span>
                </div>
                <div className="text-[0.72rem] text-muted-foreground mt-2">傳統廣告行業均值 &lt; 1.2%</div>
              </div>

              <div className="space-y-5 pt-7 border-t border-border">
                {FUNNEL_ROWS.map((row, i) => (
                  <div key={row.label}>
                    <div className="flex items-baseline justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{row.label}</span>
                      <div className="flex items-baseline gap-2">
                        <span className={`font-serif text-base ${row.gold ? 'text-[#c4913a]' : 'text-foreground'}`}>
                          {row.value}
                        </span>
                        <span className="text-[0.63rem] text-muted-foreground">{row.note}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: row.width }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, delay: i * 0.1, ease: 'easeOut' }}
                        className={`h-full rounded-full ${
                          row.gold
                            ? 'bg-gradient-to-r from-[#b8936a] to-[#c4913a]'
                            : 'bg-gradient-to-r from-[#e0d5cc] to-[#d4b89a]'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* ROI note */}
              <div className="mt-8 pt-6 border-t border-border flex items-center gap-3">
                <div className="w-7 h-px bg-[#c4913a]" />
                <p className="text-[0.7rem] text-muted-foreground leading-relaxed">
                  平均每位潛在買家取得成本較傳統廣告降低 <span className="text-foreground font-medium">64%</span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON ── */}
      <section className="bg-[#f5f0eb] border-y border-border py-24 px-10 md:px-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex items-center gap-3 mb-5"
          >
            <div className="w-7 h-px bg-[#c4913a]" />
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">對比傳統行銷</span>
          </motion.div>
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-12"
          >
            不一樣的<span className="text-[#b8936a]">行銷邏輯</span>
          </motion.h2>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="grid md:grid-cols-2 gap-px bg-border border border-border"
          >
            {/* Traditional */}
            <div className="bg-[#f5f0eb] p-10">
              <div className="text-[0.68rem] tracking-[2px] uppercase text-muted-foreground mb-6">傳統廣告模式</div>
              {[
                '先付費，不保成效',
                '曝光廣、轉換低',
                '難以追蹤真實效果',
                '買家缺乏信任感',
                '預算浪費難量化',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                  <div className="w-4 h-px bg-muted-foreground/30" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* HomeKey */}
            <div className="bg-foreground p-10">
              <div className="text-[0.68rem] tracking-[2px] uppercase text-[#c4913a] mb-6">HomeKey KOL 模式</div>
              {[
                '成交後才支付佣金',
                '精準觸及目標受眾',
                '全程數據透明可查',
                'KOL 口碑建立信任',
                '行銷預算零浪費',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 py-3 border-b border-white/10 last:border-0">
                  <div className="w-4 h-px bg-[#c4913a]" />
                  <span className="text-sm text-background/90">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── QUOTE ── */}
      <div className="bg-foreground text-background py-24 px-10 md:px-20 text-center">
        <div className="font-serif text-8xl leading-none text-[#b8936a] opacity-40 mb-8">&ldquo;</div>
        <p className="font-serif text-xl md:text-2xl font-light italic leading-relaxed max-w-2xl mx-auto mb-8 text-[#e8e0d8]">
          HomeKey 讓我們的商案在三個月內累積超過 40 組預約看屋，轉換效率遠高於以往投放的數位廣告。最重要的是，數據完全透明。
        </p>
        <div className="text-[0.72rem] tracking-[2px] uppercase text-muted-foreground">
          <span className="text-[#c4913a] mr-2">—</span>
          張建廷，遠雄建設行銷總監
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
            <span className="text-[0.68rem] tracking-[3px] uppercase text-[#c4913a]">立即合作</span>
          </motion.div>

          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.2] mb-5"
          >
            準備好讓你的商案<br />
            <span className="text-[#b8936a]">觸及更多買家</span>了嗎？
          </motion.h2>

          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="text-muted-foreground font-light leading-loose text-sm mb-12"
          >
            立即刊登商案，HomeKey 團隊將在 1–2 個工作天內<br />
            完成審核並為你配對最適合的合作 KOL。
          </motion.p>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
          >
            <Button
              asChild
              size="lg"
              className="rounded-none px-10 h-12 text-xs tracking-widest uppercase bg-foreground text-background hover:bg-foreground/80"
            >
              <Link href="/login">立即刊登商案</Link>
            </Button>
          </motion.div>

          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="text-[0.7rem] text-muted-foreground mt-5 tracking-wide"
          >
            審核通常於 1–2 個工作天內完成 · 刊登完全免費 · 成交後再支付佣金
          </motion.p>
        </div>
      </section>

    </div>
  )
}
