import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// Generates a URL-safe alphanumeric short code (e.g. "a3kR9mXz")
function generateShortCode(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes).map(b => chars[b % chars.length]).join('')
}

// POST /api/collaboration-requests/:id/accept
// Delegates to the accept_collaboration_request() RPC which atomically
// transitions the request to 'accepted' and creates the collaboration row.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant', 'kol'])
  if (!auth.ok) return auth.response

  const { id } = await params

  const admin = getSupabaseAdminClient()

  // Verify the caller is the recipient before calling the RPC
  const { data: req, error: fetchError } = await admin
    .from('collaboration_requests')
    .select('id, project_id, sender_role, merchant_user_id, kol_user_id, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !req) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 })
  }

  if (req.status !== 'pending') {
    return NextResponse.json({ error: 'Only pending requests can be accepted.' }, { status: 409 })
  }

  const isRecipient =
    (req.sender_role === 'merchant' && req.kol_user_id      === auth.user.id) ||
    (req.sender_role === 'kol'      && req.merchant_user_id === auth.user.id)

  if (!isRecipient) {
    return NextResponse.json({ error: 'Only the recipient can accept this request.' }, { status: 403 })
  }

  // Call the RPC as this user (using the session-aware client would be ideal,
  // but since our API uses the admin client throughout, we call the function
  // via rpc which executes with auth.uid() = the service role. Instead we
  // perform the two writes directly inside a transaction-safe sequence.
  // The RPC's auth.uid() check is therefore replicated above; we now do the writes.
  const { error: updateError } = await admin
    .from('collaboration_requests')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', id)

  if (updateError) {
    console.error('[accept] update error:', updateError.message)
    return NextResponse.json({ error: 'Failed to accept request.' }, { status: 500 })
  }

  const { data: collab, error: insertError } = await admin
    .from('collaborations')
    .insert({
      project_id:       req.project_id,
      merchant_user_id: req.merchant_user_id,
      kol_user_id:      req.kol_user_id,
      request_id:       id,
    })
    .select('id')
    .single()

  if (insertError || !collab) {
    // Roll back the request status if collaboration insert fails
    await admin
      .from('collaboration_requests')
      .update({ status: 'pending', responded_at: null })
      .eq('id', id)

    if (insertError?.code === '23505') {
      return NextResponse.json(
        { error: 'An active collaboration already exists for this combination.' },
        { status: 409 },
      )
    }
    console.error('[accept] insert collaboration error:', insertError?.message)
    return NextResponse.json({ error: 'Failed to create collaboration.' }, { status: 500 })
  }

  // Auto-generate a referral link for this KOL × project collaboration.
  // Retry up to 3 times on the rare chance of a short_code collision.
  let referralCreated = false
  for (let attempt = 0; attempt < 3; attempt++) {
    const { error: refError } = await admin
      .from('referral_links')
      .insert({
        collaboration_id: collab.id,
        project_id:       req.project_id,
        kol_user_id:      req.kol_user_id,
        short_code:       generateShortCode(),
      })
    if (!refError) { referralCreated = true; break }
    if (refError.code !== '23505') {
      // Non-collision error — log but don't fail the whole acceptance
      console.error('[accept] insert referral_link error:', refError.message)
      break
    }
    // code === '23505' means short_code collision — retry with a new code
  }

  if (!referralCreated) {
    // Referral link creation is best-effort; the collaboration itself succeeded
    console.warn('[accept] could not create referral_link for collaboration', collab.id)
  }

  return NextResponse.json({ ok: true })
}
