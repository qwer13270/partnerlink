import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { getPropertyBySlug, mockProperties } from '@/data'
import {
  HeroSection,
  HighlightsBar,
  PhotoGallery,
  FloorPlans,
  NearbyAmenities,
  ConstructionTimeline,
  BookTourCTA,
} from '@/components/property'

type Props = {
  params: Promise<{ locale: string; slug: string }>
  searchParams: Promise<{ ref?: string }>
}

export function generateStaticParams() {
  return mockProperties.flatMap((property) => [
    { locale: 'zh-TW', slug: property.slug },
    { locale: 'en', slug: property.slug },
  ])
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  const property = getPropertyBySlug(slug)

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  const name = locale === 'zh-TW' ? property.name : property.nameEn
  const location = locale === 'zh-TW' ? property.location : property.locationEn

  return {
    title: `${name} | HomeKey 房客`,
    description: `${name} - ${location}. NT$ ${property.priceRange.min.toLocaleString()}萬 ~ NT$ ${property.priceRange.max.toLocaleString()}萬`,
  }
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { locale, slug } = await params
  const { ref } = await searchParams

  setRequestLocale(locale)

  const property = getPropertyBySlug(slug)

  if (!property) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Section 1: Hero */}
      <HeroSection property={property} />

      {/* Section 2: Key Highlights */}
      <HighlightsBar property={property} />

      {/* Section 3: Photo Gallery */}
      <PhotoGallery property={property} />

      {/* Section 4: Floor Plans */}
      <FloorPlans property={property} />

      {/* Section 5: Nearby Amenities */}
      <NearbyAmenities property={property} />

      {/* Section 6: Construction Timeline */}
      <ConstructionTimeline property={property} />

      {/* Section 7: Book Tour CTA */}
      <BookTourCTA property={property} referrer={ref} />

      {/* Section 8: Footer is already in the layout */}
    </div>
  )
}
