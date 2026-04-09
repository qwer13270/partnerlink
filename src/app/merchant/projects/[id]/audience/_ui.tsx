'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit, Sparkles, RotateCcw, Target, MapPin, Banknote, Users,
  TrendingUp, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from 'recharts'
import type { AudienceProfile } from '@/app/api/merchant/projects/[id]/ai-audience/route'

// ── Constants ──────────────────────────────────────────────────────────────────

const SOURCE_COLORS = ['#c4913a', '#1a1a1a', '#4a9e6e', '#9a9a9a']
const INTENT_COLORS = { high: '#4a9e6e', medium: '#c4913a', low: '#aaaaaa' }

// ── Tooltip components ─────────────────────────────────────────────────────────

function BarTip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 text-xs" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
      <p className="text-white/50 mb-0.5">{label}</p>
      <p className="font-medium">{payload[0].value}%</p>
    </div>
  )
}

function PieTip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 text-xs" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}>
      <p className="text-white/50 mb-0.5">{payload[0].name}</p>
      <p className="font-medium">{payload[0].value}%</p>
    </div>
  )
}

// ── Insight icon map ───────────────────────────────────────────────────────────

const INSIGHT_ICONS = [Target, MapPin, Banknote, Users]

// ── Trigger / empty state ──────────────────────────────────────────────────────

function TriggerState({ projectName, onRun }: { projectName: string; onRun: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Icon cluster */}
      <div className="relative mb-10">
        <div
          className="w-20 h-20 flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(196,145,58,0.08) 0%, rgba(196,145,58,0.03) 100%)',
            border: '1px solid rgba(196,145,58,0.18)',
          }}
        >
          <BrainCircuit className="w-8 h-8" style={{ color: '#c4913a' }} strokeWidth={1.2} />
        </div>
        <motion.div
          className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full"
          style={{ background: '#c4913a' }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        >
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </motion.div>
      </div>

      <p className="text-[0.6rem] font-mono uppercase tracking-[0.55em] text-muted-foreground/40 mb-3">
        AI AUDIENCE PROFILING
      </p>
      <h2 className="text-2xl font-serif font-light mb-3">目標受眾輪廓分析</h2>
      <p className="text-sm text-muted-foreground/60 max-w-sm leading-relaxed mb-2">
        AI 根據「{projectName}」的地段、規格、定價與特色，
        推斷最可能的買家輪廓與行銷策略建議。
      </p>
      <p className="text-xs text-muted-foreground/35 mb-10">分析結果僅供行銷決策參考</p>

      <button
        onClick={onRun}
        className="inline-flex items-center gap-2.5 px-8 py-3.5 text-xs uppercase tracking-[0.35em] transition-all duration-200 hover:opacity-85 active:scale-[0.97]"
        style={{ background: '#1a1a1a', color: '#fff' }}
      >
        <BrainCircuit className="w-3.5 h-3.5" />
        開始分析
      </button>
    </motion.div>
  )
}

// ── Loading state ──────────────────────────────────────────────────────────────

function LoadingState() {
  const steps = ['讀取建案資料…', '分析地段與規格…', '推斷目標受眾…', '生成行銷洞察…']
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 900)
    return () => clearInterval(t)
  }, [steps.length])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-24 gap-8"
    >
      {/* Animated grid */}
      <div className="relative w-16 h-16">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4"
            style={{
              left: `${(i % 3) * 22}px`,
              top: `${Math.floor(i / 3) * 22}px`,
              background: 'rgba(196,145,58,0.15)',
              border: '1px solid rgba(196,145,58,0.2)',
            }}
            animate={{ opacity: [0.2, 1, 0.2], background: ['rgba(196,145,58,0.1)', 'rgba(196,145,58,0.4)', 'rgba(196,145,58,0.1)'] }}
            transition={{ repeat: Infinity, duration: 1.8, delay: i * 0.12, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-muted-foreground"
          >
            {steps[step]}
          </motion.p>
        </AnimatePresence>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/35">AI 分析中</p>
      </div>
    </motion.div>
  )
}

// ── Results ────────────────────────────────────────────────────────────────────

function ResultsView({ profile, projectName, onRerun, analyzedAt }: {
  profile: AudienceProfile
  projectName: string
  onRerun: () => void
  analyzedAt: string
}) {
  const ageData    = profile.ageDistribution.map(d => ({ ...d, key: d.range }))
  const incomeData = profile.incomeDistribution
  const sourceData = profile.sourceRecommendations.map((s, i) => ({ ...s, color: SOURCE_COLORS[i] ?? '#aaa' }))
  const intentData = [
    { label: '高度意願', color: INTENT_COLORS.high,   ...profile.purchaseIntent.high   },
    { label: '中度意願', color: INTENT_COLORS.medium, ...profile.purchaseIntent.medium },
    { label: '低度意願', color: INTENT_COLORS.low,    ...profile.purchaseIntent.low    },
  ]
  const dateStr = new Date(analyzedAt).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      {/* ── Persona card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        style={{
          border: '1px solid rgba(196,145,58,0.3)',
          background: 'linear-gradient(135deg, rgba(196,145,58,0.06) 0%, rgba(196,145,58,0.02) 100%)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid rgba(196,145,58,0.12)' }}>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-3.5 h-3.5" style={{ color: '#c4913a' }} strokeWidth={1.5} />
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: '#c4913a' }}>目標買家輪廓</p>
          </div>
          <span className="text-[0.65rem] text-muted-foreground/35 font-mono">
            {projectName}
          </span>
        </div>
        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-foreground/80">{profile.persona}</p>
        </div>
      </motion.div>

      {/* ── AI insights ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ border: '1px solid rgba(196,145,58,0.2)', background: 'rgba(196,145,58,0.02)' }}
      >
        <div className="flex items-center gap-2 px-5 py-3" style={{ borderBottom: '1px solid rgba(196,145,58,0.1)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#c4913a' }} />
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: '#c4913a' }}>AI 行銷洞察</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {profile.insights.map((text, i) => {
            const Icon = INSIGHT_ICONS[i] ?? TrendingUp
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                className="flex items-start gap-3 px-5 py-4"
                style={{ borderBottom: i < 2 ? '1px solid rgba(196,145,58,0.08)' : undefined, borderRight: i % 2 === 0 ? '1px solid rgba(196,145,58,0.08)' : undefined }}
              >
                <div className="w-6 h-6 flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(196,145,58,0.1)' }}>
                  <Icon className="w-3 h-3" style={{ color: '#c4913a' }} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* ── Charts grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Age distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">年齡分布</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">推估目標買家年齡 · %</p>
          </div>
          <div className="px-3 pb-5 pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                  {ageData.map((d, i) => {
                    const peak = ageData.reduce((a, b) => b.pct > a.pct ? b : a)
                    return <Cell key={i} fill={d.range === peak.range ? '#c4913a' : 'rgba(26,26,26,0.10)'} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Income distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">年收入分布</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">推估家庭年收入範圍 · %</p>
          </div>
          <div className="px-3 pb-5 pt-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(26,26,26,0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.45)' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <YAxis type="category" dataKey="level" tick={{ fontSize: 10, fill: 'rgba(26,26,26,0.55)' }} axisLine={false} tickLine={false} width={76} />
                <Tooltip formatter={v => [`${v}%`, '佔比']} contentStyle={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 11 }} />
                <Bar dataKey="pct" radius={[0, 2, 2, 0]}>
                  {incomeData.map((d, i) => {
                    const sorted = [...incomeData].sort((a, b) => b.pct - a.pct)
                    const fill = d.level === sorted[0].level ? '#c4913a' : d.level === sorted[1].level ? 'rgba(196,145,58,0.4)' : 'rgba(26,26,26,0.10)'
                    return <Cell key={i} fill={fill} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Source recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
          className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">建議行銷渠道</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">預期效果佔比</p>
          </div>
          <div className="flex items-center gap-5 px-5 pb-6 pt-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={sourceData} cx="50%" cy="50%" innerRadius={32} outerRadius={55} dataKey="pct" strokeWidth={0}>
                  {sourceData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<PieTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 flex-1">
              {sourceData.map(({ name, pct, color }) => (
                <div key={name} className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                  <span className="text-xs text-muted-foreground flex-1">{name}</span>
                  <span className="text-xs font-medium">{pct}%</span>
                  <ChevronRight className="w-3 h-3 text-foreground/15" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Purchase intent */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.30 }}
          className="rounded-xl border border-foreground/[0.08] bg-background shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-foreground/[0.07]">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">購買意願分級</p>
            <p className="text-xs text-muted-foreground/50 mt-0.5">推估潛在買家意願分布</p>
          </div>
          <div className="px-5 py-5 space-y-4">
            {intentData.map(({ label, pct, color, desc }) => (
              <div key={label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-xs">{label}</span>
                  </div>
                  <span className="text-xs font-serif font-light">{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-border overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground/55 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground/35 uppercase tracking-[0.2em]">
          分析於 {dateStr} · AI 生成 · 僅供行銷決策參考
        </p>
        <button
          onClick={onRerun}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/40 uppercase tracking-[0.2em] hover:text-muted-foreground transition-colors duration-150"
        >
          <RotateCcw className="w-3 h-3" />
          重新分析
        </button>
      </div>
    </motion.div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

type PageState = 'idle' | 'loading' | 'done' | 'error'

type CachedResult = {
  profile: AudienceProfile
  analyzedAt: string
}

export function AudienceClient({ projectId, projectName }: { projectId: string; projectName: string }) {
  const CACHE_KEY = `ai-audience-${projectId}`

  const [state,      setState]      = useState<PageState>('idle')
  const [profile,    setProfile]    = useState<AudienceProfile | null>(null)
  const [analyzedAt, setAnalyzedAt] = useState('')
  const [errMsg,     setErrMsg]     = useState('')

  // Load cached result on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (!raw) return
      const cached = JSON.parse(raw) as CachedResult
      setProfile(cached.profile)
      setAnalyzedAt(cached.analyzedAt)
      setState('done')
    } catch {
      // ignore corrupt cache
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function runAnalysis() {
    setState('loading')
    setErrMsg('')
    try {
      const res  = await fetch(`/api/merchant/projects/${projectId}/ai-audience`, { method: 'POST' })
      const data = await res.json() as { ok?: boolean; profile?: AudienceProfile; error?: string }
      if (!res.ok || !data.profile) {
        setErrMsg(data.error ?? 'AI 分析失敗，請稍後再試')
        setState('error')
        return
      }
      const now = new Date().toISOString()
      const cached: CachedResult = { profile: data.profile, analyzedAt: now }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
      setProfile(data.profile)
      setAnalyzedAt(now)
      setState('done')
    } catch {
      setErrMsg('網路錯誤，請稍後再試')
      setState('error')
    }
  }

  function handleRerun() {
    localStorage.removeItem(CACHE_KEY)
    setProfile(null)
    setState('idle')
  }

  return (
    <div className="max-w-4xl space-y-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1">分析客戶</p>
        <h1 className="text-3xl font-serif font-light">受眾輪廓分析</h1>
        <p className="text-sm text-muted-foreground mt-2">
          AI 根據建案特徵，推斷目標受眾輪廓與行銷策略建議。
        </p>
      </motion.div>

      {/* Body */}
      <AnimatePresence mode="wait">

        {state === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <TriggerState projectName={projectName} onRun={() => void runAnalysis()} />
          </motion.div>
        )}

        {state === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoadingState />
          </motion.div>
        )}

        {state === 'done' && profile && (
          <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultsView
              profile={profile}
              projectName={projectName}
              analyzedAt={analyzedAt}
              onRerun={handleRerun}
            />
          </motion.div>
        )}

        {state === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-5 py-24 text-center"
          >
            <div className="w-12 h-12 flex items-center justify-center" style={{ border: '1px solid rgba(220,80,80,0.25)', background: 'rgba(220,80,80,0.04)' }}>
              <BrainCircuit className="w-5 h-5 text-red-400" strokeWidth={1.3} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">分析失敗</p>
              <p className="text-xs text-muted-foreground/60">{errMsg}</p>
            </div>
            <button
              onClick={() => void runAnalysis()}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] px-5 py-2.5 transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(26,26,26,0.2)', color: 'rgba(26,26,26,0.6)' }}
            >
              <RotateCcw className="w-3 h-3" />
              重新嘗試
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
