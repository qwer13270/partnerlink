'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ChevronDown, ExternalLink, Banknote, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type Kol = {
  id: string          // application id
  kolUserId: string   // auth user id — used for collaboration_requests
  name: string
  username: string
  platform: string
  followers: string
  category: string
  avgViews: string
  engagementRate: string
  city: string
  bio: string
  profilePhotoUrl: string
  collabFee: number | null
}

// ── Fee helpers ─────────────────────────────────────────────────────────────
function formatFee(fee: number | null): string {
  if (fee === null) return '–'
  if (fee >= 10000) return `NT$${fee % 10000 === 0 ? fee / 10000 : (fee / 10000).toFixed(1)}萬`
  return `NT$${fee.toLocaleString()}`
}

type FeeRange = 'all' | 'under5k' | '5k-20k' | '20k-50k' | 'over50k'
const FEE_RANGES: { id: FeeRange; label: string; min: number; max: number }[] = [
  { id: 'all',     label: '全部費用',   min: 0,     max: Infinity },
  { id: 'under5k', label: '$5K 以下',   min: 0,     max: 5000    },
  { id: '5k-20k',  label: '$5K–$20K',  min: 5000,  max: 20000   },
  { id: '20k-50k', label: '$20K–$50K', min: 20000, max: 50000   },
  { id: 'over50k', label: '$50K 以上',  min: 50000, max: Infinity },
]

type ApiKol = {
  id: string
  kol_user_id?: string
  full_name: string
  username?: string
  platforms: unknown
  follower_range: string | null
  content_type: string | null
  bio: string | null
  city: string | null
  avg_views: string | null
  engagement_rate: string | null
  collab_fee: number | null
  profile_photo_url?: string
}

type Project = {
  id: string
  name: string
  type: string
}

type ItemInput = { item_name: string; quantity: string; estimated_value: string }

type ApiPayload = {
  kols?: ApiKol[]
  error?: string
}

type RequestsPayload = {
  requests?: { kol_user_id: string; project_id: string; status: string }[]
}

type ProjectsPayload = {
  projects?: { id: string; name: string; type?: string }[]
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function toViewModel(item: ApiKol): Kol {
  const platforms = asStringArray(item.platforms)
  return {
    id:             item.id,
    kolUserId:      item.kol_user_id ?? '',
    name:           item.full_name || '未命名 KOL',
    username:       item.username || '',
    platform:       platforms.length > 0 ? platforms.join(' / ') : '未填寫平台',
    followers:      item.follower_range || '未填寫',
    category:       item.content_type || '未分類',
    avgViews:       item.avg_views || '未填寫',
    engagementRate: item.engagement_rate || '未填寫',
    city:           item.city || '未填寫',
    bio:            item.bio || '尚未提供自我介紹。',
    profilePhotoUrl: typeof item.profile_photo_url === 'string' ? item.profile_photo_url : '',
    collabFee: item.collab_fee,
  }
}

// Stable key for a merchant-sent invite: kolUserId + projectId
function inviteKey(kolUserId: string, projectId: string) {
  return `${kolUserId}:${projectId}`
}

// ── Invite modal ───────────────────────────────────────────────────────────
const EMPTY_ITEM: ItemInput = { item_name: '', quantity: '1', estimated_value: '' }

function InviteModal({
  kol,
  projects,
  projectsLoading,
  invitedPairs,
  onClose,
  onConfirm,
}: {
  kol: Kol
  projects: Project[]
  projectsLoading: boolean
  invitedPairs: Set<string>
  onClose: () => void
  onConfirm: (projectId: string, collaborationType: 'commission' | 'reciprocal', items: ItemInput[], sponsorshipBonus: number) => Promise<void>
}) {
  const [selectedProject, setSelectedProject] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [items, setItems] = useState<ItemInput[]>([{ ...EMPTY_ITEM }])
  const [sponsorshipBonus, setSponsorshipBonus] = useState('')

  const selectedProjectObj = projects.find((p) => p.id === selectedProject)
  const isReciprocal = selectedProjectObj?.type === '商案'

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateItem(i: number, field: keyof ItemInput, value: string) {
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it))
  }

  async function handleSubmit() {
    if (!selectedProject || submitting) return

    if (isReciprocal) {
      const missingItem = items.some((it) => !it.item_name.trim() || !it.quantity || !it.estimated_value)
      if (missingItem) {
        setSubmitError('請填寫所有商品的名稱、數量與市值。')
        return
      }
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      const bonus = sponsorshipBonus ? parseInt(sponsorshipBonus, 10) : 0
      await onConfirm(selectedProject, isReciprocal ? 'reciprocal' : 'commission', items, isNaN(bonus) ? 0 : bonus)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '送出失敗，請再試一次。')
      setSubmitting(false)
    }
  }

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

          {projectsLoading ? (
            <p className="text-xs text-muted-foreground py-2">載入商案中…</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-muted-foreground py-2">目前尚無商案，請先建立商案。</p>
          ) : (
            <div className="space-y-2">
              {projects.map((p) => {
                const alreadyInvited = invitedPairs.has(inviteKey(kol.kolUserId, p.id))
                const isSelected     = selectedProject === p.id

                return (
                  <button
                    key={p.id}
                    onClick={() => !alreadyInvited && setSelectedProject(p.id)}
                    disabled={alreadyInvited}
                    className={`w-full text-left px-4 py-3 border text-sm transition-colors duration-150 flex items-center justify-between ${
                      alreadyInvited
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700 cursor-default'
                        : isSelected
                          ? 'border-foreground bg-foreground text-background'
                          : 'border-foreground/20 hover:border-foreground/50'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {alreadyInvited
                      ? <span className="text-xs text-emerald-600 shrink-0 ml-2">已邀請</span>
                      : isSelected && <Check className="h-3.5 w-3.5 shrink-0 ml-2" />
                    }
                  </button>
                )
              })}
            </div>
          )}

          {submitError && (
            <p className="mt-3 text-xs text-red-600">{submitError}</p>
          )}
        </div>

        {/* 互惠 items + 業配獎金 — only for 商案 projects */}
        {isReciprocal && (
          <div className="px-6 pb-5 border-t border-foreground/[0.08] pt-5 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">互惠商品</p>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-1.5 items-start">
                    <input
                      type="text"
                      placeholder="商品名稱"
                      value={item.item_name}
                      onChange={(e) => updateItem(i, 'item_name', e.target.value)}
                      className="flex-1 min-w-0 border border-foreground/20 bg-transparent px-2.5 py-1.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/50"
                    />
                    <input
                      type="number"
                      placeholder="數量"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                      className="w-14 border border-foreground/20 bg-transparent px-2 py-1.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/50 text-center"
                    />
                    <div className="relative w-24">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[0.65rem] text-muted-foreground pointer-events-none">NT$</span>
                      <input
                        type="number"
                        placeholder="市值"
                        min={0}
                        value={item.estimated_value}
                        onChange={(e) => updateItem(i, 'estimated_value', e.target.value)}
                        className="w-full border border-foreground/20 bg-transparent pl-7 pr-2 py-1.5 text-xs placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground/50"
                      />
                    </div>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(i)}
                        className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors shrink-0 mt-0.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                新增商品
              </button>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">業配獎金 (NT$)</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none font-serif">NT$</span>
                <input
                  type="number"
                  min={0}
                  placeholder="0 表示無獎金"
                  value={sponsorshipBonus}
                  onChange={(e) => setSponsorshipBonus(e.target.value)}
                  className="w-full border border-foreground/20 bg-transparent pl-10 pr-3 py-2 text-sm font-serif placeholder:text-muted-foreground/40 focus:outline-none focus:border-foreground/50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={!selectedProject || submitting}
            className="flex-1 py-2.5 text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {submitting ? '送出中…' : '送出邀請'}
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
  onInvite,
}: {
  kol: Kol
  index: number
  onInvite: (kol: Kol) => void
}) {
  const [expanded, setExpanded] = useState(false)

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
          <span className="text-sm font-medium">{kol.name}</span>
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
            <p className="text-xs uppercase tracking-widest text-muted-foreground">合作費用</p>
            <p className="text-sm font-serif mt-0.5 text-amber-700">{formatFee(kol.collabFee)}</p>
          </div>
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
          {kol.username && (
            <Link
              href={`/kols/${kol.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-xs uppercase tracking-widest border border-foreground/30 px-3 py-1.5 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
            >
              <ExternalLink className="h-3 w-3" />
              履歷
            </Link>
          )}
          <button
            onClick={() => onInvite(kol)}
            className="text-xs uppercase tracking-widest border border-foreground px-3 py-1.5 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
          >
            邀請合作
          </button>
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
              {kol.username && (
                <div className="mb-3 sm:hidden">
                  <Link
                    href={`/kols/${kol.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest border border-foreground/30 px-3 py-1.5 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
                  >
                    <ExternalLink className="h-3 w-3" />
                    查看履歷
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 px-3 py-2.5 text-center">
                  <div className="flex items-center justify-center gap-1 mb-0.5">
                    <Banknote className="h-2.5 w-2.5 text-amber-600" />
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-700">合作費用</p>
                  </div>
                  <p className="text-base font-serif mt-1 text-amber-800">{formatFee(kol.collabFee)}</p>
                </div>
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
  const [kols, setKols]                   = useState<Kol[]>([])
  const [loading, setLoading]             = useState(true)
  const [loadError, setLoadError]         = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [activeFeeRange, setActiveFeeRange] = useState<FeeRange>('all')
  const [invitingKol, setInvitingKol]     = useState<Kol | null>(null)

  // Real projects for the invite modal
  const [projects, setProjects]           = useState<Project[]>([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Tracks sent invites as "kolUserId:projectId" — loaded from API + updated optimistically
  const [invitedPairs, setInvitedPairs]   = useState<Set<string>>(new Set())

  // Load KOLs
  useEffect(() => {
    const controller = new AbortController()

    async function loadKols() {
      setLoading(true)
      setLoadError('')
      try {
        const res = await fetch('/api/merchant/kols', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as ApiPayload | null
        if (!res.ok) { setLoadError(payload?.error ?? '讀取 KOL 資料失敗。'); return }
        setKols((payload?.kols ?? []).map(toViewModel))
      } catch (err) {
        if (!controller.signal.aborted) {
          setLoadError(err instanceof Error ? err.message : '讀取 KOL 資料失敗。')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadKols()
    return () => controller.abort()
  }, [])

  // Load merchant's own projects
  useEffect(() => {
    const controller = new AbortController()

    async function loadProjects() {
      setProjectsLoading(true)
      try {
        const res = await fetch('/api/merchant/projects', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as ProjectsPayload | null
        if (res.ok) {
          setProjects(
            (payload?.projects ?? []).map((p) => ({ id: String(p.id), name: p.name, type: p.type ?? '建案' })),
          )
        }
      } catch {
        // Non-fatal — modal will show empty state
      } finally {
        if (!controller.signal.aborted) setProjectsLoading(false)
      }
    }

    void loadProjects()
    return () => controller.abort()
  }, [])

  // Load existing sent requests so "已邀請" state survives refresh
  useEffect(() => {
    async function loadSentRequests() {
      try {
        const res = await fetch('/api/collaboration-requests?role=sent')
        const payload = (await res.json().catch(() => null)) as RequestsPayload | null
        if (!res.ok || !payload?.requests) return

        const pairs = new Set(
          payload.requests
            .filter((r) => r.kol_user_id && r.project_id && (r.status === 'pending' || r.status === 'accepted'))
            .map((r) => inviteKey(r.kol_user_id, r.project_id)),
        )
        setInvitedPairs(pairs)
      } catch {
        // Non-fatal
      }
    }

    void loadSentRequests()
  }, [])

  const categories = useMemo(
    () => Array.from(new Set(kols.map((k) => k.category))).sort((a, b) => a.localeCompare(b, 'zh-Hant')),
    [kols],
  )

  const filtered = useMemo(() => {
    const feeRange = FEE_RANGES.find((r) => r.id === activeFeeRange) ?? FEE_RANGES[0]
    return kols.filter((k) => {
      if (projects.some((p) => invitedPairs.has(inviteKey(k.kolUserId, p.id)))) return false
      if (activeCategory && k.category !== activeCategory) return false
      if (feeRange.id !== 'all' && (k.collabFee === null || k.collabFee < feeRange.min || k.collabFee >= feeRange.max)) return false
      return true
    })
  }, [activeCategory, activeFeeRange, kols, projects, invitedPairs])

  async function handleConfirm(projectId: string, collaborationType: 'commission' | 'reciprocal', items: ItemInput[], sponsorshipBonus: number) {
    if (!invitingKol) return

    const res = await fetch('/api/collaboration-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id:         projectId,
        kol_user_id:        invitingKol.kolUserId,
        collaboration_type: collaborationType,
        sponsorship_bonus:  collaborationType === 'reciprocal' ? sponsorshipBonus : undefined,
        items: collaborationType === 'reciprocal'
          ? items.map((it) => ({
              item_name:       it.item_name.trim(),
              quantity:        parseInt(it.quantity, 10) || 1,
              estimated_value: parseInt(it.estimated_value, 10) || 0,
            }))
          : undefined,
      }),
    })

    const payload = (await res.json().catch(() => null)) as { error?: string } | null

    if (!res.ok) {
      throw new Error(payload?.error ?? '邀請送出失敗，請再試一次。')
    }

    // Optimistically mark this pair as invited and close the modal
    setInvitedPairs((prev) => new Set(prev).add(inviteKey(invitingKol.kolUserId, projectId)))
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

      {/* ── Fee range filter ── */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground/60 shrink-0">
          <Banknote className="h-3 w-3" />
          合作費用
        </div>
        <div className="h-3.5 w-px bg-foreground/15" />
        {FEE_RANGES.map((range) => (
          <button
            key={range.id}
            onClick={() => setActiveFeeRange(range.id)}
            className={`text-xs uppercase tracking-[0.3em] px-3 py-1.5 border transition-colors duration-150 ${
              activeFeeRange === range.id
                ? 'border-amber-700 bg-amber-700 text-white'
                : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            }`}
          >
            {range.label}
          </button>
        ))}
      </motion.div>

      {loadError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {/* ── KOL list ── */}
      <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">
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
            projects={projects}
            projectsLoading={projectsLoading}
            invitedPairs={invitedPairs}
            onClose={() => setInvitingKol(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
