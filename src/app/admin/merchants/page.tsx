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

type Status = 'active' | 'suspended'

type Merchant = {
  id: string
  company: string
  contact: string
  phone: string
  projectType: string
  activeProjects: number
  totalKols: number
  totalLeads: number
  joinDate: string
  status: Status
}

const INITIAL: Merchant[] = [
  { id: 'm-001', company: '信義聯合建設',   contact: '張建銘', phone: '02-2345-6789', projectType: '預售屋', activeProjects: 2, totalKols: 8,  totalLeads: 143, joinDate: '2025-09-01', status: 'active'    },
  { id: 'm-002', company: '新北大地產',     contact: '李佳怡', phone: '02-8901-2345', projectType: '成屋',   activeProjects: 1, totalKols: 3,  totalLeads: 57,  joinDate: '2025-10-15', status: 'active'    },
  { id: 'm-003', company: '台中優質住宅',   contact: '陳文正', phone: '04-2234-5678', projectType: '預售屋', activeProjects: 3, totalKols: 12, totalLeads: 289, joinDate: '2025-08-20', status: 'active'    },
  { id: 'm-004', company: '桃園精緻建設',   contact: '林美玲', phone: '03-3456-7890', projectType: '成屋',   activeProjects: 0, totalKols: 2,  totalLeads: 18,  joinDate: '2025-11-30', status: 'suspended' },
]

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleStatus = (id: string) =>
    setMerchants(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m))

  const activeCount = merchants.filter(m => m.status === 'active').length
  const suspendedCount = merchants.filter(m => m.status === 'suspended').length

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">商家管理</h1>
        <p className="text-sm text-muted-foreground mt-2">
          管理已通過審核的合作商家，查看專案與帶看數據，或停用帳號。
        </p>
      </motion.div>

      {/* Summary badges */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3 flex-wrap">
        <span className="text-[0.6rem] uppercase tracking-widest border border-foreground/15 px-2 py-1 text-muted-foreground">
          共 {merchants.length} 家商家
        </span>
        <span className="text-[0.6rem] uppercase tracking-widest border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
          {activeCount} 家合作中
        </span>
        {suspendedCount > 0 && (
          <span className="text-[0.6rem] uppercase tracking-widest border border-red-200 bg-red-50 px-2 py-1 text-red-600">
            {suspendedCount} 家停用
          </span>
        )}
      </motion.div>

      {/* Table */}
      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}
        className="border border-foreground/15 divide-y divide-foreground/[0.08]"
      >
        {/* Column headers */}
        <div className="px-5 py-2 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center">
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">商家</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-20 text-right">活躍商案</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-20 text-right">合作 KOL</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-20 text-right">帶看累計</p>
          <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground w-16 text-right">操作</p>
        </div>

        <AnimatePresence>
          {merchants.map((merchant) => (
            <motion.div key={merchant.id} layout>
              {/* Main row */}
              <div
                className={`px-5 py-4 grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center cursor-pointer hover:bg-muted/20 transition-colors duration-150 ${merchant.status === 'suspended' ? 'opacity-50' : ''}`}
                onClick={() => setExpandedId(expandedId === merchant.id ? null : merchant.id)}
              >
                {/* Merchant info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{merchant.company}</p>
                    <span className="text-[0.55rem] font-mono text-muted-foreground border border-foreground/10 px-1.5 py-px">
                      {merchant.projectType}
                    </span>
                    {merchant.status === 'suspended' && (
                      <span className="text-[0.55rem] uppercase tracking-widest text-red-600 border border-red-200 bg-red-50 px-1.5 py-px">停用</span>
                    )}
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground mt-0.5">
                    {merchant.contact}
                    <span className="mx-1.5 opacity-30">·</span>
                    {merchant.phone}
                  </p>
                </div>

                {/* Active projects */}
                <p className="text-sm font-mono w-20 text-right">{merchant.activeProjects}</p>

                {/* KOL count */}
                <p className="text-sm font-mono w-20 text-right">{merchant.totalKols}</p>

                {/* Leads */}
                <p className="text-sm font-mono w-20 text-right">{merchant.totalLeads}</p>

                {/* Expand icon */}
                <div className="w-16 flex justify-end text-muted-foreground">
                  {expandedId === merchant.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </div>
              </div>

              {/* Expanded panel */}
              <AnimatePresence>
                {expandedId === merchant.id && (
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
                        <p>加入日期：{merchant.joinDate}</p>
                        <p>商家 ID：{merchant.id}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStatus(merchant.id) }}
                          className={`text-[0.65rem] uppercase tracking-widest px-3 py-2 border transition-colors duration-150 ${
                            merchant.status === 'active'
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-foreground/15 text-muted-foreground hover:border-foreground hover:text-foreground'
                          }`}
                        >
                          {merchant.status === 'active' ? '停用帳號' : '恢復帳號'}
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
