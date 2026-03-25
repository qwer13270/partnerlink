'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar, CirclePlay, Mail, MapPin,
  MonitorPlay, Sparkles, Users,
} from 'lucide-react'

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type VideoItem = { url: string; title: string }
type KolRecord = {
  id: string; user_id: string; email: string; full_name: string
  platforms: string[]; platform_accounts?: Record<string, string>
  follower_range: string | null; content_type: string | null
  bio: string | null; city: string | null
  avg_views: string | null; engagement_rate: string | null
  profile_photo_url: string; photos: string[]; videos: VideoItem[]
  submitted_at: string | null; reviewed_at: string | null; created_at: string | null
}
type ApiPayload = { kols?: KolRecord[]; error?: string }

function formatDate(v: string | null) {
  if (!v) return '—'
  return v.slice(0, 10)
}
function initials(name: string) {
  return name.trim().slice(0, 1) || 'K'
}

export default function AdminKolsPage() {
  const [kols,     setKols]     = useState<KolRecord[]>([])
  const [activeId, setActiveId] = useState('')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    const controller = new AbortController()
    async function loadKols() {
      setLoading(true); setError('')
      try {
        const res     = await fetch('/api/admin/kols', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as ApiPayload | null
        if (!res.ok) { setError(payload?.error ?? '讀取 KOL 資料失敗。'); return }
        const next = payload?.kols ?? []
        setKols(next)
        setActiveId(next[0]?.id ?? '')
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : '讀取 KOL 資料失敗。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    loadKols()
    return () => controller.abort()
  }, [])

  const activeKol = kols.find((k) => k.id === activeId) ?? null

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">KOL 名冊</h1>
        <p className="text-sm text-muted-foreground mt-2">
          已通過審核的 KOL 完整檔案，包含平台帳號、受眾輪廓與作品素材。
        </p>
      </motion.div>

      {/* ── Count badge ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3">
        {loading ? (
          <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground border border-border px-2 py-1">
            讀取中…
          </span>
        ) : kols.length > 0 ? (
          <span className="text-xs uppercase tracking-[0.4em] text-foreground border border-foreground/30 px-2 py-1">
            {kols.length} 位已核准
          </span>
        ) : (
          <span className="text-xs uppercase tracking-[0.4em] text-muted-foreground border border-border px-2 py-1">
            尚無已核准 KOL
          </span>
        )}
      </motion.div>

      {/* ── Error ── */}
      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* ── Main layout ── */}
      {!loading && kols.length === 0 ? (
        <div className="border border-foreground/15 px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">目前沒有已通過審核的 KOL。</p>
        </div>
      ) : (
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="grid gap-5 xl:grid-cols-[300px_1fr] items-start"
        >

          {/* ── Sidebar ── */}
          <div className="border border-foreground/15">
            {/* List header */}
            <div className="px-4 py-3 border-b border-foreground/[0.08] flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">已核准名單</p>
              {!loading && <span className="text-xs text-muted-foreground">{kols.length} 位</span>}
            </div>

            <div className="max-h-[72vh] overflow-auto divide-y divide-foreground/[0.08]">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-4">
                      <div className="w-9 h-9 rounded-full shrink-0 animate-pulse bg-muted/50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-28 rounded animate-pulse bg-muted/50" />
                        <div className="h-2.5 w-20 rounded animate-pulse bg-muted/40" />
                      </div>
                    </div>
                  ))
                : kols.map((kol, i) => {
                    const active = kol.id === activeId
                    return (
                      <motion.button
                        key={kol.id}
                        custom={3 + i} initial="hidden" animate="visible" variants={fadeUp}
                        onClick={() => setActiveId(kol.id)}
                        className={`w-full text-left px-4 py-4 transition-colors duration-150 ${
                          active
                            ? 'bg-foreground text-background'
                            : 'hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden border ${
                            active ? 'border-background/20' : 'border-foreground/15'
                          }`}>
                            {kol.profile_photo_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={kol.profile_photo_url} alt={kol.full_name} className="h-full w-full object-cover" />
                            ) : (
                              <span className={`text-sm font-serif ${active ? 'text-background/70' : 'text-muted-foreground'}`}>
                                {initials(kol.full_name)}
                              </span>
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className={`text-sm truncate ${active ? 'text-background' : 'text-foreground'}`}>
                              {kol.full_name}
                            </p>
                            <p className={`text-xs truncate mt-0.5 ${active ? 'text-background/60' : 'text-muted-foreground'}`}>
                              {kol.platforms.length > 0 ? kol.platforms.join(' · ') : '未填寫平台'}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })
              }
            </div>
          </div>

          {/* ── Detail panel ── */}
          <AnimatePresence mode="wait">
            {activeKol && (
              <motion.div
                key={activeKol.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="border border-foreground/15 divide-y divide-foreground/[0.08]"
              >
                {/* Identity */}
                <div className="px-5 py-5">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="shrink-0 w-16 h-16 overflow-hidden border border-foreground/15 bg-muted/30 flex items-center justify-center">
                      {activeKol.profile_photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={activeKol.profile_photo_url} alt={activeKol.full_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl font-serif text-muted-foreground">{initials(activeKol.full_name)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h2 className="text-xl font-serif">{activeKol.full_name}</h2>
                          <p className="text-xs text-muted-foreground mt-0.5">{activeKol.email}</p>
                        </div>
                        {activeKol.content_type && (
                          <span className="text-xs font-mono text-muted-foreground border border-border px-1.5 py-0.5 shrink-0">
                            {activeKol.content_type}
                          </span>
                        )}
                      </div>

                      {/* Platforms */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {activeKol.platforms.map((p) => (
                          <span key={p} className="text-xs uppercase tracking-wider border border-foreground/15 px-2 py-1 text-muted-foreground">
                            {p}
                            {activeKol.platform_accounts?.[p] && (
                              <span className="ml-1.5 text-foreground/70">{activeKol.platform_accounts[p]}</span>
                            )}
                          </span>
                        ))}
                      </div>

                      {activeKol.bio && (
                        <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-xl">{activeKol.bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-foreground/[0.08]">
                  {[
                    { icon: Users,       label: '粉絲區間', value: activeKol.follower_range   || '—' },
                    { icon: MonitorPlay, label: '平均觀看', value: activeKol.avg_views         || '—' },
                    { icon: CirclePlay,  label: '互動率',   value: activeKol.engagement_rate  || '—' },
                    { icon: MapPin,      label: '城市',     value: activeKol.city             || '—' },
                    { icon: Sparkles,    label: '內容類型', value: activeKol.content_type      || '—' },
                    { icon: Mail,        label: 'Email',    value: activeKol.email               },
                    { icon: Calendar,    label: '送件日期', value: formatDate(activeKol.submitted_at) },
                    { icon: Calendar,    label: '核准日期', value: formatDate(activeKol.reviewed_at)  },
                  ].map((item) => (
                    <div key={item.label} className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <item.icon className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</span>
                      </div>
                      <p className="text-xs text-foreground break-all">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Photos */}
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">作品照片</p>
                    <span className="text-xs text-muted-foreground">{activeKol.photos.length} 張</span>
                  </div>
                  {activeKol.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                      {activeKol.photos.map((photo, i) => (
                        <div key={`${photo}-${i}`} className="group relative aspect-square overflow-hidden border border-foreground/10 bg-muted/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt={`${activeKol.full_name} ${i + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors duration-200" />
                          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                            <span className="text-xs uppercase tracking-[0.3em] text-white/80">Photo {i + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground border border-dashed border-foreground/15 py-8 text-center">
                      這位 KOL 目前沒有作品照片。
                    </p>
                  )}
                </div>

                {/* Videos */}
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">作品影片</p>
                    <span className="text-xs text-muted-foreground">{activeKol.videos.length} 部</span>
                  </div>
                  {activeKol.videos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                      {activeKol.videos.map((video, i) => (
                        <div key={`${video.url}-${i}`}
                          className="group relative aspect-square overflow-hidden border border-foreground/10 bg-[#1C2530]"
                          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E")' }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-[#2E4052]/60 via-[#1C2530] to-[#0F161C]" />
                          <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className="relative flex items-center justify-center">
                              <span className="absolute w-14 h-14 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-110 transition-all duration-500" />
                              <span className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm group-hover:bg-white/20 group-hover:border-white/50 transition-all duration-300">
                                <svg className="h-4 w-4 text-white fill-white translate-x-px" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </span>
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 z-[5]" />
                          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 z-20 bg-gradient-to-t from-black/90 to-transparent px-3 py-2">
                            <p className="truncate text-xs text-white/80">{video.title || `影片 ${i + 1}`}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground border border-dashed border-foreground/15 py-8 text-center">
                      這位 KOL 目前沒有作品影片。
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      )}
    </div>
  )
}
