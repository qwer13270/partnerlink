import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// GET /api/merchant/mutual-benefit
// Returns the merchant's 互惠 collaborations with KOL info, items, and shipment.
// Query params:
//   project_id — optional filter by project
export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const projectIdFilter = searchParams.get('project_id')

  const admin = getSupabaseAdminClient()

  let query = admin
    .from('collaborations')
    .select('id, project_id, kol_user_id, status, collaboration_type, sponsorship_bonus, request_id, created_at')
    .eq('merchant_user_id', auth.user.id)
    .in('collaboration_type', ['reciprocal', 'sponsored'])
    .order('created_at', { ascending: false })

  if (projectIdFilter) {
    query = query.eq('project_id', projectIdFilter)
  }

  const { data: collabs, error: collabsError } = await query

  if (collabsError) {
    console.error('[api/merchant/mutual-benefit] fetch collabs error:', collabsError.message)
    return NextResponse.json({ error: 'Failed to load 互惠 records.' }, { status: 500 })
  }

  const rows = collabs ?? []
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, records: [] })
  }

  const collabIds  = rows.map((c) => c.id as string)
  const projectIds = [...new Set(rows.map((c) => c.project_id as string))]
  const kolUserIds = [...new Set(rows.map((c) => c.kol_user_id as string))]
  const requestIds = rows.map((c) => c.request_id as string)

  const [projectsResult, kolsResult, shipmentsResult, itemsResult] = await Promise.all([
    admin.from('projects').select('id, name').in('id', projectIds),
    admin.from('kol_applications').select('user_id, full_name, platforms, follower_range, profile_photo_path').in('user_id', kolUserIds),
    admin.from('mutual_benefit_shipments').select('collaboration_id, carrier, tracking_number, shipped_at, received_at').in('collaboration_id', collabIds),
    admin.from('mutual_benefit_items').select('collaboration_request_id, item_name, quantity, estimated_value, notes').in('collaboration_request_id', requestIds),
  ])

  const projectById = new Map((projectsResult.data ?? []).map((p) => [p.id as string, p]))

  // Sign KOL profile photo paths
  const kolRows = kolsResult.data ?? []
  const photoPaths = kolRows.map((k) => k.profile_photo_path as string | null).filter((p): p is string => !!p)
  const signedPhotoMap = new Map<string, string>()
  if (photoPaths.length > 0) {
    const { data: signed } = await admin.storage.from('kol-media').createSignedUrls(photoPaths, 3600)
    signed?.forEach((item, i) => {
      if (item?.signedUrl) signedPhotoMap.set(photoPaths[i], item.signedUrl)
    })
  }

  const kolByUserId = new Map(
    kolRows.map((k) => {
      const platforms = Array.isArray(k.platforms)
        ? (k.platforms as string[]).filter((s) => typeof s === 'string').join(' / ')
        : ''
      const path = k.profile_photo_path as string | null
      return [k.user_id as string, { full_name: k.full_name as string, platform: platforms, follower_range: k.follower_range as string | null, profile_photo_url: path ? (signedPhotoMap.get(path) ?? null) : null }]
    }),
  )
  const shipmentByCollabId = new Map((shipmentsResult.data ?? []).map((s) => [s.collaboration_id as string, s]))

  type ItemRow = { collaboration_request_id: string; item_name: string; quantity: number; estimated_value: number; notes: string | null }
  const itemsByRequestId = new Map<string, ItemRow[]>()
  for (const item of (itemsResult.data ?? []) as ItemRow[]) {
    const list = itemsByRequestId.get(item.collaboration_request_id) ?? []
    list.push(item)
    itemsByRequestId.set(item.collaboration_request_id, list)
  }

  const records = rows.map((c) => {
    const project  = projectById.get(c.project_id as string)
    const kol      = kolByUserId.get(c.kol_user_id as string)
    const shipment = shipmentByCollabId.get(c.id as string)
    const items    = (itemsByRequestId.get(c.request_id as string) ?? []).map(({ item_name, quantity, estimated_value, notes }) => ({ item_name, quantity, estimated_value, notes }))
    return {
      collaboration_id:  c.id,
      project_id:        c.project_id,
      project_name:      project?.name ?? null,
      collaboration_type: c.collaboration_type,
      collab_status:      c.status,
      sponsorship_bonus:  c.sponsorship_bonus,
      created_at:         c.created_at,
      kol_name:          kol?.full_name ?? null,
      kol_platform:      kol?.platform ?? null,
      kol_follower_range: kol?.follower_range ?? null,
      kol_photo_url:     kol?.profile_photo_url ?? null,
      items,
      shipment: shipment
        ? {
            carrier:         shipment.carrier,
            tracking_number: shipment.tracking_number,
            shipped_at:      shipment.shipped_at,
            received_at:     shipment.received_at,
          }
        : null,
    }
  })

  return NextResponse.json({ ok: true, records })
}
