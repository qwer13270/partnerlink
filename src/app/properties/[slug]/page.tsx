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
import { buildDefaultProjectContentPreview } from '@/lib/property-template'
import { getPublishedPropertyBySlug } from '@/lib/server/properties'

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
  const dbProperty = await getPublishedPropertyBySlug(slug)
  const mockProperty = getPropertyBySlug(slug)

  if (!dbProperty && !mockProperty) {
    return {
      title: 'Property Not Found',
    }
  }

  if (dbProperty) {
    return {
      title: `${dbProperty.name} | PartnerLink 夥伴`,
      description: `${dbProperty.name} - ${dbProperty.template.districtLabel}. ${dbProperty.template.overviewTitle}`,
    }
  }

  if (!mockProperty) {
    return {
      title: 'Property Not Found',
    }
  }

  return {
    title: `${mockProperty.name} | PartnerLink 夥伴`,
    description: `${mockProperty.name} - ${mockProperty.location}. NT$ ${mockProperty.priceRange.min.toLocaleString()}萬 ~ NT$ ${mockProperty.priceRange.max.toLocaleString()}萬`,
  }
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ref } = await searchParams

  const dbProperty = await getPublishedPropertyBySlug(slug)
  const property = getPropertyBySlug(slug)

  if (dbProperty?.type === '建案') {
    return <TongchuangWingPage content={dbProperty.template} referrer={ref} />
  }

  if (!property) {
    notFound()
  }

  if (property.slug === 'tongchuang-wing') {
    return <TongchuangWingPage content={buildDefaultProjectContentPreview()} referrer={ref} />
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
