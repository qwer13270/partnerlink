'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Building2, Mic2 } from 'lucide-react'
import { slideIn, fadeUp } from '../_constants'
import type { Role } from '../_types'

export function RoleStep({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <motion.div key="step1" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
        <h2 className="font-heading italic text-white text-4xl mb-2">你是？</h2>
        <p className="font-body text-sm text-white/60">請選擇你的合作身份以繼續</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => onSelect('kol')}
          className="group text-left liquid-glass rounded-xl p-6 hover:liquid-glass-strong transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center mb-5">
            <Mic2 className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-white mb-2 font-body">KOL 創作者</div>
          <div className="text-xs text-white/50 leading-relaxed font-body">
            推廣商案並賺取透明佣金
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/40 group-hover:text-white/70 transition-colors duration-300 font-body">
            立即加入
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>

        <motion.button
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => onSelect('merchant')}
          className="group text-left liquid-glass rounded-xl p-6 hover:liquid-glass-strong transition-all duration-300"
        >
          <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center mb-5">
            <Building2 className="h-4 w-4 text-white/60 group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-white mb-2 font-body">商案商家</div>
          <div className="text-xs text-white/50 leading-relaxed font-body">
            刊登商案並觸及精準買家
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-white/40 group-hover:text-white/70 transition-colors duration-300 font-body">
            立即加入
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>
      </div>

      <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 text-xs text-white/50 text-center font-body">
        已有帳號？{' '}
        <Link href="/login" className="text-white underline underline-offset-4 hover:text-white/70 transition-colors">
          登入
        </Link>
      </motion.p>
    </motion.div>
  )
}
