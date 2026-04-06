import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getUsernameFromUser, getResumeByUsername, createDefaultResume } from '@/data/mock-resume'
import type { SocialLinks } from '@/data/mock-resume'
import { fetchKolPlatformStats } from '@/lib/kol-stats'
import KolResumeEditClient from './_client'

function platformAccountsToSocialLinks(accounts: Record<string, string>): SocialLinks {
  const links: SocialLinks = {}
  for (const [platform, value] of Object.entries(accounts)) {
    if (!value) continue
    switch (platform.toLowerCase()) {
      case 'instagram': links.instagram = value; break
      case 'tiktok':    links.tiktok    = value; break
      case 'facebook':  links.facebook  = value; break
      case 'youtube':   links.youtube   = value; break
      case 'website':   links.website   = value; break
    }
  }
  return links
}

export default async function KolResumeEditPage() {
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

  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) redirect('/login')

  const username = getUsernameFromUser(user)
  const baseResume = getResumeByUsername(username) ?? createDefaultResume(username)

  const admin = getSupabaseAdminClient()

  let profilePhotoPath =
    typeof user.user_metadata?.profile_photo_path === 'string'
      ? user.user_metadata.profile_photo_path
      : ''

  const [applicationResult, platformStats] = await Promise.all([
    admin
      .from('kol_applications')
      .select('profile_photo_path,full_name,bio,platform_accounts,collab_fee')
      .eq('user_id', user.id)
      .maybeSingle(),
    fetchKolPlatformStats(admin, user.id),
  ])

  const application = applicationResult.data

  if (!profilePhotoPath) {
    profilePhotoPath =
      typeof application?.profile_photo_path === 'string'
        ? application.profile_photo_path
        : ''
  }

  let profilePhotoUrl: string | null = null
  if (profilePhotoPath) {
    const signed = await admin.storage.from('kol-media').createSignedUrl(profilePhotoPath, 60 * 60)
    profilePhotoUrl = signed.data?.signedUrl ?? null
  }

  const savedResume = user.user_metadata?.kol_resume as {
    displayName?: string
    bio?: string
    followerCount?: number
    nicheTags?: string[]
  } | undefined

  const signupFullName =
    typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name
      ? user.user_metadata.full_name
      : typeof application?.full_name === 'string' && application.full_name
        ? application.full_name
        : undefined

  const signupBio =
    typeof application?.bio === 'string' && application.bio
      ? application.bio
      : undefined

  // Social links come from platform_accounts — not editable in the editor
  const socialLinks = platformAccountsToSocialLinks(
    (application?.platform_accounts as Record<string, string> | null) ?? {}
  )

  const resume = {
    ...baseResume,
    profilePhotoUrl,
    displayName: savedResume?.displayName ?? signupFullName ?? '',
    bio: savedResume?.bio ?? signupBio ?? baseResume.bio,
    socialLinks,
    ...(savedResume?.followerCount !== undefined && { followerCount: savedResume.followerCount }),
    ...(savedResume?.nicheTags !== undefined && { nicheTags: savedResume.nicheTags }),
    collabFee: typeof application?.collab_fee === 'number' ? application.collab_fee : null,
    platformStats,
  }

  return <KolResumeEditClient initialResume={resume} />
}
