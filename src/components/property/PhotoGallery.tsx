'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import type { Property } from '@/lib/types'

interface PhotoGalleryProps {
  property: Property
}

// Placeholder images mapped to gallery slots
const galleryImages = [
  '/images/placeholders/interior/interior-1.webp',
  '/images/placeholders/projects/project-1.webp',
  '/images/placeholders/interior/interior-3.webp',
  '/images/placeholders/exterior/exterior-1.webp',
  '/images/placeholders/interior/interior-4.webp',
  '/images/placeholders/projects/project-2.webp',
  '/images/placeholders/interior/interior-5.webp',
  '/images/placeholders/exterior/exterior-2.webp',
]

export default function PhotoGallery({ property }: PhotoGalleryProps) {
  const t = useTranslations('property.gallery')
  const { getLocalizedValue } = useLocale()

  // Create an editorial asymmetric layout pattern
  const getGridClass = (index: number) => {
    const patterns = [
      'col-span-2 row-span-2', // Large
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-2', // Tall
      'col-span-1 row-span-1', // Small
      'col-span-2 row-span-1', // Wide
      'col-span-1 row-span-1', // Small
      'col-span-1 row-span-1', // Small
    ]
    return patterns[index % patterns.length]
  }

  const getAspectClass = (index: number) => {
    const patterns = [
      'aspect-square',
      'aspect-[4/3]',
      'aspect-[4/3]',
      'aspect-[3/4]',
      'aspect-[4/3]',
      'aspect-[2/1]',
      'aspect-[4/3]',
      'aspect-[4/3]',
    ]
    return patterns[index % patterns.length]
  }

  return (
    <section className="section-editorial">
      <div className="editorial-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-16"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Gallery
            </p>
            <h2 className="text-4xl md:text-5xl font-serif">{t('title')}</h2>
          </div>
          <button className="btn-circle-arrow-outline hidden md:flex">
            <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </motion.div>

        {/* Editorial Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {property.galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`${getGridClass(index)} group cursor-pointer`}
            >
              <div className={`relative ${getAspectClass(index)} image-zoom overflow-hidden`}>
                {/* Real Image */}
                <Image
                  src={galleryImages[index % galleryImages.length]}
                  alt={getLocalizedValue(image.label, image.labelEn)}
                  fill
                  className="image-inner object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-500" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="text-sm font-medium text-white opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    {getLocalizedValue(image.label, image.labelEn)}
                  </p>
                </div>

                {/* Index Number */}
                <div className="absolute top-4 left-4">
                  <span className="text-xs text-white/80 bg-black/30 px-2 py-1 rounded">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
