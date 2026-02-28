'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

type Application = {
  id: string
  company: string
  contact: string
  phone: string
  projectType: string
  projectCount: number
  note: string
  appliedDate: string
}

const INITIAL: Application[] = [
  {
    id: 'ma-001',
    company: '信義聯合建設',
    contact: '張建銘',
    phone: '02-2345-6789',
    projectType: '預售屋',
    projectCount: 2,
    note: '計劃在台北信義、大安兩區各推出一個建案，預計 Q3 正式上線。',
    appliedDate: '2026-02-25',
  },
  {
    id: 'ma-002',
    company: '新北大地產',
    contact: '李佳怡',
    phone: '02-8901-2345',
    projectType: '成屋',
    projectCount: 1,
    note: '板橋區現有成屋兩棟，希望透過 KOL 推廣加速去化。',
    appliedDate: '2026-02-24',
  },
]

export default function AdminMerchantApplicationsPage() {
  const [items, setItems] = useState<Application[]>(INITIAL)

  const remove = (id: string) =>
    setItems((prev) => prev.filter((a) => a.id !== id))

  return (
    <div className="space-y-8">

      {/* Header */}
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">管理後台</p>
        <h1 className="text-3xl font-serif">商家申請</h1>
        <p className="text-sm text-muted-foreground mt-2">
          審核希望在 HomeKey 刊登商案的建商申請。
        </p>
      </motion.div>

      {/* Count badge */}
      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="flex items-center gap-3">
        {items.length > 0 ? (
          <span className="text-[0.6rem] uppercase tracking-widest text-amber-700 border border-amber-200 bg-amber-50 px-2 py-1">
            {items.length} 筆待審核
          </span>
        ) : (
          <span className="text-[0.6rem] uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">
            無待審核申請
          </span>
        )}
      </motion.div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {items.length > 0 ? (
          <motion.div
            key="list"
            className="border border-foreground/15 divide-y divide-foreground/[0.08]"
          >
            {items.map((app, i) => (
              <motion.div
                key={app.id}
                custom={2 + i} initial="hidden" animate="visible" variants={fadeUp}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
                className="px-5 py-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1">
                      <p className="text-sm font-medium">{app.company}</p>
                      <span className="text-[0.6rem] font-mono text-muted-foreground border border-border px-1.5 py-px">
                        {app.projectType}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-muted-foreground">
                      聯絡人 {app.contact}
                      <span className="mx-1.5 opacity-30">·</span>
                      {app.phone}
                      <span className="mx-1.5 opacity-30">·</span>
                      預計商案數 {app.projectCount}
                      <span className="mx-1.5 opacity-30">·</span>
                      申請日 {app.appliedDate}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-lg">{app.note}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <button
                      onClick={() => remove(app.id)}
                      className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest px-3 py-2 bg-foreground text-background hover:bg-foreground/85 transition-colors duration-150"
                    >
                      <Check className="h-3 w-3" /> 通過
                    </button>
                    <button
                      onClick={() => remove(app.id)}
                      className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest px-3 py-2 border border-border text-muted-foreground hover:border-foreground hover:text-foreground transition-colors duration-150"
                    >
                      <X className="h-3 w-3" /> 拒絕
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="border border-foreground/15 px-5 py-12 text-center"
          >
            <p className="text-sm text-muted-foreground">目前沒有待審核的商家申請。</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
