'use client'

import { motion } from 'framer-motion'
import strings from '@/lib/strings'
import { ActivityLog, OverviewStats, QuickActions } from '@/components/admin'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } },
}

export default function AdminDashboardDemoPage() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col gap-10 text-white">
      <motion.section variants={fadeUp}>
        <div className="meta text-[10px] text-white/40 mb-4">管理後台</div>
        <h1 className="font-heading text-[40px] md:text-[56px] leading-[1] tracking-tight">
          {strings.admin.overview.title}
        </h1>
        <p className="mt-3 font-body text-sm text-white/55 max-w-xl">
          {strings.admin.overview.subtitle}
        </p>
      </motion.section>

      <motion.div variants={fadeUp}>
        <OverviewStats />
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <ActivityLog />
        <QuickActions />
      </motion.div>
    </motion.div>
  )
}
