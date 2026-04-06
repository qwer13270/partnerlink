import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import CustomersClient from './CustomersClient'

export type Customer = {
  id: string
  source: 'attributed' | 'direct'
  name: string | null
  phone: string | null
  email: string | null
  message: string | null
  submittedAt: string
  kolName: string | null
  kolUserId: string | null
  referralLinkId: string | null
  visitedAt: string | null
  dealValue: number | null
  dealConfirmedAt: string | null
}

export type ActiveKol = {
  kolUserId: string
  kolName: string
  referralLinkId: string
}

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params
  const cookieStore = await cookies()

  // Auth check
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions)
          )
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = getSupabaseAdminClient()

  // Verify project belongs to this merchant
  const { data: project } = await admin
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .eq('merchant_user_id', user.id)
    .maybeSingle()

  if (!project) redirect('/merchant/projects')

  // ── Fetch all referral links for this project (active + inactive) ─────────
  // Done first so we can filter conversions by link ID — avoids relying on
  // Supabase embedded-join format which can silently return null for kol_user_id.
  const { data: allRefLinks } = await admin
    .from('referral_links')
    .select('id, kol_user_id, is_active')
    .eq('project_id', projectId)

  const allRefLinksList = allRefLinks ?? []
  const linkIds = allRefLinksList.map((l) => l.id as string)

  // Map: referral_link_id → kol_user_id
  const linkKolMap: Record<string, string> = {}
  for (const l of allRefLinksList) {
    if (l.id && l.kol_user_id) linkKolMap[l.id as string] = l.kol_user_id as string
  }

  // ── Fetch all KOL names for this project's links in one query ─────────────
  const allKolUserIds = [...new Set(allRefLinksList.map((l) => l.kol_user_id as string).filter(Boolean))]
  type KolApplication = { user_id: string; full_name: string }
  const kolMap: Record<string, string> = {}
  if (allKolUserIds.length > 0) {
    const { data: kolApps } = await admin
      .from('kol_applications')
      .select('user_id, full_name')
      .in('user_id', allKolUserIds)
    for (const kol of (kolApps as KolApplication[] | null) ?? []) {
      kolMap[kol.user_id] = kol.full_name
    }
  }

  // ── Fetch attributed inquiries via link IDs (no embedded join) ─────────────
  type ConvRow = {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    message: string | null
    visited_at: string | null
    deal_value: number | null
    deal_confirmed_at: string | null
    converted_at: string
    referral_link_id: string
  }
  let convRows: ConvRow[] = []
  if (linkIds.length > 0) {
    const { data } = await admin
      .from('referral_conversions')
      .select('id, name, phone, email, message, visited_at, deal_value, deal_confirmed_at, converted_at, referral_link_id')
      .eq('conversion_type', 'inquiry')
      .in('referral_link_id', linkIds)
      .order('converted_at', { ascending: false })
    convRows = (data as ConvRow[] | null) ?? []
  }

  // ── Fetch direct inquiries ────────────────────────────────────────────────
  const { data: directRows } = await admin
    .from('property_inquiries')
    .select('id, name, phone, email, message, submitted_at, visited_at, deal_value, deal_confirmed_at')
    .eq('property_id', projectId)
    .order('submitted_at', { ascending: false })

  // ── Active KOLs for manual credit picker ──────────────────────────────────
  const activeRefLinks = allRefLinksList.filter((l) => l.is_active)
  const activeKols: ActiveKol[] = activeRefLinks.map((link) => ({
    kolUserId:      link.kol_user_id as string,
    kolName:        kolMap[link.kol_user_id as string] ?? '未知 KOL',
    referralLinkId: link.id as string,
  }))

  // ── Build unified customer list ───────────────────────────────────────────
  const attributed: Customer[] = convRows.map((r) => {
    const kolUserId = linkKolMap[r.referral_link_id] ?? null
    return {
      id:              r.id,
      source:          'attributed',
      name:            r.name,
      phone:           r.phone,
      email:           r.email,
      message:         r.message,
      submittedAt:     r.converted_at,
      kolName:         kolUserId ? (kolMap[kolUserId] ?? null) : null,
      kolUserId,
      referralLinkId:  r.referral_link_id,
      visitedAt:       r.visited_at,
      dealValue:       r.deal_value,
      dealConfirmedAt: r.deal_confirmed_at,
    }
  })

  type DirectRow = {
    id: string
    name: string | null
    phone: string | null
    email: string | null
    message: string | null
    submitted_at: string
    visited_at: string | null
    deal_value: number | null
    deal_confirmed_at: string | null
  }

  const direct: Customer[] = (directRows as DirectRow[] | null ?? []).map((r) => ({
    id:              r.id,
    source:          'direct',
    name:            r.name,
    phone:           r.phone,
    email:           r.email,
    message:         r.message,
    submittedAt:     r.submitted_at,
    kolName:         null,
    kolUserId:       null,
    referralLinkId:  null,
    visitedAt:       r.visited_at,
    dealValue:       r.deal_value,
    dealConfirmedAt: r.deal_confirmed_at,
  }))

  // Sort unified list by submittedAt desc
  const customers: Customer[] = [...attributed, ...direct].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )

  return (
    <CustomersClient
      projectId={projectId}
      projectName={project.name as string}
      customers={customers}
      activeKols={activeKols}
    />
  )
}
