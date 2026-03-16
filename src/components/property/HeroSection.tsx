'use client'

import Image from 'next/image'
import { MapPin, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import strings from '@/lib/strings'
import type { Property } from '@/lib/types'

interface HeroSectionProps {
  property: Property
}

export default function HeroSection({ property }: HeroSectionProps) {
  const { getLocalizedValue } = useLocale()
  const t = strings.property

  const statusLabel = {
    'pre-sale': t.preSale,
    'selling': t.selling,
    'sold-out': t.soldOut,
    'completed': t.completed,
  }

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}萬`
  }

  return (
    <section className="relative min-h-[90vh] flex flex-col">
      {/* Hero Image Area */}
      <div className="flex-1 relative">
        {/* Hero Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/placeholders/hero/hero-1.webp"
            alt={getLocalizedValue(property.name, property.nameEn)}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="editorial-container pb-16 md:pb-24">
            <div className="max-w-3xl">
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="badge-editorial-outline bg-background/80 backdrop-blur-sm">
                  {statusLabel[property.status]}
                </span>
              </motion.div>

              {/* Project Name */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-serif mt-6 mb-8 text-foreground"
              >
                {getLocalizedValue(property.name, property.nameEn)}
              </motion.h1>

              {/* Location */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex items-center gap-3 text-muted-foreground"
              >
                <MapPin className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-sm tracking-wide">
                  {getLocalizedValue(property.location, property.locationEn)}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Info Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="border-t border-border bg-background"
      >
        <div className="editorial-container">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {/* Price */}
            <div className="py-8 pr-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {t.priceRange}
              </p>
              <p className="text-2xl md:text-3xl font-serif">
                {formatPrice(property.priceRange.min)}
                <span className="text-muted-foreground mx-2">—</span>
                {formatPrice(property.priceRange.max)}
              </p>
            </div>

            {/* MRT */}
            <div className="py-8 px-8">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {t.nearestMrt}
              </p>
              <p className="text-lg font-serif">
                {getLocalizedValue(property.nearestMrt, property.nearestMrtEn)}
              </p>
              <p className="text-sm text-muted-foreground">
                {property.mrtWalkTime} {t.minutes} {t.walkingDistance}
              </p>
            </div>

            {/* Units */}
            <div className="py-8 px-8 hidden md:block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {t.highlights.totalUnits}
              </p>
              <p className="text-3xl font-serif">{property.totalUnits}</p>
            </div>

            {/* Completion */}
            <div className="py-8 pl-8 hidden md:block">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                {t.highlights.completion}
              </p>
              <p className="text-2xl font-serif">{property.completionDate}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Scroll
        </span>
        <ArrowDown className="h-4 w-4 text-muted-foreground animate-bounce" strokeWidth={1.5} />
      </motion.div>
    </section>
  )
}
