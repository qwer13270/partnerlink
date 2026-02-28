'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, MapPin, ChevronDown, CheckCircle2, Clock, XCircle, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { useCurrentKolLinks } from '@/hooks/useMockData'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Application mock data ──────────────────────────────────────────────────
type AppStatus = 'pending' | 'approved' | 'rejected'

const APPLICATIONS: {
  id: string; name: string; merchant: string
  location: string; commission: string; status: AppStatus
  date: string; reason?: string
}[] = [
  { id: 'app-001', name: '國泰禾',     merchant: '國泰建設',   location: '台北市信義區',
    commission: '4.2%', status: 'pending',  date: '3 天前' },
  { id: 'app-002', name: '遠雄新未來', merchant: '遠雄建設',   location: '桃園市中壢區',
    commission: '2.8%', status: 'approved', date: '7 天前' },
  { id: 'app-003', name: '興富發天匯', merchant: '興富發建設', location: '台中市西屯區',
    commission: '3.0%', status: 'rejected', date: '14 天前',
    reason: '您的內容受眾與此商案的目標市場不符。建議選擇更符合你受眾輪廓的商案，或調整你的頻道定位後重新申請。' },
]

const STATUS_CFG: Record<AppStatus, {
  label: string; icon: React.ElementType
  bg: string; text: string; border: string
}> = {
  pending:  { label: '審核中', icon: Clock,        bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200'   },
  approved: { label: '已核准', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  rejected: { label: '未通過', icon: XCircle,      bg: 'bg-red-50',     text: 'text-red-600',     border: 'border-red-200'     },
}

const LINK_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: '待入帳', color: 'text-amber-700 border-amber-200 bg-amber-50'       },
  confirmed: { label: '已確認', color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
  paid:      { label: '已入帳', color: 'text-blue-700 border-blue-200 bg-blue-50'           },
}

// ── Application row component ──────────────────────────────────────────────
function ApplicationRow({ app, index }: { app: typeof APPLICATIONS[number]; index: number }) {
  const [open, setOpen] = useState(false)
  const cfg = STATUS_CFG[app.status]
  const Icon = cfg.icon
  const isRejected = app.status === 'rejected'

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-border last:border-b-0"
    >
      <div
        className={`flex items-center justify-between gap-4 px-5 py-4 ${isRejected ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''}`}
        onClick={() => isRejected && setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium">{app.name}</p>
            <span className="text-xs text-muted-foreground">{app.merchant}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[0.65rem] text-muted-foreground flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />{app.location}
            </span>
            <span className="text-[0.65rem] text-muted-foreground">佣金 {app.commission}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[0.65rem] text-muted-foreground hidden sm:inline">{app.date}</span>
          <span className={`flex items-center gap-1 text-[0.6rem] uppercase tracking-widest px-2 py-1 border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
            <Icon className="h-2.5 w-2.5" />
            {cfg.label}
          </span>
          {isRejected && (
            <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          )}
        </div>
      </div>

      {/* Expandable rejection detail */}
      <AnimatePresence initial={false}>
        {open && isRejected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 bg-red-50/60 border-t border-red-200">
              <p className="text-[0.62rem] uppercase tracking-[0.25em] text-red-500 mb-2">拒絕原因</p>
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">{app.reason}</p>
              <button className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-foreground border border-foreground px-3 py-2 hover:bg-foreground hover:text-background transition-colors duration-200 group">
                重新申請
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function MyPromoPage() {
  const { data: links, isLoading } = useCurrentKolLinks()
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = async (id: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      toast.success('已複製推廣連結')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast.error('複製失敗')
    }
  }

  const pendingCount = APPLICATIONS.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">推廣管理</p>
        <h1 className="text-3xl font-serif">我的推廣</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理商案申請，追蹤推廣連結的點擊、預約與成交數據。
        </p>
      </motion.div>

      {/* ── 申請狀態 ── */}
      <div>
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">申請狀態</p>
            {pendingCount > 0 && (
              <span className="text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 bg-amber-500 text-white">
                {pendingCount} 待回覆
              </span>
            )}
          </div>
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            共 {APPLICATIONS.length} 筆
          </span>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="border border-foreground/15">
          {APPLICATIONS.map((app, i) => (
            <ApplicationRow key={app.id} app={app} index={3 + i} />
          ))}
        </motion.div>
      </div>

      {/* ── 推廣連結明細 ── */}
      <div>
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-4">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">推廣連結明細</p>
          <span className="text-[0.65rem] uppercase tracking-widest text-muted-foreground">
            {isLoading ? '—' : `共 ${links?.length ?? 0} 條`}
          </span>
        </motion.div>

        {isLoading || !links ? (
          <div className="border border-foreground/15 divide-y divide-foreground/[0.08]">
            {[1, 2, 3].map((n) => (
              <div key={n} className="px-5 py-5 animate-pulse">
                <div className="h-3 w-40 bg-muted rounded mb-3" />
                <div className="h-2.5 w-64 bg-muted/60 rounded mb-4" />
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map((k) => <div key={k} className="h-14 bg-muted/40 rounded" />)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-foreground/15 divide-y divide-foreground/[0.08]">
            {links.map((link, i) => {
              const statusCfg = LINK_STATUS[link.commissionStatus] ?? LINK_STATUS['pending']
              const isCopied = copiedId === link.id
              return (
                <motion.div
                  key={link.id}
                  custom={7 + i} initial="hidden" animate="visible" variants={fadeUp}
                  className="px-5 py-5"
                >
                  {/* Name + status badge */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium">{link.propertyName}</p>
                      <span className={`inline-flex items-center text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 border mt-1.5 ${link.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-500 border-neutral-200'}`}>
                        {link.isActive ? '推廣中' : '已暫停'}
                      </span>
                    </div>
                    <span className={`text-[0.6rem] uppercase tracking-widest px-1.5 py-0.5 border shrink-0 ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Link + copy */}
                  <div className="flex items-center gap-2 mb-4 bg-muted/30 px-3 py-2 border border-foreground/10">
                    <span className="text-[0.7rem] text-muted-foreground font-mono truncate flex-1">
                      {link.link}
                    </span>
                    <button
                      onClick={() => handleCopy(link.id, link.link)}
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="複製連結"
                    >
                      {isCopied
                        ? <Check className="h-3.5 w-3.5 text-emerald-600" />
                        : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: '點擊', value: link.clicks.toLocaleString('zh-TW') },
                      { label: '預約', value: link.bookings.toLocaleString('zh-TW') },
                      { label: '成交', value: link.confirmedSales.toLocaleString('zh-TW') },
                    ].map((s) => (
                      <div key={s.label} className="border border-foreground/15 px-3 py-3 text-center">
                        <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                        <p className="text-xl font-serif mt-1">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
