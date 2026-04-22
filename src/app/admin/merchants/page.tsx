'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ExternalLink, Trash2, X } from 'lucide-react'
import Link from 'next/link'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
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

const MERCHANT_TYPE_LABEL: Record<string, string> = {
  property: '地產',
  shop:     '商店',
}

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
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">商家管理</h1>
        <p className="text-sm text-muted-foreground mt-2">管理已通過審核的合作商家，查看專案數據。</p>
      </motion.div>

      {/* Summary badges */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        {loading ? (
          <div className="h-6 w-32 bg-foreground/[0.06] rounded animate-pulse" />
        ) : (
          <>
            <span className="text-xs uppercase tracking-[0.4em] border border-foreground/15 px-2 py-1 text-muted-foreground">
              共 {merchants.length} 家商家
            </span>
            {activeCount > 0 && activeCount < merchants.length && (
              <span className="text-xs uppercase tracking-[0.4em] border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                {activeCount} 家合作中
              </span>
            )}
            {suspendedCount > 0 && suspendedCount < merchants.length && (
              <span className="text-xs uppercase tracking-[0.4em] border border-red-200 bg-red-50 px-2 py-1 text-red-600">
                {suspendedCount} 家停用
              </span>
            )}
          </>
        )}
      </motion.div>

      {/* Table */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm overflow-hidden divide-y divide-foreground/[0.06]"
      >
        {/* Column headers */}
        <div className="px-5 py-2 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">商家</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground w-28 text-right">總成交金額</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground w-24 text-right">商案數</p>
          <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground w-8" />
        </div>

        {loading ? (
          [0, 1, 2].map(i => (
            <div key={i} className="px-5 py-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center">
              <div className="space-y-1.5">
                <div className="h-3.5 w-36 bg-foreground/[0.07] rounded animate-pulse" />
                <div className="h-2.5 w-48 bg-foreground/[0.04] rounded animate-pulse" />
              </div>
              <div className="h-3 w-16 bg-foreground/[0.05] rounded animate-pulse" />
              <div className="h-3 w-16 bg-foreground/[0.05] rounded animate-pulse" />
              <div className="h-3 w-4 bg-foreground/[0.04] rounded animate-pulse" />
            </div>
          ))
        ) : merchants.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground/50">目前尚無已審核商家</div>
        ) : (
          <AnimatePresence>
            {merchants.map((merchant) => {
              const isOpen = expandedId === merchant.id
              const totalProjects = merchant.activeProjects + merchant.archivedProjects
              return (
                <motion.div key={merchant.id} layout>

                  {/* Main row */}
                  <div
                    className={`px-5 py-4 grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center cursor-pointer hover:bg-muted/20 transition-colors duration-150 ${merchant.status === 'suspended' ? 'opacity-50' : ''}`}
                    onClick={() => setExpandedId(isOpen ? null : merchant.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{merchant.companyName}</p>
                        {merchant.merchantType && (
                          <span className="text-[0.67rem] tracking-[0.2em] border border-foreground/10 bg-foreground/[0.04] text-foreground/50 px-1.5 py-px">
                            {MERCHANT_TYPE_LABEL[merchant.merchantType] ?? merchant.merchantType}
                          </span>
                        )}
                        {merchant.status === 'suspended' && (
                          <span className="text-xs uppercase tracking-[0.3em] text-red-600 border border-red-200 bg-red-50 px-1.5 py-px">停用</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[merchant.contactName, merchant.phone, merchant.city].filter(Boolean).join(' · ')}
                      </p>
                    </div>

                    {/* 總成交金額 */}
                    <p className="text-sm font-serif w-28 text-right">{fmtDeal(merchant.totalDealValue)}</p>

                    {/* 商案數 — active + archived */}
                    <div className="w-24 flex items-center justify-end gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[0.67rem] font-medium px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                        {merchant.activeProjects}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[0.67rem] font-medium px-1.5 py-0.5 rounded bg-foreground/[0.03] text-foreground/40 border border-foreground/[0.07]">
                        <span className="w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
                        {merchant.archivedProjects}
                      </span>
                    </div>

                    <div className="w-8 flex justify-end items-center gap-1 text-muted-foreground">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(merchant); setDeleteError('') }}
                        className="p-1 hover:text-red-600 transition-colors"
                        aria-label="Delete merchant"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded — project list */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="expanded"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden border-t border-foreground/[0.06]"
                      >
                        <div className="bg-foreground/[0.015] px-6 py-4 space-y-3">

                          {/* Meta row */}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              加入日期：{new Date(merchant.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            <span className="text-xs text-muted-foreground/50 font-mono">{totalProjects} 個商案</span>
                          </div>

                          {/* Project list */}
                          {merchant.projects.length === 0 ? (
                            <p className="text-xs text-muted-foreground/40 py-2">尚無商案</p>
                          ) : (
                            <div className="space-y-1.5">
                              {[...merchant.projects].sort((a, b) => {
                                if (a.isArchived !== b.isArchived) return a.isArchived ? 1 : -1
                                if (a.publishStatus !== b.publishStatus) return a.publishStatus === 'published' ? -1 : 1
                                return 0
                              }).map((p) => (
                                <div key={p.id} className="flex items-center justify-between gap-3 rounded-lg border border-foreground/[0.07] bg-background px-3.5 py-2.5 group">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      p.isArchived ? 'bg-foreground/20' :
                                      p.publishStatus === 'published' ? 'bg-emerald-500' : 'bg-amber-400'
                                    }`} />
                                    <p className="text-sm truncate">{p.name}</p>
                                  </div>
                                  <div className="flex items-center gap-3 shrink-0">
                                    {/* 成交金額 */}
                                    <p className="text-xs font-serif text-muted-foreground">
                                      {fmtDeal(p.dealValue)}
                                    </p>
                                    <span className={`text-[0.67rem] font-medium px-1.5 py-0.5 rounded border ${
                                      p.isArchived
                                        ? 'bg-foreground/[0.03] text-foreground/35 border-foreground/[0.07]'
                                        : p.publishStatus === 'published'
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                                          : 'bg-amber-50 text-amber-700 border-amber-200/50'
                                    }`}>
                                      {p.isArchived ? '已封存' : p.publishStatus === 'published' ? '已發布' : '草稿'}
                                    </span>
                                    {!p.isArchived && (
                                      <Link
                                        href={`/properties/${p.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-muted-foreground hover:text-foreground"
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

                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Delete confirm modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-[2px]"
              onClick={() => { if (!deleting) setDeleteTarget(null) }}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.99 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.99 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto w-full max-w-lg bg-background border border-foreground/20 shadow-2xl rounded-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between px-6 pt-6 pb-5 border-b border-foreground/[0.08]">
                  <div>
                    <p className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-red-600 mb-1">刪除商家</p>
                    <h3 className="text-xl font-serif">永久刪除 {deleteTarget.companyName}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                      此操作會永久刪除商家帳號、所有商案、上傳的圖片，以及相關紀錄。無法復原。
                    </p>
                  </div>
                  <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}
                    className="mt-0.5 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/[0.06] transition-all duration-150 disabled:opacity-40">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-5 space-y-3">
                  <div className="rounded-lg border border-foreground/[0.08] bg-linen px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/50 mb-1">商家</p>
                    <p className="text-sm">
                      {deleteTarget.companyName}
                      {deleteTarget.contactName && <> · <span className="text-muted-foreground">{deleteTarget.contactName}</span></>}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      共 {deleteTarget.activeProjects + deleteTarget.archivedProjects} 個商案將一併刪除
                    </p>
                  </div>
                  {deleteError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>
                  )}
                </div>
                <div className="px-6 pb-6 flex justify-end gap-2">
                  <button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting}
                    className="rounded-lg bg-black/[0.06] text-foreground/70 font-medium text-[0.78rem] px-4 py-2.5 hover:bg-black/[0.10] active:scale-[0.97] transition-all duration-150 disabled:opacity-40">
                    取消
                  </button>
                  <button type="button" onClick={() => void handleDelete()} disabled={deleting}
                    className="rounded-lg bg-red-500 text-white font-medium text-[0.78rem] px-4 py-2.5 hover:bg-red-600 active:scale-[0.97] transition-all duration-150 disabled:opacity-40 inline-flex items-center gap-1.5">
                    <Trash2 className="h-3.5 w-3.5" />
                    {deleting ? '刪除中…' : '確認刪除'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  )
}
