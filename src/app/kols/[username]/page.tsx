import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { getRoleFromUser } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  type ResumeViewerRole,
  type ResumeMediaItem,
  type SocialLinks,
  type KolResumeData,
} from '@/data/mock-resume'
import KolResumePage from '@/components/kol/KolResumePage'

function toFullUrl(platform: string, value: string): string {
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  const handle = value.replace(/^@/, '')
  switch (platform) {
    case 'instagram': return `https://instagram.com/${handle}`
    case 'tiktok':    return `https://tiktok.com/@${handle}`
    case 'facebook':  return `https://facebook.com/${handle}`
    case 'youtube':   return `https://youtube.com/@${handle}`
    default:          return `https://${value}`
  }
}

function platformAccountsToSocialLinks(accounts: Record<string, string>): SocialLinks {
  const links: SocialLinks = {}
  for (const [platform, value] of Object.entries(accounts)) {
    if (!value) continue
    switch (platform.toLowerCase()) {
      case 'instagram': links.instagram = toFullUrl('instagram', value); break
      case 'tiktok':    links.tiktok    = toFullUrl('tiktok',    value); break
      case 'facebook':  links.facebook  = toFullUrl('facebook',  value); break
      case 'youtube':   links.youtube   = toFullUrl('youtube',   value); break
      case 'website':   links.website   = toFullUrl('website',   value); break
    }
  }
  return links
}

function deriveUsername(user: { email?: string | null; user_metadata?: Record<string, unknown> }): string {
  const stored = user.user_metadata?.kol_username
  if (typeof stored === 'string' && stored.length > 0) return stored
  return (user.email ?? '').split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()
}

export default async function KolResumePublicPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const admin = getSupabaseAdminClient()

  // ── 1. Find the KOL user by their kol_username metadata ─────────────────
  // We need to list users because Supabase doesn't support metadata filtering natively.
  const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const kolUser = users?.find((u) => deriveUsername(u as Parameters<typeof deriveUsername>[0]) === username)

  if (!kolUser) notFound()

  // ── 2. Fetch application + media assets in parallel ──────────────────────
  const [applicationResult, mediaAssetsResult] = await Promise.all([
    admin
      .from('kol_applications')
      .select('id,profile_photo_path,full_name,bio,platform_accounts')
      .eq('user_id', kolUser.id)
      .eq('status', 'approved')
      .maybeSingle(),
    admin
      .from('kol_media_assets')
      .select('id,media_type,storage_bucket,storage_path,sort_order,caption,created_at')
      .eq('user_id', kolUser.id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true }),
  ])

  const application = applicationResult.data
  const profilePhotoPath = typeof application?.profile_photo_path === 'string'
    ? application.profile_photo_path
    : ''

  const mediaRows = (mediaAssetsResult.data ?? []) as {
    id: string
    media_type: 'image' | 'video'
    storage_bucket: string
    storage_path: string
    sort_order: number | null
    caption: string | null
    created_at: string | null
  }[]

  const mediaToSign = mediaRows.filter((row) => row.storage_path !== profilePhotoPath)

  // ── 3. Sign URLs ─────────────────────────────────────────────────────────
  const pathsByBucket = mediaToSign.reduce<Record<string, string[]>>((acc, row) => {
    if (!acc[row.storage_bucket]) acc[row.storage_bucket] = []
    acc[row.storage_bucket].push(row.storage_path)
    return acc
  }, {})

  const [photoSigned, ...bucketResults] = await Promise.all([
    profilePhotoPath
      ? admin.storage.from('kol-media').createSignedUrl(profilePhotoPath, 60 * 60)
      : Promise.resolve(null),
    ...Object.entries(pathsByBucket).map(([bucket, paths]) =>
      admin.storage.from(bucket).createSignedUrls(paths, 60 * 60).then((r) => ({ bucket, paths, data: r.data })),
    ),
  ])

  const profilePhotoUrl = (photoSigned as { data?: { signedUrl?: string } } | null)?.data?.signedUrl ?? null

  const signedUrlByPath = new Map<string, string>()
  for (const result of bucketResults as { bucket: string; paths: string[]; data: { path?: string; signedUrl?: string }[] | null }[]) {
    if (!result?.data) continue
    result.data.forEach((item, index) => {
      const path = result.paths[index]
      if (item?.signedUrl) signedUrlByPath.set(path, item.signedUrl)
    })
  }

  const realMedia: ResumeMediaItem[] = mediaToSign.map((row) => ({
    id:        row.id,
    mediaType: row.media_type,
    url:       signedUrlByPath.get(row.storage_path) ?? '',
    caption:   row.caption ?? '',
    sortOrder: row.sort_order ?? 0,
  }))

  // ── 4. Determine viewerRole from session ─────────────────────────────────
  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const { data: { user: loggedInUser } } = await supabase.auth.getUser()

  let viewerRole: ResumeViewerRole = 'public'
  if (loggedInUser) {
    const role = getRoleFromUser(loggedInUser)
    if (role === 'admin') {
      viewerRole = 'admin'
    } else if (role === 'merchant') {
      viewerRole = 'merchant'
    } else if (role === 'kol' && loggedInUser.id === kolUser.id) {
      viewerRole = 'self'
    }
  }

  // ── 5. Build resume from KOL user metadata + application data ────────────
  const savedResume = kolUser.user_metadata?.kol_resume as {
    displayName?: string
    bio?: string
    followerCount?: number
    nicheTags?: string[]
  } | undefined

  const signupFullName =
    typeof (kolUser.user_metadata as Record<string, unknown> | undefined)?.full_name === 'string' && (kolUser.user_metadata as Record<string, unknown>).full_name
      ? String((kolUser.user_metadata as Record<string, unknown>).full_name)
      : typeof application?.full_name === 'string' ? application.full_name : ''

  const socialLinks = platformAccountsToSocialLinks(
    (application?.platform_accounts as Record<string, string> | null) ?? {},
  )

  const resume: KolResumeData = {
    username,
    kolId:          kolUser.id,
    displayName:    savedResume?.displayName ?? signupFullName ?? username,
    bio:            savedResume?.bio ?? (typeof application?.bio === 'string' ? application.bio : ''),
    profilePhotoUrl,
    followerCount:  savedResume?.followerCount ?? 0,
    nicheTags:      savedResume?.nicheTags ?? [],
    socialLinks,
    media:          realMedia,
    platformStats:  {
      totalClicks:    0,
      totalBookings:  0,
      totalSales:     0,
      conversionRate: 0,
      activeProjects: 0,
    },
  }

  return <KolResumePage resume={resume} viewerRole={viewerRole} />
}
