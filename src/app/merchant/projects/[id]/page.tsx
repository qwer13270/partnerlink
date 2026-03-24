'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Users, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

type ProjectDetail = {
  id: string
  name: string
  publishStatus: 'draft' | 'published'
  districtLabel: string
}

const CARDS = [
  {
    key: 'customers',
    index: '01',
    label: '客戶分析',
    title: '受眾輪廓分析',
    desc: 'AI 歸納客戶特徵、來源渠道與購買意向分佈。',
    href: (id: string) => `/merchant/projects/${id}/customers`,
    Icon: Users,
    bg: '#F4F6FB',
    border: 'rgba(67,97,238,0.18)',
    accent: '#4361EE',
    accentDim: 'rgba(67,97,238,0.12)',
    accentText: 'rgba(67,97,238,0.7)',
    iconBg: 'rgba(67,97,238,0.08)',
    iconBorder: 'rgba(67,97,238,0.2)',
  },
  {
    key: 'analytics',
    index: '02',
    label: '商案分析',
    title: '地區房市行情',
    desc: '區域價格走勢、季度成交量與周邊競品概況。',
    href: (id: string) => `/merchant/projects/${id}/analytics`,
    Icon: BarChart3,
    bg: '#FBF8F2',
    border: 'rgba(180,130,40,0.2)',
    accent: '#B8862A',
    accentDim: 'rgba(180,130,40,0.1)',
    accentText: 'rgba(180,130,40,0.75)',
    iconBg: 'rgba(180,130,40,0.08)',
    iconBorder: 'rgba(180,130,40,0.22)',
  },
]

export default function ProjectAnalysisPage() {
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
    <div className="max-w-2xl space-y-10">

      {/* ── Back ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Link
          href="/merchant/projects"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-150"
          style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase' }}
        >
          <ArrowLeft className="h-3 w-3" />
          商案列表
        </Link>
      </motion.div>

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.38em', textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: 8 }}>
              分析中心
            </p>
            <h1 className="font-serif font-light leading-tight" style={{ fontSize: 'clamp(26px, 4vw, 38px)' }}>
              {project.name}
            </h1>
            {project.districtLabel && (
              <p className="text-muted-foreground mt-2" style={{ fontSize: 13 }}>{project.districtLabel}</p>
            )}
          </div>
          <span
            className="shrink-0 mt-1"
            style={{
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', padding: '3px 10px',
              border: project.publishStatus === 'published' ? '1px solid rgba(52,168,83,0.35)' : '1px solid rgba(180,140,60,0.35)',
              color: project.publishStatus === 'published' ? '#2d8a4e' : '#9a7428',
              background: project.publishStatus === 'published' ? 'rgba(52,168,83,0.06)' : 'rgba(180,140,60,0.06)',
            }}
          >
            {project.publishStatus === 'published' ? '已發布' : '草稿'}
          </span>
        </div>
      </motion.div>

      {/* ── Cards ── */}
      <div className="grid sm:grid-cols-2 gap-3">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.14 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={card.href(id)}
              className="group flex flex-col gap-5 p-6 h-full transition-all duration-200 hover:shadow-sm"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}
            >
              {/* Icon + arrow */}
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 flex items-center justify-center"
                  style={{ background: card.iconBg, border: `1px solid ${card.iconBorder}` }}
                >
                  <card.Icon className="h-3.5 w-3.5" style={{ color: card.accent }} strokeWidth={1.5} />
                </div>
                <ArrowUpRight
                  className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                  style={{ color: card.accent }}
                />
              </div>

              {/* Text */}
              <div className="flex-1">
                <p style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: card.accentText, marginBottom: 6 }}>
                  {card.index} · {card.label}
                </p>
                <h2
                  className="font-serif font-light leading-snug"
                  style={{ fontSize: 19, color: 'hsl(var(--foreground))', marginBottom: 8 }}
                >
                  {card.title}
                </h2>
                <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                  {card.desc}
                </p>
              </div>

              {/* CTA */}
              <div
                className="flex items-center gap-1.5 group-hover:gap-2.5 transition-all duration-200"
                style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: card.accent }}
              >
                <span>進入</span>
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

    </div>
  )
}
