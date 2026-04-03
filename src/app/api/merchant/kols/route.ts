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
  const auth = await requireApiRole(request, ['merchant', 'admin'])
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
      'submitted_at',
      'reviewed_at',
      'created_at',
    ].join(','))
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })

  if (error) {
    console.error('[api/merchant/kols] fetch error:', error.message)
    return NextResponse.json(
      { error: '讀取 KOL 資料失敗，請稍後再試。' },
      { status: 500 },
    )
  }

  const kols = (data ?? []) as unknown as Array<Record<string, unknown> & { id: string }>
  if (kols.length === 0) {
    return NextResponse.json({ ok: true, kols: [] })
  }

  const applicationIds = kols.map((item) => item.id)
  const { data: rawMediaAssets, error: mediaError } = await admin
    .from('kol_media_assets')
    .select('application_id,media_type,storage_bucket,storage_path,sort_order')
    .in('application_id', applicationIds)
    .order('sort_order', { ascending: true })

  if (mediaError) {
    console.error('[api/merchant/kols] media fetch error:', mediaError.message)
    return NextResponse.json(
      { error: '讀取媒體資產失敗，請稍後再試。' },
      { status: 500 },
    )
  }

  const mediaAssets = (rawMediaAssets ?? []) as MediaAssetRow[]
  const byBucket = mediaAssets.reduce<Record<string, string[]>>((acc, item) => {
    if (!acc[item.storage_bucket]) acc[item.storage_bucket] = []
    acc[item.storage_bucket].push(item.storage_path)
    return acc
  }, {})

  for (const kol of kols) {
    const profilePhotoPath =
      typeof kol.profile_photo_path === 'string'
        ? kol.profile_photo_path
        : ''

    if (!profilePhotoPath) continue
    if (!byBucket['kol-media']) byBucket['kol-media'] = []
    if (!byBucket['kol-media'].includes(profilePhotoPath)) {
      byBucket['kol-media'].push(profilePhotoPath)
    }
  }

  const signedUrlByPath = new Map<string, string>()

  for (const [bucket, paths] of Object.entries(byBucket)) {
    if (paths.length === 0) continue

    const { data: signedUrls, error: signError } = await admin.storage
      .from(bucket)
      .createSignedUrls(paths, 4 * 60 * 60)

    if (signError) {
      console.error('[api/merchant/kols] sign URL error:', signError.message)
      return NextResponse.json(
        { error: '產生媒體連結失敗，請稍後再試。' },
        { status: 500 },
      )
    }

    for (let index = 0; index < paths.length; index += 1) {
      const signed = signedUrls?.[index]
      if (signed?.signedUrl) signedUrlByPath.set(paths[index], signed.signedUrl)
    }
  }

  const mediaByApplication = mediaAssets.reduce<Record<string, MediaAssetRow[]>>((acc, item) => {
    if (!acc[item.application_id]) acc[item.application_id] = []
    acc[item.application_id].push(item)
    return acc
  }, {})

  // Fetch the real kol_username from auth.users metadata for each KOL
  const userMetaResults = await Promise.all(
    kols.map((kol) =>
      typeof kol.user_id === 'string'
        ? admin.auth.admin.getUserById(kol.user_id).then((r) => ({
            userId: kol.user_id as string,
            kolUsername: typeof r.data?.user?.user_metadata?.kol_username === 'string'
              ? r.data.user.user_metadata.kol_username
              : null,
          }))
        : Promise.resolve({ userId: '', kolUsername: null }),
    ),
  )

  const usernameByUserId = new Map(userMetaResults.map((r) => [r.userId, r.kolUsername]))

  const hydratedKols = kols.map((kol) => {
    const assets = mediaByApplication[kol.id] ?? []
    const profilePhotoPath =
      typeof kol.profile_photo_path === 'string'
        ? kol.profile_photo_path
        : ''

    const photos = assets
      .filter((asset) => asset.media_type === 'image' && asset.storage_path !== profilePhotoPath)
      .map((asset) => signedUrlByPath.get(asset.storage_path))
      .filter((url): url is string => Boolean(url))

    const videos = assets
      .filter((asset) => asset.media_type === 'video')
      .map((asset, index) => ({
        url: signedUrlByPath.get(asset.storage_path) ?? '',
        title: `作品影片 ${index + 1}`,
      }))
      .filter((item) => item.url.length > 0)

    // Prefer the user-chosen kol_username; fall back to email-derived
    const userId = typeof kol.user_id === 'string' ? kol.user_id : ''
    const chosenUsername = usernameByUserId.get(userId) ?? null
    const emailStr = typeof kol.email === 'string' ? kol.email : ''
    const username = chosenUsername ?? emailStr.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()

    return {
      id:               kol.id,
      kol_user_id:      userId,
      full_name:        kol.full_name,
      username,
      platforms:        kol.platforms,
      follower_range:   kol.follower_range,
      content_type:     kol.content_type,
      bio:              kol.bio,
      city:             kol.city,
      avg_views:        kol.avg_views,
      engagement_rate:  kol.engagement_rate,
      profile_photo_url: profilePhotoPath ? (signedUrlByPath.get(profilePhotoPath) ?? '') : '',
      photos,
      videos,
    }
  })

  return NextResponse.json(
    { ok: true, kols: hydratedKols },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
