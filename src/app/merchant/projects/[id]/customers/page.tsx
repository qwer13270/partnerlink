'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, FileText, CheckCircle2, Users, MapPin, Banknote, Target, Sparkles } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts'

// ── Animation ──────────────────────────────────────────────────────────────
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
})

// ── Mock audience data (shown after "upload") ─────────────────────────────────
const AGE_DATA = [
  { range: '25–34', count: 48 },
  { range: '35–44', count: 112 },
  { range: '45–54', count: 86 },
  { range: '55–64', count: 34 },
  { range: '65+',   count: 12 },
]

const INCOME_DATA = [
  { level: '60–100 萬', pct: 18 },
  { level: '100–150 萬', pct: 34 },
  { level: '150–200 萬', pct: 28 },
  { level: '200 萬+', pct: 20 },
]

const SOURCE_DATA = [
  { name: 'KOL 口碑', value: 42, color: '#c4913a' },
  { name: '社群媒體', value: 28, color: '#1a1a1a' },
  { name: '親友介紹', value: 18, color: '#4a9e6e' },
  { name: '搜尋廣告', value: 12, color: '#aaaaaa' },
]

const INTENT_DATA = [
  { label: '高度意願',  count: 89,  color: '#4a9e6e', desc: '主動詢價、多次回訪' },
  { label: '中度意願',  count: 142, color: '#c4913a', desc: '關注商案、觀望中' },
  { label: '低度意願',  count: 61,  color: '#aaaaaa', desc: '初次接觸，尚在考慮' },
]

const INSIGHTS = [
  { icon: Target, text: '主力受眾為 35–44 歲雙薪家庭，年收入 100–200 萬，首購換屋需求強。' },
  { icon: MapPin,   text: '64% 客戶來自新北市，以板橋、中和為主，地緣需求明顯。' },
  { icon: Banknote, text: 'KOL 口碑帶來最高品質線索，轉換率高達 18%，遠優於廣告渠道。' },
  { icon: Users,    text: '高意願客群平均瀏覽 4.2 次商案頁面，建議加強即時跟進機制。' },
]

// ── Custom tooltip ────────────────────────────────────────────────────────────
function BarTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 text-xs"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
    >
      <p className="text-white/60 mb-1">{label}</p>
      <p className="font-medium">{payload[0].value} 人</p>
    </div>
  )
}

function PieTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="px-3 py-2 text-xs"
      style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
    >
      <p className="text-white/60 mb-1">{payload[0].name}</p>
      <p className="font-medium">{payload[0].value}%</p>
    </div>
  )
}

// ── Upload state machine ──────────────────────────────────────────────────────
type UploadState = 'idle' | 'uploading' | 'analyzing' | 'done'

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { id } = useParams<{ id: string }>()
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [fileName, setFileName] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const totalCustomers = AGE_DATA.reduce((s, d) => s + d.count, 0)

  const simulate = (name: string) => {
    setFileName(name)
    setUploadState('uploading')
    setTimeout(() => setUploadState('analyzing'), 1200)
    setTimeout(() => setUploadState('done'), 2800)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) simulate(file.name)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) simulate(file.name)
  }

  return (
    <div className="space-y-10 max-w-4xl">

      {/* ── Back ── */}
      <motion.div {...fadeUp(0)}>
        <Link
          href={`/merchant/projects/${id}`}
          className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft className="w-3 h-3" />
          返回商案
        </Link>
      </motion.div>

      {/* ── Title ── */}
      <motion.div {...fadeUp(0.05)}>
        <p className="text-[0.62rem] uppercase tracking-[0.3em] text-muted-foreground mb-1">分析客戶</p>
        <h1 className="text-3xl font-serif font-light">受眾輪廓分析</h1>
        <p className="text-sm text-muted-foreground mt-2">上傳您的客戶資料，AI 即時分析目標受眾特徵與購買意向。</p>
      </motion.div>

      {/* ── Upload zone ── */}
      <motion.div {...fadeUp(0.1)}>
        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <label
                className="block cursor-pointer"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <div
                  className="flex flex-col items-center justify-center gap-4 py-14 transition-all duration-200"
                  style={{
                    border: `1.5px dashed ${dragOver ? '#c4913a' : 'rgba(26,26,26,0.2)'}`,
                    background: dragOver ? 'rgba(196,145,58,0.03)' : 'transparent',
                  }}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center"
                    style={{ background: 'rgba(26,26,26,0.05)' }}
                  >
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium mb-1">拖曳或點擊上傳客戶資料</p>
                    <p className="text-xs text-muted-foreground">支援 CSV · XLSX · XLS · 最大 50MB</p>
                  </div>
                  <div
                    className="inline-flex items-center gap-2 text-[0.65rem] uppercase tracking-widest px-4 py-2"
                    style={{ border: '1px solid rgba(26,26,26,0.2)', color: 'rgba(26,26,26,0.6)' }}
                  >
                    <FileText className="w-3 h-3" />
                    選擇檔案
                  </div>
                </div>
              </label>

              {/* Demo button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => simulate('customers_Q4_2025.csv')}
                  className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-150"
                >
                  使用示範資料
                </button>
              </div>
            </motion.div>
          )}

          {(uploadState === 'uploading' || uploadState === 'analyzing') && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-5 py-14"
              style={{ border: '1.5px dashed rgba(26,26,26,0.12)' }}
            >
              {/* Animated bar */}
              <div className="w-48 h-0.5 bg-border overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: '#c4913a' }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {uploadState === 'uploading' ? `上傳中 ${fileName}` : 'AI 分析中，請稍候...'}
                </p>
                <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground/50 mt-1">
                  {uploadState === 'uploading' ? '正在上傳' : '模型推論中'}
                </p>
              </div>
            </motion.div>
          )}

          {uploadState === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-5 py-4"
              style={{ border: '1px solid rgba(74,158,110,0.3)', background: 'rgba(74,158,110,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4" style={{ color: '#4a9e6e' }} />
                <div>
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-[0.6rem] text-muted-foreground mt-0.5">{totalCustomers} 筆客戶資料 · 分析完成</p>
                </div>
              </div>
              <button
                onClick={() => { setUploadState('idle'); setFileName('') }}
                className="text-[0.6rem] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                重新上傳
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Analytics — only shown after done ── */}
      <AnimatePresence>
        {uploadState === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-10"
          >

            {/* ── AI insights strip ── */}
            <div style={{ border: '1px solid rgba(196,145,58,0.25)', background: 'rgba(196,145,58,0.03)' }}>
              <div
                className="flex items-center gap-2 px-5 py-3"
                style={{ borderBottom: '1px solid rgba(196,145,58,0.15)' }}
              >
                <Sparkles className="w-3.5 h-3.5" style={{ color: '#c4913a' }} />
                <p className="text-[0.62rem] uppercase tracking-[0.25em]" style={{ color: '#c4913a' }}>AI 洞察摘要</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x" style={{ divideColor: 'rgba(196,145,58,0.1)' }}>
                {INSIGHTS.map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-start gap-3 px-5 py-4"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(196,145,58,0.1)' : undefined }}
                  >
                    <div
                      className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'rgba(196,145,58,0.12)' }}
                    >
                      <Icon className="w-3 h-3" style={{ color: '#c4913a' }} />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ── Charts row: Age + Income ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Age distribution */}
              <div style={{ border: '1px solid rgba(26,26,26,0.1)', background: 'hsl(var(--background))' }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">年齡分布</p>
                  <p className="text-[0.55rem] text-muted-foreground/55 mt-0.5">共 {totalCustomers} 筆 · 人數</p>
                </div>
                <div className="px-3 pb-5 pt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={AGE_DATA} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" vertical={false} />
                      <XAxis
                        dataKey="range"
                        tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<BarTooltip />} />
                      <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                        {AGE_DATA.map((_, i) => (
                          <Cell
                            key={i}
                            fill={i === 1 ? '#c4913a' : 'rgba(26,26,26,0.12)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Income distribution */}
              <div style={{ border: '1px solid rgba(26,26,26,0.1)', background: 'hsl(var(--background))' }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">年收入分布</p>
                  <p className="text-[0.55rem] text-muted-foreground/55 mt-0.5">估算年薪範圍 · %</p>
                </div>
                <div className="px-3 pb-5 pt-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={INCOME_DATA} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        type="category"
                        dataKey="level"
                        tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.55)' }}
                        axisLine={false}
                        tickLine={false}
                        width={72}
                      />
                      <Tooltip
                        formatter={(v) => [`${v}%`, '佔比']}
                        contentStyle={{
                          background: '#0f0f0f',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: '#fff',
                          fontSize: 11,
                        }}
                      />
                      <Bar dataKey="pct" radius={[0, 2, 2, 0]}>
                        {INCOME_DATA.map((_, i) => (
                          <Cell
                            key={i}
                            fill={i === 1 ? '#c4913a' : i === 2 ? 'rgba(196,145,58,0.45)' : 'rgba(26,26,26,0.12)'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── Lead source + Purchase intent ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Lead source pie */}
              <div style={{ border: '1px solid rgba(26,26,26,0.1)', background: 'hsl(var(--background))' }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">客戶來源</p>
                  <p className="text-[0.55rem] text-muted-foreground/55 mt-0.5">線索獲取渠道分析</p>
                </div>
                <div className="flex items-center gap-5 px-5 pb-6 pt-4">
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie
                        data={SOURCE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={32}
                        outerRadius={55}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {SOURCE_DATA.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5">
                    {SOURCE_DATA.map(({ name, value, color }) => (
                      <div key={name} className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                        <span className="text-xs text-muted-foreground">{name}</span>
                        <span className="text-xs font-medium ml-auto">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Purchase intent */}
              <div style={{ border: '1px solid rgba(26,26,26,0.1)', background: 'hsl(var(--background))' }}>
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: '1px solid rgba(26,26,26,0.07)' }}
                >
                  <p className="text-[0.62rem] uppercase tracking-[0.25em] text-muted-foreground">購買意願分級</p>
                  <p className="text-[0.55rem] text-muted-foreground/55 mt-0.5">AI 評分 · 人數</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                  {INTENT_DATA.map(({ label, count, color, desc }) => {
                    const pct = Math.round((count / totalCustomers) * 100)
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <span className="text-xs">{label}</span>
                          </div>
                          <span className="text-xs font-serif font-light">{count} 人 ({pct}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-border overflow-hidden">
                          <motion.div
                            className="h-full"
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          />
                        </div>
                        <p className="text-[0.58rem] text-muted-foreground/60 mt-1">{desc}</p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Footer note ── */}
            <p className="text-[0.58rem] text-muted-foreground/50 uppercase tracking-[0.2em]">
              分析結果由 AI 模型生成 · 僅供行銷決策參考 · 個資已匿名化處理
            </p>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
