import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// ── PATCH /api/merchant/projects/:id/customers/mark-visited ──────────────────
// Marks a customer as having visited the property (sets visited_at).
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id: projectId } = await params

  const body = await request.json().catch(() => ({})) as {
    source?:      'attributed' | 'direct'
    customer_id?: string
  }

  const { source, customer_id } = body

  if (!source || (source !== 'attributed' && source !== 'direct'))
    return NextResponse.json({ error: 'source must be attributed or direct.' }, { status: 400 })
  if (!customer_id)
    return NextResponse.json({ error: 'customer_id is required.' }, { status: 400 })

  const admin = getSupabaseAdminClient()

  // Verify project belongs to this merchant (also get name for notification)
  const { data: project } = await admin
    .from('properties')
    .select('id, name')
    .eq('id', projectId)
    .eq('merchant_user_id', auth.user.id)
    .maybeSingle()

  if (!project)
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

  const projectName = project.name as string
  const now = new Date().toISOString()

  if (source === 'attributed') {
    const { data: conv } = await admin
      .from('referral_conversions')
      .select('id, referral_link_id, referral_links!inner(project_id, kol_user_id)')
      .eq('id', customer_id)
      .eq('referral_links.project_id', projectId)
      .maybeSingle()

    if (!conv)
      return NextResponse.json({ error: '找不到此詢問紀錄。' }, { status: 404 })

    const { error } = await admin
      .from('referral_conversions')
      .update({ visited_at: now })
      .eq('id', customer_id)

    if (error) return NextResponse.json({ error: '更新失敗。' }, { status: 500 })

    // Notify the KOL (best-effort)
    const refLink = conv.referral_links as unknown as { kol_user_id?: string } | null
    const kolUserId = refLink?.kol_user_id ?? null
    if (kolUserId) {
      await admin.from('notifications').insert({
        user_id: kolUserId,
        type:    'visited',
        title:   `「${projectName}」的客戶已看房，推廣效果顯現！`,
        href:    '/kol/links',
      })
    }
  } else {
    const { data: inquiry } = await admin
      .from('property_inquiries')
      .select('id')
      .eq('id', customer_id)
      .eq('property_id', projectId)
      .maybeSingle()

    if (!inquiry)
      return NextResponse.json({ error: '找不到此詢問紀錄。' }, { status: 404 })

    const { error } = await admin
      .from('property_inquiries')
      .update({ visited_at: now })
      .eq('id', customer_id)

    if (error) return NextResponse.json({ error: '更新失敗。' }, { status: 500 })
    // Direct inquiries have no KOL to notify
  }

  return NextResponse.json({ ok: true })
}
