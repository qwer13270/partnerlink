'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import strings from '@/lib/strings'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

// Detects Supabase auth error redirects that land on the site root
// (happens when emailRedirectTo URL is not in the Supabase allowlist or OTP expires)
function AuthErrorRedirect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorCode = searchParams.get('error_code') ?? searchParams.get('error')
    if (!errorCode) return
    const params = new URLSearchParams()
    params.set('error_code', errorCode)
    const desc = searchParams.get('error_description')
    if (desc) params.set('error_description', desc)
    router.replace(`/auth/error?${params}`)
  }, [router, searchParams])

  return null
}

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const reveal = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
}

const slideIn = (delay = 0) => ({
  hidden:  { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const } },
})

// ── Static data ────────────────────────────────────────────────────────────
const PLATFORM_STATS = [
  { value: '120', sup: '+', label: '合作 KOL'   },
  { value: '18',  sup: '+', label: '合作商案'   },
  { value: '2,600', sup: '+', label: '看屋預約' },
  { value: '18.4', sup: '%', label: '平均轉換率' },
]

const HOW_STEPS = [
  { num: '01', title: 'KOL 申請加入',   desc: '填寫資料，審核通過後即可瀏覽全部商案並提出合作申請。'         },
  { num: '02', title: '商家刊登商案',   desc: '設定佣金比例，審核 KOL 合作申請，掌握完整推廣活動。'         },
  { num: '03', title: '推廣與即時追蹤', desc: '專屬連結記錄每次點擊、看屋預約與成交，數據全程可見。'         },
  { num: '04', title: '佣金自動計算',   desc: '成交確認後自動計算佣金，定期撥款至帳戶，全程透明可查。'       },
]

const KOL_FEATURES = [
  '即時點擊、預約與成交追蹤',
  'KOL 分級制度，佣金結構透明',
  '豐富素材包，降低創作門檻',
  '免費加入，審核 1–2 天內完成',
]

const MERCHANT_FEATURES = [
  '精準觸及高意向潛在買家',
  '按成效付費，投入風險可控',
  'KOL 審核權由商家全程掌握',
  '完整後台數據與月度報表',
]

// ── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const t = strings.landing

  return (
    <div className="overflow-x-hidden">
      <Suspense fallback={null}>
        <AuthErrorRedirect />
      </Suspense>

      {/* ══════════════════════════════════════════════════════
          HERO — light, full-width, centered
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden bg-background"
      >
        {/* Soft radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(196,145,58,0.06) 0%, transparent 65%)',
          }}
        />

        {/* Eyebrow — centered with flanking lines */}
        <motion.div {...fadeUp(0.15)} className="flex items-center gap-4 mb-12">
          <div className="w-8 h-px bg-[#c4913a]/50" />
          <span className="text-[0.72rem] tracking-[3px] uppercase text-[#c4913a]">
            {t.hero.badge}
          </span>
          <div className="w-8 h-px bg-[#c4913a]/50" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          {...fadeUp(0.3)}
          className="font-serif text-5xl md:text-7xl lg:text-[5.5rem] font-light leading-[1.05] text-foreground mb-6 max-w-4xl"
        >
          讓每一次推薦<br />
          <span style={{ color: '#c4913a' }}>創造真實價值</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.45)}
          className="font-light text-base leading-loose mb-14 max-w-md text-muted-foreground"
        >
          {t.hero.subtitle}
        </motion.p>

        {/* CTA pair */}
        <motion.div {...fadeUp(0.6)} className="flex flex-wrap justify-center items-center gap-4 mb-24">
          <Link
            href="/join/kol"
            className="group inline-flex items-center gap-2.5 text-[0.78rem] tracking-[2px] uppercase px-8 py-3.5 border border-foreground/20 text-foreground hover:border-[#c4913a] hover:text-[#c4913a] transition-colors duration-200"
          >
            {t.hero.ctaPrimary}
            <ArrowUpRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
          <Link
            href="/join/merchant"
            className="inline-flex items-center gap-2.5 text-[0.78rem] tracking-[2px] uppercase px-8 py-3.5 text-white hover:bg-[#b8936a] transition-colors duration-200"
            style={{ background: '#c4913a' }}
          >
            {t.hero.ctaSecondary}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>

        {/* Stats grid — big numbers separated by fine verticals */}
        <motion.div
          {...fadeUp(0.75)}
          className="w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 border-t border-foreground/[0.08]"
        >
          {PLATFORM_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className="py-8 text-center"
              style={{ borderRight: i < 3 ? '1px solid hsl(var(--foreground) / 0.08)' : undefined }}
            >
              <div className="font-serif text-3xl md:text-4xl font-light leading-none text-foreground">
                {stat.value}
                <sup className="text-sm" style={{ color: '#c4913a' }}>{stat.sup}</sup>
              </div>
              <div className="text-[0.7rem] tracking-[2px] uppercase mt-2 text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — dark, horizontal step rows
      ══════════════════════════════════════════════════════ */}
      <section
        className="px-10 md:px-20 py-24"
        style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Section label */}
          <div className="flex items-center gap-3 mb-16" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.5rem' }}>
            <span className="text-[0.7rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>平台運作方式</span>
            <span className="text-[0.7rem] tracking-[2px] uppercase ml-auto" style={{ color: '#3a332d' }}>4 個步驟</span>
          </div>

          {/* Step rows */}
          <div>
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={slideIn(i * 0.07)}
                className="grid items-start py-7 group cursor-default"
                style={{
                  gridTemplateColumns: '72px 1fr 1.6fr',
                  gap: '2rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span
                  className="font-serif text-[2.8rem] font-light leading-none transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                >
                  {step.num}
                </span>
                <div
                  className="text-sm font-medium pt-1 leading-snug transition-colors duration-200"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  {step.title}
                </div>
                <div className="text-[0.75rem] leading-loose" style={{ color: '#6a6058' }}>
                  {step.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          DUAL ROLE — centered content, 50/50 split
      ══════════════════════════════════════════════════════ */}
      <section className="grid md:grid-cols-2 border-y border-foreground/10">

        {/* KOL — white */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
          className="flex flex-col items-center text-center px-10 py-24 md:px-16 border-r border-foreground/10"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-5 h-px bg-[#c4913a]/40" />
            <span className="text-[0.7rem] tracking-[3px] uppercase text-muted-foreground">
              KOL 合作計畫
            </span>
            <div className="w-5 h-px bg-[#c4913a]/40" />
          </div>
          <h2 className="font-serif text-3xl md:text-[2.4rem] font-light leading-[1.2] mb-5">
            用影響力<br />
            <span className="text-[#b8936a]">創造穩定收益</span>
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-10 max-w-xs">
            與頂級建案合作，取得專屬推廣連結，每次成交自動計算佣金，完全透明可追蹤。
          </p>

          <div className="space-y-3 mb-12 w-full max-w-xs">
            {KOL_FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={slideIn(i * 0.06)}
                className="flex items-center justify-center gap-3 text-xs text-muted-foreground"
              >
                <div className="w-1 h-1 rounded-full bg-[#c4913a] shrink-0" />
                {f}
              </motion.div>
            ))}
          </div>

          <Link
            href="/join/kol"
            className="group inline-flex items-center gap-2 text-[0.75rem] tracking-[2px] uppercase text-foreground transition-colors duration-200 hover:text-[#c4913a]"
            style={{ borderBottom: '1px solid currentColor', paddingBottom: '2px' }}
          >
            {t.cta.primary}
            <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>

        {/* Merchant — very light grey */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
          className="flex flex-col items-center text-center px-10 py-24 md:px-16"
          style={{ background: '#f7f6f4' }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-5 h-px bg-[#c4913a]/40" />
            <span className="text-[0.7rem] tracking-[3px] uppercase text-muted-foreground">
              商家合作方案
            </span>
            <div className="w-5 h-px bg-[#c4913a]/40" />
          </div>
          <h2 className="font-serif text-3xl md:text-[2.4rem] font-light leading-[1.2] mb-5">
            精準觸及<br />
            <span className="text-[#b8936a]">高意向買家</span>
          </h2>
          <p className="text-sm text-muted-foreground font-light leading-relaxed mb-10 max-w-xs">
            透過 KOL 聯盟將商案推送至精準受眾，按成效付費，全程透明，由商家掌控合作流程。
          </p>

          <div className="space-y-3 mb-12 w-full max-w-xs">
            {MERCHANT_FEATURES.map((f, i) => (
              <motion.div
                key={f}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={slideIn(i * 0.06)}
                className="flex items-center justify-center gap-3 text-xs text-muted-foreground"
              >
                <div className="w-1 h-1 rounded-full bg-[#c4913a] shrink-0" />
                {f}
              </motion.div>
            ))}
          </div>

          <Link
            href="/join/merchant"
            className="group inline-flex items-center gap-2 text-[0.75rem] tracking-[2px] uppercase text-foreground transition-colors duration-200 hover:text-[#c4913a]"
            style={{ borderBottom: '1px solid currentColor', paddingBottom: '2px' }}
          >
            {t.cta.secondary}
            <ArrowUpRight className="h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </section>


      {/* ══════════════════════════════════════════════════════
          FINAL CTA — dark, centered, minimal
      ══════════════════════════════════════════════════════ */}
      <section
        className="relative px-10 py-32 text-center overflow-hidden"
        style={{ background: '#0f0f0f' }}
      >
        {/* Radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 55% 45% at 50% 50%, rgba(196,145,58,0.07) 0%, transparent 65%)',
          }}
        />

        <div className="relative z-10 max-w-xl mx-auto">
          {/* Eyebrow */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex justify-center items-center gap-4 mb-8"
          >
            <div className="w-6 h-px" style={{ background: 'rgba(196,145,58,0.4)' }} />
            <span className="text-[0.7rem] tracking-[3px] uppercase" style={{ color: '#c4913a' }}>立即開始</span>
            <div className="w-6 h-px" style={{ background: 'rgba(196,145,58,0.4)' }} />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.15] mb-5"
            style={{ color: '#fff' }}
          >
            {t.cta.title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="font-light text-sm leading-loose mb-12"
            style={{ color: '#5a5048' }}
          >
            {t.cta.subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              href="/join/kol"
              className="inline-flex items-center gap-2 text-[0.75rem] tracking-[2px] uppercase px-8 py-3.5 text-white transition-colors duration-250"
              style={{ border: '1px solid rgba(255,255,255,0.2)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#c4913a'; (e.currentTarget as HTMLAnchorElement).style.color = '#c4913a' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.2)'; (e.currentTarget as HTMLAnchorElement).style.color = '#fff' }}
            >
              {t.cta.primary}
            </Link>
            <Link
              href="/join/merchant"
              className="inline-flex items-center gap-2 text-[0.75rem] tracking-[2px] uppercase px-8 py-3.5 text-white transition-colors duration-250"
              style={{ background: '#c4913a' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#b8936a' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#c4913a' }}
            >
              {t.cta.secondary}
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
