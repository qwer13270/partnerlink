import { NextRequest, NextResponse } from 'next/server'
import { requireApiRole } from '@/lib/server/api-auth'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { parseDistrictLabel } from '@/lib/district-slugs'

export type MarketTrendRecord = {
  quarterShort: string    // '25 Q4'  — for chart x-axis
  quarterLong: string     // '2025 Q4' — for table display
  price: number | null         // overall median price 萬/坪 (used for KPI card)
  totalTxn: number | null      // total transactions across all types (used for KPI card)
  presalePrice: number | null  // 萬/坪
  newBuildPrice: number | null
  resalePrice: number | null
  presaleTxn: number | null
  newBuildTxn: number | null
  resaleTxn: number | null
  qoq: number | null     // quarter-over-quarter %
  yoy: number | null     // year-over-year %
}

// ── Nuxt data parser ──────────────────────────────────────────────────────────
// housefeel uses Nuxt 3's devalue serialization: a flat JSON array where
// every object's values are indices into that same array.

type RawRecord = {
  year: number
  quarter: number
  price: number | null
  trading_volume: number | null
  presale_median_price: number | null
  presale_trading_volume: number | null
  newly_built_median_price: number | null
  newly_built_trading_volume: number | null
  resale_median_price: number | null
  resale_trading_volume: number | null
  qoq_price: number | null
  yoy_price: number | null
}

type CandidateRecord = RawRecord & { districtId: unknown }

function extractRecords(array: unknown[]): RawRecord[] {
  const candidates: CandidateRecord[] = []

  for (const item of array) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) continue
    const raw = item as Record<string, unknown>

    // Only look at district-level records (must have district_id).
    // City-level aggregates also have presale_median_price but lack district_id — skip those.
    if (!('presale_median_price' in raw) || !('year' in raw) || !('quarter' in raw) || !('district_id' in raw)) continue

    // All values in the object are indices into the array
    const deref = (v: unknown): unknown => {
      if (typeof v === 'number' && v >= 0 && v < array.length) return array[v]
      return null
    }

    const year = deref(raw.year)
    const quarter = deref(raw.quarter)

    // Sanity-check: must be a real year/quarter, not a schema reference
    if (typeof year !== 'number' || year < 2015 || year > 2035) continue
    if (typeof quarter !== 'number' || quarter < 1 || quarter > 4) continue

    // Only keep the main "不含透天" build type (housefeel's primary price index)
    if (deref(raw.build_type) !== 'not_detached_house') continue

    const num = (v: unknown): number | null => {
      const val = deref(v)
      return typeof val === 'number' ? val : null
    }

    candidates.push({
      districtId: deref(raw.district_id),
      year,
      quarter,
      price:                       num(raw.price),
      trading_volume:              num(raw.trading_volume),
      presale_median_price:        num(raw.presale_median_price),
      presale_trading_volume:      num(raw.presale_trading_volume),
      newly_built_median_price:    num(raw.newly_built_median_price),
      newly_built_trading_volume:  num(raw.newly_built_trading_volume),
      resale_median_price:         num(raw.resale_median_price),
      resale_trading_volume:       num(raw.resale_trading_volume),
      qoq_price:                   num(raw.qoq_price),
      yoy_price:                   num(raw.yoy_price),
    })
  }

  // The page embeds the primary district's full history plus one row per neighbouring
  // district for the current quarter (for comparison). Identify the primary district as
  // the one with the most records — it has data spanning many quarters while the
  // comparison districts each only have a single row.
  const countById = new Map<unknown, number>()
  for (const r of candidates) countById.set(r.districtId, (countById.get(r.districtId) ?? 0) + 1)
  const primaryId = [...countById.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const records: RawRecord[] = candidates
    .filter(r => r.districtId === primaryId)
    .map(({ districtId: _d, ...rest }) => rest)

  // Sort ascending, deduplicate by year+quarter (keep first complete record)
  records.sort((a, b) => a.year !== b.year ? a.year - b.year : a.quarter - b.quarter)
  const seen = new Set<string>()
  return records.filter(r => {
    const key = `${r.year}-${r.quarter}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// prices on housefeel are in 元/坪 → divide by 10,000 to get 萬/坪
function toWan(value: number | null): number | null {
  if (!value) return null
  return Math.round((value / 10000) * 100) / 100
}

function transform(records: RawRecord[]): MarketTrendRecord[] {
  return records.map(r => {
    const yy = String(r.year).slice(2)
    return {
      quarterShort:  `${yy} Q${r.quarter}`,
      quarterLong:   `${r.year} Q${r.quarter}`,
      price:         toWan(r.price),
      totalTxn:      r.trading_volume,
      presalePrice:  toWan(r.presale_median_price),
      newBuildPrice: toWan(r.newly_built_median_price),
      resalePrice:   toWan(r.resale_median_price),
      presaleTxn:    r.presale_trading_volume,
      newBuildTxn:   r.newly_built_trading_volume,
      resaleTxn:     r.resale_trading_volume,
      qoq:           r.qoq_price,
      yoy:           r.yoy_price,
    }
  })
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await context.params

  // Get project's district_label
  const admin = getSupabaseAdminClient()
  const { data: project, error } = await admin
    .from('projects')
    .select('district_label')
    .eq('id', id)
    .eq('merchant_user_id', auth.user.id)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found.' }, { status: 404 })
  }

  if (!project.district_label) {
    return NextResponse.json(
      { error: '尚未設定區域標籤，請先在案場編輯中填寫區域標籤（例如：大安 · 忠孝新生 · Taipei）。' },
      { status: 422 },
    )
  }

  const entry = parseDistrictLabel(project.district_label)
  if (!entry) {
    return NextResponse.json(
      { error: `無法識別區域「${project.district_label}」，請確認區域標籤格式（例如：大安 · 台北）。` },
      { status: 422 },
    )
  }

  const housefeelUrl = `https://www.housefeel.com.tw/price-all/${entry.citySlug}/${entry.districtSlug}/`

  let html: string
  try {
    const res = await fetch(housefeelUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
      },
      next: { revalidate: 7 * 24 * 60 * 60 }, // 7-day cache per district URL
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (e) {
    console.error('[api/market-trends] fetch housefeel:', e)
    return NextResponse.json({ error: '無法取得房市資料，請稍後再試。' }, { status: 502 })
  }

  // Extract __NUXT_DATA__ script
  const match = html.match(/<script[^>]*id="__NUXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match?.[1]) {
    return NextResponse.json({ error: '無法解析房市資料來源。' }, { status: 502 })
  }

  let nuxtArray: unknown[]
  try {
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) throw new Error('not array')
    nuxtArray = parsed
  } catch {
    return NextResponse.json({ error: '無法解析房市資料。' }, { status: 502 })
  }

  const rawRecords = extractRecords(nuxtArray)
  if (rawRecords.length === 0) {
    return NextResponse.json({ error: '此區域暫無房市資料。' }, { status: 404 })
  }

  // Return the last 8 quarters
  const data = transform(rawRecords.slice(-8))

  return NextResponse.json({ ok: true, data, housefeelUrl })
}
