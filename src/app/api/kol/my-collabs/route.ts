import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// GET /api/kol/my-collabs
// Returns this KOL's accepted collaborations (merchant + project) for the
// search palette on /kol/*.
export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['kol'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  const { data: requests, error } = await admin
    .from('collaboration_requests')
    .select('id, project_id, merchant_user_id')
    .eq('kol_user_id', auth.user.id)
    .eq('status', 'accepted')

  if (error) {
    console.error('[api/kol/my-collabs] requests:', error.message)
    return NextResponse.json({ error: '讀取合作失敗。' }, { status: 500 })
  }

  const rows = requests ?? []
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, collabs: [] })
  }

  const requestIds      = rows.map((r) => r.id as string)
  const projectIds      = [...new Set(rows.map((r) => r.project_id as string))]
  const merchantUserIds = [...new Set(rows.map((r) => r.merchant_user_id as string))]

  const [{ data: projects }, { data: merchants }, { data: collaborations }] = await Promise.all([
    admin.from('projects')
      .select('id, name, type')
      .in('id', projectIds),
    admin.from('merchant_profiles')
      .select('user_id, company_name')
      .in('user_id', merchantUserIds),
    admin.from('collaborations')
      .select('id, request_id')
      .in('request_id', requestIds),
  ])

  const projectById         = new Map((projects ?? []).map((p) => [p.id as string, p]))
  const merchantByUserId    = new Map((merchants ?? []).map((m) => [m.user_id as string, m.company_name as string]))
  const collabIdByRequestId = new Map((collaborations ?? []).map((c) => [c.request_id as string, c.id as string]))

  const collabs = rows.map((r) => {
    const project = projectById.get(r.project_id as string) as
      | { id: string; name: string; type: string | null }
      | undefined
    const projectType = project?.type === 'property' || project?.type === 'shop' ? project.type : null
    return {
      request_id:            r.id as string,
      collaboration_id:      collabIdByRequestId.get(r.id as string) ?? null,
      project_name:          project?.name ?? null,
      project_type:          projectType,
      merchant_company_name: merchantByUserId.get(r.merchant_user_id as string) ?? null,
    }
  })

  return NextResponse.json({ ok: true, collabs })
}
