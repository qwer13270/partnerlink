import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// POST /api/mutual-benefit/:id/receive
// KOL confirms receipt of items for a 互惠 collaboration.
// :id is the collaboration id.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const { id } = await params
  const admin = getSupabaseAdminClient()

  // Verify collaboration belongs to this KOL and is 互惠 type
  const { data: collab, error: collabError } = await admin
    .from('collaborations')
    .select('id, merchant_user_id, kol_user_id, collaboration_type, sponsorship_bonus')
    .eq('id', id)
    .maybeSingle()

  if (collabError || !collab) {
    return NextResponse.json({ error: 'Collaboration not found.' }, { status: 404 })
  }
  if (collab.kol_user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 })
  }
  if (collab.collaboration_type !== 'reciprocal' && collab.collaboration_type !== 'sponsored') {
    return NextResponse.json({ error: 'This collaboration does not support shipment tracking.' }, { status: 400 })
  }

  // Check shipment exists and has been shipped
  const { data: shipment, error: shipmentError } = await admin
    .from('mutual_benefit_shipments')
    .select('id, shipped_at, received_at')
    .eq('collaboration_id', id)
    .maybeSingle()

  if (shipmentError || !shipment) {
    return NextResponse.json({ error: 'Shipment record not found.' }, { status: 404 })
  }
  if (!shipment.shipped_at) {
    return NextResponse.json({ error: 'Items have not been shipped yet.' }, { status: 400 })
  }
  if (shipment.received_at) {
    return NextResponse.json({ error: 'Receipt already confirmed.' }, { status: 409 })
  }

  const { error: updateError } = await admin
    .from('mutual_benefit_shipments')
    .update({ received_at: new Date().toISOString() })
    .eq('collaboration_id', id)

  if (updateError) {
    console.error('[api/mutual-benefit/receive] update error:', updateError.message)
    return NextResponse.json({ error: 'Failed to confirm receipt.' }, { status: 500 })
  }

  // Notify merchant that KOL confirmed receipt
  const { error: merchantNotifError } = await admin
    .from('notifications')
    .insert({
      user_id: collab.merchant_user_id,
      type: 'shipment_received',
      title: 'KOL 已確認收到互惠商品',
      href: '/merchant/mutual-benefit',
    })
  if (merchantNotifError) {
    console.error('[api/mutual-benefit/receive] merchant notification error:', merchantNotifError.message)
  }

  // If there is a 業配獎金, notify KOL it has been credited
  if (typeof collab.sponsorship_bonus === 'number' && collab.sponsorship_bonus > 0) {
    const { error: kolNotifError } = await admin
      .from('notifications')
      .insert({
        user_id: collab.kol_user_id,
        type: 'bonus_credited',
        title: `業配獎金 NT$${collab.sponsorship_bonus.toLocaleString()} 已入帳`,
        href: '/kol/projects',
      })
    if (kolNotifError) {
      console.error('[api/mutual-benefit/receive] bonus notification error:', kolNotifError.message)
    }
  }

  return NextResponse.json({ ok: true })
}
