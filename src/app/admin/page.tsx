'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, ArrowRight, UserPlus, Building2, Users, Store } from 'lucide-react'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

type OverviewData = {
  stats: {
    pendingKols: number
    pendingMerchants: number
    activeKols: number
    activeMerchants: number
  }
  recentKolApps: Array<{ name: string; platform: string; followerRange: string; date: string }>
  recentMerchantApps: Array<{ name: string; contact: string; date: string }>
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null)

  useEffect(() => {
    fetch('/api/admin/overview', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: OverviewData & { ok?: boolean }) => { if (d.ok) setData(d) })
      .catch(() => {})
  }, [])

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const kpiCards = [
    { label: 'KOL 待審申請',  value: data?.stats.pendingKols,      href: '/admin/kol-applications',     urgent: true,  icon: UserPlus },
    { label: '商家待審申請',  value: data?.stats.pendingMerchants, href: '/admin/merchant-applications', urgent: true,  icon: Building2 },
    { label: '活躍 KOL',      value: data?.stats.activeKols,       href: '/admin/kols',                  urgent: false, icon: Users },
    { label: '合作商家',      value: data?.stats.activeMerchants,  href: '/admin/merchants',             urgent: false, icon: Store },
  ]

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-12 text-white"
    >
      <motion.section variants={fadeUp}>
        <div className="meta text-[10px] text-white/40 mb-5 flex items-center gap-3 flex-wrap">
          <span>{today}</span>
          <span className="text-white/20">·</span>
          <span>管理後台</span>
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-2">
            <span className="pulse-dot h-1.5 w-1.5" />
            online
          </span>
        </div>
        <h1 className="font-heading text-[48px] md:text-[72px] leading-[1] tracking-tight text-white">
          平台 <span className="italic">總覽</span>
        </h1>
        <p className="mt-4 font-body text-sm text-white/55 max-w-xl">
          掌握申請狀態、活躍用戶與近期動態。
        </p>
      </motion.section>

      <motion.section variants={fadeUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {kpiCards.map((card) => {
            const Icon = card.icon
            const isPending = card.value !== undefined && card.value !== null
            const needsAttention = card.urgent && (card.value ?? 0) > 0
            return (
              <Link
                key={card.label}
                href={card.href}
                className="liquid-glass !rounded-[22px] p-6 pl-7 relative block group"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="meta text-[10px] text-white/50">{card.label}</div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.6} />
                </div>
                <div className="font-heading italic text-[56px] md:text-[64px] leading-none mb-4 text-white">
                  {isPending ? card.value : (
                    <span className="inline-block h-[1em] w-20 animate-pulse rounded bg-white/10 align-middle" />
                  )}
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-[12px] text-white/55">
                    <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
                    <span>{needsAttention ? '待處理' : '—'}</span>
                  </div>
                  {needsAttention && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-white/[0.02] px-2 py-0.5 meta text-[9px] text-amber-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
                      urgent
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </motion.section>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.section variants={fadeUp}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="meta text-[10px] text-white/45 mb-2 flex items-center">
                <span className="section-underline" />
                recent · KOL 申請
              </div>
              <h2 className="font-heading text-[28px] leading-none tracking-tight text-white">
                最新 KOL
              </h2>
            </div>
            <Link
              href="/admin/kol-applications"
              className="meta text-[10px] text-white/50 hover:text-white transition-colors px-2 py-1 flex items-center gap-1"
            >
              全部 <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="liquid-glass !rounded-[22px] divide-y divide-white/5">
            {!data ? (
              [0, 1, 2].map(i => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                    <div className="h-2.5 w-32 bg-white/[0.06] rounded animate-pulse" />
                  </div>
                  <div className="h-2.5 w-20 bg-white/[0.06] rounded animate-pulse" />
                </div>
              ))
            ) : data.recentKolApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <UserPlus className="h-8 w-8 text-white/20" strokeWidth={1.2} />
                <p className="font-body text-xs text-white/55">目前無待審申請</p>
              </div>
            ) : (
              data.recentKolApps.map((app, i) => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[15px] text-white/90 truncate">{app.name}</p>
                    <p className="meta text-[10px] text-white/40 mt-1 truncate">
                      {app.platform}{app.followerRange ? ` · ${app.followerRange}` : ''}
                    </p>
                  </div>
                  <p className="meta text-[10px] text-white/45 shrink-0 ml-4">{app.date}</p>
                </div>
              ))
            )}
          </div>
        </motion.section>

        <motion.section variants={fadeUp}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="meta text-[10px] text-white/45 mb-2 flex items-center">
                <span className="section-underline" />
                recent · 商家申請
              </div>
              <h2 className="font-heading text-[28px] leading-none tracking-tight text-white">
                最新商家
              </h2>
            </div>
            <Link
              href="/admin/merchant-applications"
              className="meta text-[10px] text-white/50 hover:text-white transition-colors px-2 py-1 flex items-center gap-1"
            >
              全部 <ArrowRight className="h-2.5 w-2.5" />
            </Link>
          </div>
          <div className="liquid-glass !rounded-[22px] divide-y divide-white/5">
            {!data ? (
              [0, 1].map(i => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <div className="space-y-1.5">
                    <div className="h-3 w-28 bg-white/10 rounded animate-pulse" />
                    <div className="h-2.5 w-20 bg-white/[0.06] rounded animate-pulse" />
                  </div>
                  <div className="h-2.5 w-20 bg-white/[0.06] rounded animate-pulse" />
                </div>
              ))
            ) : data.recentMerchantApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <Building2 className="h-8 w-8 text-white/20" strokeWidth={1.2} />
                <p className="font-body text-xs text-white/55">目前無待審申請</p>
              </div>
            ) : (
              data.recentMerchantApps.map((app, i) => (
                <div key={i} className="p-5 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-[15px] text-white/90 truncate">{app.name}</p>
                    <p className="meta text-[10px] text-white/40 mt-1 truncate">{app.contact}</p>
                  </div>
                  <p className="meta text-[10px] text-white/45 shrink-0 ml-4">{app.date}</p>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  )
}
