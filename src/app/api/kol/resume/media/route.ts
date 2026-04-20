import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

type MediaAssetRow = {
  id: string
  media_type: 'image' | 'video'
  storage_bucket: string
  storage_path: string
  sort_order: number | null
  mime_type: string | null
  file_size_bytes: number | null
  caption: string
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

  // Run application fetch and assets fetch independently — assets need applicationId so must be sequential
  const { application, error: applicationError } = await getApprovedApplication(admin, auth.user.id)

  if (!application) {
    return NextResponse.json({ error: applicationError }, { status: 404 })
  }

  const { data: rows, error: assetsError } = await admin
    .from('kol_media_assets')
    .select('id,media_type,storage_bucket,storage_path,sort_order,mime_type,file_size_bytes,caption,created_at')
    .eq('application_id', application.id)
    .eq('user_id', auth.user.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (assetsError) {
    return NextResponse.json(
      { error: `Failed to load media: ${assetsError.message}` },
      { status: 500 },
    )
  }

  const assets = ((rows ?? []) as MediaAssetRow[])
    .filter((row) => row.storage_path !== application.profilePhotoPath)

  // Group paths by bucket for batch signing
  const pathsByBucket = assets.reduce<Record<string, string[]>>((acc, asset) => {
    if (!acc[asset.storage_bucket]) acc[asset.storage_bucket] = []
    acc[asset.storage_bucket].push(asset.storage_path)
    return acc
  }, {})

  // Sign all buckets in parallel
  const signedUrlByPath = new Map<string, string>()

  await Promise.all(
    Object.entries(pathsByBucket).map(async ([bucket, paths]) => {
      if (paths.length === 0) return
      const { data, error } = await admin.storage.from(bucket).createSignedUrls(paths, 60 * 60)
      if (error) throw new Error(`Failed to sign media: ${error.message}`)
      data.forEach((item, index) => {
        const path = paths[index]
        if (item?.signedUrl) signedUrlByPath.set(path, item.signedUrl)
      })
    }),
  ).catch((err: unknown) => {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to sign media.' },
      { status: 500 },
    )
  })

  const responseAssets = assets.map((asset) => ({
    id: asset.id,
    mediaType: asset.media_type,
    url: signedUrlByPath.get(asset.storage_path) ?? '',
    fileName: fileLabelFromPath(asset.storage_path),
    sortOrder: typeof asset.sort_order === 'number' ? asset.sort_order : 0,
    caption: asset.caption ?? '',
    fileSizeBytes: typeof asset.file_size_bytes === 'number' ? asset.file_size_bytes : 0,
    createdAt: asset.created_at ?? '',
  }))

  return NextResponse.json({ ok: true, assets: responseAssets })
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => null) as {
    action?: string
    mediaType?: string
    sortOrder?: unknown
    fileName?: string
    mimeType?: string
    fileSize?: unknown
    path?: string
  } | null

  if (!body) {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { application, error: applicationError } = await getApprovedApplication(admin, auth.user.id)
  if (!application) {
    return NextResponse.json({ error: applicationError }, { status: 404 })
  }

  // ── Step 2: Confirm — register DB record after direct-to-storage upload ──
  if (body.action === 'confirm') {
    const { path, mediaType, sortOrder: sortOrderRaw, mimeType, fileSize } = body

    if (typeof path !== 'string' || !path.startsWith(`kol/${auth.user.id}/${application.id}/`)) {
      return NextResponse.json({ error: 'Invalid path.' }, { status: 403 })
    }
    if (mediaType !== 'image' && mediaType !== 'video') {
      return NextResponse.json({ error: 'Invalid mediaType.' }, { status: 400 })
    }

    const sortOrder = Number.parseInt(String(sortOrderRaw ?? '0'), 10)
    if (Number.isNaN(sortOrder) || sortOrder < 0) {
      return NextResponse.json({ error: 'Invalid sortOrder.' }, { status: 400 })
    }

    const bucket = 'kol-media'
    const { data: inserted, error: insertError } = await admin
      .from('kol_media_assets')
      .insert({
        application_id: application.id,
        user_id: auth.user.id,
        media_type: mediaType,
        storage_bucket: bucket,
        storage_path: path,
        mime_type: typeof mimeType === 'string' ? mimeType || null : null,
        file_size_bytes: typeof fileSize === 'number' ? fileSize : Number(fileSize ?? 0),
        sort_order: sortOrder,
        caption: '',
      })
      .select('id,media_type,storage_path,sort_order,mime_type,file_size_bytes,caption,created_at')
      .single()

    if (insertError || !inserted) {
      await admin.storage.from(bucket).remove([path])
      return NextResponse.json(
        { error: `Failed to save media metadata: ${insertError?.message ?? 'Unknown error'}` },
        { status: 500 },
      )
    }

    const { data: signed, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60)

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
        caption: inserted.caption ?? '',
        fileSizeBytes: typeof inserted.file_size_bytes === 'number' ? inserted.file_size_bytes : 0,
        createdAt: inserted.created_at ?? '',
      },
    })
  }

  // ── Step 1: Prepare — validate and return a signed upload URL ──
  const { mediaType, sortOrder: sortOrderRaw, fileName, fileSize } = body

  if (mediaType !== 'image' && mediaType !== 'video') {
    return NextResponse.json({ error: 'Invalid mediaType.' }, { status: 400 })
  }
  if (typeof fileName !== 'string') {
    return NextResponse.json({ error: 'Missing fileName.' }, { status: 400 })
  }

  const sortOrder = Number.parseInt(String(sortOrderRaw ?? '0'), 10)
  if (Number.isNaN(sortOrder) || sortOrder < 0) {
    return NextResponse.json({ error: 'Invalid sortOrder.' }, { status: 400 })
  }

  const fileSizeNum = typeof fileSize === 'number' ? fileSize : Number(fileSize ?? 0)
  const maxImageBytes = 10 * 1024 * 1024
  const maxVideoBytes = 100 * 1024 * 1024
  if (mediaType === 'image' && fileSizeNum > maxImageBytes) {
    return NextResponse.json({ error: 'Image file too large (max 10MB).' }, { status: 400 })
  }
  if (mediaType === 'video' && fileSizeNum > maxVideoBytes) {
    return NextResponse.json({ error: 'Video file too large (max 100MB).' }, { status: 400 })
  }

  const LIMITS = { image: 9, video: 3 } as const
  const { count, error: countError } = await admin
    .from('kol_media_assets')
    .select('*', { count: 'exact', head: true })
    .eq('application_id', application.id)
    .eq('user_id', auth.user.id)
    .eq('media_type', mediaType)

  if (countError) {
    return NextResponse.json({ error: 'Failed to check media count.' }, { status: 500 })
  }

  if ((count ?? 0) >= LIMITS[mediaType]) {
    return NextResponse.json(
      { error: `已達上限：${mediaType === 'image' ? '照片最多 9 張' : '影片最多 3 支'}。` },
      { status: 400 },
    )
  }

  const bucket = 'kol-media'
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() ?? '' : ''
  const safeName = sanitizeFileName(fileName || 'resume-media')
  const suffix = extension ? `.${extension}` : ''
  const storagePath = `kol/${auth.user.id}/${application.id}/${crypto.randomUUID()}-${safeName || 'resume-media'}${suffix}`

  const { data: signedUpload, error: signedError } = await admin.storage
    .from(bucket)
    .createSignedUploadUrl(storagePath)

  if (signedError || !signedUpload) {
    return NextResponse.json(
      { error: `Failed to create upload URL: ${signedError?.message ?? 'Unknown error'}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, signedUrl: signedUpload.signedUrl, path: storagePath })
}

export async function PATCH(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const body = (await request.json().catch(() => ({}))) as { assetId?: string; caption?: string }
  const { assetId, caption } = body

  if (!assetId) {
    return NextResponse.json({ error: 'Missing assetId.' }, { status: 400 })
  }
  // caption can be empty string — valid value
  if (typeof caption !== 'string') {
    return NextResponse.json({ error: 'Missing caption.' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()
  const { application, error: applicationError } = await getApprovedApplication(admin, auth.user.id)
  if (!application) {
    return NextResponse.json({ error: applicationError }, { status: 404 })
  }

  const { error: updateError } = await admin
    .from('kol_media_assets')
    .update({ caption })
    .eq('id', assetId)
    .eq('user_id', auth.user.id)
    .eq('application_id', application.id)

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to update caption: ${updateError.message}` },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true })
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
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 })
  }

  if (asset.storage_path === application.profilePhotoPath) {
    return NextResponse.json({ error: 'Profile photo cannot be deleted.' }, { status: 400 })
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
