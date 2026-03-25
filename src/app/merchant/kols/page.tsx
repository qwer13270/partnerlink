'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ChevronDown } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ─────────────────────────────────────────────────────────────────────
type Tier = 'platinum' | 'gold' | 'silver' | 'bronze'

const TIER_CFG: Record<Tier, { label: string; color: string }> = {
  platinum: { label: 'Platinum', color: 'text-purple-700 border-purple-200 bg-purple-50'  },
  gold:     { label: 'Gold',     color: 'text-amber-700 border-amber-200 bg-amber-50'     },
  silver:   { label: 'Silver',   color: 'text-zinc-500 border-zinc-200 bg-zinc-50'        },
  bronze:   { label: 'Bronze',   color: 'text-orange-800 border-orange-200 bg-orange-50'  },
}

type Application = {
  id: string; name: string; platform: string
  followers: string; category: string; appliedDate: string
}
type KolEntry = {
  id: string; name: string; tier: Tier; clicks: number; bookings: number
}
type ApplicationGroup = {
  propertyId: string; property: string; applications: Application[]
}
type KolGroup = {
  propertyId: string; property: string; kols: KolEntry[]
}

// ── Mock data ─────────────────────────────────────────────────────────────────

// Pending applications — grouped by campaign
const INITIAL_APP_GROUPS: ApplicationGroup[] = [
  {
    propertyId: 'prop-001',
    property: '璞真建設 — 光河',
    applications: [
      { id: 'app-001', name: '何俊傑', platform: 'YouTube',   followers: '12.4萬', category: '生活風格', appliedDate: '2026-02-24' },
    ],
  },
  {
    propertyId: 'prop-005',
    property: '潤泰敦峰',
    applications: [
      { id: 'app-002', name: '蔡佳蓉', platform: 'Instagram', followers: '8.7萬',  category: '財經',     appliedDate: '2026-02-23' },
    ],
  },
]

// Active KOLs — grouped by campaign
const CAMPAIGN_KOLS: KolGroup[] = [
  {
    propertyId: 'prop-001',
    property: '璞真建設 — 光河',
    kols: [
      { id: 'kol-003', name: '林佳慧', tier: 'platinum', clicks: 678, bookings: 22 },
      { id: 'kol-001', name: '陳莎拉', tier: 'gold',     clicks: 456, bookings: 15 },
      { id: 'kol-005', name: '吳美玲', tier: 'gold',     clicks: 312, bookings:  9 },
    ],
  },
  {
    propertyId: 'prop-005',
    property: '潤泰敦峰',
    kols: [
      { id: 'kol-003', name: '林佳慧', tier: 'platinum', clicks: 498, bookings: 15 },
      { id: 'kol-001', name: '陳莎拉', tier: 'gold',     clicks: 402, bookings: 11 },
    ],
  },
]

const uniqueKolCount = new Set(CAMPAIGN_KOLS.flatMap((g) => g.kols.map((k) => k.id))).size

// ── CampaignKolGroup — expandable ─────────────────────────────────────────────
function CampaignKolGroup({ group, index }: { group: KolGroup; index: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      custom={5 + index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.08] last:border-b-0"
    >
      {/* Campaign header — clickable */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/30 transition-colors duration-150"
      >
        <div>
          <p className="text-sm font-medium">{group.property}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{group.kols.length} 位合作 KOL</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Expanded KOL list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-foreground/[0.08] bg-muted/20 divide-y divide-foreground/[0.06]">
              {group.kols.map((kol) => {
                const tier = TIER_CFG[kol.tier]
                return (
                  <div key={kol.id} className="px-5 py-4 pl-8">
                    <div className="flex items-center gap-2 mb-3">
                      <p className="text-sm font-medium">{kol.name}</p>
                      <span className={`text-xs uppercase tracking-widest px-1.5 py-px border ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: '點擊數', value: kol.clicks.toLocaleString('zh-TW') },
                        { label: '預約數', value: kol.bookings                        },
                      ].map((s) => (
                        <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-background px-3 py-2.5 text-center">
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{s.label}</p>
                          <p className="text-base font-serif mt-1">{s.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MerchantKolsPage() {
  const [appGroups, setAppGroups] = useState<ApplicationGroup[]>(INITIAL_APP_GROUPS)

  const totalPending = appGroups.reduce((s, g) => s + g.applications.length, 0)

  const removeApplication = (appId: string) => {
    setAppGroups((prev) =>
      prev
        .map((g) => ({ ...g, applications: g.applications.filter((a) => a.id !== appId) }))
        .filter((g) => g.applications.length > 0)
    )
  }

  return (
    <div className="space-y-12">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">KOL 管理</h1>
        <p className="text-sm text-muted-foreground mt-2">依商案管理合作 KOL 及審核申請。</p>
      </motion.div>

      {/* ── Pending applications — grouped by campaign ── */}
      <div>
        <motion.div
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">待審核申請</p>
          {totalPending > 0 ? (
            <span className="text-xs uppercase tracking-widest text-amber-700 border border-amber-200 bg-amber-50 px-1.5 py-px">
              {totalPending} 待處理
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">無待處理申請</span>
          )}
        </motion.div>

        <AnimatePresence mode="popLayout">
          {totalPending > 0 ? (
            <motion.div
              key="app-list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden divide-y divide-foreground/[0.06]"
            >
              {appGroups.map((group, gi) => (
                <motion.div key={group.propertyId} custom={2 + gi} initial="hidden" animate="visible" variants={fadeUp}>

                  {/* Campaign label row */}
                  <div className="px-5 py-2.5 bg-muted/30 flex items-center gap-2 border-b border-foreground/[0.06]">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{group.property}</p>
                    <span className="text-xs text-muted-foreground/50">{group.applications.length} 筆</span>
                  </div>

                  {/* Application rows */}
                  <AnimatePresence>
                    {group.applications.map((app) => (
                      <motion.div
                        key={app.id}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        className="px-5 py-4 pl-8 flex items-start justify-between gap-4 border-t border-foreground/[0.08]"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{app.name}</p>
                            <span className="text-xs text-muted-foreground font-mono">{app.platform}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {app.followers} 粉絲
                            <span className="mx-1.5 opacity-30">·</span>
                            {app.category}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{app.appliedDate}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => removeApplication(app.id)}
                            className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] px-3 py-1.5 bg-foreground text-background border border-foreground hover:bg-foreground/85 transition-colors duration-150"
                          >
                            <Check className="h-3 w-3" /> 通過
                          </button>
                          <button
                            onClick={() => removeApplication(app.id)}
                            className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] px-3 py-1.5 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
                          >
                            <X className="h-3 w-3" /> 拒絕
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="app-empty"
              custom={2} initial="hidden" animate="visible" variants={fadeUp}
              className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm px-5 py-8 text-center"
            >
              <p className="text-sm text-muted-foreground">目前沒有待審核的 KOL 申請。</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Active KOLs — grouped by campaign, expandable ── */}
      <div>
        <motion.div
          custom={4} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between mb-4"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">合作中的 KOL</p>
          <span className="text-xs text-muted-foreground">
            {CAMPAIGN_KOLS.length} 個商案
            <span className="mx-1.5 opacity-30">·</span>
            {uniqueKolCount} 位 KOL
          </span>
        </motion.div>

        <div className="rounded-2xl border border-foreground/[0.08] bg-stone-50 shadow-sm overflow-hidden">
          {CAMPAIGN_KOLS.map((group, i) => (
            <CampaignKolGroup key={group.propertyId} group={group} index={i} />
          ))}
        </div>
      </div>

    </div>
  )
}
