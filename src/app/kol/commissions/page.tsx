'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types & mock data ────────────────────────────────────────────────────────
type CommissionStatus = 'pending' | 'confirmed' | 'paid'

type CommissionEntry = {
  id: string
  date: string
  salePriceWan: number
  rate: string
  amountWan: number
  status: CommissionStatus
}

type PropertyGroup = {
  propertyId: string
  property: string
  rate: string
  entries: CommissionEntry[]
}

const PROPERTY_GROUPS: PropertyGroup[] = [
  {
    propertyId: 'prop-005',
    property: '潤泰敦峰',
    rate: '4.2%',
    entries: [
      { id: 'COM-260213-001', date: '2026-02-13', salePriceWan: 5800, rate: '4.2%', amountWan: 243.6, status: 'paid'    },
      { id: 'COM-260109-002', date: '2026-01-09', salePriceWan: 4200, rate: '4.2%', amountWan: 176.4, status: 'paid'    },
    ],
  },
  {
    propertyId: 'prop-001',
    property: '璞真建設 — 光河',
    rate: '3.5%',
    entries: [
      { id: 'COM-260205-003', date: '2026-02-05', salePriceWan: 2380, rate: '3.5%', amountWan:  83.3, status: 'pending' },
      { id: 'COM-251118-004', date: '2025-11-18', salePriceWan: 1980, rate: '3.5%', amountWan:  69.3, status: 'paid'    },
      { id: 'COM-250903-005', date: '2025-09-03', salePriceWan: 3200, rate: '3.5%', amountWan: 112.0, status: 'paid'    },
    ],
  },
]

const STATUS_CFG: Record<CommissionStatus, { label: string; color: string }> = {
  pending:   { label: '待入帳', color: 'text-amber-700 border-amber-200 bg-amber-50'       },
  confirmed: { label: '已確認', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  paid:      { label: '已入帳', color: 'text-blue-700 border-blue-200 bg-blue-50'           },
}

// ── Summary totals ───────────────────────────────────────────────────────────
const allEntries    = PROPERTY_GROUPS.flatMap((g) => g.entries)
const totalAmount   = allEntries.reduce((s, c) => s + c.amountWan, 0)
const pendingAmount = allEntries.filter((c) => c.status === 'pending').reduce((s, c) => s + c.amountWan, 0)
const paidAmount    = allEntries.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amountWan, 0)

// ── PropertyRow ─────────────────────────────────────────────────────────────
function PropertyRow({ group, index }: { group: PropertyGroup; index: number }) {
  const [open, setOpen] = useState(false)

  const groupTotal    = group.entries.reduce((s, c) => s + c.amountWan, 0)
  const pendingCount  = group.entries.filter((c) => c.status === 'pending').length

  return (
    <motion.div
      custom={3 + index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.08] last:border-b-0"
    >
      {/* ── Clickable header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-5 flex items-start gap-4 hover:bg-muted/30 transition-colors duration-150"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <p className="text-sm font-medium">{group.property}</p>
            {pendingCount > 0 && (
              <span className="text-[0.58rem] uppercase tracking-widest text-amber-700 border border-amber-200 bg-amber-50 px-1.5 py-px">
                {pendingCount} 待入帳
              </span>
            )}
          </div>
          <p className="text-[0.65rem] text-muted-foreground">
            佣金比率 {group.rate}
            <span className="mx-1.5 opacity-30">·</span>
            {group.entries.length} 筆成交
            <span className="mx-1.5 opacity-30">·</span>
            累計佣金 <span className="font-medium text-foreground">{groupTotal.toFixed(1)} 萬</span>
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* ── Expanded entries ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-foreground/[0.08] bg-muted/20 divide-y divide-foreground/[0.06]">
              {group.entries.map((entry) => {
                const cfg = STATUS_CFG[entry.status]
                return (
                  <div key={entry.id} className="px-5 py-4 pl-8">
                    {/* Date + ID + status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <p className="text-[0.65rem] text-muted-foreground font-mono">{entry.date}</p>
                        <span className="text-[0.58rem] text-muted-foreground/50 font-mono"># {entry.id}</span>
                      </div>
                      <span className={`text-[0.58rem] uppercase tracking-widest px-1.5 py-px border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    {/* 3 stat boxes */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: '成交金額', value: `${entry.salePriceWan.toLocaleString('zh-TW')} 萬` },
                        { label: '佣金比率', value: entry.rate                                           },
                        { label: '佣金金額', value: `${entry.amountWan.toFixed(1)} 萬`                  },
                      ].map((s) => (
                        <div key={s.label} className="border border-foreground/15 px-3 py-2.5 text-center bg-background">
                          <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                          <p className="text-base font-serif mt-1">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KolCommissionsPage() {
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
        className="grid grid-cols-3 gap-px bg-foreground/10 border border-foreground/15"
      >
        {[
          { label: '累計佣金', value: totalAmount   },
          { label: '待入帳',   value: pendingAmount  },
          { label: '已入帳',   value: paidAmount     },
        ].map((stat) => (
          <div key={stat.label} className="bg-background px-5 py-6 text-center">
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground mb-3">{stat.label}</p>
            <p className="text-4xl font-serif">{stat.value.toFixed(1)}</p>
            <p className="text-[0.65rem] text-muted-foreground mt-1">萬元</p>
          </div>
        ))}
      </motion.div>

      {/* ── Commission history ── */}
      <div>
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">佣金明細</p>
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            {PROPERTY_GROUPS.length} 個商案 · {allEntries.length} 筆成交
          </span>
        </motion.div>

        <div className="border border-foreground/15">
          {PROPERTY_GROUPS.map((group, i) => (
            <PropertyRow key={group.propertyId} group={group} index={i} />
          ))}
        </div>
      </div>

    </div>
  )
}
