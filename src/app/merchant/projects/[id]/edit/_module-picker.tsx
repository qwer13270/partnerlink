'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MODULE_META } from './_types'
import type { PropertyModuleType, PropertyTemplateKey } from '@/lib/property-template'

export const MODULE_TYPE_ORDER: PropertyModuleType[] = [
  'intro_identity', 'intro_specs', 'features',
  'progress', 'location', 'surroundings', 'team', 'indoor_commons', 'contact', 'footer', 'image_section', 'floor_plan',
]

export const SHANGAN_MODULE_TYPE_ORDER: PropertyModuleType[] = [
  'shop_hero', 'shop_products', 'shop_about', 'shop_features',
  'shop_gallery', 'shop_faq', 'shop_contact', 'shop_footer',
]

export function ModulePicker({
  existingTypes,
  templateKey,
  onAdd,
}: {
  existingTypes: Set<PropertyModuleType>
  templateKey: PropertyTemplateKey
  onAdd: (type: PropertyModuleType) => void
}) {
  const [open, setOpen] = useState(false)

  const typeOrder = templateKey === 'shop' ? SHANGAN_MODULE_TYPE_ORDER : MODULE_TYPE_ORDER
  const addable = typeOrder.filter(
    (t) => t === 'image_section' || !existingTypes.has(t),
  )

  return (
    <div className="shrink-0 border-t border-foreground/[0.07]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-foreground/[0.02]"
      >
        <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 ${
          open
            ? 'border-foreground/30 bg-foreground/[0.05] text-foreground'
            : 'border-foreground/12 bg-foreground/[0.03] text-muted-foreground group-hover:border-foreground/25 group-hover:text-foreground'
        }`}>
          <Plus className={`h-3 w-3 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} />
        </div>
        <p className="text-xs uppercase tracking-[0.3em] text-foreground/60 group-hover:text-foreground/80">
          新增模塊
        </p>
        {addable.length === 1 && (
          <span className="ml-auto text-xs text-muted-foreground/40">僅剩圖片區塊</span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-1.5 px-3 pb-3">
              {addable.map((type) => {
                const meta = MODULE_META[type]
                const isMulti = type === 'image_section'
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { onAdd(type); setOpen(false) }}
                    className="group flex items-center gap-2 rounded-md border border-foreground/12 bg-foreground/[0.04] px-2.5 py-2 text-left transition-all duration-150 hover:border-foreground/25 hover:bg-foreground/[0.08]"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-foreground/[0.06] text-foreground/50 transition-colors duration-150 group-hover:bg-foreground/[0.12] group-hover:text-foreground">
                      <meta.Icon className="h-3 w-3" />
                    </div>
                    <span className="truncate text-xs text-foreground/65 transition-colors duration-150 group-hover:text-foreground">
                      {meta.label}
                    </span>
                    {isMulti && (
                      <span className="ml-auto shrink-0 rounded-sm bg-[#C9A96E]/12 px-1 py-px text-xs uppercase tracking-wider text-[#C9A96E]/70">
                        可多個
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
