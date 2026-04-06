import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// ── PATCH /api/merchant/projects/:id/customers/confirm-deal ──────────────────
// Merchant confirms a deal for a customer (attributed or direct inquiry).
//
// For attributed inquiries (source='attributed'):
//   UPDATE referral_conversions SET deal_value, deal_confirmed_at WHERE id=customer_id
//
// For direct inquiries (source='direct'):
//   UPDATE property_inquiries SET deal_value, deal_confirmed_at, kol_credit_user_id
//   If kol_user_id provided → also INSERT referral_conversions with type='deal'
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id: projectId } = await params

  const body = await request.json().catch(() => ({})) as {
    source?:       'attributed' | 'direct'
    customer_id?:  string
    deal_value?:   number
    kol_user_id?:  string  // optional, for direct inquiries
  }

  const { source, customer_id, deal_value, kol_user_id } = body

  if (!source || (source !== 'attributed' && source !== 'direct'))
    return NextResponse.json({ error: 'source must be attributed or direct.' }, { status: 400 })
  if (!customer_id)
    return NextResponse.json({ error: 'customer_id is required.' }, { status: 400 })
  if (typeof deal_value !== 'number' || deal_value <= 0)
    return NextResponse.json({ error: 'deal_value must be > 0.' }, { status: 400 })

  const admin = getSupabaseAdminClient()

  // Verify project belongs to this merchant (also get name for notification)
  const { data: project } = await admin
    .from('projects')
    .select('id, name')
    .eq('id', projectId)
    .eq('merchant_user_id', auth.user.id)
    .maybeSingle()

  if (!project)
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })

  const now = new Date().toISOString()
  const projectName = project.name as string

  if (source === 'attributed') {
    // Verify the conversion belongs to this project and get its referral_link_id
    const { data: conv } = await admin
      .from('referral_conversions')
      .select('id, referral_link_id, referral_links!inner(project_id, kol_user_id)')
      .eq('id', customer_id)
      .eq('referral_links.project_id', projectId)
      .maybeSingle()

    if (!conv)
      return NextResponse.json({ error: '找不到此詢問紀錄。' }, { status: 404 })

    // Mark the inquiry row as a confirmed deal
    const { error } = await admin
      .from('referral_conversions')
      .update({ deal_value, deal_confirmed_at: now })
      .eq('id', customer_id)

    if (error) {
      console.error('[confirm-deal] attributed update error:', error.message)
      return NextResponse.json({ error: '更新失敗，請稍後再試。' }, { status: 500 })
    }

    // Insert a separate 'deal' conversion row so KOL /links page deal counter increments
    await admin.from('referral_conversions').insert({
      referral_link_id:  conv.referral_link_id,
      conversion_type:   'deal',
      deal_value,
      deal_confirmed_at: now,
    })

    // Notify the KOL (best-effort)
    const refLink = conv.referral_links as unknown as { kol_user_id?: string } | null
    const kolUserId = refLink?.kol_user_id ?? null
    if (kolUserId) {
      await admin.from('notifications').insert({
        user_id: kolUserId,
        type:    'deal',
        title:   `恭喜！「${projectName}」的客戶已成交，你即將獲得佣金`,
        href:    '/kol/projects',
      })
    }
  } else {
    // Direct inquiry — verify it belongs to this project
    const { data: inquiry } = await admin
      .from('property_inquiries')
      .select('id')
      .eq('id', customer_id)
      .eq('property_id', projectId)
      .maybeSingle()

    if (!inquiry)
      return NextResponse.json({ error: '找不到此詢問紀錄。' }, { status: 404 })

    const { error: updateError } = await admin
      .from('property_inquiries')
      .update({
        deal_value,
        deal_confirmed_at:  now,
        kol_credit_user_id: kol_user_id ?? null,
      })
      .eq('id', customer_id)

    if (updateError) {
      console.error('[confirm-deal] direct update error:', updateError.message)
      return NextResponse.json({ error: '更新失敗，請稍後再試。' }, { status: 500 })
    }

    // If merchant selected a KOL to credit, find their referral link and log a deal conversion
    if (kol_user_id) {
      const { data: refLink } = await admin
        .from('referral_links')
        .select('id')
        .eq('project_id', projectId)
        .eq('kol_user_id', kol_user_id)
        .maybeSingle()

      if (refLink) {
        await admin.from('referral_conversions').insert({
          referral_link_id: refLink.id,
          conversion_type:  'deal',
          deal_value,
          deal_confirmed_at: now,
        })
        // Notify the credited KOL
        await admin.from('notifications').insert({
          user_id: kol_user_id,
          type:    'deal',
          title:   `恭喜！「${projectName}」的客戶已成交，你即將獲得佣金`,
          href:    '/kol/projects',
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
