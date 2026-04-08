'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Calendar, Check, Mail, MapPin, Phone, Search, ShieldAlert, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type ReviewStatus = 'pending_admin_review' | 'denied'

const MERCHANT_TYPE_LABEL: Record<string, string> = {
  property: '地產',
  shop:     '商店',
}

type Application = {
  id: string
  email: string
  company: string
  contact: string
  phone: string
  city: string
  projectCount: string
  appliedDate: string
  reviewedAt: string
  rejectionReason: string
  merchantType: string | null
}

type ApiApplication = {
  id: string
  user_id: string | null
  email: string
  company_name: string
  contact_name: string
  phone: string
  city: string | null
  project_count: string | null
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  status: ReviewStatus
  merchant_type: string | null
}

function formatDate(value: string) {
  return value ? value.slice(0, 10) : '—'
}

function toViewModel(row: ApiApplication): Application {
  return {
    id:              row.id,
    email:           row.email,
    company:         row.company_name,
    contact:         row.contact_name,
    phone:           row.phone,
    city:            row.city || '未填寫',
    projectCount:    row.project_count || '未填寫',
    appliedDate:     row.submitted_at ? row.submitted_at.slice(0, 10) : '',
    reviewedAt:      row.reviewed_at  ? row.reviewed_at.slice(0, 10)  : '',
    rejectionReason: row.rejection_reason || '',
    merchantType:    row.merchant_type ?? null,
  }
}

// ── Segmented control ─────────────────────────────────────────────────────────
function SegmentedControl({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  layoutId: string
}) {
  return (
    <div className="inline-flex items-center p-1 rounded-[10px] bg-black/[0.06] gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="relative px-5 py-2 rounded-[8px] text-[0.72rem] font-medium transition-colors duration-150"
        >
          {value === opt.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-[8px] bg-white"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' }}
              transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.8 }}
            />
          )}
          <span className={`relative z-10 ${value === opt.value ? 'text-foreground' : 'text-foreground/45'}`}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  )
}

export default function AdminMerchantApplicationsPage() {
  const [items, setItems] = useState<Application[]>([])
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [actionError, setActionError] = useState('')
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('pending_admin_review')
  const [searchQuery, setSearchQuery] = useState('')
  const [denyReason, setDenyReason] = useState('')
  const [rejectModalOpen, setRejectModalOpen] = useState(false)

  const active = useMemo(() => items.find((item) => item.id === activeId) ?? null, [items, activeId])

  useEffect(() => {
    const controller = new AbortController()
    async function loadApplications() {
      setLoading(true); setLoadError('')
      try {
        const params = new URLSearchParams({ status: statusFilter })
        if (searchQuery.trim()) params.set('q', searchQuery.trim())
        const res = await fetch(`/api/admin/merchant-applications?${params.toString()}`, { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as { applications?: ApiApplication[]; error?: string } | null
        if (!res.ok) { setLoadError(payload?.error ?? '讀取申請資料失敗。'); return }
        const next = (payload?.applications ?? []).map(toViewModel)
        setItems(next)
        setActiveId((current) => (next.some((item) => item.id === current) ? current : next[0]?.id ?? ''))
      } catch (error) {
        if (!controller.signal.aborted)
          setLoadError(error instanceof Error ? error.message : '讀取申請資料失敗。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void loadApplications()
    return () => controller.abort()
  }, [searchQuery, statusFilter])

  useEffect(() => {
    setActionError('')
    setDenyReason(active?.rejectionReason ?? '')
    setRejectModalOpen(false)
  }, [activeId, active?.rejectionReason])

  const decide = async (id: string, decision: 'approve' | 'deny') => {
    setActionError(''); setActionLoadingId(id)
    try {
      const res = await fetch(`/api/admin/merchant-applications/${id}/${decision}`, {
        method: 'POST',
        headers: decision === 'deny' ? { 'Content-Type': 'application/json' } : undefined,
        body: decision === 'deny' ? JSON.stringify({ reason: denyReason }) : undefined,
      })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setActionError(payload?.error ?? '審核操作失敗，請稍後再試。'); return }
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id)
        setActiveId((current) => (current === id ? next[0]?.id ?? '' : current))
        return next
      })
      setDenyReason('')
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '審核操作失敗，請稍後再試。')
    } finally {
      setActionLoadingId('')
    }
  }

  const openRejectModal  = () => { setDenyReason(active?.rejectionReason ?? ''); setRejectModalOpen(true) }
  const closeRejectModal = () => { if (actionLoadingId) return; setRejectModalOpen(false) }
  const emptyCopy = statusFilter === 'pending_admin_review' ? '目前沒有待審核的商家申請。' : '目前沒有符合搜尋條件的已拒絕申請。'

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">管理後台</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif">商家申請審核</h1>
            <p className="mt-2 text-sm text-muted-foreground">先處理待審核名單，也能回頭搜尋已拒絕申請並重新通過。</p>
          </div>
          <SegmentedControl
            layoutId="merchant-app-status"
            options={[
              { value: 'pending_admin_review', label: '待審核' },
              { value: 'denied', label: '已拒絕' },
            ]}
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as ReviewStatus)}
          />
        </div>
      </motion.div>

      {/* Search + count */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3">
        <label className="flex flex-1 items-center gap-3 rounded-lg border border-foreground/[0.08] bg-linen px-4 py-2.5 shadow-sm">
          <Search className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={statusFilter === 'denied' ? '搜尋已拒絕申請的公司或信箱' : '搜尋待審核申請的公司或信箱'}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/35"
          />
        </label>
        <div className="shrink-0 rounded-lg border border-foreground/[0.08] bg-linen px-4 py-2.5 shadow-sm">
          <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded border ${
            statusFilter === 'pending_admin_review'
              ? 'bg-amber-50 text-amber-700 border-amber-200/60'
              : 'bg-red-50 text-red-600 border-red-200/60'
          }`}>
            {loading ? '…' : `${items.length} 件`}
          </span>
        </div>
      </motion.div>

      {/* Errors */}
      {loadError   && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>}
      {actionError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>}

      {/* Body */}
      {loading ? (
        <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-16 text-center">
          <div className="w-4 h-4 rounded-full border border-foreground/20 border-t-foreground/60 animate-spin mx-auto" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div key={statusFilter} custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="grid items-start gap-5 lg:grid-cols-[300px_1fr]"
            >
              {/* List */}
              <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.06]">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">申請清單</p>
                  <span className="text-xs font-mono text-muted-foreground/50">{items.length} 件</span>
                </div>
                <div className="max-h-[70vh] divide-y divide-foreground/[0.06] overflow-auto">
                  {items.map((app, index) => {
                    const isActive = app.id === activeId
                    return (
                      <motion.button
                        key={app.id} custom={3 + index} initial="hidden" animate="visible" variants={fadeUp}
                        onClick={() => setActiveId(app.id)}
                        className={`w-full px-4 py-4 text-left transition-colors duration-150 ${isActive ? 'bg-foreground text-background' : 'hover:bg-foreground/[0.04]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-serif text-sm ${
                            isActive
                              ? 'border-background/20 bg-background/10 text-background/80'
                              : 'border-foreground/[0.12] bg-foreground/[0.04] text-muted-foreground'
                          }`}>
                            {app.company.slice(0, 1)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className={`truncate text-sm ${isActive ? 'text-background' : 'text-foreground'}`}>{app.company}</p>
                              {app.merchantType && (
                                <span className={`shrink-0 text-[0.6rem] tracking-[0.2em] border px-1 py-px ${
                                  isActive
                                    ? 'border-background/20 text-background/50'
                                    : 'border-foreground/10 bg-foreground/[0.04] text-foreground/40'
                                }`}>
                                  {MERCHANT_TYPE_LABEL[app.merchantType] ?? app.merchantType}
                                </span>
                              )}
                            </div>
                            <p className={`mt-0.5 truncate text-xs ${isActive ? 'text-background/55' : 'text-muted-foreground'}`}>
                              {app.contact} · {app.city}
                            </p>
                            <div className={`mt-1 flex items-center gap-1 text-xs ${isActive ? 'text-background/40' : 'text-muted-foreground/50'}`}>
                              <Calendar className="h-2.5 w-2.5" />
                              {statusFilter === 'denied' ? (app.reviewedAt || '—') : (app.appliedDate || '—')}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {/* Detail */}
              {active && (
                <AnimatePresence mode="wait">
                  <motion.div key={active.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden divide-y divide-foreground/[0.06]"
                  >
                    {/* Identity */}
                    <div className="px-5 py-5 space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-foreground/[0.08] bg-foreground/[0.04] text-2xl font-serif text-muted-foreground">
                          {active.company.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h2 className="text-xl font-serif">{active.company}</h2>
                                {active.merchantType && (
                                  <span className="text-[0.67rem] tracking-[0.2em] border border-foreground/10 bg-foreground/[0.04] text-foreground/50 px-1.5 py-px">
                                    {MERCHANT_TYPE_LABEL[active.merchantType] ?? active.merchantType}
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{active.contact}</p>
                            </div>
                            <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-zinc-100 text-zinc-500 border-zinc-200/60 shrink-0">
                              {active.projectCount} 個商案
                            </span>
                          </div>

                          {/* Info grid */}
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {[
                              { icon: Mail,      label: '電子郵件',   value: active.email        },
                              { icon: Phone,     label: '聯絡電話',   value: active.phone        },
                              { icon: MapPin,    label: '縣市',       value: active.city         },
                              { icon: Building2, label: '預計商案數', value: active.projectCount },
                            ].map((item) => (
                              <div key={item.label} className="rounded-lg border border-foreground/[0.08] bg-linen/60 px-4 py-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <item.icon className="h-3 w-3 text-muted-foreground/50" />
                                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</span>
                                </div>
                                <p className="text-xs break-all text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {statusFilter === 'denied' && active.rejectionReason && (
                        <div className="rounded-lg border border-red-200/60 bg-red-50 px-4 py-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
                            <p className="text-xs uppercase tracking-[0.3em] text-red-600">拒絕原因</p>
                          </div>
                          <p className="text-sm leading-relaxed text-red-800/80">{active.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Meta stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-foreground/[0.06]">
                      {[
                        { icon: Calendar, label: '送件日期', value: formatDate(active.appliedDate) },
                        { icon: Calendar, label: '審核日期', value: formatDate(active.reviewedAt)  },
                        { icon: MapPin,   label: '縣市',     value: active.city                    },
                        { icon: Building2,label: '商案數',   value: active.projectCount            },
                      ].map((item) => (
                        <div key={item.label} className="px-4 py-3 bg-linen/40">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <item.icon className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</span>
                          </div>
                          <p className="text-xs text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground/60">
                        {statusFilter === 'pending_admin_review'
                          ? '通過後會建立商家檔案並啟用 merchant 角色。'
                          : '已拒絕的商家申請仍可重新審核並通過。'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button" onClick={() => void decide(active.id, 'approve')}
                          disabled={actionLoadingId === active.id}
                          className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-4 py-2.5 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {statusFilter === 'denied' ? '重新通過' : '通過'}
                        </button>
                        {statusFilter === 'pending_admin_review' && (
                          <button
                            type="button" onClick={openRejectModal}
                            disabled={actionLoadingId === active.id}
                            className="rounded-lg bg-black/[0.06] text-foreground/70 font-medium text-[0.78rem] px-4 py-2.5 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            拒絕
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          ) : (
            <motion.div key="empty" custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-14 text-center"
            >
              <p className="text-sm text-muted-foreground">{emptyCopy}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModalOpen && active && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-[2px]"
              onClick={closeRejectModal}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-lg bg-background border border-foreground/20 shadow-2xl rounded-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-foreground/[0.08]">
                  <div>
                    <p className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/50 mb-1">拒絕申請</p>
                    <h3 className="text-xl font-serif">{active.company}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">你可以留下原因，方便之後重新審核時查看。</p>
                  </div>
                  <button type="button" onClick={closeRejectModal}
                    className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.06] transition-all duration-150">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5">
                  <label htmlFor="reject-reason-merchant" className="block text-xs uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">拒絕原因（選填）</label>
                  <textarea
                    id="reject-reason-merchant" value={denyReason} onChange={(e) => setDenyReason(e.target.value)}
                    rows={5} placeholder="輸入拒絕原因（選填）"
                    className="w-full rounded-lg border border-foreground/[0.12] bg-linen px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors resize-none"
                  />
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={closeRejectModal} disabled={Boolean(actionLoadingId)}
                    className="rounded-lg bg-black/[0.06] text-foreground/70 font-medium text-[0.78rem] px-4 py-2.5 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40">
                    取消
                  </button>
                  <button type="button" onClick={() => void decide(active.id, 'deny')}
                    disabled={actionLoadingId === active.id}
                    className="rounded-lg bg-red-500 text-white font-medium text-[0.78rem] px-4 py-2.5 hover:bg-red-600 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    確認拒絕
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
