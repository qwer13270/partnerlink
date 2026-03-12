import { notFound } from 'next/navigation'
import { getPropertyBySlug, mockProperties } from '@/data'
import {
  HeroSection,
  HighlightsBar,
  PhotoGallery,
  FloorPlans,
  NearbyAmenities,
  ConstructionTimeline,
  BookTourCTA,
  TongchuangWingPage,
} from '@/components/property'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string }>
}

export function generateStaticParams() {
  return mockProperties.map((property) => ({
    slug: property.slug,
  }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const property = getPropertyBySlug(slug)

  if (!property) {
    return {
      title: 'Property Not Found',
    }
  }

  return {
    title: `${property.name} | PartnerLink 夥伴`,
    description: `${property.name} - ${property.location}. NT$ ${property.priceRange.min.toLocaleString()}萬 ~ NT$ ${property.priceRange.max.toLocaleString()}萬`,
  }
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ref } = await searchParams

  const property = getPropertyBySlug(slug)

  if (!property) {
    notFound()
  }

  if (property.slug === 'tongchuang-wing') {
    return <TongchuangWingPage property={property} referrer={ref} />
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
