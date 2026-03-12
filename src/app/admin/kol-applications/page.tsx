'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, CirclePlay, Images, Sparkles, Users, X } from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type Application = {
  id: string; userId: string; name: string; email: string
  profilePhotoUrl: string; platforms: string[]
  platformAccounts: Record<string, string>
  followers: string; category: string; bio: string
  appliedDate: string; city: string; avgViews: string; engagementRate: string
}

type ApiApplication = {
  id: string; user_id: string; email: string; full_name: string
  platforms: unknown; platform_accounts?: unknown
  follower_range: string | null; content_type: string | null
  bio: string | null; city: string | null
  avg_views: string | null; engagement_rate: string | null
  profile_photo_url?: string; submitted_at: string
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

function toViewModel(row: ApiApplication): Application {
  return {
    id: row.id, userId: row.user_id,
    name: row.full_name || row.email, email: row.email,
    profilePhotoUrl: typeof row.profile_photo_url === 'string' ? row.profile_photo_url : '',
    platforms: asStringArray(row.platforms),
    platformAccounts: asPlatformAccounts(row.platform_accounts),
    followers: row.follower_range || '未填寫',
    category: row.content_type || '未分類',
    bio: row.bio || '尚未提供自我介紹。',
    appliedDate: row.submitted_at ? row.submitted_at.slice(0, 10) : '',
    city: row.city || '未填寫',
    avgViews: row.avg_views || '未填寫',
    engagementRate: row.engagement_rate || '未填寫',
  }
}

export default function AdminKolApplicationsPage() {
  const [items,           setItems]           = useState<Application[]>([])
  const [activeId,        setActiveId]        = useState('')
  const [loading,         setLoading]         = useState(true)
  const [loadError,       setLoadError]       = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [actionError,     setActionError]     = useState('')

  const active = useMemo(() => items.find((a) => a.id === activeId) ?? null, [items, activeId])

  useEffect(() => {
    const controller = new AbortController()
    async function loadApplications() {
      setLoading(true); setLoadError('')
      try {
        const res     = await fetch('/api/admin/kol-applications', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as { applications?: ApiApplication[]; error?: string } | null
        if (!res.ok) { setLoadError(payload?.error ?? '讀取申請資料失敗。'); return }
        const next = (payload?.applications ?? []).map(toViewModel)
        setItems(next)
        setActiveId(next[0]?.id ?? '')
      } catch (e) {
        if (!controller.signal.aborted)
          setLoadError(e instanceof Error ? e.message : '讀取申請資料失敗。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadApplications()
    return () => controller.abort()
  }, [])

  const decide = async (id: string, decision: 'approve' | 'deny') => {
    setActionError('')
    setActionLoadingId(id)
    try {
      const res     = await fetch(`/api/admin/kol-applications/${id}/${decision}`, { method: 'POST' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setActionError(payload?.error ?? '審核操作失敗，請稍後再試。'); return }
      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id)
        if (id === activeId) setActiveId(next[0]?.id ?? '')
        return next
      })
    } catch (e) {
      setActionError(e instanceof Error ? e.message : '審核操作失敗，請稍後再試。')
    } finally {
      setActionLoadingId('')
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">KOL 申請審核</h1>
        <p className="text-sm text-muted-foreground mt-2">
          審核希望加入 HomeKey 的 KOL 申請，逐一通過或拒絕。
        </p>
      </motion.div>

      {/* ── Count badge ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3">
        {loading ? (
          <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">
            讀取中…
          </span>
        ) : items.length > 0 ? (
          <span className="text-[0.6rem] uppercase tracking-widest text-amber-700 border border-amber-200 bg-amber-50 px-2 py-1">
            {items.length} 筆待審核
          </span>
        ) : (
          <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">
            無待審核申請
          </span>
        )}
      </motion.div>

      {/* ── Errors ── */}
      {loadError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}
      {actionError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="border border-foreground/15 px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">讀取申請資料中…</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key="layout"
              custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="grid gap-5 lg:grid-cols-[300px_1fr] items-start"
            >
              {/* ── Sidebar ── */}
              <div className="border border-foreground/15">
                <div className="px-4 py-3 border-b border-foreground/[0.08] flex items-center justify-between">
                  <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">申請清單</p>
                  <span className="text-[0.6rem] text-muted-foreground">{items.length} 件</span>
                </div>
                <div className="divide-y divide-foreground/[0.08] max-h-[70vh] overflow-auto">
                  {items.map((app, i) => {
                    const isActive = app.id === activeId
                    return (
                      <motion.button
                        key={app.id}
                        custom={3 + i} initial="hidden" animate="visible" variants={fadeUp}
                        onClick={() => setActiveId(app.id)}
                        className={`w-full text-left px-4 py-4 transition-colors duration-150 ${
                          isActive ? 'bg-foreground text-background' : 'hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border ${
                            isActive ? 'border-background/20' : 'border-foreground/15'
                          }`}>
                            {app.profilePhotoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={app.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className={`text-sm font-serif ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
                                {app.name.slice(0, 1)}
                              </span>
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-background' : 'text-foreground'}`}>
                              {app.name}
                            </p>
                            <p className={`text-[0.65rem] truncate mt-0.5 ${isActive ? 'text-background/60' : 'text-muted-foreground'}`}>
                              {app.followers} · {app.platforms.length > 0 ? app.platforms.join(' / ') : '未填寫平台'}
                            </p>
                            <div className={`flex items-center gap-1 mt-1 text-[0.62rem] ${isActive ? 'text-background/50' : 'text-muted-foreground'}`}>
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

              {/* ── Detail panel ── */}
              {active && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    className="border border-foreground/15 divide-y divide-foreground/[0.08]"
                  >
                    {/* Identity */}
                    <div className="px-5 py-5">
                      <div className="flex items-start gap-4">
                        <div className="shrink-0 w-14 h-14 overflow-hidden border border-foreground/15 bg-muted/30 flex items-center justify-center rounded-full">
                          {active.profilePhotoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={active.profilePhotoUrl} alt={active.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-serif text-muted-foreground">{active.name.slice(0, 1)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 flex-wrap">
                            <div>
                              <h2 className="text-xl font-serif">{active.name}</h2>
                              <p className="text-[0.65rem] text-muted-foreground mt-0.5">{active.email}</p>
                            </div>
                            <span className="text-[0.6rem] font-mono text-muted-foreground border border-border px-1.5 py-0.5 shrink-0">
                              {active.category}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xl">{active.bio}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-foreground/[0.08]">
                      {[
                        { icon: Users,      label: '粉絲數',   value: active.followers      },
                        { icon: Sparkles,   label: '主題',     value: active.category       },
                        { icon: Images,     label: '平均觀看', value: active.avgViews        },
                        { icon: CirclePlay, label: '互動率',   value: active.engagementRate },
                      ].map((s) => (
                        <div key={s.label} className="px-4 py-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <s.icon className="h-3 w-3 text-muted-foreground/60" />
                            <span className="text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">{s.label}</span>
                          </div>
                          <p className="text-xs text-foreground">{s.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Platform accounts */}
                    {active.platforms.length > 0 && (
                      <div className="px-5 py-4">
                        <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground mb-3">平台帳號</p>
                        <div className="flex flex-wrap gap-2">
                          {active.platforms.map((p) => (
                            <span key={p} className="text-[0.6rem] uppercase tracking-wider border border-foreground/15 px-2 py-1 text-muted-foreground">
                              {p}
                              {active.platformAccounts[p] && (
                                <span className="ml-1.5 normal-case text-foreground/70">{active.platformAccounts[p]}</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground">
                        來源：{active.city}
                        <span className="mx-1.5 opacity-30">·</span>
                        申請日 {active.appliedDate || '—'}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decide(active.id, 'approve')}
                          disabled={actionLoadingId === active.id}
                          className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest px-3 py-2 bg-foreground text-background hover:bg-foreground/85 disabled:opacity-60 transition-colors duration-150"
                        >
                          <Check className="h-3 w-3" /> 通過
                        </button>
                        <button
                          onClick={() => decide(active.id, 'deny')}
                          disabled={actionLoadingId === active.id}
                          className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest px-3 py-2 border border-border text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-60 transition-colors duration-150"
                        >
                          <X className="h-3 w-3" /> 拒絕
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="border border-foreground/15 px-5 py-12 text-center"
            >
              <p className="text-sm text-muted-foreground">目前沒有待審核的 KOL 申請。</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
