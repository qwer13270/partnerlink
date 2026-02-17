import Link from 'next/link'
import Image from 'next/image'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { MapPin, Train } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockProperties } from '@/data'
import { PROPERTY_STATUS_COLORS } from '@/lib/constants'

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'property' })

  return {
    title: locale === 'zh-TW' ? '所有建案 | HomeKey 房客' : 'All Properties | HomeKey',
  }
}

export default async function PropertiesPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('property')
  const isZhTW = locale === 'zh-TW'

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
        {isZhTW ? '精選建案' : 'Featured Properties'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property, index) => {
          const heroImages = ['/images/placeholders/hero/hero-1.webp', '/images/placeholders/hero/hero-2.webp', '/images/placeholders/hero/hero-3.webp']
          const heroSrc = heroImages[index % heroImages.length]
          return (
          <Link
            key={property.id}
            href={`/${locale}/properties/${property.slug}`}
          >
            <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden">
              <div className="relative h-48 bg-muted">
                <Image
                  src={heroSrc}
                  alt={isZhTW ? property.name : property.nameEn}
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
                  {isZhTW ? property.name : property.nameEn}
                </h2>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{isZhTW ? property.location : property.locationEn}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Train className="h-4 w-4" />
                  <span>
                    {isZhTW ? property.nearestMrt : property.nearestMrtEn}
                    <span className="mx-1">·</span>
                    {property.mrtWalkTime} {t('minutes')}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(property.priceRange.min)} ~
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {property.totalUnits} {isZhTW ? '戶' : 'units'}
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
