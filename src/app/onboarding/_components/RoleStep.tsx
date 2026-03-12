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
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-2">你是？</h2>
        <p className="text-sm text-[#6B6560]">請選擇你的合作身份以繼續</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.button
          custom={1} initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => onSelect('kol')}
          className="group text-left border border-[#E8E4DF] p-6 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] transition-all duration-300"
        >
          <div className="w-10 h-10 border border-[#E8E4DF] group-hover:border-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
            <Mic2 className="h-4 w-4 text-[#6B6560] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-[#1A1A1A] group-hover:text-white mb-2 transition-colors duration-300">KOL 創作者</div>
          <div className="text-xs text-[#6B6560] group-hover:text-white/50 leading-relaxed transition-colors duration-300">
            推廣商案並賺取透明佣金
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#6B6560] group-hover:text-white/60 transition-colors duration-300">
            立即加入
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>

        <motion.button
          custom={2} initial="hidden" animate="visible" variants={fadeUp}
          onClick={() => onSelect('merchant')}
          className="group text-left border border-[#E8E4DF] p-6 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] transition-all duration-300"
        >
          <div className="w-10 h-10 border border-[#E8E4DF] group-hover:border-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
            <Building2 className="h-4 w-4 text-[#6B6560] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="text-sm font-medium text-[#1A1A1A] group-hover:text-white mb-2 transition-colors duration-300">商案商家</div>
          <div className="text-xs text-[#6B6560] group-hover:text-white/50 leading-relaxed transition-colors duration-300">
            刊登商案並觸及精準買家
          </div>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#6B6560] group-hover:text-white/60 transition-colors duration-300">
            立即加入
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>
      </div>

      <motion.p custom={3} initial="hidden" animate="visible" variants={fadeUp} className="mt-8 text-xs text-[#6B6560] text-center">
        已有帳號？{' '}
        <Link href="/login" className="text-[#1A1A1A] underline underline-offset-4 hover:text-[#B5886C] transition-colors">
          登入
        </Link>
      </motion.p>
    </motion.div>
  )
}
