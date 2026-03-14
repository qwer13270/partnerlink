import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const { id } = await context.params
  if (!id) {
    return NextResponse.json({ error: 'Missing application id.' }, { status: 400 })
  }

  const payload = (await request.json().catch(() => null)) as { reason?: unknown } | null
  const reason = typeof payload?.reason === 'string' ? payload.reason.trim().slice(0, 1000) : ''

  const admin = getSupabaseAdminClient()

  const { data: application, error: findError } = await admin
    .from('kol_applications')
    .select('id,user_id,status')
    .eq('id', id)
    .single()

  if (findError || !application) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
  }

  if (application.status !== 'pending_admin_review') {
    return NextResponse.json(
      { error: `Application is already ${application.status}.` },
      { status: 409 },
    )
  }

  const { error: updateAppError } = await admin
    .from('kol_applications')
    .update({
      status: 'denied',
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.user.id,
      rejection_reason: reason || null,
    })
    .eq('id', id)

  if (updateAppError) {
    return NextResponse.json(
      { error: `Failed to update application status: ${updateAppError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
