'use client'

import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import { cn } from '@/lib/utils'
import type { Property } from '@/lib/types'

interface ConstructionTimelineProps {
  property: Property
}

export default function ConstructionTimeline({ property }: ConstructionTimelineProps) {
  const t = useTranslations('property.timeline')
  const { getLocalizedValue } = useLocale()

  // Find the current milestone (first incomplete one)
  const currentIndex = property.timeline.findIndex((m) => !m.completed)
  const inProgressIndex = currentIndex === -1 ? property.timeline.length : currentIndex

  return (
    <section className="section-editorial">
      <div className="editorial-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                Progress
              </p>
              <h2 className="text-4xl md:text-5xl font-serif">{t('title')}</h2>
            </div>
            <p className="text-muted-foreground">
              {t('expectedCompletion')}:{' '}
              <span className="font-serif text-foreground">{property.completionDate}</span>
            </p>
          </div>
        </motion.div>

        {/* Desktop Timeline - Horizontal */}
        <div className="hidden md:block">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute top-3 left-0 right-0 h-px bg-border" />
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-3 left-0 h-px bg-foreground origin-left"
              style={{
                width: `${((inProgressIndex) / (property.timeline.length - 1)) * 100}%`,
              }}
            />

            {/* Milestones */}
            <div className="relative flex justify-between">
              {property.timeline.map((milestone, index) => {
                const isCompleted = milestone.completed
                const isCurrent = index === inProgressIndex
                const isUpcoming = index > inProgressIndex

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex flex-col items-center text-center"
                    style={{ width: `${100 / property.timeline.length}%` }}
                  >
                    {/* Milestone Dot */}
                    <div
                      className={cn(
                        'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300',
                        isCompleted && 'bg-foreground border-foreground',
                        isCurrent && 'bg-background border-foreground border-2',
                        isUpcoming && 'bg-background border-border'
                      )}
                    >
                      {isCompleted && (
                        <Check className="h-3 w-3 text-background" strokeWidth={2} />
                      )}
                      {isCurrent && (
                        <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="mt-6 px-2">
                      <p
                        className={cn(
                          'text-sm font-medium mb-1',
                          isCompleted && 'text-foreground',
                          isCurrent && 'text-foreground',
                          isUpcoming && 'text-muted-foreground'
                        )}
                      >
                        {getLocalizedValue(milestone.label, milestone.labelEn)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {milestone.date}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>

        {/* Mobile Timeline - Vertical */}
        <div className="md:hidden">
          <div className="relative pl-8">
            {/* Vertical Line */}
            <div className="absolute top-0 bottom-0 left-[11px] w-px bg-border" />
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 left-[11px] w-px bg-foreground origin-top"
              style={{
                height: `${((inProgressIndex) / (property.timeline.length - 1)) * 100}%`,
              }}
            />

            {/* Milestones */}
            <div className="space-y-12">
              {property.timeline.map((milestone, index) => {
                const isCompleted = milestone.completed
                const isCurrent = index === inProgressIndex
                const isUpcoming = index > inProgressIndex

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative flex items-start gap-6"
                  >
                    {/* Milestone Dot */}
                    <div
                      className={cn(
                        'absolute left-[-27px] flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300',
                        isCompleted && 'bg-foreground border-foreground',
                        isCurrent && 'bg-background border-foreground border-2',
                        isUpcoming && 'bg-background border-border'
                      )}
                    >
                      {isCompleted && (
                        <Check className="h-3 w-3 text-background" strokeWidth={2} />
                      )}
                      {isCurrent && (
                        <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                      )}
                    </div>

                    {/* Content */}
                    <div>
                      <p
                        className={cn(
                          'font-medium mb-1',
                          isCompleted && 'text-foreground',
                          isCurrent && 'text-foreground',
                          isUpcoming && 'text-muted-foreground'
                        )}
                      >
                        {getLocalizedValue(milestone.label, milestone.labelEn)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {milestone.date}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
