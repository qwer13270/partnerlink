'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ExternalLink, Plus, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { pinyin } from 'pinyin-pro'

type ProjectSummary = {
  id: string
  slug: string
  name: string
  templateKey: string
  publishStatus: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const STATUS_CFG: Record<ProjectSummary['publishStatus'], { label: string; color: string }> = {
  draft:     { label: '草稿',  color: 'text-amber-700 border-amber-200 bg-amber-50' },
  published: { label: '已發布', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
}

const TEMPLATE_LABELS: Record<string, string> = {
  'tongchuang-wing':            '建案模板',
  'tongchuang-wing-commercial': '商案模板',
}

// ── Template icons ────────────────────────────────────────────────────────────

function ResidentialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Peaked roof */}
      <path d="M6 22 L24 7 L42 22" stroke="currentColor" />
      {/* Building body */}
      <rect x="10" y="22" width="28" height="19" stroke="currentColor" />
      {/* Windows row 1 */}
      <rect x="14" y="26" width="7" height="6" stroke="currentColor" />
      <rect x="27" y="26" width="7" height="6" stroke="currentColor" />
      {/* Door */}
      <rect x="19" y="33" width="10" height="8" stroke="currentColor" />
    </svg>
  )
}

function CommercialIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {/* Building outline */}
      <rect x="6" y="6" width="36" height="36" stroke="currentColor" />
      {/* Horizontal floors */}
      <line x1="6"  y1="16" x2="42" y2="16" stroke="currentColor" />
      <line x1="6"  y1="26" x2="42" y2="26" stroke="currentColor" />
      <line x1="6"  y1="36" x2="42" y2="36" stroke="currentColor" />
      {/* Vertical column */}
      <line x1="24" y1="6"  x2="24" y2="42" stroke="currentColor" />
    </svg>
  )
}

// ── Slug helpers (client-side mirror of slugifyPropertyName) ──────────────────

function clientSlugify(value: string) {
  const transliterated = pinyin(value, { toneType: 'none', separator: ' ', nonZh: 'consecutive' })
  return transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Create project modal ──────────────────────────────────────────────────────

type TemplateKey = 'tongchuang-wing' | 'tongchuang-wing-commercial'
type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

const TEMPLATE_OPTIONS: { key: TemplateKey; label: string; sublabel: string; num: string }[] = [
  { key: 'tongchuang-wing',            label: '建案模板', sublabel: '住宅 · 建案', num: '01' },
  { key: 'tongchuang-wing-commercial', label: '商案模板', sublabel: '商業 · 地產', num: '02' },
]

function CreateProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (id: string) => void
}) {
  const [template, setTemplate]       = useState<TemplateKey>('tongchuang-wing')
  const [name, setName]               = useState('')
  const [slug, setSlug]               = useState('')
  const [slugStatus, setSlugStatus]   = useState<SlugStatus>('idle')
  const [creating, setCreating]       = useState(false)
  const slugTouched                   = useRef(false)

  // Auto-generate slug from name (only when user hasn't manually edited)
  useEffect(() => {
    if (slugTouched.current) return
    setSlug(clientSlugify(name))
  }, [name])

  // Debounced availability check with AbortController — prevents stale responses
  // from overwriting the status when the user types faster than the fetch resolves.
  useEffect(() => {
    if (!slug) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(`/api/merchant/projects/slug-check?slug=${encodeURIComponent(slug)}`, { signal: controller.signal })
        const data = await res.json() as { available?: boolean; reason?: string }
        if (data.reason === 'invalid') setSlugStatus('invalid')
        else setSlugStatus(data.available ? 'available' : 'taken')
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) setSlugStatus('idle')
      }
    }, 400)
    return () => { clearTimeout(timer); controller.abort() }
  }, [slug])

  const canSubmit = name.trim().length > 0 && slugStatus === 'available' && !creating

  async function handleSubmit() {
    if (!canSubmit) return
    setCreating(true)
    const res  = await fetch('/api/merchant/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), slug, templateKey: template }),
    })
    const data = await res.json() as { ok?: boolean; project?: { id: string }; error?: string }
    setCreating(false)
    if (!res.ok || !data.project?.id) {
      if (res.status === 409) { setSlugStatus('taken'); return }
      toast.error(data.error ?? '建立商案失敗')
      return
    }
    toast.success('已建立新商案')
    onCreated(data.project.id)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto w-full max-w-lg bg-background border border-foreground/20"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-7 pb-5 border-b border-foreground/10">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-0.5">新增</p>
              <h2 className="text-lg font-serif">建立商案</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-0.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="關閉"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-8 py-6 space-y-7">
            {/* ── Template picker ── */}
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">
                選擇模板
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATE_OPTIONS.map(opt => {
                  const selected = template === opt.key
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setTemplate(opt.key)}
                      className={`relative flex flex-col justify-between p-5 h-44 border text-left transition-colors duration-150 ${
                        selected
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-foreground border-foreground/20 hover:border-foreground/50'
                      }`}
                    >
                      {/* Number — top right */}
                      <span className={`font-serif text-xs tracking-[0.3em] self-end ${
                        selected ? 'text-background/35' : 'text-muted-foreground/50'
                      }`}>
                        {opt.num}
                      </span>

                      {/* Architectural icon */}
                      {opt.key === 'tongchuang-wing' ? (
                        <ResidentialIcon className={`h-10 w-10 ${selected ? 'text-background' : 'text-foreground/65'}`} />
                      ) : (
                        <CommercialIcon className={`h-10 w-10 ${selected ? 'text-background' : 'text-foreground/65'}`} />
                      )}

                      {/* Label */}
                      <div>
                        <p className="[font-family:var(--font-serif-tc)] text-[0.95rem] leading-snug">
                          {opt.label}
                        </p>
                        <p className={`text-xs uppercase tracking-[0.2em] mt-1 ${
                          selected ? 'text-background/50' : 'text-muted-foreground'
                        }`}>
                          {opt.sublabel}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Project name ── */}
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">
                商案名稱
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例：信義苑 A 棟"
                className="w-full border border-foreground/20 bg-background px-4 py-3 text-sm placeholder:text-muted-foreground/35 focus:border-foreground/50 focus:outline-none transition-colors"
              />
            </div>

            {/* ── Slug ── */}
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-muted-foreground mb-2">
                網址 Slug
              </label>
              <div className={`flex border transition-colors ${
                slugStatus === 'available'
                  ? 'border-emerald-400/60'
                  : slugStatus === 'taken' || slugStatus === 'invalid'
                    ? 'border-red-400/50'
                    : 'border-foreground/20 focus-within:border-foreground/50'
              }`}>
                <span className="flex items-center bg-foreground/[0.03] border-r border-foreground/10 px-3 text-xs font-mono text-muted-foreground whitespace-nowrap select-none">
                  /properties/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => {
                    slugTouched.current = true
                    setSlug(e.target.value)
                  }}
                  placeholder="project-slug"
                  spellCheck={false}
                  className="flex-1 min-w-0 bg-background px-3 py-3 text-sm font-mono placeholder:text-muted-foreground/35 focus:outline-none"
                />
                {/* Status indicator */}
                <div className="flex items-center pr-3 shrink-0">
                  {slugStatus === 'checking' && (
                    <div className="h-3.5 w-3.5 rounded-full border border-foreground/20 border-t-foreground/70 animate-spin" />
                  )}
                  {slugStatus === 'available' && (
                    <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l3.5 3.5L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {(slugStatus === 'taken' || slugStatus === 'invalid') && (
                    <svg className="h-3.5 w-3.5 text-red-400" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Inline status message — reserve height to avoid layout jump */}
              <div className="mt-1.5 h-4">
                {slugStatus === 'available' && (
                  <p className="text-xs text-emerald-600">可使用</p>
                )}
                {slugStatus === 'taken' && (
                  <p className="text-xs text-red-500">此 slug 已被使用，請更換</p>
                )}
                {slugStatus === 'invalid' && (
                  <p className="text-xs text-red-500">請使用英數字及連字號（-）</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-7 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] border border-foreground px-6 py-3 bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-25 disabled:cursor-not-allowed"
            >
              {creating ? '建立中…' : '建立商案'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function MerchantProjectsPage() {
  const router = useRouter()
  const [projects, setProjects]   = useState<ProjectSummary[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProjects() {
      setLoading(true)
      const response = await fetch('/api/merchant/projects', { cache: 'no-store' })
      const payload  = await response.json().catch(() => ({})) as { projects?: ProjectSummary[]; error?: string }

      if (!active) return

      if (!response.ok) {
        toast.error(payload.error ?? '載入商案失敗')
        setLoading(false)
        return
      }

      setProjects(Array.isArray(payload.projects) ? payload.projects : [])
      setLoading(false)
    }

    void loadProjects()
    return () => { active = false }
  }, [])

  function handleCreated(id: string) {
    setShowModal(false)
    startTransition(() => router.push(`/merchant/projects/${id}/edit`))
  }

  return (
    <>
      <div className="space-y-12">
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
            <h1 className="text-3xl font-serif">商案管理</h1>
            <p className="text-sm text-muted-foreground mt-2">建立並管理商案頁面。</p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 self-start text-xs uppercase tracking-[0.2em] border border-foreground px-4 py-3 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
          >
            <Plus className="h-3.5 w-3.5" />
            新增商案
          </button>
        </motion.div>

        <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden divide-y divide-foreground/[0.06]">
          {loading ? (
            <div className="px-5 py-14 text-sm text-muted-foreground">載入商案中…</div>
          ) : projects.length === 0 ? (
            <div className="px-5 py-14 space-y-3">
              <p className="text-lg font-serif">尚未建立任何商案</p>
              <p className="text-sm text-muted-foreground">點選上方按鈕選擇模板並建立第一個商案。</p>
            </div>
          ) : (
            projects.map((project, i) => {
              const cfg          = STATUS_CFG[project.publishStatus]
              const templateLabel = TEMPLATE_LABELS[project.templateKey] ?? project.templateKey

              return (
                <motion.div
                  key={project.id}
                  custom={1 + i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="px-5 py-9"
                >
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <h2 className="text-base font-medium">{project.name}</h2>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {templateLabel}
                        <span className="mx-1.5 opacity-30">·</span>
                        最後更新 {new Date(project.updatedAt).toLocaleDateString('zh-TW')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 font-mono">{project.slug}</p>
                    </div>
                    <span className={`text-xs uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${cfg.color}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-5">
                    {[
                      { label: '模板', value: templateLabel },
                      { label: '狀態', value: cfg.label },
                      { label: '更新日', value: new Date(project.updatedAt).toLocaleDateString('zh-TW') },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-xl border border-foreground/[0.08] bg-background px-3 py-2.5 text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{stat.label}</p>
                        <p className="text-sm font-serif mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {project.publishStatus === 'published' ? (
                      <Link
                        href={`/properties/${project.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] border border-foreground px-3 py-2 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150 group"
                      >
                        查看商案
                        <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                      </Link>
                    ) : (
                      <span className="text-xs uppercase tracking-[0.3em] border border-dashed border-foreground/20 px-3 py-2 text-muted-foreground">
                        草稿尚未公開
                      </span>
                    )}
                    <Link
                      href={`/merchant/projects/${project.id}`}
                      className="text-xs uppercase tracking-[0.3em] text-muted-foreground border border-border px-3 py-2 hover:border-foreground hover:text-foreground transition-colors duration-150"
                    >
                      分析
                    </Link>
                    <Link
                      href={`/merchant/projects/${project.id}/edit`}
                      className="text-xs uppercase tracking-[0.3em] text-muted-foreground border border-border px-3 py-2 hover:border-foreground hover:text-foreground transition-colors duration-150"
                    >
                      編輯內容
                    </Link>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
