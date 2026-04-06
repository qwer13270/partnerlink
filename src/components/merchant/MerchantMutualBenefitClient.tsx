'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Truck, CheckCircle2, Clock, ChevronDown, ChevronRight, X,
} from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type MutualBenefitItem = {
  item_name: string
  quantity: number
  estimated_value: number
  notes: string | null
}

type Shipment = {
  carrier: string | null
  tracking_number: string | null
  shipped_at: string | null
  received_at: string | null
}

type MutualBenefitRecord = {
  collaboration_id: string
  project_id: string
  project_name: string | null
  collaboration_type: string
  collab_status: string
  sponsorship_bonus: number | null
  created_at: string
  kol_name: string | null
  kol_platform: string | null
  kol_follower_range: string | null
  kol_photo_url: string | null
  items: MutualBenefitItem[]
  shipment: Shipment | null
}

interface Props {
  records: MutualBenefitRecord[]
  projectOptions: { id: string; name: string }[]
}

// ── Carrier options ────────────────────────────────────────────────────────
const CARRIER_OPTIONS = [
  { value: 't-cat',   label: '黑貓宅急便' },
  { value: 'hct',     label: '新竹物流'   },
  { value: 'pelican', label: '統一速達'   },
  { value: 'post',    label: '中華郵政'   },
  { value: 'e-can',   label: '台灣宅配通' },
] as const

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function itemsSummary(items: MutualBenefitItem[]): string {
  if (items.length === 0) return '–'
  const names = items.slice(0, 2).map((it) => it.item_name)
  const rest  = items.length - 2
  return rest > 0 ? `${names.join('、')} +${rest} 項` : names.join('、')
}

// ── Shipment status badge ──────────────────────────────────────────────────
function ShipmentBadge({ shipment }: { shipment: Shipment | null }) {
  if (!shipment || (!shipment.shipped_at && !shipment.carrier)) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.25em] px-2 py-1 border border-zinc-200 bg-zinc-50 text-zinc-500">
        <Clock className="h-2.5 w-2.5" />
        待填入
      </span>
    )
  }
  if (shipment.received_at) {
    return (
      <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.25em] px-2 py-1 border border-emerald-200 bg-emerald-50 text-emerald-700">
        <CheckCircle2 className="h-2.5 w-2.5" />
        已收到
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-[0.25em] px-2 py-1 border border-teal-200 bg-teal-50 text-teal-700">
      <Truck className="h-2.5 w-2.5" />
      已寄出
    </span>
  )
}

// ── Ship inline form ───────────────────────────────────────────────────────
function ShipForm({
  collaborationId,
  onSuccess,
  onClose,
}: {
  collaborationId: string
  onSuccess: (carrier: string, trackingNumber: string) => void
  onClose: () => void
}) {
  const [carrier,        setCarrier]        = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [submitting,     setSubmitting]     = useState(false)
  const [error,          setError]          = useState('')

  async function handleSubmit() {
    if (!carrier || !trackingNumber.trim() || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/mutual-benefit/${collaborationId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ carrier, tracking_number: trackingNumber.trim() }),
      })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setError(payload?.error ?? '送出失敗，請再試一次。')
        return
      }
      onSuccess(carrier, trackingNumber.trim())
    } catch {
      setError('送出失敗，請再試一次。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="px-5 pb-4 pt-3 border-t border-foreground/[0.06] bg-foreground/[0.02] space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">填入配送資訊</p>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground mb-1.5">物流公司</p>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full border border-foreground/20 bg-background px-2.5 py-2 text-xs focus:outline-none focus:border-foreground/50 appearance-none cursor-pointer"
            >
              <option value="" disabled>選擇物流</option>
              {CARRIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground mb-1.5">追蹤號碼</p>
            <input
              type="text"
              placeholder="輸入追蹤號碼"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full border border-foreground/20 bg-background px-2.5 py-2 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={!carrier || !trackingNumber.trim() || submitting}
          className="text-xs uppercase tracking-widest px-4 py-2 bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {submitting ? '送出中…' : '確認寄出'}
        </button>
      </div>
    </motion.div>
  )
}

// ── Record row ─────────────────────────────────────────────────────────────
function RecordRow({
  record,
  index,
}: {
  record: MutualBenefitRecord
  index: number
}) {
  const [shipment,     setShipment]     = useState<Shipment | null>(record.shipment)
  const [formOpen,     setFormOpen]     = useState(false)
  const [itemsExpanded, setItemsExpanded] = useState(false)

  const canShip = !shipment?.received_at

  function handleShipSuccess(carrier: string, trackingNumber: string) {
    setShipment((prev) => ({
      carrier,
      tracking_number: trackingNumber,
      shipped_at: new Date().toISOString(),
      received_at: prev?.received_at ?? null,
    }))
    setFormOpen(false)
  }

  const initials = record.kol_name ? record.kol_name[0] : 'K'

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.07] last:border-b-0"
    >
      {/* ── Main row ── */}
      <div className="px-5 py-4 flex items-start gap-4">

        {/* KOL avatar */}
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#b8936a] flex items-center justify-center shrink-0 text-white text-xs font-medium overflow-hidden mt-0.5">
          {record.kol_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={record.kol_photo_url} alt={record.kol_name ?? 'KOL'} className="h-full w-full object-cover" />
          ) : initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* KOL name + project */}
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-sm font-medium">{record.kol_name ?? '未知 KOL'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {record.kol_platform}
                {record.kol_follower_range && (
                  <><span className="mx-1.5 opacity-30">·</span>{record.kol_follower_range} 粉絲</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[0.62rem] uppercase tracking-[0.25em] px-2 py-0.5 border font-medium ${
                record.collaboration_type === 'sponsored'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-teal-200 bg-teal-50 text-teal-700'
              }`}>
                {record.collaboration_type === 'sponsored' ? '業配' : '互惠'}
              </span>
              <span className="text-[0.62rem] uppercase tracking-[0.25em] px-2 py-0.5 border border-foreground/15 text-muted-foreground">
                {record.project_name ?? '–'}
              </span>
            </div>
          </div>

          {/* Items summary */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setItemsExpanded((v) => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {itemsExpanded
                ? <ChevronDown className="h-3 w-3" />
                : <ChevronRight className="h-3 w-3" />
              }
              <span className="truncate max-w-[18rem]">{itemsSummary(record.items)}</span>
            </button>
            {typeof record.sponsorship_bonus === 'number' && record.sponsorship_bonus > 0 && (
              <span className="text-[0.62rem] font-serif text-amber-700 border border-amber-200/60 bg-amber-50/60 px-2 py-0.5">
                NT${record.sponsorship_bonus.toLocaleString()}
              </span>
            )}
          </div>

          {/* Shipment status + action */}
          <div className="flex items-center gap-3 flex-wrap">
            <ShipmentBadge shipment={shipment} />
            {shipment?.shipped_at && !shipment.received_at && shipment.tracking_number && (
              <span className="text-[0.65rem] font-mono text-muted-foreground/60 truncate max-w-[10rem]">
                {shipment.tracking_number}
              </span>
            )}
            {shipment?.received_at && (
              <span className="text-[0.65rem] text-muted-foreground/60">
                {formatDate(shipment.received_at)}
              </span>
            )}
            {canShip && (
              <button
                onClick={() => setFormOpen((v) => !v)}
                className={`text-[0.65rem] uppercase tracking-widest px-2.5 py-1 border transition-colors duration-150 ${
                  formOpen
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground/25 text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {shipment?.shipped_at ? '更新追蹤' : '填入追蹤資訊'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded items ── */}
      <AnimatePresence initial={false}>
        {itemsExpanded && record.items.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-5 mb-3 border border-foreground/[0.07] divide-y divide-foreground/[0.05]">
              {record.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
                    <span className="text-xs text-foreground/80 truncate">{item.item_name}</span>
                    <span className="text-[0.62rem] text-muted-foreground/50 shrink-0">× {item.quantity}</span>
                  </div>
                  <span className="text-xs font-serif text-foreground/60 shrink-0">
                    NT${(item.estimated_value * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Ship form ── */}
      <AnimatePresence initial={false}>
        {formOpen && (
          <ShipForm
            collaborationId={record.collaboration_id}
            onSuccess={handleShipSuccess}
            onClose={() => setFormOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 gap-4"
    >
      <div className="flex h-14 w-14 items-center justify-center border border-foreground/10 bg-white/80 shadow-sm">
        <Package className="h-6 w-6 text-foreground/25" strokeWidth={1.2} />
      </div>
      <div className="text-center">
        <p className="text-sm text-foreground/50 tracking-wide">尚無公關商品合作</p>
        <p className="mt-1 text-xs text-muted-foreground/60 max-w-[22rem]">
          邀請 KOL 進行互惠或業配合作後，紀錄將顯示於此
        </p>
      </div>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MerchantMutualBenefitClient({ records, projectOptions }: Props) {
  const [activeProject, setActiveProject] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!activeProject) return records
    return records.filter((r) => r.project_id === activeProject)
  }, [records, activeProject])

  const totalShipped  = records.filter((r) => r.shipment?.shipped_at).length
  const totalReceived = records.filter((r) => r.shipment?.received_at).length

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">公關商品紀錄</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理互惠與業配合作的商品寄送狀態
        </p>
      </motion.div>

      {/* ── Summary stats ── */}
      {records.length > 0 && (
        <motion.div
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '合作總數', value: records.length,    accent: 'text-foreground'  },
            { label: '已寄出',   value: totalShipped,      accent: 'text-teal-700'    },
            { label: '已收到',   value: totalReceived,     accent: 'text-emerald-700' },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-foreground/[0.08] bg-linen shadow-sm px-4 py-5 text-center"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">{s.label}</p>
              <p className={`text-2xl font-serif ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Project filter ── */}
      {projectOptions.length > 1 && (
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="flex flex-wrap gap-2"
        >
          <button
            onClick={() => setActiveProject(null)}
            className={`text-xs uppercase tracking-[0.3em] px-3 py-1.5 border transition-colors duration-150 ${
              activeProject === null
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            }`}
          >
            全部
          </button>
          {projectOptions.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              className={`text-xs uppercase tracking-[0.3em] px-3 py-1.5 border transition-colors duration-150 ${
                activeProject === p.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
              }`}
            >
              {p.name}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Records ── */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
        {records.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="border border-foreground/[0.08] bg-linen shadow-sm px-5 py-12 text-center">
            <p className="text-sm text-muted-foreground">此商案目前沒有公關商品合作。</p>
          </div>
        ) : (
          <div className="border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
            {filtered.map((record, i) => (
              <RecordRow key={record.collaboration_id} record={record} index={i} />
            ))}
          </div>
        )}
      </motion.div>

    </div>
  )
}
