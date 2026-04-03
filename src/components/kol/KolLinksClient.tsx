'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, MousePointerClick, MessageSquare, BadgeDollarSign, Link2, TrendingUp, DoorOpen } from 'lucide-react'
import { toast } from 'sonner'
import type { ReferralLinkItem } from '@/app/kol/links/page'

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function convRate(clicks: number, inquiries: number) {
  if (clicks === 0) return null
  return ((inquiries / clicks) * 100).toFixed(1)
}

// ── Link card ─────────────────────────────────────────────────────────────────

function LinkCard({ link }: { link: ReferralLinkItem }) {
  const [copied, setCopied] = useState(false)
  const rate    = convRate(link.clicks, link.inquiries)
  const shortPath = `/r/${link.short_code}`

  const handleCopy = async () => {
    const url = `${window.location.origin}${shortPath}`
    try {
      await navigator.clipboard.writeText(url)
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
      className="group rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md"
    >
      {/* Top bar */}
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-foreground truncate leading-snug">
            {link.project_name ?? '未命名案場'}
          </h3>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {/* Active status */}
            <span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[0.62rem] font-medium tracking-wide ${
              link.is_active
                ? 'border-emerald-200/70 bg-emerald-50 text-emerald-700'
                : 'border-foreground/10 bg-zinc-100 text-zinc-500'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${link.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
              {link.is_active ? '推廣中' : '已暫停'}
            </span>

            {/* Commission rate */}
            {link.commission_rate !== null && (
              <span className="inline-flex items-center gap-1 rounded border border-foreground/10 bg-foreground/[0.04] px-2 py-0.5 text-[0.62rem] font-medium text-muted-foreground tracking-wide">
                <BadgeDollarSign className="h-2.5 w-2.5" />
                {link.commission_rate}% 佣金
              </span>
            )}
          </div>
        </div>

        {/* Conversion rate — large serif number */}
        <div className="shrink-0 text-right pl-2">
          <p className="text-[0.55rem] uppercase tracking-[0.4em] text-muted-foreground mb-0.5">轉換率</p>
          <p className="text-2xl font-serif text-foreground leading-none">
            {rate !== null ? `${rate}%` : '—'}
          </p>
        </div>
      </div>

      {/* URL row */}
      <div className="mx-6 mb-4 flex items-center gap-0 border border-foreground/[0.08] bg-white/60">
        <span className="flex-1 truncate px-3 py-2 font-mono text-[0.65rem] text-muted-foreground select-all">
          {shortPath}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 border-l border-foreground/[0.08] px-3 py-2 text-muted-foreground transition-colors duration-150 hover:bg-foreground/[0.03] hover:text-foreground"
          aria-label="複製連結"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied
              ? <motion.span key="check" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                  <Check className="h-3 w-3 text-emerald-600" />
                </motion.span>
              : <motion.span key="copy" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                  <Copy className="h-3 w-3" />
                </motion.span>
            }
          </AnimatePresence>
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 divide-x divide-foreground/[0.06] border-t border-foreground/[0.06]">
        {[
          { label: '點擊', value: link.clicks,    icon: MousePointerClick, color: undefined },
          { label: '詢問', value: link.inquiries, icon: MessageSquare,     color: undefined },
          { label: '看房', value: link.visits,    icon: DoorOpen,          color: '#2563eb' },
          { label: '成交', value: link.deals,     icon: BadgeDollarSign,   color: '#3a8a5e' },
        ].map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col items-center justify-center gap-0.5 py-4 px-2">
              <Icon
                className="h-3 w-3 mb-0.5"
                style={{ color: s.color ?? 'rgba(0,0,0,0.3)' }}
                strokeWidth={1.5}
              />
              <p className="text-xl font-serif leading-none" style={{ color: s.color ?? 'hsl(var(--foreground))' }}>
                {s.value.toLocaleString('zh-TW')}
              </p>
              <p className="text-[0.55rem] uppercase tracking-[0.35em] text-muted-foreground mt-0.5">
                {s.label}
              </p>
            </div>
          )
        })}
      </div>

    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div variants={fadeUp} className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-foreground/15 bg-stone-50/50 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/10 bg-white/80 shadow-sm">
        <Link2 className="h-6 w-6 text-foreground/25" strokeWidth={1.2} />
      </div>
      <div>
        <p className="text-sm text-foreground/50 tracking-wide">尚無推廣連結</p>
        <p className="mt-1 text-xs text-muted-foreground/60 max-w-[22rem]">
          與商家合作請求被接受後，專屬推廣連結將自動產生並顯示於此
        </p>
      </div>
    </motion.div>
  )
}

// ── Aggregate stats strip ─────────────────────────────────────────────────────

function StatsStrip({ links }: { links: ReferralLinkItem[] }) {
  const totalClicks    = links.reduce((s, l) => s + l.clicks,    0)
  const totalInquiries = links.reduce((s, l) => s + l.inquiries, 0)
  const totalVisits    = links.reduce((s, l) => s + l.visits,    0)
  const totalDeals     = links.reduce((s, l) => s + l.deals,     0)
  const avgConv        = totalClicks > 0
    ? ((totalInquiries / totalClicks) * 100).toFixed(1)
    : null

  return (
    <motion.div variants={fadeUp}>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: '總點擊',  value: totalClicks.toLocaleString('zh-TW'),    icon: MousePointerClick, color: undefined   },
          { label: '總詢問',  value: totalInquiries.toLocaleString('zh-TW'), icon: MessageSquare,     color: undefined   },
          { label: '總看房',  value: totalVisits.toLocaleString('zh-TW'),    icon: DoorOpen,          color: '#2563eb'   },
          { label: '總成交',  value: totalDeals.toLocaleString('zh-TW'),     icon: BadgeDollarSign,   color: '#3a8a5e'   },
          { label: '平均轉換', value: avgConv !== null ? `${avgConv}%` : '—', icon: TrendingUp,        color: undefined   },
        ].map(s => {
          const Icon = s.icon
          return (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-xl border border-foreground/[0.08] bg-linen px-5 py-5 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-foreground/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="flex items-center justify-between mb-2">
                <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
                  {s.label}
                </p>
                <Icon className="h-3 w-3" style={{ color: s.color ?? 'rgba(0,0,0,0.25)' }} strokeWidth={1.5} />
              </div>
              <p className="text-3xl font-serif leading-none" style={{ color: s.color ?? 'hsl(var(--foreground))' }}>{s.value}</p>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KolLinksClient({ links }: { links: ReferralLinkItem[] }) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      {/* ── HEADER ───────────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-foreground/10 pb-8">
        <p className="text-xs uppercase tracking-[0.5em] text-muted-foreground mb-4">
          KOL 後台 · 推廣管理
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-serif">我的推廣</h1>
          {links.length > 0 && (
            <p className="pb-0.5 text-xs text-muted-foreground tracking-wide">
              共 {links.length} 條連結
            </p>
          )}
        </div>
      </motion.div>

      {/* ── AGGREGATE STATS ──────────────────────────── */}
      {links.length > 0 && <StatsStrip links={links} />}

      {/* ── LINKS LIST ───────────────────────────────── */}
      <div>
        {links.length > 0 && (
          <motion.div variants={fadeUp} className="mb-4">
            <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground">
              推廣連結明細
            </p>
          </motion.div>
        )}

        {links.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div variants={stagger} className="space-y-4">
            {links.map(link => (
              <LinkCard key={link.id} link={link} />
            ))}
          </motion.div>
        )}
      </div>

    </motion.div>
  )
}
