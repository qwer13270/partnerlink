'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, Building2, FileText, Inbox, CheckCircle2, XCircle, Package } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const tabFade = {
  hidden:  { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } },
  exit:    { opacity: 0, y: -4, transition: { duration: 0.15 } },
}

// ── Types ──────────────────────────────────────────────────────────────────
type RequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'
type TabKey = 'pending' | 'accepted' | 'declined'

type MutualBenefitItem = {
  item_name: string
  quantity: number
  estimated_value: number
  notes: string | null
}

type CollabRequest = {
  id: string
  project_id: string
  project_name: string | null
  collab_description: string | null
  merchant_user_id: string
  kol_user_id: string
  merchant_company_name: string | null
  merchant_contact_name: string | null
  sender_role: 'merchant' | 'kol'
  status: RequestStatus
  message: string | null
  commission_rate: number | null
  collaboration_type: 'commission' | 'reciprocal' | 'sponsored'
  sponsorship_bonus: number | null
  items: MutualBenefitItem[]
  created_at: string
  responded_at: string | null
  cancelled_at: string | null
}

type ApiPayload = {
  requests?: CollabRequest[]
  error?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function merchantLabel(req: CollabRequest) {
  return req.merchant_company_name ?? req.merchant_contact_name ?? '未知商家'
}

function PendingCard({
  req, index, acting, onAccept, onDecline,
}: {
  req: CollabRequest
  index: number
  acting: string | null
  onAccept: (id: string) => Promise<void>
  onDecline: (id: string) => Promise<void>
}) {
  const isActing = acting === req.id

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-white/[0.07] last:border-b-0"
    >
      <div className="px-5 py-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-3.5 w-3.5 text-white/55 shrink-0" />
              <span className="text-sm font-medium truncate text-white/95">
                {req.project_name ?? '未知商案'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <Building2 className="h-3 w-3 shrink-0" />
              <span>{merchantLabel(req)}</span>
              <span className="opacity-30">·</span>
              <Clock className="h-3 w-3 shrink-0" />
              <span>{formatDate(req.created_at)}</span>
            </div>
          </div>
          <span className="mt-1 h-2 w-2 rounded-full bg-amber-300 shrink-0 animate-pulse" />
        </div>

        {(req.collaboration_type === 'reciprocal' || req.collaboration_type === 'sponsored') ? (
          <div className="mb-3 space-y-2">
            {req.collaboration_type === 'sponsored' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-400/10 border border-amber-300/30 w-fit">
                <Package className="h-3 w-3 text-amber-200" />
                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-amber-200 font-medium">業配合作</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-400/10 border border-teal-300/30 w-fit">
                <Package className="h-3 w-3 text-teal-200" />
                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-teal-200 font-medium">互惠合作</span>
              </div>
            )}
            {req.collab_description && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07]">
                  <div className="h-2.5 w-px rounded-full bg-amber-300" />
                  <span className="text-[0.6rem] uppercase tracking-[0.45em] text-white/55">合作內容</span>
                </div>
                <p className="px-3 py-2.5 font-body text-xs text-white/85 leading-relaxed">
                  {req.collab_description}
                </p>
              </div>
            )}
            {req.items.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07]">
                  <div className="h-2.5 w-px rounded-full bg-teal-300" />
                  <span className="text-[0.6rem] uppercase tracking-[0.45em] text-white/55">寄送商品</span>
                </div>
                <div className="divide-y divide-white/[0.06]">
                  {req.items.map((item, i) => (
                    <div key={i} className="px-3 py-2 flex items-center justify-between gap-3">
                      <span className="text-xs text-white/85">{item.item_name}</span>
                      <div className="flex items-center gap-2 shrink-0 text-xs text-white/55">
                        <span>x{item.quantity}</span>
                        <span className="opacity-30">·</span>
                        <span className="font-heading italic text-white/85">NT${item.estimated_value.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {req.sponsorship_bonus != null && req.sponsorship_bonus > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07]">
                  <div className="h-2.5 w-px rounded-full bg-amber-300" />
                  <span className="text-[0.6rem] uppercase tracking-[0.45em] text-white/55">業配獎金</span>
                </div>
                <p className="px-3 py-2.5 font-heading italic text-xs text-amber-200 leading-relaxed">
                  NT${req.sponsorship_bonus.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-3 space-y-2">
            {req.commission_rate != null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/10">
                <span className="text-[0.65rem] uppercase tracking-[0.35em] text-white/55">佣金比例</span>
                <span className="font-heading italic text-sm text-white">{req.commission_rate}%</span>
              </div>
            )}
            {req.collab_description && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07]">
                  <div className="h-2.5 w-px rounded-full bg-amber-300" />
                  <span className="text-[0.6rem] uppercase tracking-[0.45em] text-white/55">合作說明</span>
                </div>
                <p className="px-3 py-2.5 font-body text-xs text-white/85 leading-relaxed">
                  {req.collab_description}
                </p>
              </div>
            )}
          </div>
        )}

        {req.message && (
          <p className="text-xs text-white/65 leading-relaxed border-l-2 border-amber-300/60 pl-3 mb-4 italic">
            {req.message}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAccept(req.id)}
            disabled={isActing}
            className="flex items-center gap-1.5 text-[0.78rem] font-medium px-4 py-2 rounded-full bg-white text-black hover:bg-white/90 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="h-3 w-3" />
            {isActing ? '處理中…' : '接受合作'}
          </button>
          <button
            onClick={() => onDecline(req.id)}
            disabled={isActing}
            className="liquid-glass flex items-center gap-1.5 text-[0.78rem] font-medium px-4 py-2 rounded-full text-white/85 hover:text-white active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="h-3 w-3" />
            婉拒
          </button>
        </div>
      </div>
    </motion.div>
  )
}

function AcceptedCard({ req, index }: { req: CollabRequest; index: number }) {
  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-white/[0.07] last:border-b-0"
    >
      <div className="px-5 py-5">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/95 truncate">{req.project_name ?? '未知商案'}</p>
            <div className="flex items-center gap-1.5 text-xs text-white/55 mt-0.5">
              <Building2 className="h-3 w-3 shrink-0" />
              <span>{merchantLabel(req)}</span>
              {req.responded_at && (
                <>
                  <span className="opacity-30">·</span>
                  <span>接受於 {formatDate(req.responded_at)}</span>
                </>
              )}
            </div>
          </div>
          <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-emerald-400/10 text-emerald-200 border-emerald-300/30 shrink-0">
            已接受
          </span>
        </div>
        {req.collab_description && (
          <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/[0.07]">
              <div className="h-2.5 w-px rounded-full bg-emerald-300" />
              <span className="text-[0.6rem] uppercase tracking-[0.45em] text-white/55">合作內容</span>
            </div>
            <p className="px-3 py-2.5 font-body text-xs text-white/85 leading-relaxed">
              {req.collab_description}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function DeclinedCard({ req, index }: { req: CollabRequest; index: number }) {
  const isCancelled = req.status === 'cancelled'
  const respondedAt = req.responded_at ?? req.cancelled_at

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-white/[0.07] last:border-b-0"
    >
      <div className="px-5 py-5 flex items-center gap-4">
        <XCircle className="h-4 w-4 text-white/35 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/55 truncate">{req.project_name ?? '未知商案'}</p>
          <div className="flex items-center gap-1.5 text-xs text-white/40 mt-0.5">
            <Building2 className="h-3 w-3 shrink-0" />
            <span>{merchantLabel(req)}</span>
            {respondedAt && (
              <>
                <span className="opacity-30">·</span>
                <span>{isCancelled ? '商家取消於' : '婉拒於'} {formatDate(respondedAt)}</span>
              </>
            )}
          </div>
        </div>
        <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-white/5 text-white/45 border-white/15 shrink-0">
          {isCancelled ? '已取消' : '已婉拒'}
        </span>
      </div>
    </motion.div>
  )
}

const EMPTY_COPY: Record<TabKey, { icon: typeof Inbox; text: string }> = {
  pending:  { icon: Inbox,         text: '目前沒有待回覆的合作邀請。' },
  accepted: { icon: CheckCircle2,  text: '尚未接受任何合作邀請。'     },
  declined: { icon: XCircle,       text: '沒有婉拒的邀請紀錄。'       },
}

function EmptyState({ tab }: { tab: TabKey }) {
  const { icon: Icon, text } = EMPTY_COPY[tab]
  return (
    <div className="px-5 py-14 text-center">
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.04] mb-3">
        <Icon className="h-4 w-4 text-white/55" />
      </div>
      <p className="text-sm text-white/55">{text}</p>
    </div>
  )
}

const TABS = [
  { key: 'pending'  as TabKey, label: '待回覆', icon: Inbox        },
  { key: 'accepted' as TabKey, label: '已接受', icon: CheckCircle2 },
  { key: 'declined' as TabKey, label: '已拒絕', icon: XCircle      },
]

export default function KolInboxPage() {
  const [requests, setRequests]       = useState<CollabRequest[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadError, setLoadError]     = useState('')
  const [tab, setTab]                 = useState<TabKey>('pending')
  const [acting, setActing]           = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const res = await fetch('/api/collaboration-requests?role=received', {
          signal: controller.signal,
        })
        const payload = (await res.json().catch(() => null)) as ApiPayload | null
        if (!res.ok) { setLoadError(payload?.error ?? '載入失敗。'); return }
        setRequests(payload?.requests ?? [])
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadError(err instanceof Error ? err.message : '載入失敗。')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()
    return () => controller.abort()
  }, [])

  async function handleAccept(id: string) {
    setActing(id)
    setActionError('')
    try {
      const res = await fetch(`/api/collaboration-requests/${id}/accept`, { method: 'POST' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setActionError(payload?.error ?? '操作失敗。'); return }
      setRequests((prev) =>
        prev.map((r) => r.id === id
          ? { ...r, status: 'accepted', responded_at: new Date().toISOString() }
          : r,
        ),
      )
    } catch {
      setActionError('操作失敗，請再試一次。')
    } finally {
      setActing(null)
    }
  }

  async function handleDecline(id: string) {
    setActing(id)
    setActionError('')
    try {
      const res = await fetch(`/api/collaboration-requests/${id}/decline`, { method: 'POST' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setActionError(payload?.error ?? '操作失敗。'); return }
      setRequests((prev) =>
        prev.map((r) => r.id === id
          ? { ...r, status: 'declined', responded_at: new Date().toISOString() }
          : r,
        ),
      )
    } catch {
      setActionError('操作失敗，請再試一次。')
    } finally {
      setActing(null)
    }
  }

  const byTab: Record<TabKey, CollabRequest[]> = {
    pending:  requests.filter((r) => r.status === 'pending'),
    accepted: requests.filter((r) => r.status === 'accepted'),
    declined: requests.filter((r) => r.status === 'declined' || r.status === 'cancelled'),
  }

  const pendingCount = byTab.pending.length
  const activeList   = byTab[tab]

  return (
    <div className="space-y-10 text-white">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="font-body text-[10px] uppercase tracking-[0.45em] text-white/45 mb-3">KOL 後台</p>
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
            合作 <span className="italic">邀請</span>
          </h1>
          {pendingCount > 0 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-amber-300 text-black text-xs font-medium"
            >
              {pendingCount}
            </motion.span>
          )}
        </div>
        <p className="font-body text-sm text-white/60 mt-3">
          管理商家寄來的合作邀請，接受後即建立正式合作關係。
        </p>
      </motion.div>

      {/* ── Summary stats ── */}
      {!loading && requests.length > 0 && (
        <motion.div
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '待回覆', value: byTab.pending.length,  accent: 'text-amber-200' },
            { label: '已接受', value: byTab.accepted.length, accent: 'text-emerald-200' },
            { label: '已拒絕', value: byTab.declined.length, accent: 'text-white/55' },
          ].map((s) => (
            <div
              key={s.label}
              className="liquid-glass rounded-2xl px-4 py-5 text-center"
            >
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white/55 mb-2">{s.label}</p>
              <p className={`font-heading italic text-3xl ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Tab strip ── */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="flex border-b border-white/10">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count  = byTab[key].length
            const active = tab === key

            const activeBar =
              key === 'pending'  ? 'border-amber-300' :
              key === 'accepted' ? 'border-emerald-300' :
                                   'border-white/40'

            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`relative flex items-center gap-2 px-4 py-3 text-xs uppercase tracking-[0.25em] border-b-2 transition-all duration-200 -mb-px ${
                  active
                    ? `${activeBar} text-white`
                    : 'border-transparent text-white/55 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                {label}
                {count > 0 && (
                  <span className={`ml-0.5 text-[10px] font-medium px-1.5 py-px rounded-full leading-none ${
                    key === 'pending'
                      ? 'bg-amber-400/15 text-amber-200'
                      : key === 'accepted'
                        ? 'bg-emerald-400/15 text-emerald-200'
                        : 'bg-white/10 text-white/55'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Action error ── */}
      <AnimatePresence>
        {actionError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-lg border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-200 flex items-center justify-between"
          >
            {actionError}
            <button onClick={() => setActionError('')} className="ml-4 text-red-300 hover:text-red-100">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── List ── */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="liquid-glass rounded-2xl overflow-hidden">
          {loading ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-white/55">載入中…</p>
            </div>
          ) : loadError ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-red-300">{loadError}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={tab} variants={tabFade} initial="hidden" animate="visible" exit="exit">
                {activeList.length === 0 ? (
                  <EmptyState tab={tab} />
                ) : tab === 'pending' ? (
                  activeList.map((req, i) => (
                    <PendingCard
                      key={req.id} req={req} index={i}
                      acting={acting} onAccept={handleAccept} onDecline={handleDecline}
                    />
                  ))
                ) : tab === 'accepted' ? (
                  activeList.map((req, i) => (
                    <AcceptedCard key={req.id} req={req} index={i} />
                  ))
                ) : (
                  activeList.map((req, i) => (
                    <DeclinedCard key={req.id} req={req} index={i} />
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>

    </div>
  )
}
