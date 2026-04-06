import { describe, it, expect, vi } from 'vitest'
import { fetchKolPlatformStats } from '@/lib/kol-stats'

// Builds a fake Supabase client whose query chain returns the given data.
// The real Supabase builder is "thenable" — it's both chainable AND a Promise.
// We replicate that by attaching a `then` method so Promise.all can await it.
function makeClient(tableData: Record<string, unknown[]>) {
  const makeChain = (data: unknown[]) => {
    const resolved = { data, error: null }
    const chain: Record<string, unknown> = {
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      in:     vi.fn().mockReturnThis(),
      // Make the chain itself thenable so `await chain` resolves with data
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(resolved).then(resolve),
    }
    return chain
  }

  return {
    from: vi.fn((table: string) => makeChain(tableData[table] ?? [])),
  }
}

const KOL_ID = 'kol-123'

describe('fetchKolPlatformStats', () => {
  it('returns all zeros when the KOL has no links or collabs', async () => {
    const client = makeClient({})
    const stats = await fetchKolPlatformStats(client as never, KOL_ID)

    expect(stats).toEqual({
      totalClicks:    0,
      totalBookings:  0,
      totalSales:     0,
      conversionRate: 0,
      activeProjects: 0,
      totalProjects:  0,
    })
  })

  it('counts clicks and conversions correctly', async () => {
    const client = makeClient({
      referral_links:       [{ id: 'link-1' }, { id: 'link-2' }],
      referral_clicks:      [{ referral_link_id: 'link-1' }, { referral_link_id: 'link-1' }, { referral_link_id: 'link-2' }],
      referral_conversions: [
        { conversion_type: 'inquiry' },
        { conversion_type: 'inquiry' },
        { conversion_type: 'deal' },
      ],
      collaboration_requests: [],
    })
    const stats = await fetchKolPlatformStats(client as never, KOL_ID)

    expect(stats.totalClicks).toBe(3)
    expect(stats.totalBookings).toBe(2)   // inquiry
    expect(stats.totalSales).toBe(1)      // deal
    expect(stats.conversionRate).toBe(33.3) // 1/3 * 100
  })

  it('calculates conversionRate as 0 when there are no clicks', async () => {
    const client = makeClient({
      referral_links:         [{ id: 'link-1' }],
      referral_clicks:        [],
      referral_conversions:   [{ conversion_type: 'deal' }],
      collaboration_requests: [],
    })
    const stats = await fetchKolPlatformStats(client as never, KOL_ID)

    expect(stats.conversionRate).toBe(0)
  })

  it('distinguishes active vs archived projects', async () => {
    const client = makeClient({
      referral_links: [],
      collaboration_requests: [
        { project_id: 'p1', properties: { is_archived: false } },
        { project_id: 'p2', properties: { is_archived: false } },
        { project_id: 'p3', properties: { is_archived: true } },
      ],
    })
    const stats = await fetchKolPlatformStats(client as never, KOL_ID)

    expect(stats.totalProjects).toBe(3)
    expect(stats.activeProjects).toBe(2)
  })

  it('skips click/conversion queries when there are no referral links', async () => {
    const client = makeClient({
      referral_links:         [],
      collaboration_requests: [],
    })
    const spy = client.from as ReturnType<typeof vi.fn>
    await fetchKolPlatformStats(client as never, KOL_ID)

    // referral_clicks and referral_conversions should never be queried
    const queriedTables = spy.mock.calls.map(([t]: [string]) => t)
    expect(queriedTables).not.toContain('referral_clicks')
    expect(queriedTables).not.toContain('referral_conversions')
  })
})
