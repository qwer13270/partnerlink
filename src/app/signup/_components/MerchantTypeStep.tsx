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
}[] = [
  {
    value: 'property',
    icon: Building2,
    label: '住宅建案',
    desc: '預售屋、新成屋等住宅開發案',
  },
  {
    value: 'shop',
    icon: Store,
    label: '商業案場',
    desc: '商辦、店面、商場等商業地產',
  },
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
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4"
        >
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">你的案場類型</h2>
        <p className="text-sm text-[#6B6560]">選擇後將決定你可刊登的案場類型</p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {TYPES.map(({ value, icon: Icon, label, desc }, i) => (
          <motion.button
            key={value}
            custom={i + 1}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            onClick={() => onSelect(value)}
            className="group text-left border border-[#E8E4DF] p-6 hover:border-[#1A1A1A] hover:bg-[#1A1A1A] transition-all duration-300"
          >
            <div className="w-10 h-10 border border-[#E8E4DF] group-hover:border-white/20 flex items-center justify-center mb-5 transition-colors duration-300">
              <Icon className="h-4 w-4 text-[#6B6560] group-hover:text-white transition-colors duration-300" />
            </div>
            <div className="text-sm font-medium text-[#1A1A1A] group-hover:text-white mb-2 transition-colors duration-300">
              {label}
            </div>
            <div className="text-xs text-[#6B6560] group-hover:text-white/50 leading-relaxed transition-colors duration-300">
              {desc}
            </div>
            <div className="mt-5 flex items-center gap-2 text-xs text-[#6B6560] group-hover:text-white/60 transition-colors duration-300">
              選擇
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}
