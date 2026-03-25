import { NextRequest, NextResponse } from 'next/server'
import { getRoleFromUser } from '@/lib/auth'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  if (getRoleFromUser(auth.user) === 'merchant') {
    return NextResponse.json({ ok: true, status: 'approved' as const })
  }

  if (auth.user.user_metadata?.signup_role !== 'merchant') {
    return NextResponse.json({ error: 'Not a merchant signup account.' }, { status: 403 })
  }

  const admin = getSupabaseAdminClient()
  const email = (auth.user.email ?? '').trim().toLowerCase()

  let { data: application, error: findError } = await admin
    .from('merchant_applications')
    .select('id,status,user_id,email')
    .eq('user_id', auth.user.id)
    .order('submitted_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!findError && !application && email) {
    const fallback = await admin
      .from('merchant_applications')
      .select('id,status,user_id,email')
      .eq('email', email)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    application = fallback.data
    findError = fallback.error
  }

  if (findError) {
    return NextResponse.json(
      { error: `Failed to load application: ${findError.message}` },
      { status: 500 },
    )
  }

  if (!application) {
    return NextResponse.json({ ok: false, code: 'MISSING_APPLICATION' }, { status: 404 })
  }

  if (application.status === 'pending_email_confirmation') {
    const { error: updateError } = await admin
      .from('merchant_applications')
      .update({
        user_id: auth.user.id,
        email,
        status: 'pending_admin_review',
      })
      .eq('id', application.id)

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to complete merchant signup: ${updateError.message}` },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, status: 'pending_admin_review' as const })
  }

  if (application.status === 'pending_admin_review') {
    if (!application.user_id) {
      const { error: claimError } = await admin
        .from('merchant_applications')
        .update({ user_id: auth.user.id, email })
        .eq('id', application.id)
      if (claimError) {
        return NextResponse.json(
          { error: `Failed to claim application: ${claimError.message}` },
          { status: 500 },
        )
      }
    }
    return NextResponse.json({ ok: true, status: 'pending_admin_review' as const })
  }

  if (application.status === 'denied') {
    return NextResponse.json({ ok: false, status: 'denied' as const }, { status: 403 })
  }

  if (application.status === 'approved') {
    // Ensure app_metadata.role is set — it may be missing if the application was approved
    // outside the normal admin approval flow (e.g. manual DB update or data migration).
    if (!getRoleFromUser(auth.user)) {
      const { error: updateRoleError } = await admin.auth.admin.updateUserById(auth.user.id, {
        app_metadata: { ...auth.user.app_metadata, role: 'merchant' },
      })
      if (updateRoleError) {
        return NextResponse.json(
          { error: `Failed to grant merchant role: ${updateRoleError.message}` },
          { status: 500 },
        )
      }
    }
    return NextResponse.json({ ok: true, status: 'approved' as const })
  }

  return NextResponse.json({ ok: false, code: 'UNKNOWN_APPLICATION_STATE' }, { status: 409 })
}
