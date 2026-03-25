'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowUpRight, ArrowRight, Link2, TrendingUp, CheckCircle2, XCircle,
  Clock, Camera, Film, ChevronRight,
} from 'lucide-react'

type KolHomePageClientProps = {
  displayName: string
  username: string
  hasProfilePhoto: boolean
  portfolioCounts: {
    totalPhotos: number
    totalVideos: number
  }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
}

const STATS = [
  { label: '活躍連結', value: '5',  sub: '3 個合作中',   icon: Link2       },
  { label: '本月成交', value: '23', sub: '↑ 12% vs 上月', icon: TrendingUp  },
  { label: '轉換率',   value: '6.2%', sub: '業界均值 3.8%', icon: TrendingUp },
]

type AppStatus = 'pending' | 'approved' | 'rejected'

const APPLICATIONS: {
  id: string; name: string; merchant: string; status: AppStatus; date: string
}[] = [
  { id: 'prop-003', name: '國泰禾',   merchant: '國泰建設', status: 'pending',  date: '3 天前'  },
  { id: 'prop-002', name: '遠雄新未來', merchant: '遠雄建設', status: 'approved', date: '7 天前'  },
  { id: 'prop-005', name: '潤泰首璽', merchant: '潤泰建設', status: 'rejected', date: '14 天前' },
]

const STATUS_CFG: Record<AppStatus, {
  label: string; icon: React.ElementType; dot: string; text: string
}> = {
  pending:  { label: '審核中', icon: Clock,         dot: 'bg-amber-400',   text: 'text-amber-700'  },
  approved: { label: '已核准', icon: CheckCircle2,  dot: 'bg-emerald-500', text: 'text-emerald-700' },
  rejected: { label: '未通過', icon: XCircle,       dot: 'bg-red-400',     text: 'text-red-600'     },
}


export default function KolHomePageClient({
  displayName,
  username,
  hasProfilePhoto,
  portfolioCounts,
}: KolHomePageClientProps) {
  const totalAssets      = portfolioCounts.totalPhotos + portfolioCounts.totalVideos
  const needsPhoto       = !hasProfilePhoto
  const needsPortfolio   = totalAssets === 0
  const showSetup        = needsPhoto || needsPortfolio
  const pendingCount     = APPLICATIONS.filter(a => a.status === 'pending').length

  const setupSteps = [
    {
      key: 'photo',
      icon: Camera,
      title: '上傳個人頭像',
      body: '讓商家第一眼記住你',
      href: '/kol/resume/edit',
      done: !needsPhoto,
    },
    {
      key: 'portfolio',
      icon: Film,
      title: '上傳作品媒體',
      body: '展示你的內容質感',
      href: '/kol/resume/edit',
      done: !needsPortfolio,
    },
  ]

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      {/* ── HERO HEADER ─────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-foreground/10 pb-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground mb-4">
          {today} · KOL 後台
        </p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif">
              {displayName
                ? displayName
                : <span className="inline-block h-8 w-40 animate-pulse rounded bg-muted" />}
            </h1>
            {username && (
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">@{username}</p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 pb-1">
            <Link
              href="/kol/links"
              className="flex items-center gap-1.5 border border-foreground/15 px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              推廣連結
              <ArrowUpRight className="h-3 w-3" />
            </Link>
            <Link
              href="/kol/resume"
              className="flex items-center gap-1.5 bg-foreground px-3.5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-background transition-colors hover:bg-foreground/85"
            >
              我的履歷
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── RESUME COMPLETION BANNER ─────────────────── */}
      {showSetup && (
        <motion.div variants={fadeUp}>
          <div className="relative overflow-hidden rounded-xl bg-foreground">

            {/* Grain */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.045]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
                backgroundSize: '256px 256px',
              }}
            />
            {/* Glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-[0.05]"
              style={{ background: 'radial-gradient(circle, #ffffff 0%, transparent 70%)' }}
            />

            <div className="relative z-10 px-7 py-6">
              {/* Top row */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[0.48rem] uppercase tracking-[0.55em] text-background/35 mb-1">
                    PartnerLink · KOL
                  </p>
                  <p className="font-serif text-lg leading-tight text-background/90">
                    完成你的履歷
                  </p>
                </div>
                <span className="font-mono text-[0.7rem] text-background/30">
                  {setupSteps.filter(s => s.done).length}&thinsp;/&thinsp;{setupSteps.length}
                </span>
              </div>

              {/* Steps — horizontal on sm+, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                {setupSteps.map((step) => {
                  const Icon = step.icon
                  return (
                    <Link
                      key={step.key}
                      href={step.href}
                      className={`group flex items-center gap-3.5 rounded-lg border px-4 py-3.5 transition-all duration-200 ${
                        step.done
                          ? 'border-background/[0.08] opacity-40 cursor-default pointer-events-none'
                          : 'border-background/[0.12] bg-background/[0.05] hover:bg-background/[0.09] hover:border-background/20'
                      }`}
                    >
                      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                        step.done
                          ? 'border-background/20 bg-background/[0.08] text-background/40'
                          : 'border-background/20 bg-background/[0.08] text-background/70'
                      }`}>
                        {step.done
                          ? <CheckCircle2 className="h-3.5 w-3.5" />
                          : <Icon className="h-3.5 w-3.5" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium leading-snug ${
                          step.done ? 'line-through text-background/30' : 'text-background/80'
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-[0.6rem] text-background/35 mt-0.5 leading-relaxed">
                          {step.body}
                        </p>
                      </div>
                      {!step.done && (
                        <ChevronRight className="h-3.5 w-3.5 text-background/25 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Progress bar + CTA row */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 h-[1.5px] bg-background/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-background/40 transition-all duration-700"
                    style={{ width: `${(setupSteps.filter(s => s.done).length / setupSteps.length) * 100}%` }}
                  />
                </div>
                <Link
                  href="/kol/resume"
                  className="group flex shrink-0 items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.35em] text-background/35 transition-colors hover:text-background/60"
                >
                  <span>前往履歷</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </div>

          </div>
        </motion.div>
      )}

      {/* ── STATS STRIP ─────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="group relative overflow-hidden rounded-2xl border border-foreground/[0.08] bg-stone-50 px-7 py-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              <div className="absolute inset-0 bg-foreground/[0.015] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {s.label}
              </p>
              <p className="text-[3rem] leading-none font-serif text-foreground mt-3 tracking-tight">
                {s.value}
              </p>
              <p className={`text-xs mt-2.5 tracking-wide ${
                s.sub.startsWith('↑') ? 'text-emerald-600' :
                s.sub.startsWith('↓') ? 'text-red-500' :
                'text-muted-foreground'
              }`}>
                {s.sub}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── APPLICATIONS ─────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden">

          {/* header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
              近期申請
            </p>
            {pendingCount > 0 && (
              <span className="bg-amber-500 px-2 py-0.5 text-[0.55rem] uppercase tracking-widest text-white rounded-sm">
                {pendingCount} 待回覆
              </span>
            )}
          </div>

          {/* rows */}
          <div className="divide-y divide-foreground/[0.06]">
            {APPLICATIONS.map((app) => {
              const cfg = STATUS_CFG[app.status]
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-foreground/[0.02] transition-colors duration-200"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{app.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {app.merchant} · {app.date}
                    </p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1.5 text-[0.6rem] uppercase tracking-widest ${cfg.text}`}>
                    <span className={`inline-block h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-foreground/[0.07]">
            <p className="text-xs text-muted-foreground tracking-wide">
              顯示最近 {APPLICATIONS.length} 筆申請紀錄
            </p>
            <Link
              href="/kol/applications"
              className="group flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              查看全部
              <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>
      </motion.div>

    </motion.div>
  )
}
