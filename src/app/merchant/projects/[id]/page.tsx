'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ArrowUpRight,
  Users, BarChart3, Pencil, Handshake,
  Eye, BrainCircuit,
} from 'lucide-react'
import { toast } from 'sonner'

type ProjectDetail = {
  id: string
  name: string
  publishStatus: 'draft' | 'published'
  districtLabel: string
}

// ── Section definitions ─────────────────────────────────────────────────────
const MANAGE_CARDS = [
  {
    key:   'customers',
    index: '01',
    label: '客戶名單',
    desc:  '詢問客戶、成交確認、KOL 歸因',
    href:  (id: string) => `/merchant/projects/${id}/customers`,
    Icon:  Users,
  },
  {
    key:   'kols',
    index: '02',
    label: 'KOL 合作',
    desc:  '探索、邀請 KOL，管理合作申請',
    href:  (id: string) => `/merchant/projects/${id}/kols`,
    Icon:  Handshake,
  },
  {
    key:   'edit',
    index: '03',
    label: '商案編輯',
    desc:  '內容模組、圖片、發布設定',
    href:  (id: string) => `/merchant/projects/${id}/edit`,
    Icon:  Pencil,
  },
  {
    key:   'preview',
    index: '04',
    label: '預覽頁面',
    desc:  '查看商案對外展示效果',
    href:  (id: string) => `/merchant/projects/${id}/preview`,
    Icon:  Eye,
  },
]

const ANALYSE_CARDS = [
  {
    key:   'audience',
    index: '05',
    label: '受眾輪廓分析',
    desc:  'AI 歸納客戶特徵、來源與購買意向',
    href:  (id: string) => `/merchant/projects/${id}/audience`,
    Icon:  BrainCircuit,
  },
  {
    key:   'analytics',
    index: '06',
    label: '地區房市行情',
    desc:  '區域價格走勢、季度成交量與競品',
    href:  (id: string) => `/merchant/projects/${id}/analytics`,
    Icon:  BarChart3,
  },
]

// ── Animations ─────────────────────────────────────────────────────────────
const stagger = (i: number) => ({
  initial:    { opacity: 0, y: 12 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.42, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Card ────────────────────────────────────────────────────────────────────
function NavCard({
  card,
  projectId,
  animIndex,
  accent,
}: {
  card: (typeof MANAGE_CARDS)[number]
  projectId: string
  animIndex: number
  accent: 'manage' | 'analyse'
}) {
  const accentColor = accent === 'manage' ? '#1a1a1a' : '#7c5a1e'
  const accentBg    = accent === 'manage' ? 'rgba(26,26,26,0.04)' : 'rgba(196,145,58,0.05)'
  const accentLine  = accent === 'manage' ? 'rgba(26,26,26,0.12)' : 'rgba(196,145,58,0.2)'

  return (
    <motion.div {...stagger(animIndex)}>
      <Link
        href={card.href(projectId)}
        className="group flex items-center gap-0 h-full transition-colors duration-150"
        style={{ borderBottom: `1px solid ${accentLine}` }}
      >
        <div
          className="flex-1 flex items-center gap-5 px-5 py-5 transition-all duration-150"
          style={{ background: 'transparent' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = accentBg }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          {/* Index */}
          <span
            className="font-mono text-[0.62rem] tracking-[0.15em] w-7 shrink-0 select-none"
            style={{ color: `${accentColor}55` }}
          >
            {card.index}
          </span>

          {/* Icon */}
          <div
            className="w-8 h-8 flex items-center justify-center shrink-0 transition-colors duration-150"
            style={{ border: `1px solid ${accentLine}` }}
          >
            <card.Icon className="w-3.5 h-3.5" style={{ color: accentColor }} strokeWidth={1.5} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium leading-none mb-1" style={{ color: accentColor }}>
              {card.label}
            </p>
            <p className="text-[0.72rem] leading-relaxed" style={{ color: `${accentColor}70` }}>
              {card.desc}
            </p>
          </div>

          {/* Arrow */}
          <ArrowUpRight
            className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-60 transition-all duration-150 -translate-x-1 group-hover:translate-x-0"
            style={{ color: accentColor }}
          />
        </div>
      </Link>
    </motion.div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function ProjectHubPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      setLoading(true)
      const res = await fetch(`/api/merchant/projects/${id}`, { cache: 'no-store' })
      const payload = await res.json().catch(() => ({}))
      if (!active) return
      if (!res.ok) { toast.error(payload.error ?? '載入商案失敗'); setLoading(false); return }
      setProject(payload.project ?? null)
      setLoading(false)
    }
    void load()
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-4 h-4 border border-foreground/20 border-t-foreground/60 rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-sm text-muted-foreground">找不到這個商案。</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-12">

      {/* ── Back ── */}
      <motion.div {...stagger(0)}>
        <Link
          href="/merchant/projects"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="h-3 w-3" />
          商案列表
        </Link>
      </motion.div>

      {/* ── Header ── */}
      <motion.div {...stagger(1)}>
        <div className="flex items-start justify-between gap-4 pb-6"
          style={{ borderBottom: '1px solid rgba(26,26,26,0.1)' }}>
          <div>
            <p className="text-[0.62rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/50 mb-3">
              PROJECT
            </p>
            <h1 className="font-serif font-light leading-tight" style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
              {project.name}
            </h1>
            {project.districtLabel && (
              <p className="text-muted-foreground mt-2 text-sm">{project.districtLabel}</p>
            )}
          </div>
          <span className={`shrink-0 mt-1 text-[0.7rem] font-medium px-2.5 py-1 rounded-full border ${
            project.publishStatus === 'published'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              : 'bg-amber-50 text-amber-700 border-amber-200/60'
          }`}>
            {project.publishStatus === 'published' ? '已發布' : '草稿'}
          </span>
        </div>
      </motion.div>

      {/* ── MANAGE section ── */}
      <div className="space-y-0">
        {/* Section header */}
        <motion.div {...stagger(2)} className="flex items-center gap-3 mb-2">
          <span className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-foreground/30">
            MANAGE
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(26,26,26,0.08)' }} />
        </motion.div>

        {/* Cards */}
        <div
          style={{
            border: '1px solid rgba(26,26,26,0.1)',
            borderBottom: 'none',
          }}
        >
          {MANAGE_CARDS.map((card, i) => (
            <NavCard
              key={card.key}
              card={card}
              projectId={id}
              animIndex={3 + i}
              accent="manage"
            />
          ))}
        </div>
      </div>

      {/* ── ANALYSE section ── */}
      <div className="space-y-0">
        {/* Section header */}
        <motion.div {...stagger(8)} className="flex items-center gap-3 mb-2">
          <span className="text-[0.6rem] font-mono uppercase tracking-[0.5em]" style={{ color: 'rgba(196,145,58,0.6)' }}>
            ANALYSE
          </span>
          <div className="flex-1 h-px" style={{ background: 'rgba(196,145,58,0.15)' }} />
        </motion.div>

        {/* Cards */}
        <div style={{ border: '1px solid rgba(196,145,58,0.18)', borderBottom: 'none' }}>
          {ANALYSE_CARDS.map((card, i) => (
            <NavCard
              key={card.key}
              card={card}
              projectId={id}
              animIndex={9 + i}
              accent="analyse"
            />
          ))}
        </div>
      </div>

    </div>
  )
}
