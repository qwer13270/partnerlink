'use client'

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Check, CirclePlay, Images, Search, Sparkles, Users, X } from 'lucide-react'

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
  avgViews: string
  engagementRate: string
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
  avg_views: string | null
  engagement_rate: string | null
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
    avgViews: row.avg_views || '未填寫',
    engagementRate: row.engagement_rate || '未填寫',
    rejectionReason: row.rejection_reason || '',
    status: row.status,
  }
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
      setLoading(true)
      setLoadError('')
      try {
        const params = new URLSearchParams({ status: statusFilter })
        if (searchQuery.trim()) params.set('q', searchQuery.trim())

        const res = await fetch(`/api/admin/kol-applications?${params.toString()}`, { signal: controller.signal })
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
      const res = await fetch(`/api/admin/kol-applications/${id}/${decision}`, {
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
  const emptyCopy = statusFilter === 'pending_admin_review' ? '目前沒有待審核的 KOL 申請。' : '目前沒有符合搜尋條件的已拒絕申請。'

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="space-y-3">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">管理後台</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif">KOL 申請審核</h1>
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
                className={`px-4 py-2 text-[0.68rem] uppercase tracking-[0.24em] transition-colors ${
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
            placeholder={statusFilter === 'denied' ? '搜尋已拒絕申請的姓名或信箱' : '搜尋待審核申請的姓名或信箱'}
            className="w-full bg-transparent text-sm text-[#1e1914] outline-none placeholder:text-[#a19588]"
          />
        </label>
        <div className="flex items-center gap-3 border border-[#d9cdc0] bg-[#faf6f1] px-4 py-3">
          <span className="text-[0.62rem] uppercase tracking-[0.26em] text-[#8e8073]">{statusLabel}</span>
          <span className={`text-[0.62rem] uppercase tracking-[0.2em] px-2 py-1 ${
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
                  <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">申請清單</p>
                  <span className="text-[0.6rem] text-muted-foreground">{items.length} 件</span>
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
                          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
                            isActive ? 'border-background/20' : 'border-foreground/15'
                          }`}>
                            {app.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={app.profilePhotoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className={`text-sm font-serif ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
                                {app.name.slice(0, 1)}
                              </span>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`truncate text-sm font-medium ${isActive ? 'text-background' : 'text-foreground'}`}>
                              {app.name}
                            </p>
                            <p className={`mt-0.5 truncate text-[0.65rem] ${isActive ? 'text-background/60' : 'text-muted-foreground'}`}>
                              {app.followers} · {app.platforms.length > 0 ? app.platforms.join(' / ') : '未填寫平台'}
                            </p>
                            <div className={`mt-1 flex items-center gap-1 text-[0.62rem] ${isActive ? 'text-background/50' : 'text-muted-foreground'}`}>
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
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-foreground/15 bg-muted/30">
                          {active.profilePhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={active.profilePhotoUrl} alt={active.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl font-serif text-muted-foreground">{active.name.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-xl font-serif">{active.name}</h2>
                                <span className={`border px-2 py-1 text-[0.58rem] uppercase tracking-[0.22em] ${
                                  active.status === 'denied'
                                    ? 'border-red-200 bg-red-50 text-red-700'
                                    : 'border-amber-200 bg-amber-50 text-amber-700'
                                }`}>
                                  {active.status === 'denied' ? '已拒絕' : '待審核'}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{active.email}</p>
                            </div>
                            <span className="shrink-0 border border-border px-1.5 py-0.5 text-[0.6rem] font-mono text-muted-foreground">
                              {active.category}
                            </span>
                          </div>
                          <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">{active.bio}</p>
                        </div>
                      </div>

                      {active.status === 'denied' && (
                        <div className="border border-red-200 bg-red-50 px-4 py-4">
                          <p className="text-[0.6rem] uppercase tracking-[0.24em] text-red-700">上次拒絕原因</p>
                          <p className="mt-2 text-sm leading-relaxed text-[#6d3f3f]">
                            {active.rejectionReason || '尚未填寫拒絕原因。'}
                          </p>
                          <p className="mt-2 text-[0.7rem] text-[#8d6363]">
                            審核日期：{formatDate(active.reviewedAt)}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-y divide-foreground/[0.08] sm:grid-cols-4">
                      {[
                        { icon: Users, label: '粉絲數', value: active.followers },
                        { icon: Sparkles, label: '主題', value: active.category },
                        { icon: Images, label: '平均觀看', value: active.avgViews },
                        { icon: CirclePlay, label: '互動率', value: active.engagementRate },
                      ].map((stat) => (
                        <div key={stat.label} className="px-4 py-3">
                          <div className="mb-1 flex items-center gap-1.5">
                            <stat.icon className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span>
                          </div>
                          <p className="text-xs text-foreground">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {active.platforms.length > 0 && (
                      <div className="px-5 py-4">
                        <p className="mb-3 text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">平台帳號</p>
                        <div className="flex flex-wrap gap-2">
                          {active.platforms.map((platform) => (
                            <span key={platform} className="border border-foreground/15 px-2 py-1 text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                              {platform}
                              {active.platformAccounts[platform] && (
                                <span className="ml-1.5 normal-case text-foreground/70">{active.platformAccounts[platform]}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid gap-5 px-5 py-5 lg:grid-cols-[0.9fr_1.1fr]">
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <p>
                          來源：{active.city}
                          <span className="mx-1.5 opacity-30">·</span>
                          申請日 {active.appliedDate || '—'}
                        </p>
                        {active.status === 'denied' && (
                          <p>重新通過後，這位 KOL 會立刻恢復正式身分。</p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void decide(active.id, 'approve')}
                            disabled={actionLoadingId === active.id}
                            className="flex items-center gap-1.5 bg-foreground px-3 py-2 text-[0.65rem] uppercase tracking-widest text-background transition-colors duration-150 hover:bg-foreground/85 disabled:opacity-60"
                          >
                            <Check className="h-3 w-3" />
                            {active.status === 'denied' ? '重新通過' : '通過'}
                          </button>
                          {active.status === 'pending_admin_review' && (
                            <button
                              type="button"
                              onClick={openRejectModal}
                              disabled={actionLoadingId === active.id}
                              className="flex items-center gap-1.5 border border-border px-3 py-2 text-[0.65rem] uppercase tracking-widest text-muted-foreground transition-colors duration-150 hover:border-foreground hover:text-foreground disabled:opacity-60"
                            >
                              <X className="h-3 w-3" />
                              拒絕
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={`empty-${statusFilter}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-foreground/15 px-5 py-12 text-center"
            >
              <p className="text-sm text-muted-foreground">{emptyCopy}</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {rejectModalOpen && active?.status === 'pending_admin_review' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#15120f]/45 px-6 py-10 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl overflow-hidden border border-[#d8cbbb] bg-[linear-gradient(180deg,#fcfaf6_0%,#f5efe8_100%)] shadow-[0_32px_80px_rgba(36,26,16,0.18)]"
            >
              <div className="border-b border-[#ddcfbf] px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-[0.65rem] uppercase tracking-[0.32em] text-[#9a7c67]">Reject Application</p>
                    <h3 className="text-2xl font-serif text-[#1d1a16]">填寫拒絕原因</h3>
                    <p className="max-w-xl text-sm leading-relaxed text-[#746558]">
                      這段內容會顯示給申請者參考。可以留白，但若有具體補件方向，會更方便對方之後調整後再申請。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeRejectModal}
                    className="inline-flex h-9 w-9 items-center justify-center border border-[#d8cbbb] bg-white/80 text-[#6c5a4d] transition-colors hover:bg-white"
                    aria-label="關閉拒絕原因視窗"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5 px-6 py-6">
                <div className="border border-[#e1d4c6] bg-white/70 px-4 py-3">
                  <p className="text-[0.58rem] uppercase tracking-[0.24em] text-[#9a8a7e]">目前申請者</p>
                  <p className="mt-1 text-sm text-[#1e1914]">{active.name} · {active.email}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reject-reason-modal" className="text-[0.62rem] uppercase tracking-[0.24em] text-[#7d6c60]">
                    拒絕原因（選填）
                  </label>
                  <textarea
                    id="reject-reason-modal"
                    value={denyReason}
                    onChange={(event) => setDenyReason(event.target.value)}
                    rows={6}
                    placeholder="例如：目前內容定位還不夠清楚，建議補充近期作品與合作案例後再送件。"
                    className="w-full border border-[#d8cbbb] bg-[#fffdfa] px-4 py-4 text-sm leading-relaxed text-[#1e1914] outline-none transition-colors placeholder:text-[#a59a8f] focus:border-[#8b6a52]"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeRejectModal}
                    disabled={actionLoadingId === active.id}
                    className="border border-[#d8cbbb] bg-white px-4 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-[#6f665d] transition-colors hover:bg-[#f7f1ea] disabled:opacity-60"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await decide(active.id, 'deny')
                      setRejectModalOpen(false)
                    }}
                    disabled={actionLoadingId === active.id}
                    className="inline-flex items-center gap-2 border border-[#1d1a16] bg-[#1d1a16] px-4 py-3 text-[0.65rem] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#332820] disabled:opacity-60"
                  >
                    <X className="h-3.5 w-3.5" />
                    確認拒絕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
