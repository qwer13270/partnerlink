'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Clock, Users, RotateCcw, Ban, Send, MessageSquare, Layers } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type CollabRequest = {
  id:                    string
  project_id:            string
  merchant_user_id:      string
  kol_user_id:           string
  sender_role:           'merchant' | 'kol'
  status:                'pending' | 'accepted' | 'declined' | 'cancelled'
  message:               string | null
  created_at:            string
  responded_at:          string | null
  cancelled_at:          string | null
  project_name:          string | null
  merchant_company_name: string | null
  merchant_contact_name: string | null
  kol_name:              string | null
  kol_platform:          string | null
  kol_follower_range:    string | null
}

type Tab = 'inviting' | 'active' | 'history'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'inviting', label: '邀請中',   icon: Send      },
  { id: 'active',   label: '合作中',   icon: Users     },
  { id: 'history',  label: '歷史紀錄', icon: RotateCcw },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

// ── Project filter strip ───────────────────────────────────────────────────
type ProjectChip = { id: string; name: string; count: number }

function ProjectFilterStrip({
  projects,
  selected,
  totalCount,
  onSelect,
}: {
  projects: ProjectChip[]
  selected: string | null
  totalCount: number
  onSelect: (id: string | null) => void
}) {
  if (projects.length <= 1) return null

  return (
    <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* "全部" chip */}
        <button
          onClick={() => onSelect(null)}
          className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] border transition-all duration-150 ${
            selected === null
              ? 'bg-foreground text-background border-foreground'
              : 'bg-transparent text-muted-foreground border-foreground/20 hover:border-foreground/50 hover:text-foreground'
          }`}
        >
          <Layers className="h-2.5 w-2.5" />
          全部商案
          <span className={`text-[0.55rem] px-1 py-px tabular-nums ${
            selected === null ? 'bg-background/20' : 'bg-foreground/8'
          }`}>
            {totalCount}
          </span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-foreground/15 mx-0.5" />

        {/* Per-project chips */}
        {projects.map((proj) => {
          const isActive = selected === proj.id
          return (
            <button
              key={proj.id}
              onClick={() => onSelect(isActive ? null : proj.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.2em] border transition-all duration-150 ${
                isActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-transparent text-muted-foreground border-foreground/20 hover:border-foreground/50 hover:text-foreground'
              }`}
            >
              <span className="max-w-[14ch] truncate">{proj.name}</span>
              {proj.count > 0 && (
                <span className={`text-[0.55rem] px-1 py-px tabular-nums ${
                  isActive ? 'bg-background/20' : 'bg-foreground/8'
                }`}>
                  {proj.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ── Pending KOL proposal card (待審核) ────────────────────────────────────
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
      key={req.id}
      custom={index}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      variants={fadeUp}
      transition={{ duration: 0.2 }}
      className="px-5 py-4 flex items-start justify-between gap-4 border-b border-amber-100 last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && (
            <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground font-mono border border-foreground/15 px-1.5 py-px">
              {req.kol_platform}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {req.kol_follower_range && <span>{req.kol_follower_range} 粉絲</span>}
          {req.kol_follower_range && <span className="mx-1.5 opacity-30">·</span>}
          <span>{formatDate(req.created_at)}</span>
        </p>
        {req.message && (
          <div className="mt-2 flex items-start gap-1.5">
            <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground italic leading-relaxed line-clamp-2">
              {req.message}
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0 pt-0.5">
        <button
          onClick={() => handle('accept')}
          disabled={!!busy}
          className="flex items-center gap-1 text-xs uppercase tracking-[0.25em] px-3 py-1.5 bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="h-3 w-3" />
          {busy === 'accept' ? '…' : '通過'}
        </button>
        <button
          onClick={() => handle('decline')}
          disabled={!!busy}
          className="flex items-center gap-1 text-xs uppercase tracking-[0.25em] px-3 py-1.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <X className="h-3 w-3" />
          {busy === 'decline' ? '…' : '拒絕'}
        </button>
      </div>
    </motion.div>
  )
}

// ── Invite row (邀請中) ────────────────────────────────────────────────────
function InviteRow({
  req, index, onCancel,
}: {
  req: CollabRequest
  index: number
  onCancel: (id: string) => Promise<void>
}) {
  const [busy, setBusy] = useState(false)

  async function handleCancel() {
    if (busy) return
    setBusy(true)
    try { await onCancel(req.id) } finally { setBusy(false) }
  }

  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
      variants={fadeUp}
      className="px-5 py-4 flex items-center justify-between gap-4 border-b border-foreground/[0.07] last:border-b-0"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && (
            <span className="text-[0.65rem] font-mono text-muted-foreground">{req.kol_platform}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {req.kol_follower_range && <span>{req.kol_follower_range} 粉絲</span>}
          {req.kol_follower_range && <span className="mx-1.5 opacity-30">·</span>}
          <span>邀請於 {formatDate(req.created_at)}</span>
        </p>
      </div>
      <button
        onClick={handleCancel}
        disabled={busy}
        className="flex items-center gap-1 text-xs uppercase tracking-widest px-3 py-1.5 border border-foreground/20 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150 disabled:opacity-40 shrink-0"
      >
        <Ban className="h-3 w-3" />
        {busy ? '…' : '取消邀請'}
      </button>
    </motion.div>
  )
}

// ── Active collab row (合作中) ─────────────────────────────────────────────
function ActiveRow({ req, index }: { req: CollabRequest; index: number }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="px-5 py-4 flex items-center gap-4 border-b border-foreground/[0.07] last:border-b-0"
    >
      <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && (
            <span className="text-[0.65rem] font-mono text-muted-foreground">{req.kol_platform}</span>
          )}
        </div>
        {req.kol_follower_range && (
          <p className="text-xs text-muted-foreground mt-0.5">{req.kol_follower_range} 粉絲</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs text-muted-foreground">
          {req.sender_role === 'kol' ? '自行申請' : '我方邀請'}
        </p>
        {req.responded_at && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {formatDate(req.responded_at)}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── History row (歷史紀錄) ─────────────────────────────────────────────────
function HistoryRow({ req, index }: { req: CollabRequest; index: number }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="px-5 py-4 flex items-center gap-4 border-b border-foreground/[0.07] last:border-b-0 opacity-60"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm">{req.kol_name ?? '未知 KOL'}</p>
          {req.kol_platform && (
            <span className="text-[0.65rem] font-mono text-muted-foreground">{req.kol_platform}</span>
          )}
        </div>
      </div>
      <span className={`text-[0.65rem] uppercase tracking-widest px-2 py-0.5 border shrink-0 ${
        req.status === 'declined'
          ? 'text-red-600 border-red-200 bg-red-50'
          : 'text-zinc-500 border-zinc-200 bg-zinc-50'
      }`}>
        {req.status === 'declined' ? '已拒絕' : '已取消'}
      </span>
    </motion.div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ── Project group header (used inside tabs when showing all projects) ───────
function ProjectGroupHeader({ name }: { name: string }) {
  return (
    <div className="px-5 py-2 bg-foreground/[0.03] border-b border-foreground/[0.06] flex items-center gap-2">
      <div className="h-px flex-1 bg-foreground/[0.08]" />
      <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground/70 shrink-0">{name}</p>
      <div className="h-px flex-1 bg-foreground/[0.08]" />
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MerchantKolsPage() {
  const [requests, setRequests]         = useState<CollabRequest[]>([])
  const [loading, setLoading]           = useState(true)
  const [loadErr, setLoadErr]           = useState('')
  const [activeTab, setActiveTab]       = useState<Tab>('inviting')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    setLoadErr('')
    try {
      const res = await fetch('/api/collaboration-requests')
      const payload = await res.json().catch(() => null) as { requests?: CollabRequest[]; error?: string } | null
      if (!res.ok) { setLoadErr(payload?.error ?? '載入失敗。'); return }
      setRequests(payload?.requests ?? [])
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : '載入失敗。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void loadRequests() }, [loadRequests])

  // ── Derive unique projects from all requests ────────────────────────────
  const allProjects = useMemo<ProjectChip[]>(() => {
    const seen = new Map<string, { name: string; count: number }>()
    for (const r of requests) {
      const existing = seen.get(r.project_id)
      if (existing) { existing.count++ }
      else { seen.set(r.project_id, { name: r.project_name ?? r.project_id, count: 1 }) }
    }
    return [...seen.entries()].map(([id, { name, count }]) => ({ id, name, count }))
  }, [requests])

  // ── Filter all requests by selected project ─────────────────────────────
  const filtered = useMemo(
    () => selectedProject ? requests.filter((r) => r.project_id === selectedProject) : requests,
    [requests, selectedProject],
  )

  const pendingProposals = useMemo(
    () => filtered.filter((r) => r.sender_role === 'kol' && r.status === 'pending'),
    [filtered],
  )
  const inviting = useMemo(
    () => filtered.filter((r) => r.sender_role === 'merchant' && r.status === 'pending'),
    [filtered],
  )
  const active = useMemo(
    () => filtered.filter((r) => r.status === 'accepted'),
    [filtered],
  )
  const history = useMemo(
    () => filtered.filter((r) => r.status === 'declined' || r.status === 'cancelled'),
    [filtered],
  )

  const tabCount: Record<Tab, number> = {
    inviting: inviting.length,
    active:   active.length,
    history:  history.length,
  }

  // ── Group helpers (used when no project selected) ───────────────────────
  function groupByProject<T extends CollabRequest>(rows: T[]): { projectId: string; projectName: string; items: T[] }[] {
    const map = new Map<string, { projectName: string; items: T[] }>()
    for (const r of rows) {
      const g = map.get(r.project_id)
      if (g) { g.items.push(r) }
      else { map.set(r.project_id, { projectName: r.project_name ?? r.project_id, items: [r] }) }
    }
    return [...map.entries()].map(([projectId, { projectName, items }]) => ({ projectId, projectName, items }))
  }

  // ── Actions ─────────────────────────────────────────────────────────────
  async function handleAccept(id: string) {
    const res = await fetch(`/api/collaboration-requests/${id}/accept`, { method: 'POST' })
    const payload = await res.json().catch(() => null) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '操作失敗。')
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'accepted', responded_at: new Date().toISOString() } : r),
    )
  }

  async function handleDecline(id: string) {
    const res = await fetch(`/api/collaboration-requests/${id}/decline`, { method: 'POST' })
    const payload = await res.json().catch(() => null) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '操作失敗。')
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'declined', responded_at: new Date().toISOString() } : r),
    )
  }

  async function handleCancel(id: string) {
    const res = await fetch(`/api/collaboration-requests/${id}/cancel`, { method: 'POST' })
    const payload = await res.json().catch(() => null) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '操作失敗。')
    setRequests((prev) =>
      prev.map((r) => r.id === id ? { ...r, status: 'cancelled', cancelled_at: new Date().toISOString() } : r),
    )
  }

  // ── Render tab content with optional project grouping ───────────────────
  function renderTabContent() {
    const showGroups = selectedProject === null

    if (activeTab === 'inviting') {
      if (inviting.length === 0) return <EmptyState message="目前沒有進行中的邀請。" />
      if (!showGroups) return (
        <AnimatePresence>
          {inviting.map((req, i) => <InviteRow key={req.id} req={req} index={i} onCancel={handleCancel} />)}
        </AnimatePresence>
      )
      const groups = groupByProject(inviting)
      return groups.map((g) => (
        <div key={g.projectId}>
          <ProjectGroupHeader name={g.projectName} />
          <AnimatePresence>
            {g.items.map((req, i) => <InviteRow key={req.id} req={req} index={i} onCancel={handleCancel} />)}
          </AnimatePresence>
        </div>
      ))
    }

    if (activeTab === 'active') {
      if (active.length === 0) return <EmptyState message="目前沒有合作中的 KOL。" />
      if (!showGroups) return active.map((req, i) => <ActiveRow key={req.id} req={req} index={i} />)
      const groups = groupByProject(active)
      return groups.map((g) => (
        <div key={g.projectId}>
          <ProjectGroupHeader name={g.projectName} />
          {g.items.map((req, i) => <ActiveRow key={req.id} req={req} index={i} />)}
        </div>
      ))
    }

    if (activeTab === 'history') {
      if (history.length === 0) return <EmptyState message="目前沒有歷史紀錄。" />
      if (!showGroups) return history.map((req, i) => <HistoryRow key={req.id} req={req} index={i} />)
      const groups = groupByProject(history)
      return groups.map((g) => (
        <div key={g.projectId}>
          <ProjectGroupHeader name={g.projectName} />
          {g.items.map((req, i) => <HistoryRow key={req.id} req={req} index={i} />)}
        </div>
      ))
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">KOL 管理</h1>
        <p className="text-sm text-muted-foreground mt-2">管理所有合作邀請與 KOL 申請。</p>
      </motion.div>

      {loadErr && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadErr}</div>
      )}

      {loading ? (
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="border border-foreground/[0.08] py-20 text-center"
        >
          <p className="text-sm text-muted-foreground">載入中…</p>
        </motion.div>
      ) : (
        <>
          {/* ── Project filter strip ── */}
          <ProjectFilterStrip
            projects={allProjects}
            selected={selectedProject}
            totalCount={requests.length}
            onSelect={setSelectedProject}
          />

          {/* ── Section 1 — 待審核 KOL 申請 ── */}
          <AnimatePresence>
            {pendingProposals.length > 0 && (
              <motion.div
                key="pending-section"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    <p className="text-xs uppercase tracking-[0.3em] text-amber-700">待審核申請</p>
                  </div>
                  <span className="text-xs uppercase tracking-widest text-amber-700 border border-amber-200 bg-amber-50 px-2 py-0.5">
                    {pendingProposals.length} 待處理
                  </span>
                </div>

                <div className="border border-amber-200 bg-amber-50/40 overflow-hidden">
                  {/* If no project selected, group by project with headers */}
                  {selectedProject === null ? (
                    groupByProject(pendingProposals).map((g) => (
                      <div key={g.projectId}>
                        <ProjectGroupHeader name={g.projectName} />
                        <AnimatePresence>
                          {g.items.map((req, i) => (
                            <ProposalCard key={req.id} req={req} index={i} onAccept={handleAccept} onDecline={handleDecline} />
                          ))}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <AnimatePresence>
                      {pendingProposals.map((req, i) => (
                        <ProposalCard key={req.id} req={req} index={i} onAccept={handleAccept} onDecline={handleDecline} />
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Section 2 — Status tabs ── */}
          <div>
            {/* Tab strip */}
            <motion.div
              custom={3} initial="hidden" animate="visible" variants={fadeUp}
              className="flex border-b border-foreground/[0.08]"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-1.5 px-4 py-3 text-xs uppercase tracking-[0.2em] transition-colors duration-150 ${
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground/60'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {tab.label}
                    {tabCount[tab.id] > 0 && (
                      <span className={`ml-1 text-[0.6rem] px-1 py-px tabular-nums ${
                        isActive ? 'bg-foreground text-background' : 'bg-foreground/10 text-foreground/50'
                      }`}>
                        {tabCount[tab.id]}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                      />
                    )}
                  </button>
                )
              })}
            </motion.div>

            {/* Tab content */}
            <motion.div
              custom={4} initial="hidden" animate="visible" variants={fadeUp}
              className="border border-t-0 border-foreground/[0.08] bg-linen overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeTab}-${selectedProject ?? 'all'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                >
                  {renderTabContent()}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
