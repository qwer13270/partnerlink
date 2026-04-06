import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  const { data: properties } = await admin
    .from('projects')
    .select('id,name,district_label,publish_status,merchant_user_id,created_at')
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  if (!properties || properties.length === 0) {
    return NextResponse.json({ ok: true, projects: [] })
  }

  type PropertyRow = {
    id: string; name: string; district_label: string | null
    publish_status: string; merchant_user_id: string; created_at: string
  }

  const rows = properties as PropertyRow[]
  const merchantUserIds = [...new Set(rows.map(p => p.merchant_user_id))]
  const projectIds = rows.map(p => p.id)

  const [{ data: merchantProfiles }, { data: refLinks }] = await Promise.all([
    admin.from('merchant_profiles').select('user_id,company_name').in('user_id', merchantUserIds),
    admin.from('referral_links').select('project_id,kol_user_id').in('project_id', projectIds),
  ])

  const merchantMap: Record<string, string> = {}
  for (const m of (merchantProfiles ?? []) as Array<{ user_id: string; company_name: string }>) {
    merchantMap[m.user_id] = m.company_name
  }

  const kolsByProject: Record<string, Set<string>> = {}
  for (const link of (refLinks ?? []) as Array<{ project_id: string; kol_user_id: string | null }>) {
    if (!kolsByProject[link.project_id]) kolsByProject[link.project_id] = new Set()
    if (link.kol_user_id) kolsByProject[link.project_id].add(link.kol_user_id)
  }

  const projects = rows.map(p => ({
    id:            p.id,
    name:          p.name,
    districtLabel: p.district_label,
    publishStatus: p.publish_status,
    merchantName:  merchantMap[p.merchant_user_id] ?? '—',
    kolCount:      kolsByProject[p.id]?.size ?? 0,
    createdAt:     p.created_at,
  }))

  return NextResponse.json({ ok: true, projects })
}
