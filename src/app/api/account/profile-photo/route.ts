import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  let profilePhotoPath =
    typeof auth.user.user_metadata?.profile_photo_path === 'string'
      ? auth.user.user_metadata.profile_photo_path
      : ''

  if (!profilePhotoPath) {
    const { data: application, error } = await admin
      .from('kol_applications')
      .select('profile_photo_path')
      .eq('user_id', auth.user.id)
      .eq('status', 'approved')
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: `Failed to load profile photo: ${error.message}` },
        { status: 500 },
      )
    }

    profilePhotoPath =
      typeof application?.profile_photo_path === 'string'
        ? application.profile_photo_path
        : ''
  }

  if (!profilePhotoPath) {
    return NextResponse.json({ ok: true, profilePhotoUrl: null })
  }

  const { data, error } = await admin.storage
    .from('kol-media')
    .createSignedUrl(profilePhotoPath, 60 * 60)

  if (error) {
    return NextResponse.json(
      { error: `Failed to sign profile photo URL: ${error.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, profilePhotoUrl: data.signedUrl })
}
