import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiUser } from '@/lib/server/api-auth'

function sanitizeFileName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

export async function POST(request: NextRequest) {
  const auth = await requireApiUser(request)
  if (!auth.ok) return auth.response

  const signupRole = auth.user.user_metadata?.signup_role
  if (signupRole !== 'kol' && auth.role !== 'kol') {
    return NextResponse.json({ error: 'Only KOL users can upload media.' }, { status: 403 })
  }

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const applicationId = String(formData.get('applicationId') ?? '')
  const mediaType = String(formData.get('mediaType') ?? '')
  const isProfile = String(formData.get('isProfile') ?? 'false') === 'true'
  const sortOrderValue = String(formData.get('sortOrder') ?? '0')
  const fileEntry = formData.get('file')

  if (!applicationId) {
    return NextResponse.json({ error: 'Missing applicationId.' }, { status: 400 })
  }
  if (mediaType !== 'image' && mediaType !== 'video') {
    return NextResponse.json({ error: 'Invalid mediaType.' }, { status: 400 })
  }
  if (isProfile && mediaType !== 'image') {
    return NextResponse.json({ error: 'Profile photo must be an image.' }, { status: 400 })
  }
  if (!(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'Missing file.' }, { status: 400 })
  }

  const sortOrder = Number.parseInt(sortOrderValue, 10)
  if (Number.isNaN(sortOrder) || sortOrder < 0) {
    return NextResponse.json({ error: 'Invalid sortOrder.' }, { status: 400 })
  }

  const maxImageBytes = 10 * 1024 * 1024
  const maxVideoBytes = 100 * 1024 * 1024
  if (mediaType === 'image' && fileEntry.size > maxImageBytes) {
    return NextResponse.json({ error: 'Image file too large (max 10MB).' }, { status: 400 })
  }
  if (mediaType === 'video' && fileEntry.size > maxVideoBytes) {
    return NextResponse.json({ error: 'Video file too large (max 100MB).' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  const { data: application, error: applicationError } = await admin
    .from('kol_applications')
    .select('id,user_id')
    .eq('id', applicationId)
    .eq('user_id', auth.user.id)
    .single()

  if (applicationError || !application) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 })
  }

  const bucket = 'kol-media'
  const extension = fileEntry.name.includes('.')
    ? fileEntry.name.split('.').pop()?.toLowerCase() ?? ''
    : ''
  const safeName = sanitizeFileName(fileEntry.name || 'file')
  const suffix = extension ? `.${extension}` : ''
  const basePath = `kol/${auth.user.id}/${application.id}`
  const storagePath = `${basePath}/${crypto.randomUUID()}-${safeName || 'upload'}${suffix}`

  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, fileEntry, {
      upsert: false,
      contentType: fileEntry.type || undefined,
      cacheControl: '3600',
    })

  if (uploadError) {
    return NextResponse.json(
      { error: `Upload failed: ${uploadError.message}` },
      { status: 500 },
    )
  }

  const { error: insertError } = await admin
    .from('kol_media_assets')
    .insert({
      application_id: application.id,
      user_id: auth.user.id,
      media_type: mediaType,
      storage_bucket: bucket,
      storage_path: storagePath,
      mime_type: fileEntry.type || null,
      file_size_bytes: fileEntry.size,
      sort_order: sortOrder,
    })

  if (insertError) {
    await admin.storage.from(bucket).remove([storagePath])
    return NextResponse.json(
      { error: `Failed to save media metadata: ${insertError.message}` },
      { status: 500 },
    )
  }

  if (isProfile) {
    const { error: profileUpdateError } = await admin
      .from('kol_applications')
      .update({ profile_photo_path: storagePath })
      .eq('id', application.id)
      .eq('user_id', auth.user.id)

    if (profileUpdateError) {
      return NextResponse.json(
        { error: `Failed to save profile photo: ${profileUpdateError.message}` },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ ok: true })
}
