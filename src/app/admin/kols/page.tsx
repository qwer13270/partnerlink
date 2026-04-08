'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink } from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type KolRecord = {
  id: string
  user_id: string
  email: string
  full_name: string
  username: string
  platforms: string[]
  platform_accounts?: Record<string, string>
  follower_range: string | null
  content_type: string | null
  bio: string | null
  city: string | null
  profile_photo_url: string
  reviewed_at: string | null
  activeProjects: number
  archivedProjects: number
  propertyProjects: number
  shopProjects: number
  totalClicks: number
  totalConversions: number
}
type ApiPayload = { kols?: KolRecord[]; error?: string }

function safeNum(v: unknown): number {
  const n = Number(v)
  return isFinite(n) ? n : 0
}

function conversionRate(clicks: unknown, conversions: unknown): string {
  const c = safeNum(clicks)
  const v = safeNum(conversions)
  if (c === 0) return '0%'
  const pct = (v / c) * 100
  return `${isFinite(pct) ? pct.toFixed(1) : '0.0'}%`
}

// ── KOL row ────────────────────────────────────────────────────────────────
function KolRow({ kol, index }: { kol: KolRecord; index: number }) {
  const [expanded, setExpanded] = useState(false)

  const platformDisplay = kol.platforms.length > 0
    ? kol.platforms.join(' / ')
    : '未填寫平台'

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.08] last:border-b-0"
    >
      {/* Main row */}
      <div className="px-5 py-5 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#b8936a] flex items-center justify-center shrink-0 text-white text-xs font-medium overflow-hidden border border-foreground/[0.08]">
          {kol.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={kol.profile_photo_url} alt={kol.full_name} className="h-full w-full object-cover" />
          ) : (
            kol.full_name.trim().slice(0, 1) || 'K'
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">{kol.full_name}</span>
          <p className="text-xs text-muted-foreground mt-0.5">
            {platformDisplay}
            {kol.follower_range && (
              <>
                <span className="mx-1.5 opacity-30">·</span>
                {kol.follower_range} 粉絲
              </>
            )}
            {kol.content_type && (
              <>
                <span className="mx-1.5 opacity-30">·</span>
                {kol.content_type}
              </>
            )}
          </p>
        </div>

        {/* Inline stats */}
        <div className="hidden md:flex items-center gap-5 shrink-0 mr-2">
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">建案</p>
            <p className="text-sm font-serif mt-0.5">{safeNum(kol.propertyProjects)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">商案</p>
            <p className="text-sm font-serif mt-0.5">{safeNum(kol.shopProjects)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">轉換率</p>
            <p className="text-sm font-serif mt-0.5">{conversionRate(kol.totalClicks, kol.totalConversions)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {kol.username && (
            <Link
              href={`/kols/${kol.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] border border-foreground/25 px-3 py-1.5 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
            >
              <ExternalLink className="h-3 w-3" />
              履歷
            </Link>
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
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-foreground/[0.06] bg-foreground/[0.015]">

              {/* Bio zone */}
              {kol.bio && (
                <div className="px-8 pt-5 pb-4 space-y-1.5">
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">關於</p>
                  <p className="text-sm text-foreground/60 leading-[1.8] max-w-2xl">{kol.bio}</p>
                </div>
              )}

              {/* Platform accounts */}
              {kol.platforms.length > 0 && (
                <div className={`px-8 flex flex-wrap gap-1.5 ${kol.bio ? 'pb-4' : 'pt-5 pb-4'}`}>
                  {kol.platforms.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] border border-foreground/[0.07] text-foreground/60 text-[0.72rem] font-medium px-3 py-1">
                      <span className="text-foreground/35 text-[0.65rem] uppercase tracking-[0.15em]">{p}</span>
                      {kol.platform_accounts?.[p] && (
                        <span className="text-foreground/55">{kol.platform_accounts[p]}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats zone */}
              <div className={`px-6 pb-7 grid grid-cols-4 gap-3 ${(kol.bio || kol.platforms.length > 0) ? 'pt-4 border-t border-foreground/[0.05]' : 'pt-7'}`}>

                {/* 總合作建案 */}
                <div className="rounded-lg border border-foreground/[0.08] bg-background px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground mb-3">總合作建案</p>
                  <p className="text-2xl font-serif text-foreground/80 leading-none mb-2.5">{safeNum(kol.propertyProjects)}</p>
                  <p className="text-[0.62rem] text-foreground/30">住宅建案</p>
                </div>

                {/* 總合作商案 */}
                <div className="rounded-lg border border-foreground/[0.08] bg-background px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground mb-3">總合作商案</p>
                  <p className="text-2xl font-serif text-foreground/80 leading-none mb-2.5">{safeNum(kol.shopProjects)}</p>
                  <p className="text-[0.62rem] text-foreground/30">商業案場</p>
                </div>

                {/* 粉絲人數 */}
                <div className="rounded-lg border border-foreground/[0.08] bg-background px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground mb-3">粉絲人數</p>
                  <p className="text-2xl font-serif text-foreground/80 leading-none">{kol.follower_range || '—'}</p>
                </div>

                {/* 轉換率 */}
                <div className="rounded-lg border border-foreground/[0.08] bg-background px-4 py-3">
                  <p className="text-[0.62rem] uppercase tracking-[0.28em] text-muted-foreground mb-3">轉換率</p>
                  <p className="text-2xl font-serif text-foreground/80 leading-none mb-1.5">{conversionRate(kol.totalClicks, kol.totalConversions)}</p>
                  <p className="text-[0.62rem] text-foreground/30 font-mono">{safeNum(kol.totalClicks)} 次點擊</p>
                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminKolsPage() {
  const [kols,    setKols]    = useState<KolRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true); setError('')
      try {
        const res     = await fetch('/api/admin/kols', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as ApiPayload | null
        if (!res.ok) { setError(payload?.error ?? '讀取 KOL 資料失敗。'); return }
        setKols(payload?.kols ?? [])
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : '讀取 KOL 資料失敗。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(kols.map((k) => k.content_type).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, 'zh-Hant')),
    [kols],
  )

  const filtered = useMemo(
    () => activeCategory ? kols.filter((k) => k.content_type === activeCategory) : kols,
    [kols, activeCategory],
  )

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">KOL 名冊</h1>
        <p className="text-sm text-muted-foreground mt-2">
          已通過審核的 KOL 完整檔案，包含平台帳號、合作統計與受眾輪廓。
        </p>
      </motion.div>

      {/* Summary badge */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        {loading ? (
          <div className="h-6 w-32 bg-foreground/[0.06] rounded animate-pulse" />
        ) : kols.length > 0 ? (
          <span className="text-xs uppercase tracking-[0.4em] border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
            {kols.length} 位已核准
          </span>
        ) : (
          <span className="text-xs uppercase tracking-[0.4em] border border-foreground/15 px-2 py-1 text-muted-foreground">
            尚無已核准 KOL
          </span>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Category filter */}
      {!loading && categories.length > 0 && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-2">
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
      )}

      {/* KOL list */}
      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="divide-y divide-foreground/[0.08]">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-5 flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-foreground/[0.07] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-foreground/[0.07] rounded animate-pulse" />
                  <div className="h-2.5 w-48 bg-foreground/[0.05] rounded animate-pulse" />
                </div>
                <div className="hidden md:flex gap-5">
                  <div className="h-3 w-12 bg-foreground/[0.05] rounded animate-pulse" />
                  <div className="h-3 w-12 bg-foreground/[0.05] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-muted-foreground/50">
            {activeCategory ? '此分類目前沒有 KOL。' : '目前沒有已通過審核的 KOL。'}
          </div>
        ) : (
          filtered.map((kol, i) => (
            <KolRow key={kol.id} kol={kol} index={4 + i} />
          ))
        )}
      </motion.div>

    </div>
  )
}
