'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Check, X, Loader2 } from 'lucide-react'
import { slideIn, fadeUp, FOLLOWER_RANGES, CONTENT_TYPES } from '../_constants'
import type { KolSignupDraft } from '../_types'

const USERNAME_RE = /^[a-z0-9_]{3,20}$/

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error'

export function KolForm({
  onBack,
  onNext,
}: {
  onBack: () => void
  onNext: (data: KolSignupDraft) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameTouched, setUsernameTouched] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [follower, setFollower] = useState('')
  const [contentType, setContentType] = useState('')
  const [bio, setBio] = useState('')

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const passwordTooShort = password.length > 0 && password.length < 6
  const usernameFormatInvalid = usernameTouched && username.length > 0 && !USERNAME_RE.test(username)
  const canSubmit =
    !passwordTooShort &&
    USERNAME_RE.test(username) &&
    usernameStatus === 'available'

  // Debounced availability check
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!USERNAME_RE.test(username)) {
      setUsernameStatus('idle')
      return
    }

    setUsernameStatus('checking')

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/kol/check-username?username=${encodeURIComponent(username)}`)
        if (!res.ok) { setUsernameStatus('error'); return }
        const json = await res.json() as { available?: boolean }
        setUsernameStatus(json.available ? 'available' : 'taken')
      } catch {
        setUsernameStatus('error')
      }
    }, 500)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [username])

  const handleUsernameChange = (val: string) => {
    setUsername(val.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    onNext({ name, username, email, password, platforms: [], followerRange: follower, contentType, bio })
  }

  return (
    <motion.div key="step2-kol" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-1">建立 KOL 帳號</h2>
        <p className="text-sm text-[#6B6560]">先填寫基本資料，下一步再選擇平台並補上社群帳號。</p>
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

        {/* Username */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">用戶名稱</label>
          <div className="relative flex items-center border-b border-[#C8C3BC] focus-within:border-[#1A1A1A] transition-colors">
            <span className="shrink-0 select-none text-sm text-[#6B6560] pr-0.5">@</span>
            <input
              type="text"
              required
              placeholder="your_handle"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              onBlur={() => setUsernameTouched(true)}
              maxLength={20}
              className="flex-1 bg-transparent py-3 text-sm text-[#1A1A1A] outline-none placeholder:text-[#B8B3AC]"
            />
            {/* Status indicator */}
            <div className="flex shrink-0 items-center pl-2">
              {usernameStatus === 'checking' && (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#9A9490]" />
              )}
              {usernameStatus === 'available' && (
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {usernameStatus === 'taken' && (
                <X className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
          </div>
          {usernameFormatInvalid ? (
            <p className="mt-1.5 text-xs text-red-500">3–20 個字元，只能使用英文小寫、數字與底線</p>
          ) : usernameStatus === 'taken' ? (
            <p className="mt-1.5 text-xs text-red-500">此用戶名稱已被使用，請換一個</p>
          ) : usernameStatus === 'error' ? (
            <p className="mt-1.5 text-xs text-[#9A7040]">無法確認是否可用，請稍後再試</p>
          ) : usernameStatus === 'available' ? (
            <p className="mt-1.5 text-xs text-emerald-600">可以使用 — 你的公開網址：/kols/{username}</p>
          ) : username.length > 0 ? (
            <p className="mt-1.5 text-xs text-[#6B6560]">你的公開網址：/kols/{username}</p>
          ) : (
            <p className="mt-1.5 text-xs text-[#6B6560]">3–20 個字元，英文小寫、數字、底線</p>
          )}
        </motion.div>

        {/* Password */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
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
          <button
            type="submit"
            disabled={!canSubmit}
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
