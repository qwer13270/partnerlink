import { type NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const REF_COOKIE = 'hk_ref'

// ── POST /api/inquiries ───────────────────────────────────────────────────────
// Public endpoint — no auth required.
// 1. Validates and stores the inquiry in property_inquiries.
// 2. If the visitor arrived via a referral link (hk_ref cookie present),
//    logs a conversion in referral_conversions.
// 3. Inserts notifications for the KOL (if attributed) and merchant.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as {
    property_slug?: string
    name?:          string
    phone?:         string
    email?:         string
    message?:       string
  }

  const name         = typeof body.name          === 'string' ? body.name.trim()         : ''
  const propertySlug = typeof body.property_slug === 'string' ? body.property_slug.trim() : ''
  const phone        = typeof body.phone         === 'string' ? body.phone.trim()   || null : null
  const email        = typeof body.email         === 'string' ? body.email.trim()   || null : null
  const message      = typeof body.message       === 'string' ? body.message.trim() || null : null

  if (!name) {
    return NextResponse.json({ error: '姓名為必填欄位' }, { status: 400 })
  }

  const admin = getSupabaseAdminClient()

  // ── 1. Resolve property ──────────────────────────────────────────────────────
  let propertyId:       string | null = null
  let merchantUserId:   string | null = null
  let projectName:      string | null = null

  if (propertySlug) {
    const { data: property } = await admin
      .from('properties')
      .select('id, name, merchant_user_id')
      .eq('slug', propertySlug)
      .maybeSingle()
    propertyId     = (property?.id as string)               ?? null
    merchantUserId = (property?.merchant_user_id as string) ?? null
    projectName    = (property?.name as string)             ?? null
  }

  // ── 2. Referral attribution ──────────────────────────────────────────────────
  const refCode = request.cookies.get(REF_COOKIE)?.value ?? null
  let attributed  = false
  let kolUserId:  string | null = null
  let refLinkId:  string | null = null

  if (refCode && propertyId) {
    const { data: refLink } = await admin
      .from('referral_links')
      .select('id, is_active, kol_user_id')
      .eq('short_code', refCode)
      .eq('project_id', propertyId)
      .maybeSingle()

    if (refLink?.is_active) {
      kolUserId  = (refLink.kol_user_id as string) ?? null
      refLinkId  = refLink.id as string
      await admin.from('referral_conversions').insert({
        referral_link_id: refLinkId,
        conversion_type:  'inquiry',
        name,
        phone,
        email,
        message,
      })
      attributed = true
    }
  }

  // ── 3. Store as direct inquiry when not attributed ───────────────────────────
  if (!attributed) {
    await admin.from('property_inquiries').insert({
      property_id: propertyId,
      name,
      phone,
      email,
      message,
    })
  }

  // ── 4. Notifications (best-effort, non-blocking) ─────────────────────────────
  const notifInserts: { user_id: string; type: string; title: string; href: string }[] = []

  if (projectName) {
    // KOL notification (attributed only)
    if (attributed && kolUserId) {
      notifInserts.push({
        user_id: kolUserId,
        type:    'new_inquiry',
        title:   `「${projectName}」有新客戶透過你的推廣連結送出詢問`,
        href:    '/kol/links',
      })
    }
    // Merchant notification
    if (merchantUserId) {
      const merchantTitle = attributed
        ? `「${projectName}」有新的推廣詢問`
        : `「${projectName}」有新的直接詢問`
      notifInserts.push({
        user_id: merchantUserId,
        type:    'new_inquiry',
        title:   merchantTitle,
        href:    propertyId ? `/merchant/projects/${propertyId}/customers` : '/merchant/projects',
      })
    }
  }

  if (notifInserts.length > 0) {
    await admin.from('notifications').insert(notifInserts)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
