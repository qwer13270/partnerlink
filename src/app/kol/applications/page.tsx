'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2, Clock, XCircle, MapPin, ChevronDown, ArrowRight,
} from 'lucide-react'

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

const STATUS_CFG: Record<AppStatus, {
  label: string; icon: React.ElementType; dot: string; badge: string; rowBg: string
}> = {
  pending:  { label: '審核中', icon: Clock,        dot: 'bg-amber-300',   badge: 'bg-amber-400/10 text-amber-200 border border-amber-300/30',     rowBg: '' },
  approved: { label: '已核准', icon: CheckCircle2, dot: 'bg-emerald-400', badge: 'bg-emerald-400/10 text-emerald-200 border border-emerald-300/30', rowBg: '' },
  rejected: { label: '未通過', icon: XCircle,      dot: 'bg-red-400',     badge: 'bg-red-400/10 text-red-200 border border-red-300/30',             rowBg: 'bg-red-400/[0.04]' },
}

const TABS: { key: AppStatus | 'all'; label: string }[] = [
  { key: 'all',      label: '全部'   },
  { key: 'pending',  label: '審核中' },
  { key: 'approved', label: '已核准' },
  { key: 'rejected', label: '未通過' },
]

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden:   { opacity: 0, y: 14 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] as const } },
}

function ApplicationRow({ app }: { app: Application; index: number }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CFG[app.status]
  const isRejected = app.status === 'rejected'

  return (
    <motion.div
      variants={fadeUp}
      className={`border-b border-white/[0.07] last:border-b-0 ${cfg.rowBg}`}
    >
      <div
        className={`flex items-center gap-4 px-6 py-4 ${isRejected ? 'cursor-pointer hover:bg-white/[0.03]' : 'hover:bg-white/[0.02]'} transition-colors duration-150`}
        onClick={() => isRejected && setOpen(v => !v)}
      >
        <span className={`shrink-0 h-2 w-2 rounded-full ${cfg.dot}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <p className="font-body text-sm font-medium text-white/95">{app.name}</p>
            <span className="font-body text-xs text-white/55">{app.merchant}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-white/55">
              <MapPin className="h-2.5 w-2.5" />{app.location}
            </span>
            <span className="text-xs text-white/55">佣金 {app.commission}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden sm:block text-xs text-white/45">{app.date}</span>
          <span className={`text-[0.72rem] font-medium px-2 py-0.5 rounded ${cfg.badge}`}>
            {cfg.label}
          </span>
          {isRejected && (
            <ChevronDown
              className={`h-3.5 w-3.5 text-white/55 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && isRejected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mx-6 mb-4 rounded-lg border border-red-300/30 bg-red-400/[0.06] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.35em] text-red-200/80 mb-2">
                拒絕原因
              </p>
              <p className="font-body text-xs text-white/80 leading-relaxed mb-4">
                {app.reason}
              </p>
              <button className="group flex items-center gap-1.5 rounded-full bg-white text-black px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.2em] transition-all hover:bg-white/90">
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
      className="space-y-8 text-white"
    >

      {/* ── HEADER ─────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="border-b border-white/10 pb-8">
        <p className="font-body text-[10px] uppercase tracking-[0.45em] text-white/45 mb-4">
          KOL 後台 · 申請管理
        </p>
        <div className="flex items-end justify-between gap-4">
          <h1 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
            商案 <span className="italic">申請</span>
          </h1>
          <p className="pb-1 font-body text-xs text-white/55 tracking-wide">
            共 {counts.all} 筆紀錄
          </p>
        </div>
      </motion.div>

      {/* ── SUMMARY STRIP ──────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '審核中', value: counts.pending,  color: 'text-amber-200'   },
            { label: '已核准', value: counts.approved, color: 'text-emerald-200' },
            { label: '未通過', value: counts.rejected, color: 'text-red-200'     },
          ].map(s => (
            <div key={s.label} className="liquid-glass rounded-2xl px-6 py-5">
              <p className="font-body text-[10px] uppercase tracking-[0.4em] text-white/55">
                {s.label}
              </p>
              <p className={`font-heading italic text-[2.5rem] leading-none mt-2 ${s.color}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── FILTER TABS + TABLE ─────────────────────────────── */}
      <motion.div variants={fadeUp} className="space-y-0">

        <div className="liquid-glass rounded-2xl overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-white/10">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 text-xs uppercase tracking-[0.3em] transition-colors duration-150 ${
                activeTab === tab.key
                  ? 'text-white'
                  : 'text-white/55 hover:text-white/85'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[0.65rem] text-white/45">
                {counts[tab.key]}
              </span>
              {activeTab === tab.key && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-white/85"
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
                <div className="flex items-center justify-center py-16 text-xs uppercase tracking-[0.3em] text-white/55">
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
