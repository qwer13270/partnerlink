'use client'

import { motion } from 'framer-motion'
import { FlaskConical, Users, Banknote, MapPin, Clock } from 'lucide-react'

const PLANNED_FEATURES = [
  { Icon: Users,      label: '年齡分布',   desc: '實際詢屋客戶年齡段統計' },
  { Icon: Banknote,   label: '收入分析',   desc: '客戶預算與負擔能力分布' },
  { Icon: MapPin,     label: '地域來源',   desc: '客戶居住地與通勤地分析' },
  { Icon: Clock,      label: '轉換時程',   desc: '詢問到成交的平均天數分析' },
]

export default function CustomerInsightsPage() {
  return (
    <div className="max-w-3xl">

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">分析客戶</p>
        <h1 className="text-3xl font-serif font-light">歷史客群分析</h1>
        <p className="text-sm text-muted-foreground mt-2">
          根據實際詢屋客戶資料，分析成交買家的人口輪廓與行為特徵。
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center py-16 px-8 border border-foreground/[0.07] bg-foreground/[0.01]"
      >
        <div className="w-14 h-14 flex items-center justify-center mb-6 border border-foreground/10 bg-foreground/[0.03]">
          <FlaskConical className="w-6 h-6 text-muted-foreground/40" strokeWidth={1.3} />
        </div>

        <p className="text-[0.58rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/35 mb-3">
          COMING SOON
        </p>
        <h2 className="text-xl font-serif font-light mb-3">功能開發中</h2>
        <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed mb-10">
          此功能需要收集客戶填寫的年齡、收入、居住地等人口資料後才能啟用。
          我們正在規劃詢屋表單的資料擴充，敬請期待。
        </p>

        <div className="w-full max-w-sm grid grid-cols-2 gap-3 text-left">
          {PLANNED_FEATURES.map(({ Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 + i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-2 p-4 border border-foreground/[0.06] bg-foreground/[0.02]"
            >
              <div className="w-7 h-7 flex items-center justify-center bg-foreground/[0.04]">
                <Icon className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-medium text-foreground/60">{label}</p>
              <p className="text-[0.68rem] text-muted-foreground/40 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  )
}
