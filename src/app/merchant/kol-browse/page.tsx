'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ChevronDown } from 'lucide-react'
import { mockInviteProjects } from '@/data'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type Tier = 'platinum' | 'gold' | 'silver' | 'bronze'

const TIER_CFG: Record<Tier, { label: string; color: string }> = {
  platinum: { label: 'Platinum', color: 'text-purple-700 border-purple-200 bg-purple-50'  },
  gold:     { label: 'Gold',     color: 'text-amber-700 border-amber-200 bg-amber-50'     },
  silver:   { label: 'Silver',   color: 'text-zinc-500 border-zinc-200 bg-zinc-50'        },
  bronze:   { label: 'Bronze',   color: 'text-orange-800 border-orange-200 bg-orange-50'  },
}

type Kol = {
  id: string
  name: string
  platform: string
  followers: string
  category: string
  tier: Tier
  avgViews: string
  engagementRate: string
  city: string
  bio: string
  profilePhotoUrl: string
}

type ApiKol = {
  id: string
  full_name: string
  platforms: unknown
  follower_range: string | null
  content_type: string | null
  bio: string | null
  city: string | null
  avg_views: string | null
  engagement_rate: string | null
  profile_photo_url?: string
}

type ApiPayload = {
  kols?: ApiKol[]
  error?: string
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function parseFollowerCount(followerRange: string | null): number {
  if (!followerRange) return 0
  const normalized = followerRange.toLowerCase().replace(/,/g, '')
  const manMatch = normalized.match(/([\d.]+)\s*萬/)
  if (manMatch) return parseFloat(manMatch[1]) * 10000
  const kMatch = normalized.match(/([\d.]+)\s*k/)
  if (kMatch) return parseFloat(kMatch[1]) * 1000
  const numMatch = normalized.match(/([\d.]+)/)
  if (numMatch) return parseFloat(numMatch[1])
  return 0
}

function inferTier(followerRange: string | null): Tier {
  const count = parseFollowerCount(followerRange)
  if (count >= 100000) return 'platinum'
  if (count >= 50000)  return 'gold'
  if (count >= 10000)  return 'silver'
  return 'bronze'
}

function toViewModel(item: ApiKol): Kol {
  const platforms = asStringArray(item.platforms)

  return {
    id: item.id,
    name: item.full_name || '未命名 KOL',
    platform: platforms.length > 0 ? platforms.join(' / ') : '未填寫平台',
    followers: item.follower_range || '未填寫',
    category: item.content_type || '未分類',
    tier: inferTier(item.follower_range),
    avgViews: item.avg_views || '未填寫',
    engagementRate: item.engagement_rate || '未填寫',
    city: item.city || '未填寫',
    bio: item.bio || '尚未提供自我介紹。',
    profilePhotoUrl: typeof item.profile_photo_url === 'string' ? item.profile_photo_url : '',
  }
}

// ── Invite modal ───────────────────────────────────────────────────────────
function InviteModal({
  kol,
  onClose,
  onConfirm,
}: {
  kol: Kol
  onClose: () => void
  onConfirm: (projectId: string) => void
}) {
  const [selectedProject, setSelectedProject] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-background border border-foreground/15 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-foreground/[0.08]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">邀請合作</p>
            <p className="text-base font-medium">{kol.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kol.platform} · {kol.followers} 粉絲</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Project selection */}
        <div className="px-6 py-5">
          <p className="text-xs text-muted-foreground mb-3">選擇要邀請此 KOL 合作的商案：</p>
          <div className="space-y-2">
            {mockInviteProjects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left px-4 py-3 border text-sm transition-colors duration-150 flex items-center justify-between ${
                  selectedProject === p.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground/20 hover:border-foreground/50'
                }`}
              >
                {p.name}
                {selectedProject === p.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={() => selectedProject && onConfirm(selectedProject)}
            disabled={!selectedProject}
            className="flex-1 py-2.5 text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            送出邀請
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs uppercase tracking-widest border border-foreground/20 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
          >
            取消
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── KOL row ────────────────────────────────────────────────────────────────
function KolRow({
  kol,
  index,
  invited,
  onInvite,
}: {
  kol: Kol
  index: number
  invited: boolean
  onInvite: (kol: Kol) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_CFG[kol.tier]

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.08] last:border-b-0"
    >
      {/* Main row */}
      <div className="px-5 py-5 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#b8936a] flex items-center justify-center shrink-0 text-white text-xs font-medium overflow-hidden">
          {kol.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={kol.profilePhotoUrl} alt={kol.name} className="h-full w-full object-cover" />
          ) : (
            kol.name[0]
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{kol.name}</span>
            <span className={`text-xs uppercase tracking-widest px-1.5 py-px border ${tier.color}`}>
              {tier.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {kol.platform}
            <span className="mx-1.5 opacity-30">·</span>
            {kol.followers} 粉絲
            <span className="mx-1.5 opacity-30">·</span>
            {kol.category}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5 shrink-0 mr-2">
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">互動率</p>
            <p className="text-sm font-serif mt-0.5">{kol.engagementRate}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">平均觀看</p>
            <p className="text-sm font-serif mt-0.5">{kol.avgViews}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {invited ? (
            <span className="text-xs uppercase tracking-widest text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 flex items-center gap-1">
              <Check className="h-3 w-3" /> 已邀請
            </span>
          ) : (
            <button
              onClick={() => onInvite(kol)}
              className="text-xs uppercase tracking-widest border border-foreground px-3 py-1.5 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
            >
              邀請合作
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-foreground/[0.06] bg-muted/20">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{kol.bio}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: '平均觀看', value: kol.avgViews },
                  { label: '互動率', value: kol.engagementRate },
                  { label: '所在城市', value: kol.city },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-background px-3 py-2.5 text-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.label}</p>
                    <p className="text-base font-serif mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MerchantKolBrowsePage() {
  const [kols, setKols] = useState<Kol[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [invitingKol, setInvitingKol] = useState<Kol | null>(null)
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController()

    async function loadKols() {
      setLoading(true)
      setLoadError('')

      try {
        const res = await fetch('/api/merchant/kols', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as ApiPayload | null

        if (!res.ok) {
          setLoadError(payload?.error ?? '讀取 KOL 資料失敗。')
          return
        }

        setKols((payload?.kols ?? []).map(toViewModel))
      } catch (error) {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : '讀取 KOL 資料失敗。')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadKols()
    return () => controller.abort()
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(kols.map((kol) => kol.category))).sort((a, b) => a.localeCompare(b, 'zh-Hant')),
    [kols],
  )

  const filtered = useMemo(
    () => (activeCategory ? kols.filter((kol) => kol.category === activeCategory) : kols),
    [activeCategory, kols],
  )

  const handleConfirm = (projectId: string) => {
    if (!invitingKol) return
    // TODO: POST /api/merchant/invitations when backend is ready
    console.log('[invite] kolId:', invitingKol.id, 'projectId:', projectId)
    setInvitedIds((prev) => new Set(prev).add(invitingKol.id))
    setInvitingKol(null)
  }

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">探索 KOL</h1>
        <p className="text-sm text-muted-foreground mt-2">
          瀏覽平台上所有已核准的 KOL，主動邀請合適的創作者加入您的商案推廣。
        </p>
      </motion.div>

      {/* ── Category filter ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-xs uppercase tracking-[0.3em] px-3 py-1.5 border transition-colors duration-150 ${
            activeCategory === null
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-xs uppercase tracking-[0.3em] px-3 py-1.5 border transition-colors duration-150 ${
              activeCategory === cat
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {loadError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {/* ── KOL list ── */}
      <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden">
        {loading ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">讀取 KOL 資料中…</p>
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((kol, i) => (
            <KolRow
              key={kol.id}
              kol={kol}
              index={2 + i}
              invited={invitedIds.has(kol.id)}
              onInvite={setInvitingKol}
            />
          ))
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {activeCategory ? '此分類目前沒有 KOL。' : '目前沒有已核准的 KOL。'}
            </p>
          </div>
        )}
      </div>

      {/* ── Invite modal ── */}
      <AnimatePresence>
        {invitingKol && (
          <InviteModal
            kol={invitingKol}
            onClose={() => setInvitingKol(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
