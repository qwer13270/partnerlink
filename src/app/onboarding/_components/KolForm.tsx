'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { slideIn, fadeUp, PLATFORMS, FOLLOWER_RANGES, CONTENT_TYPES } from '../_constants'
import type { KolSignupDraft } from '../_types'
import { PlatformCard } from './PlatformCard'

export function KolForm({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (data: KolSignupDraft) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [platformAccounts, setPlatformAccounts] = useState<Record<string, string>>({})
  const [follower, setFollower] = useState('')
  const [contentType, setContentType] = useState('')
  const [bio, setBio] = useState('')
  const passwordTooShort = password.length > 0 && password.length < 6

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
    )
    setPlatformAccounts((prev) => {
      if (platform in prev) {
        const next = { ...prev }
        delete next[platform]
        return next
      }
      return { ...prev, [platform]: '' }
    })
  }

  const handlePlatformAccountChange = (platform: string, value: string) => {
    setPlatformAccounts((prev) => ({ ...prev, [platform]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordTooShort) return
    if (platforms.some((p) => !platformAccounts[p]?.trim())) return
    onNext({
      name,
      email,
      password,
      platforms,
      platformAccounts: Object.fromEntries(
        platforms.map((p) => [p, platformAccounts[p]?.trim() ?? '']),
      ),
      followerRange: follower,
      contentType,
      bio,
    })
  }

  return (
    <motion.div key="step2-kol" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">建立 KOL 帳號</h2>
        <p className="text-sm text-[#6B6560]">填寫基本資料，完成後上傳個人頭像送出審核</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name + Email */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">姓名</label>
            <input
              type="text" required placeholder="陳小安"
              value={name} onChange={(e) => setName(e.target.value)}
              className="input-editorial text-sm"
            />
          </div>
          <div>
            <label className="label-editorial">電子郵件</label>
            <input
              type="email" required placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-editorial text-sm"
            />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">密碼</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required minLength={6} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-editorial text-sm pr-8"
            />
            <button
              type="button" onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-0 bottom-4 text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordTooShort && (
            <p className="mt-2 text-xs text-red-500">密碼至少需要 6 個字元</p>
          )}
        </motion.div>

        {/* Platforms */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial mb-3 block">主要平台（可多選）</label>
          <div className="space-y-2">
            {PLATFORMS.map((p) => (
              <PlatformCard
                key={p}
                platform={p}
                isSelected={platforms.includes(p)}
                accountValue={platformAccounts[p] ?? ''}
                onToggle={() => togglePlatform(p)}
                onAccountChange={(v) => handlePlatformAccountChange(p, v)}
              />
            ))}
          </div>
        </motion.div>

        {/* Follower range + Content type */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">粉絲數量</label>
            <select
              value={follower} onChange={(e) => setFollower(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {FOLLOWER_RANGES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="label-editorial">內容類型</label>
            <select
              value={contentType} onChange={(e) => setContentType(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {CONTENT_TYPES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Bio */}
        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">自我介紹（選填）</label>
          <textarea
            rows={3}
            placeholder="簡短描述你的受眾與內容風格，幫助商家判斷合作匹配度。"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input-editorial text-sm resize-none"
          />
        </motion.div>

        {/* Next */}
        <motion.div custom={6} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
          {platforms.some((p) => !platformAccounts[p]?.trim()) && (
            <p className="mb-3 text-xs text-red-500">請為每個已選平台填寫帳號或連結。</p>
          )}
          <button
            type="submit"
            disabled={passwordTooShort || platforms.some((p) => !platformAccounts[p]?.trim())}
            className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors duration-300"
          >
            <span>下一步</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
