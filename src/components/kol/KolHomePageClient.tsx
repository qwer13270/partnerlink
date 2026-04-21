'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, ArrowUpRight, ChevronRight,
  Handshake, BookUser,
} from 'lucide-react'
import type { RecentCollab, KolStats } from '@/app/kol/home/page'
import ProjectTypeBadge from '@/components/kol/ProjectTypeBadge'

type KolHomePageClientProps = {
  displayName: string
  username: string
  hasProfilePhoto: boolean
  portfolioCounts: {
    totalPhotos: number
    totalVideos: number
  }
  recentCollabs: RecentCollab[]
  kolStats: KolStats
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '昨天'
  if (diffDays < 30)  return `${diffDays} 天前`
  return `${Math.floor(diffDays / 30)} 個月前`
}

function getInitials(name: string): string {
  return name
    .split(/[\s@_-]/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '??'
}

// Decorative sparkline heights seeded from the label. Not data-bearing —
// the KOL stats shape does not carry a historical series.
function sparklineHeights(seed: string): number[] {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const out: number[] = []
  for (let i = 0; i < 7; i++) {
    h = (h * 1103515245 + 12345) >>> 0
    out.push(15 + (h % 70))
  }
  return out
}

export default function KolHomePageClient({
  displayName,
  username,
  hasProfilePhoto,
  portfolioCounts,
  recentCollabs,
  kolStats,
}: KolHomePageClientProps) {
  const [photoUploaded, setPhotoUploaded] = useState(false)

  useEffect(() => {
    const handler = () => setPhotoUploaded(true)
    window.addEventListener('profile-photo-updated', handler)
    return () => window.removeEventListener('profile-photo-updated', handler)
  }, [])

  const totalAssets    = portfolioCounts.totalPhotos + portfolioCounts.totalVideos
  const needsPhoto     = !hasProfilePhoto && !photoUploaded
  const needsPortfolio = totalAssets === 0
  const showSetup      = needsPhoto || needsPortfolio

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const kpiCards = [
    {
      label: '本月點擊',
      value: kolStats.monthClicks.toLocaleString('zh-TW'),
      sub: kolStats.totalClicks > 0
        ? `累計 ${kolStats.totalClicks.toLocaleString('zh-TW')} 次點擊`
        : '尚無點擊紀錄',
      chipText: null as string | null,
      chipVariant: null as 'up' | 'dn' | 'neu' | null,
    },
    {
      label: '本月成交',
      value: kolStats.monthDeals.toString(),
      sub: kolStats.totalInquiries > 0
        ? `累計 ${kolStats.totalInquiries} 筆看房`
        : '尚無看房紀錄',
      chipText: null,
      chipVariant: null,
    },
    {
      label: '本月轉換率',
      value: kolStats.monthConversion !== null ? `${kolStats.monthConversion}` : '—',
      suffix: kolStats.monthConversion !== null ? '%' : undefined,
      sub: kolStats.monthClicks > 0
        ? `${kolStats.monthClicks} 點擊 → ${kolStats.monthDeals} 成交`
        : '本月尚無點擊',
      chipText: kolStats.monthConversion !== null && kolStats.monthConversion >= 100
        ? `▲ ${kolStats.monthConversion}%`
        : null,
      chipVariant: kolStats.monthConversion !== null && kolStats.monthConversion >= 100
        ? ('up' as const)
        : null,
    },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-12 text-white"
    >
      {/* ── RESUME COMPLETION NOTIFICATION ──────────── */}
      {showSetup && (
        <motion.div variants={fadeUp}>
          <Link
            href="/kol/resume/edit"
            className="group liquid-glass flex items-center gap-4 !rounded-full px-5 py-3.5 transition-all duration-300 hover:text-white"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-300/70 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
            </span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/15 bg-white/5 text-amber-200">
              <BookUser className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-body text-xs font-medium text-white/90 leading-snug">完成你的履歷</p>
              <p className="font-body text-[0.6rem] text-white/50 mt-0.5 tracking-wide">
                上傳個人頭像與作品媒體，提升商家主動邀請機會
              </p>
            </div>
            <span className="hidden sm:flex shrink-0 items-center gap-1 meta text-[10px] text-white/45 transition-colors group-hover:text-white/85">
              立即完成
              <ArrowRight className="h-2.5 w-2.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      )}

      {/* ── GREETING ─────────────────────────────────── */}
      <motion.section variants={fadeUp}>
        <div className="meta text-[10px] text-white/40 mb-5 flex items-center gap-3 flex-wrap">
          <span>{today}</span>
          <span className="text-white/20">·</span>
          <span>KOL 後台</span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <span className="pulse-dot h-1.5 w-1.5" />
            online
          </span>
        </div>
        <h1 className="font-heading text-[48px] md:text-[72px] leading-[1] tracking-tight text-white">
          {displayName
            ? <>歡迎，<span className="italic">{displayName}</span></>
            : <span className="inline-block h-[1em] w-48 animate-pulse rounded bg-white/10" />}
        </h1>
        {username && (
          <div className="mt-4 flex items-center gap-3">
            <span className="meta text-[11px] text-white/50">@{username}</span>
            <span className="chip chip-neu px-2.5 py-1 text-[10px]">已驗證</span>
          </div>
        )}
      </motion.section>

      {/* ── KPI GRID ─────────────────────────────────── */}
      <motion.section variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {kpiCards.map((card) => {
            const heights = sparklineHeights(card.label)
            return (
              <div key={card.label} className="liquid-glass !rounded-[22px] p-6 pl-7 relative">
                <div className="flex items-start justify-between mb-8">
                  <div className="meta text-[10px] text-white/50">{card.label}</div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/40" strokeWidth={1.6} />
                </div>
                <div className="font-heading italic text-[56px] md:text-[64px] leading-none mb-4 text-white">
                  {card.value}
                  {card.suffix && (
                    <span className="text-white/50 text-[32px] md:text-[36px]">{card.suffix}</span>
                  )}
                </div>
                <div className="flex items-end justify-between gap-4">
                  <div className="text-[12px] text-white/55 min-w-0 truncate">{card.sub}</div>
                  {card.chipText && card.chipVariant ? (
                    <span className={`chip chip-${card.chipVariant} px-2.5 py-1 text-[10px] shrink-0`}>
                      {card.chipText}
                    </span>
                  ) : (
                    <div className="flex gap-[3px] items-end h-6 shrink-0" aria-hidden>
                      {heights.map((h, i) => (
                        <span key={i} className="bar w-1" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.section>

      {/* ── RECENT COLLABS ───────────────────────────── */}
      <motion.section variants={fadeUp}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="meta text-[10px] text-white/45 mb-2 flex items-center">
              <span className="section-underline" />
              recent · 近期合作
            </div>
            <h2 className="font-heading text-[28px] leading-none tracking-tight text-white">
              近期合作
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-2 meta text-[10px] text-white/55 px-3 py-1.5">
              <span className="dot-green h-1.5 w-1.5" />
              已接受
            </span>
            <Link
              href="/kol/inbox"
              className="meta text-[10px] text-white/50 hover:text-white transition-colors px-2 py-1"
            >
              全部 →
            </Link>
          </div>
        </div>

        <div className="liquid-glass !rounded-[22px] divide-y divide-white/5">
          {recentCollabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
              <Handshake className="h-8 w-8 text-white/20" strokeWidth={1.2} />
              <p className="font-body text-xs text-white/55 tracking-wide">尚無合作紀錄</p>
              <p className="font-body text-[0.6rem] text-white/35 tracking-wide max-w-[18rem]">
                商家邀請並獲得接受後，合作案將顯示於此
              </p>
            </div>
          ) : (
            recentCollabs.map((collab) => {
              const merchant = collab.merchant_company_name ?? '未知商家'
              const when = formatRelativeDate(collab.responded_at)
              return (
                <Link
                  key={collab.id}
                  href={collab.collaboration_id ? `/kol/projects/${collab.collaboration_id}` : '/kol/inbox'}
                  className="flex items-center gap-5 p-5 hover:bg-white/[0.025] transition-colors cursor-pointer"
                >
                  <div className="avatar h-10 w-10 flex items-center justify-center text-[12px] shrink-0">
                    {getInitials(merchant)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-[15px] text-white/90 truncate">
                        {collab.project_name ?? '未知案名'}
                      </span>
                      <ProjectTypeBadge type={collab.project_type} />
                    </div>
                    <div className="meta text-[10px] text-white/40 mt-1 truncate">
                      {merchant}{when ? ` · ${when}` : ''}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    {collab.collaboration_type === 'reciprocal' ? (
                      <div className="font-heading italic text-[22px] leading-none text-white">互惠</div>
                    ) : collab.collaboration_type === 'sponsored' && collab.sponsorship_bonus !== null ? (
                      <>
                        <div className="font-heading italic text-[22px] leading-none text-white">
                          NT${collab.sponsorship_bonus.toLocaleString()}
                        </div>
                        <div className="meta text-[9px] text-white/40 mt-1">業配金額</div>
                      </>
                    ) : collab.commission_rate !== null ? (
                      <>
                        <div className="font-heading italic text-[22px] leading-none text-white">
                          {collab.commission_rate}%
                        </div>
                        <div className="meta text-[9px] text-white/40 mt-1">佣金</div>
                      </>
                    ) : (
                      <span className="chip chip-neu px-2.5 py-1 text-[10px]">待定</span>
                    )}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-white/40 shrink-0" strokeWidth={1.8} />
                </Link>
              )
            })
          )}
        </div>
      </motion.section>

      {/* ── FOOTER META ───────────────────────────────── */}
      <footer className="flex items-center justify-between meta text-[10px] text-white/30 pt-4 border-t border-white/5">
        <span>© partnerlink 2026</span>
        <div className="flex items-center gap-5">
          <Link href="/about" className="hover:text-white/60 transition-colors">說明</Link>
          <Link href="/legal/terms" className="hover:text-white/60 transition-colors">服務條款</Link>
          <Link href="/legal/privacy" className="hover:text-white/60 transition-colors">隱私</Link>
        </div>
      </footer>
    </motion.div>
  )
}
