'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/admin/_shared/StatusBadge'
import ModalPortal from '@/components/shared/ModalPortal'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
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

function KolRow({
  kol,
  onDeleted,
}: {
  kol: KolRecord
  onDeleted: (userId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    setDeleting(true); setDeleteError('')
    try {
      const res = await fetch(`/api/admin/kols/${kol.user_id}`, { method: 'DELETE' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setDeleteError(payload?.error ?? '刪除失敗，請稍後再試。'); return }
      onDeleted(kol.user_id)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '刪除失敗，請稍後再試。')
    } finally {
      setDeleting(false)
    }
  }

  const platformDisplay = kol.platforms.length > 0 ? kol.platforms.join(' / ') : '未填寫平台'

  return (
    <div className="border-b border-white/5 last:border-b-0">
      <div className="px-5 py-5 flex items-center gap-4">
        <div className="avatar h-10 w-10 flex items-center justify-center text-[12px] shrink-0 overflow-hidden">
          {kol.profile_photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={kol.profile_photo_url} alt={kol.full_name} className="h-full w-full object-cover" />
          ) : (
            <span className="font-heading italic text-white/80">{kol.full_name.trim().slice(0, 1) || 'K'}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[14px] text-white/90">{kol.full_name}</span>
          <p className="meta text-[10px] text-white/45 mt-1 truncate">
            {platformDisplay}
            {kol.follower_range && (<><span className="mx-1.5 opacity-40">·</span>{kol.follower_range} 粉絲</>)}
            {kol.content_type && (<><span className="mx-1.5 opacity-40">·</span>{kol.content_type}</>)}
          </p>
        </div>

        <div className="hidden md:flex items-center gap-6 shrink-0 mr-2">
          <div className="text-center">
            <p className="meta text-[9px] text-white/40">建案</p>
            <p className="font-heading italic text-[18px] text-white/90 mt-0.5">{safeNum(kol.propertyProjects)}</p>
          </div>
          <div className="text-center">
            <p className="meta text-[9px] text-white/40">商案</p>
            <p className="font-heading italic text-[18px] text-white/90 mt-0.5">{safeNum(kol.shopProjects)}</p>
          </div>
          <div className="text-center">
            <p className="meta text-[9px] text-white/40">轉換率</p>
            <p className="font-heading italic text-[18px] text-white/90 mt-0.5">{conversionRate(kol.totalClicks, kol.totalConversions)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {kol.username && (
            <Link
              href={`/kols/${kol.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 meta text-[10px] border border-white/15 px-3 py-1.5 text-white/70 hover:border-white/40 hover:text-white rounded-full transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              履歷
            </Link>
          )}
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 text-white/45 hover:text-red-300 transition-colors"
            aria-label="Delete user"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-white/50 hover:text-white transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <ModalPortal>
        <AnimatePresence>
          {deleteOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                onClick={() => { if (!deleting) setDeleteOpen(false) }}
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
                    <h3 className="font-heading italic text-[24px]">永久刪除 {kol.full_name}</h3>
                    <p className="mt-2 text-[13px] text-white/60 leading-relaxed">
                      此操作會永久刪除帳號、所有上傳的檔案以及所有相關紀錄。無法復原。
                    </p>
                  </div>
                  <button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting}
                    className="mt-0.5 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 disabled:opacity-40">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="meta text-[10px] text-white/40 mb-1">帳號</p>
                    <p className="text-[13px] text-white/85">{kol.full_name} · <span className="text-white/55">{kol.email}</span></p>
                  </div>
                  {deleteError && (
                    <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{deleteError}</div>
                  )}
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setDeleteOpen(false)} disabled={deleting}
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
      </ModalPortal>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 bg-white/[0.015]">
              {kol.bio && (
                <div className="px-8 pt-5 pb-4 space-y-1.5">
                  <p className="meta text-[10px] text-white/45">關於</p>
                  <p className="text-[13px] text-white/65 leading-[1.8] max-w-2xl">{kol.bio}</p>
                </div>
              )}

              {kol.platforms.length > 0 && (
                <div className={`px-8 flex flex-wrap gap-1.5 ${kol.bio ? 'pb-4' : 'pt-5 pb-4'}`}>
                  {kol.platforms.map((p) => (
                    <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] text-[12px] text-white/75 px-3 py-1">
                      <span className="meta text-[9px] text-white/45">{p}</span>
                      {kol.platform_accounts?.[p] && <span className="text-white/80">{kol.platform_accounts[p]}</span>}
                    </span>
                  ))}
                </div>
              )}

              <div className={`px-6 pb-7 grid grid-cols-2 md:grid-cols-4 gap-3 ${(kol.bio || kol.platforms.length > 0) ? 'pt-4 border-t border-white/5' : 'pt-7'}`}>
                {[
                  { label: '總合作建案', value: safeNum(kol.propertyProjects), sub: '住宅建案' },
                  { label: '總合作商案', value: safeNum(kol.shopProjects),     sub: '商業案場' },
                  { label: '粉絲人數',   value: kol.follower_range || '—',     sub: '' },
                  { label: '轉換率',     value: conversionRate(kol.totalClicks, kol.totalConversions), sub: `${safeNum(kol.totalClicks)} 次點擊` },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[16px] border border-white/10 bg-white/[0.02] px-4 py-3">
                    <p className="meta text-[9px] text-white/45 mb-3">{stat.label}</p>
                    <p className="font-heading italic text-[24px] text-white leading-none mb-2">{stat.value}</p>
                    {stat.sub && <p className="meta text-[9px] text-white/35">{stat.sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

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
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-8 text-white">

      <motion.section variants={fadeUp}>
        <div className="meta text-[10px] text-white/40 mb-4">管理後台</div>
        <h1 className="font-heading text-[40px] md:text-[56px] leading-[1] tracking-tight">
          KOL <span className="italic">名冊</span>
        </h1>
        <p className="mt-3 font-body text-sm text-white/55 max-w-xl">
          已通過審核的 KOL 完整檔案，包含平台帳號、合作統計與受眾輪廓。
        </p>
      </motion.section>

      <motion.div variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        {loading ? (
          <div className="h-6 w-32 bg-white/[0.06] rounded-full animate-pulse" />
        ) : kols.length > 0 ? (
          <StatusBadge variant="success">{kols.length} 位已核准</StatusBadge>
        ) : (
          <StatusBadge variant="neutral">尚無已核准 KOL</StatusBadge>
        )}
      </motion.div>

      {error && (
        <div className="liquid-glass !rounded-[18px] border-red-400/30 px-4 py-3 text-sm text-red-200">{error}</div>
      )}

      {!loading && categories.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`meta text-[10px] px-3 py-1.5 rounded-full border transition-colors duration-150 ${
              activeCategory === null
                ? 'border-white bg-white text-black'
                : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`meta text-[10px] px-3 py-1.5 rounded-full border transition-colors duration-150 ${
                activeCategory === cat
                  ? 'border-white bg-white text-black'
                  : 'border-white/15 text-white/60 hover:border-white/40 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeUp} className="liquid-glass !rounded-[22px] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-white/5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-32 bg-white/[0.07] rounded animate-pulse" />
                  <div className="h-2.5 w-48 bg-white/[0.05] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-14 text-center">
            <p className="font-body text-sm text-white/55">
              {activeCategory ? '此分類目前沒有 KOL。' : '目前沒有已通過審核的 KOL。'}
            </p>
          </div>
        ) : (
          filtered.map((kol) => (
            <KolRow
              key={kol.id}
              kol={kol}
              onDeleted={(userId) => setKols((prev) => prev.filter((k) => k.user_id !== userId))}
            />
          ))
        )}
      </motion.div>
    </motion.div>
  )
}
