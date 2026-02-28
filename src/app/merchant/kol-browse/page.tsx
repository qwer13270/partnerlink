'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ChevronDown } from 'lucide-react'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Types ──────────────────────────────────────────────────────────────────
type Tier = 'platinum' | 'gold' | 'silver' | 'bronze'
type Category = '生活風格' | '財經' | '房產' | '科技' | '旅遊' | '親子'

const TIER_CFG: Record<Tier, { label: string; color: string }> = {
  platinum: { label: 'Platinum', color: 'text-purple-700 border-purple-200 bg-purple-50'  },
  gold:     { label: 'Gold',     color: 'text-amber-700 border-amber-200 bg-amber-50'     },
  silver:   { label: 'Silver',   color: 'text-zinc-500 border-zinc-200 bg-zinc-50'        },
  bronze:   { label: 'Bronze',   color: 'text-orange-800 border-orange-200 bg-orange-50'  },
}

type Kol = {
  id: string
  name: string
  platform: string
  followers: string
  category: Category
  tier: Tier
  avgConversion: string
  totalSales: number
  recentClicks: number
  bio: string
}

// ── Mock data ──────────────────────────────────────────────────────────────
const ALL_KOLS: Kol[] = [
  {
    id: 'kol-001',
    name: '陳莎拉',
    platform: 'YouTube',
    followers: '42.1萬',
    category: '生活風格',
    tier: 'platinum',
    avgConversion: '21.3%',
    totalSales: 18,
    recentClicks: 3240,
    bio: '深耕台北生活品質與居家美學，受眾以 30-45 歲有購屋需求的雙薪族為主。',
  },
  {
    id: 'kol-002',
    name: '林佳慧',
    platform: 'Instagram',
    followers: '28.7萬',
    category: '財經',
    tier: 'platinum',
    avgConversion: '19.8%',
    totalSales: 14,
    recentClicks: 2870,
    bio: '理財規劃、房市分析為主要內容，吸引高資產族群，實際購屋意圖強烈。',
  },
  {
    id: 'kol-003',
    name: '何俊傑',
    platform: 'YouTube',
    followers: '18.3萬',
    category: '房產',
    tier: 'gold',
    avgConversion: '17.2%',
    totalSales: 9,
    recentClicks: 1960,
    bio: '專注台灣各區房產開箱與實地走訪，內容客觀受眾信任度高。',
  },
  {
    id: 'kol-004',
    name: '蔡佳蓉',
    platform: 'Instagram',
    followers: '12.4萬',
    category: '生活風格',
    tier: 'gold',
    avgConversion: '15.6%',
    totalSales: 7,
    recentClicks: 1580,
    bio: '台北、新北日常生活記錄，分享購屋心路歷程，觀眾互動率極高。',
  },
  {
    id: 'kol-005',
    name: '吳美玲',
    platform: 'TikTok',
    followers: '9.8萬',
    category: '親子',
    tier: 'gold',
    avgConversion: '14.1%',
    totalSales: 5,
    recentClicks: 1120,
    bio: '親子家庭換屋紀錄，受眾以有孩子的三口之家為主，購屋意願明確。',
  },
  {
    id: 'kol-006',
    name: '張威廉',
    platform: 'YouTube',
    followers: '7.2萬',
    category: '科技',
    tier: 'silver',
    avgConversion: '11.4%',
    totalSales: 3,
    recentClicks: 890,
    bio: '科技業工程師，分享高薪族購屋思維與貸款策略，受眾購買力強。',
  },
  {
    id: 'kol-007',
    name: '劉嘉欣',
    platform: 'Instagram',
    followers: '5.5萬',
    category: '旅遊',
    tier: 'silver',
    avgConversion: '9.8%',
    totalSales: 2,
    recentClicks: 640,
    bio: '環遊台灣各縣市，分享各地居住環境與生活品質，受眾地域分佈廣泛。',
  },
  {
    id: 'kol-008',
    name: '陳宗翰',
    platform: 'YouTube',
    followers: '3.1萬',
    category: '財經',
    tier: 'bronze',
    avgConversion: '8.2%',
    totalSales: 1,
    recentClicks: 380,
    bio: '新手投資人財經頻道，成長快速，受眾以 25-35 歲首購族為主。',
  },
]

const PROJECTS = [
  { id: 'prop-001', name: '璞真建設 — 光河' },
  { id: 'prop-005', name: '潤泰敦峰'       },
]

const CATEGORIES: Category[] = ['生活風格', '財經', '房產', '科技', '旅遊', '親子']

// ── Invite modal ───────────────────────────────────────────────────────────
function InviteModal({
  kol,
  onClose,
  onConfirm,
}: {
  kol: Kol
  onClose: () => void
  onConfirm: (projectId: string) => void
}) {
  const [selectedProject, setSelectedProject] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-foreground/40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 bg-background border border-foreground/15 w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-foreground/[0.08]">
          <div>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground mb-1">邀請合作</p>
            <p className="text-base font-medium">{kol.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{kol.platform} · {kol.followers} 粉絲</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Project selection */}
        <div className="px-6 py-5">
          <p className="text-xs text-muted-foreground mb-3">選擇要邀請此 KOL 合作的商案：</p>
          <div className="space-y-2">
            {PROJECTS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProject(p.id)}
                className={`w-full text-left px-4 py-3 border text-sm transition-colors duration-150 flex items-center justify-between ${
                  selectedProject === p.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-foreground/20 hover:border-foreground/50'
                }`}
              >
                {p.name}
                {selectedProject === p.id && <Check className="h-3.5 w-3.5" />}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-2">
          <button
            onClick={() => selectedProject && onConfirm(selectedProject)}
            disabled={!selectedProject}
            className="flex-1 py-2.5 text-[0.68rem] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            送出邀請
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[0.68rem] uppercase tracking-widest border border-foreground/20 text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
          >
            取消
          </button>
        </div>
      </motion.div>
    </div>
  )
}

// ── KOL row ────────────────────────────────────────────────────────────────
function KolRow({
  kol,
  index,
  invited,
  onInvite,
}: {
  kol: Kol
  index: number
  invited: boolean
  onInvite: (kol: Kol) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_CFG[kol.tier]

  return (
    <motion.div
      custom={index} initial="hidden" animate="visible" variants={fadeUp}
      className="border-b border-foreground/[0.08] last:border-b-0"
    >
      {/* Main row */}
      <div className="px-5 py-5 flex items-center gap-4">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#e8d5c4] to-[#b8936a] flex items-center justify-center shrink-0 text-white text-xs font-medium">
          {kol.name[0]}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{kol.name}</span>
            <span className={`text-[0.58rem] uppercase tracking-widest px-1.5 py-px border ${tier.color}`}>
              {tier.label}
            </span>
          </div>
          <p className="text-[0.65rem] text-muted-foreground mt-0.5">
            {kol.platform}
            <span className="mx-1.5 opacity-30">·</span>
            {kol.followers} 粉絲
            <span className="mx-1.5 opacity-30">·</span>
            {kol.category}
          </p>
        </div>

        {/* Stats */}
        <div className="hidden md:flex items-center gap-5 shrink-0 mr-2">
          <div className="text-center">
            <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">轉換率</p>
            <p className="text-sm font-serif mt-0.5">{kol.avgConversion}</p>
          </div>
          <div className="text-center">
            <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">累計成交</p>
            <p className="text-sm font-serif mt-0.5">{kol.totalSales}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {invited ? (
            <span className="text-[0.62rem] uppercase tracking-widest text-emerald-700 border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 flex items-center gap-1">
              <Check className="h-3 w-3" /> 已邀請
            </span>
          ) : (
            <button
              onClick={() => onInvite(kol)}
              className="text-[0.62rem] uppercase tracking-widest border border-foreground px-3 py-1.5 text-foreground hover:bg-foreground hover:text-background transition-colors duration-150"
            >
              邀請合作
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 border-t border-foreground/[0.06] bg-muted/20">
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">{kol.bio}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { label: '近期點擊', value: kol.recentClicks.toLocaleString('zh-TW') },
                  { label: '平均轉換率', value: kol.avgConversion },
                  { label: '累計成交', value: kol.totalSales },
                ].map((s) => (
                  <div key={s.label} className="border border-foreground/15 px-3 py-2.5 text-center bg-background">
                    <p className="text-[0.58rem] uppercase tracking-widest text-muted-foreground">{s.label}</p>
                    <p className="text-base font-serif mt-1">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function MerchantKolBrowsePage() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [invitingKol, setInvitingKol]       = useState<Kol | null>(null)
  const [invitedIds, setInvitedIds]         = useState<Set<string>>(new Set())

  const filtered = activeCategory
    ? ALL_KOLS.filter((k) => k.category === activeCategory)
    : ALL_KOLS

  const handleConfirm = (projectId: string) => {
    if (!invitingKol) return
    setInvitedIds((prev) => new Set(prev).add(invitingKol.id))
    setInvitingKol(null)
    void projectId // used by the modal
  }

  return (
    <div className="space-y-10">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商家後台</p>
        <h1 className="text-3xl font-serif">探索 KOL</h1>
        <p className="text-sm text-muted-foreground mt-2">
          瀏覽平台上所有 KOL，主動邀請合適的創作者加入您的商案推廣。
        </p>
      </motion.div>

      {/* ── Category filter ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={`text-[0.6rem] uppercase tracking-widest px-3 py-1.5 border transition-colors duration-150 ${
            activeCategory === null
              ? 'border-foreground bg-foreground text-background'
              : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
          }`}
        >
          全部
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`text-[0.6rem] uppercase tracking-widest px-3 py-1.5 border transition-colors duration-150 ${
              activeCategory === cat
                ? 'border-foreground bg-foreground text-background'
                : 'border-foreground/20 text-muted-foreground hover:border-foreground/50 hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* ── KOL list ── */}
      <div className="border border-foreground/15">
        {filtered.length > 0 ? (
          filtered.map((kol, i) => (
            <KolRow
              key={kol.id}
              kol={kol}
              index={2 + i}
              invited={invitedIds.has(kol.id)}
              onInvite={setInvitingKol}
            />
          ))
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">此分類目前沒有 KOL。</p>
          </div>
        )}
      </div>

      {/* ── Invite modal ── */}
      <AnimatePresence>
        {invitingKol && (
          <InviteModal
            kol={invitingKol}
            onClose={() => setInvitingKol(null)}
            onConfirm={handleConfirm}
          />
        )}
      </AnimatePresence>

    </div>
  )
}
