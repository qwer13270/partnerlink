'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight, MapPin, Tag, Sparkles, TrendingUp,
  Link2, BadgeDollarSign, Clock, CheckCircle2, XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { mockProperties } from '@/data/mock-properties'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Mock per-project metadata ───────────────────────────────────────────────
const CASE_META: Record<string, {
  commission: string; tags: string[]; applicants: number
  isNew?: boolean; isHot?: boolean
}> = {
  'prop-001': { commission: '3.5%', tags: ['生活風格', '財經'],  applicants: 12, isHot: true },
  'prop-002': { commission: '2.8%', tags: ['生活風格', '旅遊'],  applicants: 8,  isNew: true },
  'prop-003': { commission: '4.2%', tags: ['財經', '美食'],      applicants: 5              },
  'prop-004': { commission: '3.0%', tags: ['美食', '生活風格'],  applicants: 15, isHot: true },
  'prop-005': { commission: '2.5%', tags: ['財經', '旅遊'],      applicants: 3,  isNew: true },
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'pre-sale': { label: '預售中', color: 'bg-amber-50 text-amber-700 border-amber-200'        },
  'selling':  { label: '熱賣中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200'  },
  'sold-out': { label: '已售罄', color: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
}

// ── Quick stats ─────────────────────────────────────────────────────────────
const QUICK_STATS = [
  { icon: BadgeDollarSign, label: '本月收益', value: 'NT$12,400', sub: '+18% 較上月'  },
  { icon: Link2,           label: '活躍連結', value: '5',         sub: '3 個合作中'   },
  { icon: TrendingUp,      label: '本月成交', value: '23',        sub: '轉換率 6.2%'  },
]

// ── Mock application statuses ───────────────────────────────────────────────
type AppStatus = 'pending' | 'approved' | 'rejected'
const APPLICATIONS: { id: string; name: string; merchant: string; status: AppStatus; date: string }[] = [
  { id: 'prop-003', name: '國泰禾',    merchant: '國泰建設',  status: 'pending',  date: '3 天前'   },
  { id: 'prop-002', name: '遠雄新未來', merchant: '遠雄建設', status: 'approved', date: '7 天前'   },
  { id: 'prop-005', name: '潤泰首璽',  merchant: '潤泰建設',  status: 'rejected', date: '14 天前'  },
]

const APP_STATUS_CONFIG: Record<AppStatus, {
  label: string; icon: React.ElementType
  bg: string; text: string; border: string
}> = {
  pending:  { label: '審核中', icon: Clock,         bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  approved: { label: '已核准', icon: CheckCircle2,  bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: '未通過', icon: XCircle,       bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200'     },
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function KolHomePage() {
  const featured = mockProperties.slice(0, 3)
  const pendingCount = APPLICATIONS.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-10">

      {/* ── Greeting ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">歡迎回來</p>
        <h1 className="text-3xl font-serif">林小雨 👋</h1>
      </motion.div>

      {/* ── Stats + Application status side by side ── */}
      <motion.div
        custom={1} initial="hidden" animate="visible" variants={fadeUp}
        className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4"
      >
        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_STATS.map((s) => (
            <div key={s.label} className="border border-foreground/15 p-5 flex gap-4 items-start">
              <div className="w-8 h-8 border border-foreground/15 flex items-center justify-center shrink-0">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className="text-xl font-serif">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Application status widget */}
        <div className="border border-foreground/15 p-5 min-w-[260px] lg:min-w-[280px]">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">申請狀態</p>
            {pendingCount > 0 && (
              <span className="text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 bg-amber-500 text-white">
                {pendingCount} 待回覆
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            {APPLICATIONS.map((app) => {
              const cfg = APP_STATUS_CONFIG[app.status]
              const Icon = cfg.icon
              return (
                <div key={app.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{app.name}</p>
                    <p className="text-[0.65rem] text-muted-foreground">{app.date}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                    <Icon className="h-2.5 w-2.5" />
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
          <Link
            href="/kol/marketplace"
            className="mt-4 flex items-center gap-1 text-[0.65rem] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
          >
            瀏覽更多商案
            <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>

      {/* ── Featured 商案 ── */}
      <div>
        <motion.div
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm uppercase tracking-[0.3em]">為你推薦的商案</h2>
          </div>
          <Link
            href="/kol/marketplace"
            className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors group"
          >
            查看所有商案
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featured.map((prop, i) => {
            const meta   = CASE_META[prop.id] ?? { commission: '3%', tags: [], applicants: 0 }
            const status = STATUS_MAP[prop.status] ?? STATUS_MAP['pre-sale']
            return (
              <motion.div
                key={prop.id}
                custom={3 + i} initial="hidden" animate="visible" variants={fadeUp}
                className="border border-foreground/15 hover:border-foreground/40 transition-colors duration-300 flex flex-col"
              >
                <div className="bg-muted/40 h-28 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                  <p className="relative z-10 text-xs font-medium text-foreground/60 px-4 text-center leading-snug">{prop.name}</p>
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    {meta.isNew && <span className="text-[0.58rem] uppercase tracking-widest px-1.5 py-0.5 bg-foreground text-background">NEW</span>}
                    {meta.isHot && <span className="text-[0.58rem] uppercase tracking-widest px-1.5 py-0.5 bg-amber-500 text-white">HOT</span>}
                  </div>
                  <span className={`absolute top-2.5 right-2.5 text-[0.58rem] uppercase tracking-widest px-1.5 py-0.5 border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{prop.merchant}</p>
                    <h3 className="text-sm font-medium leading-snug">{prop.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />{prop.location}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {meta.tags.map((tag) => (
                      <span key={tag} className="text-[0.62rem] px-2 py-0.5 border border-foreground/15 text-muted-foreground flex items-center gap-1">
                        <Tag className="h-2.5 w-2.5" />{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-foreground/10 mt-auto">
                    <div>
                      <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">佣金比例</p>
                      <p className="text-lg font-serif">{meta.commission}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">已申請</p>
                      <p className="text-sm font-medium">{meta.applicants} 人</p>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-between px-4 py-2.5 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-foreground/85 transition-colors group">
                    <span>申請合作</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="mt-5">
          <Button asChild variant="outline" className="rounded-none text-xs uppercase tracking-widest w-full gap-2">
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
