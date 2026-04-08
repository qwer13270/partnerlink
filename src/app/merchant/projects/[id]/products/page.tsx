import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getMerchantProjectDetail } from '@/lib/server/properties'
import ProductsClient from './ProductsClient'

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params
  const cookieStore = await cookies()

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions)
          )
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = getSupabaseAdminClient()
  const { data: row } = await admin
    .from('projects')
    .select('id, name, type, merchant_user_id')
    .eq('id', projectId)
    .eq('merchant_user_id', user.id)
    .single()

  if (!row) redirect('/merchant/projects')
  if (row.type !== 'shop') redirect(`/merchant/projects/${projectId}/customers`)

  const detail = await getMerchantProjectDetail(user.id, projectId)
  if (!detail) redirect('/merchant/projects')

  const products = detail.contentItems
    .filter((item) => item.groupKey === 'shop_products')
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      id: item.id ?? '',
      itemKey: item.itemKey ?? crypto.randomUUID(),
      name: item.title ?? '',
      description: item.body ?? '',
      price: item.meta ?? '',
      salesPrice: item.accent ?? '',
      sortOrder: item.sortOrder,
      imageUrl: detail.images.find((img) => img.sectionKey === `shop_product_${item.itemKey}`)?.url ?? null,
      imageId: detail.images.find((img) => img.sectionKey === `shop_product_${item.itemKey}`)?.id ?? null,
    }))

  return (
    <ProductsClient
      projectId={projectId}
      projectName={row.name}
      initialProducts={products}
    />
  )
}
