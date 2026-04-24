'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, Search, Sparkles, Trash2, Users, X } from 'lucide-react'
import StatusBadge from '@/components/admin/_shared/StatusBadge'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
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

function SegmentedControl({
  options, value, onChange, layoutId,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  layoutId: string
}) {
  return (
    <div className="inline-flex items-center p-1 rounded-full liquid-glass gap-0.5">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="relative px-5 py-2 rounded-full text-[0.72rem] font-medium transition-colors duration-150"
        >
          {value === opt.value && (
            <motion.div
              layoutId={layoutId}
              className="absolute inset-0 rounded-full bg-white/10 border border-white/15"
              transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.8 }}
            />
          )}
          <span className={`relative z-10 ${value === opt.value ? 'text-white' : 'text-white/50'}`}>
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
    setDeleteModalOpen(false)
    setDeleteError('')
  }, [activeId, active?.rejectionReason])

  const handleDelete = async () => {
    if (!active) return
    setDeleting(true); setDeleteError('')
    try {
      const res = await fetch(`/api/admin/kols/${active.userId}`, { method: 'DELETE' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setDeleteError(payload?.error ?? '刪除失敗，請稍後再試。'); return }
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== active.id)
        setActiveId((current) => (current === active.id ? next[0]?.id ?? '' : current))
        return next
      })
      setDeleteModalOpen(false)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '刪除失敗，請稍後再試。')
    } finally {
      setDeleting(false)
    }
  }

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
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-8 text-white">

      <motion.section variants={fadeUp} className="space-y-4">
        <div className="meta text-[10px] text-white/40">管理後台</div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-[40px] md:text-[56px] leading-[1] tracking-tight">
              KOL <span className="italic">申請</span>
            </h1>
            <p className="mt-3 font-body text-sm text-white/55 max-w-xl">
              先處理待審核名單，也能回頭搜尋已拒絕申請並重新通過。
            </p>
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
      </motion.section>

      <motion.section variants={fadeUp} className="flex items-center gap-3">
        <label className="liquid-glass !rounded-full flex flex-1 items-center gap-3 px-4 py-2.5">
          <Search className="h-3.5 w-3.5 text-white/40 shrink-0" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={statusFilter === 'denied' ? '搜尋已拒絕申請的姓名或信箱' : '搜尋待審核申請的姓名或信箱'}
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
        </label>
        <div className="shrink-0">
          <StatusBadge variant={statusFilter === 'pending_admin_review' ? 'warning' : 'danger'}>
            {loading ? '…' : `${items.length} 件`}
          </StatusBadge>
        </div>
      </motion.section>

      {loadError   && <div className="liquid-glass !rounded-[18px] border-red-400/30 px-4 py-3 text-sm text-red-200">{loadError}</div>}
      {actionError && <div className="liquid-glass !rounded-[18px] border-red-400/30 px-4 py-3 text-sm text-red-200">{actionError}</div>}

      {loading ? (
        <div className="liquid-glass !rounded-[22px] px-5 py-16 text-center">
          <div className="w-4 h-4 rounded-full border border-white/20 border-t-white/80 animate-spin mx-auto" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div key={statusFilter} variants={fadeUp}
              className="grid items-start gap-5 lg:grid-cols-[320px_1fr]"
            >
              <div className="liquid-glass !rounded-[22px] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                  <p className="meta text-[10px] text-white/45">申請清單</p>
                  <span className="meta text-[10px] text-white/35">{items.length} 件</span>
                </div>
                <div className="max-h-[70vh] divide-y divide-white/5 overflow-auto">
                  {items.map((app) => {
                    const isActive = app.id === activeId
                    return (
                      <button
                        key={app.id}
                        onClick={() => setActiveId(app.id)}
                        className={`w-full p-5 text-left transition-colors duration-150 ${isActive ? 'bg-white/[0.05]' : 'hover:bg-white/[0.025]'}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="avatar h-10 w-10 flex items-center justify-center text-[12px] shrink-0 overflow-hidden">
                            {app.profilePhotoUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={app.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                              : <span className="font-heading italic text-white/80">{app.name.slice(0, 1)}</span>
                            }
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[14px] text-white/90">{app.name}</p>
                            <p className="mt-0.5 truncate meta text-[10px] text-white/45">
                              {app.followers} · {app.platforms.length > 0 ? app.platforms.join(' / ') : '未填寫'}
                            </p>
                            <div className="mt-1 flex items-center gap-1 meta text-[10px] text-white/35">
                              <Calendar className="h-2.5 w-2.5" />
                              {app.appliedDate || '—'}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {active && (
                <AnimatePresence mode="wait">
                  <motion.div key={active.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="liquid-glass !rounded-[22px] overflow-hidden divide-y divide-white/5"
                  >
                    <div className="px-6 py-6 space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="avatar h-14 w-14 shrink-0 flex items-center justify-center overflow-hidden">
                          {active.profilePhotoUrl
                            // eslint-disable-next-line @next/next/no-img-element
                            ? <img src={active.profilePhotoUrl} alt={active.name} className="h-full w-full object-cover" />
                            : <span className="font-heading italic text-xl text-white/80">{active.name.slice(0, 1)}</span>
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-heading italic text-[28px] leading-none">{active.name}</h2>
                                <StatusBadge variant={active.status === 'denied' ? 'danger' : 'warning'}>
                                  {active.status === 'denied' ? '已拒絕' : '待審核'}
                                </StatusBadge>
                              </div>
                              <p className="mt-2 meta text-[10px] text-white/50">{active.email}</p>
                            </div>
                            <StatusBadge variant="neutral" dot={false}>{active.category}</StatusBadge>
                          </div>
                          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-white/65">{active.bio}</p>
                        </div>
                      </div>

                      {active.status === 'denied' && (
                        <div className="rounded-[14px] border border-red-400/30 bg-red-500/5 px-4 py-4">
                          <p className="meta text-[10px] text-red-300 mb-2">上次拒絕原因</p>
                          <p className="text-[13px] leading-relaxed text-red-100/80">{active.rejectionReason || '尚未填寫拒絕原因。'}</p>
                          <p className="mt-2 meta text-[10px] text-red-300/70">審核日期：{formatDate(active.reviewedAt)}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-white/5">
                      {[
                        { icon: Users,    label: '粉絲數', value: active.followers },
                        { icon: Sparkles, label: '主題',   value: active.category },
                      ].map((stat) => (
                        <div key={stat.label} className="px-5 py-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            <stat.icon className="h-3 w-3 text-white/40" />
                            <span className="meta text-[10px] text-white/45">{stat.label}</span>
                          </div>
                          <p className="text-[14px] text-white/90">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {active.platforms.length > 0 && (
                      <div className="px-6 py-5">
                        <p className="meta text-[10px] text-white/45 mb-3">平台帳號</p>
                        <div className="flex flex-wrap gap-2">
                          {active.platforms.map((platform) => (
                            <span key={platform} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12px] text-white/80 px-3 py-1.5">
                              <span className="font-medium">{platform}</span>
                              {active.platformAccounts[platform] && (
                                <span className="text-white/45">{active.platformAccounts[platform]}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
                      <p className="meta text-[10px] text-white/40">
                        {active.city} · 申請日 {active.appliedDate || '—'}
                        {active.status === 'denied' && ' · 重新通過後 KOL 身分立即恢復'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button" onClick={() => void decide(active.id, 'approve')}
                          disabled={actionLoadingId === active.id}
                          className="liquid-glass-strong !rounded-full text-white font-body font-medium text-[12px] px-4 py-2.5 hover:bg-white/[0.04] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {active.status === 'denied' ? '重新通過' : '通過'}
                        </button>
                        {active.status === 'pending_admin_review' && (
                          <button
                            type="button" onClick={openRejectModal}
                            disabled={actionLoadingId === active.id}
                            className="liquid-glass !rounded-full text-white/75 font-body font-medium text-[12px] px-4 py-2.5 hover:text-white active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5"
                          >
                            <X className="h-3.5 w-3.5" />
                            拒絕
                          </button>
                        )}
                        {active.status === 'denied' && (
                          <button
                            type="button" onClick={() => { setDeleteError(''); setDeleteModalOpen(true) }}
                            className="rounded-full border border-red-400/40 bg-red-500/10 text-red-200 font-body font-medium text-[12px] px-4 py-2.5 hover:bg-red-500/20 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            永久刪除
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
              className="liquid-glass !rounded-[22px] px-5 py-16 text-center"
            >
              <p className="font-body text-sm text-white/55">{emptyCopy}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {deleteModalOpen && active && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => { if (!deleting) setDeleteModalOpen(false) }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-lg liquid-glass-strong !rounded-2xl overflow-hidden text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/10">
                  <div>
                    <p className="meta text-[10px] text-red-300 mb-1">刪除帳號</p>
                    <h3 className="font-heading italic text-[24px]">永久刪除 {active.name}</h3>
                    <p className="mt-2 text-[13px] text-white/60 leading-relaxed">
                      此操作會永久刪除此已拒絕申請者的帳號、所有上傳的檔案，以及所有相關紀錄。無法復原。
                    </p>
                  </div>
                  <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={deleting}
                    className="mt-0.5 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 disabled:opacity-40">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="meta text-[10px] text-white/40 mb-1">申請者</p>
                    <p className="text-[13px] text-white/85">{active.name} · <span className="text-white/55">{active.email}</span></p>
                  </div>
                  {deleteError && (
                    <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{deleteError}</div>
                  )}
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={deleting}
                    className="liquid-glass !rounded-full text-white/75 font-body font-medium text-[12px] px-4 py-2.5 hover:text-white active:scale-[0.97] transition-all duration-150 disabled:opacity-40">
                    取消
                  </button>
                  <button type="button" onClick={() => void handleDelete()} disabled={deleting}
                    className="rounded-full border border-red-400/40 bg-red-500/10 text-red-200 font-body font-medium text-[12px] px-4 py-2.5 hover:bg-red-500/20 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? '刪除中…' : '確認刪除'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rejectModalOpen && active?.status === 'pending_admin_review' && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={closeRejectModal}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-lg liquid-glass-strong !rounded-2xl overflow-hidden text-white"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/10">
                  <div>
                    <p className="meta text-[10px] text-white/45 mb-1">拒絕申請</p>
                    <h3 className="font-heading italic text-[24px]">填寫拒絕原因</h3>
                    <p className="mt-2 text-[13px] text-white/60 max-w-sm leading-relaxed">
                      這段內容會顯示給申請者參考。留白也可以，但具體補件方向能幫助對方下次調整。
                    </p>
                  </div>
                  <button type="button" onClick={closeRejectModal}
                    className="mt-0.5 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-4">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="meta text-[10px] text-white/40 mb-1">申請者</p>
                    <p className="text-[13px] text-white/85">{active.name} · <span className="text-white/55">{active.email}</span></p>
                  </div>
                  <div>
                    <label htmlFor="reject-reason" className="block meta text-[10px] text-white/45 mb-2">拒絕原因（選填）</label>
                    <textarea
                      id="reject-reason" value={denyReason} onChange={(e) => setDenyReason(e.target.value)} rows={5}
                      placeholder="例如：目前內容定位還不夠清楚，建議補充近期作品與合作案例後再送件。"
                      className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white leading-relaxed placeholder:text-white/30 focus:border-white/30 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={closeRejectModal} disabled={Boolean(actionLoadingId)}
                    className="liquid-glass !rounded-full text-white/75 font-body font-medium text-[12px] px-4 py-2.5 hover:text-white active:scale-[0.97] transition-all duration-150 disabled:opacity-40">
                    取消
                  </button>
                  <button type="button"
                    onClick={async () => { await decide(active.id, 'deny'); setRejectModalOpen(false) }}
                    disabled={actionLoadingId === active.id}
                    className="rounded-full border border-red-400/40 bg-red-500/10 text-red-200 font-body font-medium text-[12px] px-4 py-2.5 hover:bg-red-500/20 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    確認拒絕
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
