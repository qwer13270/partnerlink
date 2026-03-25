'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Mock data ────────────────────────────────────────────────────────────────
type MerchantProfile = {
  company_name: string
}

type LeadStatus = 'pending-tour' | 'toured' | 'negotiating' | 'sale-confirmed' | 'cancelled'

const RECENT_LEADS: {
  id: string; leadName: string; property: string; kolName: string; date: string; status: LeadStatus
}[] = [
  { id: 'r-001', leadName: '王○明', property: '璞真建設 — 光河', kolName: '陳莎拉', date: '2026-02-23', status: 'negotiating'    },
  { id: 'r-002', leadName: '李○華', property: '璞真建設 — 光河', kolName: '陳莎拉', date: '2026-02-21', status: 'toured'          },
  { id: 'r-003', leadName: '黃○偉', property: '潤泰敦峰',        kolName: '林佳慧', date: '2026-02-18', status: 'sale-confirmed'  },
]

const PENDING_APPLICATIONS = [
  { id: 'app-001', name: '何俊傑', platform: 'YouTube',   followers: '12.4萬', property: '璞真建設 — 光河', appliedDate: '2026-02-24' },
  { id: 'app-002', name: '蔡佳蓉', platform: 'Instagram', followers: '8.7萬',  property: '潤泰敦峰',        appliedDate: '2026-02-23' },
]

const LEAD_STATUS_CFG: Record<LeadStatus, { label: string; color: string }> = {
  'pending-tour':   { label: '待預約', color: 'text-muted-foreground border-border'                    },
  toured:           { label: '已預約', color: 'text-blue-700 border-blue-200 bg-blue-50'              },
  negotiating:      { label: '議價中', color: 'text-amber-700 border-amber-200 bg-amber-50'            },
  'sale-confirmed': { label: '已成交', color: 'text-emerald-700 border-emerald-200 bg-emerald-50'     },
  cancelled:        { label: '已取消', color: 'text-red-700 border-red-200 bg-red-50'                  },
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MerchantHomePage() {
  const [merchantName, setMerchantName] = useState('商家夥伴')

  useEffect(() => {
    const controller = new AbortController()

    async function loadProfile() {
      try {
        const response = await fetch('/api/merchant/profile', { signal: controller.signal })
        const payload = (await response.json().catch(() => null)) as { profile?: MerchantProfile } | null
        if (response.ok && payload?.profile?.company_name) {
          setMerchantName(payload.profile.company_name)
        }
      } catch {
        // Keep the fallback mock heading if the profile is temporarily unavailable.
      }
    }

    void loadProfile()
    return () => controller.abort()
  }, [])

  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">歡迎回來，{merchantName}</h1>
        <p className="text-sm text-muted-foreground mt-2">以下是您目前的商案總覽。</p>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        custom={1} initial="hidden" animate="visible" variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: '進行中商案', value: 2 },
          { label: '合作 KOL',   value: 3 },
          { label: '本月預約',   value: 18 },
          { label: '本月成交',   value: 3 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm px-5 py-6 text-center transition-shadow duration-300 hover:shadow-md">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">{stat.label}</p>
            <p className="text-4xl font-serif">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Two-column: Applications + Recent Leads ── */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Pending KOL Applications */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">待審核申請</p>
            {PENDING_APPLICATIONS.length > 0 && (
              <span className="text-xs uppercase tracking-widest text-amber-700 border border-amber-200 bg-amber-50 px-1.5 py-px">
                {PENDING_APPLICATIONS.length} 待處理
              </span>
            )}
          </div>
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden divide-y divide-foreground/[0.06]">
            {PENDING_APPLICATIONS.map((app) => (
              <div key={app.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm font-medium">{app.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.platform} · {app.followers} 粉絲
                      <span className="mx-1.5 opacity-30">·</span>
                      申請推廣：{app.property}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono shrink-0">{app.appliedDate}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-xs uppercase tracking-[0.3em] px-3 py-1.5 bg-foreground text-background border border-foreground hover:bg-foreground/85 transition-colors duration-150">
                    通過
                  </button>
                  <button className="text-xs uppercase tracking-[0.3em] px-3 py-1.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150">
                    拒絕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-right">
            <Link
              href="/merchant/kols"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150 group"
            >
              查看全部 KOL <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Leads */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">近期客戶</p>
            <span className="text-xs text-muted-foreground">{RECENT_LEADS.length} 筆</span>
          </div>
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden divide-y divide-foreground/[0.06]">
            {RECENT_LEADS.map((lead) => {
              const cfg = LEAD_STATUS_CFG[lead.status]
              return (
                <div key={lead.id} className="px-5 py-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{lead.leadName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lead.property}
                      <span className="mx-1.5 opacity-30">·</span>
                      KOL {lead.kolName}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{lead.date}</p>
                  </div>
                  <span className={`text-xs uppercase tracking-widest px-1.5 py-px border shrink-0 mt-0.5 ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-3 text-right">
            <Link
              href="/merchant/leads"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150 group"
            >
              查看全部 <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
