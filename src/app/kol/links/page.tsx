import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import KolLinksClient from '@/components/kol/KolLinksClient'

export type ReferralLinkItem = {
  id:              string
  short_code:      string
  is_active:       boolean
  created_at:      string
  project_name:    string | null
  project_slug:    string | null
  commission_rate: number | null
  clicks:          number
  inquiries:       number
  visits:          number
  deals:           number
}

export default async function MyPromoPage() {
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
  if (!user) redirect('/login')

  const role = getRoleFromUser(user)
  if (role !== 'kol') redirect(role ? resolveRoleHomePath(role) : '/login')

  const admin = getSupabaseAdminClient()

  // 1. Fetch this KOL's referral links (exclude archived projects)
  const { data: rawLinks } = await admin
    .from('referral_links')
    .select('id, short_code, is_active, project_id, collaboration_id, created_at, properties!inner(is_archived)')
    .eq('kol_user_id', user.id)
    .eq('properties.is_archived', false)
    .order('created_at', { ascending: false })

  const links = rawLinks ?? []

  if (links.length === 0) {
    return <KolLinksClient links={[]} />
  }

  const linkIds    = links.map(l => l.id as string)
  const projectIds = [...new Set(links.map(l => l.project_id as string))]
  const collabIds  = links.map(l => l.collaboration_id as string)

  // 2. Parallel enrichment: projects + collaborations + clicks + conversions
  const [projectsR, collabsR, clicksR, conversionsR] = await Promise.all([
    admin.from('properties').select('id, name, slug').in('id', projectIds),
    admin.from('collaborations').select('id, request_id').in('id', collabIds),
    admin.from('referral_clicks')
      .select('referral_link_id')
      .in('referral_link_id', linkIds),
    admin.from('referral_conversions')
      .select('referral_link_id, conversion_type, visited_at')
      .in('referral_link_id', linkIds),
  ])

  // 3. Commission rates: collaborations → collaboration_requests
  const requestIds = (collabsR.data ?? [])
    .map(c => c.request_id as string)
    .filter(Boolean)

  const { data: requestsData } = requestIds.length > 0
    ? await admin
        .from('collaboration_requests')
        .select('id, commission_rate')
        .in('id', requestIds)
    : { data: [] }

  // 4. Build lookup maps
  const projectById = new Map(
    (projectsR.data ?? []).map(p => [p.id as string, { name: p.name as string, slug: p.slug as string }]),
  )

  // collab_id → commission_rate
  const requestById = new Map(
    (requestsData ?? []).map(r => [r.id as string, r.commission_rate as number | null]),
  )
  const commissionByCollabId = new Map(
    (collabsR.data ?? []).map(c => [
      c.id as string,
      requestById.get(c.request_id as string) ?? null,
    ]),
  )

  // click counts per link
  const clicksByLink = new Map<string, number>()
  for (const row of clicksR.data ?? []) {
    const lid = row.referral_link_id as string
    clicksByLink.set(lid, (clicksByLink.get(lid) ?? 0) + 1)
  }

  // inquiry, visit + deal counts per link
  const inquiriesByLink = new Map<string, number>()
  const visitsByLink    = new Map<string, number>()
  const dealsByLink     = new Map<string, number>()
  for (const row of conversionsR.data ?? []) {
    const lid = row.referral_link_id as string
    if (row.conversion_type === 'inquiry') {
      inquiriesByLink.set(lid, (inquiriesByLink.get(lid) ?? 0) + 1)
      if (row.visited_at) visitsByLink.set(lid, (visitsByLink.get(lid) ?? 0) + 1)
    } else if (row.conversion_type === 'deal') {
      dealsByLink.set(lid, (dealsByLink.get(lid) ?? 0) + 1)
    }
  }

  // 5. Build enriched list
  const enrichedLinks: ReferralLinkItem[] = links.map(l => ({
    id:              l.id as string,
    short_code:      l.short_code as string,
    is_active:       l.is_active as boolean,
    created_at:      l.created_at as string,
    project_name:    projectById.get(l.project_id as string)?.name ?? null,
    project_slug:    projectById.get(l.project_id as string)?.slug ?? null,
    commission_rate: commissionByCollabId.get(l.collaboration_id as string) ?? null,
    clicks:          clicksByLink.get(l.id as string) ?? 0,
    inquiries:       inquiriesByLink.get(l.id as string) ?? 0,
    visits:          visitsByLink.get(l.id as string) ?? 0,
    deals:           dealsByLink.get(l.id as string) ?? 0,
  }))

  return <KolLinksClient links={enrichedLinks} />
}
