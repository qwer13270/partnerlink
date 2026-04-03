'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type Project = {
  id: string
  name: string
  districtLabel: string | null
  publishStatus: string
  merchantName: string
  kolCount: number
  createdAt: string
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    fetch('/api/admin/projects', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { ok?: boolean; projects?: Project[] }) => {
        if (d.ok) setProjects(d.projects ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const publishedCount = projects.filter(p => p.publishStatus === 'published').length

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">商案管理</h1>
        <p className="text-sm text-muted-foreground mt-2">平台上所有商家的商案與 KOL 合作概況。</p>
      </motion.div>

      {/* Summary badges */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        {loading ? (
          <div className="h-6 w-32 bg-foreground/[0.06] rounded animate-pulse" />
        ) : (
          <>
            <span className="text-xs uppercase tracking-[0.4em] border border-foreground/15 px-2 py-1 text-muted-foreground">
              共 {projects.length} 個商案
            </span>
            {publishedCount > 0 && (
              <span className="text-xs uppercase tracking-[0.4em] border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                {publishedCount} 個已發布
              </span>
            )}
            {projects.length - publishedCount > 0 && (
              <span className="text-xs uppercase tracking-[0.4em] border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">
                {projects.length - publishedCount} 個草稿
              </span>
            )}
          </>
        )}
      </motion.div>

      {/* Table */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden divide-y divide-foreground/[0.06]"
      >
        {/* Column headers */}
        <div className="px-5 py-2 grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">商案名稱</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">商家</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground w-20">狀態</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground w-16 text-right">KOL</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground w-24 text-right">建立日期</p>
        </div>

        {loading ? (
          [0, 1, 2, 3].map(i => (
            <div key={i} className="px-5 py-4 grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center">
              <div className="h-3.5 w-36 bg-foreground/[0.07] rounded animate-pulse" />
              <div className="h-3 w-28 bg-foreground/[0.05] rounded animate-pulse" />
              <div className="h-5 w-14 bg-foreground/[0.05] rounded animate-pulse" />
              <div className="h-3 w-6 bg-foreground/[0.04] rounded animate-pulse ml-auto" />
              <div className="h-3 w-20 bg-foreground/[0.04] rounded animate-pulse ml-auto" />
            </div>
          ))
        ) : projects.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground/50">
            目前尚無商案
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="px-5 py-4 grid grid-cols-[1fr_1fr_auto_auto_auto] gap-4 items-center hover:bg-muted/20 transition-colors duration-150">
              <div className="min-w-0">
                <p className="text-sm truncate">{project.name}</p>
                {project.districtLabel && (
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.districtLabel}</p>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{project.merchantName}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border w-20 text-center ${
                project.publishStatus === 'published'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-amber-50 text-amber-700 border-amber-200/60'
              }`}>
                {project.publishStatus === 'published' ? '已發布' : '草稿'}
              </span>
              <p className="text-sm font-mono w-16 text-right">{project.kolCount}</p>
              <p className="text-xs font-mono text-muted-foreground w-24 text-right">
                {new Date(project.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </motion.div>

    </div>
  )
}
