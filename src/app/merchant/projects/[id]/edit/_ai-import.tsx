'use client'

import { useState } from 'react'
import { X, Sparkles, Globe, FileText, ArrowRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AiExtractResult } from '@/app/api/merchant/projects/ai-extract/route'

// ── Types ─────────────────────────────────────────────────────────────────────

type InputMode = 'url' | 'text'
type PanelStep = 'input' | 'loading' | 'result' | 'error'

interface AiImportPanelProps {
  onApply: (data: AiExtractResult) => void
  onClose: () => void
}

// ── Result summary ────────────────────────────────────────────────────────────

function ResultSummary({ result }: { result: AiExtractResult }) {
  const fields = [
    { label: '建案名稱',   value: result.name },
    { label: '副標題',     value: result.subtitle },
    { label: '地段',       value: result.districtLabel },
    { label: '完工時程',   value: result.completionBadge },
    { label: '介紹文案',   value: result.overviewBody ? result.overviewBody.slice(0, 60) + (result.overviewBody.length > 60 ? '…' : '') : undefined },
    { label: '銷售專線',   value: result.salesPhone },
    { label: '規格列表',   value: result.introSpecs?.length     ? `${result.introSpecs.length} 項規格`     : undefined },
    { label: '特色亮點',   value: result.featureCards?.length   ? `${result.featureCards.length} 項特色`   : undefined },
    { label: '工程進度',   value: result.timelineItems?.length  ? `${result.timelineItems.length} 個節點`  : undefined },
    { label: '周邊地點',   value: result.locationPoints?.length ? `${result.locationPoints.length} 個地點` : undefined },
  ].filter((f) => f.value)

  return (
    <div className="space-y-1.5">
      {fields.map((f) => (
        <div key={f.label} className="flex items-start gap-2 rounded-md bg-foreground/[0.03] px-3 py-2">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
          <div className="min-w-0 flex-1">
            <span className="text-xs text-muted-foreground/60">{f.label}：</span>
            <span className="text-xs text-foreground">{f.value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function AiImportPanel({ onApply, onClose }: AiImportPanelProps) {
  const [mode,    setMode]    = useState<InputMode>('url')
  const [input,   setInput]   = useState('')
  const [step,    setStep]    = useState<PanelStep>('input')
  const [result,  setResult]  = useState<AiExtractResult | null>(null)
  const [errMsg,  setErrMsg]  = useState('')

  async function handleAnalyse() {
    if (!input.trim()) return
    setStep('loading')
    setErrMsg('')

    try {
      const body = mode === 'url'
        ? { url: input.trim() }
        : { text: input.trim() }

      const res  = await fetch('/api/merchant/projects/ai-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json() as { ok?: boolean; result?: AiExtractResult; error?: string }

      if (!res.ok || !data.result) {
        setErrMsg(data.error ?? 'AI 分析失敗，請稍後再試')
        setStep('error')
        return
      }

      setResult(data.result)
      setStep('result')
    } catch {
      setErrMsg('網路錯誤，請檢查連線後重試')
      setStep('error')
    }
  }

  function handleApply() {
    if (!result) return
    onApply(result)
    onClose()
  }

  function handleRetry() {
    setStep('input')
    setResult(null)
    setErrMsg('')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">

      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-foreground/[0.07] px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground/[0.05]">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A96E]" />
          </div>
          <div>
            <p className="text-[0.78rem] font-medium leading-tight">AI 匯入</p>
            <p className="text-xs text-muted-foreground/50">自動填入建案資訊</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground/40 transition-colors hover:bg-foreground/[0.05] hover:text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait" initial={false}>

          {/* ── Input step ── */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <p className="text-xs leading-relaxed text-muted-foreground/70">
                貼上建案官網網址，或直接貼入建案的介紹文字，AI 將自動填入大部分欄位。
              </p>

              {/* Mode tabs */}
              <div className="flex gap-1 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] p-1">
                {([['url', Globe, '網址'], ['text', FileText, '貼上文字']] as const).map(([m, Icon, label]) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setMode(m); setInput('') }}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs transition-all duration-150 ${
                      mode === m
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground/50 hover:text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              {mode === 'url' ? (
                <div className="rounded-md border border-foreground/[0.12] bg-background focus-within:border-foreground/40 transition-colors">
                  <input
                    type="url"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="https://project.example.com.tw/..."
                    spellCheck={false}
                    className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/30 font-mono"
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleAnalyse() }}
                  />
                </div>
              ) : (
                <div className="rounded-md border border-foreground/[0.12] bg-background focus-within:border-foreground/40 transition-colors">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="貼入建案介紹、規格說明、地點描述等任何文字…"
                    rows={8}
                    className="w-full resize-y bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground/30"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => void handleAnalyse()}
                disabled={!input.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-25"
              >
                <Sparkles className="h-3 w-3" />
                開始分析
              </button>
            </motion.div>
          )}

          {/* ── Loading step ── */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            >
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground/60">AI 正在分析建案資訊…</p>
            </motion.div>
          )}

          {/* ── Result step ── */}
          {step === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-[0.78rem] font-medium">找到以下資訊</p>
              </div>

              <ResultSummary result={result} />

              <p className="text-xs text-muted-foreground/50 leading-relaxed">
                點擊套用後，以上資訊將自動填入對應欄位。你可以在套用後再手動調整任何細節。
              </p>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-xs uppercase tracking-[0.3em] text-background transition-opacity hover:opacity-85"
                >
                  <ArrowRight className="h-3 w-3" />
                  套用到建案
                </button>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="w-full rounded-lg py-2 text-xs text-muted-foreground/50 transition-colors hover:text-muted-foreground"
                >
                  重新分析
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Error step ── */}
          {step === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-3 rounded-lg border border-red-200/60 bg-red-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                <p className="text-xs text-red-700 leading-relaxed">{errMsg}</p>
              </div>

              <button
                type="button"
                onClick={handleRetry}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-foreground/15 px-4 py-2.5 text-xs uppercase tracking-[0.3em] text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                重新嘗試
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

// ── First-visit guidance banner ───────────────────────────────────────────────

interface AiImportBannerProps {
  onOpen: () => void
  onDismiss: () => void
}

export function AiImportBanner({ onOpen, onDismiss }: AiImportBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="mb-3 mx-3 mt-3 overflow-hidden rounded-xl border border-[#C9A96E]/30 bg-gradient-to-br from-[#C9A96E]/[0.07] to-transparent"
    >
      <div className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-[#C9A96E] shrink-0" />
            <p className="text-[0.78rem] font-medium">已有建案網頁？</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground/60 leading-relaxed mb-3">
          貼上網址或文字，AI 自動幫你填入建案名稱、規格、特色、聯絡資訊等欄位。
        </p>
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-1.5 rounded-lg bg-foreground px-3.5 py-2 text-[0.72rem] uppercase tracking-[0.25em] text-background transition-opacity hover:opacity-85"
        >
          <Sparkles className="h-3 w-3" />
          AI 匯入
        </button>
      </div>
    </motion.div>
  )
}
