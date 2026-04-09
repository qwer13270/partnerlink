import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { requireApiRole } from '@/lib/server/api-auth'
import { getMerchantProjectDetail } from '@/lib/server/properties'

// ── Types ─────────────────────────────────────────────────────────────────────

export type AudienceProfile = {
  persona: string
  ageDistribution: Array<{ range: string; pct: number }>
  incomeDistribution: Array<{ level: string; pct: number }>
  sourceRecommendations: Array<{ name: string; pct: number }>
  purchaseIntent: {
    high:   { pct: number; desc: string }
    medium: { pct: number; desc: string }
    low:    { pct: number; desc: string }
  }
  insights: string[]
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiRole(request, ['merchant'])
  if (!auth.ok) return auth.response

  const { id } = await context.params

  const project = await getMerchantProjectDetail(auth.user.id, id)
  if (!project) {
    return NextResponse.json({ error: '找不到此建案' }, { status: 404 })
  }

  // ── Build a text description of the 建案 from its content ─────────────────
  const specs = project.contentItems
    .filter(i => i.groupKey === 'intro_specs' || i.groupKey === 'identity_specs')
    .map(i => `${i.title ?? ''}：${i.body ?? ''}`)
    .join('、')

  const features = project.contentItems
    .filter(i => i.groupKey === 'feature_cards')
    .map(i => i.title ?? '')
    .filter(Boolean)
    .join('、')

  const location = project.contentItems
    .filter(i => i.groupKey === 'location_points')
    .map(i => `${i.title ?? ''}（${i.body ?? ''}）`)
    .join('；')

  const units = project.contentItems
    .filter(i => i.groupKey === 'floor_plan_units')
    .map(i => `${i.title ?? ''} ${i.body ?? ''} ${i.meta ?? ''} ${i.accent ?? ''}`)
    .join('；')

  const projectDesc = [
    `建案名稱：${project.name}`,
    project.subtitle        ? `副標題：${project.subtitle}` : '',
    project.districtLabel   ? `地段：${project.districtLabel}` : '',
    project.completionBadge ? `完工時程：${project.completionBadge}` : '',
    project.overviewBody    ? `建案介紹：${project.overviewBody}` : '',
    specs                   ? `規格：${specs}` : '',
    features                ? `特色亮點：${features}` : '',
    location                ? `周邊環境：${location}` : '',
    units                   ? `格局與定價：${units}` : '',
  ].filter(Boolean).join('\n')

  // ── Call OpenAI ───────────────────────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI 服務尚未設定' }, { status: 503 })
  }

  const client = new OpenAI({ apiKey })

  const systemPrompt = `你是一位台灣房地產行銷策略顧問。
根據建案的地段、規格、定價與特色，推斷這個建案最可能吸引的目標受眾輪廓。
只輸出 JSON，不要有任何說明文字。
所有百分比加總必須等於 100。
請確保分析符合台灣房地產市場實況。`

  const userPrompt = `以下是建案資訊：

${projectDesc}

請輸出符合此介面的 JSON：

interface AudienceProfile {
  persona: string  // 一段 2-3 句話描述主力買家輪廓，例如職業、家庭狀況、購屋動機
  ageDistribution: Array<{
    range: string  // 例如「25–34」「35–44」「45–54」「55–64」「65+」
    pct: number    // 整數百分比，五項加總 = 100
  }>
  incomeDistribution: Array<{
    level: string  // 例如「60–100 萬」「100–150 萬」「150–200 萬」「200 萬+」
    pct: number    // 四項加總 = 100
  }>
  sourceRecommendations: Array<{
    name: string   // 例如「KOL 口碑」「社群媒體」「親友介紹」「搜尋廣告」
    pct: number    // 四項加總 = 100，依效果排序
  }>
  purchaseIntent: {
    high:   { pct: number; desc: string }  // 高意願族群描述
    medium: { pct: number; desc: string }  // 中意願族群描述
    low:    { pct: number; desc: string }  // 低意願族群描述
    // 三項加總 = 100
  }
  insights: string[]  // 4 條行銷洞察，每條 20-35 字，針對此建案具體提出
}`

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt   },
      ],
    })

    const rawText = completion.choices[0]?.message?.content ?? ''
    const profile = JSON.parse(rawText) as AudienceProfile
    return NextResponse.json({ ok: true, profile })
  } catch (err) {
    console.error('[ai-audience] openai error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'AI 分析失敗，請稍後再試' }, { status: 500 })
  }
}
