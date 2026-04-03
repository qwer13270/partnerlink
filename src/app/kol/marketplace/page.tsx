'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, ArrowRight, SlidersHorizontal, X, Check, Send } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type Project = {
  id: string
  merchant_user_id: string
  name: string
  subtitle: string | null
  district_label: string | null
  slug: string
  company_name: string | null
}

type ApiPayload   = { projects?: Project[]; error?: string }
type SentPayload  = { requests?: { project_id: string; status: string }[]; error?: string }

// ── Proposal modal ─────────────────────────────────────────────────────────
function ProposalModal({
  project,
  onClose,
  onConfirm,
}: {
  project: Project
  onClose: () => void
  onConfirm: (message: string) => Promise<void>
}) {
  const [message, setMessage]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    setError('')
    try {
      await onConfirm(message.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : '送出失敗，請再試一次。')
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-background border border-foreground/15 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-foreground/[0.08]">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">申請合作</p>
            <p className="text-base font-medium">{project.name}</p>
            {project.company_name && (
              <p className="text-xs text-muted-foreground mt-0.5">{project.company_name}</p>
            )}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message */}
        <div className="px-6 py-5">
          <label className="text-xs text-muted-foreground block mb-2">
            附上一段自我介紹，讓商家更快認識你 <span className="opacity-50">（選填）</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="例如：我專注於台北豪宅市場，受眾以 30–45 歲高收入族群為主…"
            rows={4}
            className="w-full border border-foreground/20 bg-transparent px-3 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-foreground transition-colors resize-none"
          />
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-3 w-3" />
            {submitting ? '送出中…' : '送出申請'}
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

// ── Page ───────────────────────────────────────────────────────────────────
export default function KolMarketplacePage() {
  const [projects, setProjects]       = useState<Project[]>([])
  const [loading, setLoading]         = useState(true)
  const [loadError, setLoadError]     = useState('')
  const [search, setSearch]           = useState('')
  const [proposingProject, setProposingProject] = useState<Project | null>(null)

  // Tracks project IDs where KOL has a pending/accepted sent request
  const [proposedIds, setProposedIds] = useState<Set<string>>(new Set())

  // Load published projects
  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      setLoading(true)
      setLoadError('')
      try {
        const res = await fetch('/api/kol/projects', { signal: controller.signal })
        const payload = (await res.json().catch(() => null)) as ApiPayload | null
        if (!res.ok) { setLoadError(payload?.error ?? '載入失敗。'); return }
        setProjects(payload?.projects ?? [])
      } catch (err) {
        if (!controller.signal.aborted) setLoadError(err instanceof Error ? err.message : '載入失敗。')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [])

  // Load existing sent requests so "已申請" persists across refresh
  useEffect(() => {
    async function loadSent() {
      try {
        const res = await fetch('/api/collaboration-requests?role=sent')
        const payload = (await res.json().catch(() => null)) as SentPayload | null
        if (!res.ok || !payload?.requests) return
        const ids = new Set(
          payload.requests
            .filter((r) => r.status === 'pending' || r.status === 'accepted')
            .map((r) => r.project_id),
        )
        setProposedIds(ids)
      } catch { /* non-fatal */ }
    }
    void loadSent()
  }, [])

  const filtered = projects.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.name.toLowerCase().includes(q) ||
      (p.company_name ?? '').toLowerCase().includes(q) ||
      (p.district_label ?? '').toLowerCase().includes(q)
    )
  })

  async function handlePropose(message: string) {
    if (!proposingProject) return
    const res = await fetch('/api/collaboration-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id:       proposingProject.id,
        merchant_user_id: proposingProject.merchant_user_id,
        message:          message || null,
      }),
    })
    const payload = (await res.json().catch(() => null)) as { error?: string } | null
    if (!res.ok) throw new Error(payload?.error ?? '申請送出失敗。')

    setProposedIds((prev) => new Set(prev).add(proposingProject.id))
    setProposingProject(null)
  }

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商案廣場</p>
        <h1 className="text-3xl font-serif mb-1">所有合作商案</h1>
        <p className="text-sm text-muted-foreground">
          瀏覽平台上所有開放申請的商案，找到最適合你受眾的合作機會。
        </p>
      </motion.div>

      {/* ── Search ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋商案、商家或地區…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </motion.div>

      {/* ── Results count ── */}
      {!loading && (
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground uppercase tracking-widest">
            共 {filtered.length} 個商案
          </p>
        </motion.div>
      )}

      {/* ── Error ── */}
      {loadError && (
        <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
          className="border border-foreground/15 py-20 text-center">
          <p className="text-sm text-muted-foreground">載入商案中…</p>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
          className="border border-foreground/15 py-20 text-center">
          <p className="text-sm text-muted-foreground">
            {projects.length === 0 ? '目前沒有開放申請的商案。' : '找不到符合條件的商案。'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const applied = proposedIds.has(project.id)

            return (
              <motion.div
                key={project.id}
                custom={3 + i} initial="hidden" animate="visible" variants={fadeUp}
                className="border border-foreground/15 hover:border-foreground/40 transition-colors duration-300 flex flex-col"
              >
                {/* Image placeholder */}
                <div className="h-24 bg-muted/40 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                  <p className="relative z-10 text-xs text-foreground/50 px-3 text-center leading-snug">
                    {project.company_name ?? '未知商家'}
                  </p>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-[0.7rem] text-muted-foreground mb-0.5">
                      {project.company_name ?? '未知商家'}
                    </p>
                    <h3 className="text-sm font-medium leading-snug">{project.name}</h3>
                    {project.subtitle && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{project.subtitle}</p>
                    )}
                  </div>

                  {project.district_label && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {project.district_label}
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-t border-foreground/10">
                    {applied ? (
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs uppercase tracking-widest">
                        <Check className="h-3 w-3" />
                        已申請
                      </div>
                    ) : (
                      <button
                        onClick={() => setProposingProject(project)}
                        className="w-full flex items-center justify-between px-4 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-foreground/85 transition-colors group"
                      >
                        <span>申請合作</span>
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ── Proposal modal ── */}
      <AnimatePresence>
        {proposingProject && (
          <ProposalModal
            project={proposingProject}
            onClose={() => setProposingProject(null)}
            onConfirm={handlePropose}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
