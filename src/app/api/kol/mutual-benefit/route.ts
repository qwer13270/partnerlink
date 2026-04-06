import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// GET /api/kol/mutual-benefit
// Returns the KOL's 互惠 collaborations with items, shipment, and project info.
export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  const { data: collabs, error: collabsError } = await admin
    .from('collaborations')
    .select('id, project_id, merchant_user_id, status, collaboration_type, sponsorship_bonus, request_id, created_at')
    .eq('kol_user_id', auth.user.id)
    .in('collaboration_type', ['reciprocal', 'sponsored'])
    .order('created_at', { ascending: false })

  if (collabsError) {
    console.error('[api/kol/mutual-benefit] fetch collabs error:', collabsError.message)
    return NextResponse.json({ error: 'Failed to load 互惠 records.' }, { status: 500 })
  }

  const rows = collabs ?? []
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, records: [] })
  }

  const collabIds   = rows.map((c) => c.id as string)
  const projectIds  = [...new Set(rows.map((c) => c.project_id as string))]
  const requestIds  = rows.map((c) => c.request_id as string)

  const [projectsResult, shipmentsResult, itemsResult] = await Promise.all([
    admin.from('projects').select('id, name, publish_status').in('id', projectIds),
    admin.from('mutual_benefit_shipments').select('collaboration_id, carrier, tracking_number, shipped_at, received_at').in('collaboration_id', collabIds),
    admin.from('mutual_benefit_items').select('collaboration_request_id, item_name, quantity, estimated_value, notes').in('collaboration_request_id', requestIds),
  ])

  const projectById  = new Map((projectsResult.data ?? []).map((p) => [p.id as string, p]))
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
    const shipment = shipmentByCollabId.get(c.id as string)
    const items    = (itemsByRequestId.get(c.request_id as string) ?? []).map(({ item_name, quantity, estimated_value, notes }) => ({ item_name, quantity, estimated_value, notes }))
    return {
      collaboration_id:  c.id,
      project_id:        c.project_id,
      project_name:      project?.name ?? null,
      project_status:    project?.publish_status ?? null,
      collaboration_type: c.collaboration_type,
      collab_status:      c.status,
      sponsorship_bonus:  c.sponsorship_bonus,
      created_at:         c.created_at,
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
