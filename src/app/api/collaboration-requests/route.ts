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
  }

  const projectId     = typeof body.project_id === 'string' ? body.project_id.trim() : ''
  const message       = typeof body.message    === 'string' ? body.message.trim() || null : null
  const commissionRate = typeof body.commission_rate === 'number' && body.commission_rate >= 0 && body.commission_rate <= 100
    ? body.commission_rate
    : null

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
    .from('properties')
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
      project_id:       projectId,
      merchant_user_id: merchantUserId,
      kol_user_id:      kolUserId,
      sender_role:      senderRole,
      message,
      commission_rate:  commissionRate,
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
    .select('id, project_id, merchant_user_id, kol_user_id, sender_role, status, message, commission_rate, created_at, responded_at, cancelled_at')
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

  // Enrich with project name, merchant company name, and KOL info in parallel
  const projectIds      = [...new Set(rows.map((r) => r.project_id as string).filter(Boolean))]
  const merchantUserIds = [...new Set(rows.map((r) => r.merchant_user_id as string).filter(Boolean))]
  const kolUserIds      = [...new Set(rows.map((r) => r.kol_user_id as string).filter(Boolean))]

  const [projectsResult, merchantsResult, kolsResult] = await Promise.all([
    admin.from('properties').select('id, name, collab_description').in('id', projectIds),
    admin.from('merchant_profiles').select('user_id, company_name, contact_name').in('user_id', merchantUserIds),
    admin.from('kol_applications').select('user_id, full_name, platforms, follower_range').in('user_id', kolUserIds),
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
    }
  })

  return NextResponse.json({ ok: true, requests: enriched })
}
