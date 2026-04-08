'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, Search, Sparkles, Users, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type ReviewStatus = 'pending_admin_review' | 'denied'

type Application = {
  id: string
  userId: string
  name: string
  email: string
  profilePhotoUrl: string
  platforms: string[]
  platformAccounts: Record<string, string>
  followers: string
  category: string
  bio: string
  appliedDate: string
  reviewedAt: string
  city: string
  rejectionReason: string
  status: ReviewStatus
}

type ApiApplication = {
  id: string
  user_id: string
  email: string
  full_name: string
  platforms: unknown
  platform_accounts?: unknown
  follower_range: string | null
  content_type: string | null
  bio: string | null
  city: string | null
  profile_photo_url?: string
  submitted_at: string
  reviewed_at: string | null
  rejection_reason: string | null
  status: ReviewStatus
}

function asStringArray(v: unknown) {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
}

function asPlatformAccounts(v: unknown) {
  if (!v || typeof v !== 'object') return {}
  return Object.fromEntries(
    Object.entries(v as Record<string, unknown>)
      .filter(([, e]) => typeof e === 'string' && (e as string).trim().length > 0)
      .map(([p, e]) => [p, String(e).trim()]),
  )
}

function formatDate(value: string) {
  return value ? value.slice(0, 10) : '—'
}

function toViewModel(row: ApiApplication): Application {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.full_name || row.email,
    email: row.email,
    profilePhotoUrl: typeof row.profile_photo_url === 'string' ? row.profile_photo_url : '',
    platforms: asStringArray(row.platforms),
    platformAccounts: asPlatformAccounts(row.platform_accounts),
    followers: row.follower_range || '未填寫',
    category: row.content_type || '未分類',
    bio: row.bio || '尚未提供自我介紹。',
    appliedDate: row.submitted_at ? row.submitted_at.slice(0, 10) : '',
    reviewedAt: row.reviewed_at ? row.reviewed_at.slice(0, 10) : '',
    city: row.city || '未填寫',
    rejectionReason: row.rejection_reason || '',
    status: row.status,
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

export default function AdminKolApplicationsPage() {
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

  const active = useMemo(() => items.find((a) => a.id === activeId) ?? null, [items, activeId])

  useEffect(() => {
    const controller = new AbortController()
    async function loadApplications() {
      setLoading(true); setLoadError('')
      try {
        const params = new URLSearchParams({ status: statusFilter })
        if (searchQuery.trim()) params.set('q', searchQuery.trim())
        const res = await fetch(`/api/admin/kol-applications?${params.toString()}`, { signal: controller.signal })
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
      const res = await fetch(`/api/admin/kol-applications/${id}/${decision}`, {
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
  const emptyCopy = statusFilter === 'pending_admin_review' ? '目前沒有待審核的 KOL 申請。' : '目前沒有符合搜尋條件的已拒絕申請。'

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">管理後台</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif">KOL 申請審核</h1>
            <p className="mt-2 text-sm text-muted-foreground">先處理待審核名單，也能回頭搜尋已拒絕申請並重新通過。</p>
          </div>
          <SegmentedControl
            layoutId="kol-app-status"
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
            placeholder={statusFilter === 'denied' ? '搜尋已拒絕申請的姓名或信箱' : '搜尋待審核申請的姓名或信箱'}
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
                          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border ${isActive ? 'border-background/20' : 'border-foreground/[0.12]'}`}>
                            {app.profilePhotoUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={app.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                              : <span className={`text-sm font-serif ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>{app.name.slice(0, 1)}</span>
                            }
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm ${isActive ? 'text-background' : 'text-foreground'}`}>{app.name}</p>
                            <p className={`mt-0.5 truncate text-xs ${isActive ? 'text-background/55' : 'text-muted-foreground'}`}>
                              {app.followers} · {app.platforms.length > 0 ? app.platforms.join(' / ') : '未填寫平台'}
                            </p>
                            <div className={`mt-1 flex items-center gap-1 text-xs ${isActive ? 'text-background/40' : 'text-muted-foreground/50'}`}>
                              <Calendar className="h-2.5 w-2.5" />
                              {app.appliedDate || '—'}
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
                        <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden border border-foreground/[0.08] bg-foreground/[0.04] flex items-center justify-center">
                          {active.profilePhotoUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={active.profilePhotoUrl} alt={active.name} className="h-full w-full object-cover" />
                            : <span className="text-xl font-serif text-muted-foreground">{active.name.slice(0, 1)}</span>
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-serif">{active.name}</h2>
                                <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded border ${
                                  active.status === 'denied'
                                    ? 'bg-red-50 text-red-600 border-red-200/60'
                                    : 'bg-amber-50 text-amber-700 border-amber-200/60'
                                }`}>
                                  {active.status === 'denied' ? '已拒絕' : '待審核'}
                                </span>
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">{active.email}</p>
                            </div>
                            <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-zinc-100 text-zinc-500 border-zinc-200/60 shrink-0">
                              {active.category}
                            </span>
                          </div>
                          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">{active.bio}</p>
                        </div>
                      </div>

                      {active.status === 'denied' && (
                        <div className="rounded-lg border border-red-200/60 bg-red-50 px-4 py-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-red-600 mb-2">上次拒絕原因</p>
                          <p className="text-sm leading-relaxed text-red-800/80">{active.rejectionReason || '尚未填寫拒絕原因。'}</p>
                          <p className="mt-2 text-xs text-red-500/70">審核日期：{formatDate(active.reviewedAt)}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 divide-x divide-y divide-foreground/[0.06]">
                      {[
                        { icon: Users,    label: '粉絲數', value: active.followers },
                        { icon: Sparkles, label: '主題',   value: active.category },
                      ].map((stat) => (
                        <div key={stat.label} className="px-4 py-3 bg-linen/40">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <stat.icon className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</span>
                          </div>
                          <p className="text-sm text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Platforms */}
                    {active.platforms.length > 0 && (
                      <div className="px-5 py-4">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">平台帳號</p>
                        <div className="flex flex-wrap gap-2">
                          {active.platforms.map((platform) => (
                            <span key={platform} className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.06] text-foreground/70 text-[0.75rem] font-medium px-3 py-1.5">
                              {platform}
                              {active.platformAccounts[platform] && (
                                <span className="text-foreground/50">{active.platformAccounts[platform]}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground/60">
                        {active.city} · 申請日 {active.appliedDate || '—'}
                        {active.status === 'denied' && ' · 重新通過後 KOL 身分立即恢復'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button" onClick={() => void decide(active.id, 'approve')}
                          disabled={actionLoadingId === active.id}
                          className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-4 py-2.5 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {active.status === 'denied' ? '重新通過' : '通過'}
                        </button>
                        {active.status === 'pending_admin_review' && (
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
            <motion.div key={`empty-${statusFilter}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-14 text-center"
            >
              <p className="text-sm text-muted-foreground">{emptyCopy}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Reject modal */}
      <AnimatePresence>
        {rejectModalOpen && active?.status === 'pending_admin_review' && (
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
                    <h3 className="text-xl font-serif">填寫拒絕原因</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground max-w-sm leading-relaxed">
                      這段內容會顯示給申請者參考。留白也可以，但具體補件方向能幫助對方下次調整。
                    </p>
                  </div>
                  <button type="button" onClick={closeRejectModal}
                    className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.06] transition-all duration-150">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="rounded-lg border border-foreground/[0.08] bg-linen px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/50 mb-1">申請者</p>
                    <p className="text-sm">{active.name} · <span className="text-muted-foreground">{active.email}</span></p>
                  </div>
                  <div>
                    <label htmlFor="reject-reason" className="block text-xs uppercase tracking-[0.3em] text-muted-foreground/50 mb-2">拒絕原因（選填）</label>
                    <textarea
                      id="reject-reason" value={denyReason} onChange={(e) => setDenyReason(e.target.value)} rows={5}
                      placeholder="例如：目前內容定位還不夠清楚，建議補充近期作品與合作案例後再送件。"
                      className="w-full rounded-lg border border-foreground/[0.12] bg-linen px-4 py-3 text-sm leading-relaxed placeholder:text-muted-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={closeRejectModal} disabled={Boolean(actionLoadingId)}
                    className="rounded-lg bg-black/[0.06] text-foreground/70 font-medium text-[0.78rem] px-4 py-2.5 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40">
                    取消
                  </button>
                  <button type="button"
                    onClick={async () => { await decide(active.id, 'deny'); setRejectModalOpen(false) }}
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
