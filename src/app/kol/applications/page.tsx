'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Clock, XCircle, MapPin, ChevronDown, ArrowRight,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

type AppStatus = 'pending' | 'approved' | 'rejected'

interface Application {
  id: string
  name: string
  merchant: string
  location: string
  commission: string
  status: AppStatus
  date: string
  reason?: string
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ALL_APPLICATIONS: Application[] = [
  {
    id: 'app-001', name: '國泰禾',      merchant: '國泰建設',   location: '台北市信義區',
    commission: '4.2%', status: 'pending',  date: '3 天前',
  },
  {
    id: 'app-002', name: '遠雄新未來',  merchant: '遠雄建設',   location: '桃園市中壢區',
    commission: '2.8%', status: 'approved', date: '7 天前',
  },
  {
    id: 'app-003', name: '興富發天匯',  merchant: '興富發建設', location: '台中市西屯區',
    commission: '3.0%', status: 'rejected', date: '14 天前',
    reason: '您的內容受眾與此商案的目標市場不符。建議選擇更符合你受眾輪廓的商案，或調整你的頻道定位後重新申請。',
  },
  {
    id: 'app-004', name: '潤泰首璽',    merchant: '潤泰建設',   location: '台北市大安區',
    commission: '3.5%', status: 'approved', date: '21 天前',
  },
  {
    id: 'app-005', name: '璞真光河',    merchant: '璞真建設',   location: '新北市板橋區',
    commission: '2.5%', status: 'pending',  date: '1 天前',
  },
  {
    id: 'app-006', name: '統創翼',      merchant: '統創建設',   location: '台北市大安區',
    commission: '3.8%', status: 'rejected', date: '30 天前',
    reason: '申請材料不完整，請補齊作品集後重新提交。',
  },
]

// ── Config ───────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<AppStatus, {
  label: string; icon: React.ElementType; dot: string; text: string; badge: string; rowBg: string
}> = {
  pending:  { label: '審核中', icon: Clock,        dot: 'bg-amber-400',   text: 'text-amber-700',   badge: 'bg-amber-50 text-amber-700 border border-amber-200/60',     rowBg: '' },
  approved: { label: '已核准', icon: CheckCircle2, dot: 'bg-emerald-500', text: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60', rowBg: '' },
  rejected: { label: '未通過', icon: XCircle,      dot: 'bg-red-400',     text: 'text-red-600',     badge: 'bg-red-50 text-red-600 border border-red-200/60',             rowBg: 'bg-red-50/30' },
}

const TABS: { key: AppStatus | 'all'; label: string }[] = [
  { key: 'all',      label: '全部'   },
  { key: 'pending',  label: '審核中' },
  { key: 'approved', label: '已核准' },
  { key: 'rejected', label: '未通過' },
]

// ── Animations ────────────────────────────────────────────────────────────────

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden:   { opacity: 0, y: 14 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const } },
}

// ── Application row ───────────────────────────────────────────────────────────

function ApplicationRow({ app, index }: { app: Application; index: number }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CFG[app.status]
  const Icon = cfg.icon
  const isRejected = app.status === 'rejected'

  return (
    <motion.div
      variants={fadeUp}
      className={`border-b border-foreground/8 last:border-b-0 ${cfg.rowBg}`}
    >
      <div
        className={`flex items-center gap-4 px-6 py-4 ${isRejected ? 'cursor-pointer hover:bg-foreground/[0.02]' : 'hover:bg-foreground/[0.015]'} transition-colors duration-150`}
        onClick={() => isRejected && setOpen(v => !v)}
      >
        {/* Status dot */}
        <span className={`shrink-0 h-2 w-2 rounded-full ${cfg.dot}`} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{app.name}</p>
            <span className="text-xs text-muted-foreground">{app.merchant}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-2.5 w-2.5" />{app.location}
            </span>
            <span className="text-xs text-muted-foreground">佣金 {app.commission}</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-muted-foreground">{app.date}</span>
          <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded ${cfg.badge}`}>
            {cfg.label}
          </span>
          {isRejected && (
            <ChevronDown
              className={`h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      {/* Rejection panel */}
      <AnimatePresence initial={false}>
        {open && isRejected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-6 mb-4 border border-red-200/70 bg-red-50/60 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.35em] text-red-500/80 mb-2">
                拒絕原因
              </p>
              <p className="text-xs text-foreground/75 leading-relaxed mb-4">
                {app.reason}
              </p>
              <button className="group flex items-center gap-1.5 border border-foreground/20 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-foreground transition-all hover:border-foreground hover:bg-foreground hover:text-background">
                重新申請
                <ArrowRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ApplicationsPage() {
  const [activeTab, setActiveTab] = useState<AppStatus | 'all'>('all')

  const filtered = activeTab === 'all'
    ? ALL_APPLICATIONS
    : ALL_APPLICATIONS.filter(a => a.status === activeTab)

  const counts = {
    all:      ALL_APPLICATIONS.length,
    pending:  ALL_APPLICATIONS.filter(a => a.status === 'pending').length,
    approved: ALL_APPLICATIONS.filter(a => a.status === 'approved').length,
    rejected: ALL_APPLICATIONS.filter(a => a.status === 'rejected').length,
  }

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >

      {/* ── HEADER ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-foreground/10 pb-8">
        <p className="text-xs uppercase tracking-[0.45em] text-muted-foreground mb-4">
          KOL 後台 · 申請管理
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-3xl font-serif">商案申請</h1>
          <p className="pb-1 text-xs text-muted-foreground tracking-wide">
            共 {counts.all} 筆紀錄
          </p>
        </div>
      </motion.div>

      {/* ── SUMMARY STRIP ──────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '審核中', value: counts.pending,  color: 'text-amber-600'   },
            { label: '已核准', value: counts.approved, color: 'text-emerald-600' },
            { label: '未通過', value: counts.rejected, color: 'text-red-500'     },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-6 py-5 transition-shadow duration-300 hover:shadow-md">
              <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                {s.label}
              </p>
              <p className={`text-[2.5rem] leading-none font-serif mt-2 ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── FILTER TABS + TABLE ─────────────────────────────── */}
      <motion.div variants={fadeUp} className="space-y-0">

        <div className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-foreground/10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 text-xs uppercase tracking-[0.3em] transition-colors duration-150 ${
                activeTab === tab.key
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground/70'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[0.65rem] text-muted-foreground/70">
                {counts[tab.key]}
              </span>
              {activeTab === tab.key && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-foreground"
                />
              )}
            </button>
          ))}
        </div>

        {/* Rows */}
        <div className="min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={stagger}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filtered.length === 0 ? (
                <div className="flex items-center justify-center py-16 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  無申請紀錄
                </div>
              ) : (
                filtered.map((app, i) => (
                  <ApplicationRow key={app.id} app={app} index={i} />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        </div>
      </motion.div>

    </motion.div>
  )
}
