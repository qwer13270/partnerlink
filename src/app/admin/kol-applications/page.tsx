'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BadgeCheck, Calendar, Check, CirclePlay, Images, Sparkles, Users, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

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
  city: string
  avgViews: string
  engagementRate: string
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
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function asPlatformAccounts(value: unknown) {
  if (!value || typeof value !== 'object') return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, entry]) => typeof entry === 'string' && entry.trim().length > 0)
      .map(([platform, entry]) => [platform, String(entry).trim()]),
  )
}

function toViewModel(row: ApiApplication): Application {
  const date = row.submitted_at ? row.submitted_at.slice(0, 10) : ''
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
    appliedDate: date,
    city: row.city || '未填寫',
    avgViews: row.avg_views || '未填寫',
    engagementRate: row.engagement_rate || '未填寫',
  }
}

export default function AdminKolApplicationsPage() {
  const [items, setItems] = useState<Application[]>([])
  const [activeId, setActiveId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [actionError, setActionError] = useState('')

  const active = useMemo(
    () => items.find((a) => a.id === activeId) ?? null,
    [items, activeId],
  )

  useEffect(() => {
    const controller = new AbortController()

    async function loadApplications() {
      setLoading(true)
      setLoadError('')

      try {
        const response = await fetch('/api/admin/kol-applications', {
          method: 'GET',
          signal: controller.signal,
        })

        const payload = (await response.json().catch(() => null)) as
          | { applications?: ApiApplication[]; error?: string }
          | null

        if (!response.ok) {
          setLoadError(payload?.error ?? '讀取申請資料失敗。')
          return
        }

        const next = (payload?.applications ?? []).map(toViewModel)
        setItems(next)
        setActiveId(next[0]?.id ?? '')
      } catch (error) {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : '讀取申請資料失敗。')
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
      const response = await fetch(`/api/admin/kol-applications/${id}/${decision}`, {
        method: 'POST',
      })

      const payload = (await response.json().catch(() => null)) as { error?: string } | null
      if (!response.ok) {
        setActionError(payload?.error ?? '審核操作失敗，請稍後再試。')
        return
      }

      setItems((prev) => {
        const next = prev.filter((item) => item.id !== id)
        if (id === activeId) setActiveId(next[0]?.id ?? '')
        return next
      })
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '審核操作失敗，請稍後再試。')
    } finally {
      setActionLoadingId('')
    }
  }

  return (
    <div className="space-y-8">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="relative overflow-hidden border border-[#D4C7B8] bg-gradient-to-br from-[#FAF6F1] via-[#F7EFE5] to-[#EFE2D2] p-6 lg:p-8">
          <div
            className="pointer-events-none absolute -top-24 right-0 h-64 w-64 opacity-50"
            style={{
              background:
                'radial-gradient(circle at center, rgba(196,145,58,0.28) 0%, rgba(196,145,58,0) 70%)',
            }}
          />
          <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[0.62rem] uppercase tracking-[0.35em] text-[#81663B] mb-2">KOL Review Desk</p>
              <h1 className="text-3xl lg:text-4xl font-serif text-[#2C2014]">KOL 申請審核中心</h1>
              <p className="text-sm text-[#5E4C36] mt-3 max-w-2xl leading-relaxed">
                以頭像、平台資訊與受眾輪廓快速判斷是否通過。左側先篩申請，右側完整檢視申請資料，再直接通過或拒絕。
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/75 border border-[#D6C8B5] px-3 py-2">
              <Sparkles className="h-3.5 w-3.5 text-[#8A6225]" />
              <span className="text-[0.65rem] uppercase tracking-[0.22em] text-[#694C22]">
                {items.length} 筆待審核
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {loadError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      {actionError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="border border-[#1A1A1A]/15 bg-[#FCFBF8] px-5 py-16 text-center">
          <p className="text-sm text-muted-foreground">讀取申請資料中…</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div
              key="review-layout"
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="grid gap-5 lg:grid-cols-[360px_1fr]"
            >
              <div className="border border-[#1A1A1A]/15 bg-[#FCFBF8]">
                <div className="px-4 py-3 border-b border-[#1A1A1A]/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-[#7A5926]" />
                    <p className="text-[0.65rem] uppercase tracking-[0.22em] text-[#4D3D26]">申請清單</p>
                  </div>
                  <span className="text-[0.62rem] text-[#7A6954]">{items.length} 件</span>
                </div>
                <div className="divide-y divide-[#1A1A1A]/8 max-h-[70vh] overflow-auto">
                  {items.map((app, i) => {
                    const isActive = app.id === activeId
                    return (
                      <motion.button
                        key={app.id}
                        custom={2 + i}
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        onClick={() => setActiveId(app.id)}
                        className={`w-full text-left p-4 transition-all duration-200 ${
                          isActive
                            ? 'bg-[#1E1A16] text-[#FAF7F1]'
                            : 'bg-transparent hover:bg-[#F2ECE3]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full overflow-hidden bg-[#2A2118]/10 border border-[#D8CCBC] shrink-0">
                              {app.profilePhotoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={app.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className={`text-[0.6rem] ${isActive ? 'text-[#E9D6B8]' : 'text-[#6D5A44]'}`}>{app.name.slice(0, 1)}</span>
                              )}
                            </span>
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-[#FAF7F1]' : 'text-[#1D1711]'}`}>{app.name}</p>
                          </div>
                          <span
                            className={`text-[0.6rem] uppercase tracking-[0.2em] border px-1.5 py-0.5 ${
                              isActive
                                ? 'border-[#F5E6CD]/40 text-[#EED8B7]'
                                : 'border-[#D9CCBB] text-[#7E6A50]'
                            }`}
                          >
                            {app.category}
                          </span>
                        </div>
                        <p className={`text-[0.68rem] ${isActive ? 'text-[#E3D3BB]' : 'text-[#6D5A44]'}`}>
                          {app.followers} 粉絲
                          <span className="mx-1.5 opacity-45">·</span>
                          {app.platforms.length > 0 ? app.platforms.join(' / ') : '未填寫平台'}
                        </p>
                        <div className={`mt-3 text-[0.65rem] flex items-center gap-1.5 ${isActive ? 'text-[#BCA98B]' : 'text-[#8A7861]'}`}>
                          <Calendar className="h-3 w-3" />
                          申請日 {app.appliedDate || '未填寫'}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {active && (
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="border border-[#1A1A1A]/15 bg-white"
                >
                  <div className="border-b border-[#1A1A1A]/10 bg-[#F8F4EE] p-5 lg:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.64rem] uppercase tracking-[0.24em] text-[#876B42] mb-2">Application Dossier</p>
                        <h2 className="text-2xl font-serif text-[#241A0F]">{active.name}</h2>
                        <p className="text-xs text-[#7B694E] mt-1">{active.email}</p>
                        <p className="text-sm text-[#6E5B45] mt-2 leading-relaxed max-w-3xl">{active.bio}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      {[
                        { icon: Users, label: '粉絲數', value: active.followers },
                        { icon: Sparkles, label: '主題', value: active.category },
                        { icon: Images, label: '平均觀看', value: active.avgViews },
                        { icon: CirclePlay, label: '互動率', value: active.engagementRate },
                      ].map((stat) => (
                        <div key={stat.label} className="border border-[#DCCDBA] bg-white px-3 py-2.5">
                          <div className="flex items-center gap-2 text-[#876B42] mb-1">
                            <stat.icon className="h-3.5 w-3.5" />
                            <span className="text-[0.6rem] uppercase tracking-[0.2em]">{stat.label}</span>
                          </div>
                          <p className="text-sm text-[#2B2115]">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    {active.platforms.length > 0 && (
                      <div className="mt-4 border border-[#DCCDBA] bg-white p-3">
                        <p className="text-[0.58rem] uppercase tracking-[0.2em] text-[#876B42] mb-2">平台帳號</p>
                        <div className="grid gap-2 md:grid-cols-2">
                          {active.platforms.map((platform) => (
                            <div key={platform} className="text-sm text-[#2B2115]">
                              <span className="text-[#876B42] mr-2">{platform}</span>
                              <span>{active.platformAccounts[platform] || '未填寫'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="sticky bottom-0 border-t border-[#1A1A1A]/10 bg-[#FAF6F1] px-5 lg:px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-[#705C41]">
                        來源：{active.city} · 平台：{active.platforms.length > 0 ? active.platforms.join(' / ') : '未填寫'}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => decide(active.id, 'approve')}
                          disabled={actionLoadingId === active.id}
                          className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.2em] px-3.5 py-2.5 bg-[#231B13] text-[#F8F3EB] hover:bg-[#302418] disabled:opacity-70 transition-colors duration-150"
                        >
                          <Check className="h-3.5 w-3.5" /> 通過申請
                        </button>
                        <button
                          onClick={() => decide(active.id, 'deny')}
                          disabled={actionLoadingId === active.id}
                          className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.2em] px-3.5 py-2.5 border border-[#BFAE98] text-[#66543D] hover:border-[#8F7A5D] hover:text-[#3E3020] disabled:opacity-70 transition-colors duration-150"
                        >
                          <X className="h-3.5 w-3.5" /> 拒絕申請
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border border-[#1A1A1A]/15 bg-[#FCFBF8] px-5 py-16 text-center"
            >
              <p className="text-sm text-muted-foreground">目前沒有待審核的 KOL 申請。</p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
