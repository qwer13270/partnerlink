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

export type RecentCollab = {
  id: string
  project_id: string
  merchant_user_id: string
  commission_rate: number | null
  responded_at: string | null
  created_at: string
  project_name: string | null
  merchant_company_name: string | null
}

export type KolStats = {
  activeLinks: number
  totalLinks: number
  monthDeals: number
  conversionRate: number | null  // percentage, e.g. 6.2 means 6.2%
  totalClicks: number
  totalInquiries: number
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
  const [{ data: application }, { data: assets }, { data: collabRows }, { data: refLinks }] = await Promise.all([
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
    admin
      .from('collaboration_requests')
      .select('id,project_id,merchant_user_id,commission_rate,responded_at,created_at')
      .eq('kol_user_id', user.id)
      .eq('status', 'accepted')
      .order('responded_at', { ascending: false })
      .limit(5),
    admin
      .from('referral_links')
      .select('id,is_active')
      .eq('kol_user_id', user.id),
  ])

  // ── Stats: clicks + conversions across all this KOL's links ──────────────
  const allLinkIds = (refLinks ?? []).map(l => l.id as string)
  const activeLinks = (refLinks ?? []).filter(l => l.is_active).length

  // Start of current month in ISO format
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ data: clickRows }, { data: convRows }] = allLinkIds.length > 0
    ? await Promise.all([
        admin
          .from('referral_clicks')
          .select('referral_link_id')
          .in('referral_link_id', allLinkIds),
        admin
          .from('referral_conversions')
          .select('referral_link_id,conversion_type,converted_at')
          .in('referral_link_id', allLinkIds),
      ])
    : [{ data: [] }, { data: [] }]

  const totalClicks    = (clickRows ?? []).length
  const allConvs       = convRows ?? []
  const totalInquiries = allConvs.filter(r => r.conversion_type === 'inquiry').length
  const monthDeals     = allConvs.filter(
    r => r.conversion_type === 'deal' && r.converted_at >= monthStart,
  ).length
  const conversionRate = totalClicks > 0
    ? parseFloat(((totalInquiries / totalClicks) * 100).toFixed(1))
    : null

  const kolStats: KolStats = {
    activeLinks,
    totalLinks: allLinkIds.length,
    monthDeals,
    conversionRate,
    totalClicks,
    totalInquiries,
  }

  // Enrich collabs with project name and merchant company name
  const collabRowsSafe = collabRows ?? []
  let recentCollabs: RecentCollab[] = []
  if (collabRowsSafe.length > 0) {
    const projectIds      = [...new Set(collabRowsSafe.map(r => r.project_id as string))]
    const merchantUserIds = [...new Set(collabRowsSafe.map(r => r.merchant_user_id as string))]
    const [{ data: projects }, { data: merchants }] = await Promise.all([
      admin.from('properties').select('id,name').in('id', projectIds),
      admin.from('merchant_profiles').select('user_id,company_name').in('user_id', merchantUserIds),
    ])
    const projectNameById      = new Map((projects ?? []).map(p => [p.id as string, p.name as string]))
    const merchantNameByUserId = new Map((merchants ?? []).map(m => [m.user_id as string, m.company_name as string]))
    recentCollabs = collabRowsSafe.map(r => ({
      id:                   r.id as string,
      project_id:           r.project_id as string,
      merchant_user_id:     r.merchant_user_id as string,
      commission_rate:      typeof r.commission_rate === 'number' ? r.commission_rate : null,
      responded_at:         r.responded_at as string | null,
      created_at:           r.created_at as string,
      project_name:         projectNameById.get(r.project_id as string) ?? null,
      merchant_company_name: merchantNameByUserId.get(r.merchant_user_id as string) ?? null,
    }))
  }

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
      recentCollabs={recentCollabs}
      kolStats={kolStats}
    />
  )
}
