'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, X, ChevronDown,
  Users, BadgeCheck, TrendingUp, Link2,
  Phone, Mail, MessageSquare, CircleDot, DoorOpen,
  BedDouble, Hash, CalendarCheck2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Customer, ActiveKol } from './page'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 14 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatDealValue(v: number) {
  return `NT$ ${v.toLocaleString('zh-TW')} 萬`
}

// ── Stats card ─────────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, accent = false,
}: {
  label: string
  value: string
  sub?: string
  accent?: boolean
}) {
  return (
    <div
      className="flex-1 min-w-0 px-5 py-4"
      style={{
        borderRight: '1px solid rgba(26,26,26,0.08)',
        background: accent ? 'rgba(74,158,110,0.04)' : 'transparent',
      }}
    >
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-1.5">{label}</p>
      <p className={`text-2xl font-serif font-light ${accent ? 'text-emerald-700' : ''}`}>{value}</p>
      {sub && <p className="text-[0.7rem] text-muted-foreground/60 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Source badge ───────────────────────────────────────────────────────────
function SourceBadge({ customer }: { customer: Customer }) {
  if (customer.source === 'attributed') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[0.67rem] font-medium px-2 py-0.5 rounded border"
        style={{
          background: 'rgba(196,145,58,0.08)',
          borderColor: 'rgba(196,145,58,0.25)',
          color: '#b8822e',
        }}
      >
        <Link2 className="h-2.5 w-2.5" />
        {customer.kolName ?? 'KOL 引薦'}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[0.67rem] text-muted-foreground/70 px-2 py-0.5 rounded border border-foreground/[0.08]"
    >
      <CircleDot className="h-2.5 w-2.5" />
      直接詢問
    </span>
  )
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({
  customer,
  onViewDeal,
}: {
  customer: Customer
  onViewDeal: () => void
}) {
  if (customer.dealConfirmedAt && customer.dealValue) {
    return (
      <button
        onClick={(e) => { e.stopPropagation(); onViewDeal() }}
        className="inline-flex items-center gap-1 text-[0.67rem] font-medium px-2 py-0.5 rounded border cursor-pointer hover:opacity-80 active:scale-[0.97] transition-all duration-150"
        style={{ background: 'rgba(74,158,110,0.09)', borderColor: 'rgba(74,158,110,0.25)', color: '#3a8a5e' }}
      >
        <CheckCircle2 className="h-2.5 w-2.5" />
        已成交
      </button>
    )
  }
  if (customer.visitedAt) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[0.67rem] font-medium px-2 py-0.5 rounded border"
        style={{ background: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.25)', color: '#2563eb' }}
      >
        <DoorOpen className="h-2.5 w-2.5" />
        已看房
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.67rem] text-muted-foreground/60 px-2 py-0.5 rounded border border-foreground/[0.07]">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
      詢問中
    </span>
  )
}

// ── Deal detail modal ──────────────────────────────────────────────────────
function DealDetailModal({
  customer,
  onClose,
}: {
  customer: Customer
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-xl border border-foreground/[0.1] bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emerald header band */}
        <div
          className="px-6 py-5"
          style={{ background: 'linear-gradient(135deg, rgba(74,158,110,0.12) 0%, rgba(74,158,110,0.05) 100%)', borderBottom: '1px solid rgba(74,158,110,0.15)' }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.4em] text-emerald-700/70 mb-1">成交明細</p>
              <h2 className="text-lg font-serif text-foreground">{customer.name ?? '客戶'}</h2>
              {customer.kolName && (
                <p className="text-[0.7rem] text-muted-foreground/60 mt-0.5">
                  來源：{customer.kolName}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-7 w-7 rounded-lg bg-black/[0.05] hover:bg-black/[0.09] transition-colors"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Detail rows */}
        <div className="px-6 py-5 space-y-4">
          {/* Deal value — prominent */}
          <div
            className="flex items-center justify-between rounded-lg px-4 py-3"
            style={{ background: 'rgba(74,158,110,0.07)', border: '1px solid rgba(74,158,110,0.18)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-[0.7rem] uppercase tracking-[0.25em] text-emerald-700/80">成交金額</span>
            </div>
            <span className="text-base font-semibold font-serif text-emerald-700">
              {formatDealValue(customer.dealValue!)}
            </span>
          </div>

          {/* Room type + room number */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: 'rgba(26,26,26,0.03)', border: '1px solid rgba(26,26,26,0.07)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <BedDouble className="h-3 w-3 text-muted-foreground/50" />
                <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/50">房型</p>
              </div>
              <p className="text-sm font-medium">
                {customer.roomType ?? <span className="text-muted-foreground/40 font-normal">—</span>}
              </p>
            </div>
            <div
              className="rounded-lg px-4 py-3"
              style={{ background: 'rgba(26,26,26,0.03)', border: '1px solid rgba(26,26,26,0.07)' }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <Hash className="h-3 w-3 text-muted-foreground/50" />
                <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/50">房號</p>
              </div>
              <p className="text-sm font-medium">
                {customer.roomNumber ?? <span className="text-muted-foreground/40 font-normal">—</span>}
              </p>
            </div>
          </div>

          {/* Confirmed date */}
          {customer.dealConfirmedAt && (
            <div className="flex items-center gap-2">
              <CalendarCheck2 className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              <p className="text-[0.7rem] text-muted-foreground/50">
                成交時間：{formatDate(customer.dealConfirmedAt)}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Customer row ───────────────────────────────────────────────────────────
function CustomerRow({
  customer,
  index,
  onMarkVisited,
  onConfirmDeal,
  onViewDeal,
}: {
  customer: Customer
  index: number
  onMarkVisited: (c: Customer) => void
  onConfirmDeal: (c: Customer) => void
  onViewDeal: (c: Customer) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isDeal    = !!customer.dealConfirmedAt
  const isVisited = !!customer.visitedAt

  const rowBg = isDeal ? 'bg-emerald-50/30' : isVisited ? 'bg-blue-50/20' : ''

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className={`border-b border-foreground/[0.07] last:border-b-0 ${rowBg}`}
    >
      {/* Main row */}
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Index */}
        <span className="text-[0.65rem] font-mono text-muted-foreground/40 w-5 shrink-0 text-right">
          {index + 1}
        </span>

        {/* Name + source */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium">{customer.name ?? '—'}</p>
            <SourceBadge customer={customer} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{formatDate(customer.submittedAt)}</p>
        </div>

        {/* Status */}
        <div className="shrink-0">
          <StatusBadge customer={customer} onViewDeal={() => onViewDeal(customer)} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {!isDeal && !isVisited && (
            <button
              onClick={() => onMarkVisited(customer)}
              className="flex items-center gap-1.5 text-[0.75rem] font-medium px-3 py-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.97] transition-all duration-150"
            >
              <DoorOpen className="h-3 w-3" />
              已看房
            </button>
          )}
          {!isDeal && isVisited && (
            <button
              onClick={() => onConfirmDeal(customer)}
              className="flex items-center gap-1.5 text-[0.75rem] font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.97] transition-all duration-150"
            >
              <BadgeCheck className="h-3 w-3" />
              確認成交
            </button>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-black/[0.05] hover:bg-black/[0.09] active:scale-[0.97] transition-all duration-150"
          >
            <ChevronDown
              className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div
              className="px-5 pb-5 pt-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              style={{ borderTop: '1px dashed rgba(26,26,26,0.08)' }}
            >
              {customer.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 mb-0.5">電話</p>
                    <p className="text-sm">{customer.phone}</p>
                  </div>
                </div>
              )}
              {customer.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 mb-0.5">信箱</p>
                    <p className="text-sm break-all">{customer.email}</p>
                  </div>
                </div>
              )}
              {customer.message && (
                <div className="flex items-start gap-2 sm:col-span-2 lg:col-span-1">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground/50 mb-0.5">留言</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{customer.message}</p>
                  </div>
                </div>
              )}
              {!customer.phone && !customer.email && !customer.message && (
                <p className="text-xs text-muted-foreground/50 col-span-full">無詳細資料</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Confirm deal modal ─────────────────────────────────────────────────────
function ConfirmDealModal({
  customer,
  activeKols,
  projectId,
  onClose,
  onConfirmed,
}: {
  customer: Customer
  activeKols: ActiveKol[]
  projectId: string
  onClose: () => void
  onConfirmed: (customerId: string, dealValue: number, roomType: string | null, roomNumber: string | null, kolUserId?: string) => void
}) {
  const [dealValue, setDealValue] = useState('')
  const [roomType, setRoomType] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [selectedKolId, setSelectedKolId] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isDirect = customer.source === 'direct'
  const canSubmit = dealValue !== '' && parseFloat(dealValue) > 0

  async function handleSubmit() {
    const value = parseFloat(dealValue)
    if (!value || value <= 0) return
    setSubmitting(true)
    try {
      const res = await fetch(
        `/api/merchant/projects/${projectId}/customers/confirm-deal`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            source:       customer.source,
            customer_id:  customer.id,
            deal_value:   value,
            room_type:    roomType.trim() || undefined,
            room_number:  roomNumber.trim() || undefined,
            kol_user_id:  isDirect && selectedKolId ? selectedKolId : undefined,
          }),
        },
      )
      if (!res.ok) {
        const payload = await res.json().catch(() => null) as { error?: string } | null
        throw new Error(payload?.error ?? '確認失敗')
      }
      toast.success(`${customer.name ?? '客戶'} 成交紀錄已儲存`)
      onConfirmed(
        customer.id,
        value,
        roomType.trim() || null,
        roomNumber.trim() || null,
        isDirect ? selectedKolId || undefined : undefined,
      )
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '確認失敗，請稍後再試。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={() => { if (!submitting) onClose() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-xl border border-foreground/[0.1] bg-background p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground mb-1">確認成交</p>
            <h2 className="text-xl font-serif">{customer.name ?? '此客戶'}</h2>
            {customer.kolName && (
              <p className="text-xs text-muted-foreground mt-1">
                來源：{customer.kolName} 推廣連結
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-7 w-7 rounded-lg bg-black/[0.05] hover:bg-black/[0.09] transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Deal value */}
        <div className="mb-4">
          <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">
            成交金額（萬元）
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">NT$</span>
            <input
              type="number"
              min="0"
              step="1"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              placeholder="0"
              autoFocus
              className="w-full rounded-lg border border-foreground/[0.12] bg-foreground/[0.02] px-3 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50">萬</span>
          </div>
        </div>

        {/* Room type + room number */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              房型
            </label>
            <div className="relative">
              <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
              <input
                type="text"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                placeholder="例：三房兩廳"
                className="w-full rounded-lg border border-foreground/[0.12] bg-foreground/[0.02] px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>
          <div>
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              房號
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/40" />
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="例：12F-A"
                className="w-full rounded-lg border border-foreground/[0.12] bg-foreground/[0.02] px-3 py-2.5 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              />
            </div>
          </div>
        </div>

        {/* KOL picker — only for direct inquiries with active KOLs */}
        {isDirect && activeKols.length > 0 && (
          <div className="mb-6">
            <label className="block text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground mb-2">
              歸因 KOL（選填）
            </label>
            <p className="text-[0.7rem] text-muted-foreground/60 mb-2.5">
              若此客戶由 KOL 介紹，可將成交歸因至對應 KOL。
            </p>
            <div className="relative">
              <select
                value={selectedKolId}
                onChange={(e) => setSelectedKolId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-foreground/[0.12] bg-foreground/[0.02] px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
              >
                <option value="">不歸因 KOL</option>
                {activeKols.map((k) => (
                  <option key={k.kolUserId} value={k.kolUserId}>
                    {k.kolName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        )}

        {!isDirect && <div className="mb-6" />}

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg bg-black/[0.06] px-4 py-2.5 text-[0.78rem] font-medium text-foreground/70 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-30"
          >
            取消
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={submitting || !canSubmit}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2.5 text-[0.78rem] font-medium text-white hover:bg-emerald-700 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BadgeCheck className="h-3.5 w-3.5" />
            {submitting ? '儲存中…' : '確認成交'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function CustomersClient({
  projectId,
  projectName,
  customers: initialCustomers,
  activeKols,
}: {
  projectId: string
  projectName: string
  projectType: string
  customers: Customer[]
  activeKols: ActiveKol[]
}) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [confirmTarget, setConfirmTarget] = useState<Customer | null>(null)
  const [dealDetailTarget, setDealDetailTarget] = useState<Customer | null>(null)

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total   = customers.length
    const deals   = customers.filter((c) => !!c.dealConfirmedAt).length
    const totalValue = customers
      .filter((c) => c.dealValue != null)
      .reduce((s, c) => s + (c.dealValue ?? 0), 0)
    const attributed = customers.filter((c) => c.source === 'attributed').length
    return { total, deals, totalValue, attributed }
  }, [customers])

  async function handleMarkVisited(customer: Customer) {
    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => c.id === customer.id ? { ...c, visitedAt: new Date().toISOString() } : c),
    )
    const res = await fetch(`/api/merchant/projects/${projectId}/customers/mark-visited`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: customer.source, customer_id: customer.id }),
    })
    if (!res.ok) {
      // Roll back on failure
      setCustomers((prev) =>
        prev.map((c) => c.id === customer.id ? { ...c, visitedAt: null } : c),
      )
      toast.error('更新失敗，請再試一次。')
    }
  }

  function handleConfirmed(customerId: string, dealValue: number, roomType: string | null, roomNumber: string | null) {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? { ...c, dealValue, dealConfirmedAt: new Date().toISOString(), roomType, roomNumber }
          : c,
      ),
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Header ── */}
      <motion.div {...fadeUp(0.05)}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">客戶名單</p>
        <h1 className="text-3xl font-serif font-light">{projectName}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          所有已提交詢問的客戶資料，包含 KOL 推廣及直接詢問。
        </p>
      </motion.div>

      {/* ── Stats strip ── */}
      <motion.div
        {...fadeUp(0.1)}
        className="flex border border-foreground/[0.08] bg-linen overflow-hidden"
        style={{ borderRight: 'none' }}
      >
        <StatCard
          label="總詢問數"
          value={stats.total.toString()}
          sub={`${stats.attributed} 來自 KOL`}
        />
        <StatCard
          label="已成交"
          value={stats.deals.toString()}
          sub={stats.total > 0 ? `轉換率 ${Math.round((stats.deals / stats.total) * 100)}%` : undefined}
          accent
        />
        <StatCard
          label="成交總值"
          value={stats.totalValue > 0 ? `${stats.totalValue.toLocaleString('zh-TW')} 萬` : '—'}
          sub="NT$"
        />
        <StatCard
          label="KOL 歸因"
          value={stats.attributed.toString()}
          sub={stats.total > 0 ? `佔比 ${Math.round((stats.attributed / stats.total) * 100)}%` : undefined}
        />
      </motion.div>

      {/* ── Customer table ── */}
      <motion.div {...fadeUp(0.15)}>
        {/* Table header */}
        <div
          className="hidden sm:grid grid-cols-[2rem_1fr_auto_auto_auto] gap-4 px-5 py-2.5 border border-foreground/[0.08] border-b-0"
          style={{ background: 'rgba(26,26,26,0.02)' }}
        >
          <span className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/60">#</span>
          <span className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/60">客戶</span>
          <span className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/60">狀態</span>
          <span className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/60"></span>
          <span className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground/60"></span>
        </div>

        {/* Rows */}
        <div className="border border-foreground/[0.08] bg-linen overflow-hidden">
          {customers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center gap-4 py-20"
            >
              <div
                className="flex items-center justify-center w-12 h-12"
                style={{ border: '1.5px dashed rgba(26,26,26,0.15)' }}
              >
                <Users className="h-5 w-5 text-muted-foreground/30" />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">尚無客戶詢問</p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  KOL 推廣或直接填寫預約表單後，客戶資料將顯示於此。
                </p>
              </div>
            </motion.div>
          ) : (
            customers.map((c, i) => (
              <CustomerRow
                key={c.id}
                customer={c}
                index={i}
                onMarkVisited={handleMarkVisited}
                onConfirmDeal={setConfirmTarget}
                onViewDeal={setDealDetailTarget}
              />
            ))
          )}
        </div>
      </motion.div>

      {/* ── Legend ── */}
      {customers.length > 0 && (
        <motion.div {...fadeUp(0.2)} className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[0.68rem] uppercase tracking-[0.2em] text-muted-foreground/50">
              點擊列展開客戶詳細資訊 · 點擊已成交查看成交明細
            </span>
          </div>
        </motion.div>
      )}

      {/* ── Confirm deal modal ── */}
      <AnimatePresence>
        {confirmTarget && (
          <ConfirmDealModal
            customer={confirmTarget}
            activeKols={activeKols}
            projectId={projectId}
            onClose={() => setConfirmTarget(null)}
            onConfirmed={handleConfirmed}
          />
        )}
      </AnimatePresence>

      {/* ── Deal detail modal ── */}
      <AnimatePresence>
        {dealDetailTarget && (
          <DealDetailModal
            customer={dealDetailTarget}
            onClose={() => setDealDetailTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
