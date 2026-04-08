'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Copy, Check, BadgeDollarSign,
  ChevronDown, ChevronRight, Package, Truck, CheckCircle2,
  Clock, ExternalLink, Building2, Store,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CollabDetail, DealEntry, MutualBenefitItem, Shipment } from '@/app/kol/projects/[id]/page'

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Carriers ──────────────────────���───────────────────────────────��───────────
const CARRIERS: Record<string, { label: string; trackingUrl: (n: string) => string }> = {
  't-cat':   { label: '黑貓宅急便', trackingUrl: n => `https://www.t-cat.com.tw/inquire/trace.aspx?no=${n}` },
  'hct':     { label: '新竹物流',   trackingUrl: n => `https://www.hct.com.tw/Order/SearchOrder?txtB_OrderNo=${n}` },
  'pelican': { label: '統一速達',   trackingUrl: () => 'https://www.pelican.com.tw/' },
  'post':    { label: '中華郵政',   trackingUrl: n => `https://postserv.post.gov.tw/pstmail/main.jsp?targetPage=TraceDetail&id=${n}` },
  'e-can':   { label: '台灣宅配通', trackingUrl: () => 'https://www.e-can.com.tw/' },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ── Section label ──────────────────��──────────────────────────────���───────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.6rem] font-mono uppercase tracking-[0.45em] text-muted-foreground/60 mb-3">
      {children}
    </p>
  )
}

// ── Card wrapper ───────────────────────────────────────────────────────────���──
function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

// ── Copy button ──────────────────────────────────────────────���────────────────
function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      toast.success(label ? `已複製${label}` : '已複製')
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={handleCopy}
      className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded"
      title={label ? `複製${label}` : '複製'}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

// ── 建案 stats ────────────────────────────────────────────────────────────────
function FunnelStats({ clicks, inquiries, visits, deals }: {
  clicks: number; inquiries: number; visits: number; deals: number
}) {
  const steps = [
    { label: '點擊次數', value: clicks,    color: 'text-foreground'  },
    { label: '已預約',   value: inquiries, color: 'text-foreground'  },
    { label: '已看房',   value: visits,    color: 'text-sky-600'     },
    { label: '已成交',   value: deals,     color: 'text-emerald-700' },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {steps.map(s => (
        <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-5 text-center">
          <p className="text-[0.6rem] font-mono uppercase tracking-[0.35em] text-muted-foreground/60 mb-2">
            {s.label}
          </p>
          <p className={`text-3xl font-serif leading-none ${s.color}`}>{s.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

// ── 商案 stats ────────────────────────────────────────────────────────────────
function ShangAnStats({ clicks, itemCount, sponsorshipBonus }: {
  clicks: number; itemCount: number; sponsorshipBonus?: number | null
}) {
  const stats = [
    { label: '點擊次數', value: clicks.toLocaleString(), accent: 'text-foreground' },
    { label: '商品項目', value: String(itemCount),       accent: 'text-foreground' },
  ]
  const cols = sponsorshipBonus != null && sponsorshipBonus > 0 ? 3 : 2
  return (
    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {stats.map(s => (
        <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-5 text-center">
          <p className="text-[0.6rem] font-mono uppercase tracking-[0.35em] text-muted-foreground/60 mb-2">{s.label}</p>
          <p className={`text-3xl font-serif leading-none ${s.accent}`}>{s.value}</p>
        </div>
      ))}
      {sponsorshipBonus != null && sponsorshipBonus > 0 && (
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/60 shadow-sm px-5 py-5 text-center">
          <p className="text-[0.6rem] font-mono uppercase tracking-[0.35em] text-amber-700/70 mb-2">業配獎金</p>
          <p className="text-3xl font-serif leading-none text-amber-800">NT${sponsorshipBonus.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

// ── Referral link card ────────────────────────────���───────────────────────────
function ReferralCard({ shortCode, isActive }: { shortCode: string | null; isActive: boolean }) {
  if (!shortCode) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>推廣連結尚未生成</span>
      </div>
    )
  }
  const url = typeof window !== 'undefined' ? `${window.location.origin}/r/${shortCode}` : `/r/${shortCode}`
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-foreground/10 bg-background/60 px-3 py-2.5">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
        <span className="flex-1 min-w-0 text-xs font-mono text-foreground/70 truncate select-all">/r/{shortCode}</span>
        <CopyBtn text={url} label="推廣連結" />
      </div>
      <p className="text-[0.65rem] text-muted-foreground/50 pl-1">
        {isActive ? '推廣中' : '已暫停'}
      </p>
    </div>
  )
}

// ── Deal history accordion ────────────────────────────────────────────────────
function DealSection({ entries }: { entries: DealEntry[] }) {
  const [open, setOpen] = useState(false)
  const total = entries.reduce((s, e) => s + e.commissionWan, 0)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <BadgeDollarSign className="h-6 w-6 text-foreground/15" strokeWidth={1.2} />
        <p className="text-xs text-muted-foreground/50">尚無成交紀錄</p>
        <p className="text-[0.65rem] text-muted-foreground/35">商家確認成交後將顯示於此</p>
      </div>
    )
  }

  return (
    <div>
      {/* Summary bar */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-foreground/[0.02] transition-colors border-b border-foreground/[0.06]"
      >
        <div className="flex items-center gap-3">
          <BadgeDollarSign className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span className="text-xs text-muted-foreground">
            {entries.length} 筆成交 ·{' '}
            累計 <span className="font-medium text-emerald-700">{total.toFixed(2)} 萬</span>
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
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
            <div className="divide-y divide-foreground/[0.05] bg-foreground/[0.015]">
              {entries.map(entry => (
                <div key={entry.id} className="px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[0.7rem] text-muted-foreground font-mono">{formatDate(entry.date)}</p>
                    <span className="text-[0.62rem] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      已確認
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '成交金額', value: `${entry.dealValueWan.toLocaleString()} 萬` },
                      { label: '佣金比率', value: `${entry.commissionRate}%` },
                      { label: '佣金金額', value: `${entry.commissionWan.toFixed(2)} 萬` },
                    ].map(s => (
                      <div key={s.label} className="border border-foreground/10 px-2.5 py-2 text-center bg-background">
                        <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-serif mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Items list ──────────────────────────────────────────────────��─────────────
function ItemsSection({ items }: { items: MutualBenefitItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <Package className="h-6 w-6 text-foreground/15" strokeWidth={1.2} />
        <p className="text-xs text-muted-foreground/50">尚無商品紀錄</p>
      </div>
    )
  }
  const total = items.reduce((s, it) => s + it.estimated_value * it.quantity, 0)
  return (
    <div className="divide-y divide-foreground/[0.05]">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ChevronRight className="h-3 w-3 text-muted-foreground/30 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-foreground/80 truncate block">{item.item_name}</span>
              {item.notes && <p className="text-[0.62rem] text-muted-foreground/50 mt-0.5">{item.notes}</p>}
            </div>
            <span className="text-[0.65rem] text-muted-foreground/40 shrink-0">× {item.quantity}</span>
          </div>
          <span className="text-xs font-serif text-foreground/70 shrink-0">
            NT${(item.estimated_value * item.quantity).toLocaleString()}
          </span>
        </div>
      ))}
      {items.length > 1 && (
        <div className="flex items-center justify-between px-5 py-3 bg-foreground/[0.025]">
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">合計市值</span>
          <span className="text-sm font-serif">NT${total.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}

// ── Shipment section ──────────────────────────────���─────────────────────────��─
function ShipmentSection({
  shipment, collaborationId, onReceived,
}: { shipment: Shipment | null; collaborationId: string; onReceived: () => void }) {
  const [receiving, setReceiving]     = useState(false)
  const [receiveError, setReceiveError] = useState('')

  async function handleReceive() {
    setReceiving(true); setReceiveError('')
    try {
      const res = await fetch(`/api/mutual-benefit/${collaborationId}/receive`, { method: 'POST' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setReceiveError(payload?.error ?? '操作失敗，請再試一次。'); return }
      onReceived()
    } catch { setReceiveError('操作失敗，請再試一次。') }
    finally  { setReceiving(false) }
  }

  if (!shipment) return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 px-5 py-4">
      <Clock className="h-3.5 w-3.5 shrink-0" /><span>待商家寄出</span>
    </div>
  )

  if (shipment.received_at) return (
    <div className="px-5 py-4 space-y-2">
      {shipment.carrier && shipment.tracking_number && (
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground">{CARRIERS[shipment.carrier]?.label ?? shipment.carrier}</span>
          <span className="text-xs font-mono text-foreground/70">{shipment.tracking_number}</span>
          <CopyBtn text={shipment.tracking_number} label="追蹤號碼" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
        <span className="text-xs text-emerald-700 font-medium">已收到</span>
        <span className="text-xs text-muted-foreground/60">· {formatDateLong(shipment.received_at)}</span>
      </div>
    </div>
  )

  if (shipment.shipped_at && shipment.carrier && shipment.tracking_number) {
    const carrier = CARRIERS[shipment.carrier]
    return (
      <div className="px-5 py-4 space-y-3">
        <div className="rounded-lg border border-foreground/[0.08] bg-stone-50/80 px-3 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs text-muted-foreground font-medium">{carrier?.label ?? shipment.carrier}</span>
            <span className="text-[0.65rem] text-muted-foreground/50">· 已寄出 {formatDateLong(shipment.shipped_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-background border border-foreground/10 px-2.5 py-1.5 rounded">
            <span className="text-xs font-mono flex-1 text-foreground/80 select-all">{shipment.tracking_number}</span>
            <CopyBtn text={shipment.tracking_number} label="追蹤號碼" />
            {carrier && (
              <a href={carrier.trackingUrl(shipment.tracking_number)} target="_blank" rel="noopener noreferrer"
                className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="查看追蹤">
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        {receiveError && <p className="text-xs text-red-600">{receiveError}</p>}
        <button onClick={handleReceive} disabled={receiving}
          className="flex items-center gap-2 text-xs uppercase tracking-widest border border-foreground px-4 py-2 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
          <Check className="h-3.5 w-3.5" />
          {receiving ? '確認中…' : '確認已收到'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground/60 px-5 py-4">
      <Clock className="h-3.5 w-3.5 shrink-0" /><span>待商家寄出</span>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────��───────────
interface Props { detail: CollabDetail }

export default function KolProjectDetailClient({ detail }: Props) {
  const [shipment, setShipment] = useState<Shipment | null>(detail.shipment)

  const is建案      = detail.project_type === 'property'
  const isActive    = detail.collab_status === 'active'
const totalCommWan  = detail.deal_entries.reduce((s, e) => s + e.commissionWan, 0)

  function collabTypeLabel() {
    if (detail.collaboration_type === 'commission') return '佣金合作'
    if (detail.collaboration_type === 'sponsored')  return '業配合作'
    return '互惠合作'
  }

  return (
    <div className="space-y-8">

      {/* ── Back ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <Link href="/kol/projects"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          合作項目
        </Link>
      </motion.div>

      {/* ── Header ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
        className="flex items-start justify-between gap-6 pb-6 border-b border-foreground/[0.07]"
      >
        <div className="flex items-start gap-4">
          <div className={`shrink-0 mt-0.5 flex h-12 w-12 items-center justify-center rounded-xl border-2 ${
            is建案 ? 'border-stone-200 bg-stone-50 text-stone-500' : 'border-violet-200 bg-violet-50 text-violet-600'
          }`}>
            {is建案 ? <Building2 className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-[0.6rem] font-mono uppercase tracking-[0.45em] text-muted-foreground/60 mb-1.5">
              {detail.project_type} · {collabTypeLabel()}
            </p>
            <h1 className="text-3xl font-serif font-light leading-tight">{detail.project_name}</h1>
            <p className="text-xs text-muted-foreground/50 mt-1.5">加入於 {formatDateLong(detail.created_at)}</p>
          </div>
        </div>
        <span className={`shrink-0 mt-1 text-[0.62rem] uppercase tracking-[0.25em] font-medium px-2.5 py-1 border ${
          isActive ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-zinc-200 bg-zinc-50 text-zinc-500'
        }`}>
          {isActive ? '進行中' : '已結束'}
        </span>
      </motion.div>

      {/* ── 1. Stats ── */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
        {is建案
          ? <FunnelStats clicks={detail.clicks} inquiries={detail.inquiries} visits={detail.visits} deals={detail.deals} />
          : <ShangAnStats clicks={detail.clicks} itemCount={detail.items.length} sponsorshipBonus={detail.collaboration_type === 'sponsored' ? detail.sponsorship_bonus : null} />
        }
      </motion.div>

      {/* ── 2. 合作內容 ── */}
      {(detail.collab_description || (is建案 && detail.commission_rate !== null)) && (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            {/* Description */}
            <div className="px-6 pt-5 pb-5">
              <SectionLabel>合作內容</SectionLabel>
              {detail.collab_description
                ? <p className="text-sm text-foreground/80 leading-relaxed">{detail.collab_description}</p>
                : <p className="text-xs italic text-muted-foreground/40">無說明</p>
              }
            </div>

            {/* 建案 footer: commission rate */}
            {is建案 && detail.commission_rate !== null && (
              <div className="border-t border-foreground/[0.06] px-6 py-4 flex items-center gap-4">
                <div className="border-l-2 border-emerald-500/60 pl-3">
                  <p className="text-[0.58rem] font-mono uppercase tracking-[0.4em] text-muted-foreground/50 mb-0.5">佣金比例</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-serif text-emerald-700 tabular-nums leading-none">
                      {detail.commission_rate}%
                    </span>
                    <span className="text-[0.65rem] text-muted-foreground/50">· 依成交金額計算</span>
                  </div>
                </div>
              </div>
            )}

            {/* 商案 footer: PR items */}
            {!is建案 && (
              <div className="border-t border-foreground/[0.06]">
                <div className="px-6 pt-4 pb-2 flex items-baseline justify-between">
                  <div className="border-l-2 border-violet-500/60 pl-3">
                    <p className="text-[0.58rem] font-mono uppercase tracking-[0.4em] text-muted-foreground/50 mb-0.5">公關商品</p>
                    <p className="text-[0.65rem] text-muted-foreground/50">
                      {detail.items.length > 0 ? `${detail.items.length} 項商品` : '尚無商品'}
                    </p>
                  </div>
                </div>
                <ItemsSection items={detail.items} />
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ── 3. 推廣連結 ── */}
      <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
        <Card>
          <div className="px-6 py-5">
            <SectionLabel>推廣連結</SectionLabel>
            <ReferralCard shortCode={detail.referral_short_code} isActive={detail.referral_active} />
          </div>
        </Card>
      </motion.div>

      {/* ── 4a. 建案: 成交獎金 ── */}
      {is建案 && (
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <div className="px-6 pt-5 pb-3 flex items-baseline justify-between">
              <SectionLabel>成交獎金</SectionLabel>
              {detail.deal_entries.length > 0 && (
                <span className="text-xs text-muted-foreground/60">
                  累計 <span className="font-serif text-emerald-700 text-sm">{totalCommWan.toFixed(2)} 萬</span>
                </span>
              )}
            </div>
            <DealSection entries={detail.deal_entries} />
          </Card>
        </motion.div>
      )}

      {/* ── 5a. 商案: 配送狀態 ── */}
      {!is建案 && (
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}>
          <Card>
            <div className="px-6 pt-5 pb-3 border-b border-foreground/[0.06]">
              <SectionLabel>配送狀態</SectionLabel>
            </div>
            <ShipmentSection
              shipment={shipment}
              collaborationId={detail.collaboration_id}
              onReceived={() =>
                setShipment(prev => prev
                  ? { ...prev, received_at: new Date().toISOString() }
                  : { carrier: null, tracking_number: null, shipped_at: null, received_at: new Date().toISOString() }
                )
              }
            />
          </Card>
        </motion.div>
      )}


    </div>
  )
}
