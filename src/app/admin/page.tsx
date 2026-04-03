'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
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

  const stats = data ? [
    { label: 'KOL 待審申請',  value: data.stats.pendingKols,      href: '/admin/kol-applications',      urgent: true  },
    { label: '商家待審申請',  value: data.stats.pendingMerchants,  href: '/admin/merchant-applications',  urgent: true  },
    { label: '活躍 KOL',      value: data.stats.activeKols,        href: '/admin/kols',                   urgent: false },
    { label: '合作商家',      value: data.stats.activeMerchants,   href: '/admin/merchants',              urgent: false },
  ] : [
    { label: 'KOL 待審申請',  value: null, href: '/admin/kol-applications',     urgent: true  },
    { label: '商家待審申請',  value: null, href: '/admin/merchant-applications', urgent: true  },
    { label: '活躍 KOL',      value: null, href: '/admin/kols',                  urgent: false },
    { label: '合作商家',      value: null, href: '/admin/merchants',             urgent: false },
  ]

  return (
    <div className="space-y-10">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">首頁</h1>
        <p className="text-sm text-muted-foreground mt-2">平台申請狀態與用戶總覽。</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} custom={1 + i} initial="hidden" animate="visible" variants={fadeUp}>
            <Link
              href={stat.href}
              className="block rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md p-5 h-full"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{stat.label}</p>
              {stat.value === null ? (
                <div className="h-8 w-12 bg-foreground/[0.06] rounded animate-pulse mt-2" />
              ) : (
                <p className={`text-3xl font-serif mt-2 ${stat.urgent && stat.value > 0 ? 'text-amber-700' : ''}`}>
                  {stat.value}
                </p>
              )}
              {stat.urgent && stat.value != null && stat.value > 0 && (
                <p className="text-xs text-amber-600 mt-1">待處理</p>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent applications */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* KOL */}
        <div>
          <motion.div
            custom={5} initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center justify-between mb-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">最新 KOL 申請</p>
            <Link
              href="/admin/kol-applications"
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
          <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
            <div className="divide-y divide-foreground/[0.06]">
              {!data ? (
                [0, 1, 2].map(i => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-3 w-24 bg-foreground/[0.07] rounded animate-pulse" />
                      <div className="h-2.5 w-32 bg-foreground/[0.04] rounded animate-pulse" />
                    </div>
                    <div className="h-2.5 w-20 bg-foreground/[0.04] rounded animate-pulse" />
                  </div>
                ))
              ) : data.recentKolApps.length === 0 ? (
                <div className="px-5 py-6 text-xs text-muted-foreground/50 text-center">目前無待審申請</div>
              ) : (
                data.recentKolApps.map((app, i) => (
                  <motion.div
                    key={i} custom={6 + i} initial="hidden" animate="visible" variants={fadeUp}
                    className="px-5 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {app.platform}{app.followerRange ? ` · ${app.followerRange}` : ''}
                      </p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{app.date}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Merchant */}
        <div>
          <motion.div
            custom={5} initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center justify-between mb-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">最新商家申請</p>
            <Link
              href="/admin/merchant-applications"
              className="text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              查看全部 <ArrowRight className="h-3 w-3" />
            </Link>
          </motion.div>
          <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
            <div className="divide-y divide-foreground/[0.06]">
              {!data ? (
                [0, 1].map(i => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 bg-foreground/[0.07] rounded animate-pulse" />
                      <div className="h-2.5 w-20 bg-foreground/[0.04] rounded animate-pulse" />
                    </div>
                    <div className="h-2.5 w-20 bg-foreground/[0.04] rounded animate-pulse" />
                  </div>
                ))
              ) : data.recentMerchantApps.length === 0 ? (
                <div className="px-5 py-6 text-xs text-muted-foreground/50 text-center">目前無待審申請</div>
              ) : (
                data.recentMerchantApps.map((app, i) => (
                  <motion.div
                    key={i} custom={6 + i} initial="hidden" animate="visible" variants={fadeUp}
                    className="px-5 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm">{app.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.contact}</p>
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{app.date}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
