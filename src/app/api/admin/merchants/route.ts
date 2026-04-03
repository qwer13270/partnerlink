import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  type ProfileRow = {
    id: string; user_id: string; company_name: string
    contact_name: string | null; phone: string | null; city: string | null
    status: string; created_at: string
  }
  type PropertyRow = {
    id: string; merchant_user_id: string; name: string; slug: string
    publish_status: string; is_archived: boolean; created_at: string
  }
  type ReferralLinkRow = { id: string; project_id: string }
  type ConversionRow   = { referral_link_id: string; deal_value: number | null }

  // ── 1. Profiles + all properties in parallel ─────────────────────────────
  const [{ data: profiles }, { data: allProps }] = await Promise.all([
    admin
      .from('merchant_profiles')
      .select('id,user_id,company_name,contact_name,phone,city,status,created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('properties')
      .select('id,merchant_user_id,name,slug,publish_status,is_archived,created_at')
      .order('created_at', { ascending: false }),
  ])

  const props = (allProps ?? []) as PropertyRow[]
  const propIds = props.map((p) => p.id)

  // ── 2. Referral links + deal conversions ─────────────────────────────────
  let linksByProjectId = new Map<string, string[]>()      // project_id → link ids
  let dealValueByLinkId = new Map<string, number>()       // link_id → total deal 萬

  if (propIds.length > 0) {
    const [{ data: linksData }, { data: convData }] = await Promise.all([
      admin
        .from('referral_links')
        .select('id,project_id')
        .in('project_id', propIds),
      admin
        .from('referral_conversions')
        .select('referral_link_id,deal_value')
        .eq('conversion_type', 'deal'),
    ])

    for (const l of (linksData ?? []) as ReferralLinkRow[]) {
      const arr = linksByProjectId.get(l.project_id) ?? []
      arr.push(l.id)
      linksByProjectId.set(l.project_id, arr)
    }

    for (const c of (convData ?? []) as ConversionRow[]) {
      if (c.deal_value == null) continue
      dealValueByLinkId.set(
        c.referral_link_id,
        (dealValueByLinkId.get(c.referral_link_id) ?? 0) + Number(c.deal_value),
      )
    }
  }

  // ── 3. Aggregate per merchant ─────────────────────────────────────────────
  const propsByMerchant = new Map<string, PropertyRow[]>()
  for (const p of props) {
    const arr = propsByMerchant.get(p.merchant_user_id) ?? []
    arr.push(p)
    propsByMerchant.set(p.merchant_user_id, arr)
  }

  function projectDealTotal(propId: string): number {
    let total = 0
    for (const linkId of linksByProjectId.get(propId) ?? []) {
      total += dealValueByLinkId.get(linkId) ?? 0
    }
    return total
  }

  function merchantDealTotal(merchantUserId: string): number {
    return (propsByMerchant.get(merchantUserId) ?? [])
      .reduce((sum, p) => sum + projectDealTotal(p.id), 0)
  }

  const merchants = ((profiles ?? []) as ProfileRow[]).map((m) => {
    const mProps = propsByMerchant.get(m.user_id) ?? []
    return {
      id:              m.id,
      userId:          m.user_id,
      companyName:     m.company_name,
      contactName:     m.contact_name,
      phone:           m.phone,
      city:            m.city,
      status:          m.status,
      createdAt:       m.created_at,
      activeProjects:  mProps.filter((p) => !p.is_archived).length,
      archivedProjects: mProps.filter((p) => p.is_archived).length,
      totalDealValue:  merchantDealTotal(m.user_id),
      projects:        mProps.map((p) => ({
        id:            p.id,
        name:          p.name,
        slug:          p.slug,
        publishStatus: p.publish_status,
        isArchived:    p.is_archived,
        createdAt:     p.created_at,
        dealValue:     projectDealTotal(p.id),
      })),
    }
  })

  return NextResponse.json({ ok: true, merchants })
}
