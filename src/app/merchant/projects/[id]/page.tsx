'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, FileEdit, BarChart2, Users, ChevronRight, TrendingUp, Building2, Star } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Mock project data ────────────────────────────────────────────────────────
const PROJECTS: Record<string, {
  name: string; location: string; status: string; statusLabel: string
  rate: string; kolCount: number; bookings: number; sales: number
  priceRange: string; floors: number; units: number
}> = {
  'prop-001': {
    name: '璞真建設 — 光河',
    location: '新北市板橋區',
    status: 'presale',
    statusLabel: '預售中',
    rate: '3.5%',
    kolCount: 3,
    bookings: 45,
    sales: 6,
    priceRange: 'NT$1,680萬 — NT$3,200萬',
    floors: 28,
    units: 168,
  },
  'prop-005': {
    name: '潤泰敦峰',
    location: '台北市大安區',
    status: 'active',
    statusLabel: '銷售中',
    rate: '4.2%',
    kolCount: 2,
    bookings: 22,
    sales: 2,
    priceRange: 'NT$3,800萬 — NT$7,200萬',
    floors: 32,
    units: 96,
  },
}

// ── Action cards ─────────────────────────────────────────────────────────────
const ACTIONS = [
  {
    key: 'edit',
    href: 'edit',
    icon: FileEdit,
    title: '編輯商案網站',
    titleEn: 'Edit Listing',
    desc: '更新商案資訊、圖片、戶型與銷售條件',
    accent: 'rgba(196,145,58,0.08)',
    accentBorder: 'rgba(196,145,58,0.25)',
    iconColor: '#c4913a',
  },
  {
    key: 'analytics',
    href: 'analytics',
    icon: BarChart2,
    title: '分析商案',
    titleEn: 'Market Analytics',
    desc: '查看地區周邊房價走勢、市場行情與競品分析',
    accent: 'rgba(26,26,26,0.04)',
    accentBorder: 'rgba(26,26,26,0.15)',
    iconColor: '#1a1a1a',
  },
  {
    key: 'customers',
    href: 'customers',
    icon: Users,
    title: '分析客戶',
    titleEn: 'Audience Insights',
    desc: '上傳客戶資料，AI 分析目標受眾輪廓與購買意向',
    accent: 'rgba(74,158,110,0.07)',
    accentBorder: 'rgba(74,158,110,0.25)',
    iconColor: '#4a9e6e',
  },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectHubPage() {
  const { id } = useParams<{ id: string }>()
  const project = PROJECTS[id] ?? PROJECTS['prop-001']

  const statusColors: Record<string, string> = {
    active:  'text-emerald-700 border-emerald-200 bg-emerald-50',
    presale: 'text-blue-700 border-blue-200 bg-blue-50',
    soldout: 'text-muted-foreground border-border',
  }

  return (
    <div className="space-y-10 max-w-3xl">

      {/* ── Back ── */}
      <motion.div {...fadeUp(0)}>
        <Link
          href="/merchant/projects"
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="w-3 h-3" />
          商案管理
        </Link>
      </motion.div>

      {/* ── Project header ── */}
      <motion.div {...fadeUp(0.06)}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground mb-1">{project.location}</p>
            <h1 className="text-3xl font-serif font-light leading-tight">{project.name}</h1>
          </div>
          <span className={`shrink-0 text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 border ${statusColors[project.status] ?? ''}`}>
            {project.statusLabel}
          </span>
        </div>

        {/* Key stats row */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0"
          style={{ border: '1px solid rgba(26,26,26,0.1)' }}
        >
          {[
            { icon: Star,     label: '佣金比率', value: project.rate         },
            { icon: Users,    label: '合作 KOL', value: project.kolCount     },
            { icon: TrendingUp, label: '累計預約', value: project.bookings   },
            { icon: Building2,  label: '累計成交', value: project.sales      },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-5 py-4 text-center">
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</p>
              <p className="text-2xl font-serif font-light">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Divider ── */}
      <motion.div {...fadeUp(0.1)}>
        <div style={{ borderTop: '1px solid rgba(26,26,26,0.08)' }} />
      </motion.div>

      {/* ── Action cards ── */}
      <div>
        <motion.p {...fadeUp(0.12)} className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground mb-5">
          管理工具
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ACTIONS.map(({ key, href, icon: Icon, title, titleEn, desc, accent, accentBorder, iconColor }, i) => (
            <motion.div key={key} {...fadeUp(0.15 + i * 0.07)}>
              <Link
                href={`/merchant/projects/${id}/${href}`}
                className="group block h-full"
              >
                <div
                  className="h-full p-6 transition-all duration-200 group-hover:shadow-md"
                  style={{
                    border: `1px solid ${accentBorder}`,
                    background: accent,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 flex items-center justify-center mb-5"
                    style={{ background: `${iconColor}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: iconColor }} />
                  </div>

                  {/* Title */}
                  <h3 className="font-medium text-sm mb-1">{title}</h3>
                  <p className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground mb-3">{titleEn}</p>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-5">{desc}</p>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.2em]" style={{ color: iconColor }}>
                    <span>前往</span>
                    <ChevronRight className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Property info strip ── */}
      <motion.div {...fadeUp(0.35)}>
        <div
          className="flex flex-wrap gap-8 px-6 py-5"
          style={{ border: '1px solid rgba(26,26,26,0.08)', background: 'hsl(var(--background))' }}
        >
          {[
            { label: '地址', value: project.location },
            { label: '樓層', value: `${project.floors} 層` },
            { label: '戶數', value: `${project.units} 戶` },
            { label: '售價範圍', value: project.priceRange },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground mb-0.5">{label}</p>
              <p className="text-sm">{value}</p>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
