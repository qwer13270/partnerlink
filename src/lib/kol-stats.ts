import type { SupabaseClient } from '@supabase/supabase-js'
import type { PlatformStats } from '@/data/mock-resume'

/**
 * Fetches real platform stats for a KOL from Supabase.
 * Used by the public resume page and the resume edit page.
 */
export async function fetchKolPlatformStats(
  admin: SupabaseClient,
  kolUserId: string,
): Promise<PlatformStats> {
  const [refLinksResult, collabResult] = await Promise.all([
    admin
      .from('referral_links')
      .select('id')
      .eq('kol_user_id', kolUserId),
    admin
      .from('collaboration_requests')
      .select('project_id, properties!inner(is_archived)')
      .eq('kol_user_id', kolUserId)
      .eq('status', 'accepted'),
  ])

  const allLinkIds = (refLinksResult.data ?? []).map((l) => l.id as string)

  const [clicksResult, convsResult] = allLinkIds.length > 0
    ? await Promise.all([
        admin
          .from('referral_clicks')
          .select('referral_link_id')
          .in('referral_link_id', allLinkIds),
        admin
          .from('referral_conversions')
          .select('conversion_type')
          .in('referral_link_id', allLinkIds),
      ])
    : [{ data: [] as { referral_link_id: string }[] }, { data: [] as { conversion_type: string }[] }]

  const totalClicks   = (clicksResult.data ?? []).length
  const allConvs      = convsResult.data ?? []
  const totalBookings = allConvs.filter((r) => r.conversion_type === 'inquiry').length
  const totalSales    = allConvs.filter((r) => r.conversion_type === 'deal').length
  const conversionRate = totalClicks > 0
    ? parseFloat(((totalSales / totalClicks) * 100).toFixed(1))
    : 0

  const collabRows     = collabResult.data ?? []
  const totalProjects  = collabRows.length
  const activeProjects = collabRows.filter((r) => {
    const prop = r.properties as unknown as { is_archived: boolean } | null
    return prop && !prop.is_archived
  }).length

  return {
    totalClicks,
    totalBookings,
    totalSales,
    conversionRate,
    activeProjects,
    totalProjects,
  }
}
