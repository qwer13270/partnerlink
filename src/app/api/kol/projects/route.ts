import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// GET /api/kol/projects
// Returns all published merchant properties for the KOL marketplace.
export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol', 'admin'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  const { data, error } = await admin
    .from('projects')
    .select('id, merchant_user_id, name, subtitle, district_label, slug, created_at')
    .eq('publish_status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[api/kol/projects] fetch error:', error.message)
    return NextResponse.json({ error: '讀取商案失敗。' }, { status: 500 })
  }

  const rows = data ?? []
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, projects: [] })
  }

  // Enrich with merchant company name
  const merchantUserIds = [...new Set(rows.map((r) => r.merchant_user_id as string))]
  const { data: merchants } = await admin
    .from('merchant_profiles')
    .select('user_id, company_name')
    .in('user_id', merchantUserIds)

  const companyByUserId = new Map(
    (merchants ?? []).map((m) => [m.user_id as string, m.company_name as string]),
  )

  const projects = rows.map((r) => ({
    id:               r.id,
    merchant_user_id: r.merchant_user_id,
    name:             r.name,
    subtitle:         r.subtitle ?? null,
    district_label:   r.district_label ?? null,
    slug:             r.slug,
    company_name:     companyByUserId.get(r.merchant_user_id as string) ?? null,
  }))

  return NextResponse.json({ ok: true, projects })
}
