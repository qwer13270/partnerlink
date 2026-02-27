import Link from 'next/link'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { MapPin, Train } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockProperties } from '@/data'
import { PROPERTY_STATUS_COLORS } from '@/lib/constants'

export async function generateMetadata() {
  return {
    title: '所有建案 | HomeKey 房客',
  }
}

export default async function PropertiesPage() {
  const t = await getTranslations('property')

  const statusLabel = {
    'pre-sale': t('preSale'),
    'selling': t('selling'),
    'sold-out': t('soldOut'),
    'completed': t('completed'),
  }

  const formatPrice = (price: number) => {
    return `NT$ ${price.toLocaleString()}萬`
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-8">
        精選建案
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property, index) => {
          const heroImages = ['/images/placeholders/hero/hero-1.webp', '/images/placeholders/hero/hero-2.webp', '/images/placeholders/hero/hero-3.webp']
          const heroSrc = heroImages[index % heroImages.length]
          return (
          <Link
            key={property.id}
            href={`/properties/${property.slug}`}
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <div className="relative h-48 bg-muted">
                <Image
                  src={heroSrc}
                  alt={property.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <Badge
                  className={`absolute top-3 right-3 ${PROPERTY_STATUS_COLORS[property.status]}`}
                >
                  {statusLabel[property.status]}
                </Badge>
              </div>

              <CardContent className="p-5">
                <h2 className="text-xl font-bold mb-2">
                  {property.name}
                </h2>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Train className="h-4 w-4" />
                  <span>
                    {property.nearestMrt}
                    <span className="mx-1">·</span>
                    {property.mrtWalkTime} {t('minutes')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(property.priceRange.min)} ~
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {property.totalUnits} 戶
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
          )
        })}
      </div>
    </div>
  )
}
