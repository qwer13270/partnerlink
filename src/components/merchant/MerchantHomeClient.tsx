'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MousePointerClick, Handshake, DoorOpen, BadgeDollarSign } from 'lucide-react'
import type { MerchantHomeData } from '@/app/merchant/home/page'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

function CustomerStatusBadge({ status }: { status: 'inquiry' | 'visited' | 'deal' }) {
  if (status === 'deal') return (
    <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border shrink-0 bg-emerald-50 text-emerald-700 border-emerald-200/60">
      已成交
    </span>
  )
  if (status === 'visited') return (
    <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border shrink-0 bg-blue-50 text-blue-600 border-blue-200/60">
      已看房
    </span>
  )
  return (
    <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border shrink-0 bg-zinc-100 text-zinc-500 border-zinc-200/60">
      詢問中
    </span>
  )
}

export default function MerchantHomeClient({ data }: { data: MerchantHomeData }) {
  const { merchantName, stats, recentCustomers, pendingRequests } = data

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">
          {today} · 商家後台
        </p>
        <h1 className="text-3xl font-serif">歡迎回來，{merchantName}</h1>
        <p className="text-sm text-muted-foreground mt-2">以下是您目前的商案總覽。</p>
      </motion.div>

      {/* ── Stats ── */}
      <motion.div
        custom={1} initial="hidden" animate="visible" variants={fadeUp}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {([
          { label: '進行中商案', value: stats.projectCount,   icon: MousePointerClick, color: undefined    },
          { label: '合作 KOL',   value: stats.activeKolCount, icon: Handshake,          color: undefined    },
          { label: '本月預約',   value: stats.monthVisits,    icon: DoorOpen,           color: '#2563eb'    },
          { label: '本月成交',   value: stats.monthDeals,     icon: BadgeDollarSign,    color: '#3a8a5e'    },
        ] as const).map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="group relative overflow-hidden rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-6 text-center transition-shadow duration-300 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-foreground/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <div className="flex items-center justify-center mb-2">
                <Icon className="h-3 w-3" style={{ color: stat.color ?? 'rgba(0,0,0,0.25)' }} strokeWidth={1.5} />
              </div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">{stat.label}</p>
              <p
                className="text-4xl font-serif leading-none"
                style={{ color: stat.color ?? 'hsl(var(--foreground))' }}
              >
                {stat.value}
              </p>
            </div>
          )
        })}
      </motion.div>

      {/* ── Two-column: Pending Requests + Recent Customers ── */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Pending collaboration requests */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">待回覆邀請</p>
            {pendingRequests.length > 0 && (
              <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200/60">
                {pendingRequests.length} 待處理
              </span>
            )}
          </div>

          <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
            {pendingRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-6">
                <Handshake className="h-7 w-7 text-foreground/15" strokeWidth={1.2} />
                <p className="text-xs text-muted-foreground tracking-wide">無待回覆邀請</p>
              </div>
            ) : (
              <div className="divide-y divide-foreground/[0.06]">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <p className="text-sm font-medium">{req.kolName ?? 'KOL'}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          申請推廣：{req.projectName ?? '未知案場'}
                          {req.commissionRate !== null && (
                            <>
                              <span className="mx-1.5 opacity-30">·</span>
                              {req.commissionRate}% 佣金
                            </>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono shrink-0">{formatDate(req.createdAt)}</p>
                    </div>
                    <Link
                      href={`/merchant/projects/${req.projectId}/kols`}
                      className="inline-flex items-center gap-1 text-[0.78rem] font-medium px-3.5 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150"
                    >
                      前往管理 <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 text-right">
            <Link
              href="/merchant/projects"
              className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150 group"
            >
              查看全部商案 <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Recent Customers */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">近期客戶</p>
            <span className="text-xs text-muted-foreground">{recentCustomers.length} 筆</span>
          </div>

          <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
            {recentCustomers.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center px-6">
                <MousePointerClick className="h-7 w-7 text-foreground/15" strokeWidth={1.2} />
                <p className="text-xs text-muted-foreground tracking-wide">尚無客戶紀錄</p>
              </div>
            ) : (
              <div className="divide-y divide-foreground/[0.06]">
                {recentCustomers.map((c) => (
                  <div key={c.id} className="px-5 py-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{c.name ?? '匿名'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {c.projectName}
                        {c.kolName && (
                          <>
                            <span className="mx-1.5 opacity-30">·</span>
                            KOL {c.kolName}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{formatDate(c.submittedAt)}</p>
                    </div>
                    <CustomerStatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 text-right">
            <Link
              href="/merchant/projects"
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
