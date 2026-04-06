'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, Link2, TrendingUp,
  Handshake, BookUser, Pencil, ExternalLink,
} from 'lucide-react'
import type { RecentCollab, KolStats } from '@/app/kol/home/page'

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
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths} 個月前`
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

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      {/* ── RESUME COMPLETION NOTIFICATION ──────────── */}
      {showSetup && (
        <motion.div variants={fadeUp}>
          <Link
            href="/kol/resume/edit"
            className="group flex items-center gap-4 rounded-lg border border-amber-200/80 bg-amber-50/60 px-5 py-3.5 transition-all duration-300 hover:border-amber-300 hover:bg-amber-50"
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>

            {/* Icon */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-white text-amber-600">
              <BookUser className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-900 leading-snug">
                完成你的履歷
              </p>
              <p className="text-[0.6rem] text-amber-700/60 mt-0.5 tracking-wide">
                上傳個人頭像與作品媒體，提升商家主動邀請機會
              </p>
            </div>

            {/* CTA */}
            <span className="hidden sm:flex shrink-0 items-center gap-1 text-[0.6rem] uppercase tracking-[0.25em] text-amber-700/50 transition-colors group-hover:text-amber-700">
              立即完成
              <ArrowRight className="h-2.5 w-2.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </Link>
        </motion.div>
      )}

      {/* ── HERO HEADER ─────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-foreground/10 pb-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground mb-4">
          {today} · KOL 後台
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif">
              {displayName
                ? displayName
                : <span className="inline-block h-8 w-40 animate-pulse rounded bg-muted" />}
            </h1>
            {username && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">@{username}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── STATS STRIP ─────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            {
              label: '本月點擊',
              value: kolStats.monthClicks.toLocaleString('zh-TW'),
              sub: kolStats.totalClicks > 0
                ? `累計 ${kolStats.totalClicks.toLocaleString('zh-TW')} 次點擊`
                : '尚無點擊紀錄',
              icon: Link2,
            },
            {
              label: '本月成交',
              value: kolStats.monthDeals.toString(),
              sub: kolStats.totalInquiries > 0
                ? `累計 ${kolStats.totalInquiries} 筆看房`
                : '尚無看房紀錄',
              icon: TrendingUp,
            },
            {
              label: '本月轉換率',
              value: kolStats.monthConversion !== null ? `${kolStats.monthConversion}%` : '—',
              sub: kolStats.monthClicks > 0
                ? `${kolStats.monthClicks} 點擊 → ${kolStats.monthDeals} 成交`
                : '本月尚無點擊',
              icon: TrendingUp,
            },
          ] as const).map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="group relative overflow-hidden rounded-xl border border-foreground/[0.08] bg-linen px-7 py-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <div className="absolute inset-0 bg-foreground/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                    {s.label}
                  </p>
                  <Icon className="h-3 w-3 text-muted-foreground/30" strokeWidth={1.5} />
                </div>
                <p className="text-[3rem] leading-none font-serif text-foreground tracking-tight">
                  {s.value}
                </p>
                <p className="text-xs mt-2.5 tracking-wide text-muted-foreground">
                  {s.sub}
                </p>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* ── RESUME ACTIONS ───────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {/* Edit resume */}
          <Link
            href="/kol/resume/edit"
            className="group relative overflow-hidden rounded-xl p-5 flex flex-col transition-all duration-300"
            style={{
              background: 'rgba(196,145,58,0.07)',
              border: '1px solid rgba(196,145,58,0.22)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(196,145,58,0.12)'
              el.style.borderColor = 'rgba(196,145,58,0.38)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(196,145,58,0.07)'
              el.style.borderColor = 'rgba(196,145,58,0.22)'
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg mb-4 transition-colors duration-200"
              style={{
                background: 'rgba(196,145,58,0.10)',
                border: '1px solid rgba(196,145,58,0.20)',
                color: '#7c5a1e',
              }}
            >
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-base leading-snug mb-1" style={{ color: '#4a2e08' }}>編輯履歷</p>
            <p className="text-[0.72rem] leading-relaxed flex-1 mb-4" style={{ color: 'rgba(124,90,30,0.60)' }}>
              更新頭像、自我介紹與作品集媒體
            </p>
            <div
              className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.22em] transition-colors duration-200"
              style={{ color: 'rgba(124,90,30,0.38)' }}
            >
              <span>前往</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

          {/* View public page */}
          <Link
            href={`/kols/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-xl p-5 flex flex-col transition-all duration-300"
            style={{
              background: 'rgba(30,64,175,0.06)',
              border: '1px solid rgba(30,64,175,0.18)',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(30,64,175,0.11)'
              el.style.borderColor = 'rgba(30,64,175,0.32)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.background = 'rgba(30,64,175,0.06)'
              el.style.borderColor = 'rgba(30,64,175,0.18)'
            }}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg mb-4 transition-colors duration-200"
              style={{
                background: 'rgba(30,64,175,0.09)',
                border: '1px solid rgba(30,64,175,0.18)',
                color: '#1e40af',
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-base leading-snug mb-1" style={{ color: '#1e3a8a' }}>查看公開頁面</p>
            <p className="text-[0.72rem] leading-relaxed flex-1 mb-4" style={{ color: 'rgba(30,64,175,0.55)' }}>
              以訪客視角預覽你的公開履歷
            </p>
            <div
              className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.22em] transition-colors duration-200"
              style={{ color: 'rgba(30,64,175,0.32)' }}
            >
              <span>前往</span>
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </div>
          </Link>

        </div>
      </motion.div>

      {/* ── RECENT COLLABS ───────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">

          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              近期合作
            </p>
            <span className="flex items-center gap-1.5 text-[0.55rem] uppercase tracking-widest text-emerald-600">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
              已接受
            </span>
          </div>

          {/* rows */}
          {recentCollabs.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <Handshake className="h-8 w-8 text-foreground/15" strokeWidth={1.2} />
              <p className="text-xs text-muted-foreground tracking-wide">尚無合作紀錄</p>
              <p className="text-[0.6rem] text-foreground/30 tracking-wide max-w-[18rem]">
                商家邀請並獲得接受後，合作案將顯示於此
              </p>
            </div>
          ) : (
            <div className="divide-y divide-foreground/[0.06]">
              {recentCollabs.map((collab) => (
                <div
                  key={collab.id}
                  className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-foreground/[0.02] transition-colors duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {collab.project_name ?? '未知案名'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {collab.merchant_company_name ?? '未知商家'}
                      {collab.responded_at
                        ? ` · ${formatRelativeDate(collab.responded_at)}`
                        : ''}
                    </p>
                  </div>
                  {collab.commission_rate !== null && (
                    <span className="shrink-0 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.6rem] font-medium tracking-wide text-emerald-700">
                      {collab.commission_rate}% 佣金
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.07]">
            <p className="text-xs text-muted-foreground tracking-wide">
              {recentCollabs.length > 0
                ? `顯示最近 ${recentCollabs.length} 筆合作`
                : '前往收件匣查看邀請'}
            </p>
            <Link
              href="/kol/inbox"
              className="group flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              查看全部
              <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>
      </motion.div>

    </motion.div>
  )
}
