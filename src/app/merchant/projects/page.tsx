'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Mock data ────────────────────────────────────────────────────────────────
type ProjectStatus = 'active' | 'presale' | 'soldout'

const PROJECTS: {
  id: string; slug: string; name: string; rate: string; status: ProjectStatus
  kolCount: number; totalBookings: number; totalSales: number; createdDate: string
}[] = [
  {
    id: 'prop-001',
    slug: 'light-river',
    name: '璞真建設 — 光河',
    rate: '3.5%',
    status: 'active',
    kolCount: 3,
    totalBookings: 45,
    totalSales: 6,
    createdDate: '2025-08-01',
  },
  {
    id: 'prop-005',
    slug: 'ruentex-dufeng',
    name: '潤泰敦峰',
    rate: '4.2%',
    status: 'presale',
    kolCount: 2,
    totalBookings: 22,
    totalSales: 2,
    createdDate: '2025-11-15',
  },
]

const STATUS_CFG: Record<ProjectStatus, { label: string; color: string }> = {
  active:  { label: '銷售中', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  presale: { label: '預售中', color: 'text-blue-700 border-blue-200 bg-blue-50'          },
  soldout: { label: '已售完', color: 'text-muted-foreground border-border'               },
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MerchantProjectsPage() {
  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">商案管理</h1>
        <p className="text-sm text-muted-foreground mt-2">管理您在平台上刊登的商案。</p>
      </motion.div>

      {/* ── Projects list ── */}
      <div className="border border-border divide-y divide-border">
        {PROJECTS.map((project, i) => {
          const cfg = STATUS_CFG[project.status]
          return (
            <motion.div
              key={project.id}
              custom={1 + i} initial="hidden" animate="visible" variants={fadeUp}
              className="px-5 py-6"
            >
              {/* Name + status */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-base font-medium">{project.name}</h2>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    佣金比率 {project.rate}
                    <span className="mx-1.5 opacity-30">·</span>
                    刊登日 {project.createdDate}
                  </p>
                </div>
                <span className={`text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${cfg.color}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: '合作 KOL',  value: project.kolCount      },
                  { label: '累計預約',  value: project.totalBookings  },
                  { label: '累計成交',  value: project.totalSales     },
                ].map((s) => (
                  <div key={s.label} className="border border-border px-3 py-3 text-center">
                    <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-serif mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Link
                  href={`/properties/${project.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest border border-foreground px-3 py-2 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150 group"
                >
                  查看商案
                  <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100" />
                </Link>
                <button className="text-[0.65rem] uppercase tracking-widest text-muted-foreground border border-border px-3 py-2 hover:border-foreground hover:text-foreground transition-colors duration-150">
                  編輯商案
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

    </div>
  )
}
