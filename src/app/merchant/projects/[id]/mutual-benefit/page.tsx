import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import MerchantMutualBenefitClient from '@/components/merchant/MerchantMutualBenefitClient'

export default async function ProjectMutualBenefitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = getRoleFromUser(user)
  if (role !== 'merchant') redirect(role ? resolveRoleHomePath(role) : '/login')

  const admin = getSupabaseAdminClient()

  const { data: collabs } = await admin
    .from('collaborations')
    .select('id, project_id, kol_user_id, status, collaboration_type, sponsorship_bonus, request_id, created_at')
    .eq('merchant_user_id', user.id)
    .eq('project_id', projectId)
    .in('collaboration_type', ['reciprocal', 'sponsored'])
    .order('created_at', { ascending: false })

  const rows = collabs ?? []

  if (rows.length === 0) {
    return <MerchantMutualBenefitClient records={[]} projectOptions={[]} />
  }

  const collabIds  = rows.map((c) => c.id as string)
  const kolUserIds = [...new Set(rows.map((c) => c.kol_user_id as string))]
  const requestIds = rows.map((c) => c.request_id as string)

  const [projectR, kolsR, shipmentsR, itemsR] = await Promise.all([
    admin.from('projects').select('id, name').eq('id', projectId).single(),
    admin.from('kol_applications')
      .select('user_id, full_name, platforms, follower_range')
      .in('user_id', kolUserIds),
    admin.from('mutual_benefit_shipments')
      .select('collaboration_id, carrier, tracking_number, shipped_at, received_at')
      .in('collaboration_id', collabIds),
    admin.from('mutual_benefit_items')
      .select('collaboration_request_id, item_name, quantity, estimated_value, notes')
      .in('collaboration_request_id', requestIds),
  ])

  const projectName = projectR.data?.name as string | null ?? null

  const kolByUserId = new Map(
    (kolsR.data ?? []).map((k) => {
      const platforms = Array.isArray(k.platforms)
        ? (k.platforms as string[]).filter((s) => typeof s === 'string').join(' / ')
        : ''
      return [k.user_id as string, {
        full_name:      k.full_name as string,
        platform:       platforms,
        follower_range: k.follower_range as string | null,
      }]
    }),
  )
  const shipmentByCollabId = new Map((shipmentsR.data ?? []).map((s) => [s.collaboration_id as string, s]))

  type ItemRow = { collaboration_request_id: string; item_name: string; quantity: number; estimated_value: number; notes: string | null }
  const itemsByRequestId = new Map<string, ItemRow[]>()
  for (const item of (itemsR.data ?? []) as ItemRow[]) {
    const list = itemsByRequestId.get(item.collaboration_request_id) ?? []
    list.push(item)
    itemsByRequestId.set(item.collaboration_request_id, list)
  }

  const records = rows.map((c) => {
    const kol      = kolByUserId.get(c.kol_user_id as string)
    const shipment = shipmentByCollabId.get(c.id as string)
    const items    = (itemsByRequestId.get(c.request_id as string) ?? [])
      .map(({ item_name, quantity, estimated_value, notes }) => ({ item_name, quantity, estimated_value, notes }))

    return {
      collaboration_id:   c.id as string,
      project_id:         projectId,
      project_name:       projectName,
      collaboration_type: c.collaboration_type as string,
      collab_status:      c.status as string,
      sponsorship_bonus:  c.sponsorship_bonus as number | null,
      created_at:         c.created_at as string,
      kol_name:           kol?.full_name ?? null,
      kol_platform:       kol?.platform ?? null,
      kol_follower_range: kol?.follower_range ?? null,
      kol_photo_url:      null,
      items,
      shipment: shipment
        ? {
            carrier:         shipment.carrier as string | null,
            tracking_number: shipment.tracking_number as string | null,
            shipped_at:      shipment.shipped_at as string | null,
            received_at:     shipment.received_at as string | null,
          }
        : null,
    }
  })

  return <MerchantMutualBenefitClient records={records} projectOptions={[]} />
}
