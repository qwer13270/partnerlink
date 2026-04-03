import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import MerchantHomeClient from '@/components/merchant/MerchantHomeClient'

export type RecentCustomer = {
  id: string
  name: string | null
  projectName: string
  kolName: string | null
  submittedAt: string
  status: 'inquiry' | 'visited' | 'deal'
}

export type PendingRequest = {
  id: string
  kolName: string | null
  projectId: string
  projectName: string | null
  commissionRate: number | null
  createdAt: string
}

export type MerchantStats = {
  projectCount: number
  activeKolCount: number
  monthVisits: number
  monthDeals: number
}

export type MerchantHomeData = {
  merchantName: string
  stats: MerchantStats
  recentCustomers: RecentCustomer[]
  pendingRequests: PendingRequest[]
}

export default async function MerchantHomePage() {
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
  if (!user) redirect('/auth/login')

  const admin = getSupabaseAdminClient()

  // ── Merchant profile + projects (parallel) ────────────────────────────────
  const [{ data: profile }, { data: projects }] = await Promise.all([
    admin.from('merchant_profiles').select('company_name').eq('user_id', user.id).maybeSingle(),
    admin.from('properties').select('id, name').eq('merchant_user_id', user.id).eq('is_archived', false),
  ])

  const merchantName = (profile?.company_name as string | null) ?? '商家夥伴'
  const projectList  = projects ?? []
  const projectIds   = projectList.map(p => p.id as string)
  const projectNameById = new Map(projectList.map(p => [p.id as string, p.name as string]))

  if (projectIds.length === 0) {
    return (
      <MerchantHomeClient
        data={{
          merchantName,
          stats: { projectCount: 0, activeKolCount: 0, monthVisits: 0, monthDeals: 0 },
          recentCustomers: [],
          pendingRequests: [],
        }}
      />
    )
  }

  const monthStart = new Date(
    new Date().getFullYear(), new Date().getMonth(), 1,
  ).toISOString()

  // ── Referral links + pending requests (parallel) ──────────────────────────
  const [{ data: refLinks }, { data: pendingReqs }] = await Promise.all([
    admin.from('referral_links').select('id, kol_user_id, is_active').in('project_id', projectIds),
    admin
      .from('collaboration_requests')
      .select('id, kol_user_id, project_id, commission_rate, created_at')
      .eq('merchant_user_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const allLinks    = refLinks ?? []
  const linkIds     = allLinks.map(l => l.id as string)
  const activeKolIds = [...new Set(
    allLinks.filter(l => l.is_active).map(l => l.kol_user_id as string).filter(Boolean),
  )]

  // link_id → kol_user_id
  const linkKolMap = new Map(
    allLinks.map(l => [l.id as string, l.kol_user_id as string | null]),
  )

  // ── Conversions + inquiries + KOL names (parallel) ────────────────────────
  const kolUserIds = [
    ...new Set([
      ...activeKolIds,
      ...((pendingReqs ?? []).map(r => r.kol_user_id as string).filter(Boolean)),
    ]),
  ]

  const [convR, inquiryR, kolR] = await Promise.all([
    linkIds.length > 0
      ? admin
          .from('referral_conversions')
          .select('id, referral_link_id, name, conversion_type, visited_at, deal_value, deal_confirmed_at, converted_at')
          .in('referral_link_id', linkIds)
          .order('converted_at', { ascending: false })
      : Promise.resolve({ data: [] }),
    admin
      .from('property_inquiries')
      .select('id, property_id, name, submitted_at, visited_at, deal_confirmed_at')
      .in('property_id', projectIds)
      .order('submitted_at', { ascending: false }),
    kolUserIds.length > 0
      ? admin
          .from('kol_applications')
          .select('user_id, full_name')
          .in('user_id', kolUserIds)
      : Promise.resolve({ data: [] }),
  ])

  const kolNameById = new Map(
    ((kolR.data ?? []) as { user_id: string; full_name: string }[]).map(k => [
      k.user_id, k.full_name,
    ]),
  )

  // ── Compute stats ─────────────────────────────────────────────────────────
  const allConvs = (convR.data ?? []) as {
    id: string; referral_link_id: string; name: string | null
    conversion_type: string; visited_at: string | null
    deal_value: number | null; deal_confirmed_at: string | null; converted_at: string
  }[]

  const allInquiries = (inquiryR.data ?? []) as {
    id: string; property_id: string; name: string | null
    submitted_at: string; visited_at: string | null; deal_confirmed_at: string | null
  }[]

  const monthDeals = allConvs.filter(
    r => r.conversion_type === 'deal' && r.converted_at >= monthStart,
  ).length

  const monthVisitsConv = allConvs.filter(
    r => r.conversion_type === 'inquiry' && r.visited_at && r.visited_at >= monthStart,
  ).length

  const monthVisitsDirect = allInquiries.filter(
    r => r.visited_at && r.visited_at >= monthStart,
  ).length

  const stats: MerchantStats = {
    projectCount:   projectIds.length,
    activeKolCount: activeKolIds.length,
    monthVisits:    monthVisitsConv + monthVisitsDirect,
    monthDeals,
  }

  // ── Recent customers (attributed + direct, merged, top 5) ─────────────────
  const attributedRecent: RecentCustomer[] = allConvs
    .filter(r => r.conversion_type === 'inquiry')
    .map(r => {
      const kolUserId = linkKolMap.get(r.referral_link_id) ?? null
      // find project for this link
      const link = allLinks.find(l => l.id === r.referral_link_id)
      const projectId = link ? (link as unknown as { project_id?: string }).project_id : null
      return {
        id:          r.id,
        name:        r.name,
        projectName: (projectId ? projectNameById.get(projectId as string) : null) ?? '未知案場',
        kolName:     kolUserId ? (kolNameById.get(kolUserId) ?? null) : null,
        submittedAt: r.converted_at,
        status:      r.deal_confirmed_at ? 'deal' : r.visited_at ? 'visited' : 'inquiry',
      } as RecentCustomer
    })

  const directRecent: RecentCustomer[] = allInquiries.map(r => ({
    id:          r.id,
    name:        r.name,
    projectName: projectNameById.get(r.property_id) ?? '未知案場',
    kolName:     null,
    submittedAt: r.submitted_at,
    status:      r.deal_confirmed_at ? 'deal' : r.visited_at ? 'visited' : 'inquiry',
  }))

  const recentCustomers = [...attributedRecent, ...directRecent]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    .slice(0, 5)

  // ── Pending collaboration requests ────────────────────────────────────────
  const pendingRequests: PendingRequest[] = (pendingReqs ?? []).map(r => ({
    id:             r.id as string,
    kolName:        kolNameById.get(r.kol_user_id as string) ?? null,
    projectId:      r.project_id as string,
    projectName:    projectNameById.get(r.project_id as string) ?? null,
    commissionRate: typeof r.commission_rate === 'number' ? r.commission_rate : null,
    createdAt:      r.created_at as string,
  }))

  return (
    <MerchantHomeClient
      data={{ merchantName, stats, recentCustomers, pendingRequests }}
    />
  )
}
