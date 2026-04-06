import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

// ── POST /api/collaboration-requests ─────────────────────────────────────
// Creates a new collaboration request. Sender role is inferred from the
// authenticated user's app_metadata role ('merchant' or 'kol').
export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant', 'kol'])
  if (!auth.ok) return auth.response

  const senderRole = auth.role === 'merchant' ? 'merchant' : 'kol'

  const body = (await request.json().catch(() => ({}))) as {
    project_id?: string
    kol_user_id?: string
    merchant_user_id?: string
    message?: string
    commission_rate?: number
    collaboration_type?: string
    sponsorship_bonus?: number
    items?: { item_name: string; quantity: number; estimated_value: number; notes?: string }[]
  }

  const projectId        = typeof body.project_id === 'string' ? body.project_id.trim() : ''
  const message          = typeof body.message    === 'string' ? body.message.trim() || null : null
  const commissionRate   = typeof body.commission_rate === 'number' && body.commission_rate >= 0 && body.commission_rate <= 100
    ? body.commission_rate
    : null
  const collaborationType = body.collaboration_type === 'reciprocal'
    ? 'reciprocal'
    : body.collaboration_type === 'sponsored'
      ? 'sponsored'
      : 'commission'
  const sponsorshipBonus  = collaborationType === 'sponsored' && typeof body.sponsorship_bonus === 'number' && body.sponsorship_bonus >= 0
    ? body.sponsorship_bonus
    : null
  const items = (collaborationType === 'reciprocal' || collaborationType === 'sponsored') && Array.isArray(body.items) ? body.items : []

  if (!projectId) {
    return NextResponse.json({ error: 'project_id is required.' }, { status: 400 })
  }

  let merchantUserId: string
  let kolUserId: string

  if (senderRole === 'merchant') {
    const rawKolUserId = typeof body.kol_user_id === 'string' ? body.kol_user_id.trim() : ''
    if (!rawKolUserId) {
      return NextResponse.json({ error: 'kol_user_id is required.' }, { status: 400 })
    }
    merchantUserId = auth.user.id
    kolUserId      = rawKolUserId
  } else {
    const rawMerchantUserId = typeof body.merchant_user_id === 'string' ? body.merchant_user_id.trim() : ''
    if (!rawMerchantUserId) {
      return NextResponse.json({ error: 'merchant_user_id is required.' }, { status: 400 })
    }
    merchantUserId = rawMerchantUserId
    kolUserId      = auth.user.id
  }

  const admin = getSupabaseAdminClient()

  // Verify project exists and belongs to this merchant (if sender is merchant)
  const { data: project, error: projectError } = await admin
    .from('projects')
    .select('id, merchant_user_id')
    .eq('id', projectId)
    .maybeSingle()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  if (senderRole === 'merchant' && project.merchant_user_id !== auth.user.id) {
    return NextResponse.json({ error: 'Project does not belong to this merchant.' }, { status: 403 })
  }

  const { data, error } = await admin
    .from('collaboration_requests')
    .insert({
      project_id:         projectId,
      merchant_user_id:   merchantUserId,
      kol_user_id:        kolUserId,
      sender_role:        senderRole,
      message,
      commission_rate:    commissionRate,
      collaboration_type: collaborationType,
      sponsorship_bonus:  sponsorshipBonus,
    })
    .select('id, status, created_at')
    .single()

  if (error) {
    // Unique violation on the pending partial index
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A pending request already exists for this merchant, KOL, and project.' },
        { status: 409 },
      )
    }
    // Trigger exception for active collaboration
    if (error.message?.includes('active_collaboration_exists')) {
      return NextResponse.json(
        { error: 'An active collaboration already exists for this merchant, KOL, and project.' },
        { status: 409 },
      )
    }
    console.error('[api/collaboration-requests] insert error:', error.message)
    return NextResponse.json({ error: 'Failed to create request.' }, { status: 500 })
  }

  // Insert 公關商品 items if present (both 互惠 and 業配)
  if ((collaborationType === 'reciprocal' || collaborationType === 'sponsored') && items.length > 0) {
    const validItems = items.filter(
      (it) =>
        typeof it.item_name === 'string' && it.item_name.trim() &&
        typeof it.quantity === 'number' && it.quantity > 0 &&
        typeof it.estimated_value === 'number' && it.estimated_value >= 0,
    )
    if (validItems.length > 0) {
      const { error: itemsError } = await admin
        .from('mutual_benefit_items')
        .insert(
          validItems.map((it) => ({
            collaboration_request_id: data.id,
            item_name:       it.item_name.trim(),
            quantity:        it.quantity,
            estimated_value: it.estimated_value,
            notes:           typeof it.notes === 'string' ? it.notes.trim() || null : null,
          })),
        )
      if (itemsError) {
        console.error('[api/collaboration-requests] insert items error:', itemsError.message)
      }
    }
  }

  return NextResponse.json({ ok: true, request: data }, { status: 201 })
}

// ── GET /api/collaboration-requests ──────────────────────────────────────
// Returns the caller's collaboration requests, enriched with project name
// and merchant company name.
// Query params:
//   status  — filter by status (pending|accepted|declined|cancelled)
//   role    — 'sent' (requests I sent) | 'received' (requests sent to me)
export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant', 'kol', 'admin'])
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const statusFilter = searchParams.get('status')
  const roleFilter   = searchParams.get('role') // 'sent' | 'received'

  const admin = getSupabaseAdminClient()

  let query = admin
    .from('collaboration_requests')
    .select('id, project_id, merchant_user_id, kol_user_id, sender_role, status, message, commission_rate, collaboration_type, sponsorship_bonus, created_at, responded_at, cancelled_at')
    .order('created_at', { ascending: false })

  if (auth.role !== 'admin') {
    const userId     = auth.user.id
    const isMerchant = auth.role === 'merchant'

    if (roleFilter === 'sent') {
      query = query
        .eq(isMerchant ? 'merchant_user_id' : 'kol_user_id', userId)
        .eq('sender_role', isMerchant ? 'merchant' : 'kol')
    } else if (roleFilter === 'received') {
      query = query
        .eq(isMerchant ? 'merchant_user_id' : 'kol_user_id', userId)
        .neq('sender_role', isMerchant ? 'merchant' : 'kol')
    } else {
      query = query.or(`merchant_user_id.eq.${userId},kol_user_id.eq.${userId}`)
    }
  }

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query

  if (error) {
    console.error('[api/collaboration-requests] fetch error:', error.message)
    return NextResponse.json({ error: 'Failed to load requests.' }, { status: 500 })
  }

  const rows = data ?? []
  if (rows.length === 0) {
    return NextResponse.json({ ok: true, requests: [] })
  }

  // Enrich with project name, merchant company name, KOL info, and 互惠 items in parallel
  const projectIds      = [...new Set(rows.map((r) => r.project_id as string).filter(Boolean))]
  const merchantUserIds = [...new Set(rows.map((r) => r.merchant_user_id as string).filter(Boolean))]
  const kolUserIds      = [...new Set(rows.map((r) => r.kol_user_id as string).filter(Boolean))]
  const requestIds      = rows.map((r) => r.id as string)

  const [projectsResult, merchantsResult, kolsResult, itemsResult] = await Promise.all([
    admin.from('projects').select('id, name, collab_description').in('id', projectIds),
    admin.from('merchant_profiles').select('user_id, company_name, contact_name').in('user_id', merchantUserIds),
    admin.from('kol_applications').select('user_id, full_name, platforms, follower_range').in('user_id', kolUserIds),
    admin.from('mutual_benefit_items').select('collaboration_request_id, item_name, quantity, estimated_value, notes').in('collaboration_request_id', requestIds),
  ])

  const projectById = new Map(
    (projectsResult.data ?? []).map((p) => [p.id as string, { name: p.name as string, collab_description: p.collab_description as string | null }]),
  )
  const merchantByUserId = new Map(
    (merchantsResult.data ?? []).map((m) => [
      m.user_id as string,
      { company_name: m.company_name as string, contact_name: m.contact_name as string },
    ]),
  )
  const kolByUserId = new Map(
    (kolsResult.data ?? []).map((k) => {
      const platforms = Array.isArray(k.platforms)
        ? (k.platforms as string[]).filter((s) => typeof s === 'string').join(' / ')
        : ''
      return [
        k.user_id as string,
        { full_name: k.full_name as string, platform: platforms, follower_range: k.follower_range as string | null },
      ]
    }),
  )

  // Group mutual benefit items by request id
  type ItemRow = { collaboration_request_id: string; item_name: string; quantity: number; estimated_value: number; notes: string | null }
  const itemsByRequestId = new Map<string, ItemRow[]>()
  for (const item of (itemsResult.data ?? []) as ItemRow[]) {
    const list = itemsByRequestId.get(item.collaboration_request_id) ?? []
    list.push(item)
    itemsByRequestId.set(item.collaboration_request_id, list)
  }

  const enriched = rows.map((r) => {
    const merchant = merchantByUserId.get(r.merchant_user_id as string)
    const kol      = kolByUserId.get(r.kol_user_id as string)
    return {
      ...r,
      project_name:          projectById.get(r.project_id as string)?.name ?? null,
      collab_description:    projectById.get(r.project_id as string)?.collab_description ?? null,
      merchant_company_name: merchant?.company_name ?? null,
      merchant_contact_name: merchant?.contact_name ?? null,
      kol_name:              kol?.full_name ?? null,
      kol_platform:          kol?.platform ?? null,
      kol_follower_range:    kol?.follower_range ?? null,
      items:                 (itemsByRequestId.get(r.id as string) ?? []).map(({ item_name, quantity, estimated_value, notes }) => ({ item_name, quantity, estimated_value, notes })),
    }
  })

  return NextResponse.json({ ok: true, requests: enriched })
}
