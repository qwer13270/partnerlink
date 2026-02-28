'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
type Status = 'active' | 'suspended'

type Kol = {
  id: string
  name: string
  platform: string
  followers: string
  category: string
  tier: Tier
  totalReferrals: number
  totalEarnings: string
  joinDate: string
  status: Status
}

const TIER_STYLES: Record<Tier, string> = {
  Bronze:   'text-amber-700  border-amber-200  bg-amber-50',
  Silver:   'text-slate-600  border-slate-200  bg-slate-50',
  Gold:     'text-yellow-700 border-yellow-200 bg-yellow-50',
  Platinum: 'text-violet-700 border-violet-200 bg-violet-50',
}

const TIERS: Tier[] = ['Bronze', 'Silver', 'Gold', 'Platinum']

const INITIAL: Kol[] = [
  { id: 'k-001', name: '陳雅婷', platform: 'Instagram', followers: '42.1萬', category: '生活風格', tier: 'Gold',     totalReferrals: 38, totalEarnings: 'NT$284,000', joinDate: '2025-09-12', status: 'active' },
  { id: 'k-002', name: '林俊宏', platform: 'YouTube',   followers: '18.7萬', category: '房產',     tier: 'Silver',   totalReferrals: 21, totalEarnings: 'NT$157,500', joinDate: '2025-10-03', status: 'active' },
  { id: 'k-003', name: '王曉明', platform: 'TikTok',    followers: '67.4萬', category: '財經',     tier: 'Platinum', totalReferrals: 74, totalEarnings: 'NT$612,000', joinDate: '2025-08-20', status: 'active' },
  { id: 'k-004', name: '吳思穎', platform: 'Instagram', followers: '9.3萬',  category: '親子',     tier: 'Bronze',   totalReferrals: 7,  totalEarnings: 'NT$52,500',  joinDate: '2025-11-15', status: 'active' },
  { id: 'k-005', name: '劉承翰', platform: 'YouTube',   followers: '31.2萬', category: '科技',     tier: 'Silver',   totalReferrals: 18, totalEarnings: 'NT$135,000', joinDate: '2025-10-28', status: 'suspended' },
  { id: 'k-006', name: '張雯婷', platform: 'Instagram', followers: '15.6萬', category: '旅遊',     tier: 'Bronze',   totalReferrals: 11, totalEarnings: 'NT$82,500',  joinDate: '2025-12-01', status: 'active' },
  { id: 'k-007', name: '黃建誠', platform: 'YouTube',   followers: '52.8萬', category: '財經',     tier: 'Gold',     totalReferrals: 45, totalEarnings: 'NT$337,500', joinDate: '2025-09-05', status: 'active' },
  { id: 'k-008', name: '許淑芬', platform: 'TikTok',    followers: '23.9萬', category: '生活風格', tier: 'Silver',   totalReferrals: 29, totalEarnings: 'NT$217,500', joinDate: '2025-10-17', status: 'active' },
  { id: 'k-009', name: '蔡明哲', platform: 'Instagram', followers: '8.1萬',  category: '房產',     tier: 'Bronze',   totalReferrals: 4,  totalEarnings: 'NT$30,000',  joinDate: '2026-01-08', status: 'active' },
  { id: 'k-010', name: '周雅琪', platform: 'YouTube',   followers: '44.5萬', category: '親子',     tier: 'Gold',     totalReferrals: 52, totalEarnings: 'NT$390,000', joinDate: '2025-08-30', status: 'active' },
  { id: 'k-011', name: '鄭志豪', platform: 'TikTok',    followers: '11.2萬', category: '科技',     tier: 'Bronze',   totalReferrals: 6,  totalEarnings: 'NT$45,000',  joinDate: '2025-12-20', status: 'suspended' },
  { id: 'k-012', name: '方詩涵', platform: 'Instagram', followers: '28.4萬', category: '旅遊',     tier: 'Silver',   totalReferrals: 24, totalEarnings: 'NT$180,000', joinDate: '2025-11-02', status: 'active' },
]

export default function AdminKolsPage() {
  const [kols, setKols] = useState<Kol[]>(INITIAL)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleStatus = (id: string) =>
    setKols(prev => prev.map(k => k.id === id ? { ...k, status: k.status === 'active' ? 'suspended' : 'active' } : k))

  const changeTier = (id: string, tier: Tier) =>
    setKols(prev => prev.map(k => k.id === id ? { ...k, tier } : k))

  const activeCount = kols.filter(k => k.status === 'active').length
  const suspendedCount = kols.filter(k => k.status === 'suspended').length

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">KOL 管理</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理已通過審核的 KOL，調整等級或停用帳號。
        </p>
      </motion.div>

      {/* Summary badges */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        <span className="text-[0.6rem] uppercase tracking-widest border border-foreground/15 px-2 py-1 text-muted-foreground">
          共 {kols.length} 位 KOL
        </span>
        <span className="text-[0.6rem] uppercase tracking-widest border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
          {activeCount} 位活躍
        </span>
        {suspendedCount > 0 && (
          <span className="text-[0.6rem] uppercase tracking-widest border border-red-200 bg-red-50 px-2 py-1 text-red-600">
            {suspendedCount} 位停用
          </span>
        )}
      </motion.div>

      {/* Table */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
        className="border border-foreground/15 divide-y divide-foreground/[0.08]"
      >
        {/* Column headers */}
        <div className="px-5 py-2 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">KOL</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-24 text-right">累積推薦</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-28 text-right">累積佣金</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-16 text-right">等級</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-24 text-right">操作</p>
        </div>

        <AnimatePresence>
          {kols.map((kol, i) => (
            <motion.div key={kol.id} layout>
              {/* Main row */}
              <div
                className={`px-5 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center cursor-pointer hover:bg-muted/20 transition-colors duration-150 ${kol.status === 'suspended' ? 'opacity-50' : ''}`}
                onClick={() => setExpandedId(expandedId === kol.id ? null : kol.id)}
              >
                {/* KOL info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{kol.name}</p>
                    {kol.status === 'suspended' && (
                      <span className="text-[0.55rem] uppercase tracking-widest text-red-600 border border-red-200 bg-red-50 px-1.5 py-px">停用</span>
                    )}
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    {kol.platform}
                    <span className="mx-1.5 opacity-30">·</span>
                    {kol.followers} 粉絲
                    <span className="mx-1.5 opacity-30">·</span>
                    {kol.category}
                  </p>
                </div>

                {/* Referrals */}
                <p className="text-sm font-mono w-24 text-right">{kol.totalReferrals}</p>

                {/* Earnings */}
                <p className="text-sm font-mono w-28 text-right">{kol.totalEarnings}</p>

                {/* Tier badge */}
                <div className="w-16 flex justify-end">
                  <span className={`text-[0.55rem] uppercase tracking-widest border px-1.5 py-px ${TIER_STYLES[kol.tier]}`}>
                    {kol.tier}
                  </span>
                </div>

                {/* Expand icon */}
                <div className="w-24 flex justify-end text-muted-foreground">
                  {expandedId === kol.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </div>
              </div>

              {/* Expanded panel */}
              <AnimatePresence>
                {expandedId === kol.id && (
                  <motion.div
                    key="expanded"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden border-t border-foreground/[0.06]"
                  >
                    <div className="px-5 py-4 bg-muted/10 flex items-center justify-between gap-6 flex-wrap">
                      {/* Meta */}
                      <div className="text-[0.65rem] text-muted-foreground space-y-1">
                        <p>加入日期：{kol.joinDate}</p>
                        <p>KOL ID：{kol.id}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Tier selector */}
                        <div className="flex items-center gap-1.5">
                          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">等級</p>
                          <div className="flex gap-1">
                            {TIERS.map(t => (
                              <button
                                key={t}
                                onClick={(e) => { e.stopPropagation(); changeTier(kol.id, t) }}
                                className={`text-[0.55rem] uppercase tracking-widest border px-1.5 py-px transition-colors duration-150 ${kol.tier === t ? TIER_STYLES[t] : 'border-foreground/15 text-muted-foreground hover:border-foreground/30'}`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Suspend / Restore */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStatus(kol.id) }}
                          className={`text-[0.65rem] uppercase tracking-widest px-3 py-2 border transition-colors duration-150 ${
                            kol.status === 'active'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-foreground/15 text-muted-foreground hover:border-foreground hover:text-foreground'
                          }`}
                        >
                          {kol.status === 'active' ? '停用帳號' : '恢復帳號'}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

    </div>
  )
}
