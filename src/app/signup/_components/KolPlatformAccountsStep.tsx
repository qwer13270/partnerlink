'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { slideIn, fadeUp, PLATFORMS } from '../_constants'
import { PlatformCard } from './PlatformCard'

export function KolPlatformAccountsStep({
  initialPlatforms,
  initialAccounts,
  onBack,
  onSubmit,
  error,
  submitting,
}: {
  initialPlatforms?: string[]
  initialAccounts?: Record<string, string>
  onBack: () => void
  onSubmit: (payload: { platforms: string[]; platformAccounts: Record<string, string> }) => void
  error: string
  submitting: boolean
}) {
  const [platforms, setPlatforms] = useState<string[]>(initialPlatforms ?? [])
  const [platformAccounts, setPlatformAccounts] = useState<Record<string, string>>(
    Object.fromEntries((initialPlatforms ?? []).map((platform) => [platform, initialAccounts?.[platform] ?? ''])),
  )

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((item) => item !== platform) : [...prev, platform],
    )
    setPlatformAccounts((prev) => {
      if (platform in prev) { const next = { ...prev }; delete next[platform]; return next }
      return { ...prev, [platform]: '' }
    })
  }

  const hasNoPlatform = platforms.length === 0
  const hasMissingAccount = platforms.some((platform) => !platformAccounts[platform]?.trim())

  const handleSubmit = () => {
    if (hasNoPlatform || hasMissingAccount) return
    onSubmit({
      platforms,
      platformAccounts: Object.fromEntries(
        platforms.map((platform) => [platform, platformAccounts[platform]?.trim() ?? '']),
      ),
    })
  }

  return (
    <motion.div key="step3-kol-platforms" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4 font-body">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="font-heading italic text-white text-3xl mb-1">填寫社群帳號</h2>
        <p className="font-body text-sm text-white/60">選擇你的主要平台，並為每個已選平台補上帳號或連結。</p>
      </motion.div>

      <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp}>
        <div className="liquid-glass rounded-xl p-4 mb-6">
          <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] mb-1 font-body">平台帳號</p>
          <p className="text-xs text-white/50 leading-relaxed font-body">
            請先勾選主要平台，再填寫你在每個平台上的帳號名稱、頁面連結或可辨識的社群 ID。
          </p>
        </div>
      </motion.div>

      <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="space-y-2">
        {PLATFORMS.map((platform) => (
          <PlatformCard
            key={platform}
            platform={platform}
            isSelected={platforms.includes(platform)}
            accountValue={platformAccounts[platform] ?? ''}
            onToggle={() => togglePlatform(platform)}
            onAccountChange={(value) => setPlatformAccounts((prev) => ({ ...prev, [platform]: value }))}
          />
        ))}
      </motion.div>

      {error && (
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 mt-4 font-body">
          {error}
        </motion.p>
      )}

      <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp} className="pt-6">
        {hasNoPlatform && <p className="mb-3 text-xs text-red-400 text-center font-body">請至少選擇一個主要平台。</p>}
        {!hasNoPlatform && hasMissingAccount && <p className="mb-3 text-xs text-red-400 text-center font-body">請完成所有已選平台的帳號資料。</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || hasNoPlatform || hasMissingAccount}
          className="group relative overflow-hidden w-full flex items-center justify-between px-6 py-3.5 bg-white text-black rounded-full text-sm font-body font-medium hover:bg-white/90 disabled:opacity-50 transition-colors duration-300"
        >
          <span>{submitting ? '送出中…' : '送出申請'}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </motion.div>
    </motion.div>
  )
}
