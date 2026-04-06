import { redirect } from 'next/navigation'

export default async function ProjectHubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/merchant/projects/${id}/customers`)
}
