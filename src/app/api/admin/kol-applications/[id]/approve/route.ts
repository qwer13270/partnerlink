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

  const admin = getSupabaseAdminClient()

  const { data: application, error: findError } = await admin
    .from('kol_applications')
    .select('id,user_id,status,profile_photo_path')
    .eq('id', id)
    .single()

  if (findError || !application) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
  }

  if (application.status !== 'pending') {
    return NextResponse.json(
      { error: `Application is already ${application.status}.` },
      { status: 409 },
    )
  }

  const { data: userResult, error: getUserError } = await admin.auth.admin.getUserById(application.user_id)
  if (getUserError || !userResult.user) {
    return NextResponse.json(
      { error: `Failed to load user: ${getUserError?.message ?? 'User not found.'}` },
      { status: 500 },
    )
  }

  const { error: updateUserError } = await admin.auth.admin.updateUserById(
    application.user_id,
    {
      app_metadata: {
        ...userResult.user.app_metadata,
        role: 'kol',
      },
      user_metadata: {
        ...userResult.user.user_metadata,
        profile_photo_path: application.profile_photo_path ?? null,
      },
    },
  )

  if (updateUserError) {
    return NextResponse.json(
      { error: `Failed to activate KOL role: ${updateUserError.message}` },
      { status: 500 },
    )
  }

  const { error: updateAppError } = await admin
    .from('kol_applications')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: auth.user.id,
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
