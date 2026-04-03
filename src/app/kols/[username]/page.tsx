import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getRoleFromUser } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import {
  getResumeByUsername,
  createDefaultResume,
  getUsernameFromUser,
  type ResumeViewerRole,
  type ResumeMediaItem,
  type SocialLinks,
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

export default async function KolResumePublicPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const resume = getResumeByUsername(username) ?? createDefaultResume(username)

  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let viewerRole: ResumeViewerRole = 'public'

  if (user) {
    const role = getRoleFromUser(user)
    if (role === 'admin') {
      viewerRole = 'admin'
    } else if (role === 'merchant') {
      viewerRole = 'merchant'
    } else if (role === 'kol') {
      const kolUsername = getUsernameFromUser(user)
      if (kolUsername === username) viewerRole = 'self'
    }
  }

  // Fetch profile photo, real media assets, and signup data for the KOL who owns this resume
  let profilePhotoUrl: string | null = null
  let realMedia: ResumeMediaItem[] | null = null
  let signupData: { full_name?: string; bio?: string; platform_accounts?: Record<string, string> } | null = null

  if (viewerRole === 'self' && user) {
    const admin = getSupabaseAdminClient()

    // Resolve profile photo path
    let profilePhotoPath =
      typeof user.user_metadata?.profile_photo_path === 'string'
        ? user.user_metadata.profile_photo_path
        : ''

    // Fetch application (for profilePhotoPath + applicationId + signup data) and media assets in parallel
    const [applicationResult, mediaAssetsResult] = await Promise.all([
      admin
        .from('kol_applications')
        .select('id,profile_photo_path,full_name,bio,platform_accounts')
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .maybeSingle(),
      admin
        .from('kol_media_assets')
        .select('id,media_type,storage_bucket,storage_path,sort_order,caption,created_at')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true }),
    ])

    const application = applicationResult.data
    const applicationId = application ? String(application.id) : null

    if (!profilePhotoPath) {
      profilePhotoPath =
        typeof application?.profile_photo_path === 'string'
          ? application.profile_photo_path
          : ''
    }

    // Expose signup data for the resume merge below
    signupData = {
      full_name: typeof application?.full_name === 'string' ? application.full_name : undefined,
      bio: typeof application?.bio === 'string' ? application.bio : undefined,
      platform_accounts: (application?.platform_accounts as Record<string, string> | null) ?? undefined,
    }

    const mediaRows = (mediaAssetsResult.data ?? []) as {
      id: string
      media_type: 'image' | 'video'
      storage_bucket: string
      storage_path: string
      sort_order: number | null
      caption: string | null
      created_at: string | null
    }[]

    // Filter out profile photo from media list
    const mediaToSign = applicationId
      ? mediaRows.filter((row) => row.storage_path !== profilePhotoPath)
      : mediaRows

    // Sign profile photo + media batch in parallel
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

    profilePhotoUrl = (photoSigned as { data?: { signedUrl?: string } } | null)?.data?.signedUrl ?? null

    const signedUrlByPath = new Map<string, string>()
    for (const result of bucketResults as { bucket: string; paths: string[]; data: { path?: string; signedUrl?: string }[] | null }[]) {
      if (!result?.data) continue
      result.data.forEach((item, index) => {
        const path = result.paths[index]
        if (item?.signedUrl) signedUrlByPath.set(path, item.signedUrl)
      })
    }

    realMedia = mediaToSign.map((row) => ({
      id: row.id,
      mediaType: row.media_type,
      url: signedUrlByPath.get(row.storage_path) ?? '',
      caption: row.caption ?? '',
      sortOrder: row.sort_order ?? 0,
    }))
  }

  // Priority: editor-saved override → signup data → mock base
  const savedResume = (viewerRole === 'self' && user)
    ? user.user_metadata?.kol_resume as {
        displayName?: string
        bio?: string
        followerCount?: number
        nicheTags?: string[]
      } | undefined
    : undefined

  const signupFullName =
    typeof user?.user_metadata?.full_name === 'string' && user.user_metadata.full_name
      ? user.user_metadata.full_name
      : signupData?.full_name || undefined

  // Social links always come from platform_accounts (same source as edit page)
  const socialLinks = platformAccountsToSocialLinks(signupData?.platform_accounts ?? {})

  const resumeWithPhoto = {
    ...resume,
    profilePhotoUrl,
    ...(realMedia !== null ? { media: realMedia } : {}),
    displayName: savedResume?.displayName ?? signupFullName ?? resume.displayName ?? '',
    bio: savedResume?.bio ?? signupData?.bio ?? resume.bio,
    socialLinks,
    ...(savedResume?.followerCount !== undefined && { followerCount: savedResume.followerCount }),
    ...(savedResume?.nicheTags !== undefined && { nicheTags: savedResume.nicheTags }),
  }

  return <KolResumePage resume={resumeWithPhoto} viewerRole={viewerRole} />
}
