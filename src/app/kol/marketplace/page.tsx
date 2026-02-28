'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Tag, Search, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { mockProperties } from '@/data/mock-properties'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Mock metadata per project ───────────────────────────────────────────────
const CASE_META: Record<string, {
  commission: string
  tags: string[]
  applicants: number
  isNew?: boolean
  isHot?: boolean
}> = {
  'prop-001': { commission: '3.5%', tags: ['生活風格', '財經'],   applicants: 12, isHot: true  },
  'prop-002': { commission: '2.8%', tags: ['生活風格', '旅遊'],   applicants: 8,  isNew: true  },
  'prop-003': { commission: '4.2%', tags: ['財經', '美食'],       applicants: 5               },
  'prop-004': { commission: '3.0%', tags: ['美食', '生活風格'],   applicants: 15, isHot: true  },
  'prop-005': { commission: '2.5%', tags: ['財經', '旅遊'],       applicants: 3,  isNew: true  },
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  'pre-sale': { label: '預售中', color: 'bg-amber-50 text-amber-700 border-amber-200'       },
  'selling':  { label: '熱賣中', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  'sold-out': { label: '已售罄', color: 'bg-neutral-100 text-neutral-500 border-neutral-200' },
}

const ALL_TAGS = ['全部', '生活風格', '財經', '美食', '旅遊']

// ── Page ────────────────────────────────────────────────────────────────────
export default function KolMarketplacePage() {
  const [search, setSearch]       = useState('')
  const [activeTag, setActiveTag] = useState('全部')

  const filtered = mockProperties.filter((p) => {
    const meta = CASE_META[p.id]
    const matchesSearch =
      !search ||
      p.name.includes(search) ||
      p.merchant.includes(search) ||
      p.location.includes(search)
    const matchesTag =
      activeTag === '全部' || meta?.tags.includes(activeTag)
    return matchesSearch && matchesTag
  })

  return (
    <div className="space-y-8">

      {/* ── Header ── */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">商案廣場</p>
        <h1 className="text-3xl font-serif mb-1">所有合作商案</h1>
        <p className="text-sm text-muted-foreground">瀏覽平台上所有開放申請的商案，找到最適合你受眾的合作機會。</p>
      </motion.div>

      {/* ── Filters ── */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜尋商案、商家或地區…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2.5 border border-border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        {/* Tag filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 text-xs border transition-all duration-200 ${
                activeTag === tag
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Results count ── */}
      <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp}
        className="text-xs text-muted-foreground uppercase tracking-widest">
        共 {filtered.length} 個商案
      </motion.p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}
          className="border border-foreground/15 py-20 text-center">
          <p className="text-muted-foreground text-sm">找不到符合條件的商案</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prop, i) => {
            const meta   = CASE_META[prop.id] ?? { commission: '3%', tags: [], applicants: 0 }
            const status = STATUS_MAP[prop.status] ?? STATUS_MAP['pre-sale']

            return (
              <motion.div
                key={prop.id}
                custom={3 + i} initial="hidden" animate="visible" variants={fadeUp}
                className="border border-foreground/15 hover:border-foreground/40 transition-colors duration-300 flex flex-col"
              >
                {/* Image placeholder */}
                <div className="h-24 bg-muted/40 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                  <p className="relative z-10 text-xs text-foreground/50 px-3 text-center leading-snug">
                    {prop.merchant}
                  </p>
                  <div className="absolute top-2 left-2 flex gap-1">
                    {meta.isNew && (
                      <span className="text-[0.55rem] uppercase tracking-widest px-1.5 py-0.5 bg-foreground text-background">NEW</span>
                    )}
                    {meta.isHot && (
                      <span className="text-[0.55rem] uppercase tracking-widest px-1.5 py-0.5 bg-amber-500 text-white">HOT</span>
                    )}
                  </div>
                  <span className={`absolute top-2 right-2 text-[0.55rem] uppercase tracking-widest px-1.5 py-0.5 border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="text-[0.7rem] text-muted-foreground mb-0.5">{prop.merchant}</p>
                    <h3 className="text-sm font-medium leading-snug">{prop.name}</h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    {prop.location}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {meta.tags.map((tag) => (
                      <span key={tag} className="text-[0.6rem] px-1.5 py-0.5 border border-foreground/15 text-muted-foreground flex items-center gap-1">
                        <Tag className="h-2 w-2" />{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-foreground/10 mt-auto">
                    <div>
                      <p className="text-[0.55rem] uppercase tracking-widest text-muted-foreground">佣金</p>
                      <p className="text-base font-serif">{meta.commission}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.55rem] uppercase tracking-widest text-muted-foreground">已申請</p>
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
      )}

    </div>
  )
}
