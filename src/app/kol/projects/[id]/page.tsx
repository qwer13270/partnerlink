import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { getRoleFromUser, resolveRoleHomePath } from '@/lib/auth'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import KolProjectDetailClient from '@/components/kol/KolProjectDetailClient'

// ── Types exported for client ─────────────────────────────────────────────────

export type DealEntry = {
  id:             string
  date:           string
  dealValueWan:   number
  commissionRate: number
  commissionWan:  number
  roomType:       string | null
  roomNumber:     string | null
}

export type MutualBenefitItem = {
  item_name:       string
  quantity:        number
  estimated_value: number
  notes:           string | null
}

export type Shipment = {
  carrier:         string | null
  tracking_number: string | null
  shipped_at:      string | null
  received_at:     string | null
}

export type CollabDetail = {
  collaboration_id:    string
  project_id:          string
  project_name:        string
  project_type:        'property' | 'shop'
  collab_description:  string | null
  collaboration_type:  'commission' | 'reciprocal' | 'sponsored'
  collab_status:       'active' | 'ended'
  commission_rate:     number | null
  sponsorship_bonus:   number | null
  referral_short_code: string | null
  referral_active:     boolean
  clicks:              number
  inquiries:           number
  visits:              number
  deals:               number
  // 建案 only
  deal_entries:        DealEntry[]
  // 商案 only
  items:               MutualBenefitItem[]
  shipment:            Shipment | null
  created_at:          string
}

export default async function KolProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: collaborationId } = await params

  const cookieStore = await cookies()
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as CookieOptions)
          })
        },
      },
    },
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = getRoleFromUser(user)
  if (role !== 'kol') redirect(role ? resolveRoleHomePath(role) : '/login')

  const admin = getSupabaseAdminClient()

  // 1. Fetch the collaboration (verify ownership)
  const { data: collab } = await admin
    .from('collaborations')
    .select('id, project_id, status, collaboration_type, sponsorship_bonus, request_id, created_at')
    .eq('id', collaborationId)
    .eq('kol_user_id', user.id)
    .single()

  if (!collab) notFound()

  const projectId = collab.project_id as string
  const requestId = collab.request_id as string

  // 2. Parallel: project + request (commission_rate) + referral link
  const [projectR, requestR, linkR] = await Promise.all([
    admin.from('projects')
      .select('id, name, type, collab_description')
      .eq('id', projectId)
      .single(),
    admin.from('collaboration_requests')
      .select('id, commission_rate')
      .eq('id', requestId)
      .single(),
    admin.from('referral_links')
      .select('id, short_code, is_active')
      .eq('collaboration_id', collaborationId)
      .maybeSingle(),
  ])

  const project = projectR.data
  const request = requestR.data
  const link    = linkR.data

  // 3. Clicks + conversions (parallel)
  const [clickRows, conversionRows] = await Promise.all([
    link
      ? admin.from('referral_clicks').select('id').eq('referral_link_id', link.id as string)
      : Promise.resolve({ data: [] }),
    link
      ? admin.from('referral_conversions')
          .select('id, conversion_type, visited_at, deal_value, deal_confirmed_at, converted_at, room_type, room_number')
          .eq('referral_link_id', link.id as string)
      : Promise.resolve({ data: [] }),
  ])

  const clicks    = (clickRows.data ?? []).length
  const allConvs  = conversionRows.data ?? []
  const inquiries = allConvs.filter(r => r.conversion_type === 'inquiry').length
  const visits    = allConvs.filter(r => r.conversion_type === 'inquiry' && r.visited_at).length
  const deals     = allConvs.filter(r => r.conversion_type === 'deal').length

  // 4. Type-conditional data
  const projectType = (project?.type ?? '建案') as 'property' | 'shop'
  let dealEntries: DealEntry[]  = []
  let items: MutualBenefitItem[] = []
  let shipment: Shipment | null  = null

  if (projectType === 'property') {
    const rate = request?.commission_rate as number | null
    if (rate !== null) {
      dealEntries = allConvs
        .filter(d => d.conversion_type === 'deal')
        .sort((a, b) => {
          const da = new Date((a.deal_confirmed_at ?? a.converted_at) as string).getTime()
          const db = new Date((b.deal_confirmed_at ?? b.converted_at) as string).getTime()
          return db - da
        })
        .map(d => {
          const val     = typeof d.deal_value === 'number' ? d.deal_value : 0
          const commWan = parseFloat(((val * rate) / 100).toFixed(2))
          return {
            id:             d.id as string,
            date:           (d.deal_confirmed_at ?? d.converted_at) as string,
            dealValueWan:   val,
            commissionRate: rate,
            commissionWan:  commWan,
            roomType:       (d.room_type as string | null) ?? null,
            roomNumber:     (d.room_number as string | null) ?? null,
          }
        })
    }
  } else if (projectType === 'shop') {
    // Fetch PR items + shipment
    const [itemsR, shipmentR] = await Promise.all([
      admin.from('mutual_benefit_items')
        .select('item_name, quantity, estimated_value, notes')
        .eq('collaboration_request_id', requestId),
      admin.from('mutual_benefit_shipments')
        .select('carrier, tracking_number, shipped_at, received_at')
        .eq('collaboration_id', collaborationId)
        .maybeSingle(),
    ])

    items = (itemsR.data ?? []).map(item => ({
      item_name:       item.item_name as string,
      quantity:        item.quantity as number,
      estimated_value: item.estimated_value as number,
      notes:           item.notes as string | null,
    }))

    if (shipmentR.data) {
      shipment = {
        carrier:         shipmentR.data.carrier as string | null,
        tracking_number: shipmentR.data.tracking_number as string | null,
        shipped_at:      shipmentR.data.shipped_at as string | null,
        received_at:     shipmentR.data.received_at as string | null,
      }
    }
  }

  const detail: CollabDetail = {
    collaboration_id:    collab.id as string,
    project_id:          projectId,
    project_name:        project?.name ?? '未知商案',
    project_type:        projectType,
    collab_description:  project?.collab_description ?? null,
    collaboration_type:  collab.collaboration_type as 'commission' | 'reciprocal' | 'sponsored',
    collab_status:       collab.status as 'active' | 'ended',
    commission_rate:     (request?.commission_rate as number | null) ?? null,
    sponsorship_bonus:   collab.sponsorship_bonus as number | null,
    referral_short_code: link?.short_code ?? null,
    referral_active:     link?.is_active ?? false,
    clicks,
    inquiries,
    visits,
    deals,
    deal_entries:        dealEntries,
    items,
    shipment,
    created_at:          collab.created_at as string,
  }

  return <KolProjectDetailClient detail={detail} />
}
