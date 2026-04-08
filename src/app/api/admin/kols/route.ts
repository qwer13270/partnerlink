import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

type ReferralLinkRow = { id: string; kol_user_id: string; project_id: string }
type ClickRow        = { referral_link_id: string }
type ConversionRow   = { referral_link_id: string }
type PropertyRow     = { id: string; is_archived: boolean; merchant_user_id: string | null }
type MerchantProfileRow = { user_id: string; merchant_type: string | null }

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  // ── 1. Fetch approved KOL applications ──────────────────────────────────
  const { data, error } = await admin
    .from('kol_applications')
    .select([
      'id', 'user_id', 'email', 'full_name',
      'platforms', 'platform_accounts',
      'follower_range', 'content_type',
      'bio', 'city',
      'profile_photo_path',
      'submitted_at', 'reviewed_at', 'created_at',
    ].join(','))
    .eq('status', 'approved')
    .order('reviewed_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: `Failed to load KOLs: ${error.message}` }, { status: 500 })
  }

  const kols = ((data ?? []) as unknown) as Array<Record<string, unknown> & { id: string; user_id: string }>
  if (kols.length === 0) {
    return NextResponse.json({ ok: true, kols: [] })
  }

  const userIds = kols.map((k) => k.user_id).filter(Boolean) as string[]

  // ── 2. Profile photos (signed URLs) ─────────────────────────────────────
  const profilePaths = kols
    .map((k) => typeof k.profile_photo_path === 'string' ? k.profile_photo_path : '')
    .filter(Boolean)

  const signedUrlByPath = new Map<string, string>()
  if (profilePaths.length > 0) {
    const { data: signedUrls } = await admin.storage
      .from('kol-media')
      .createSignedUrls(profilePaths, 60 * 60)
    signedUrls?.forEach((s, i) => {
      if (s?.signedUrl) signedUrlByPath.set(profilePaths[i], s.signedUrl)
    })
  }

  // ── 3. Collaboration stats via referral_links ────────────────────────────
  const { data: linksData } = await admin
    .from('referral_links')
    .select('id,kol_user_id,project_id')
    .in('kol_user_id', userIds)

  const links = (linksData ?? []) as ReferralLinkRow[]
  const linkIds    = links.map((l) => l.id)
  const projectIds = [...new Set(links.map((l) => l.project_id).filter(Boolean))]

  // Fetch is_archived + merchant_user_id for each project
  const archivedByProjectId      = new Map<string, boolean>()
  const merchantUserByProjectId  = new Map<string, string>()
  if (projectIds.length > 0) {
    const { data: propsData } = await admin
      .from('projects')
      .select('id,is_archived,merchant_user_id')
      .in('id', projectIds)
    for (const row of (propsData ?? []) as PropertyRow[]) {
      archivedByProjectId.set(row.id, row.is_archived ?? false)
      if (row.merchant_user_id) merchantUserByProjectId.set(row.id, row.merchant_user_id)
    }
  }

  // Fetch merchant_type for each unique merchant_user_id
  const merchantTypeByUserId = new Map<string, string>()
  const uniqueMerchantUserIds = [...new Set(merchantUserByProjectId.values())]
  if (uniqueMerchantUserIds.length > 0) {
    const { data: mpData } = await admin
      .from('merchant_profiles')
      .select('user_id,merchant_type')
      .in('user_id', uniqueMerchantUserIds)
    for (const row of (mpData ?? []) as MerchantProfileRow[]) {
      if (row.merchant_type) merchantTypeByUserId.set(row.user_id, row.merchant_type)
    }
  }

  // Active + archived projects per KOL, split by merchant_type
  const activeProjectsPerKol    = new Map<string, number>()
  const archivedProjectsPerKol  = new Map<string, number>()
  const propertyProjectsPerKol  = new Map<string, number>()
  const shopProjectsPerKol      = new Map<string, number>()
  for (const link of links) {
    const isArchived    = archivedByProjectId.get(link.project_id) ?? false
    const merchantUid   = merchantUserByProjectId.get(link.project_id)
    const merchantType  = merchantUid ? (merchantTypeByUserId.get(merchantUid) ?? 'shop') : 'shop'
    if (isArchived) {
      archivedProjectsPerKol.set(link.kol_user_id, (archivedProjectsPerKol.get(link.kol_user_id) ?? 0) + 1)
    } else {
      activeProjectsPerKol.set(link.kol_user_id, (activeProjectsPerKol.get(link.kol_user_id) ?? 0) + 1)
    }
    if (merchantType === 'property') {
      propertyProjectsPerKol.set(link.kol_user_id, (propertyProjectsPerKol.get(link.kol_user_id) ?? 0) + 1)
    } else {
      shopProjectsPerKol.set(link.kol_user_id, (shopProjectsPerKol.get(link.kol_user_id) ?? 0) + 1)
    }
  }

  // Clicks per link
  const clicksPerLink = new Map<string, number>()
  if (linkIds.length > 0) {
    const { data: clicksData } = await admin
      .from('referral_clicks')
      .select('referral_link_id')
      .in('referral_link_id', linkIds)
    for (const row of (clicksData ?? []) as ClickRow[]) {
      clicksPerLink.set(row.referral_link_id, (clicksPerLink.get(row.referral_link_id) ?? 0) + 1)
    }
  }

  // Conversions per link
  const conversionsPerLink = new Map<string, number>()
  if (linkIds.length > 0) {
    const { data: convData } = await admin
      .from('referral_conversions')
      .select('referral_link_id')
      .in('referral_link_id', linkIds)
    for (const row of (convData ?? []) as ConversionRow[]) {
      conversionsPerLink.set(row.referral_link_id, (conversionsPerLink.get(row.referral_link_id) ?? 0) + 1)
    }
  }

  // Aggregate clicks + conversions per KOL
  const clicksPerKol      = new Map<string, number>()
  const conversionsPerKol = new Map<string, number>()
  for (const link of links) {
    const c = clicksPerLink.get(link.id) ?? 0
    const v = conversionsPerLink.get(link.id) ?? 0
    clicksPerKol.set(link.kol_user_id,      (clicksPerKol.get(link.kol_user_id) ?? 0) + c)
    conversionsPerKol.set(link.kol_user_id, (conversionsPerKol.get(link.kol_user_id) ?? 0) + v)
  }

  // ── 4. KOL usernames from auth metadata ─────────────────────────────────
  const userMetaResults = await Promise.all(
    kols.map((kol) =>
      admin.auth.admin.getUserById(kol.user_id).then((r) => {
        const meta = r.data?.user?.user_metadata ?? {}
        const resumeBio = (meta.kol_resume as Record<string, unknown> | undefined)?.bio
        return {
          userId:      kol.user_id,
          kolUsername: typeof meta.kol_username === 'string' ? meta.kol_username : null,
          resumeBio:   typeof resumeBio === 'string' && resumeBio.length > 0 ? resumeBio : null,
        }
      })
    ),
  )
  const usernameByUserId = new Map(userMetaResults.map((r) => [r.userId, r.kolUsername]))

  // ── 5. Hydrate ────────────────────────────────────────────────────────────
  const hydratedKols = kols.map((kol) => {
    const profilePhotoPath = typeof kol.profile_photo_path === 'string' ? kol.profile_photo_path : ''
    const userId = kol.user_id

    const chosenUsername = usernameByUserId.get(userId) ?? null
    const emailStr       = typeof kol.email === 'string' ? kol.email : ''
    const username       = chosenUsername ?? emailStr.split('@')[0].replace(/[^a-z0-9_]/gi, '_').toLowerCase()

    const savedResumeBio = typeof userMetaResults.find(r => r.userId === userId)?.resumeBio === 'string'
      ? userMetaResults.find(r => r.userId === userId)?.resumeBio as string
      : null
    const bio = savedResumeBio ?? (typeof kol.bio === 'string' ? kol.bio : null)

    const totalClicks      = clicksPerKol.get(userId) ?? 0
    const totalConversions = conversionsPerKol.get(userId) ?? 0

    return {
      id:              kol.id,
      user_id:         userId,
      email:           kol.email,
      full_name:       kol.full_name,
      username,
      platforms:       kol.platforms,
      platform_accounts: kol.platform_accounts,
      follower_range:  kol.follower_range,
      content_type:    kol.content_type,
      bio,
      city:            kol.city,
      profile_photo_url: profilePhotoPath ? (signedUrlByPath.get(profilePhotoPath) ?? '') : '',
      submitted_at:    kol.submitted_at,
      reviewed_at:     kol.reviewed_at,
      created_at:      kol.created_at,
      activeProjects:    activeProjectsPerKol.get(userId) ?? 0,
      archivedProjects:  archivedProjectsPerKol.get(userId) ?? 0,
      propertyProjects:  propertyProjectsPerKol.get(userId) ?? 0,
      shopProjects:      shopProjectsPerKol.get(userId) ?? 0,
      totalClicks,
      totalConversions,
    }
  })

  return NextResponse.json({ ok: true, kols: hydratedKols })
}
