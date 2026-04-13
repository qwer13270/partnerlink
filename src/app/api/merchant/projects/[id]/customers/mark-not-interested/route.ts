import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// ── PATCH /api/merchant/projects/:id/customers/mark-not-interested ───────────
// Marks a customer as not_interested, saving their current status so it can
// be restored exactly on revert.
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
    revert?:      boolean
  }

  const { source, customer_id, revert = false } = body

  if (!source || (source !== 'attributed' && source !== 'direct'))
    return NextResponse.json({ error: 'source must be attributed or direct.' }, { status: 400 })
  if (!customer_id)
    return NextResponse.json({ error: 'customer_id is required.' }, { status: 400 })

  const admin = getSupabaseAdminClient()

  const { data: project } = await admin
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('merchant_user_id', auth.user.id)
    .maybeSingle()

  if (!project)
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

  if (source === 'attributed') {
    const { data: conv } = await admin
      .from('referral_conversions')
      .select('id, status, previous_status, referral_links!inner(project_id)')
      .eq('id', customer_id)
      .eq('referral_links.project_id', projectId)
      .maybeSingle()

    if (!conv)
      return NextResponse.json({ error: '找不到此詢問紀錄。' }, { status: 404 })

    const update = revert
      ? { status: (conv.previous_status ?? 'inquiring') as string, previous_status: null }
      : { status: 'not_interested', previous_status: conv.status as string }

    const { error } = await admin
      .from('referral_conversions')
      .update(update)
      .eq('id', customer_id)

    if (error) {
      console.error('[mark-not-interested] attributed update:', error.message)
      return NextResponse.json({ error: '更新失敗。' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, restoredStatus: revert ? (conv.previous_status ?? 'inquiring') : null })
  } else {
    const { data: inquiry } = await admin
      .from('property_inquiries')
      .select('id, status, previous_status')
      .eq('id', customer_id)
      .eq('property_id', projectId)
      .maybeSingle()

    if (!inquiry)
      return NextResponse.json({ error: '找不到此詢問紀錄。' }, { status: 404 })

    const update = revert
      ? { status: (inquiry.previous_status ?? 'inquiring') as string, previous_status: null }
      : { status: 'not_interested', previous_status: inquiry.status as string }

    const { error } = await admin
      .from('property_inquiries')
      .update(update)
      .eq('id', customer_id)

    if (error) {
      console.error('[mark-not-interested] direct update:', error.message)
      return NextResponse.json({ error: '更新失敗。' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, restoredStatus: revert ? (inquiry.previous_status ?? 'inquiring') : null })
  }
}
