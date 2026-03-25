'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useMerchantReferrals } from '@/hooks/useMockData'
import type { Referral } from '@/lib/types'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Config ───────────────────────────────────────────────────────────────────
type LeadStatus = Referral['status']

const STATUS_CFG: Record<LeadStatus, { label: string; color: string }> = {
  'pending-tour':   { label: '待看屋', color: 'text-muted-foreground border-border'                  },
  toured:           { label: '已看屋', color: 'text-blue-700 border-blue-200 bg-blue-50'             },
  negotiating:      { label: '議價中', color: 'text-amber-700 border-amber-200 bg-amber-50'          },
  'sale-confirmed': { label: '已成交', color: 'text-emerald-700 border-emerald-200 bg-emerald-50'    },
  cancelled:        { label: '已取消', color: 'text-red-700 border-red-200 bg-red-50'                },
}

const STATUS_FILTERS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all',            label: '全部'   },
  { value: 'pending-tour',   label: '待看屋'  },
  { value: 'toured',         label: '已看屋'  },
  { value: 'negotiating',    label: '議價中'  },
  { value: 'sale-confirmed', label: '已成交'  },
  { value: 'cancelled',      label: '已取消'  },
]

const KOL_FILTERS = [
  { value: 'all',     label: '全部 KOL' },
  { value: 'kol-001', label: '陳莎拉'   },
  { value: 'kol-003', label: '林佳慧'   },
  { value: 'kol-005', label: '吳美玲'   },
]

// ── Filter chip ──────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs uppercase tracking-[0.3em] px-3 py-1.5 border transition-colors duration-150 ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'border-foreground/15 text-muted-foreground hover:border-foreground hover:text-foreground'
      }`}
    >
      {label}
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MerchantLeadsPage() {
  const { data, isLoading, updateReferralStatus } = useMerchantReferrals()
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [kolFilter, setKolFilter] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const rows = useMemo(() => {
    if (!data) return []
    return data.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (kolFilter !== 'all' && r.kolId !== kolFilter) return false
      return true
    })
  }, [data, statusFilter, kolFilter])

  const selectedLead = data?.find((r) => r.id === selectedId) ?? null

  const handleConfirmSale = () => {
    if (!selectedLead) return
    updateReferralStatus(selectedLead.id, 'sale-confirmed')
    toast.success('成交確認成功！')
    setSelectedId(null)
  }

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">客戶名單</h1>
        <p className="text-sm text-muted-foreground mt-2">確認成交並追蹤推薦進度。</p>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4">

        {/* Status chips */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">狀態</p>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={statusFilter === opt.value}
                onClick={() => setStatusFilter(opt.value)}
              />
            ))}
          </div>
        </div>

        {/* KOL chips */}
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">KOL</p>
          <div className="flex flex-wrap gap-2">
            {KOL_FILTERS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                active={kolFilter === opt.value}
                onClick={() => setKolFilter(opt.value)}
              />
            ))}
          </div>
        </div>

      </motion.div>

      {/* ── Lead list ── */}
      <div>
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">推薦紀錄</p>
          <span className="text-xs text-muted-foreground">共 {rows.length} 筆</span>
        </motion.div>

        {isLoading ? (
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">載入中⋯</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">沒有符合條件的紀錄。</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden divide-y divide-foreground/[0.06]">
            {rows.map((lead, i) => {
              const cfg = STATUS_CFG[lead.status]
              return (
                <motion.div
                  key={lead.id}
                  custom={3 + i} initial="hidden" animate="visible" variants={fadeUp}
                  className="px-5 py-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    {/* Lead name + status */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <p className="text-sm font-medium">{lead.leadName}</p>
                      <span className={`text-xs uppercase tracking-widest px-1.5 py-px border shrink-0 ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>

                    {/* Property */}
                    <p className="text-xs text-muted-foreground">{lead.propertyName}</p>

                    {/* KOL + dates */}
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                      KOL {lead.kolName}
                      <span className="mx-1.5 opacity-30 font-sans">·</span>
                      推薦 {lead.referralDate}
                      {lead.tourDate && (
                        <>
                          <span className="mx-1.5 opacity-30 font-sans">·</span>
                          看屋 {lead.tourDate}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Confirm sale button — only for negotiating */}
                  {lead.status === 'negotiating' && (
                    <button
                      onClick={() => setSelectedId(lead.id)}
                      className="shrink-0 text-xs uppercase tracking-[0.3em] px-3 py-1.5 bg-foreground text-background border border-foreground hover:bg-foreground/85 transition-colors duration-150"
                    >
                      確認成交
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Confirm dialog ── */}
      <Dialog open={Boolean(selectedId)} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="rounded-none border-foreground/15 gap-6 max-w-sm">
          <DialogHeader className="gap-2">
            <DialogTitle className="font-serif text-xl font-normal">確認成交</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              確認此筆交易成交後，將觸發 KOL 佣金計算。此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs uppercase tracking-[0.3em] px-4 py-2 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
            >
              取消
            </button>
            <button
              onClick={handleConfirmSale}
              className="text-xs uppercase tracking-[0.3em] px-4 py-2 bg-foreground text-background border border-foreground hover:bg-foreground/85 transition-colors duration-150"
            >
              確認成交
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
