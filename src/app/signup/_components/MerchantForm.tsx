'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { slideIn, fadeUp, CITIES, PROJECT_COUNTS } from '../_constants'
import type { MerchantSignupDraft, MerchantType } from '../_types'

const darkLabel = 'block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2 font-body'
const darkInput = 'w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/60 transition-colors duration-200'

export function MerchantForm({
  onBack,
  onSubmit,
  error,
  submitting,
  merchantType,
}: {
  onBack: () => void
  onSubmit: (input: MerchantSignupDraft) => void
  error: string
  submitting: boolean
  merchantType: MerchantType
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('')
  const [projectCount, setProjectCount] = useState('')
  const passwordTooShort = password.length > 0 && password.length < 6

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    onSubmit({
      companyName: String(formData.get('companyName') ?? ''),
      contactName: String(formData.get('contactName') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      password: String(formData.get('password') ?? ''),
      city,
      projectCount,
      merchantType,
    })
  }

  return (
    <motion.div key="step2-merchant" {...slideIn}>
      <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="mb-8">
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-white/50 hover:text-white transition-colors mb-4 font-body">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="font-heading italic text-white text-3xl">建立商家帳號</h2>
          <span className="text-[10px] uppercase tracking-wider liquid-glass rounded-full px-2.5 py-1 text-white/60 font-body">
            {merchantType}
          </span>
        </div>
        <p className="font-body text-sm text-white/60">填寫公司資料，審核通過即可刊登{merchantType}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className={darkLabel}>公司名稱</label>
            <input name="companyName" type="text" required placeholder="遠雄建設" className={darkInput} />
          </div>
          <div>
            <label className={darkLabel}>聯絡人姓名</label>
            <input name="contactName" type="text" required placeholder="張建廷" className={darkInput} />
          </div>
        </motion.div>

        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className={darkLabel}>電子郵件</label>
            <input name="email" type="email" required placeholder="contact@company.tw" className={darkInput} />
          </div>
          <div>
            <label className={darkLabel}>聯絡電話</label>
            <input name="phone" type="tel" required placeholder="02-1234-5678" className={darkInput} />
          </div>
        </motion.div>

        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <label className={darkLabel}>密碼</label>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required minLength={6} placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
              className={`${darkInput} pr-8`}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1} className="absolute right-0 bottom-3 text-white/40 hover:text-white/70 transition-colors">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {passwordTooShort && <p className="mt-2 text-xs text-red-400 font-body">密碼至少需要 6 個字元</p>}
        </motion.div>

        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className={darkLabel}>{merchantType}所在縣市</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={`${darkInput} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#0a0a0a]">請選擇</option>
              {CITIES.map((c) => <option key={c} className="bg-[#0a0a0a]">{c}</option>)}
            </select>
          </div>
          <div>
            <label className={darkLabel}>預計{merchantType === 'property' ? '建案' : '商案'}數</label>
            <select value={projectCount} onChange={(e) => setProjectCount(e.target.value)} className={`${darkInput} appearance-none cursor-pointer`}>
              <option value="" className="bg-[#0a0a0a]">請選擇</option>
              {PROJECT_COUNTS.map((p) => <option key={p} className="bg-[#0a0a0a]">{p}</option>)}
            </select>
          </div>
        </motion.div>

        {error && (
          <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 -mt-2 font-body">
            {error}
          </motion.p>
        )}

        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
          <button
            type="submit"
            disabled={submitting || passwordTooShort}
            className="group w-full flex items-center justify-between px-6 py-3.5 bg-white text-black rounded-full text-sm font-body font-medium hover:bg-white/90 disabled:opacity-50 transition-colors duration-300"
          >
            <span>{submitting ? '送出中…' : '送出申請'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
