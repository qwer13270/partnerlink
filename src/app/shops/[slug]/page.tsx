import { notFound } from 'next/navigation'
import { getPublishedPropertyBySlug } from '@/lib/server/properties'
import ShangAnPage from '@/components/property/ShangAnPage'
import type { ShangAnTemplateContent } from '@/lib/property-template'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ ref?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const project = await getPublishedPropertyBySlug(slug)

  if (!project || project.type !== 'shop') {
    return { title: 'Shop Not Found' }
  }

  return {
    title: `${project.name} | PartnerLink`,
    description: project.subtitle,
  }
}

export default async function ShopPublicPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { ref } = await searchParams

  const project = await getPublishedPropertyBySlug(slug)

  if (!project || project.type !== 'shop') {
    notFound()
  }

  return (
    <ShangAnPage
      content={project.template as ShangAnTemplateContent}
      referrer={ref ?? null}
    />
  )
}
