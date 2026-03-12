'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  CirclePlay,
  Mail,
  MapPin,
  MonitorPlay,
  PanelsTopLeft,
  Sparkles,
  Users,
} from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type VideoItem = {
  url: string
  title: string
}

type KolRecord = {
  id: string
  user_id: string
  email: string
  full_name: string
  platforms: string[]
  platform_accounts?: Record<string, string>
  follower_range: string | null
  content_type: string | null
  bio: string | null
  city: string | null
  avg_views: string | null
  engagement_rate: string | null
  profile_photo_url: string
  photos: string[]
  videos: VideoItem[]
  submitted_at: string | null
  reviewed_at: string | null
  created_at: string | null
}

type ApiPayload = {
  kols?: KolRecord[]
  error?: string
}

function formatDate(value: string | null) {
  if (!value) return '未記錄'
  return value.slice(0, 10)
}

function initials(name: string) {
  return name.trim().slice(0, 1) || 'K'
}

export default function AdminKolsPage() {
  const [kols, setKols] = useState<KolRecord[]>([])
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function loadKols() {
      setLoading(true)
      setError('')

      try {
        const response = await fetch('/api/admin/kols', {
          method: 'GET',
          signal: controller.signal,
        })

        const payload = (await response.json().catch(() => null)) as ApiPayload | null
        if (!response.ok) {
          setError(payload?.error ?? '讀取 KOL 資料失敗。')
          return
        }

        const next = payload?.kols ?? []
        setKols(next)
        setActiveId(next[0]?.id ?? '')
      } catch (caughtError) {
        if (!controller.signal.aborted) {
          setError(caughtError instanceof Error ? caughtError.message : '讀取 KOL 資料失敗。')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadKols()

    return () => controller.abort()
  }, [])

  const activeKol = kols.find((kol) => kol.id === activeId) ?? null

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="relative overflow-hidden border border-[#D9CCBA] bg-[linear-gradient(135deg,#f7f0e6_0%,#fdfbf7_55%,#efe2cf_100%)] p-6 lg:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 opacity-40" style={{ background: 'radial-gradient(circle at top right, rgba(188,146,76,0.32), transparent 60%)' }} />
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-3xl">
              <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[#876335] mb-2">Approved KOL Index</p>
              <h1 className="text-3xl lg:text-4xl font-serif text-[#24180D]">KOL 名冊與完整檔案</h1>
              <p className="text-sm text-[#67533B] mt-3 leading-relaxed">
                只顯示已通過審核的 KOL。左側快速切換名單，右側集中查看頭像、平台、受眾輪廓、短描述與作品素材。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 min-w-[220px]">
              <div className="border border-[#D9CCBA] bg-white/75 px-3 py-3">
                <p className="text-[0.58rem] uppercase tracking-[0.22em] text-[#8B724B]">已核准</p>
                <p className="text-2xl font-serif text-[#24180D] mt-1">{kols.length}</p>
              </div>
              <div className="border border-[#D9CCBA] bg-white/75 px-3 py-3">
                <p className="text-[0.58rem] uppercase tracking-[0.22em] text-[#8B724B]">含作品集</p>
                <p className="text-2xl font-serif text-[#24180D] mt-1">
                  {kols.filter((kol) => kol.photos.length > 0 || kol.videos.length > 0).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {error && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="border border-foreground/15 bg-[#FCFBF8] px-6 py-16 text-center text-sm text-muted-foreground">
          讀取 KOL 名冊中…
        </div>
      ) : kols.length === 0 ? (
        <div className="border border-foreground/15 bg-[#FCFBF8] px-6 py-16 text-center text-sm text-muted-foreground">
          目前沒有已通過審核的 KOL。
        </div>
      ) : (
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="grid gap-5 xl:grid-cols-[360px_1fr]"
        >
          <section className="border border-[#1A1A1A]/12 bg-[#FCFBF8]">
            <div className="px-4 py-3 border-b border-[#1A1A1A]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PanelsTopLeft className="h-4 w-4 text-[#7A5A2F]" />
                <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[#4E3A20]">已核准名單</p>
              </div>
              <span className="text-[0.62rem] text-[#786650]">{kols.length} 位</span>
            </div>

            <div className="max-h-[74vh] overflow-auto divide-y divide-[#1A1A1A]/8">
              {kols.map((kol, index) => {
                const active = kol.id === activeId
                return (
                  <motion.button
                    key={kol.id}
                    custom={2 + index}
                    initial="hidden"
                    animate="visible"
                    variants={fadeUp}
                    onClick={() => setActiveId(kol.id)}
                    className={`w-full text-left px-4 py-4 transition-colors ${
                      active ? 'bg-[#21170F] text-[#FCF7EF]' : 'hover:bg-[#F3EEE6]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full overflow-hidden border border-[#D9CCBA] bg-[#E8DDCE] shrink-0">
                        {kol.profile_photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={kol.profile_photo_url} alt={kol.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <span className={`text-sm font-serif ${active ? 'text-[#F3DFC0]' : 'text-[#6D5538]'}`}>
                            {initials(kol.full_name)}
                          </span>
                        )}
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm font-medium truncate ${active ? 'text-[#FCF7EF]' : 'text-[#24180D]'}`}>
                            {kol.full_name}
                          </p>
                          <span className={`text-[0.58rem] uppercase tracking-[0.18em] border px-1.5 py-0.5 ${
                            active ? 'border-[#F3DFC0]/30 text-[#E8D4B3]' : 'border-[#D9CCBA] text-[#7B664A]'
                          }`}>
                            {kol.content_type || '未分類'}
                          </span>
                        </div>
                        <p className={`text-[0.68rem] mt-1 ${active ? 'text-[#DDCCB2]' : 'text-[#6B5945]'}`}>
                          {kol.platforms.length > 0 ? kol.platforms.join(' / ') : '未填寫平台'}
                        </p>
                        <p className={`text-[0.68rem] mt-2 ${active ? 'text-[#B9A487]' : 'text-[#8A7761]'}`}>
                          {kol.follower_range || '未填粉絲數'} · 核准於 {formatDate(kol.reviewed_at)}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          </section>

          {activeKol && (
            <AnimatePresence mode="wait">
              <motion.section
                key={activeKol.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="border border-[#1A1A1A]/12 bg-white"
              >
                <div className="border-b border-[#1A1A1A]/10 bg-[#F8F4EE] p-5 lg:p-6">
                  <div className="grid gap-6 lg:grid-cols-[160px_1fr]">
                    <div className="flex flex-col items-center lg:items-start">
                      <div className="h-32 w-32 rounded-full overflow-hidden border border-[#D8CCBD] bg-[#EFE6DA]">
                        {activeKol.profile_photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={activeKol.profile_photo_url} alt={activeKol.full_name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-4xl font-serif text-[#6F5A3E]">
                            {initials(activeKol.full_name)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-[0.64rem] uppercase tracking-[0.24em] text-[#8A6739] mb-2">KOL dossier</p>
                      <h2 className="text-3xl font-serif text-[#24180D]">{activeKol.full_name}</h2>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activeKol.platforms.map((platform) => (
                          <span key={platform} className="border border-[#D9CCBA] bg-white px-2 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-[#705A3C]">
                            {platform}
                          </span>
                        ))}
                      </div>
                      {activeKol.platforms.length > 0 && (
                        <div className="mt-4 grid gap-2 sm:grid-cols-2">
                          {activeKol.platforms.map((platform) => (
                            <div key={platform} className="border border-[#D9CCBA] bg-white px-3 py-2">
                              <p className="text-[0.58rem] uppercase tracking-[0.18em] text-[#8A6739]">{platform}</p>
                              <p className="text-sm text-[#24180D] mt-1 break-all">
                                {activeKol.platform_accounts?.[platform] || '未填寫'}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-[#67533B] mt-4 leading-relaxed">
                        {activeKol.bio || '尚未填寫短描述。'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { icon: Users, label: '粉絲區間', value: activeKol.follower_range || '未填寫' },
                      { icon: Sparkles, label: '內容類型', value: activeKol.content_type || '未分類' },
                      { icon: MonitorPlay, label: '平均觀看', value: activeKol.avg_views || '未填寫' },
                      { icon: Mail, label: 'Email', value: activeKol.email },
                      { icon: MapPin, label: '城市', value: activeKol.city || '未填寫' },
                      { icon: CirclePlay, label: '互動率', value: activeKol.engagement_rate || '未填寫' },
                      { icon: Calendar, label: '送件日期', value: formatDate(activeKol.submitted_at) },
                      { icon: Calendar, label: '核准日期', value: formatDate(activeKol.reviewed_at) },
                    ].map((item) => (
                      <div key={item.label} className="border border-[#D9CCBA] bg-white px-3 py-3">
                        <div className="flex items-center gap-2 text-[#8A6739] mb-1.5">
                          <item.icon className="h-3.5 w-3.5" />
                          <span className="text-[0.58rem] uppercase tracking-[0.2em]">{item.label}</span>
                        </div>
                        <p className="text-sm text-[#24180D] break-words">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 lg:p-6 space-y-8">
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#765F3D]">作品照片</p>
                      <p className="text-xs text-[#8C7A65]">{activeKol.photos.length} 張</p>
                    </div>
                    {activeKol.photos.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                        {activeKol.photos.map((photo, index) => (
                          <div key={`${photo}-${index}`} className="relative aspect-[4/3] overflow-hidden border border-[#D8CCBD] bg-[#EFE5D9]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo} alt={`${activeKol.full_name} portfolio ${index + 1}`} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/45 to-transparent p-2">
                              <span className="text-[0.58rem] uppercase tracking-[0.18em] text-white/90">Photo {index + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#D8CCBD] p-5 text-sm text-[#8A7761]">
                        這位 KOL 目前沒有額外作品照片。
                      </div>
                    )}
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#765F3D]">作品影片</p>
                      <p className="text-xs text-[#8C7A65]">{activeKol.videos.length} 部</p>
                    </div>
                    {activeKol.videos.length > 0 ? (
                      <div className="grid gap-3 xl:grid-cols-2">
                        {activeKol.videos.map((video, index) => (
                          <div key={`${video.url}-${index}`} className="border border-[#D8CCBD] bg-[#FCFAF7] overflow-hidden">
                            <video controls preload="metadata" className="w-full aspect-video bg-black/85">
                              <source src={video.url} type="video/mp4" />
                            </video>
                            <div className="px-3 py-2.5 border-t border-[#E8DFD4]">
                              <p className="text-sm text-[#24180D]">{video.title}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="border border-dashed border-[#D8CCBD] p-5 text-sm text-[#8A7761]">
                        這位 KOL 目前沒有作品影片。
                      </div>
                    )}
                  </section>
                </div>
              </motion.section>
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </div>
  )
}
