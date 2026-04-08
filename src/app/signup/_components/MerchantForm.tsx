'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { slideIn, fadeUp, CITIES, PROJECT_COUNTS } from '../_constants'
import type { MerchantSignupDraft, MerchantType } from '../_types'

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
        <button onClick={onBack} className="flex items-center gap-2 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors mb-4">
          <span className="rotate-180 inline-block">→</span> 返回
        </button>
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-3xl font-serif text-[#1A1A1A]">建立商家帳號</h2>
          <span className="text-xs uppercase tracking-widest border border-[#1A1A1A] px-2 py-0.5 text-[#1A1A1A]">
            {merchantType}
          </span>
        </div>
        <p className="text-sm text-[#6B6560]">填寫公司資料，審核通過即可刊登{merchantType}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company + Contact */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">公司名稱</label>
            <input name="companyName" type="text" required placeholder="遠雄建設" className="input-editorial text-sm" />
          </div>
          <div>
            <label className="label-editorial">聯絡人姓名</label>
            <input name="contactName" type="text" required placeholder="張建廷" className="input-editorial text-sm" />
          </div>
        </motion.div>

        {/* Email + Phone */}
        <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">電子郵件</label>
            <input name="email" type="email" required placeholder="contact@company.tw" className="input-editorial text-sm" />
          </div>
          <div>
            <label className="label-editorial">聯絡電話</label>
            <input name="phone" type="tel" required placeholder="02-1234-5678" className="input-editorial text-sm" />
          </div>
        </motion.div>

        {/* Password */}
        <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
          <label className="label-editorial">密碼</label>
          <div className="relative">
            <input
              name="password"
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

        {/* City + Project count */}
        <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-editorial">{merchantType}所在縣市</label>
            <select
              value={city} onChange={(e) => setCity(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label-editorial">預計{merchantType === 'property' ? '建案' : '商案'}數</label>
            <select
              value={projectCount} onChange={(e) => setProjectCount(e.target.value)}
              className="input-editorial text-sm appearance-none bg-transparent cursor-pointer"
            >
              <option value="">請選擇</option>
              {PROJECT_COUNTS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-500 -mt-2"
          >
            {error}
          </motion.p>
        )}

        <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="pt-2">
          <button
            type="submit"
            disabled={submitting || passwordTooShort}
            className="group w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors duration-300"
          >
            <span>{submitting ? '送出中…' : '送出申請'}</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>
      </form>
    </motion.div>
  )
}
