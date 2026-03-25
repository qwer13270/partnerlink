'use client'

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

const OVERVIEW_STATS = [
  { label: 'KOL 待審申請',  value: 5,  href: '/admin/kol-applications',      urgent: true  },
  { label: '商家待審申請',  value: 2,  href: '/admin/merchant-applications',  urgent: true  },
  { label: '活躍 KOL',      value: 12, href: '/admin/kols',                   urgent: false },
  { label: '合作商家',      value: 4,  href: '/admin/merchants',              urgent: false },
]

const RECENT_KOL_APPS = [
  { name: '趙子豪', platform: 'YouTube',   followers: '15.2萬', date: '2026-02-26' },
  { name: '黃詠欣', platform: 'Instagram', followers: '8.3萬',  date: '2026-02-25' },
  { name: '鄭宜蓁', platform: 'TikTok',   followers: '22.1萬', date: '2026-02-24' },
]

const RECENT_MERCHANT_APPS = [
  { name: '信義聯合建設', contact: '張建銘', type: '預售屋', date: '2026-02-25' },
  { name: '新北大地產',   contact: '李佳怡', type: '成屋',   date: '2026-02-24' },
]

export default function AdminOverviewPage() {
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
        {OVERVIEW_STATS.map((stat, i) => (
          <motion.div key={stat.label} custom={1 + i} initial="hidden" animate="visible" variants={fadeUp}>
            <Link
              href={stat.href}
              className="block rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md p-5 h-full"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-serif mt-2 ${stat.urgent && stat.value > 0 ? 'text-amber-700' : ''}`}>
                {stat.value}
              </p>
              {stat.urgent && stat.value > 0 && (
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
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden">
            <div className="divide-y divide-foreground/[0.06]">
              {RECENT_KOL_APPS.map((app, i) => (
                <motion.div
                  key={app.name} custom={6 + i} initial="hidden" animate="visible" variants={fadeUp}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{app.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.platform} · {app.followers} 粉絲
                    </p>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{app.date}</p>
                </motion.div>
              ))}
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
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden">
            <div className="divide-y divide-foreground/[0.06]">
              {RECENT_MERCHANT_APPS.map((app, i) => (
                <motion.div
                  key={app.name} custom={6 + i} initial="hidden" animate="visible" variants={fadeUp}
                  className="px-5 py-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm">{app.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.contact} · {app.type}
                    </p>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">{app.date}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
