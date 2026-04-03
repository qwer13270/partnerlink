'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, BadgeDollarSign, Link2 } from 'lucide-react'
import type { CommissionGroup, CommissionEntry } from '@/app/kol/commissions/page'

// ── Animation ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

// ── PropertyRow ──────────────────────────────────────────────────────────────
function PropertyRow({ group, index }: { group: CommissionGroup; index: number }) {
  const [open, setOpen] = useState(false)

  const groupTotal = group.entries.reduce((s, e) => s + e.commissionWan, 0)

  return (
    <motion.div
      custom={3 + index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.08] last:border-b-0"
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full text-left px-5 py-5 flex items-start gap-4 hover:bg-muted/30 transition-colors duration-150"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium mb-1.5">{group.projectName}</p>
          <p className="text-xs text-muted-foreground">
            佣金比率 {group.commissionRate}%
            <span className="mx-1.5 opacity-30">·</span>
            {group.entries.length} 筆成交
            <span className="mx-1.5 opacity-30">·</span>
            累計佣金 <span className="font-medium text-foreground">{groupTotal.toFixed(2)} 萬</span>
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-foreground/[0.08] bg-foreground/[0.015] divide-y divide-foreground/[0.06]">
              {group.entries.map((entry: CommissionEntry) => (
                <div key={entry.id} className="px-5 py-4 pl-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-mono">{formatDate(entry.date)}</p>
                    <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      已確認
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '成交金額', value: `${entry.dealValueWan.toLocaleString('zh-TW')} 萬` },
                      { label: '佣金比率', value: `${entry.commissionRate}%` },
                      { label: '佣金金額', value: `${entry.commissionWan.toFixed(2)} 萬` },
                    ].map(s => (
                      <div key={s.label} className="border border-foreground/15 px-3 py-2.5 text-center bg-background">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                        <p className="text-base font-serif mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      custom={2} initial="hidden" animate="visible" variants={fadeUp}
      className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-foreground/15 bg-stone-50/50 py-20 text-center"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/10 bg-white/80 shadow-sm">
        <BadgeDollarSign className="h-6 w-6 text-foreground/25" strokeWidth={1.2} />
      </div>
      <div>
        <p className="text-sm text-foreground/50 tracking-wide">尚無佣金紀錄</p>
        <p className="mt-1 text-xs text-muted-foreground/60 max-w-[22rem]">
          商家確認成交後，佣金紀錄將自動顯示於此
        </p>
      </div>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KolCommissionsClient({ groups }: { groups: CommissionGroup[] }) {
  const allEntries   = groups.flatMap(g => g.entries)
  const totalComm    = allEntries.reduce((s, e) => s + e.commissionWan, 0)
  const totalDeals   = allEntries.length
  const avgComm      = totalDeals > 0 ? totalComm / totalDeals : 0

  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">佣金管理</p>
        <h1 className="text-3xl font-serif">佣金紀錄</h1>
        <p className="text-sm text-muted-foreground mt-2">
          每筆成交佣金在合約確認後 30 個工作天內撥款。
        </p>
      </motion.div>

      {/* ── Summary stats ── */}
      <motion.div
        custom={1} initial="hidden" animate="visible" variants={fadeUp}
        className="grid grid-cols-3 gap-3"
      >
        {[
          { label: '累計佣金', value: totalComm.toFixed(2),    sub: '萬元', color: undefined    },
          { label: '成交筆數', value: totalDeals.toString(),    sub: '筆',  color: undefined    },
          { label: '平均每筆', value: avgComm.toFixed(2),       sub: '萬元', color: '#3a8a5e'   },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-6 text-center transition-shadow duration-300 hover:shadow-md"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">{stat.label}</p>
            <p
              className="text-4xl font-serif leading-none"
              style={{ color: stat.color ?? 'hsl(var(--foreground))' }}
            >
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Commission history ── */}
      {groups.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <motion.div
            custom={2} initial="hidden" animate="visible" variants={fadeUp}
            className="flex items-center justify-between mb-4"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">佣金明細</p>
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground">
              <Link2 className="h-3 w-3" />
              {groups.length} 個商案 · {totalDeals} 筆成交
            </span>
          </motion.div>

          <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
            {groups.map((group, i) => (
              <PropertyRow key={group.projectId} group={group} index={i} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
