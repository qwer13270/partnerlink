import { redirect } from 'next/navigation'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Archive, Users, Handshake, BadgeCheck, DollarSign } from 'lucide-react'
import { getMerchantArchivedProjectDetail } from '@/lib/server/properties'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'
import { getSupabaseUrl, getSupabasePublishableKey } from '@/lib/supabase/env'

// ── Types ─────────────────────────────────────────────────────────────────────
type DealRecord = {
  id: string
  customerName: string | null
  dealValue: number | null
  dealConfirmedAt: string
  source: 'attributed' | 'direct'
  kolName: string | null
}

type KolStat = {
  name: string
  referralCount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function fmtCurrency(n: number) {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1)} 億`
  return `${n.toLocaleString('zh-TW')} 萬`
}


// ── Page ──────────────────────────────────────────────────────────────────────
export default async function ArchivedProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: projectId } = await params
  const cookieStore = await cookies()

  // Auth check
  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options as CookieOptions)
          )
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const project = await getMerchantArchivedProjectDetail(user.id, projectId)
  if (!project) redirect('/merchant/projects')

  const admin = getSupabaseAdminClient()

  // All referral links
  const { data: refLinks } = await admin
    .from('referral_links')
    .select('id, kol_user_id')
    .eq('project_id', projectId)

  const linkList = (refLinks ?? []) as Array<{ id: string; kol_user_id: string | null }>
  const linkIds  = linkList.map(l => l.id)

  // KOL names
  const kolUserIds = [...new Set(linkList.map(l => l.kol_user_id).filter(Boolean))] as string[]
  type KolRow = { user_id: string; full_name: string }
  const kolMap: Record<string, string> = {}
  if (kolUserIds.length > 0) {
    const { data: kolRows } = await admin
      .from('kol_applications')
      .select('user_id, full_name')
      .in('user_id', kolUserIds)
    for (const k of (kolRows as KolRow[] | null) ?? []) {
      kolMap[k.user_id] = k.full_name
    }
  }

  const linkKolMap: Record<string, string> = {}
  for (const l of linkList) {
    if (l.kol_user_id) linkKolMap[l.id] = l.kol_user_id
  }

  // Attributed inquiries (includes all, not just deals — for total count)
  type ConvRow = {
    id: string
    name: string | null
    visited_at: string | null
    deal_value: number | null
    deal_confirmed_at: string | null
    referral_link_id: string
  }
  let convRows: ConvRow[] = []
  if (linkIds.length > 0) {
    const { data } = await admin
      .from('referral_conversions')
      .select('id, name, visited_at, deal_value, deal_confirmed_at, referral_link_id')
      .eq('conversion_type', 'inquiry')
      .in('referral_link_id', linkIds)
    convRows = (data as ConvRow[] | null) ?? []
  }

  // Direct inquiries
  type DirectRow = {
    id: string
    name: string | null
    visited_at: string | null
    deal_value: number | null
    deal_confirmed_at: string | null
  }
  const { data: directRows } = await admin
    .from('property_inquiries')
    .select('id, name, visited_at, deal_value, deal_confirmed_at')
    .eq('property_id', projectId)

  const directList = (directRows as DirectRow[] | null) ?? []

  // Build unified stats
  const allRows = [
    ...convRows.map(r => ({ visited_at: r.visited_at, deal_value: r.deal_value, deal_confirmed_at: r.deal_confirmed_at })),
    ...directList.map(r => ({ visited_at: r.visited_at, deal_value: r.deal_value, deal_confirmed_at: r.deal_confirmed_at })),
  ]

  const totalInquiries  = allRows.length
  const totalVisited    = allRows.filter(r => r.visited_at).length
  const totalDeals      = allRows.filter(r => r.deal_confirmed_at).length
  const totalDealValue  = allRows.reduce((s, r) => s + (r.deal_value ?? 0), 0)

  // Individual deal records (confirmed only), sorted by date desc
  const dealRecords: DealRecord[] = [
    ...convRows
      .filter(r => r.deal_confirmed_at)
      .map(r => ({
        id: r.id,
        customerName: r.name,
        dealValue: r.deal_value,
        dealConfirmedAt: r.deal_confirmed_at!,
        source: 'attributed' as const,
        kolName: (() => {
          const kolId = linkKolMap[r.referral_link_id]
          return kolId ? (kolMap[kolId] ?? null) : null
        })(),
      })),
    ...directList
      .filter(r => r.deal_confirmed_at)
      .map(r => ({
        id: r.id,
        customerName: r.name,
        dealValue: r.deal_value,
        dealConfirmedAt: r.deal_confirmed_at!,
        source: 'direct' as const,
        kolName: null,
      })),
  ].sort((a, b) => new Date(b.dealConfirmedAt).getTime() - new Date(a.dealConfirmedAt).getTime())

  // Per-KOL referral counts
  const kolRefCount: Record<string, number> = {}
  for (const r of convRows) {
    const kolId = linkKolMap[r.referral_link_id]
    if (kolId) kolRefCount[kolId] = (kolRefCount[kolId] ?? 0) + 1
  }
  const kols: KolStat[] = kolUserIds
    .map(uid => ({ name: kolMap[uid] ?? '未知 KOL', referralCount: kolRefCount[uid] ?? 0 }))
    .sort((a, b) => b.referralCount - a.referralCount)

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl space-y-10">

      {/* Back */}
      <Link
        href="/merchant/projects"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150"
      >
        <ArrowLeft className="h-3 w-3" />
        商案列表
      </Link>

      {/* Header */}
      <div className="pb-6" style={{ borderBottom: '1px solid rgba(26,26,26,0.08)' }}>
        <p className="text-[0.58rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/35 mb-3">
          ARCHIVED PROJECT
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1
              className="font-serif font-light leading-tight text-foreground/60"
              style={{ fontSize: 'clamp(26px, 4vw, 38px)' }}
            >
              {project.name}
            </h1>
            {project.districtLabel && (
              <p className="text-sm text-muted-foreground/40 mt-2">{project.districtLabel}</p>
            )}
          </div>
          <span className="shrink-0 mt-1 text-[0.7rem] font-medium px-2.5 py-1 rounded border inline-flex items-center gap-1.5 bg-foreground/[0.03] text-foreground/35 border-foreground/[0.08]">
            <Archive className="h-3 w-3" />
            已封存
          </span>
        </div>

        {/* Timeline */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          <TimelineItem label="建立" date={fmtDate(project.createdAt)} />
          {project.publishedAt && (
            <>
              <span className="text-foreground/15 text-xs">→</span>
              <TimelineItem label="發布" date={fmtDate(project.publishedAt)} />
            </>
          )}
          <span className="text-foreground/15 text-xs">→</span>
          <TimelineItem label="封存" date={fmtDate(project.archivedAt)} accent />
        </div>
      </div>

      {/* Stats */}
      <div>
        <SectionLabel>RECORD</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <StatCard Icon={Users}      label="總詢問數" value={totalInquiries} />
          <StatCard Icon={Handshake}  label="到訪確認" value={totalVisited} />
          <StatCard Icon={BadgeCheck} label="成交確認" value={totalDeals} />
          <StatCard
            Icon={DollarSign}
            label="成交總值"
            value={totalDealValue > 0 ? fmtCurrency(totalDealValue) : '—'}
            raw
          />
        </div>
      </div>

      {/* Deal records */}
      <div>
        <SectionLabel>成交紀錄</SectionLabel>
        {dealRecords.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground/35 font-mono">無成交紀錄。</p>
        ) : (
          <div className="mt-3 border border-foreground/[0.07] divide-y divide-foreground/[0.05]">
            {dealRecords.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between px-4 py-3.5 gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-serif text-foreground/70 truncate">
                    {deal.customerName ?? '匿名客戶'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[0.62rem] font-mono px-1.5 py-0.5 border ${
                      deal.source === 'attributed'
                        ? 'text-foreground/35 border-foreground/[0.08] bg-foreground/[0.03]'
                        : 'text-muted-foreground/30 border-foreground/[0.06]'
                    }`}>
                      {deal.source === 'attributed' ? `KOL · ${deal.kolName ?? '未知'}` : '直接詢問'}
                    </span>
                    <span className="text-[0.65rem] font-mono text-muted-foreground/30">
                      {fmtDate(deal.dealConfirmedAt)}
                    </span>
                  </div>
                </div>
                <p className="text-sm font-mono text-foreground/50 shrink-0">
                  {deal.dealValue != null ? fmtCurrency(deal.dealValue) : '—'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KOL partners */}
      <div>
        <SectionLabel>KOL 合作夥伴</SectionLabel>
        {kols.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground/35 font-mono">此商案無 KOL 合作紀錄。</p>
        ) : (
          <div className="mt-3 border border-foreground/[0.07] divide-y divide-foreground/[0.05]">
            {kols.map((kol, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-serif text-foreground/70">{kol.name}</span>
                <span className="text-[0.72rem] font-mono text-muted-foreground/45">
                  {kol.referralCount} 筆轉介
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[0.6rem] font-mono uppercase tracking-[0.5em] text-foreground/25">
        {children}
      </span>
      <div className="flex-1 h-px bg-foreground/[0.06]" />
    </div>
  )
}

function TimelineItem({ label, date, accent }: { label: string; date: string; accent?: boolean }) {
  return (
    <div>
      <p className={`text-[0.58rem] font-mono uppercase tracking-[0.3em] mb-0.5 ${accent ? 'text-muted-foreground/35' : 'text-muted-foreground/25'}`}>
        {label}
      </p>
      <p className={`text-[0.75rem] font-mono ${accent ? 'text-foreground/40' : 'text-foreground/30'}`}>
        {date}
      </p>
    </div>
  )
}


function StatCard({
  Icon,
  label,
  value,
  raw,
}: {
  Icon: React.ElementType
  label: string
  value: number | string
  raw?: boolean
}) {
  return (
    <div className="border border-foreground/[0.07] bg-foreground/[0.02] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-3.5 w-3.5 text-foreground/25" strokeWidth={1.5} />
        <span className="text-[0.6rem] font-mono uppercase tracking-[0.25em] text-muted-foreground/30">
          {label}
        </span>
      </div>
      <p className="font-serif text-2xl font-light text-foreground/50">
        {raw ? value : (value as number).toLocaleString('zh-TW')}
      </p>
    </div>
  )
}
