'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, X, ArrowUpRight, Trash2, Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { pinyin } from 'pinyin-pro'
import type { MerchantType } from '@/lib/merchant-application'
import { typeLabel } from '@/lib/merchant-application'
import { useMerchantType } from '@/hooks/useMerchantType'

// ── Types ───────────────────────────────────────────────────────────────────
type ProjectSummary = {
  id: string
  slug: string
  name: string
  type: string
  publishStatus: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

type ArchivedProjectSummary = {
  id: string
  name: string
  type: string
  archivedAt: string
  createdAt: string
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
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

function CreateModal({ onClose, onCreated, merchantType }: { onClose: () => void; onCreated: (id: string) => void; merchantType: MerchantType }) {
  const [name, setName]             = useState('')
  const [subtitle, setSubtitle]     = useState('')
  const [address, setAddress]       = useState('')
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
      body: JSON.stringify({ name: name.trim(), subtitle: subtitle.trim(), address: address.trim(), slug, type: merchantType }),
    })
    const d = await r.json() as { project?: { id: string }; error?: string }
    setCreating(false)
    if (!r.ok || !d.project?.id) { if (r.status === 409) { setSlugStatus('taken'); return }; toast.error(d.error ?? '建立失敗'); return }
    toast.success(`已建立新${typeLabel(merchantType ?? 'shop')}`)
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
              <h2 className="text-xl font-serif font-light">建立{typeLabel(merchantType ?? 'shop')}</h2>
            </div>
            <button type="button" onClick={onClose} className="mt-1 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.06] transition-all duration-150">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-8 py-6 space-y-5">
            {/* Name + Subtitle row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-2">{typeLabel(merchantType ?? 'shop')}名稱</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={merchantType === 'shop' ? '例：翠峰苑旗艦店' : '例：翠峰苑 A 棟'}
                  className="w-full rounded-lg border border-foreground/[0.12] bg-linen px-3 py-2.5 text-sm font-serif placeholder:text-muted-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-2">英文名稱</label>
                <input type="text" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="例：Jade Heights"
                  className="w-full rounded-lg border border-foreground/[0.12] bg-linen px-3 py-2.5 text-sm placeholder:text-muted-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors" />
              </div>
            </div>

            {/* Address — property only */}
            {merchantType === 'property' && (
              <div>
                <label className="block text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-2">物件地址</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="例：台北市信義區某路 XX 號"
                  className="w-full rounded-lg border border-foreground/[0.12] bg-linen px-3 py-2.5 text-sm placeholder:text-muted-foreground/30 focus:border-foreground/40 focus:outline-none transition-colors" />
              </div>
            )}

            {/* Slug */}
            <div className="pt-1 border-t border-foreground/[0.06]">
              <label className="block text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/60 mb-2 mt-4">網址 Slug</label>
              <div className={`flex rounded-lg border overflow-hidden transition-colors ${
                slugStatus === 'available' ? 'border-emerald-400/60' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-400/50' : 'border-foreground/[0.12] focus-within:border-foreground/40'
              }`}>
                <span className="flex items-center bg-foreground/[0.03] border-r border-foreground/10 px-3 text-[0.7rem] font-mono text-muted-foreground/50 whitespace-nowrap select-none">{merchantType === 'shop' ? '/shops/' : '/properties/'}</span>
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
              {creating ? '建立中…' : `建立${typeLabel(merchantType ?? 'shop')}`}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onNew, merchantType }: { onNew: () => void; merchantType: MerchantType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="flex items-end gap-10 mb-12 opacity-[0.15]">
        {merchantType === 'property'
          ? <ResidentialIcon className="h-28 w-28 text-foreground" />
          : <CommercialIcon  className="h-28 w-28 text-foreground" />
        }
      </div>
      <p className="text-[0.62rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/40 mb-4">
        GET STARTED
      </p>
      <h2 className="text-2xl font-serif font-light text-foreground mb-3">
        建立您的第一個{typeLabel(merchantType ?? 'shop')}
      </h2>
      <p className="text-sm text-muted-foreground/60 mb-10 max-w-xs leading-relaxed">
        開始行銷您的物件、連結 KOL，追蹤客戶詢問。
      </p>
      <button
        onClick={onNew}
        className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-5 py-2.5 inline-flex items-center gap-2 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150"
      >
        <Plus className="h-3.5 w-3.5" />
        建立{typeLabel(merchantType ?? 'shop')}
      </button>
    </motion.div>
  )
}

// ── Project card ───────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onDelete }: { project: ProjectSummary; index: number; onDelete: (p: ProjectSummary) => void }) {
  const isResidential = project.type === 'property'
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
        aria-label={`刪除${typeLabel(project.type)}`}
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
              <p className="text-sm font-medium">刪除{typeLabel(project.type)}</p>
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

// ── Archived project card ─────────────────────────────────────────────────────
function ArchivedProjectCard({ project, index }: { project: ArchivedProjectSummary; index: number }) {
  const isResidential = project.type === 'property'
  const archivedDate  = new Date(project.archivedAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group/archived"
    >
      <Link
        href={`/merchant/projects/archived/${project.id}`}
        className="block rounded-xl border border-foreground/[0.06] bg-foreground/[0.02] p-5 opacity-60 hover:opacity-80 hover:border-foreground/[0.12] hover:shadow-sm transition-all duration-200"
      >
        {/* Top row */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-11 h-11 rounded-xl border border-foreground/[0.06] bg-foreground/[0.04] flex items-center justify-center text-foreground/25">
            {isResidential
              ? <ResidentialIcon className="h-5 w-5" />
              : <CommercialIcon  className="h-5 w-5" />
            }
          </div>
          <span className="text-[0.72rem] font-medium px-2 py-0.5 rounded border bg-foreground/[0.04] text-foreground/35 border-foreground/[0.08] inline-flex items-center gap-1.5">
            <Archive className="h-3 w-3" />
            已封存
          </span>
        </div>

        {/* Name */}
        <div className="mb-4">
          <h2 className="font-serif text-[0.98rem] leading-snug mb-1 truncate text-foreground/40">
            {project.name}
          </h2>
          <p className="text-[0.68rem] font-mono text-muted-foreground/30 truncate">
            {new Date(project.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' })} 建立
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3.5 border-t border-foreground/[0.05]">
          <span className="text-[0.68rem] font-mono text-muted-foreground/30">
            封存於 {archivedDate}
          </span>
          <ArrowUpRight className="w-3.5 h-3.5 text-foreground/20 opacity-0 group-hover/archived:opacity-100 -translate-x-1 group-hover/archived:translate-x-0 transition-all duration-200" />
        </div>
      </Link>
    </motion.div>
  )
}

// ── Archived empty state ──────────────────────────────────────────────────────
function ArchivedEmptyState({ merchantType }: { merchantType: MerchantType }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="mb-8 opacity-[0.10]">
        <Archive className="h-20 w-20 text-foreground mx-auto" />
      </div>
      <p className="text-[0.62rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/40 mb-4">
        ARCHIVE
      </p>
      <h2 className="text-xl font-serif font-light text-foreground mb-3">
        沒有已封存的{typeLabel(merchantType ?? 'shop')}
      </h2>
      <p className="text-sm text-muted-foreground/50 max-w-xs leading-relaxed">
        封存的{typeLabel(merchantType ?? 'shop')}會保留所有客戶與佣金紀錄，並顯示於此處。
      </p>
    </motion.div>
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
  const router = useRouter()
  const [tab, setTab] = useState<'active' | 'archived'>('active')

  const merchantType = useMerchantType()

  const [projects, setProjects]             = useState<ProjectSummary[]>([])
  const [loadingActive, setLoadingActive]   = useState(true)

  const [archived, setArchived]             = useState<ArchivedProjectSummary[]>([])
  const [loadingArchived, setLoadingArchived] = useState(false)
  const archivedFetched                     = useRef(false)

  const [showModal, setShowModal]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProjectSummary | null>(null)

  // Fetch active projects on mount
  useEffect(() => {
    let active = true
    fetch('/api/merchant/projects', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { projects?: ProjectSummary[] }) => {
        if (!active) return
        setProjects(Array.isArray(d.projects) ? d.projects : [])
        setLoadingActive(false)
      })
      .catch(() => { if (active) setLoadingActive(false) })
    return () => { active = false }
  }, [])

  // Fetch archived projects lazily on first tab switch
  useEffect(() => {
    if (tab !== 'archived' || archivedFetched.current) return
    archivedFetched.current = true
    setLoadingArchived(true)
    fetch('/api/merchant/projects/archived', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { projects?: ArchivedProjectSummary[] }) => {
        setArchived(Array.isArray(d.projects) ? d.projects : [])
        setLoadingArchived(false)
      })
      .catch(() => setLoadingArchived(false))
  }, [tab])

  function handleCreated(id: string) {
    setShowModal(false)
    startTransition(() => router.push(`/merchant/projects/${id}/edit?new=1`))
  }

  function handleDeleted(id: string) {
    setDeleteTarget(null)
    setProjects(prev => prev.filter(p => p.id !== id))
    // Invalidate archive cache so it refreshes next visit
    archivedFetched.current = false
  }

  return (
    <>
      <div className="max-w-3xl">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          <p className="text-[0.58rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/40 mb-3">
            MERCHANT / PROJECTS
          </p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-serif font-light" style={{ fontSize: 'clamp(28px, 4vw, 38px)', lineHeight: 1.1 }}>
              {typeLabel(merchantType ?? 'shop')}管理
            </h1>
            {tab === 'active' && (
              <button
                onClick={() => setShowModal(true)}
                className="rounded-lg bg-foreground text-background font-medium text-[0.78rem] px-4 py-2.5 inline-flex items-center gap-2 hover:bg-foreground/88 active:scale-[0.97] transition-all duration-150 shrink-0 mb-0.5"
              >
                <Plus className="h-3.5 w-3.5" />
                新增{typeLabel(merchantType ?? 'shop')}
              </button>
            )}
          </div>
          <div className="mt-6 h-px bg-foreground/[0.08]" />
        </motion.div>

        {/* ── Tab switcher ── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-1 mb-8 w-fit"
        >
          {(['active', 'archived'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative px-4 py-1.5 rounded-lg text-[0.72rem] font-mono tracking-[0.08em] transition-all duration-200 ${
                tab === t
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.05]'
              }`}
            >
              {t === 'active' ? '進行中' : '已封存'}
              {t === 'active' && !loadingActive && projects.length > 0 && (
                <span className={`ml-1.5 text-[0.65rem] font-mono ${tab === 'active' ? 'text-background/50' : 'text-muted-foreground/35'}`}>
                  {projects.length}
                </span>
              )}
              {t === 'archived' && !loadingArchived && archivedFetched.current && archived.length > 0 && (
                <span className={`ml-1.5 text-[0.65rem] font-mono ${tab === 'archived' ? 'text-background/50' : 'text-muted-foreground/35'}`}>
                  {archived.length}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {tab === 'active' ? (
            <motion.div
              key="active"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loadingActive ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map(i => <CardSkeleton key={i} index={i} />)}
                </div>
              ) : projects.length === 0 ? (
                <EmptyState onNew={() => setShowModal(true)} merchantType={merchantType ?? 'property'} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {projects.map((p, i) => (
                    <ProjectCard key={p.id} project={p} index={i} onDelete={setDeleteTarget} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="archived"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {loadingArchived ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[0, 1, 2].map(i => <CardSkeleton key={i} index={i} />)}
                </div>
              ) : archived.length === 0 ? (
                <ArchivedEmptyState merchantType={merchantType ?? 'property'} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {archived.map((p, i) => (
                    <ArchivedProjectCard key={p.id} project={p} index={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showModal && merchantType && (
          <CreateModal onClose={() => setShowModal(false)} onCreated={handleCreated} merchantType={merchantType} />
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
