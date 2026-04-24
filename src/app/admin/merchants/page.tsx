'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/admin/_shared/StatusBadge'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

type Project = {
  id: string
  name: string
  slug: string
  publishStatus: string
  isArchived: boolean
  createdAt: string
  dealValue: number
}

type Merchant = {
  id: string
  userId: string
  companyName: string
  contactName: string | null
  phone: string | null
  city: string | null
  status: string
  createdAt: string
  merchantType: string | null
  activeProjects: number
  archivedProjects: number
  totalDealValue: number
  projects: Project[]
}

const MERCHANT_TYPE_LABEL: Record<string, string> = { property: '地產', shop: '商店' }

function fmtDeal(wan: number): string {
  if (wan === 0) return '—'
  if (wan >= 10000) return `${(wan / 10000).toFixed(wan % 10000 === 0 ? 0 : 1)} 億`
  return `${wan.toLocaleString()} 萬`
}

export default function AdminMerchantsPage() {
  const [merchants, setMerchants]   = useState<Merchant[]>([])
  const [loading, setLoading]       = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Merchant | null>(null)
  const [deleting, setDeleting]     = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true); setDeleteError('')
    try {
      const res = await fetch(`/api/admin/merchants/${deleteTarget.userId}`, { method: 'DELETE' })
      const payload = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) { setDeleteError(payload?.error ?? '刪除失敗，請稍後再試。'); return }
      setMerchants((prev) => prev.filter((m) => m.userId !== deleteTarget.userId))
      setDeleteTarget(null)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : '刪除失敗，請稍後再試。')
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    fetch('/api/admin/merchants', { cache: 'no-store' })
      .then(r => r.json())
      .then((d: { ok?: boolean; merchants?: Merchant[] }) => {
        if (d.ok) setMerchants(d.merchants ?? [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const activeCount    = merchants.filter(m => m.status === 'active').length
  const suspendedCount = merchants.filter(m => m.status === 'suspended').length

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-8 text-white">

      <motion.section variants={fadeUp}>
        <div className="meta text-[10px] text-white/40 mb-4">管理後台</div>
        <h1 className="font-heading text-[40px] md:text-[56px] leading-[1] tracking-tight">
          商家 <span className="italic">管理</span>
        </h1>
        <p className="mt-3 font-body text-sm text-white/55 max-w-xl">
          管理已通過審核的合作商家，查看專案數據。
        </p>
      </motion.section>

      <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
        {loading ? (
          <div className="h-6 w-32 bg-white/[0.06] rounded-full animate-pulse" />
        ) : (
          <>
            <StatusBadge variant="neutral">共 {merchants.length} 家商家</StatusBadge>
            {activeCount > 0 && activeCount < merchants.length && <StatusBadge variant="success">{activeCount} 家合作中</StatusBadge>}
            {suspendedCount > 0 && suspendedCount < merchants.length && <StatusBadge variant="danger">{suspendedCount} 家停用</StatusBadge>}
          </>
        )}
      </motion.div>

      <motion.div variants={fadeUp} className="liquid-glass !rounded-[22px] overflow-hidden">
        <div className="px-5 py-3 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center border-b border-white/5">
          <p className="meta text-[10px] text-white/45">商家</p>
          <p className="meta text-[10px] text-white/45 w-28 text-right">總成交</p>
          <p className="meta text-[10px] text-white/45 w-24 text-right">商案數</p>
          <p className="w-8" />
        </div>

        <div className="divide-y divide-white/5">
          {loading ? (
            [0, 1, 2].map(i => (
              <div key={i} className="px-5 py-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-36 bg-white/[0.07] rounded animate-pulse" />
                  <div className="h-2.5 w-48 bg-white/[0.04] rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-3 w-16 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-3 w-4 bg-white/[0.04] rounded animate-pulse" />
              </div>
            ))
          ) : merchants.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-body text-sm text-white/55">目前尚無已審核商家</p>
            </div>
          ) : (
            merchants.map((merchant) => {
              const isOpen = expandedId === merchant.id
              const totalProjects = merchant.activeProjects + merchant.archivedProjects
              return (
                <div key={merchant.id}>
                  <div
                    className={`px-5 py-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center cursor-pointer hover:bg-white/[0.025] transition-colors ${merchant.status === 'suspended' ? 'opacity-60' : ''}`}
                    onClick={() => setExpandedId(isOpen ? null : merchant.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[14px] text-white/90">{merchant.companyName}</p>
                        {merchant.merchantType && (
                          <span className="meta text-[9px] border border-white/10 bg-white/[0.03] text-white/55 px-1.5 py-px rounded">
                            {MERCHANT_TYPE_LABEL[merchant.merchantType] ?? merchant.merchantType}
                          </span>
                        )}
                        {merchant.status === 'suspended' && <StatusBadge variant="danger">停用</StatusBadge>}
                      </div>
                      <p className="meta text-[10px] text-white/45 mt-1 truncate">
                        {[merchant.contactName, merchant.phone, merchant.city].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    <p className="font-heading italic text-[18px] text-white/90 w-28 text-right">{fmtDeal(merchant.totalDealValue)}</p>

                    <div className="w-24 flex items-center justify-end gap-1.5">
                      <span className="inline-flex items-center gap-1 meta text-[9px] px-1.5 py-0.5 rounded-full border border-emerald-400/40 bg-white/[0.02] text-emerald-200">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        {merchant.activeProjects}
                      </span>
                      <span className="inline-flex items-center gap-1 meta text-[9px] px-1.5 py-0.5 rounded-full border border-white/10 bg-white/[0.02] text-white/50">
                        <span className="w-1 h-1 rounded-full bg-white/30 shrink-0" />
                        {merchant.archivedProjects}
                      </span>
                    </div>

                    <div className="w-8 flex justify-end items-center gap-1 text-white/50">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(merchant); setDeleteError('') }}
                        className="p-1 hover:text-red-300 transition-colors"
                        aria-label="Delete merchant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-white/5"
                      >
                        <div className="bg-white/[0.015] px-6 py-5 space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="meta text-[10px] text-white/45">
                              加入日期：{new Date(merchant.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <span className="meta text-[10px] text-white/35">{totalProjects} 個商案</span>
                          </div>

                          {merchant.projects.length === 0 ? (
                            <p className="meta text-[10px] text-white/35 py-2">尚無商案</p>
                          ) : (
                            <div className="space-y-1.5">
                              {[...merchant.projects].sort((a, b) => {
                                if (a.isArchived !== b.isArchived) return a.isArchived ? 1 : -1
                                if (a.publishStatus !== b.publishStatus) return a.publishStatus === 'published' ? -1 : 1
                                return 0
                              }).map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2.5 group">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      p.isArchived ? 'bg-white/25' :
                                      p.publishStatus === 'published' ? 'bg-emerald-400' : 'bg-amber-400'
                                    }`} />
                                    <p className="text-[13px] text-white/85 truncate">{p.name}</p>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    <p className="font-heading italic text-[13px] text-white/65">{fmtDeal(p.dealValue)}</p>
                                    <StatusBadge
                                      variant={p.isArchived ? 'neutral' : p.publishStatus === 'published' ? 'success' : 'warning'}
                                      dot={false}
                                    >
                                      {p.isArchived ? '已封存' : p.publishStatus === 'published' ? '已發布' : '草稿'}
                                    </StatusBadge>
                                    {!p.isArchived && (
                                      <Link
                                        href={`/properties/${p.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-white/45 hover:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                      </Link>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => { if (!deleting) setDeleteTarget(null) }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-lg liquid-glass-strong !rounded-2xl overflow-hidden text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-white/10">
                  <div>
                    <p className="meta text-[10px] text-red-300 mb-1">刪除商家</p>
                    <h3 className="font-heading italic text-[24px]">永久刪除 {deleteTarget.companyName}</h3>
                    <p className="mt-2 text-[13px] text-white/60 leading-relaxed">
                      此操作會永久刪除商家帳號、所有商案、上傳的圖片，以及相關紀錄。無法復原。
                    </p>
                  </div>
                  <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}
                    className="mt-0.5 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all duration-150 disabled:opacity-40">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
                    <p className="meta text-[10px] text-white/40 mb-1">商家</p>
                    <p className="text-[13px] text-white/85">
                      {deleteTarget.companyName}
                      {deleteTarget.contactName && <> · <span className="text-white/55">{deleteTarget.contactName}</span></>}
                    </p>
                    <p className="meta text-[10px] text-white/45 mt-1">
                      共 {deleteTarget.activeProjects + deleteTarget.archivedProjects} 個商案將一併刪除
                    </p>
                  </div>
                  {deleteError && (
                    <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{deleteError}</div>
                  )}
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}
                    className="liquid-glass !rounded-full text-white/75 font-body font-medium text-[12px] px-4 py-2.5 hover:text-white active:scale-[0.97] transition-all duration-150 disabled:opacity-40">
                    取消
                  </button>
                  <button type="button" onClick={() => void handleDelete()} disabled={deleting}
                    className="rounded-full border border-red-400/40 bg-red-500/10 text-red-200 font-body font-medium text-[12px] px-4 py-2.5 hover:bg-red-500/20 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? '刪除中…' : '確認刪除'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
