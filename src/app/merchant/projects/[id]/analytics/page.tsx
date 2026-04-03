'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Building2, BarChart3, Home, Layers } from 'lucide-react'
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

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Mock data: Banqiao district quarterly price trends ────────────────────────
// 板橋區 — NT$/坪
const QUARTERLY_DATA = [
  { quarter: '24 Q1', presale: 76.2, newBuild: 68.4, resale: 55.1 },
  { quarter: '24 Q2', presale: 77.8, newBuild: 69.1, resale: 55.8 },
  { quarter: '24 Q3', presale: 79.4, newBuild: 70.5, resale: 56.9 },
  { quarter: '24 Q4', presale: 81.1, newBuild: 71.8, resale: 57.6 },
  { quarter: '25 Q1', presale: 83.6, newBuild: 73.2, resale: 58.4 },
  { quarter: '25 Q2', presale: 85.2, newBuild: 74.9, resale: 59.2 },
  { quarter: '25 Q3', presale: 86.8, newBuild: 76.3, resale: 60.1 },
  { quarter: '25 Q4', presale: 88.5, newBuild: 78.0, resale: 61.5 },
]

// Quarterly transaction table data
const TABLE_DATA = [
  { quarter: '2025 Q1', presalePrice: 83.6, presaleTxn: 42, newBuildPrice: 73.2, newBuildTxn: 28, resalePrice: 58.4, resaleTxn: 156 },
  { quarter: '2025 Q2', presalePrice: 85.2, presaleTxn: 51, newBuildPrice: 74.9, newBuildTxn: 31, resalePrice: 59.2, resaleTxn: 178 },
  { quarter: '2025 Q3', presalePrice: 86.8, presaleTxn: 49, newBuildPrice: 76.3, newBuildTxn: 26, resalePrice: 60.1, resaleTxn: 192 },
  { quarter: '2025 Q4', presalePrice: 88.5, presaleTxn: 58, newBuildPrice: 78.0, newBuildTxn: 35, resalePrice: 61.5, resaleTxn: 204 },
]

// Comparable properties
const COMPARABLE = [
  { name: '板橋新埔首席', type: '預售屋', price: 91.2, distance: '0.4 km', floors: 32, units: 142 },
  { name: '中和環球名人館', type: '新成屋', price: 76.5, distance: '1.2 km', floors: 24, units: 88 },
  { name: '板橋江翠美術館', type: '預售屋', price: 84.8, distance: '0.7 km', floors: 28, units: 116 },
  { name: '亞東之星', type: '中古屋', price: 62.3, distance: '1.8 km', floors: 18, units: 204 },
]

// Project data keyed by id
const PROJECT_META: Record<string, { name: string; district: string; districtEn: string; currentPrice: number }> = {
  'prop-001': { name: '璞真建設 — 光河', district: '板橋區', districtEn: 'Banqiao District', currentPrice: 88.5 },
  'prop-005': { name: '潤泰敦峰',         district: '大安區', districtEn: "Da'an District",   currentPrice: 142.3 },
}

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
          <span className="font-medium">{p.value} 萬/坪</span>
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
      <span>{up ? '+' : ''}{value}%</span>
      <span className="opacity-60">{label}</span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const { id } = useParams<{ id: string }>()
  const meta = PROJECT_META[id] ?? PROJECT_META['prop-001']

  const [activeType, setActiveType] = useState<'all' | 'presale' | 'newBuild' | 'resale'>('all')

  const latestQ = TABLE_DATA[TABLE_DATA.length - 1]
  const prevQ = TABLE_DATA[TABLE_DATA.length - 2]
  const qoq = (((latestQ.presalePrice - prevQ.presalePrice) / prevQ.presalePrice) * 100).toFixed(1)
  const totalTxn = latestQ.presaleTxn + latestQ.newBuildTxn + latestQ.resaleTxn

  // Filter chart lines
  const showPresale  = activeType === 'all' || activeType === 'presale'
  const showNew      = activeType === 'all' || activeType === 'newBuild'
  const showResale   = activeType === 'all' || activeType === 'resale'

  return (
    <div className="space-y-10 max-w-4xl">

      {/* ── Back ── */}
      <motion.div {...fadeUp(0)}>
        <Link
          href={`/merchant/projects/${id}`}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="w-3 h-3" />
          返回商案
        </Link>
      </motion.div>

      {/* ── Title ── */}
      <motion.div {...fadeUp(0.05)}>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">地區房價分析</p>
        <h1 className="text-3xl font-serif font-light leading-tight">{meta.district} 房市行情</h1>
        <p className="text-sm text-muted-foreground mt-2">
          {meta.name} · {meta.districtEn}
        </p>
      </motion.div>

      {/* ── KPI cards ── */}
      <motion.div {...fadeUp(0.1)}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: '當季均價',
              labelSub: '預售屋 NT$/坪',
              value: `${meta.currentPrice} 萬`,
              extra: <ChangeBadge value={+qoq} label="季增" />,
            },
            {
              label: '季增率',
              labelSub: '較上季',
              value: `+${qoq}%`,
              extra: <span className="text-xs text-muted-foreground uppercase tracking-widest">2025 Q3 → Q4</span>,
            },
            {
              label: '年增率',
              labelSub: '較去年同季',
              value: '+9.2%',
              extra: <ChangeBadge value={9.2} label="年增" />,
            },
            {
              label: '季度交易量',
              labelSub: '各類型合計',
              value: totalTxn.toString(),
              extra: <span className="text-xs text-muted-foreground uppercase tracking-widest">2025 Q4 · 件</span>,
            },
          ].map(({ label, labelSub, value, extra }) => (
            <div key={label} className="rounded-xl border border-foreground/[0.08] bg-linen shadow-sm px-5 py-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
              <p className="text-xs text-muted-foreground/60 mb-2">{labelSub}</p>
              <p className="text-2xl font-serif font-light mb-2">{value}</p>
              {extra}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Line chart ── */}
      <motion.div {...fadeUp(0.15)}>
        <div className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">
          {/* Chart header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.07]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">房價走勢</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">2024 Q1 — 2025 Q4 · NT$/坪（萬）</p>
            </div>

            {/* Type filter pills */}
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

          {/* Chart */}
          <div className="px-4 pb-6 pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={QUARTERLY_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" />
                <XAxis
                  dataKey="quarter"
                  tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[50, 95]}
                  tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}萬`}
                  width={45}
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
                    dataKey="presale"
                    name="預售屋"
                    stroke="#c4913a"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#c4913a', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                )}
                {showNew && (
                  <Line
                    type="monotone"
                    dataKey="newBuild"
                    name="新成屋"
                    stroke="#1a1a1a"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#1a1a1a', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                )}
                {showResale && (
                  <Line
                    type="monotone"
                    dataKey="resale"
                    name="中古屋"
                    stroke="#4a9e6e"
                    strokeWidth={2}
                    strokeDasharray="4 3"
                    dot={{ r: 3, fill: '#4a9e6e', strokeWidth: 0 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* ── Quarterly table ── */}
      <motion.div {...fadeUp(0.2)}>
        <div className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="px-6 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">各季成交資料</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">單位：均價 NT$/坪（萬）· 交易量（件）</p>
          </div>

          {/* Table */}
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
                {TABLE_DATA.map((row, i) => {
                  const isLatest = i === TABLE_DATA.length - 1
                  return (
                    <tr
                      key={row.quarter}
                      style={{
                        borderBottom: '1px solid rgba(26,26,26,0.05)',
                        background: isLatest ? 'rgba(196,145,58,0.03)' : 'transparent',
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{row.quarter}</span>
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
                        {row.presalePrice} 萬
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-muted-foreground">{row.presaleTxn}</td>
                      <td className="px-4 py-4 text-right font-serif text-sm font-light">{row.newBuildPrice} 萬</td>
                      <td className="px-4 py-4 text-right text-sm text-muted-foreground">{row.newBuildTxn}</td>
                      <td className="px-4 py-4 text-right font-serif text-sm font-light" style={{ color: '#4a9e6e' }}>
                        {row.resalePrice} 萬
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-muted-foreground pr-6">{row.resaleTxn}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {/* ── Comparable properties ── */}
      <motion.div {...fadeUp(0.25)}>
        <div className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">周邊競品比較</p>
            <p className="text-xs text-muted-foreground/60 mt-0.5">距離 {meta.name} 3km 以內</p>
          </div>

          <div className="divide-y divide-black/5">
            {COMPARABLE.map((c, i) => (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.28 + i * 0.05 }}
                className="flex items-center justify-between px-6 py-4 gap-4"
                style={{ borderBottom: '1px solid rgba(26,26,26,0.05)' }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 flex items-center justify-center shrink-0"
                    style={{ background: 'rgba(26,26,26,0.05)' }}
                  >
                    <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.type} · {c.floors}F · {c.units}戶</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">距離</p>
                    <p className="text-xs">{c.distance}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">均價</p>
                    <p className="font-serif text-base font-light" style={{ color: c.type === '預售屋' ? '#c4913a' : 'inherit' }}>
                      {c.price} 萬<span className="text-xs text-muted-foreground ml-0.5">/坪</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Your project comparison row */}
          <div
            className="flex items-center justify-between px-6 py-4 gap-4"
            style={{ background: 'rgba(196,145,58,0.04)', borderTop: '1px solid rgba(196,145,58,0.15)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 flex items-center justify-center shrink-0"
                style={{ background: 'rgba(196,145,58,0.15)' }}
              >
                <Home className="w-3.5 h-3.5" style={{ color: '#c4913a' }} />
              </div>
              <div>
                <p className="text-sm font-medium">{meta.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">您的商案 · 預售屋</p>
              </div>
            </div>
            <div className="flex items-center gap-6 shrink-0">
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">距離</p>
                <p className="text-xs">—</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">均價</p>
                <p className="font-serif text-base font-light" style={{ color: '#c4913a' }}>
                  {meta.currentPrice} 萬<span className="text-xs text-muted-foreground ml-0.5">/坪</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Data note ── */}
      <motion.div {...fadeUp(0.3)}>
        <p className="text-xs text-muted-foreground/50 uppercase tracking-[0.2em]">
          數據來源：內政部實價登錄 · 更新至 2025 Q4 · 僅供參考
        </p>
      </motion.div>

    </div>
  )
}
