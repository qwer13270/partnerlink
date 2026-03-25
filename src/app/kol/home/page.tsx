import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import KolHomePageClient from '@/components/kol/KolHomePageClient'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getUsernameFromUser } from '@/data/mock-resume'

type ApplicationRecord = {
  id: string
  full_name: string | null
  profile_photo_path: string | null
}

type PortfolioAssetRecord = {
  media_type: 'image' | 'video' | null
  storage_path: string | null
}

export default async function KolHomePage() {
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

  if (!user) {
    redirect('/login')
  }

  const role = getRoleFromUser(user)
  if (role !== 'kol') {
    redirect(role ? resolveRoleHomePath(role) : '/login')
  }

  const admin = getSupabaseAdminClient()
  const [{ data: application }, { data: assets }] = await Promise.all([
    admin
      .from('kol_applications')
      .select('id,full_name,profile_photo_path')
      .eq('user_id', user.id)
      .eq('status', 'approved')
      .maybeSingle<ApplicationRecord>(),
    admin
      .from('kol_media_assets')
      .select('media_type,storage_path')
      .eq('user_id', user.id)
      .returns<PortfolioAssetRecord[]>(),
  ])

  const profilePhotoPath =
    typeof application?.profile_photo_path === 'string'
      ? application.profile_photo_path
      : ''

  const portfolioCounts = (assets ?? []).reduce(
    (acc, asset) => {
      if (asset.storage_path === profilePhotoPath) return acc
      if (asset.media_type === 'image') acc.totalPhotos += 1
      if (asset.media_type === 'video') acc.totalVideos += 1
      return acc
    },
    { totalPhotos: 0, totalVideos: 0 },
  )

  const displayName =
    (typeof application?.full_name === 'string' && application.full_name.trim()) ||
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.email === 'string' && user.email.includes('@') ? user.email.split('@')[0] : '')

  const username = getUsernameFromUser(user)

  return (
    <KolHomePageClient
      displayName={displayName}
      username={username}
      hasProfilePhoto={Boolean(profilePhotoPath)}
      portfolioCounts={portfolioCounts}
    />
  )
}
