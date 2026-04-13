'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { MarketTrendRecord } from '@/app/api/merchant/projects/[id]/market-trends/route'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Custom tooltip ────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ color: string; name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-4 py-3 text-xs"
      style={{
        background: '#0f0f0f',
        border: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        minWidth: 140,
      }}
    >
      <p className="text-xs uppercase tracking-[0.2em] text-white/50 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-white/70">{p.name}</span>
          </div>
          <span className="font-medium">{Number(p.value).toFixed(2)} 萬/坪</span>
        </div>
      ))}
    </div>
  )
}

// ── Price badge (up/down) ─────────────────────────────────────────────────────
function ChangeBadge({ value, label }: { value: number; label: string }) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs"
      style={{
        background: up ? 'rgba(74,158,110,0.08)' : 'rgba(200,80,80,0.08)',
        border: `1px solid ${up ? 'rgba(74,158,110,0.25)' : 'rgba(200,80,80,0.25)'}`,
        color: up ? '#3d8c60' : '#c05050',
      }}
    >
      <Icon className="w-3 h-3" />
      <span>{up ? '+' : ''}{value.toFixed(1)}%</span>
      <span className="opacity-60">{label}</span>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`rounded bg-foreground/[0.06] animate-pulse ${className ?? ''}`} />
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const [projectName, setProjectName]     = useState<string | null>(null)
  const [districtLabel, setDistrictLabel] = useState<string | null>(null)
  const [data, setData]                   = useState<MarketTrendRecord[] | null>(null)
  const [housefeelUrl, setHousefeelUrl]   = useState<string | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [loading, setLoading]             = useState(true)

  const [activeType, setActiveType] = useState<'all' | 'presale' | 'newBuild' | 'resale'>('all')

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch project meta + market trends in parallel
      const [projectRes, trendsRes] = await Promise.all([
        fetch(`/api/merchant/projects/${id}`, { cache: 'no-store' }),
        fetch(`/api/merchant/projects/${id}/market-trends`),
      ])

      const projectJson = await projectRes.json() as { project?: { name?: string; districtLabel?: string } }
      setProjectName(projectJson.project?.name ?? null)
      setDistrictLabel(projectJson.project?.districtLabel ?? null)

      if (!trendsRes.ok) {
        const errJson = await trendsRes.json() as { error?: string }
        throw new Error(errJson.error ?? '無法取得房市資料')
      }

      const trendsJson = await trendsRes.json() as { data: MarketTrendRecord[]; housefeelUrl: string }
      setData(trendsJson.data)
      setHousefeelUrl(trendsJson.housefeelUrl)
    } catch (e) {
      setError(e instanceof Error ? e.message : '發生錯誤')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  // ── Derived values ──────────────────────────────────────────────────────────
  const latest = data?.[data.length - 1] ?? null
  const prev   = data?.[data.length - 2] ?? null

  const showPresale  = activeType === 'all' || activeType === 'presale'
  const showNew      = activeType === 'all' || activeType === 'newBuild'
  const showResale   = activeType === 'all' || activeType === 'resale'

  const allPrices = (data ?? []).flatMap(d => [d.presalePrice, d.newBuildPrice, d.resalePrice]).filter((v): v is number => v !== null)
  const yMin = allPrices.length ? Math.floor(Math.min(...allPrices) / 10) * 10 - 5 : 0
  const yMax = allPrices.length ? Math.ceil(Math.max(...allPrices) / 10) * 10 + 5 : 200

  const totalTxn = latest?.totalTxn ?? null

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!loading && error) {
    return (
      <div className="space-y-10 max-w-4xl">
        <motion.div {...fadeUp(0.05)}>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">地區房價分析</p>
          <h1 className="text-3xl font-serif font-light leading-tight">
            {districtLabel ?? <Skeleton className="h-8 w-32 inline-block" />} 房市行情
          </h1>
          <p className="text-sm text-muted-foreground mt-2">{projectName ?? '…'}</p>
        </motion.div>
        <motion.div {...fadeUp(0.1)}>
          <div className="rounded-xl border border-foreground/[0.08] bg-background px-6 py-8 text-center">
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 max-w-4xl">

      {/* ── Title ── */}
      <motion.div {...fadeUp(0.05)}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">地區房價分析</p>
        <h1 className="text-3xl font-serif font-light leading-tight">
          {districtLabel
            ? <>{districtLabel.split(/[·•·]/)[0].trim()} 房市行情</>
            : <Skeleton className="h-8 w-48 inline-block" />}
        </h1>
        <div className="flex items-center gap-3 mt-2">
          <p className="text-sm text-muted-foreground">
            {projectName ?? <Skeleton className="h-4 w-32 inline-block" />}
          </p>
          {housefeelUrl && (
            <a
              href={housefeelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              housefeel
            </a>
          )}
        </div>
      </motion.div>

      {/* ── KPI cards ── */}
      <motion.div {...fadeUp(0.1)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-5 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))
          ) : (
            [
              {
                label: '當季均價',
                labelSub: '整體中位數 NT$/坪',
                value: latest?.price != null ? `${latest.price.toFixed(2)} 萬` : '—',
                extra: latest?.qoq != null ? <ChangeBadge value={latest.qoq} label="季增" /> : null,
              },
              {
                label: '季增率',
                labelSub: '較上季',
                value: latest?.qoq != null ? `${latest.qoq >= 0 ? '+' : ''}${latest.qoq.toFixed(1)}%` : '—',
                extra: prev && latest ? (
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    {prev.quarterLong} → {latest.quarterLong.split(' ')[1]}
                  </span>
                ) : null,
              },
              {
                label: '年增率',
                labelSub: '較去年同季',
                value: latest?.yoy != null ? `${latest.yoy >= 0 ? '+' : ''}${latest.yoy.toFixed(1)}%` : '—',
                extra: latest?.yoy != null ? <ChangeBadge value={latest.yoy} label="年增" /> : null,
              },
              {
                label: '季度交易量',
                labelSub: '各類型合計',
                value: totalTxn != null ? String(totalTxn) : '—',
                extra: latest ? (
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">
                    {latest.quarterLong} · 件
                  </span>
                ) : null,
              },
            ].map(({ label, labelSub, value, extra }) => (
              <div key={label} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-5">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
                <p className="text-xs text-muted-foreground/60 mb-2">{labelSub}</p>
                <p className="text-2xl font-serif font-light mb-2">{value}</p>
                {extra}
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* ── Line chart ── */}
      <motion.div {...fadeUp(0.15)}>
        <div className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.07]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">房價走勢</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">
                {data ? `${data[0]?.quarterLong} — ${data[data.length - 1]?.quarterLong}` : '…'} · NT$/坪（萬）
              </p>
            </div>
            <div className="flex gap-1.5">
              {[
                { key: 'all',      label: '全部' },
                { key: 'presale',  label: '預售屋' },
                { key: 'newBuild', label: '新成屋' },
                { key: 'resale',   label: '中古屋' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveType(key as typeof activeType)}
                  className="text-xs uppercase tracking-widest px-2.5 py-1 transition-all duration-150"
                  style={{
                    background: activeType === key ? '#1a1a1a' : 'transparent',
                    color: activeType === key ? '#faf9f6' : 'rgba(26,26,26,0.5)',
                    border: `1px solid ${activeType === key ? '#1a1a1a' : 'rgba(26,26,26,0.15)'}`,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-6 pt-4">
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data ?? []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" />
                  <XAxis
                    dataKey="quarterShort"
                    tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[yMin, yMax]}
                    tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}萬`}
                    width={52}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '0.68rem', paddingTop: 12 }}
                    formatter={(value) => <span style={{ color: 'rgba(26,26,26,0.6)', fontSize: '0.68rem' }}>{value}</span>}
                  />
                  {showPresale && (
                    <Line
                      type="monotone"
                      dataKey="presalePrice"
                      name="預售屋"
                      stroke="#c4913a"
                      strokeWidth={2}
                      connectNulls
                      dot={{ r: 3, fill: '#c4913a', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  )}
                  {showNew && (
                    <Line
                      type="monotone"
                      dataKey="newBuildPrice"
                      name="新成屋"
                      stroke="#1a1a1a"
                      strokeWidth={2}
                      connectNulls
                      dot={{ r: 3, fill: '#1a1a1a', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  )}
                  {showResale && (
                    <Line
                      type="monotone"
                      dataKey="resalePrice"
                      name="中古屋"
                      stroke="#4a9e6e"
                      strokeWidth={2}
                      strokeDasharray="4 3"
                      connectNulls
                      dot={{ r: 3, fill: '#4a9e6e', strokeWidth: 0 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Quarterly table ── */}
      <motion.div {...fadeUp(0.2)}>
        <div className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">各季成交資料</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">單位：均價 NT$/坪（萬）· 交易量（件）</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-foreground/[0.07]">
                  <th className="px-6 py-3 text-left text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal">季度</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] font-normal" style={{ color: '#c4913a' }}>預售屋均價</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal">量</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal">新成屋均價</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal">量</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] font-normal" style={{ color: '#4a9e6e' }}>中古屋均價</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-[0.2em] text-muted-foreground font-normal pr-6">量</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(26,26,26,0.05)' }}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-4 py-4">
                          <Skeleton className="h-3 w-12 ml-auto" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  (data ?? []).slice().reverse().map((row, i) => {
                    const isLatest = i === 0
                    const fmt = (v: number | null) => v != null ? `${v.toFixed(2)} 萬` : '—'
                    const fmtN = (v: number | null) => v != null ? String(v) : '—'
                    return (
                      <tr
                        key={row.quarterLong}
                        style={{
                          borderBottom: '1px solid rgba(26,26,26,0.05)',
                          background: isLatest ? 'rgba(196,145,58,0.03)' : 'transparent',
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{row.quarterLong}</span>
                            {isLatest && (
                              <span
                                className="text-xs uppercase tracking-widest px-1.5 py-0.5"
                                style={{ background: 'rgba(196,145,58,0.12)', color: '#c4913a', border: '1px solid rgba(196,145,58,0.25)' }}
                              >
                                最新
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right font-serif text-sm font-light" style={{ color: '#c4913a' }}>
                          {fmt(row.presalePrice)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-muted-foreground">{fmtN(row.presaleTxn)}</td>
                        <td className="px-4 py-4 text-right font-serif text-sm font-light">{fmt(row.newBuildPrice)}</td>
                        <td className="px-4 py-4 text-right text-sm text-muted-foreground">{fmtN(row.newBuildTxn)}</td>
                        <td className="px-4 py-4 text-right font-serif text-sm font-light" style={{ color: '#4a9e6e' }}>
                          {fmt(row.resalePrice)}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-muted-foreground pr-6">{fmtN(row.resaleTxn)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Data note ── */}
      <motion.div {...fadeUp(0.3)}>
        <p className="text-xs text-muted-foreground/50 uppercase tracking-[0.2em]">
          數據來源：內政部實價登錄 via housefeel.com.tw · 每 7 天更新 · 僅供參考
        </p>
      </motion.div>

    </div>
  )
}
