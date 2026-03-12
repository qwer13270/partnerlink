import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

type PortfolioAssetRow = {
  id: string
  media_type: 'image' | 'video'
  storage_bucket: string
  storage_path: string
  sort_order: number | null
  mime_type: string | null
  file_size_bytes: number | null
  created_at: string | null
}

function sanitizeFileName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function fileLabelFromPath(path: string) {
  const raw = path.split('/').pop() ?? 'media'
  const parts = raw.split('-')
  return parts.length > 1 ? parts.slice(1).join('-') : raw
}

async function getApprovedApplication(admin: ReturnType<typeof getSupabaseAdminClient>, userId: string) {
  const { data, error } = await admin
    .from('kol_applications')
    .select('id,profile_photo_path')
    .eq('user_id', userId)
    .eq('status', 'approved')
    .single()

  if (error || !data) {
    return { application: null, error: error?.message ?? 'Approved KOL profile not found.' }
  }

  return {
    application: {
      id: String(data.id),
      profilePhotoPath: typeof data.profile_photo_path === 'string' ? data.profile_photo_path : '',
    },
    error: null,
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()
  const { application, error: applicationError } = await getApprovedApplication(admin, auth.user.id)

  if (!application) {
    return NextResponse.json({ error: applicationError }, { status: 404 })
  }

  const { data: rows, error: assetsError } = await admin
    .from('kol_media_assets')
    .select('id,media_type,storage_bucket,storage_path,sort_order,mime_type,file_size_bytes,created_at')
    .eq('application_id', application.id)
    .eq('user_id', auth.user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (assetsError) {
    return NextResponse.json(
      { error: `Failed to load portfolio: ${assetsError.message}` },
      { status: 500 },
    )
  }

  const assets = ((rows ?? []) as PortfolioAssetRow[])
    .filter((row) => row.storage_path !== application.profilePhotoPath)

  const pathsByBucket = assets.reduce<Record<string, string[]>>((acc, asset) => {
    if (!acc[asset.storage_bucket]) acc[asset.storage_bucket] = []
    acc[asset.storage_bucket].push(asset.storage_path)
    return acc
  }, {})

  const signedUrlByPath = new Map<string, string>()

  for (const [bucket, paths] of Object.entries(pathsByBucket)) {
    if (paths.length === 0) continue

    const { data, error } = await admin.storage.from(bucket).createSignedUrls(paths, 60 * 60)
    if (error) {
      return NextResponse.json(
        { error: `Failed to sign portfolio media: ${error.message}` },
        { status: 500 },
      )
    }

    data.forEach((item, index) => {
      const path = paths[index]
      if (item?.signedUrl) {
        signedUrlByPath.set(path, item.signedUrl)
      }
    })
  }

  const responseAssets = assets.map((asset) => ({
    id: asset.id,
    mediaType: asset.media_type,
    url: signedUrlByPath.get(asset.storage_path) ?? '',
    fileName: fileLabelFromPath(asset.storage_path),
    sortOrder: typeof asset.sort_order === 'number' ? asset.sort_order : 0,
    mimeType: asset.mime_type ?? '',
    fileSizeBytes: typeof asset.file_size_bytes === 'number' ? asset.file_size_bytes : 0,
    createdAt: asset.created_at ?? '',
  }))

  return NextResponse.json({
    ok: true,
    portfolio: {
      applicationId: application.id,
      photos: responseAssets.filter((asset) => asset.mediaType === 'image'),
      videos: responseAssets.filter((asset) => asset.mediaType === 'video'),
      summary: {
        totalPhotos: responseAssets.filter((asset) => asset.mediaType === 'image').length,
        totalVideos: responseAssets.filter((asset) => asset.mediaType === 'video').length,
      },
    },
  })
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const mediaType = String(formData.get('mediaType') ?? '')
  const sortOrderValue = String(formData.get('sortOrder') ?? '0')
  const fileEntry = formData.get('file')

  if (mediaType !== 'image' && mediaType !== 'video') {
    return NextResponse.json({ error: 'Invalid mediaType.' }, { status: 400 })
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
  const { application, error: applicationError } = await getApprovedApplication(admin, auth.user.id)

  if (!application) {
    return NextResponse.json({ error: applicationError }, { status: 404 })
  }

  const bucket = 'kol-media'
  const extension = fileEntry.name.includes('.')
    ? fileEntry.name.split('.').pop()?.toLowerCase() ?? ''
    : ''
  const safeName = sanitizeFileName(fileEntry.name || 'portfolio-media')
  const suffix = extension ? `.${extension}` : ''
  const storagePath = `kol/${auth.user.id}/${application.id}/${crypto.randomUUID()}-${safeName || 'portfolio-media'}${suffix}`

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

  const { data: inserted, error: insertError } = await admin
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
    .select('id,media_type,storage_path,sort_order,mime_type,file_size_bytes,created_at')
    .single()

  if (insertError || !inserted) {
    await admin.storage.from(bucket).remove([storagePath])
    return NextResponse.json(
      { error: `Failed to save media metadata: ${insertError?.message ?? 'Unknown error'}` },
      { status: 500 },
    )
  }

  const { data: signed, error: signError } = await admin.storage
    .from(bucket)
    .createSignedUrl(storagePath, 60 * 60)

  if (signError) {
    return NextResponse.json(
      { error: `Failed to sign uploaded media: ${signError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({
    ok: true,
    asset: {
      id: inserted.id,
      mediaType: inserted.media_type,
      url: signed.signedUrl,
      fileName: fileLabelFromPath(inserted.storage_path),
      sortOrder: typeof inserted.sort_order === 'number' ? inserted.sort_order : 0,
      mimeType: inserted.mime_type ?? '',
      fileSizeBytes: typeof inserted.file_size_bytes === 'number' ? inserted.file_size_bytes : 0,
      createdAt: inserted.created_at ?? '',
    },
  })
}

export async function DELETE(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const { assetId } = (await request.json().catch(() => ({}))) as { assetId?: string }
  if (!assetId) {
    return NextResponse.json({ error: 'Missing assetId.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { application, error: applicationError } = await getApprovedApplication(admin, auth.user.id)
  if (!application) {
    return NextResponse.json({ error: applicationError }, { status: 404 })
  }

  const { data: asset, error: assetError } = await admin
    .from('kol_media_assets')
    .select('id,storage_bucket,storage_path,user_id,application_id')
    .eq('id', assetId)
    .eq('user_id', auth.user.id)
    .eq('application_id', application.id)
    .single()

  if (assetError || !asset) {
    return NextResponse.json({ error: 'Portfolio asset not found.' }, { status: 404 })
  }

  if (asset.storage_path === application.profilePhotoPath) {
    return NextResponse.json({ error: 'Profile photo cannot be deleted from portfolio.' }, { status: 400 })
  }

  const { error: deleteRowError } = await admin
    .from('kol_media_assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', auth.user.id)

  if (deleteRowError) {
    return NextResponse.json(
      { error: `Failed to delete media record: ${deleteRowError.message}` },
      { status: 500 },
    )
  }

  const { error: storageDeleteError } = await admin.storage
    .from(String(asset.storage_bucket))
    .remove([String(asset.storage_path)])

  if (storageDeleteError) {
    return NextResponse.json(
      { error: `Deleted record, but failed to remove file: ${storageDeleteError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, assetId })
}
