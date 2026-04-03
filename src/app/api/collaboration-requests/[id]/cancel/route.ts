import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// POST /api/collaboration-requests/:id/cancel
// Only the sender can cancel a pending request.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant', 'kol'])
  if (!auth.ok) return auth.response

  const { id } = await params

  const admin = getSupabaseAdminClient()

  const { data: req, error: fetchError } = await admin
    .from('collaboration_requests')
    .select('id, sender_role, merchant_user_id, kol_user_id, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !req) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  }

  if (req.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending requests can be cancelled.' }, { status: 409 })
  }

  const isSender =
    (req.sender_role === 'merchant' && req.merchant_user_id === auth.user.id) ||
    (req.sender_role === 'kol'      && req.kol_user_id      === auth.user.id)

  if (!isSender) {
    return NextResponse.json({ error: 'Only the sender can cancel this request.' }, { status: 403 })
  }

  const { error } = await admin
    .from('collaboration_requests')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('[cancel] update error:', error.message)
    return NextResponse.json({ error: 'Failed to cancel request.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
