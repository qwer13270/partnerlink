'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Calendar, Check, Mail, MapPin, Phone, Search, ShieldAlert, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type ReviewStatus = 'pending_admin_review' | 'denied'

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
}

function formatDate(value: string) {
  return value ? value.slice(0, 10) : '—'
}

function toViewModel(row: ApiApplication): Application {
  return {
    id: row.id,
    email: row.email,
    company: row.company_name,
    contact: row.contact_name,
    phone: row.phone,
    city: row.city || '未填寫',
    projectCount: row.project_count || '未填寫',
    appliedDate: row.submitted_at ? row.submitted_at.slice(0, 10) : '',
    reviewedAt: row.reviewed_at ? row.reviewed_at.slice(0, 10) : '',
    rejectionReason: row.rejection_reason || '',
  }
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
      setLoading(true)
      setLoadError('')
      try {
        const params = new URLSearchParams({ status: statusFilter })
        if (searchQuery.trim()) params.set('q', searchQuery.trim())

        const res = await fetch(`/api/admin/merchant-applications?${params.toString()}`, { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as { applications?: ApiApplication[]; error?: string } | null
        if (!res.ok) {
          setLoadError(payload?.error ?? '讀取申請資料失敗。')
          return
        }

        const next = (payload?.applications ?? []).map(toViewModel)
        setItems(next)
        setActiveId((current) => (next.some((item) => item.id === current) ? current : next[0]?.id ?? ''))
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : '讀取申請資料失敗。')
        }
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
    setActionError('')
    setActionLoadingId(id)

    try {
      const res = await fetch(`/api/admin/merchant-applications/${id}/${decision}`, {
        method: 'POST',
        headers: decision === 'deny' ? { 'Content-Type': 'application/json' } : undefined,
        body: decision === 'deny' ? JSON.stringify({ reason: denyReason }) : undefined,
      })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        setActionError(payload?.error ?? '審核操作失敗，請稍後再試。')
        return
      }

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

  const openRejectModal = () => {
    setDenyReason(active?.rejectionReason ?? '')
    setRejectModalOpen(true)
  }

  const closeRejectModal = () => {
    if (actionLoadingId) return
    setRejectModalOpen(false)
  }

  const statusLabel = statusFilter === 'pending_admin_review' ? '待審核' : '已拒絕'
  const emptyCopy = statusFilter === 'pending_admin_review' ? '目前沒有待審核的商家申請。' : '目前沒有符合搜尋條件的已拒絕申請。'

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">管理後台</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif">商家申請審核</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              先處理待審核名單，也能回頭搜尋已拒絕申請並重新通過。
            </p>
          </div>
          <div className="flex items-center gap-2 border border-[#d8cbbb] bg-[#fbf7f2] p-1">
            {[
              { value: 'pending_admin_review' as const, label: '待審核' },
              { value: 'denied' as const, label: '已拒絕' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.3em] transition-colors ${
                  statusFilter === option.value
                    ? 'bg-[#1d1a16] text-white'
                    : 'text-[#6f665d] hover:bg-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid gap-4 lg:grid-cols-[0.9fr_0.35fr]">
        <label className="flex items-center gap-3 border border-[#d9cdc0] bg-white px-4 py-3">
          <Search className="h-4 w-4 text-[#8b7969]" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={statusFilter === 'denied' ? '搜尋已拒絕申請的公司或信箱' : '搜尋待審核申請的公司或信箱'}
            className="w-full bg-transparent text-sm text-[#1e1914] outline-none placeholder:text-[#a19588]"
          />
        </label>
        <div className="flex items-center gap-3 border border-[#d9cdc0] bg-[#faf6f1] px-4 py-3">
          <span className="text-xs uppercase tracking-[0.3em] text-[#8e8073]">{statusLabel}</span>
          <span className={`text-xs uppercase tracking-[0.3em] px-2 py-1 ${
            statusFilter === 'pending_admin_review'
              ? 'border border-amber-200 bg-amber-50 text-amber-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}>
            {loading ? '讀取中…' : `${items.length} 件`}
          </span>
        </div>
      </motion.div>

      {loadError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}
      {actionError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {loading ? (
        <div className="border border-foreground/15 px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">讀取申請資料中…</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key={statusFilter}
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="grid items-start gap-5 lg:grid-cols-[320px_1fr]"
            >
              <div className="border border-foreground/15 bg-white">
                <div className="flex items-center justify-between border-b border-foreground/[0.08] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">申請清單</p>
                  <span className="text-xs text-muted-foreground">{items.length} 件</span>
                </div>
                <div className="max-h-[70vh] divide-y divide-foreground/[0.08] overflow-auto">
                  {items.map((app, index) => {
                    const isActive = app.id === activeId
                    return (
                      <motion.button
                        key={app.id}
                        custom={3 + index}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        onClick={() => setActiveId(app.id)}
                        className={`w-full px-4 py-4 text-left transition-colors duration-150 ${
                          isActive ? 'bg-foreground text-background' : 'hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                            isActive ? 'border-background/20 bg-background/10 text-background/80' : 'border-foreground/15 bg-muted/30 text-muted-foreground'
                          }`}>
                            {app.company.slice(0, 1)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm ${isActive ? 'text-background' : 'text-foreground'}`}>
                              {app.company}
                            </p>
                            <p className={`mt-0.5 truncate text-xs ${isActive ? 'text-background/60' : 'text-muted-foreground'}`}>
                              {app.contact} · {app.city}
                            </p>
                            <div className={`mt-1 flex items-center gap-1 text-xs ${isActive ? 'text-background/50' : 'text-muted-foreground'}`}>
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

              {active && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="divide-y divide-foreground/[0.08] border border-foreground/15 bg-white"
                  >
                    <div className="space-y-6 px-5 py-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-foreground/15 bg-muted/30 text-xl font-serif text-muted-foreground">
                          {active.company.slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h2 className="text-xl font-serif text-foreground">{active.company}</h2>
                              <p className="mt-0.5 text-xs text-muted-foreground">{active.contact}</p>
                            </div>
                            <span className="border border-border px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                              {active.projectCount}
                            </span>
                          </div>
                          <div className="mt-4 grid gap-2 sm:grid-cols-2">
                            {[
                              { icon: Mail, label: '電子郵件', value: active.email },
                              { icon: Phone, label: '聯絡電話', value: active.phone },
                              { icon: MapPin, label: '縣市', value: active.city },
                              { icon: Building2, label: '預計商案數', value: active.projectCount },
                            ].map((item) => (
                              <div key={item.label} className="border border-foreground/10 bg-[#faf7f3] px-4 py-3">
                                <div className="mb-1 flex items-center gap-1.5">
                                  <item.icon className="h-3 w-3 text-muted-foreground/60" />
                                  <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</span>
                                </div>
                                <p className="text-xs break-all text-foreground">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {statusFilter === 'denied' && active.rejectionReason && (
                        <div className="border border-red-200 bg-red-50 px-4 py-4">
                          <div className="mb-2 flex items-center gap-2 text-red-700">
                            <ShieldAlert className="h-4 w-4" />
                            <p className="text-xs uppercase tracking-[0.3em]">拒絕原因</p>
                          </div>
                          <p className="text-sm leading-relaxed text-[#6d3f3f]">{active.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid gap-px bg-foreground/[0.08] sm:grid-cols-4">
                      {[
                        { icon: Calendar, label: '送件日期', value: formatDate(active.appliedDate) },
                        { icon: Calendar, label: '審核日期', value: formatDate(active.reviewedAt) },
                        { icon: MapPin, label: '縣市', value: active.city },
                        { icon: Building2, label: '商案數', value: active.projectCount },
                      ].map((item) => (
                        <div key={item.label} className="bg-white px-4 py-4">
                          <div className="mb-1 flex items-center gap-1.5">
                            <item.icon className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</span>
                          </div>
                          <p className="text-xs text-foreground">{item.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                      <div className="text-xs text-muted-foreground">
                        {statusFilter === 'pending_admin_review'
                          ? '通過後會建立商家檔案並啟用 merchant 角色。'
                          : '已拒絕的商家申請仍可重新審核並通過。'}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void decide(active.id, 'approve')}
                          disabled={actionLoadingId === active.id}
                          className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-xs uppercase tracking-[0.3em] text-background transition-colors duration-150 hover:bg-foreground/85 disabled:opacity-60"
                        >
                          <Check className="h-3 w-3" />
                          {statusFilter === 'denied' ? '重新通過' : '通過'}
                        </button>
                        {statusFilter === 'pending_admin_review' && (
                          <button
                            type="button"
                            onClick={openRejectModal}
                            disabled={actionLoadingId === active.id}
                            className="inline-flex items-center gap-1.5 border border-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground disabled:opacity-60"
                          >
                            <X className="h-3 w-3" />
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
            <motion.div
              key="empty"
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="border border-foreground/15 px-5 py-16 text-center"
            >
              <p className="text-sm text-muted-foreground">{emptyCopy}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {rejectModalOpen && active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md border border-foreground/15 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]"
            >
              <div className="mb-4 space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">拒絕申請</p>
                <h2 className="text-xl font-serif text-foreground">{active.company}</h2>
                <p className="text-sm text-muted-foreground">你可以留下原因，方便之後重新審核時查看。</p>
              </div>
              <textarea
                value={denyReason}
                onChange={(event) => setDenyReason(event.target.value)}
                placeholder="輸入拒絕原因（選填）"
                className="min-h-[9rem] w-full border border-border bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  disabled={Boolean(actionLoadingId)}
                  className="border border-border px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground disabled:opacity-60"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={() => void decide(active.id, 'deny')}
                  disabled={actionLoadingId === active.id}
                  className="inline-flex items-center gap-1.5 bg-foreground px-4 py-2 text-xs uppercase tracking-[0.3em] text-background transition-colors duration-150 hover:bg-foreground/85 disabled:opacity-60"
                >
                  <X className="h-3 w-3" />
                  確認拒絕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
