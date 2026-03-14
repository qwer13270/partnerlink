'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, MapPin, Tag, Sparkles, TrendingUp,
  Link2, Clock, CheckCircle2, XCircle, Camera, Film, Layers3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockProperties } from '@/data/mock-properties'

type KolHomePageClientProps = {
  displayName: string
  hasProfilePhoto: boolean
  portfolioCounts: {
    totalPhotos: number
    totalVideos: number
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const CASE_META: Record<string, {
  commission: string; tags: string[]; applicants: number
  isNew?: boolean; isHot?: boolean
}> = {
  'prop-001': { commission: '3.5%', tags: ['生活風格', '財經'], applicants: 12, isHot: true },
  'prop-002': { commission: '2.8%', tags: ['生活風格', '旅遊'], applicants: 8, isNew: true },
  'prop-003': { commission: '4.2%', tags: ['財經', '美食'], applicants: 5 },
  'prop-004': { commission: '3.0%', tags: ['美食', '生活風格'], applicants: 15, isHot: true },
  'prop-005': { commission: '2.5%', tags: ['財經', '旅遊'], applicants: 3, isNew: true },
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'pre-sale': { label: '預售中', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  'selling': { label: '熱賣中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'sold-out': { label: '已售罄', color: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
}

const QUICK_STATS = [
  { icon: Link2, label: '活躍連結', value: '5', sub: '3 個合作中' },
  { icon: TrendingUp, label: '本月成交', value: '23', sub: '轉換率 6.2%' },
]

type AppStatus = 'pending' | 'approved' | 'rejected'
const APPLICATIONS: { id: string; name: string; merchant: string; status: AppStatus; date: string }[] = [
  { id: 'prop-003', name: '國泰禾', merchant: '國泰建設', status: 'pending', date: '3 天前' },
  { id: 'prop-002', name: '遠雄新未來', merchant: '遠雄建設', status: 'approved', date: '7 天前' },
  { id: 'prop-005', name: '潤泰首璽', merchant: '潤泰建設', status: 'rejected', date: '14 天前' },
]

const APP_STATUS_CONFIG: Record<AppStatus, {
  label: string
  icon: React.ElementType
  bg: string
  text: string
  border: string
}> = {
  pending: { label: '審核中', icon: Clock, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  approved: { label: '已核准', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: '未通過', icon: XCircle, bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
}

export default function KolHomePageClient({
  displayName,
  hasProfilePhoto,
  portfolioCounts,
}: KolHomePageClientProps) {
  const featured = mockProperties.slice(0, 3)
  const pendingCount = APPLICATIONS.filter((a) => a.status === 'pending').length
  const totalPortfolioAssets = portfolioCounts.totalPhotos + portfolioCounts.totalVideos
  const needsProfilePhoto = !hasProfilePhoto
  const needsPortfolio = totalPortfolioAssets === 0
  const shouldShowSetupGuide = needsProfilePhoto || needsPortfolio
  const setupItems = [
    {
      key: 'profile-photo',
      title: '補上個人頭像',
      body: '讓商家在合作清單與檔案頁裡第一眼就記住你。',
      href: '/kol/profile',
      cta: needsProfilePhoto ? '補上個人頭像' : '已完成',
      done: !needsProfilePhoto,
      icon: Camera,
      accent: '#b06e4f',
    },
    {
      key: 'portfolio',
      title: '整理作品集',
      body: '上傳代表照片與影片，把內容質感直接展示出來。',
      href: '/kol/portfolio',
      cta: needsPortfolio ? '前往上傳' : '已完成',
      done: !needsPortfolio,
      icon: Film,
      accent: '#245346',
    },
  ]
  const setupCompletedCount = setupItems.filter((item) => item.done).length

  return (
    <div className="space-y-10">
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="mb-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">歡迎回來</p>
        <h1 className="text-3xl font-serif">
          {displayName ? `${displayName} 👋` : <span className="inline-block h-8 w-32 animate-pulse rounded bg-muted" />}
        </h1>
      </motion.div>

      {shouldShowSetupGuide && (
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
          <div className="relative overflow-hidden border border-[#d9c5ae] bg-[linear-gradient(135deg,#fbf1e5_0%,#f7f2ec_48%,#f0e1d2_100%)]">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.28]"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, rgba(176,110,79,0.08) 1px, transparent 1px), linear-gradient(0deg, rgba(36,83,70,0.06) 1px, transparent 1px)',
                backgroundSize: '34px 34px',
              }}
            />
            <div className="relative grid gap-6 p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-7">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#b06e4f]/20 bg-white/75 text-[#b06e4f]">
                    <Layers3 className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.35em] text-[#9a7059]">Creator Setup</p>
                    <p className="text-[0.72rem] text-[#897768]">{setupCompletedCount} / {setupItems.length} 項已完成</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-[1.65rem] font-serif leading-[1.1] text-[#1b1712]">
                    完成 KOL 檔案。
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#776658]">
                    補齊頭像與作品集，提升合作機會。
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {setupItems.map((item, index) => (
                    <div
                      key={item.key}
                      className={`inline-flex items-center gap-2 border px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] ${
                        item.done
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-[#d3b79a] bg-white/65 text-[#8b664f]'
                      }`}
                    >
                      <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-current/10 text-[0.55rem] font-semibold">
                        {item.done ? <CheckCircle2 className="h-2.5 w-2.5" /> : index + 1}
                      </span>
                      {item.title}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                {setupItems.map((item, index) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.key}
                      className="group relative overflow-hidden border border-black/10 bg-white/72 p-4 backdrop-blur-[2px] transition-transform duration-200 hover:-translate-y-0.5"
                    >
                      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1" style={{ background: item.accent }} />
                      <div className="ml-2 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="mb-2 flex items-center gap-2">
                            <span
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border"
                              style={{
                                borderColor: `${item.accent}33`,
                                color: item.accent,
                                background: `${item.accent}10`,
                              }}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </span>
                            <div>
                              <p className="text-[0.58rem] uppercase tracking-[0.28em] text-[#94715d]">Step {index + 1}</p>
                              <h3 className="text-sm font-medium text-[#1b1712]">{item.title}</h3>
                            </div>
                          </div>
                          <p className="text-xs leading-relaxed text-[#7a695b]">{item.body}</p>
                        </div>
                        <Link
                          href={item.href}
                          className={`inline-flex shrink-0 items-center gap-1.5 border px-3 py-2 text-[0.58rem] uppercase tracking-[0.22em] transition-all duration-200 ${
                            item.done
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-[#1b1712] bg-[#1b1712] text-white hover:bg-[#33271f]'
                          }`}
                        >
                          <span>{item.cta}</span>
                          {!item.done && <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />}
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        custom={shouldShowSetupGuide ? 2 : 1}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {QUICK_STATS.map((s) => (
          <div key={s.label} className="flex flex-col justify-between gap-6 border border-foreground/15 p-6">
            <div className="flex items-center justify-between">
              <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">{s.label}</p>
              <s.icon className="h-3.5 w-3.5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-4xl font-serif leading-none tracking-tight">{s.value}</p>
              <p className="mt-2 text-[0.65rem] tracking-wide text-muted-foreground">{s.sub}</p>
            </div>
          </div>
        ))}

        <div className="flex flex-col border border-foreground/15 p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground">申請狀態</p>
            {pendingCount > 0 && (
              <span className="bg-amber-500 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-widest text-white">
                {pendingCount} 待回覆
              </span>
            )}
          </div>
          <div className="flex-1 space-y-3">
            {APPLICATIONS.map((app) => {
              const cfg = APP_STATUS_CONFIG[app.status]
              const Icon = cfg.icon

              return (
                <div key={app.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium">{app.name}</p>
                    <p className="text-[0.63rem] text-muted-foreground">{app.date}</p>
                  </div>
                  <span className={`flex shrink-0 items-center gap-1 border px-1.5 py-0.5 text-[0.58rem] uppercase tracking-widest ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <Icon className="h-2.5 w-2.5" />
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
          <Link
            href="/kol/marketplace"
            className="group mt-5 flex items-center gap-1 border-t border-foreground/10 pt-4 text-[0.63rem] uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            瀏覽更多商案
            <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>

      <div>
        <motion.div
          custom={shouldShowSetupGuide ? 3 : 2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm uppercase tracking-[0.3em]">為你推薦的商案</h2>
          </div>
          <Link
            href="/kol/marketplace"
            className="group flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            查看所有商案
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featured.map((prop, i) => {
            const meta = CASE_META[prop.id] ?? { commission: '3%', tags: [], applicants: 0 }
            const status = STATUS_MAP[prop.status] ?? STATUS_MAP['pre-sale']

            return (
              <motion.div
                key={prop.id}
                custom={(shouldShowSetupGuide ? 4 : 3) + i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="flex flex-col border border-foreground/15 transition-colors duration-300 hover:border-foreground/40"
              >
                <div className="relative flex h-28 items-center justify-center overflow-hidden bg-muted/40">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                  <p className="relative z-10 px-4 text-center text-xs font-medium leading-snug text-foreground/60">{prop.name}</p>
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    {meta.isNew && <span className="bg-foreground px-1.5 py-0.5 text-[0.58rem] uppercase tracking-widest text-background">NEW</span>}
                    {meta.isHot && <span className="bg-amber-500 px-1.5 py-0.5 text-[0.58rem] uppercase tracking-widest text-white">HOT</span>}
                  </div>
                  <span className={`absolute top-2.5 right-2.5 border px-1.5 py-0.5 text-[0.58rem] uppercase tracking-widest ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="mb-0.5 text-xs text-muted-foreground">{prop.merchant}</p>
                    <h3 className="text-sm font-medium leading-snug">{prop.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {prop.location}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {meta.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 border border-foreground/15 px-2 py-0.5 text-[0.62rem] text-muted-foreground">
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-2">
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">佣金比例</p>
                      <p className="text-lg font-serif">{meta.commission}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">已申請</p>
                      <p className="text-sm font-medium">{meta.applicants} 人</p>
                    </div>
                  </div>
                  <button className="group flex w-full items-center justify-between bg-foreground px-4 py-2.5 text-xs uppercase tracking-widest text-background transition-colors hover:bg-foreground/85">
                    <span>申請合作</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div custom={shouldShowSetupGuide ? 7 : 6} initial="hidden" animate="visible" variants={fadeUp} className="mt-5">
          <Button asChild variant="outline" className="w-full gap-2 rounded-none text-xs uppercase tracking-widest">
            <Link href="/kol/marketplace">
              查看全部 {mockProperties.length} 個商案
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
