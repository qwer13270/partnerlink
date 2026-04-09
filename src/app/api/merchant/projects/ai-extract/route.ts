import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireApiRole } from '@/lib/server/api-auth'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AiExtractResult = {
  name?: string
  subtitle?: string
  districtLabel?: string
  completionBadge?: string
  overviewTitle?: string
  overviewBody?: string
  featuresTitle?: string
  salesPhone?: string
  contactBody?: string
  identitySpecs?: Array<{ title: string; body: string }>
  introSpecs?: Array<{ title: string; body: string }>
  featureCards?: Array<{ title: string; body: string }>
  timelineItems?: Array<{ title: string; body: string; meta: string; state: 'completed' | 'current' | 'upcoming' }>
  locationPoints?: Array<{ title: string; body: string }>
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const body = await request.json().catch(() => ({})) as { url?: string; text?: string }
  const url  = typeof body.url  === 'string' ? body.url.trim()  : ''
  const text = typeof body.text === 'string' ? body.text.trim() : ''

  if (!url && !text) {
    return NextResponse.json({ error: '請提供網址或文字內容' }, { status: 400 })
  }

  // ── Fetch page content via Jina reader if URL given ───────────────────────
  let sourceText = text
  if (url) {
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: { Accept: 'text/plain' },
        signal: AbortSignal.timeout(20_000),
      })
      if (!jinaRes.ok) throw new Error(`Jina returned ${jinaRes.status}`)
      const raw = await jinaRes.text()
      // Cap at ~12k chars to keep token cost reasonable
      sourceText = raw.slice(0, 12_000)
    } catch (err) {
      console.error('[ai-extract] jina fetch error:', err instanceof Error ? err.message : err)
      return NextResponse.json({ error: '無法讀取該網址，請改貼上文字內容' }, { status: 422 })
    }
  }

  // ── Call OpenAI ───────────────────────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服務尚未設定，請聯絡管理員' }, { status: 503 })
  }

  const client = new OpenAI({ apiKey })

  const systemPrompt = `你是一個專業的台灣房地產建案資訊萃取助手。
你的工作是從建案網頁內容或使用者提供的文字中，萃取出結構化的建案資訊。
請只輸出一個 JSON 物件，不要有任何額外說明文字。
若某個欄位在原文中找不到對應資訊，請省略該欄位（不要輸出 null 或空字串）。
所有文字欄位請保持自然、精準，不要自行添加虛假資訊。`

  const userPrompt = `請從以下內容萃取建案資訊，輸出符合此 TypeScript 介面的 JSON：

interface AiExtractResult {
  name?: string                    // 建案名稱，例如「信義苑」
  subtitle?: string                // 副標題或 slogan，一句話，例如「打造信義區精品住宅新標竿」
  districtLabel?: string           // 地段簡稱，例如「台北信義」「新北板橋」
  completionBadge?: string         // 預計完工或交屋時程，例如「預計 2026 Q1 交屋」
  overviewTitle?: string           // 建案介紹區塊的標題，例如「關於信義苑」
  overviewBody?: string            // 建案介紹的主要段落文字（2-4 句）
  featuresTitle?: string           // 特色亮點區塊的標題，例如「核心優勢」
  salesPhone?: string              // 銷售專線電話號碼
  contactBody?: string             // 聯絡/預約賞屋的描述文字（1-2 句）
  identitySpecs?: Array<{          // 物件簡介規格條（4 項以內）
    title: string                  // 規格標題，例如「地段」「產品」「結構」「專線」
    body: string                   // 規格內容，例如「濟南路三段 67 號」
  }>
  introSpecs?: Array<{             // 建案規格列表（6 項以內）
    title: string                  // 例如「坪數規劃」「房型配置」「總樓層」
    body: string                   // 例如「30–50 坪」
  }>
  featureCards?: Array<{           // 特色亮點卡片（3–5 項）
    title: string                  // 特色名稱，簡短有力
    body: string                   // 特色說明，1-2 句
  }>
  timelineItems?: Array<{          // 工程進度時間軸（3–6 項）
    title: string                  // 節點名稱，例如「建照取得」「動工開工」
    body: string                   // 節點說明
    meta: string                   // 時間，例如「2024 Q3」
    state: 'completed' | 'current' | 'upcoming'
  }>
  locationPoints?: Array<{         // 周邊地點（3–6 項）
    title: string                  // 地點名稱，例如「忠孝新生捷運站」
    body: string                   // 距離說明，例如「步行 5 分鐘」
  }>
}

來源內容：
${sourceText}`

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 2048,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    const result  = JSON.parse(rawText) as AiExtractResult
    return NextResponse.json({ ok: true, result })
  } catch (err) {
    console.error('[ai-extract] openai error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'AI 分析失敗，請稍後再試' }, { status: 500 })
  }
}
