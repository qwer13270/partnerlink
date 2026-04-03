'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, X, ArrowUpRight, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { pinyin } from 'pinyin-pro'

// ── Types ───────────────────────────────────────────────────────────────────
type ProjectSummary = {
  id: string
  slug: string
  name: string
  templateKey: string
  publishStatus: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

// ── Template icons ───────────────────────────────────────────────────────────
function ResidentialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 22 L24 7 L42 22" stroke="currentColor" />
      <rect x="10" y="22" width="28" height="19" stroke="currentColor" />
      <rect x="14" y="26" width="7" height="6" stroke="currentColor" />
      <rect x="27" y="26" width="7" height="6" stroke="currentColor" />
      <rect x="19" y="33" width="10" height="8" stroke="currentColor" />
    </svg>
  )
}

function CommercialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="6" y="6" width="36" height="36" stroke="currentColor" />
      <line x1="6"  y1="16" x2="42" y2="16" stroke="currentColor" />
      <line x1="6"  y1="26" x2="42" y2="26" stroke="currentColor" />
      <line x1="6"  y1="36" x2="42" y2="36" stroke="currentColor" />
      <line x1="24" y1="6"  x2="24" y2="42" stroke="currentColor" />
    </svg>
  )
}

// ── Slug helpers ─────────────────────────────────────────────────────────────
function clientSlugify(value: string) {
  const t = pinyin(value, { toneType: 'none', separator: ' ', nonZh: 'consecutive' })
  return t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

// ── Create modal ─────────────────────────────────────────────────────────────
type TemplateKey = 'tongchuang-wing' | 'tongchuang-wing-commercial'
type SlugStatus  = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const TEMPLATES: { key: TemplateKey; label: string; sub: string; num: string }[] = [
  { key: 'tongchuang-wing',            label: '建案模板', sub: '住宅 · 建案', num: '01' },
  { key: 'tongchuang-wing-commercial', label: '商案模板', sub: '商業 · 地產', num: '02' },
]

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [template, setTemplate]     = useState<TemplateKey>('tongchuang-wing')
  const [name, setName]             = useState('')
  const [slug, setSlug]             = useState('')
  const [slugStatus, setSlugStatus] = useState<SlugStatus>('idle')
  const [creating, setCreating]     = useState(false)
  const slugTouched                 = useRef(false)

  useEffect(() => { if (!slugTouched.current) setSlug(clientSlugify(name)) }, [name])

  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/merchant/projects/slug-check?slug=${encodeURIComponent(slug)}`, { signal: ctrl.signal })
        const d = await r.json() as { available?: boolean; reason?: string }
        if (d.reason === 'invalid') setSlugStatus('invalid')
        else setSlugStatus(d.available ? 'available' : 'taken')
      } catch (e) { if (!(e instanceof DOMException && e.name === 'AbortError')) setSlugStatus('idle') }
    }, 400)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [slug])

  const canSubmit = name.trim().length > 0 && slugStatus === 'available' && !creating

  async function handleSubmit() {
    if (!canSubmit) return
    setCreating(true)
    const r = await fetch('/api/merchant/projects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), slug, templateKey: template }),
    })
    const d = await r.json() as { project?: { id: string }; error?: string }
    setCreating(false)
    if (!r.ok || !d.project?.id) { if (r.status === 409) { setSlugStatus('taken'); return }; toast.error(d.error ?? '建立失敗'); return }
    toast.success('已建立新商案')
    onCreated(d.project.id)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.99 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto w-full max-w-lg bg-background border border-foreground/20 shadow-2xl rounded-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-foreground/10">
            <div>
              <p className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-1">新增</p>
              <h2 className="text-xl font-serif font-light">建立商案</h2>
            </div>
            <button type="button" onClick={onClose} className="mt-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.06] transition-all duration-150">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-8 py-6 space-y-7">
            {/* Template */}
            <div>
              <p className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-3">選擇模板</p>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map(opt => {
                  const sel = template === opt.key
                  return (
                    <button key={opt.key} type="button" onClick={() => setTemplate(opt.key)}
                      className={`flex flex-col justify-between p-5 h-44 rounded-xl border text-left transition-all duration-150 ${
                        sel ? 'bg-foreground text-background border-foreground' : 'bg-linen border-foreground/[0.08] hover:border-foreground/30 hover:shadow-sm'
                      }`}>
                      <span className={`font-mono text-[0.65rem] tracking-[0.3em] self-end ${sel ? 'text-background/35' : 'text-muted-foreground/40'}`}>{opt.num}</span>
                      {opt.key === 'tongchuang-wing'
                        ? <ResidentialIcon className={`h-10 w-10 ${sel ? 'text-background' : 'text-foreground/55'}`} />
                        : <CommercialIcon  className={`h-10 w-10 ${sel ? 'text-background' : 'text-foreground/55'}`} />
                      }
                      <div>
                        <p className="font-serif text-[0.95rem] leading-none mb-1.5">{opt.label}</p>
                        <p className={`text-[0.65rem] font-mono uppercase tracking-[0.2em] ${sel ? 'text-background/50' : 'text-muted-foreground'}`}>{opt.sub}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-2">商案名稱</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例：信義苑 A 棟"
                className="w-full rounded-lg border border-foreground/[0.12] bg-linen px-4 py-3 text-sm font-serif placeholder:text-muted-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors" />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-2">網址 Slug</label>
              <div className={`flex rounded-lg border overflow-hidden transition-colors ${
                slugStatus === 'available' ? 'border-emerald-400/60' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-400/50' : 'border-foreground/[0.12] focus-within:border-foreground/40'
              }`}>
                <span className="flex items-center bg-foreground/[0.03] border-r border-foreground/10 px-3 text-[0.7rem] font-mono text-muted-foreground/50 whitespace-nowrap select-none">/properties/</span>
                <input type="text" value={slug} onChange={e => { slugTouched.current = true; setSlug(e.target.value) }}
                  placeholder="project-slug" spellCheck={false}
                  className="flex-1 min-w-0 bg-linen px-3 py-3 text-sm font-mono placeholder:text-muted-foreground/30 focus:outline-none" />
                <div className="flex items-center pr-3 shrink-0">
                  {slugStatus === 'checking' && <div className="h-3.5 w-3.5 rounded-full border border-foreground/20 border-t-foreground/70 animate-spin" />}
                  {slugStatus === 'available' && <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 16 16" fill="none"><path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  {(slugStatus === 'taken' || slugStatus === 'invalid') && <svg className="h-3.5 w-3.5 text-red-400" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                </div>
              </div>
              <div className="mt-1.5 h-4">
                {slugStatus === 'available' && <p className="text-xs text-emerald-600">可使用</p>}
                {slugStatus === 'taken'     && <p className="text-xs text-red-500">此 slug 已被使用，請更換</p>}
                {slugStatus === 'invalid'   && <p className="text-xs text-red-500">請使用英數字及連字號（-）</p>}
              </div>
            </div>
          </div>

          <div className="px-8 pb-8 flex items-center justify-between">
            <button type="button" onClick={onClose}
              className="rounded-lg bg-black/[0.06] text-foreground/70 font-medium text-[0.78rem] px-4 py-2.5 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150">
              取消
            </button>
            <button type="button" onClick={handleSubmit} disabled={!canSubmit}
              className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-5 py-2.5 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 disabled:opacity-25 disabled:cursor-not-allowed">
              {creating ? '建立中…' : '建立商案'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="flex items-end gap-10 mb-12 opacity-[0.15]">
        <ResidentialIcon className="h-28 w-28 text-foreground" />
        <CommercialIcon  className="h-24 w-24 text-foreground" />
      </div>
      <p className="text-[0.62rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/40 mb-4">
        GET STARTED
      </p>
      <h2 className="text-2xl font-serif font-light text-foreground mb-3">
        建立您的第一個商案
      </h2>
      <p className="text-sm text-muted-foreground/60 mb-10 max-w-xs leading-relaxed">
        選擇建案或商案模板，開始行銷您的物件、連結 KOL，追蹤客戶詢問。
      </p>
      <button
        onClick={onNew}
        className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-5 py-2.5 inline-flex items-center gap-2 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150"
      >
        <Plus className="h-3.5 w-3.5" />
        建立商案
      </button>
    </motion.div>
  )
}

// ── Project card ───────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onDelete }: { project: ProjectSummary; index: number; onDelete: (p: ProjectSummary) => void }) {
  const isResidential = project.templateKey === 'tongchuang-wing'
  const updatedDate   = new Date(project.updatedAt).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })
  const published     = project.publishStatus === 'published'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="relative group/card"
    >
      <Link
        href={`/merchant/projects/${project.id}`}
        className="group block rounded-xl border border-foreground/[0.08] bg-linen shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 p-5"
      >
        {/* Top row: icon + status badge */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl border border-foreground/[0.08] bg-white flex items-center justify-center text-foreground/40 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {isResidential
              ? <ResidentialIcon className="h-5 w-5" />
              : <CommercialIcon  className="h-5 w-5" />
            }
          </div>
          <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded border ${
            published
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              : 'bg-amber-50 text-amber-700 border-amber-200/60'
          }`}>
            {published ? '已發布' : '草稿'}
          </span>
        </div>

        {/* Name & slug */}
        <div className="mb-4">
          <h2 className="font-serif text-[0.98rem] leading-snug mb-1 truncate text-foreground">
            {project.name}
          </h2>
          <p className="text-[0.68rem] font-mono text-muted-foreground/45 truncate">
            {project.slug}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-foreground/[0.06]">
          <span className="text-[0.68rem] font-mono text-muted-foreground/35">
            {updatedDate}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-foreground/20 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
        </div>
      </Link>

      {/* Delete button — appears on card hover */}
      <button
        onClick={(e) => { e.preventDefault(); onDelete(project) }}
        className="absolute top-3 right-3 p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover/card:opacity-100 transition-all duration-150 z-10"
        aria-label="刪除商案"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

// ── Delete confirmation modal ─────────────────────────────────────────────────
function DeleteModal({ project, onClose, onDeleted }: { project: ProjectSummary; onClose: () => void; onDeleted: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)

  async function handleConfirm() {
    setDeleting(true)
    const r = await fetch(`/api/merchant/projects/${project.id}`, { method: 'DELETE' })
    setDeleting(false)
    if (!r.ok) { toast.error('刪除失敗，請稍後再試'); return }
    toast.success(`「${project.name}」已封存`)
    onDeleted(project.id)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => { if (!deleting) onClose() }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.15 }}
          className="pointer-events-auto w-full max-w-sm rounded-xl border border-foreground/10 bg-background p-6 shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium">刪除商案</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                確定要刪除「{project.name}」？媒體檔案將刪除，所有客戶與佣金紀錄將保留。
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="rounded-lg bg-black/[0.06] px-4 py-2 text-[0.78rem] font-medium text-foreground/70 transition-all duration-150 hover:bg-black/[0.10] active:scale-[0.97] disabled:opacity-30"
            >
              取消
            </button>
            <button
              type="button"
              onClick={() => void handleConfirm()}
              disabled={deleting}
              className="rounded-lg bg-red-500 px-4 py-2 text-[0.78rem] font-medium text-white transition-all duration-150 hover:bg-red-600 active:scale-[0.97] disabled:opacity-50"
            >
              {deleting ? '刪除中…' : '確認刪除'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ── Card skeleton ──────────────────────────────────────────────────────────────
function CardSkeleton({ index }: { index: number }) {
  return (
    <div
      className="rounded-xl border border-foreground/[0.07] bg-linen p-5"
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="w-11 h-11 rounded-xl bg-foreground/[0.05] animate-pulse" />
        <div className="h-5 w-12 rounded bg-foreground/[0.05] animate-pulse" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-3.5 bg-foreground/[0.07] rounded animate-pulse" style={{ width: '65%' }} />
        <div className="h-2.5 bg-foreground/[0.04] rounded animate-pulse" style={{ width: '40%' }} />
      </div>
      <div className="pt-3.5 border-t border-foreground/[0.06]">
        <div className="h-2.5 bg-foreground/[0.04] rounded animate-pulse" style={{ width: '30%' }} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MerchantProjectsPage() {
  const router      = useRouter()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/merchant/projects', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { projects?: ProjectSummary[]; error?: string }) => {
        if (!active) return
        setProjects(Array.isArray(d.projects) ? d.projects : [])
        setLoading(false)
      })
      .catch(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function handleCreated(id: string) {
    setShowModal(false)
    startTransition(() => router.push(`/merchant/projects/${id}/edit`))
  }

  function handleDeleted(id: string) {
    setDeleteTarget(null)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <>
      <div className="max-w-3xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-10"
        >
          <p className="text-[0.58rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/40 mb-3">
            MERCHANT / PROJECTS
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-serif font-light" style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.1 }}>
              商案管理
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-4 py-2.5 inline-flex items-center gap-2 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 shrink-0 mb-0.5"
            >
              <Plus className="h-3.5 w-3.5" />
              新增商案
            </button>
          </div>
          <div className="mt-6 h-px bg-foreground/[0.08]" />
        </motion.div>

        {/* ── Content ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map(i => <CardSkeleton key={i} index={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onNew={() => setShowModal(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} onDelete={setDeleteTarget} />
            ))}
          </div>
        )}

      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && (
          <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
        )}
        {deleteTarget && (
          <DeleteModal
            project={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onDeleted={handleDeleted}
          />
        )}
      </AnimatePresence>
    </>
  )
}
