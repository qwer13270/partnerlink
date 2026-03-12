import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

function sanitizeFileName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()
  const { data: application, error } = await admin
    .from('kol_applications')
    .select('full_name,bio,profile_photo_path')
    .eq('user_id', auth.user.id)
    .eq('status', 'approved')
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: `Failed to load profile: ${error.message}` },
      { status: 500 },
    )
  }

  let profilePhotoUrl: string | null = null
  const profilePhotoPath =
    typeof application?.profile_photo_path === 'string'
      ? application.profile_photo_path
      : ''

  if (profilePhotoPath) {
    const { data, error: signError } = await admin.storage
      .from('kol-media')
      .createSignedUrl(profilePhotoPath, 60 * 60)

    if (signError) {
      return NextResponse.json(
        { error: `Failed to sign profile photo URL: ${signError.message}` },
        { status: 500 },
      )
    }

    profilePhotoUrl = data.signedUrl
  }

  return NextResponse.json({
    ok: true,
    profile: {
      fullName:
        typeof application?.full_name === 'string'
          ? application.full_name
          : typeof auth.user.user_metadata?.full_name === 'string'
            ? auth.user.user_metadata.full_name
            : '',
      bio: typeof application?.bio === 'string' ? application.bio : '',
      profilePhotoUrl,
    },
  })
}

export async function PUT(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const bio = String(formData.get('bio') ?? '').trim()
  const fileEntry = formData.get('profilePhoto')
  const profilePhoto = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null

  const admin = getSupabaseAdminClient()
  const { data: application, error: applicationError } = await admin
    .from('kol_applications')
    .select('id,profile_photo_path')
    .eq('user_id', auth.user.id)
    .eq('status', 'approved')
    .single()

  if (applicationError || !application) {
    return NextResponse.json({ error: 'Approved KOL profile not found.' }, { status: 404 })
  }

  let nextProfilePhotoPath =
    typeof application.profile_photo_path === 'string'
      ? application.profile_photo_path
      : ''

  if (profilePhoto) {
    if (profilePhoto.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image file too large (max 10MB).' }, { status: 400 })
    }

    const extension = profilePhoto.name.includes('.')
      ? profilePhoto.name.split('.').pop()?.toLowerCase() ?? ''
      : ''
    const safeName = sanitizeFileName(profilePhoto.name || 'profile-photo')
    const suffix = extension ? `.${extension}` : ''
    const storagePath = `kol/${auth.user.id}/${application.id}/${crypto.randomUUID()}-${safeName || 'profile-photo'}${suffix}`

    const { error: uploadError } = await admin.storage
      .from('kol-media')
      .upload(storagePath, profilePhoto, {
        upsert: false,
        contentType: profilePhoto.type || undefined,
        cacheControl: '3600',
      })

    if (uploadError) {
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 },
      )
    }

    if (nextProfilePhotoPath) {
      await admin.storage.from('kol-media').remove([nextProfilePhotoPath])
    }

    nextProfilePhotoPath = storagePath
  }

  const { error: updateAppError } = await admin
    .from('kol_applications')
    .update({
      bio,
      profile_photo_path: nextProfilePhotoPath || null,
    })
    .eq('id', application.id)

  if (updateAppError) {
    return NextResponse.json(
      { error: `Failed to update profile: ${updateAppError.message}` },
      { status: 500 },
    )
  }

  const { error: updateUserError } = await admin.auth.admin.updateUserById(auth.user.id, {
    user_metadata: {
      ...auth.user.user_metadata,
      profile_photo_path: nextProfilePhotoPath || null,
    },
  })

  if (updateUserError) {
    return NextResponse.json(
      { error: `Failed to sync user profile: ${updateUserError.message}` },
      { status: 500 },
    )
  }

  let profilePhotoUrl: string | null = null
  if (nextProfilePhotoPath) {
    const { data, error: signError } = await admin.storage
      .from('kol-media')
      .createSignedUrl(nextProfilePhotoPath, 60 * 60)

    if (signError) {
      return NextResponse.json(
        { error: `Failed to sign profile photo URL: ${signError.message}` },
        { status: 500 },
      )
    }

    profilePhotoUrl = data.signedUrl
  }

  return NextResponse.json({
    ok: true,
    profile: {
      bio,
      profilePhotoUrl,
    },
  })
}
