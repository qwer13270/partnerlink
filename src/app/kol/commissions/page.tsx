import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import KolCommissionsClient from '@/components/kol/KolCommissionsClient'

export type CommissionEntry = {
  id: string
  date: string          // ISO string — deal_confirmed_at
  dealValueWan: number  // 萬
  commissionRate: number
  commissionWan: number // computed
}

export type CommissionGroup = {
  projectId: string
  projectName: string
  commissionRate: number
  entries: CommissionEntry[]
}

export default async function KolCommissionsPage() {
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

  // 1. Fetch this KOL's referral links (need project_id + collaboration_id)
  const { data: refLinks } = await admin
    .from('referral_links')
    .select('id, project_id, collaboration_id')
    .eq('kol_user_id', user.id)

  const links = refLinks ?? []
  if (links.length === 0) {
    return <KolCommissionsClient groups={[]} />
  }

  const linkIds       = links.map(l => l.id as string)
  const projectIds    = [...new Set(links.map(l => l.project_id as string))]
  const collabIds     = links.map(l => l.collaboration_id as string).filter(Boolean)

  // 2. Parallel: deal conversions + project names + collaborations (for commission rates)
  const [dealsR, projectsR, collabsR] = await Promise.all([
    admin
      .from('referral_conversions')
      .select('id, referral_link_id, deal_value, deal_confirmed_at, converted_at')
      .eq('conversion_type', 'deal')
      .in('referral_link_id', linkIds)
      .order('deal_confirmed_at', { ascending: false }),
    admin
      .from('properties')
      .select('id, name')
      .in('id', projectIds),
    collabIds.length > 0
      ? admin.from('collaborations').select('id, request_id').in('id', collabIds)
      : Promise.resolve({ data: [] }),
  ])

  // 3. Commission rates via collaborations → collaboration_requests
  const requestIds = ((collabsR.data ?? []) as { id: string; request_id: string }[])
    .map(c => c.request_id)
    .filter(Boolean)

  const { data: requestsData } = requestIds.length > 0
    ? await admin
        .from('collaboration_requests')
        .select('id, commission_rate')
        .in('id', requestIds)
    : { data: [] }

  // 4. Build lookup maps
  const projectById = new Map(
    (projectsR.data ?? []).map(p => [p.id as string, p.name as string]),
  )

  const requestById = new Map(
    (requestsData ?? []).map(r => [r.id as string, r.commission_rate as number | null]),
  )

  const collabById = new Map(
    ((collabsR.data ?? []) as { id: string; request_id: string }[]).map(c => [
      c.id,
      requestById.get(c.request_id) ?? null,
    ]),
  )

  // link_id → { projectId, commissionRate }
  const linkMeta = new Map(
    links.map(l => [
      l.id as string,
      {
        projectId:      l.project_id as string,
        commissionRate: collabById.get(l.collaboration_id as string) ?? null,
      },
    ]),
  )

  // 5. Group deals by project
  const groupMap = new Map<string, CommissionGroup>()

  for (const deal of dealsR.data ?? []) {
    const lid  = deal.referral_link_id as string
    const meta = linkMeta.get(lid)
    if (!meta) continue

    const rate     = meta.commissionRate
    if (rate === null) continue  // skip deals with no known rate

    const dealVal  = typeof deal.deal_value === 'number' ? deal.deal_value : 0
    const commWan  = parseFloat(((dealVal * rate) / 100).toFixed(2))
    const dateStr  = (deal.deal_confirmed_at ?? deal.converted_at) as string

    const entry: CommissionEntry = {
      id:             deal.id as string,
      date:           dateStr,
      dealValueWan:   dealVal,
      commissionRate: rate,
      commissionWan:  commWan,
    }

    const pid = meta.projectId
    if (!groupMap.has(pid)) {
      groupMap.set(pid, {
        projectId:      pid,
        projectName:    projectById.get(pid) ?? '未知案場',
        commissionRate: rate,
        entries:        [],
      })
    }
    groupMap.get(pid)!.entries.push(entry)
  }

  const groups = [...groupMap.values()]

  return <KolCommissionsClient groups={groups} />
}
