'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ExternalLink,
  ArrowDown,
  MousePointerClick,
  CalendarCheck,
  BadgeDollarSign,
  TrendingUp,
  Link2,
  Play,
} from 'lucide-react'
import Link from 'next/link'
import type { KolResumeData, ResumeViewerRole } from '@/data/mock-resume'
import { getKolThemeVars } from '@/lib/kol-themes'

// ── Types ──────────────────────────────────────────────────────────────────

type Props = {
  resume: KolResumeData
  viewerRole: ResumeViewerRole
  /** Hides edit button and breadcrumb — used when embedded as a live preview */
  previewMode?: boolean
}

// ── Animation helpers ─────────────────────────────────────────────────────

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
})

// ── Helpers ────────────────────────────────────────────────────────────────

function formatFollowers(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(n % 10000 === 0 ? 0 : 1)} 萬`
  return n.toLocaleString('zh-TW')
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  youtube:   'YouTube',
  tiktok:    'TikTok',
  facebook:  'Facebook',
  website:   '個人網站',
}

// ── Avatar ─────────────────────────────────────────────────────────────────

export function ResumeAvatar({
  name,
  photoUrl,
  dark = false,
  className = '',
  style,
}: {
  name: string
  photoUrl: string | null
  dark?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  const [failed, setFailed] = useState(false)
  const initial = (name || 'K').slice(0, 1).toUpperCase()

  return (
    <div
      className={`rounded-full overflow-hidden flex items-center justify-center ${
        dark ? 'bg-white/8' : 'bg-foreground/6'
      } ${className}`}
      style={style}
    >
      {photoUrl && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          className={`font-serif select-none leading-none ${dark ? 'text-white/40' : 'text-foreground/20'}`}
          style={{ fontSize: 'clamp(3rem, 10vw, 6rem)' }}
        >
          {initial}
        </span>
      )}
    </div>
  )
}

// ── Section eyebrow (accent-tinted label + divider line) ───────────────────

function SectionEyebrow({ label }: { label: string }) {
  return (
    <motion.div {...fadeIn(0)} className="flex items-center gap-5 mb-10">
      <p
        className="shrink-0 text-[0.55rem] uppercase tracking-[0.55em]"
        style={{ color: 'var(--k-accent)', opacity: 0.75 }}
      >
        {label}
      </p>
      <div className="h-px flex-1" style={{ background: 'var(--k-accent-line)' }} />
    </motion.div>
  )
}

// ── Media card ─────────────────────────────────────────────────────────────

function MediaCard({ item }: { item: KolResumeData['media'][number] }) {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <motion.div
      {...reveal(0)}
      className="group"
      style={{ border: '1px solid var(--k-accent-line)' }}
    >
      {item.mediaType === 'video' ? (
        item.url ? (
          <video
            src={item.url}
            controls
            className="w-full block"
            style={{ background: '#181E28' }}
            preload="metadata"
          />
        ) : (
          <div
            className="relative aspect-[4/3] flex items-center justify-center"
            style={{ background: 'linear-gradient(145deg, #181E28 0%, #252F3F 100%)' }}
          >
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20">
              <Play className="h-4 w-4 text-white fill-white translate-x-px" />
            </span>
          </div>
        )
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.04]">
          {imgFailed || !item.url ? (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-[0.55rem] uppercase tracking-widest text-background/30">圖片</span>
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={item.caption}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              onError={() => setImgFailed(true)}
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        </div>
      )}
      {item.caption && (
        <div className="px-4 py-3 flex gap-3 items-start" style={{ borderTop: '1px solid var(--k-accent-line)' }}>
          <span
            className="shrink-0 text-[0.6rem] mt-[0.35rem] leading-none select-none"
            style={{ color: 'var(--k-accent)', opacity: 0.4 }}
          >
            ↳
          </span>
          <p
            className="text-[0.875rem] leading-[1.65] text-background/60 italic"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {item.caption}
          </p>
        </div>
      )}
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function KolResumePage({ resume, viewerRole, previewMode = false }: Props) {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos'>('photos')

  const canSeeStats = viewerRole === 'merchant' || viewerRole === 'admin'

  const photos      = resume.media.filter((m) => m.mediaType === 'image').sort((a, b) => a.sortOrder - b.sortOrder)
  const videos      = resume.media.filter((m) => m.mediaType === 'video').sort((a, b) => a.sortOrder - b.sortOrder)
  const activeMedia = activeTab === 'photos' ? photos : videos
  const socialEntries = Object.entries(resume.socialLinks).filter(([, url]) => Boolean(url)) as [string, string][]

  const platformStats = [
    { label: '總點擊',   value: resume.platformStats.totalClicks.toLocaleString('zh-TW'),  icon: MousePointerClick },
    { label: '總預約',   value: resume.platformStats.totalBookings.toLocaleString('zh-TW'), icon: CalendarCheck     },
    { label: '總成交',   value: resume.platformStats.totalSales.toLocaleString('zh-TW'),    icon: BadgeDollarSign   },
    { label: '轉換率',   value: `${resume.platformStats.conversionRate.toFixed(1)}%`,        icon: TrendingUp        },
    { label: '合作案件', value: String(resume.platformStats.activeProjects),                 icon: Link2             },
  ]

  const themeVars = getKolThemeVars(resume.colorTheme ?? '')

  return (
    <>
      <div
        className={previewMode ? 'overflow-x-hidden' : 'min-h-screen overflow-x-hidden'}
        style={themeVars as React.CSSProperties}
      >

        {/* ── HERO ─────────────────────────────────────────── */}
        <section
          className={`relative text-background flex flex-col overflow-hidden ${previewMode ? '' : 'min-h-screen'}`}
          style={{ background: 'var(--k-hero)' }}
        >
          {/* Grain */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
              backgroundRepeat: 'repeat',
              backgroundSize: '256px 256px',
            }}
          />
          {/* Accent radial glow — much more visible than the old white glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 w-[80vw] h-[80vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, var(--k-accent) 0%, transparent 65%)',
              transform: 'translate(35%, 35%)',
              opacity: 0.18,
            }}
          />
          {/* Second softer glow top-left */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 w-[50vw] h-[50vw] rounded-full"
            style={{
              background: 'radial-gradient(circle, var(--k-accent) 0%, transparent 70%)',
              transform: 'translate(-40%, -40%)',
              opacity: 0.07,
            }}
          />

          {/* Top bar */}
          {!previewMode && (
            <div className="relative z-10 editorial-container pt-8 shrink-0">
              <span
                className="text-[0.58rem] uppercase tracking-[0.5em]"
                style={{ color: 'var(--k-accent)', opacity: 0.6 }}
              >
                KOL 履歷
              </span>
            </div>
          )}

          {/* Main */}
          <div className="relative z-10 editorial-container flex-1 flex items-center py-16">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-12 lg:gap-20 items-center">
              <div className="order-last lg:order-first">
                <motion.p
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-[0.58rem] uppercase tracking-[0.55em] mb-6"
                  style={{ color: 'var(--k-accent)', opacity: 0.7 }}
                >
                  KOL 創作者 · PartnerLink
                </motion.p>
                <motion.h1
                  initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif leading-[0.92] tracking-tight text-background mb-8"
                  style={{ fontSize: 'clamp(3.2rem, 8vw, 8rem)' }}
                >
                  {resume.displayName}
                </motion.h1>

                {resume.nicheTags.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.55 }}
                    className="flex flex-wrap gap-2 mb-8"
                  >
                    {resume.nicheTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-[0.58rem] uppercase tracking-[0.2em] text-background/70"
                        style={{ border: '1px solid var(--k-accent-tag)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </motion.div>
                )}

                {/* Hero mini-stats — numbers in accent */}
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="flex flex-wrap items-center gap-x-6 gap-y-4"
                >
                  {resume.followerCount > 0 && (
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-[0.4em] mb-1 text-background/40">追蹤者</p>
                      <p
                        className="font-serif text-2xl leading-none"
                        style={{ color: 'var(--k-accent)' }}
                      >
                        {formatFollowers(resume.followerCount)}
                      </p>
                    </div>
                  )}
                  <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--k-accent-line)' }} />
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.4em] mb-1 text-background/40">合作商案</p>
                    <p className="font-serif text-2xl leading-none" style={{ color: 'var(--k-accent)' }}>
                      {resume.platformStats.activeProjects}
                    </p>
                  </div>
                  <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--k-accent-line)' }} />
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.4em] mb-1 text-background/40">成交數</p>
                    <p className="font-serif text-2xl leading-none" style={{ color: 'var(--k-accent)' }}>
                      {resume.platformStats.totalSales.toLocaleString('zh-TW')}
                    </p>
                  </div>
                  <div className="w-px h-8 hidden sm:block" style={{ background: 'var(--k-accent-line)' }} />
                  <div>
                    <p className="text-[0.55rem] uppercase tracking-[0.4em] mb-1 text-background/40">轉換率</p>
                    <p className="font-serif text-2xl leading-none" style={{ color: 'var(--k-accent)' }}>
                      {resume.platformStats.conversionRate.toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Avatar with accent ring */}
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="flex justify-center lg:justify-end order-first lg:order-last"
              >
                <div className="relative">
                  <div
                    className="absolute rounded-full"
                    style={{
                      inset: -16,
                      border: '1px solid var(--k-accent-line)',
                    }}
                  />
                  <div
                    className="absolute rounded-full"
                    style={{
                      inset: -6,
                      border: '1px solid var(--k-accent-tag)',
                    }}
                  />
                  <ResumeAvatar
                    name={resume.displayName}
                    photoUrl={resume.profilePhotoUrl}
                    dark
                    className="w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72"
                    style={{ border: '1px solid var(--k-accent-tag)' } as React.CSSProperties}
                  />
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="relative z-10 editorial-container pb-10 flex items-center gap-3"
          >
            <span className="text-[0.55rem] uppercase tracking-[0.45em] text-background/30">Scroll</span>
            <ArrowDown className="h-3 w-3 animate-bounce" style={{ color: 'var(--k-accent)', opacity: 0.7 }} strokeWidth={1.5} />
          </motion.div>

          {/* Accent bottom rule */}
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'var(--k-accent)', opacity: 0.35 }} />
        </section>

        {/* ── BODY + FOOTER — unified dark background ───────── */}
        <div className="text-background" style={{ background: 'var(--k-body)' }}>

          {/* ── BIO ───────────────────────────────────────── */}
          <section className="py-16 md:py-20" style={{ borderTop: '1px solid var(--k-accent-line)' }}>
            <div className="editorial-container">
              <SectionEyebrow label="About" />

              <motion.p
                {...reveal(0.08)}
                className="text-[1.05rem] leading-[1.8] text-background/75 max-w-2xl mb-10"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {resume.bio || <span className="italic text-background/30">尚未填寫自我介紹。</span>}
              </motion.p>

              {/* Platform strip */}
              {socialEntries.length > 0 && (
                <motion.div {...fadeIn(0.18)} className="flex items-center flex-wrap gap-0">
                  {socialEntries.map(([platform, url]) => {
                    const label = PLATFORM_LABELS[platform] ?? platform
                    const abbr  = label.slice(0, 2).toUpperCase()
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center gap-2.5 px-4 py-3 -mr-px transition-colors duration-150"
                        style={{
                          border: '1px solid var(--k-accent-line)',
                          marginBottom: -1,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--k-accent-tag)'; e.currentTarget.style.background = 'var(--k-accent-dim)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--k-accent-line)'; e.currentTarget.style.background = 'transparent' }}
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-mono font-semibold transition-colors"
                          style={{
                            background: 'var(--k-accent-dim)',
                            color: 'var(--k-accent)',
                          }}
                        >
                          {abbr}
                        </span>
                        <span className="text-[0.62rem] uppercase tracking-[0.18em] text-background/50 group-hover:text-background/80 transition-colors">
                          {label}
                        </span>
                        <ExternalLink className="h-2.5 w-2.5 text-background/25 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )
                  })}

                  {resume.username && (
                    <div className="ml-auto pl-8 flex flex-col items-end justify-center">
                      <p className="font-mono text-sm text-background/55 leading-none">@{resume.username}</p>
                      <p className="mt-1.5 text-[0.5rem] uppercase tracking-[0.4em] text-background/30">帳號</p>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </section>

          {/* ── PLATFORM STATS (merchant/admin only) ──────── */}
          {canSeeStats && (
            <section className="py-16 md:py-20" style={{ borderTop: '1px solid var(--k-accent-line)' }}>
              <div className="editorial-container">
                <SectionEyebrow label="平台數據" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" style={{ borderLeft: '1px solid var(--k-accent-line)' }}>
                  {platformStats.map((s, i) => {
                    const Icon = s.icon
                    return (
                      <motion.div
                        key={s.label}
                        {...reveal(i * 0.07)}
                        className="px-6 py-2"
                        style={{ borderRight: '1px solid var(--k-accent-line)' }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <Icon className="h-3 w-3" style={{ color: 'var(--k-accent)', opacity: 0.5 }} />
                          <p className="text-[0.5rem] uppercase tracking-[0.4em] text-background/40">{s.label}</p>
                        </div>
                        <p
                          className="font-serif leading-none tracking-tight"
                          style={{ fontSize: 'clamp(1.9rem, 3.5vw, 3rem)', color: 'var(--k-accent)' }}
                        >
                          {s.value}
                        </p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}

          {/* ── WORK / MEDIA ──────────────────────────────── */}
          <section className="py-16 md:py-20" style={{ borderTop: '1px solid var(--k-accent-line)' }}>
            <div className="editorial-container">
              <motion.div {...fadeIn(0)} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                <div className="flex items-center gap-5">
                  <p
                    className="shrink-0 text-[0.55rem] uppercase tracking-[0.55em]"
                    style={{ color: 'var(--k-accent)', opacity: 0.75 }}
                  >
                    Work
                  </p>
                  <div className="h-px w-8" style={{ background: 'var(--k-accent-line)' }} />
                  <p className="font-serif text-3xl leading-tight text-background/90">作品集</p>
                </div>
                {/* Tabs — active tab uses accent background */}
                <div className="flex" style={{ border: '1px solid var(--k-accent-line)' }}>
                  {([
                    { id: 'photos' as const, label: '照片', count: photos.length },
                    { id: 'videos' as const, label: '影片', count: videos.length },
                  ] as const).map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="relative px-6 py-3 text-[0.6rem] uppercase tracking-[0.28em] transition-all duration-200"
                      style={
                        activeTab === tab.id
                          ? { background: 'var(--k-accent)', color: 'var(--k-hero)' }
                          : { color: 'rgba(255,255,255,0.4)' }
                      }
                    >
                      {tab.label}
                      <span
                        className="ml-1.5 text-[0.52rem]"
                        style={{ opacity: activeTab === tab.id ? 0.6 : 0.3 }}
                      >
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  {activeMedia.length === 0 ? (
                    <div
                      className="flex flex-col items-center justify-center py-24 gap-4"
                      style={{ border: '1px dashed var(--k-accent-line)' }}
                    >
                      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-background/30">
                        尚無{activeTab === 'photos' ? '照片' : '影片'}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                      {activeMedia.map((item) => <MediaCard key={item.id} item={item} />)}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* ── FOOTER STRIP ──────────────────────────────── */}
          <section className="py-12" style={{ borderTop: '1px solid var(--k-accent-line)' }}>
            <div className="editorial-container flex items-center gap-4">
              <div className="h-px flex-1" style={{ background: 'var(--k-accent-line)' }} />
              <p
                className="text-[0.55rem] uppercase tracking-[0.5em]"
                style={{ color: 'var(--k-accent)', opacity: 0.4 }}
              >
                PartnerLink 夥伴
              </p>
              <div className="h-px flex-1" style={{ background: 'var(--k-accent-line)' }} />
            </div>
          </section>

        </div>{/* end dark body */}

      </div>

    </>
  )
}
