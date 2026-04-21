'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MousePointerClick, Package, BadgeDollarSign,
  ChevronRight, Building2, Store,
} from 'lucide-react'
import type { CollabSummary } from '@/app/kol/projects/page'
import ProjectTypeBadge from '@/components/kol/ProjectTypeBadge'

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
          liquid-glass relative overflow-hidden rounded-2xl
          transition-all duration-300 hover:-translate-y-0.5
          ${isActive ? '' : 'opacity-60'}
        `}>

          {/* Top accent line by project type */}
          <div className={`!absolute inset-x-0 top-0 h-[2px] ${
            is建案 ? 'bg-stone-300/70' : 'bg-violet-300/70'
          }`} />

          <div className="px-6 pt-6 pb-5">

            {/* Header row */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-start gap-3 min-w-0">
                {/* Icon */}
                <div className={`shrink-0 mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border ${
                  is建案
                    ? 'border-stone-200/30 bg-stone-300/10 text-stone-200'
                    : 'border-violet-200/30 bg-violet-300/10 text-violet-200'
                }`}>
                  <ProjectTypeIcon type={collab.project_type} className="h-3.5 w-3.5" />
                </div>

                {/* Name + type */}
                <div className="min-w-0">
                  <h3 className="font-body text-sm font-medium leading-snug truncate pr-1 text-white/95">
                    {collab.project_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <ProjectTypeBadge type={collab.project_type} />
                    {/* Collab type badge */}
                    <span className="text-[0.6rem] font-mono uppercase tracking-[0.25em] text-white/40">
                      {collabTypeLabel(collab.collaboration_type)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status + chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-[0.6rem] uppercase tracking-[0.25em] font-medium px-2 py-1 border ${
                  isActive
                    ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                    : 'border-white/15 bg-white/5 text-white/45'
                }`}>
                  {isActive ? '進行中' : '已封存'}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
            </div>

            {/* Description preview */}
            {collab.collab_description && (
              <p className="font-body text-xs text-white/55 leading-relaxed line-clamp-2 mb-4">
                {collab.collab_description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.07]">
              <div className="flex items-center gap-1.5 font-body text-xs text-white/55">
                <MousePointerClick className="h-3 w-3 shrink-0" />
                <span>{collab.clicks.toLocaleString()} 點擊</span>
              </div>

              {is建案 && collab.commission_rate !== null && (
                <div className="flex items-center gap-1.5 font-body text-xs text-white/55">
                  <BadgeDollarSign className="h-3 w-3 shrink-0" />
                  <span>{collab.commission_rate}% 佣金</span>
                </div>
              )}

              {!is建案 && collab.items_count > 0 && (
                <div className="flex items-center gap-1.5 font-body text-xs text-white/55">
                  <Package className="h-3 w-3 shrink-0" />
                  <span>{collab.items_count} 項商品</span>
                </div>
              )}

              {!is建案 && collab.collaboration_type === 'sponsored' && collab.sponsorship_bonus && (
                <div className="flex items-center gap-1.5 font-body text-xs text-amber-200">
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
      <div className="flex items-end gap-8 mb-10 opacity-[0.18]">
        <Building2 className="h-24 w-24 text-white" strokeWidth={0.8} />
        <Store     className="h-20 w-20 text-white" strokeWidth={0.8} />
      </div>
      <p className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-white/40 mb-4">
        尚無合作項目
      </p>
      <h2 className="font-heading text-2xl text-white mb-3">
        還沒有<span className="italic">進行中</span>的合作
      </h2>
      <p className="font-body text-sm text-white/55 max-w-xs leading-relaxed">
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
    all:      { label: '全部',   accent: active ? 'bg-white text-black border-white' : 'text-white/55 border-white/15 hover:text-white hover:border-white/30' },
    property: { label: '建案',   accent: active ? 'bg-stone-200 text-stone-900 border-stone-200'  : 'text-stone-200/70 border-stone-300/20 hover:border-stone-200/40 hover:text-stone-100' },
    shop:     { label: '商案',   accent: active ? 'bg-violet-200 text-violet-900 border-violet-200' : 'text-violet-200/70 border-violet-300/20 hover:border-violet-200/40 hover:text-violet-100' },
  }
  const { label, accent } = cfg[value]

  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-1.5 rounded-full text-[0.72rem] font-mono tracking-[0.08em] border transition-all duration-200 ${accent}`}
    >
      {label}
      {count > 0 && (
        <span className={`ml-1.5 text-[0.65rem] font-mono ${active ? 'opacity-60' : 'opacity-50'}`}>
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
    <div className="space-y-10 text-white">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="font-body text-[10px] uppercase tracking-[0.45em] text-white/45 mb-3">KOL 管理</p>
        <h1 className="font-heading text-4xl md:text-5xl tracking-tight leading-[1.05]">
          合作 <span className="italic">項目</span>
        </h1>
        <p className="font-body text-sm text-white/60 mt-3">
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
            { label: '進行中',   value: String(active.length),                                                    accent: 'text-emerald-200' },
            { label: '建案合作', value: String(collaborations.filter(c => c.project_type === 'property').length), accent: 'text-white' },
            { label: '商案合作', value: String(collaborations.filter(c => c.project_type === 'shop').length),     accent: 'text-violet-200' },
          ].map(s => (
            <div key={s.label} className="liquid-glass rounded-2xl px-5 py-5 text-center">
              <p className="font-body text-[10px] uppercase tracking-[0.3em] text-white/55 mb-2">{s.label}</p>
              <p className={`font-heading italic text-3xl ${s.accent}`}>{s.value}</p>
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
                className={`relative px-4 py-1.5 rounded-full text-[0.72rem] font-mono tracking-[0.08em] border transition-all duration-200 ${
                  statusTab === t
                    ? 'bg-white text-black border-white'
                    : 'text-white/55 border-white/15 hover:text-white hover:border-white/30'
                }`}
              >
                {t === 'active' ? '進行中' : '已封存'}
                {t === 'active' && active.length > 0 && (
                  <span className={`ml-1.5 text-[0.65rem] font-mono ${statusTab === 'active' ? 'opacity-60' : 'opacity-50'}`}>
                    {active.length}
                  </span>
                )}
                {t === 'archived' && archived.length > 0 && (
                  <span className={`ml-1.5 text-[0.65rem] font-mono ${statusTab === 'archived' ? 'opacity-60' : 'opacity-50'}`}>
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
              <p className="font-mono text-sm text-white/40 py-12 text-center tracking-[0.1em]">
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
