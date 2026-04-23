import { describe, it, expect } from 'vitest'
import {
  selectKolsNeedingReminder,
  type ApprovedKolRow,
  type MediaAssetRow,
  type ReminderLogRow,
} from '@/lib/kol-reminder'

const NOW = new Date('2026-04-23T09:00:00Z')

function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
}

function kol(partial: Partial<ApprovedKolRow> & { user_id: string }): ApprovedKolRow {
  return {
    email: `${partial.user_id}@example.com`,
    full_name: partial.user_id,
    reviewed_at: daysAgo(3),
    profile_photo_path: null,
    ...partial,
  }
}

describe('selectKolsNeedingReminder', () => {
  it('returns empty when there are no approved KOLs', () => {
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [],
      mediaAssets: [],
      sentLog: [],
    })
    expect(out).toEqual([])
  })

  it('excludes a KOL approved today (day 0)', () => {
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', reviewed_at: daysAgo(0) })],
      mediaAssets: [],
      sentLog: [],
    })
    expect(out).toHaveLength(0)
  })

  it('includes a KOL at day 3 with no photo and no portfolio', () => {
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a' })],
      mediaAssets: [],
      sentLog: [],
    })
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ stage: 3, missingPhoto: true, missingPortfolio: true })
  })

  it('excludes a KOL at day 3 whose resume is complete', () => {
    const assets: MediaAssetRow[] = [
      { user_id: 'a', media_type: 'image', storage_path: 'kol/a/portfolio/1.jpg' },
    ]
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', profile_photo_path: 'kol/a/photo.jpg' })],
      mediaAssets: assets,
      sentLog: [],
    })
    expect(out).toHaveLength(0)
  })

  it('excludes stage 7 if already logged', () => {
    const sent: ReminderLogRow[] = [{ user_id: 'a', reminder_stage: 7 }]
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', reviewed_at: daysAgo(7) })],
      mediaAssets: [],
      sentLog: sent,
    })
    expect(out).toHaveLength(0)
  })

  it('excludes day 4 (not a reminder stage)', () => {
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', reviewed_at: daysAgo(4) })],
      mediaAssets: [],
      sentLog: [],
    })
    expect(out).toHaveLength(0)
  })

  it('includes day 14 as the last reminder', () => {
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', reviewed_at: daysAgo(14) })],
      mediaAssets: [],
      sentLog: [],
    })
    expect(out).toHaveLength(1)
    expect(out[0].stage).toBe(14)
  })

  it('ignores media rows without a storage_path', () => {
    const assets: MediaAssetRow[] = [
      { user_id: 'a', media_type: 'image', storage_path: null },
    ]
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', profile_photo_path: 'p.jpg' })],
      mediaAssets: assets,
      sentLog: [],
    })
    expect(out).toHaveLength(1)
    expect(out[0].missingPortfolio).toBe(true)
  })

  it('skips KOLs with missing email', () => {
    const out = selectKolsNeedingReminder({
      now: NOW,
      approvedKols: [kol({ user_id: 'a', email: null })],
      mediaAssets: [],
      sentLog: [],
    })
    expect(out).toHaveLength(0)
  })
})
