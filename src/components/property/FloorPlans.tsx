'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import type { Property } from '@/lib/types'

interface FloorPlansProps {
  property: Property
}

// Floor plan background images
const floorPlanImages = [
  '/images/placeholders/interior/interior-1.webp',
  '/images/placeholders/interior/interior-3.webp',
  '/images/placeholders/interior/interior-4.webp',
  '/images/placeholders/interior/interior-5.webp',
]

export default function FloorPlans({ property }: FloorPlansProps) {
  const t = useTranslations('property.floorPlans')
  const { getLocalizedValue } = useLocale()

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}萬`
  }

  return (
    <section className="section-editorial bg-secondary/30">
      <div className="editorial-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
            Floor Plans
          </p>
          <h2 className="text-4xl md:text-5xl font-serif">{t('title')}</h2>
        </motion.div>

        {/* Units Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {property.unitTypes.map((unit, index) => (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-background group cursor-pointer"
            >
              {/* Image */}
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={floorPlanImages[index % floorPlanImages.length]}
                  alt={getLocalizedValue(unit.name, unit.nameEn)}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Overlay with unit name */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <span className="text-6xl font-serif text-white/90">
                    {getLocalizedValue(unit.name, unit.nameEn)}
                  </span>
                </div>

                {/* Popular Badge */}
                {unit.isPopular && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-editorial bg-background text-foreground">
                      {t('popular')}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-8 border-t border-border">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-serif mb-1">
                      {getLocalizedValue(unit.name, unit.nameEn)}
                    </h3>
                    <p className="text-muted-foreground">
                      {getLocalizedValue(unit.rooms, unit.roomsEn)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">{t('size')}</span>
                    <span className="font-medium">{unit.size} 坪</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">{t('price')}</span>
                    <span className="font-serif text-lg">{formatPrice(unit.price)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
