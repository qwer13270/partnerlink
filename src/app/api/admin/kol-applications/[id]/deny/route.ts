import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

type MediaRow = {
  storage_bucket: string
  storage_path: string
}

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
    .select('id,user_id,status')
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

  const { data: mediaRows, error: mediaFindError } = await admin
    .from('kol_media_assets')
    .select('storage_bucket,storage_path')
    .eq('application_id', application.id)

  if (mediaFindError) {
    return NextResponse.json(
      { error: `Failed to load media assets: ${mediaFindError.message}` },
      { status: 500 },
    )
  }

  const mediaByBucket = (mediaRows ?? []).reduce<Record<string, string[]>>((acc, row) => {
    const typed = row as MediaRow
    if (!typed.storage_bucket || !typed.storage_path) return acc
    if (!acc[typed.storage_bucket]) acc[typed.storage_bucket] = []
    acc[typed.storage_bucket].push(typed.storage_path)
    return acc
  }, {})

  for (const [bucket, paths] of Object.entries(mediaByBucket)) {
    if (paths.length === 0) continue

    const { error: removeStorageError } = await admin.storage
      .from(bucket)
      .remove(paths)

    if (removeStorageError) {
      return NextResponse.json(
        { error: `Failed to remove storage objects: ${removeStorageError.message}` },
        { status: 500 },
      )
    }
  }

  const { error: deleteUserError } = await admin.auth.admin.deleteUser(application.user_id)
  if (deleteUserError) {
    return NextResponse.json(
      { error: `Failed to delete user: ${deleteUserError.message}` },
      { status: 500 },
    )
  }

  const { error: deleteAppError } = await admin
    .from('kol_applications')
    .delete()
    .eq('id', id)

  if (deleteAppError) {
    return NextResponse.json(
      { error: `User deleted, but cleanup failed: ${deleteAppError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
}
