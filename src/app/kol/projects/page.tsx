import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import KolProjectsClient from '@/components/kol/KolProjectsClient'

export type CollabSummary = {
  collaboration_id:   string
  project_id:         string
  project_name:       string
  project_type:       '建案' | '商案'
  collab_description: string | null
  collaboration_type: 'commission' | 'reciprocal' | 'sponsored'
  collab_status:      'active' | 'ended'
  commission_rate:    number | null
  sponsorship_bonus:  number | null
  referral_short_code: string | null
  referral_active:    boolean
  clicks:             number
  items_count:        number
  shipment_received:  boolean
  created_at:         string
}

export default async function KolProjectsPage() {
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

  // 1. Fetch all collaborations for this KOL
  const { data: collabs } = await admin
    .from('collaborations')
    .select('id, project_id, status, collaboration_type, sponsorship_bonus, request_id, created_at')
    .eq('kol_user_id', user.id)
    .order('created_at', { ascending: false })

  const rows = collabs ?? []
  if (rows.length === 0) {
    return <KolProjectsClient collaborations={[]} />
  }

  const collabIds  = rows.map(c => c.id as string)
  const projectIds = [...new Set(rows.map(c => c.project_id as string))]
  const requestIds = rows.map(c => c.request_id as string).filter(Boolean)

  // 2. Parallel enrichment
  const [projectsR, requestsR, linksR, itemsR, shipmentsR] = await Promise.all([
    admin.from('projects')
      .select('id, name, type, collab_description')
      .in('id', projectIds),
    requestIds.length > 0
      ? admin.from('collaboration_requests')
          .select('id, commission_rate')
          .in('id', requestIds)
      : Promise.resolve({ data: [] }),
    admin.from('referral_links')
      .select('collaboration_id, short_code, is_active')
      .in('collaboration_id', collabIds),
    admin.from('mutual_benefit_items')
      .select('collaboration_request_id')
      .in('collaboration_request_id', requestIds),
    admin.from('mutual_benefit_shipments')
      .select('collaboration_id, received_at')
      .in('collaboration_id', collabIds),
  ])

  // 3. Click counts for referral links
  const linkIds = (linksR.data ?? []).map(l => l.collaboration_id as string)
  const linkShortCodes = new Map(
    (linksR.data ?? []).map(l => [l.collaboration_id as string, {
      short_code: l.short_code as string,
      is_active:  l.is_active as boolean,
    }])
  )

  const allLinkIds = (linksR.data ?? []).map(l => {
    // We need the referral_link.id for click lookups — fetch separately
    return l.collaboration_id as string
  })
  void allLinkIds // used below via separate query

  // Fetch actual referral_link IDs for click count lookup
  const { data: rlRows } = await admin
    .from('referral_links')
    .select('id, collaboration_id')
    .in('collaboration_id', collabIds)

  const rlIdByCollabId = new Map(
    (rlRows ?? []).map(r => [r.collaboration_id as string, r.id as string])
  )
  const rlIds = [...rlIdByCollabId.values()]

  const { data: clickRows } = rlIds.length > 0
    ? await admin.from('referral_clicks').select('referral_link_id').in('referral_link_id', rlIds)
    : { data: [] }

  const clicksByRlId = new Map<string, number>()
  for (const row of clickRows ?? []) {
    const id = row.referral_link_id as string
    clicksByRlId.set(id, (clicksByRlId.get(id) ?? 0) + 1)
  }

  // 4. Build lookup maps
  const projectById = new Map(
    (projectsR.data ?? []).map(p => [p.id as string, p])
  )
  const commRateByRequestId = new Map(
    (requestsR.data ?? []).map(r => [r.id as string, r.commission_rate as number | null])
  )
  const itemsCountByRequestId = new Map<string, number>()
  for (const item of itemsR.data ?? []) {
    const rid = item.collaboration_request_id as string
    itemsCountByRequestId.set(rid, (itemsCountByRequestId.get(rid) ?? 0) + 1)
  }
  const shipmentByCollabId = new Map(
    (shipmentsR.data ?? []).map(s => [s.collaboration_id as string, s.received_at as string | null])
  )

  // 5. Assemble
  const collaborations: CollabSummary[] = rows.map(c => {
    const project  = projectById.get(c.project_id as string)
    const rlId     = rlIdByCollabId.get(c.id as string)
    const link     = linkShortCodes.get(c.id as string)

    return {
      collaboration_id:    c.id as string,
      project_id:          c.project_id as string,
      project_name:        project?.name ?? '未知商案',
      project_type:        (project?.type ?? '建案') as '建案' | '商案',
      collab_description:  project?.collab_description ?? null,
      collaboration_type:  c.collaboration_type as 'commission' | 'reciprocal' | 'sponsored',
      collab_status:       c.status as 'active' | 'ended',
      commission_rate:     commRateByRequestId.get(c.request_id as string) ?? null,
      sponsorship_bonus:   c.sponsorship_bonus as number | null,
      referral_short_code: link?.short_code ?? null,
      referral_active:     link?.is_active ?? false,
      clicks:              rlId ? (clicksByRlId.get(rlId) ?? 0) : 0,
      items_count:         itemsCountByRequestId.get(c.request_id as string) ?? 0,
      shipment_received:   !!(shipmentByCollabId.get(c.id as string)),
      created_at:          c.created_at as string,
    }
  })

  return <KolProjectsClient collaborations={collaborations} />
}
