'use client'

import { Home, Ruler, Layers, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import strings from '@/lib/strings'
import type { Property } from '@/lib/types'

interface HighlightsBarProps {
  property: Property
}

export default function HighlightsBar({ property }: HighlightsBarProps) {
  const t = strings.property.highlights

  const highlights = [
    {
      icon: Home,
      label: t.totalUnits,
      value: property.totalUnits,
      suffix: '戶',
    },
    {
      icon: Ruler,
      label: t.sizeRange,
      value: `${property.sizeRange.min}–${property.sizeRange.max}`,
      suffix: '坪',
    },
    {
      icon: Layers,
      label: t.floors,
      value: property.floors,
      suffix: 'F',
    },
    {
      icon: Calendar,
      label: t.completion,
      value: property.completionDate,
      suffix: '',
    },
  ]

  return (
    <section className="border-b border-border bg-secondary/30">
      <div className="editorial-container">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="py-12 md:py-16 border-r border-border last:border-r-0 md:even:border-r md:last:border-r-0 first:border-l-0"
              >
                <div className="px-6 md:px-8 text-center">
                  <Icon
                    className="h-5 w-5 mx-auto mb-4 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                  <p className="text-3xl md:text-4xl font-serif mb-2">
                    {item.value}
                    {item.suffix && (
                      <span className="text-lg text-muted-foreground ml-1">
                        {item.suffix}
                      </span>
                    )}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
