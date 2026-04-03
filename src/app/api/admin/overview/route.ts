import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { requireApiRole } from '@/lib/server/api-auth'

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, ['admin'])
  if (!auth.ok) return auth.response

  const admin = getSupabaseAdminClient()

  const [
    { count: pendingKols },
    { count: pendingMerchants },
    { count: activeKols },
    { count: activeMerchants },
    { data: recentKolRows },
    { data: recentMerchantRows },
  ] = await Promise.all([
    admin.from('kol_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending_admin_review'),
    admin.from('merchant_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending_admin_review'),
    admin.from('kol_applications').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    admin.from('merchant_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    admin.from('kol_applications')
      .select('full_name,platforms,follower_range,submitted_at')
      .eq('status', 'pending_admin_review')
      .order('submitted_at', { ascending: false })
      .limit(3),
    admin.from('merchant_applications')
      .select('company_name,contact_name,submitted_at')
      .eq('status', 'pending_admin_review')
      .order('submitted_at', { ascending: false })
      .limit(3),
  ])

  type KolRow = { full_name: string; platforms: string[] | null; follower_range: string | null; submitted_at: string | null }
  type MerchantRow = { company_name: string; contact_name: string | null; submitted_at: string | null }

  return NextResponse.json({
    ok: true,
    stats: {
      pendingKols:      pendingKols      ?? 0,
      pendingMerchants: pendingMerchants ?? 0,
      activeKols:       activeKols       ?? 0,
      activeMerchants:  activeMerchants  ?? 0,
    },
    recentKolApps: ((recentKolRows ?? []) as KolRow[]).map(r => ({
      name:         r.full_name,
      platform:     Array.isArray(r.platforms) ? r.platforms[0] ?? '' : '',
      followerRange: r.follower_range ?? '',
      date:         r.submitted_at?.slice(0, 10) ?? '',
    })),
    recentMerchantApps: ((recentMerchantRows ?? []) as MerchantRow[]).map(r => ({
      name:    r.company_name,
      contact: r.contact_name ?? '',
      date:    r.submitted_at?.slice(0, 10) ?? '',
    })),
  })
}
