'use client'

import { useEffect, useState, useMemo, useCallback, useRef, forwardRef, useImperativeHandle } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Check, X, ChevronDown, ExternalLink,
  Clock, Users, RotateCcw, Ban, Send, MessageSquare,
  Percent, Pencil, Save,
} from 'lucide-react'
import { toast } from 'sonner'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.38, delay: i * 0.045, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type ProjectInfo = {
  id: string
  name: string
  publishStatus: 'draft' | 'published'
  districtLabel: string
  collabDescription: string | null
}

type Kol = {
  id: string
  kolUserId: string
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
}

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
  profile_photo_url?: string
}

type CollabRequest = {
  id:                 string
  project_id:         string
  kol_user_id:        string
  sender_role:        'merchant' | 'kol'
  status:             'pending' | 'accepted' | 'declined' | 'cancelled'
  message:            string | null
  created_at:         string
  responded_at:       string | null
  cancelled_at:       string | null
  kol_name:           string | null
  kol_platform:       string | null
  kol_follower_range: string | null
}

type PageTab   = 'explore' | 'manage'
type StatusTab = 'inviting' | 'active' | 'history'

const STATUS_TABS: { id: StatusTab; label: string; icon: React.ElementType }[] = [
  { id: 'inviting', label: '邀請中',   icon: Send      },
  { id: 'active',   label: '合作中',   icon: Users     },
  { id: 'history',  label: '歷史紀錄', icon: RotateCcw },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
}

function toKol(item: ApiKol): Kol {
  const platforms = asStringArray(item.platforms)
  return {
    id:             item.id,
    kolUserId:      item.kol_user_id ?? '',
    name:           item.full_name || '未命名 KOL',
    username:       item.username || '',
    platform:       platforms.length > 0 ? platforms.join(' / ') : '未填寫平台',
    followers:      item.follower_range || '未填寫',
    category:       item.content_type || '未分類',
    avgViews:       item.avg_views || '—',
    engagementRate: item.engagement_rate || '—',
    city:           item.city || '—',
    bio:            item.bio || '尚未提供自我介紹。',
    profilePhotoUrl: typeof item.profile_photo_url === 'string' ? item.profile_photo_url : '',
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

// ── Collab Brief ───────────────────────────────────────────────────────────
type CollabBriefHandle = { openEdit: () => void }

const CollabBrief = forwardRef<CollabBriefHandle, {
  projectId: string
  value: string | null
  onChange: (v: string) => void
}>(function CollabBrief({ projectId, value, onChange }, ref) {
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState(value ?? '')
  const [saving, setSaving]     = useState(false)
  const isEmpty                 = !(value ?? '').trim()

  useImperativeHandle(ref, () => ({
    openEdit() {
      setDraft(value ?? '')
      setEditing(true)
    },
  }))

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/merchant/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project: { collabDescription: draft } }),
      })
      if (!res.ok) return
      onChange(draft)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  return (
    <motion.div
      id="collab-brief"
      layout
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-xl border transition-colors duration-200 overflow-hidden ${
        editing
          ? 'border-foreground/20 bg-background shadow-sm'
          : isEmpty
            ? 'border-amber-200/80 bg-amber-50/60'
            : 'border-foreground/[0.08] bg-linen'
      }`}
    >
      {/* Top label row */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-foreground/[0.07]">
        <div className="flex items-center gap-2.5">
          {/* Left accent rule */}
          <div className={`h-3 w-px rounded-full ${isEmpty ? 'bg-amber-400' : 'bg-foreground/25'}`} />
          <p className="text-[0.6rem] uppercase tracking-[0.45em] text-muted-foreground">
            合作說明 Brief
          </p>
        </div>
        {!editing && (
          <button
            onClick={() => { setDraft(value ?? ''); setEditing(true) }}
            className="group flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground/60 hover:text-foreground transition-colors duration-150"
          >
            <Pencil className="h-3 w-3" />
            {isEmpty ? '填寫' : '編輯'}
          </button>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-5 py-4"
          >
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={300}
              rows={4}
              placeholder="說明推廣方向、內容風格、目標受眾…讓 KOL 在接受邀請前就能充分理解這次合作。"
              className="w-full text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/35 bg-transparent focus:outline-none resize-none"
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-foreground/[0.06]">
              <p className="text-[0.65rem] text-muted-foreground/40 font-mono">
                {draft.length} / 300
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg bg-black/[0.06] px-3.5 py-1.5 text-[0.75rem] font-medium text-foreground/60 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40"
                >
                  取消
                </button>
                <button
                  onClick={() => void handleSave()}
                  disabled={saving || !draft.trim()}
                  className="flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-1.5 text-[0.75rem] font-medium text-background hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Save className="h-3 w-3" />
                  {saving ? '儲存中…' : '儲存'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-5 py-4"
          >
            {isEmpty ? (
              <p className="text-xs text-amber-700/70 leading-relaxed">
                尚未填寫合作說明。邀請 KOL 前請先填寫，讓對方了解此次合作的方向與內容。
              </p>
            ) : (
              <p className="text-sm text-foreground/80 leading-relaxed">{value}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ── KOL Avatar ─────────────────────────────────────────────────────────────
function KolAvatar({ kol, size = 'md' }: { kol: { name: string; profilePhotoUrl: string }; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-7 h-7 text-[0.6rem]' : 'w-9 h-9 text-xs'
  return (
    <div className={`${cls} rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#b8936a] flex items-center justify-center shrink-0 text-white font-medium overflow-hidden`}>
      {kol.profilePhotoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={kol.profilePhotoUrl} alt={kol.name} className="h-full w-full object-cover" />
        : kol.name[0]
      }
    </div>
  )
}

// ── KOL row (Explore tab) ──────────────────────────────────────────────────
function KolRow({
  kol, index, onInviteClick,
}: {
  kol: Kol
  index: number
  onInviteClick: (kolUserId: string, kolName: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.07] last:border-b-0"
    >
      <div className="px-5 py-4 flex items-center gap-3">
        <KolAvatar kol={kol} />

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{kol.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {kol.platform}
            <span className="mx-1.5 opacity-30">·</span>
            {kol.followers} 粉絲
            <span className="mx-1.5 opacity-30">·</span>
            {kol.category}
          </p>
        </div>

        {/* Stats — desktop */}
        <div className="hidden md:flex items-center gap-5 shrink-0 mr-1">
          <div className="text-center">
            <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">互動率</p>
            <p className="text-sm font-serif mt-0.5">{kol.engagementRate}</p>
          </div>
          <div className="text-center">
            <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">平均觀看</p>
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
              className="hidden sm:flex items-center gap-1 text-[0.78rem] font-medium px-3.5 py-1.5 rounded-lg bg-black/[0.06] text-foreground/70 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150"
            >
              <ExternalLink className="h-3 w-3" />
              履歷
            </Link>
          )}

          <button
            onClick={() => onInviteClick(kol.kolUserId, kol.name)}
            className="text-[0.78rem] font-medium px-3.5 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150"
          >
            邀請合作
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded bio + stats */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 border-t border-foreground/[0.06] bg-muted/15">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{kol.bio}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: '平均觀看', value: kol.avgViews },
                  { label: '互動率',   value: kol.engagementRate },
                  { label: '所在城市', value: kol.city },
                ].map((s) => (
                  <div key={s.label} className="border border-foreground/[0.08] bg-background px-3 py-2.5 text-center">
                    <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">{s.label}</p>
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

// ── Proposal card (待審核) ─────────────────────────────────────────────────
function ProposalCard({
  req, index, onAccept, onDecline,
}: {
  req: CollabRequest
  index: number
  onAccept: (id: string) => Promise<void>
  onDecline: (id: string) => Promise<void>
}) {
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null)

  async function handle(action: 'accept' | 'decline') {
    if (busy) return
    setBusy(action)
    try {
      if (action === 'accept') await onAccept(req.id)
      else await onDecline(req.id)
    } finally { setBusy(null) }
  }

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible"
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      variants={fadeUp} transition={{ duration: 0.2 }}
      className="px-5 py-4 flex items-start justify-between gap-4 border-b border-amber-100 last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && (
            <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border border-zinc-200/60 bg-zinc-100 text-zinc-500">
              {req.kol_platform}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {req.kol_follower_range && <>{req.kol_follower_range} 粉絲 <span className="mx-1 opacity-30">·</span> </>}
          {formatDate(req.created_at)}
        </p>
        {req.message && (
          <div className="mt-2 flex items-start gap-1.5">
            <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">{req.message}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <button onClick={() => handle('accept')} disabled={!!busy}
          className="flex items-center gap-1 text-[0.78rem] font-medium px-3.5 py-1.5 rounded-lg bg-foreground text-background hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
          <Check className="h-3 w-3" />{busy === 'accept' ? '…' : '通過'}
        </button>
        <button onClick={() => handle('decline')} disabled={!!busy}
          className="flex items-center gap-1 text-[0.78rem] font-medium px-3.5 py-1.5 rounded-lg bg-black/[0.06] text-foreground/70 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed">
          <X className="h-3 w-3" />{busy === 'decline' ? '…' : '拒絕'}
        </button>
      </div>
    </motion.div>
  )
}

// ── Invite row (邀請中) ────────────────────────────────────────────────────
function InviteRow({ req, index, onCancel }: { req: CollabRequest; index: number; onCancel: (id: string) => Promise<void> }) {
  const [busy, setBusy] = useState(false)
  async function handleCancel() {
    if (busy) return
    setBusy(true)
    try { await onCancel(req.id) } finally { setBusy(false) }
  }
  return (
    <motion.div custom={index} initial="hidden" animate="visible"
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }} variants={fadeUp}
      className="px-5 py-4 flex items-center justify-between gap-4 border-b border-foreground/[0.07] last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && <span className="text-[0.62rem] font-mono text-muted-foreground">{req.kol_platform}</span>}
        </div>
        <p className="text-xs text-muted-foreground">
          {req.kol_follower_range && <>{req.kol_follower_range} 粉絲 <span className="mx-1 opacity-30">·</span> </>}
          邀請於 {formatDate(req.created_at)}
        </p>
      </div>
      <button onClick={handleCancel} disabled={busy}
        className="flex items-center gap-1 text-[0.78rem] font-medium px-3.5 py-1.5 rounded-lg bg-black/[0.06] text-foreground/70 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40 shrink-0">
        <Ban className="h-3 w-3" />{busy ? '…' : '取消邀請'}
      </button>
    </motion.div>
  )
}

// ── Active row (合作中) ────────────────────────────────────────────────────
function ActiveRow({ req, index }: { req: CollabRequest; index: number }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="px-5 py-4 flex items-center gap-4 border-b border-foreground/[0.07] last:border-b-0">
      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && <span className="text-[0.62rem] font-mono text-muted-foreground">{req.kol_platform}</span>}
        </div>
        {req.kol_follower_range && <p className="text-xs text-muted-foreground mt-0.5">{req.kol_follower_range} 粉絲</p>}
      </div>
      <p className="text-xs text-muted-foreground shrink-0">{req.sender_role === 'kol' ? '自行申請' : '我方邀請'}</p>
    </motion.div>
  )
}

// ── History row (歷史紀錄) ─────────────────────────────────────────────────
function HistoryRow({ req, index }: { req: CollabRequest; index: number }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="px-5 py-4 flex items-center gap-4 border-b border-foreground/[0.07] last:border-b-0 opacity-55">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && <span className="text-[0.62rem] font-mono text-muted-foreground">{req.kol_platform}</span>}
        </div>
      </div>
      <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded border shrink-0 ${
        req.status === 'declined' ? 'bg-red-50 text-red-600 border-red-200/60' : 'bg-zinc-100 text-zinc-500 border-zinc-200/60'
      }`}>
        {req.status === 'declined' ? '已拒絕' : '已取消'}
      </span>
    </motion.div>
  )
}

function EmptyRow({ message }: { message: string }) {
  return <div className="px-5 py-12 text-center"><p className="text-sm text-muted-foreground">{message}</p></div>
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function ProjectKolsPage() {
  const { id } = useParams<{ id: string }>()

  const briefRef = useRef<CollabBriefHandle>(null)

  const [project, setProject]         = useState<ProjectInfo | null>(null)
  const [collabDescription, setCollabDescription] = useState<string | null>(null)
  const [pageTab, setPageTab]   = useState<PageTab>('explore')
  const [statusTab, setStatusTab] = useState<StatusTab>('inviting')

  // Explore state
  const [kols, setKols]                   = useState<Kol[]>([])
  const [kolsLoading, setKolsLoading]     = useState(true)
  const [kolsError, setKolsError]         = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Manage state
  const [requests, setRequests]         = useState<CollabRequest[]>([])
  const [requestsLoading, setRequestsLoading] = useState(true)

  // Invited kolUserId set for THIS project (pending or accepted)
  const [invitedKolIds, setInvitedKolIds] = useState<Set<string>>(new Set())

  // Invite modal
  const [inviteModal, setInviteModal] = useState<{ kolUserId: string; kolName: string } | null>(null)
  const [commissionRate, setCommissionRate] = useState('')
  const [sendingInvite, setSendingInvite] = useState(false)

  // ── Load project info ───────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/merchant/projects/${id}`, { cache: 'no-store' })
      const payload = await res.json().catch(() => ({}))
      if (res.ok) {
        setProject(payload.project ?? null)
        setCollabDescription(payload.project?.collabDescription ?? null)
      }
    }
    void load()
  }, [id])

  // ── Load KOLs ──────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setKolsLoading(true)
      setKolsError('')
      try {
        const res = await fetch('/api/merchant/kols', { signal: controller.signal })
        const payload = await res.json().catch(() => null) as { kols?: ApiKol[]; error?: string } | null
        if (!res.ok) { setKolsError(payload?.error ?? '讀取 KOL 資料失敗。'); return }
        setKols((payload?.kols ?? []).map(toKol))
      } catch (err) {
        if (!controller.signal.aborted) setKolsError(err instanceof Error ? err.message : '讀取失敗。')
      } finally {
        if (!controller.signal.aborted) setKolsLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  // ── Load collaboration requests for this project ────────────────────────
  const loadRequests = useCallback(async () => {
    setRequestsLoading(true)
    try {
      const res = await fetch('/api/collaboration-requests')
      const payload = await res.json().catch(() => null) as { requests?: CollabRequest[]; error?: string } | null
      if (!res.ok) return
      const all = payload?.requests ?? []
      // Filter to this project only
      const forProject = all.filter((r) => r.project_id === id)
      setRequests(forProject)
      // Build invited set: KOLs with pending or accepted status for this project
      const ids = new Set(
        forProject
          .filter((r) => r.status === 'pending' || r.status === 'accepted')
          .map((r) => r.kol_user_id),
      )
      setInvitedKolIds(ids)
    } finally {
      setRequestsLoading(false)
    }
  }, [id])

  useEffect(() => { void loadRequests() }, [loadRequests])

  // ── Derived partitions ──────────────────────────────────────────────────
  const pendingProposals = useMemo(
    () => requests.filter((r) => r.sender_role === 'kol' && r.status === 'pending'),
    [requests],
  )
  const inviting = useMemo(
    () => requests.filter((r) => r.sender_role === 'merchant' && r.status === 'pending'),
    [requests],
  )
  const active = useMemo(
    () => requests.filter((r) => r.status === 'accepted'),
    [requests],
  )
  const history = useMemo(() => {
    const seen = new Set<string>()
    return requests
      .filter((r) => r.status === 'declined' || r.status === 'cancelled')
      .filter((r) => {
        if (seen.has(r.kol_user_id)) return false
        seen.add(r.kol_user_id)
        return true
      })
  }, [requests])

  const statusTabCount: Record<StatusTab, number> = {
    inviting: inviting.length,
    active:   active.length,
    history:  history.length,
  }

  // ── KOL filtering ──────────────────────────────────────────────────────
  const categories = useMemo(
    () => Array.from(new Set(kols.map((k) => k.category))).sort((a, b) => a.localeCompare(b, 'zh-Hant')),
    [kols],
  )

  const filteredKols = useMemo(
    () => kols.filter((k) => {
      if (invitedKolIds.has(k.kolUserId)) return false
      if (activeCategory && k.category !== activeCategory) return false
      return true
    }),
    [kols, activeCategory, invitedKolIds],
  )

  // ── Actions ─────────────────────────────────────────────────────────────
  function openInviteModal(kolUserId: string, kolName: string) {
    if (!collabDescription?.trim()) {
      toast.error('請先填寫合作內容', {
        description: '讓 KOL 在接受邀請前了解這次合作的方向與內容。',
      })
      document.getElementById('collab-brief')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      briefRef.current?.openEdit()
      return
    }
    setCommissionRate('')
    setInviteModal({ kolUserId, kolName })
  }

  async function confirmInvite() {
    if (!inviteModal) return
    const rate = parseFloat(commissionRate)
    if (!commissionRate || isNaN(rate) || rate < 0 || rate > 100) return
    setSendingInvite(true)
    try {
      const res = await fetch('/api/collaboration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id:      id,
          kol_user_id:     inviteModal.kolUserId,
          commission_rate: rate,
        }),
      })
      const payload = await res.json().catch(() => null) as { error?: string } | null
      if (!res.ok) throw new Error(payload?.error ?? '邀請送出失敗。')
      setInviteModal(null)
      await loadRequests()
    } catch {
      // keep modal open on error
    } finally {
      setSendingInvite(false)
    }
  }

  async function handleAccept(reqId: string) {
    const res = await fetch(`/api/collaboration-requests/${reqId}/accept`, { method: 'POST' })
    const payload = await res.json().catch(() => null) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '操作失敗。')
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'accepted', responded_at: new Date().toISOString() } : r))
  }

  async function handleDecline(reqId: string) {
    const res = await fetch(`/api/collaboration-requests/${reqId}/decline`, { method: 'POST' })
    const payload = await res.json().catch(() => null) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '操作失敗。')
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'declined', responded_at: new Date().toISOString() } : r))
    // Remove from invitedKolIds if declined
    const req = requests.find((r) => r.id === reqId)
    if (req) setInvitedKolIds((prev) => { const next = new Set(prev); next.delete(req.kol_user_id); return next })
  }

  async function handleCancel(reqId: string) {
    const res = await fetch(`/api/collaboration-requests/${reqId}/cancel`, { method: 'POST' })
    const payload = await res.json().catch(() => null) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '操作失敗。')
    setRequests((prev) => prev.map((r) => r.id === reqId ? { ...r, status: 'cancelled', cancelled_at: new Date().toISOString() } : r))
    const req = requests.find((r) => r.id === reqId)
    if (req) setInvitedKolIds((prev) => { const next = new Set(prev); next.delete(req.kol_user_id); return next })
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Back ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
        <Link
          href="/merchant/projects"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="h-3 w-3" />
          商案列表
        </Link>
      </motion.div>

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">KOL 合作</p>
        <h1 className="text-3xl font-serif">{project?.name ?? '…'}</h1>
        <p className="text-sm text-muted-foreground mt-2">
          探索並邀請 KOL，或管理此商案的所有合作申請。
        </p>
      </motion.div>

      {/* ── Collab Brief ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <CollabBrief
          ref={briefRef}
          projectId={id}
          value={collabDescription}
          onChange={setCollabDescription}
        />
      </motion.div>

      {/* ── Page tab toggle — Apple segmented control ── */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="inline-flex items-center p-1 rounded-[10px] bg-black/[0.06] gap-0.5">
          {([
            { id: 'explore' as PageTab, label: '探索 KOL', badge: null },
            { id: 'manage'  as PageTab, label: 'KOL 管理',  badge: pendingProposals.length || null },
          ]).map(({ id: tabId, label, badge }) => {
            const isActive = pageTab === tabId
            return (
              <button
                key={tabId}
                onClick={() => setPageTab(tabId)}
                className="relative px-5 py-2 rounded-[8px] text-[0.72rem] font-medium tracking-wide transition-colors duration-150 flex items-center gap-2 select-none"
                style={{ color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
              >
                {/* Sliding white pill */}
                {isActive && (
                  <motion.div
                    layoutId="kol-page-tab-pill"
                    className="absolute inset-0 rounded-[8px] bg-white"
                    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.8 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
                {badge !== null && (
                  <span className={`relative z-10 text-[0.6rem] px-1.5 py-px rounded-full font-semibold ${
                    isActive
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-black/10 text-foreground/50'
                  }`}>
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">

        {/* ════ EXPLORE TAB ════ */}
        {pageTab === 'explore' && (
          <motion.div
            key="explore"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="space-y-5"
          >
            {/* Category filter — Apple pill chips */}
            <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
              <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                {[{ label: '全部', value: null }, ...categories.map((c) => ({ label: c, value: c }))].map(({ label, value }) => {
                  const isActive = activeCategory === value
                  return (
                    <button
                      key={label}
                      onClick={() => setActiveCategory(value)}
                      className="shrink-0 px-4 py-2 rounded-full text-[0.75rem] font-medium tracking-wide transition-all duration-150 active:scale-[0.96] select-none"
                      style={{
                        background: isActive ? 'hsl(var(--foreground))' : 'rgba(0,0,0,0.06)',
                        color: isActive ? 'hsl(var(--background))' : 'rgba(0,0,0,0.38)',
                        fontWeight: isActive ? 500 : 400,
                        boxShadow: 'none',
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {kolsError && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{kolsError}</div>
            )}

            {/* KOL list */}
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="border border-foreground/[0.08] bg-linen overflow-hidden">
              {kolsLoading ? (
                <EmptyRow message="讀取 KOL 資料中…" />
              ) : filteredKols.length === 0 ? (
                <EmptyRow message={activeCategory ? '此分類目前沒有 KOL。' : '目前沒有已核准的 KOL。'} />
              ) : (
                filteredKols.map((kol, i) => (
                  <KolRow
                    key={kol.id}
                    kol={kol}
                    index={3 + i}
                    onInviteClick={openInviteModal}
                  />
                ))
              )}
            </motion.div>
          </motion.div>
        )}

        {/* ════ MANAGE TAB ════ */}
        {pageTab === 'manage' && (
          <motion.div
            key="manage"
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            className="space-y-7"
          >
            {requestsLoading ? (
              <div className="border border-foreground/[0.08] py-20 text-center">
                <p className="text-sm text-muted-foreground">載入中…</p>
              </div>
            ) : (
              <>
                {/* 待審核 section */}
                <AnimatePresence>
                  {pendingProposals.length > 0 && (
                    <motion.div
                      key="pending"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <p className="text-xs uppercase tracking-[0.3em] text-amber-700">待審核申請</p>
                        </div>
                        <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200/60">
                          {pendingProposals.length} 待處理
                        </span>
                      </div>
                      <div className="border border-amber-200 bg-amber-50/40 overflow-hidden">
                        <AnimatePresence>
                          {pendingProposals.map((req, i) => (
                            <ProposalCard key={req.id} req={req} index={i} onAccept={handleAccept} onDecline={handleDecline} />
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Status tabs */}
                <div>
                  {/* Apple segmented control */}
                  <div className="inline-flex items-center p-1 rounded-[10px] bg-black/[0.06] gap-0.5 mb-3">
                    {STATUS_TABS.map((tab) => {
                      const isActive = statusTab === tab.id
                      const Icon = tab.icon
                      const count = statusTabCount[tab.id]
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setStatusTab(tab.id)}
                          className="relative flex items-center gap-1.5 px-4 py-2 rounded-[8px] text-[0.72rem] font-medium tracking-wide transition-colors duration-150 select-none"
                          style={{ color: isActive ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="status-tab-pill"
                              className="absolute inset-0 rounded-[8px] bg-white"
                              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)' }}
                              transition={{ type: 'spring', stiffness: 500, damping: 38, mass: 0.8 }}
                            />
                          )}
                          <Icon className="relative z-10 h-3 w-3 shrink-0" />
                          <span className="relative z-10">{tab.label}</span>
                          {count > 0 && (
                            <span className={`relative z-10 text-[0.6rem] px-1.5 py-px rounded-full font-semibold tabular-nums ${
                              isActive
                                ? 'bg-black/[0.08] text-foreground'
                                : 'bg-black/[0.07] text-foreground/50'
                            }`}>
                              {count}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Tab content */}
                  <div className="border border-foreground/[0.08] bg-linen overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div key={statusTab}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}>
                        {statusTab === 'inviting' && (
                          inviting.length === 0
                            ? <EmptyRow message="目前沒有進行中的邀請。" />
                            : <AnimatePresence>{inviting.map((r, i) => <InviteRow key={r.id} req={r} index={i} onCancel={handleCancel} />)}</AnimatePresence>
                        )}
                        {statusTab === 'active' && (
                          active.length === 0
                            ? <EmptyRow message="目前沒有合作中的 KOL。" />
                            : active.map((r, i) => <ActiveRow key={r.id} req={r} index={i} />)
                        )}
                        {statusTab === 'history' && (
                          history.length === 0
                            ? <EmptyRow message="目前沒有歷史紀錄。" />
                            : history.map((r, i) => <HistoryRow key={r.id} req={r} index={i} />)
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Invite Modal ── */}
      <AnimatePresence>
        {inviteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
            onClick={() => { if (!sendingInvite) setInviteModal(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md rounded-xl border border-foreground/10 bg-background p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-5">
                <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mb-1">邀請合作</p>
                <h2 className="text-lg font-serif">{inviteModal.kolName}</h2>
              </div>

              {/* Collab description preview */}
              {collabDescription && (
                <div className="mb-5 rounded-lg border border-foreground/[0.08] bg-linen px-4 py-3">
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-muted-foreground mb-1.5">合作說明</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">{collabDescription}</p>
                </div>
              )}

              {/* Commission rate input */}
              <div className="mb-6">
                <label className="block text-xs uppercase tracking-[0.35em] text-muted-foreground mb-2">
                  佣金比例
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="0.0"
                    className="w-full rounded-lg border border-foreground/[0.12] bg-foreground/[0.02] px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-foreground/20"
                    autoFocus
                  />
                  <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                </div>
                <p className="mt-1.5 text-[0.68rem] text-muted-foreground">
                  此佣金比例僅 KOL 本人可見，不公開。
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setInviteModal(null)}
                  disabled={sendingInvite}
                  className="rounded-lg bg-black/[0.06] px-4 py-2 text-[0.78rem] font-medium text-foreground/70 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-30"
                >
                  取消
                </button>
                <button
                  onClick={() => void confirmInvite()}
                  disabled={sendingInvite || !commissionRate || isNaN(parseFloat(commissionRate))}
                  className="rounded-lg bg-foreground px-5 py-2 text-[0.78rem] font-medium text-background hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sendingInvite ? '送出中…' : '送出邀請'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
