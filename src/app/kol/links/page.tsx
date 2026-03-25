'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, TrendingUp, MousePointerClick, CalendarCheck, BadgeDollarSign } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentKolLinks } from '@/hooks/useMockData'
import type { AffiliateLink } from '@/lib/types'

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}



// ── Link card ─────────────────────────────────────────────────────────────────

function LinkCard({ link }: { link: AffiliateLink }) {
  const [copied, setCopied] = useState(false)
  const convRate = link.clicks > 0
    ? ((link.bookings / link.clicks) * 100).toFixed(1)
    : '0.0'

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link.link)
      setCopied(true)
      toast.success('已複製推廣連結')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('複製失敗')
    }
  }

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm p-6 hover:shadow-md transition-all duration-200"
    >
      {/* Top row — name + badges */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="text-sm font-medium text-foreground leading-snug">{link.propertyName}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`inline-flex items-center gap-1 text-xs uppercase tracking-widest ${
              link.isActive ? 'text-emerald-700' : 'text-muted-foreground'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${link.isActive ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
              {link.isActive ? '推廣中' : '已暫停'}
            </span>
          </div>
        </div>

        {/* Conversion rate pill */}
        <div className="shrink-0 text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">轉換率</p>
          <p className="text-xl font-serif text-foreground leading-none mt-0.5">{convRate}%</p>
        </div>
      </div>

      {/* URL row */}
      <div className="flex items-center gap-2 bg-muted/30 border border-foreground/8 px-3 py-2 mb-4">
        <span className="text-[0.68rem] font-mono text-muted-foreground truncate flex-1">
          {link.link}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1 text-muted-foreground hover:text-foreground transition-colors duration-150"
          aria-label="複製連結"
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-emerald-600" />
            : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Big stats row */}
      <div className="grid grid-cols-3 gap-2 mt-1">
        {[
          { label: '點擊',  value: link.clicks.toLocaleString('zh-TW'),          icon: MousePointerClick },
          { label: '預約',  value: link.bookings.toLocaleString('zh-TW'),         icon: CalendarCheck     },
          { label: '成交',  value: link.confirmedSales.toLocaleString('zh-TW'),   icon: BadgeDollarSign   },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-1">{s.label}</p>
            <p className="text-2xl font-serif text-foreground leading-none">{s.value}</p>
          </div>
        ))}
      </div>

    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm p-6 animate-pulse space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <div className="h-3.5 w-36 bg-muted rounded" />
          <div className="h-2.5 w-24 bg-muted/60 rounded" />
        </div>
        <div className="h-6 w-12 bg-muted rounded" />
      </div>
      <div className="h-8 bg-muted/40 rounded" />
      <div className="grid grid-cols-3 gap-px">
        {[1, 2, 3].map(n => <div key={n} className="h-14 bg-muted/30" />)}
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map(n => <div key={n} className="h-1 bg-muted/30 rounded-full" />)}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyPromoPage() {
  const { data: links, isLoading } = useCurrentKolLinks()

  const totalClicks   = links?.reduce((s, l) => s + l.clicks,          0) ?? 0
  const totalBookings = links?.reduce((s, l) => s + l.bookings,         0) ?? 0
  const totalSales    = links?.reduce((s, l) => s + l.confirmedSales,   0) ?? 0
  const avgConv       = totalClicks > 0
    ? ((totalBookings / totalClicks) * 100).toFixed(1)
    : '—'

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      {/* ── HEADER ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-foreground/10 pb-8">
        <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground mb-4">
          KOL 後台 · 推廣管理
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-serif">我的推廣</h1>
          <p className="pb-0.5 text-xs text-muted-foreground tracking-wide">
            共 {links?.length ?? '—'} 條連結
          </p>
        </div>
      </motion.div>

      {/* ── AGGREGATE STATS ────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '總點擊',  value: isLoading ? '—' : totalClicks.toLocaleString('zh-TW'),   icon: MousePointerClick },
            { label: '總預約',  value: isLoading ? '—' : totalBookings.toLocaleString('zh-TW'), icon: CalendarCheck     },
            { label: '總成交',  value: isLoading ? '—' : totalSales.toString(),                 icon: BadgeDollarSign   },
            { label: '平均轉換', value: isLoading ? '—' : `${avgConv}%`,                        icon: TrendingUp        },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm px-5 py-5 transition-shadow duration-300 hover:shadow-md">
              <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">
                {s.label}
              </p>
              <p className="text-3xl font-serif text-foreground mt-2 leading-none">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── LINKS LIST ─────────────────────────────────────── */}
      <div>
        <motion.div variants={fadeUp} className="mb-4">
          <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">
            推廣連結明細
          </p>
        </motion.div>

        {isLoading || !links ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
          </div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {links.map(link => (
              <LinkCard key={link.id} link={link} />
            ))}
          </motion.div>
        )}
      </div>

    </motion.div>
  )
}
