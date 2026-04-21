'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Copy, Check, BadgeDollarSign,
  ChevronDown, ChevronRight, Package, Truck, CheckCircle2,
  Clock, ExternalLink, Building2, Store, BedDouble, Hash,
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

// ── Carriers ──────────────────────────────────────────────────────────────────
const CARRIERS: Record<string, { label: string; trackingUrl: (n: string) => string }> = {
  't-cat':   { label: '黑貓宅急便', trackingUrl: n => `https://www.t-cat.com.tw/inquire/trace.aspx?no=${n}` },
  'hct':     { label: '新竹物流',   trackingUrl: n => `https://www.hct.com.tw/Order/SearchOrder?txtB_OrderNo=${n}` },
  'pelican': { label: '統一速達',   trackingUrl: () => 'https://www.pelican.com.tw/' },
  'post':    { label: '中華郵政',   trackingUrl: n => `https://postserv.post.gov.tw/pstmail/main.jsp?targetPage=TraceDetail&id=${n}` },
  'e-can':   { label: '台灣宅配通', trackingUrl: () => 'https://www.e-can.com.tw/' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })
}
function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[0.6rem] uppercase tracking-[0.45em] text-white/55 mb-3">
      {children}
    </p>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`liquid-glass rounded-2xl overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

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
      className="p-1.5 text-white/55 hover:text-white transition-colors rounded"
      title={label ? `複製${label}` : '複製'}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  )
}

function FunnelStats({ clicks, inquiries, visits, deals }: {
  clicks: number; inquiries: number; visits: number; deals: number
}) {
  const steps = [
    { label: '點擊次數', value: clicks,    color: 'text-white'         },
    { label: '已預約',   value: inquiries, color: 'text-white'         },
    { label: '已看房',   value: visits,    color: 'text-sky-200'       },
    { label: '已成交',   value: deals,     color: 'text-emerald-200'   },
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {steps.map(s => (
        <div key={s.label} className="liquid-glass rounded-2xl px-5 py-5 text-center">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-white/55 mb-2">
            {s.label}
          </p>
          <p className={`font-heading italic text-3xl leading-none ${s.color}`}>{s.value.toLocaleString()}</p>
        </div>
      ))}
    </div>
  )
}

function ShangAnStats({ clicks, itemCount, sponsorshipBonus }: {
  clicks: number; itemCount: number; sponsorshipBonus?: number | null
}) {
  const stats = [
    { label: '點擊次數', value: clicks.toLocaleString(), accent: 'text-white' },
    { label: '商品項目', value: String(itemCount),       accent: 'text-white' },
  ]
  const cols = sponsorshipBonus != null && sponsorshipBonus > 0 ? 3 : 2
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
      {stats.map(s => (
        <div key={s.label} className="liquid-glass rounded-2xl px-5 py-5 text-center">
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-white/55 mb-2">{s.label}</p>
          <p className={`font-heading italic text-3xl leading-none ${s.accent}`}>{s.value}</p>
        </div>
      ))}
      {sponsorshipBonus != null && sponsorshipBonus > 0 && (
        <div className="liquid-glass rounded-2xl px-5 py-5 text-center" style={{ borderColor: 'rgba(252,211,77,0.3)' }}>
          <p className="font-mono text-[0.6rem] uppercase tracking-[0.35em] text-amber-200/80 mb-2">業配獎金</p>
          <p className="font-heading italic text-3xl leading-none text-amber-200">NT${sponsorshipBonus.toLocaleString()}</p>
        </div>
      )}
    </div>
  )
}

function ReferralCard({ shortCode, isActive }: { shortCode: string | null; isActive: boolean }) {
  if (!shortCode) {
    return (
      <div className="flex items-center gap-2 font-body text-xs text-white/55">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>推廣連結尚未生成</span>
      </div>
    )
  }
  const url = typeof window !== 'undefined' ? `${window.location.origin}/r/${shortCode}` : `/r/${shortCode}`
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2.5">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-400' : 'bg-white/30'}`} />
        <span className="flex-1 min-w-0 text-xs font-mono text-white/85 truncate select-all">/r/{shortCode}</span>
        <CopyBtn text={url} label="推廣連結" />
      </div>
      <p className="text-[0.65rem] text-white/45 pl-1">
        {isActive ? '推廣中' : '已暫停'}
      </p>
    </div>
  )
}

function DealSection({ entries }: { entries: DealEntry[] }) {
  const [open, setOpen] = useState(false)
  const total = entries.reduce((s, e) => s + e.commissionWan, 0)

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <BadgeDollarSign className="h-6 w-6 text-white/20" strokeWidth={1.2} />
        <p className="font-body text-xs text-white/55">尚無成交紀錄</p>
        <p className="font-body text-[0.65rem] text-white/35">商家確認成交後將顯示於此</p>
      </div>
    )
  }

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.07]"
      >
        <div className="flex items-center gap-3">
          <BadgeDollarSign className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
          <span className="font-body text-xs text-white/65">
            {entries.length} 筆成交 ·{' '}
            累計 <span className="font-medium text-emerald-200">{total.toFixed(2)} 萬</span>
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-white/55 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
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
            <div className="divide-y divide-white/[0.06] bg-white/[0.02]">
              {entries.map(entry => (
                <div key={entry.id} className="px-5 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] text-white/55 font-mono">{formatDate(entry.date)}</p>
                    <span className="text-[0.62rem] font-medium px-2 py-0.5 bg-emerald-400/10 text-emerald-200 border border-emerald-300/30">
                      已確認
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '成交金額', value: `${entry.dealValueWan.toLocaleString()} 萬` },
                      { label: '佣金比率', value: `${entry.commissionRate}%` },
                      { label: '佣金金額', value: `${entry.commissionWan.toFixed(2)} 萬`, accent: true },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="border px-2.5 py-2 text-center"
                        style={{
                          borderColor: s.accent ? 'rgba(110,231,183,0.35)' : 'rgba(255,255,255,0.10)',
                          background: s.accent ? 'rgba(110,231,183,0.07)' : 'rgba(255,255,255,0.025)',
                        }}
                      >
                        <p className="text-[0.58rem] uppercase tracking-widest text-white/50">{s.label}</p>
                        <p className={`font-heading italic text-sm mt-1 ${s.accent ? 'text-emerald-200' : 'text-white/85'}`}>{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {(entry.roomType || entry.roomNumber) && (
                    <div
                      className="flex items-center gap-4 rounded px-3 py-2"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}
                    >
                      {entry.roomType && (
                        <div className="flex items-center gap-1.5">
                          <BedDouble className="h-3 w-3 text-white/40 shrink-0" />
                          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-white/45 mr-1">房型</span>
                          <span className="text-xs font-medium text-white/85">{entry.roomType}</span>
                        </div>
                      )}
                      {entry.roomType && entry.roomNumber && (
                        <span className="text-white/20 text-xs">·</span>
                      )}
                      {entry.roomNumber && (
                        <div className="flex items-center gap-1.5">
                          <Hash className="h-3 w-3 text-white/40 shrink-0" />
                          <span className="text-[0.62rem] uppercase tracking-[0.2em] text-white/45 mr-1">房號</span>
                          <span className="text-xs font-medium text-white/85 font-mono">{entry.roomNumber}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ItemsSection({ items }: { items: MutualBenefitItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
        <Package className="h-6 w-6 text-white/20" strokeWidth={1.2} />
        <p className="font-body text-xs text-white/55">尚無商品紀錄</p>
      </div>
    )
  }
  const total = items.reduce((s, it) => s + it.estimated_value * it.quantity, 0)
  return (
    <div className="divide-y divide-white/[0.06]">
      {items.map((item, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs text-white/85 truncate block">{item.item_name}</span>
              {item.notes && <p className="text-[0.62rem] text-white/45 mt-0.5">{item.notes}</p>}
            </div>
            <span className="text-[0.65rem] text-white/40 shrink-0">× {item.quantity}</span>
          </div>
          <span className="font-heading italic text-xs text-white/85 shrink-0">
            NT${(item.estimated_value * item.quantity).toLocaleString()}
          </span>
        </div>
      ))}
      {items.length > 1 && (
        <div className="flex items-center justify-between px-5 py-3 bg-white/[0.025]">
          <span className="text-[0.6rem] uppercase tracking-[0.3em] text-white/55">合計市值</span>
          <span className="font-heading italic text-sm text-white">NT${total.toLocaleString()}</span>
        </div>
      )}
    </div>
  )
}

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
    <div className="flex items-center gap-2 text-xs text-white/55 px-5 py-4">
      <Clock className="h-3.5 w-3.5 shrink-0" /><span>待商家寄出</span>
    </div>
  )

  if (shipment.received_at) return (
    <div className="px-5 py-4 space-y-2">
      {shipment.carrier && shipment.tracking_number && (
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-white/55 shrink-0" />
          <span className="text-xs text-white/65">{CARRIERS[shipment.carrier]?.label ?? shipment.carrier}</span>
          <span className="text-xs font-mono text-white/85">{shipment.tracking_number}</span>
          <CopyBtn text={shipment.tracking_number} label="追蹤號碼" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300 shrink-0" />
        <span className="text-xs text-emerald-200 font-medium">已收到</span>
        <span className="text-xs text-white/55">· {formatDateLong(shipment.received_at)}</span>
      </div>
    </div>
  )

  if (shipment.shipped_at && shipment.carrier && shipment.tracking_number) {
    const carrier = CARRIERS[shipment.carrier]
    return (
      <div className="px-5 py-4 space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-3 space-y-2">
          <div className="flex items-center gap-2">
            <Truck className="h-3.5 w-3.5 text-white/55 shrink-0" />
            <span className="text-xs text-white/85 font-medium">{carrier?.label ?? shipment.carrier}</span>
            <span className="text-[0.65rem] text-white/45">· 已寄出 {formatDateLong(shipment.shipped_at)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/10 px-2.5 py-1.5 rounded">
            <span className="text-xs font-mono flex-1 text-white/85 select-all">{shipment.tracking_number}</span>
            <CopyBtn text={shipment.tracking_number} label="追蹤號碼" />
            {carrier && (
              <a href={carrier.trackingUrl(shipment.tracking_number)} target="_blank" rel="noopener noreferrer"
                className="p-1 text-white/55 hover:text-white transition-colors" title="查看追蹤">
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        {receiveError && <p className="text-xs text-red-300">{receiveError}</p>}
        <button onClick={handleReceive} disabled={receiving}
          className="flex items-center gap-2 text-xs uppercase tracking-widest bg-white text-black rounded-full px-4 py-2 hover:bg-white/90 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
          <Check className="h-3.5 w-3.5" />
          {receiving ? '確認中…' : '確認已收到'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-white/55 px-5 py-4">
      <Clock className="h-3.5 w-3.5 shrink-0" /><span>待商家寄出</span>
    </div>
  )
}

interface Props { detail: CollabDetail }

export default function KolProjectDetailClient({ detail }: Props) {
  const [shipment, setShipment] = useState<Shipment | null>(detail.shipment)

  const is建案      = detail.project_type === 'property'
  const isActive    = detail.collab_status === 'active' && !detail.project_archived
  const totalCommWan  = detail.deal_entries.reduce((s, e) => s + e.commissionWan, 0)

  function collabTypeLabel() {
    if (detail.collaboration_type === 'commission') return '佣金合作'
    if (detail.collaboration_type === 'sponsored')  return '業配合作'
    return '互惠合作'
  }

  return (
    <div className="space-y-8 text-white">

      {/* ── Back ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <Link href="/kol/projects"
          className="inline-flex items-center gap-1.5 text-xs text-white/55 hover:text-white transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          合作項目
        </Link>
      </motion.div>

      {/* ── Header ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
        className="flex items-start justify-between gap-6 pb-6 border-b border-white/10"
      >
        <div className="flex items-start gap-4">
          <div className={`shrink-0 mt-0.5 flex h-12 w-12 items-center justify-center rounded-xl border ${
            is建案
              ? 'border-stone-200/30 bg-stone-300/10 text-stone-200'
              : 'border-violet-200/30 bg-violet-300/10 text-violet-200'
          }`}>
            {is建案 ? <Building2 className="h-5 w-5" /> : <Store className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.45em] text-white/55 mb-2">
              {detail.project_type} · {collabTypeLabel()}
            </p>
            <h1 className="font-heading text-3xl md:text-4xl leading-tight tracking-tight">
              {detail.project_name}
            </h1>
            <p className="text-xs text-white/45 mt-2">加入於 {formatDateLong(detail.created_at)}</p>
          </div>
        </div>
        <span className={`shrink-0 mt-1 text-[0.62rem] uppercase tracking-[0.25em] font-medium px-2.5 py-1 border ${
          isActive
            ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
            : 'border-white/15 bg-white/5 text-white/45'
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
            <div className="px-6 pt-5 pb-5">
              <SectionLabel>合作內容</SectionLabel>
              {detail.collab_description
                ? <p className="font-body text-sm text-white/85 leading-relaxed">{detail.collab_description}</p>
                : <p className="text-xs italic text-white/40">無說明</p>
              }
            </div>

            {is建案 && detail.commission_rate !== null && (
              <div className="border-t border-white/[0.07] px-6 py-4 flex items-center gap-4">
                <div className="border-l-2 border-emerald-400/60 pl-3">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.4em] text-white/50 mb-1">佣金比例</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-heading italic text-xl text-emerald-200 tabular-nums leading-none">
                      {detail.commission_rate}%
                    </span>
                    <span className="text-[0.65rem] text-white/45">· 依成交金額計算</span>
                  </div>
                </div>
              </div>
            )}

            {!is建案 && (
              <div className="border-t border-white/[0.07]">
                <div className="px-6 pt-4 pb-2 flex items-baseline justify-between">
                  <div className="border-l-2 border-violet-400/60 pl-3">
                    <p className="font-mono text-[0.58rem] uppercase tracking-[0.4em] text-white/50 mb-1">公關商品</p>
                    <p className="text-[0.65rem] text-white/45">
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
                <span className="text-xs text-white/55">
                  累計 <span className="font-heading italic text-emerald-200 text-sm">{totalCommWan.toFixed(2)} 萬</span>
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
            <div className="px-6 pt-5 pb-3 border-b border-white/[0.07]">
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
