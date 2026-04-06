import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

const VALID_CARRIERS = ['t-cat', 'hct', 'pelican', 'post', 'e-can'] as const

// POST /api/mutual-benefit/:id/ship
// Merchant enters carrier + tracking number for a 互惠 collaboration.
// :id is the collaboration id.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = (await request.json().catch(() => ({}))) as {
    carrier?: string
    tracking_number?: string
  }

  const carrier        = typeof body.carrier === 'string' ? body.carrier.trim() : ''
  const trackingNumber = typeof body.tracking_number === 'string' ? body.tracking_number.trim() : ''

  if (!VALID_CARRIERS.includes(carrier as typeof VALID_CARRIERS[number])) {
    return NextResponse.json({ error: 'Invalid carrier.' }, { status: 400 })
  }
  if (!trackingNumber) {
    return NextResponse.json({ error: 'tracking_number is required.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  // Verify collaboration belongs to this merchant and is 互惠 type
  const { data: collab, error: collabError } = await admin
    .from('collaborations')
    .select('id, merchant_user_id, kol_user_id, collaboration_type')
    .eq('id', id)
    .maybeSingle()

  if (collabError || !collab) {
    return NextResponse.json({ error: 'Collaboration not found.' }, { status: 404 })
  }
  if (collab.merchant_user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }
  if (collab.collaboration_type !== 'reciprocal' && collab.collaboration_type !== 'sponsored') {
    return NextResponse.json({ error: 'This collaboration does not support shipment tracking.' }, { status: 400 })
  }

  const { error: updateError } = await admin
    .from('mutual_benefit_shipments')
    .update({
      carrier,
      tracking_number: trackingNumber,
      shipped_at: new Date().toISOString(),
    })
    .eq('collaboration_id', id)

  if (updateError) {
    console.error('[api/mutual-benefit/ship] update error:', updateError.message)
    return NextResponse.json({ error: 'Failed to update shipment.' }, { status: 500 })
  }

  // Notify KOL that items have been shipped
  const { error: notifError } = await admin
    .from('notifications')
    .insert({
      user_id: collab.kol_user_id,
      type: 'shipment_sent',
      title: '商家已寄出互惠商品',
      href: '/kol/projects',
    })
  if (notifError) {
    console.error('[api/mutual-benefit/ship] notification error:', notifError.message)
  }

  return NextResponse.json({ ok: true })
}
