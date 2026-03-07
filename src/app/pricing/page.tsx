'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUpRight, Check, Minus } from 'lucide-react'

// ── Animation helpers ──────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const reveal = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Plan {
  name: string
  nameEn: string
  price: string
  priceNote: string
  desc: string
  features: string[]
  cta: string
  href: string
  featured: boolean
  badge?: string
}

// ── KOL Plans ──────────────────────────────────────────────────────────────
const KOL_PLANS: Plan[] = [
  {
    name: '入門',
    nameEn: 'Starter',
    price: '免費',
    priceNote: '永久免費',
    desc: '適合剛起步、想探索平台的 KOL',
    features: [
      '最多 3 個進行中商案',
      '基礎數據儀表板',
      '標準佣金費率',
      '電子郵件客服支援',
    ],
    cta: '立即加入',
    href: '/join/kol',
    featured: false,
  },
  {
    name: '專業',
    nameEn: 'Pro',
    price: 'NT$299',
    priceNote: '/月',
    desc: '適合積極拓展合作、追求更高收益的 KOL',
    features: [
      '無限商案數量',
      '進階數據分析報表',
      '優先商案配對',
      '行銷素材資源庫',
      '優先電子郵件支援',
    ],
    cta: '開始專業方案',
    href: '/join/kol',
    featured: true,
    badge: '最受歡迎',
  },
  {
    name: '精英',
    nameEn: 'Elite',
    price: 'NT$799',
    priceNote: '/月',
    desc: '適合頂尖 KOL，解鎖專屬高價值資源與顧問服務',
    features: [
      '含所有專業方案功能',
      '專屬高價值商案優先入口',
      '專屬客戶成功顧問',
      '自訂佣金比例協商',
      '數據 API 存取權限',
    ],
    cta: '申請精英方案',
    href: '/join/kol',
    featured: false,
  },
]

// ── Merchant Plans ─────────────────────────────────────────────────────────
const MERCHANT_PLANS: Plan[] = [
  {
    name: '基本',
    nameEn: 'Basic',
    price: 'NT$1,990',
    priceNote: '/月',
    desc: '適合單一商案、初次嘗試 KOL 行銷的商家',
    features: [
      '1 個刊登商案',
      '最多配對 10 位 KOL',
      '基礎成效報表',
      '電子郵件客服支援',
    ],
    cta: '開始基本方案',
    href: '/join/merchant',
    featured: false,
  },
  {
    name: '商業',
    nameEn: 'Business',
    price: 'NT$4,990',
    priceNote: '/月',
    desc: '適合多商案並行、追求精準配對與完整數據的商家',
    features: [
      '最多 3 個刊登商案',
      '最多配對 50 位 KOL',
      '完整數據分析與月報',
      'KOL 優先配對服務',
      '優先客服支援',
    ],
    cta: '開始商業方案',
    href: '/join/merchant',
    featured: true,
    badge: '最受歡迎',
  },
  {
    name: '企業',
    nameEn: 'Enterprise',
    price: '聯絡我們',
    priceNote: '客製化方案',
    desc: '適合大型建商，需要專屬服務與彈性合約',
    features: [
      '無限商案刊登數量',
      '專屬 KOL 團隊管理',
      '客製化數據分析',
      '專屬客戶成功顧問',
      '客製化合約條款',
    ],
    cta: '聯絡業務團隊',
    href: '/join/merchant',
    featured: false,
  },
]

// ── Plan Card ──────────────────────────────────────────────────────────────
function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const dark = plan.featured

  return (
    <motion.div
      {...fadeUp(0.05 + index * 0.08)}
      className="relative flex flex-col rounded-sm"
      style={{
        background: dark ? '#0f0f0f' : 'hsl(var(--background))',
        border: dark
          ? '1px solid rgba(255,255,255,0.1)'
          : '1px solid rgba(26,26,26,0.14)',
        boxShadow: dark
          ? '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(196,145,58,0.12)'
          : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span
            className="inline-flex items-center gap-1 px-3 py-1 text-[9px] tracking-[0.18em] uppercase rounded-full"
            style={{ background: '#c4913a', color: '#fff' }}
          >
            <span
              className="inline-block w-1 h-1 rounded-full bg-white/70"
            />
            {plan.badge}
          </span>
        </div>
      )}

      <div className="p-7 flex flex-col flex-1">
        {/* Plan name + desc */}
        <div className="mb-7">
          <div className="flex items-center gap-2.5 mb-2.5">
            <span
              className="font-serif text-xl font-light tracking-tight"
              style={{ color: dark ? '#faf9f6' : 'hsl(var(--foreground))' }}
            >
              {plan.name}
            </span>
            <span
              className="text-[9px] tracking-[0.22em] uppercase"
              style={{ color: dark ? 'rgba(255,255,255,0.28)' : 'hsl(var(--muted-foreground))' }}
            >
              {plan.nameEn}
            </span>
          </div>
          <p
            className="text-[11px] leading-relaxed"
            style={{ color: dark ? 'rgba(255,255,255,0.4)' : 'hsl(var(--muted-foreground))' }}
          >
            {plan.desc}
          </p>
        </div>

        {/* Price */}
        <div
          className="pb-6 mb-6"
          style={{
            borderBottom: dark
              ? '1px solid rgba(255,255,255,0.06)'
              : '1px solid rgba(26,26,26,0.08)',
          }}
        >
          <div className="flex items-end gap-1.5">
            <span
              className="font-serif text-[2.4rem] font-light leading-none tracking-tight"
              style={{ color: dark ? '#faf9f6' : 'hsl(var(--foreground))' }}
            >
              {plan.price}
            </span>
            <span
              className="text-[11px] mb-1 leading-none"
              style={{ color: dark ? 'rgba(255,255,255,0.3)' : 'hsl(var(--muted-foreground))' }}
            >
              {plan.priceNote}
            </span>
          </div>
        </div>

        {/* Features */}
        <ul className="space-y-2.5 flex-1 mb-7">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check
                className="w-3.5 h-3.5 mt-px shrink-0"
                style={{ color: '#c4913a' }}
              />
              <span
                className="text-[12px] leading-relaxed"
                style={{
                  color: dark ? 'rgba(255,255,255,0.6)' : 'hsl(var(--foreground))',
                }}
              >
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href={plan.href}
          className="group flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] px-5 py-3 rounded-sm transition-all duration-200"
          style={
            dark
              ? { background: '#c4913a', color: '#fff' }
              : { background: 'hsl(var(--foreground))', color: 'hsl(var(--background))' }
          }
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.opacity = '0.85'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement
            el.style.opacity = '1'
          }}
        >
          {plan.cta}
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function PricingPage() {
  const [view, setView] = useState<'kol' | 'merchant'>('kol')

  const plans = view === 'kol' ? KOL_PLANS : MERCHANT_PLANS

  return (
    <main className="bg-background">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative px-6 pt-24 pb-16 text-center overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 35% at 50% 0%, rgba(196,145,58,0.05) 0%, transparent 70%)',
          }}
        />
        <div className="relative z-10 max-w-xl mx-auto">
          <motion.div {...fadeUp(0.1)} className="flex items-center justify-center gap-3 mb-8">
            <div className="w-6 h-px" style={{ background: 'rgba(196,145,58,0.45)' }} />
            <span className="text-[0.6rem] tracking-[0.32em] uppercase" style={{ color: '#c4913a' }}>
              方案與費用
            </span>
            <div className="w-6 h-px" style={{ background: 'rgba(196,145,58,0.45)' }} />
          </motion.div>

          <motion.h1
            {...fadeUp(0.18)}
            className="font-serif text-5xl md:text-[3.6rem] font-light leading-[1.1] tracking-tight mb-4"
          >
            找到最適合你的方案
          </motion.h1>

          <motion.p
            {...fadeUp(0.26)}
            className="text-[13px] text-muted-foreground leading-relaxed mb-10 max-w-sm mx-auto"
          >
            無論你是 KOL 還是商家，HomeKey 都有對應的方案幫助你最大化每次合作的價值。
          </motion.p>

          {/* Toggle — pill style */}
          <motion.div
            {...fadeUp(0.34)}
            className="inline-flex items-center rounded-full p-1 gap-0.5"
            style={{ background: 'rgba(26,26,26,0.06)', border: '1px solid rgba(26,26,26,0.1)' }}
          >
            {(['kol', 'merchant'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="relative px-6 py-2 text-[11px] uppercase tracking-[0.14em] rounded-full transition-all duration-200"
                style={
                  view === v
                    ? { background: '#1A1A1A', color: '#faf9f6', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }
                    : { color: 'hsl(var(--muted-foreground))' }
                }
              >
                {v === 'kol' ? 'KOL 方案' : '商家方案'}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Plans ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="grid md:grid-cols-3 gap-4"
            >
              {plans.map((plan, i) => (
                <PlanCard key={plan.name} plan={plan} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-center text-[11px] text-muted-foreground mt-7 tracking-wide"
          >
            所有方案均以新台幣計價，每月自動扣款。隨時可升級或取消。
          </motion.p>
        </div>
      </section>

      {/* ── Feature Comparison ──────────────────────────────────────────── */}
      <section className="px-6 py-20 border-t border-border/60">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="mb-12"
          >
            <p className="text-[0.6rem] tracking-[0.32em] uppercase mb-3" style={{ color: '#c4913a' }}>
              {view === 'kol' ? 'KOL 方案比較' : '商家方案比較'}
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-light">
              所有方案功能一覽
            </h2>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={view + '-table'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'kol' ? <KolComparisonTable /> : <MerchantComparisonTable />}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="relative px-6 py-28 text-center overflow-hidden"
        style={{ background: '#0f0f0f' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(196,145,58,0.07) 0%, transparent 65%)',
          }}
        />
        <div className="relative z-10 max-w-lg mx-auto">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="font-serif text-4xl md:text-5xl font-light leading-[1.15] mb-4"
            style={{ color: '#faf9f6' }}
          >
            準備好了嗎？
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="text-[13px] leading-relaxed mb-9"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            免費方案永遠免費。升級隨時可行，取消無違約金。
          </motion.p>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={reveal}
            className="flex flex-wrap justify-center items-center gap-3"
          >
            <Link
              href="/join/kol"
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] px-7 py-3 rounded-sm transition-all duration-200"
              style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(255,255,255,0.35)'
                el.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement
                el.style.borderColor = 'rgba(255,255,255,0.15)'
                el.style.color = 'rgba(255,255,255,0.7)'
              }}
            >
              我是 KOL
              <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/join/merchant"
              className="group inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] px-7 py-3 rounded-sm transition-all duration-200"
              style={{ background: '#c4913a', color: '#fff' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#b8936a'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#c4913a'
              }}
            >
              我是商家
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  )
}

// ── Comparison Tables ──────────────────────────────────────────────────────
const CHECK = (
  <span className="flex justify-center">
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-full"
      style={{ background: '#1A1A1A' }}
    >
      <Check className="w-2.5 h-2.5" style={{ color: '#faf9f6', strokeWidth: 2.5 }} />
    </span>
  </span>
)
const DASH = (
  <span className="flex justify-center">
    <Minus className="w-4 h-4" style={{ color: 'rgba(26,26,26,0.2)' }} />
  </span>
)

function KolComparisonTable() {
  const rows = [
    { feature: '進行中商案數',   starter: '最多 3 個', pro: '無限制',   elite: '無限制'  },
    { feature: '基礎數據儀表板', starter: CHECK,       pro: CHECK,      elite: CHECK     },
    { feature: '進階數據分析',   starter: DASH,        pro: CHECK,      elite: CHECK     },
    { feature: '優先商案配對',   starter: DASH,        pro: CHECK,      elite: CHECK     },
    { feature: '行銷素材資源庫', starter: DASH,        pro: CHECK,      elite: CHECK     },
    { feature: '專屬高價值商案', starter: DASH,        pro: DASH,       elite: CHECK     },
    { feature: '自訂佣金比例',   starter: DASH,        pro: DASH,       elite: CHECK     },
    { feature: '專屬客戶顧問',   starter: DASH,        pro: DASH,       elite: CHECK     },
    { feature: '數據 API 存取',  starter: DASH,        pro: DASH,       elite: CHECK     },
  ]
  return <ComparisonTable rows={rows} headers={['入門', '專業', '精英']} featuredCol={1} />
}

function MerchantComparisonTable() {
  const rows = [
    { feature: '刊登商案數',     starter: '1 個',   pro: '最多 3 個', elite: '無限制' },
    { feature: 'KOL 配對上限',   starter: '10 位',  pro: '50 位',     elite: '無限制' },
    { feature: '基礎成效報表',   starter: CHECK,    pro: CHECK,        elite: CHECK    },
    { feature: '完整數據分析',   starter: DASH,     pro: CHECK,        elite: CHECK    },
    { feature: '月度報表',       starter: DASH,     pro: CHECK,        elite: CHECK    },
    { feature: 'KOL 優先配對',   starter: DASH,     pro: CHECK,        elite: CHECK    },
    { feature: '專屬 KOL 團隊',  starter: DASH,     pro: DASH,         elite: CHECK    },
    { feature: '客製化分析',     starter: DASH,     pro: DASH,         elite: CHECK    },
    { feature: '客製化合約',     starter: DASH,     pro: DASH,         elite: CHECK    },
  ]
  return <ComparisonTable rows={rows} headers={['基本', '商業', '企業']} featuredCol={1} />
}

function ComparisonTable({
  rows,
  headers,
  featuredCol,
}: {
  rows: { feature: string; starter: React.ReactNode; pro: React.ReactNode; elite: React.ReactNode }[]
  headers: string[]
  featuredCol: number
}) {
  const cols = ['starter', 'pro', 'elite'] as const
  const rowDivider = '1px solid rgba(26,26,26,0.07)'

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr>
          <th
            className="text-left pb-4 text-[11px] uppercase tracking-[0.14em] font-normal text-muted-foreground w-2/5"
            style={{ borderBottom: '1px solid rgba(26,26,26,0.12)' }}
          >
            功能
          </th>
          {headers.map((h, i) => (
            <th
              key={h}
              className="pb-4 text-center text-[12px] font-normal w-[20%]"
              style={{
                borderBottom: '1px solid rgba(26,26,26,0.12)',
                color: i === featuredCol ? '#c4913a' : 'hsl(var(--foreground))',
              }}
            >
              <div className="flex flex-col items-center gap-1">
                <span className={i === featuredCol ? 'font-medium' : ''}>
                  {h}
                </span>
                {i === featuredCol && (
                  <span
                    className="text-[8px] uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(196,145,58,0.1)', color: '#c4913a' }}
                  >
                    推薦
                  </span>
                )}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.feature} className="group">
            <td
              className="py-3.5 text-[12px] text-foreground pr-4 group-hover:text-foreground/70 transition-colors"
              style={{ borderBottom: rowDivider }}
            >
              {row.feature}
            </td>
            {cols.map((col, ci) => (
              <td
                key={col}
                className="py-3.5 text-[12px] text-center"
                style={{
                  borderBottom: rowDivider,
                  background: ci === featuredCol
                    ? 'rgba(196,145,58,0.04)'
                    : undefined,
                }}
              >
                {row[col]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
