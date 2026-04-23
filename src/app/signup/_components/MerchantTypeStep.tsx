'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Store } from 'lucide-react'
import { slideIn, fadeUp } from '../_constants'
import type { MerchantType } from '../_types'

const TYPES: {
  value: MerchantType
  icon: React.ElementType
  label: string
  desc: string
  disabled?: boolean
}[] = [
  { value: 'property', icon: Building2, label: '住宅建案', desc: '預售屋、新成屋等住宅開發案' },
  { value: 'shop', icon: Store, label: '商業品牌', desc: '商辦、店面、商場等商業地產' },
]

export function MerchantTypeStep({
  onBack,
  onSelect,
}: {
  onBack: () => void
  onSelect: (type: MerchantType) => void
}) {
  return (
    <motion.div key="step-merchant-type" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4 font-body">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="font-heading italic text-white text-3xl mb-1">你的營業類型</h2>
        <p className="font-body text-sm text-white/60">選擇後將決定你可刊登的商案類型</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {TYPES.map(({ value, icon: Icon, label, desc, disabled }, i) => (
          <motion.button
            key={value}
            custom={i + 1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onClick={() => !disabled && onSelect(value)}
            disabled={disabled}
            className={`relative text-left rounded-xl p-6 transition-all duration-300 ${
              disabled
                ? 'liquid-glass opacity-40 cursor-not-allowed'
                : 'group liquid-glass hover:liquid-glass-strong cursor-pointer'
            }`}
          >
            {disabled && (
              <span className="absolute top-3 right-3 text-[9px] tracking-[1.5px] uppercase text-white/40 liquid-glass rounded-full px-2 py-0.5 font-body">
                開發中
              </span>
            )}
            <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center mb-5">
              <Icon className={`h-4 w-4 text-white/50 transition-colors duration-300 ${!disabled && 'group-hover:text-white'}`} />
            </div>
            <div className={`text-sm font-medium text-white mb-2 font-body transition-colors duration-300`}>
              {label}
            </div>
            <div className={`text-xs text-white/50 leading-relaxed font-body`}>
              {desc}
            </div>
            {!disabled && (
              <div className="mt-5 flex items-center gap-2 text-xs text-white/40 group-hover:text-white/70 transition-colors duration-300 font-body">
                選擇
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
