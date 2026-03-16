'use client'

import { Train, School, Trees, ShoppingBag, Hospital } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLocale } from '@/hooks/useLocale'
import strings from '@/lib/strings'
import type { Property, Amenity } from '@/lib/types'

interface NearbyAmenitiesProps {
  property: Property
}

const categoryIcons = {
  mrt: Train,
  school: School,
  park: Trees,
  shopping: ShoppingBag,
  hospital: Hospital,
}

export default function NearbyAmenities({ property }: NearbyAmenitiesProps) {
  const { getLocalizedValue } = useLocale()
  const t = strings.property.amenities

  // Group amenities by category
  const groupedAmenities = property.amenities.reduce(
    (acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = []
      }
      acc[amenity.category].push(amenity)
      return acc
    },
    {} as Record<Amenity['category'], Amenity[]>
  )

  const categoryLabels: Record<Amenity['category'], string> = {
    mrt: t.mrt,
    school: t.schools,
    park: t.parks,
    shopping: t.shopping,
    hospital: t.hospitals,
  }

  const categoryOrder: Amenity['category'][] = [
    'mrt',
    'school',
    'park',
    'shopping',
    'hospital',
  ]

  return (
    <section className="section-editorial">
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
            Location
          </p>
          <h2 className="text-4xl md:text-5xl font-serif">{t.title}</h2>
        </motion.div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {categoryOrder.map((category, categoryIndex) => {
            const amenities = groupedAmenities[category]
            if (!amenities || amenities.length === 0) return null

            const Icon = categoryIcons[category]

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                {/* Category Header */}
                <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border">
                  <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                  <h3 className="text-sm uppercase tracking-widest text-muted-foreground">
                    {categoryLabels[category]}
                  </h3>
                </div>

                {/* Amenities List */}
                <ul className="space-y-4">
                  {amenities.map((amenity, index) => (
                    <li
                      key={index}
                      className="flex items-start justify-between gap-4"
                    >
                      <span className="text-foreground">
                        {getLocalizedValue(amenity.name, amenity.nameEn)}
                      </span>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {getLocalizedValue(amenity.distance, amenity.distanceEn)}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
