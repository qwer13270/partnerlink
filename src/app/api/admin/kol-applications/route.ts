import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

type MediaAssetRow = {
  application_id: string
  media_type: 'image' | 'video'
  storage_bucket: string
  storage_path: string
  sort_order: number
}

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()
  const { data, error } = await admin
    .from('kol_applications')
    .select([
      'id',
      'user_id',
      'email',
      'full_name',
      'platforms',
      'platform_accounts',
      'follower_range',
      'content_type',
      'bio',
      'city',
      'avg_views',
      'engagement_rate',
      'profile_photo_path',
      'photos',
      'videos',
      'submitted_at',
      'status',
      'created_at',
    ].join(','))
    .eq('status', 'pending')
    .order('submitted_at', { ascending: true })

  if (error) {
    return NextResponse.json(
      { error: `Failed to load applications: ${error.message}` },
      { status: 500 },
    )
  }

  const applications = ((data ?? []) as unknown) as Array<Record<string, unknown> & { id: string }>
  if (applications.length === 0) {
    return NextResponse.json({ ok: true, applications: [] })
  }

  const applicationIds = applications.map((item) => item.id)
  const { data: rawMediaAssets, error: mediaError } = await admin
    .from('kol_media_assets')
    .select('application_id,media_type,storage_bucket,storage_path,sort_order')
    .in('application_id', applicationIds)
    .order('sort_order', { ascending: true })

  if (mediaError) {
    return NextResponse.json(
      { error: `Failed to load media assets: ${mediaError.message}` },
      { status: 500 },
    )
  }

  const mediaAssets = (rawMediaAssets ?? []) as MediaAssetRow[]
  const byBucket = mediaAssets.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.storage_bucket]) acc[item.storage_bucket] = []
    acc[item.storage_bucket].push(item.storage_path)
    return acc
  }, {})

  const signedUrlByPath = new Map<string, string>()

  for (const [bucket, paths] of Object.entries(byBucket)) {
    if (paths.length === 0) continue
    const { data: signedUrls, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUrls(paths, 60 * 60)

    if (signError) {
      return NextResponse.json(
        { error: `Failed to sign media URLs: ${signError.message}` },
        { status: 500 },
      )
    }

    for (let i = 0; i < paths.length; i += 1) {
      const signed = signedUrls?.[i]
      if (signed?.signedUrl) signedUrlByPath.set(paths[i], signed.signedUrl)
    }
  }

  const mediaByApplication = mediaAssets.reduce<Record<string, MediaAssetRow[]>>((acc, item) => {
    if (!acc[item.application_id]) acc[item.application_id] = []
    acc[item.application_id].push(item)
    return acc
  }, {})

  const hydratedApplications = applications.map((application) => {
    const assets = mediaByApplication[application.id] ?? []
    const profilePathRaw = application.profile_photo_path
    const profilePath = typeof profilePathRaw === 'string' ? profilePathRaw : ''
    const profilePhotoUrl = profilePath ? (signedUrlByPath.get(profilePath) ?? '') : ''
    const photos = assets
      .filter((asset) => asset.media_type === 'image')
      .filter((asset) => asset.storage_path !== profilePath)
      .map((asset) => signedUrlByPath.get(asset.storage_path))
      .filter((url): url is string => Boolean(url))

    const videos = assets
      .filter((asset) => asset.media_type === 'video')
      .map((asset, index) => ({
        url: signedUrlByPath.get(asset.storage_path) ?? '',
        title: `作品影片 ${index + 1}`,
        duration: '',
      }))
      .filter((video) => video.url.length > 0)

    return {
      ...application,
      profile_photo_url: profilePhotoUrl,
      photos,
      videos,
    }
  })

  return NextResponse.json({ ok: true, applications: hydratedApplications })
}
