'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointerClick, Package, BadgeDollarSign,
  ChevronRight, Layers, Building2, Store,
} from 'lucide-react'
import type { CollabSummary } from '@/app/kol/projects/page'

// ── Animations ────────────────────────────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.48, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function collabTypeLabel(type: CollabSummary['collaboration_type']) {
  if (type === 'commission') return '佣金合作'
  if (type === 'sponsored')  return '業配合作'
  return '互惠合作'
}

// ── Project type icon ─────────────────────────────────────────────────────────
function ProjectTypeIcon({ type, className }: { type: 'property' | 'shop'; className?: string }) {
  return type === 'property'
    ? <Building2 className={className} />
    : <Store     className={className} />
}

// ── Collaboration card ────────────────────────────────────────────────────────
function CollabCard({ collab, index }: { collab: CollabSummary; index: number }) {
  const is建案   = collab.project_type === 'property'
  const isActive = collab.collab_status === 'active' && !collab.project_archived

  return (
    <motion.div
      custom={index + 1}
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className="group relative"
    >
      <Link href={`/kol/projects/${collab.collaboration_id}`} className="block">
        <div className={`
          relative overflow-hidden rounded-xl border bg-linen shadow-sm
          transition-all duration-300
          hover:shadow-md hover:border-foreground/20
          ${isActive
            ? 'border-foreground/[0.08]'
            : 'border-foreground/[0.05] opacity-70'
          }
        `}>

          {/* Top accent line by project type */}
          <div className={`absolute inset-x-0 top-0 h-[2px] ${
            is建案 ? 'bg-stone-400/40' : 'bg-violet-400/40'
          }`} />

          <div className="px-6 pt-6 pb-5">

            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Icon */}
                <div className={`shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                  is建案
                    ? 'border-stone-200 bg-stone-50 text-stone-500'
                    : 'border-violet-200/70 bg-violet-50/80 text-violet-600'
                }`}>
                  <ProjectTypeIcon type={collab.project_type} className="h-3.5 w-3.5" />
                </div>

                {/* Name + type */}
                <div className="min-w-0">
                  <h3 className="text-sm font-medium leading-snug truncate pr-1">
                    {collab.project_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Project type badge */}
                    <span className={`text-[0.6rem] font-mono uppercase tracking-[0.3em] px-1.5 py-0.5 border ${
                      is建案
                        ? 'border-stone-200 bg-stone-50 text-stone-500'
                        : 'border-violet-200/70 bg-violet-50/80 text-violet-600'
                    }`}>
                      {collab.project_type}
                    </span>
                    {/* Collab type badge */}
                    <span className="text-[0.6rem] font-mono uppercase tracking-[0.25em] text-muted-foreground/60">
                      {collabTypeLabel(collab.collaboration_type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status + chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[0.6rem] uppercase tracking-[0.25em] font-medium px-2 py-1 border ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-zinc-200 bg-zinc-50 text-zinc-500'
                }`}>
                  {isActive ? '進行中' : '已封存'}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-foreground/60 transition-colors" />
              </div>
            </div>

            {/* Description preview */}
            {collab.collab_description && (
              <p className="text-xs text-muted-foreground/70 leading-relaxed line-clamp-2 mb-4">
                {collab.collab_description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 pt-4 border-t border-foreground/[0.06]">
              {/* Clicks */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MousePointerClick className="h-3 w-3 shrink-0" />
                <span>{collab.clicks.toLocaleString()} 點擊</span>
              </div>

              {/* Commission rate (建案) */}
              {is建案 && collab.commission_rate !== null && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BadgeDollarSign className="h-3 w-3 shrink-0" />
                  <span>{collab.commission_rate}% 佣金</span>
                </div>
              )}

              {/* Items count (商案) */}
              {!is建案 && collab.items_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Package className="h-3 w-3 shrink-0" />
                  <span>{collab.items_count} 項商品</span>
                </div>
              )}

              {/* Sponsorship bonus (商案 sponsored) */}
              {!is建案 && collab.collaboration_type === 'sponsored' && collab.sponsorship_bonus && (
                <div className="flex items-center gap-1.5 text-xs text-amber-600">
                  <BadgeDollarSign className="h-3 w-3 shrink-0" />
                  <span>NT${collab.sponsorship_bonus.toLocaleString()} 業配</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <div className="flex items-end gap-8 mb-10 opacity-[0.12]">
        <Building2 className="h-24 w-24 text-foreground" strokeWidth={0.8} />
        <Store     className="h-20 w-20 text-foreground" strokeWidth={0.8} />
      </div>
      <p className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-muted-foreground/40 mb-4">
        尚無合作項目
      </p>
      <h2 className="text-2xl font-serif font-light text-foreground mb-3">
        還沒有進行中的合作
      </h2>
      <p className="text-sm text-muted-foreground/60 max-w-xs leading-relaxed">
        商家邀請您合作後，所有建案與商案的合作詳情將顯示於此
      </p>
    </motion.div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
interface Props {
  collaborations: CollabSummary[]
}

type TypeFilter  = 'all' | 'property' | 'shop'
type StatusFilter = 'active' | 'archived'

// ── Type filter pill ──────────────────────────────────────────────────────────
function TypePill({
  value, active, count, onClick,
}: {
  value: TypeFilter
  active: boolean
  count: number
  onClick: () => void
}) {
  const cfg = {
    all:      { label: '全部',   accent: active ? 'bg-foreground text-background' : 'text-muted-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.05]' },
    property: { label: '建案',   accent: active ? 'bg-stone-600 text-white border-stone-600'  : 'text-stone-500/70 border-stone-200 hover:border-stone-300 hover:text-stone-600 hover:bg-stone-50/60' },
    shop:     { label: '商案',   accent: active ? 'bg-violet-600 text-white border-violet-600' : 'text-violet-500/70 border-violet-200 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50/60' },
  }
  const { label, accent } = cfg[value]

  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 rounded-lg text-[0.72rem] font-mono tracking-[0.08em] border transition-all duration-200 ${
        value === 'all' ? 'border-transparent' : 'border'
      } ${accent}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 text-[0.65rem] font-mono ${active ? 'opacity-60' : 'opacity-40'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

export default function KolProjectsClient({ collaborations }: Props) {
  const [statusTab, setStatusTab] = useState<StatusFilter>('active')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  const byType = (list: CollabSummary[]) =>
    typeFilter === 'all' ? list : list.filter(c => c.project_type === typeFilter)

  const active   = collaborations.filter(c => c.collab_status === 'active' && !c.project_archived)
  const archived = collaborations.filter(c => c.project_archived)
  const base     = statusTab === 'active' ? active : archived
  const shown   = byType(base)

  const countAll      = base.length
  const countProperty = base.filter(c => c.project_type === 'property').length
  const countShop     = base.filter(c => c.project_type === 'shop').length

  return (
    <div className="space-y-10">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">KOL 管理</p>
        <h1 className="text-3xl font-serif">合作項目</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理所有建案及商案合作
        </p>
      </motion.div>

      {/* Summary stats */}
      {collaborations.length > 0 && (
        <motion.div
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: '進行中',   value: String(active.length),                                                    accent: 'text-emerald-700' },
            { label: '建案合作', value: String(collaborations.filter(c => c.project_type === 'property').length), accent: 'text-foreground'  },
            { label: '商案合作', value: String(collaborations.filter(c => c.project_type === 'shop').length),     accent: 'text-violet-700'  },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-5 text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">{s.label}</p>
              <p className={`text-3xl font-serif ${s.accent}`}>{s.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Empty */}
      {collaborations.length === 0 && <EmptyState />}

      {/* Filters row */}
      {collaborations.length > 0 && (
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
          className="flex items-center justify-between gap-4 flex-wrap"
        >
          {/* Status tabs (left) */}
          <div className="flex items-center gap-1">
            {(['active', 'archived'] as const).map(t => (
              <button
                key={t}
                onClick={() => setStatusTab(t)}
                className={`relative px-4 py-1.5 rounded-lg text-[0.72rem] font-mono tracking-[0.08em] transition-all duration-200 ${
                  statusTab === t
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.05]'
                }`}
              >
                {t === 'active' ? '進行中' : '已封存'}
                {t === 'active' && active.length > 0 && (
                  <span className={`ml-1.5 text-[0.65rem] font-mono ${statusTab === 'active' ? 'text-background/50' : 'text-muted-foreground/35'}`}>
                    {active.length}
                  </span>
                )}
                {t === 'archived' && archived.length > 0 && (
                  <span className={`ml-1.5 text-[0.65rem] font-mono ${statusTab === 'archived' ? 'text-background/50' : 'text-muted-foreground/35'}`}>
                    {archived.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Type filter pills (right) */}
          <div className="flex items-center gap-1.5">
            <TypePill value="all"      active={typeFilter === 'all'}      count={countAll}      onClick={() => setTypeFilter('all')} />
            <TypePill value="property" active={typeFilter === 'property'} count={countProperty} onClick={() => setTypeFilter('property')} />
            <TypePill value="shop"     active={typeFilter === 'shop'}     count={countShop}     onClick={() => setTypeFilter('shop')} />
          </div>
        </motion.div>
      )}

      {/* Cards */}
      {collaborations.length > 0 && (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${statusTab}-${typeFilter}`}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {shown.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {shown.map((c, i) => (
                  <CollabCard key={c.collaboration_id} collab={c} index={i} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground/50 py-12 text-center font-mono tracking-[0.1em]">
                {typeFilter !== 'all'
                  ? `此分類目前沒有${statusTab === 'active' ? '進行中' : '已封存'}的合作`
                  : statusTab === 'active' ? '目前沒有進行中的合作' : '目前沒有已封存的合作'
                }
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

    </div>
  )
}
