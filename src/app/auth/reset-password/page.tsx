'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const passwordTooShort = password.length > 0 && password.length < 6
  const mismatch = confirm.length > 0 && password !== confirm
  const canSubmit = password.length >= 6 && password === confirm && !submitting

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError('')

    const supabase = getSupabaseBrowserClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setSubmitting(false)
      return
    }

    setDone(true)
    setSubmitting(false)
    // Sign out the recovery session, then redirect to login
    await supabase.auth.signOut()
    setTimeout(() => router.push('/login'), 2500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex overflow-hidden">

      {/* ── Left panel — dark brand ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#1A1A1A] flex-col justify-between p-16 relative overflow-hidden">
        {/* subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, #FAF9F6 0px, #FAF9F6 1px, transparent 1px, transparent 60px)',
          }}
        />

        {/* logo */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp}>
          <Link href="/" className="inline-flex items-center gap-3 relative z-10">
            <span className="text-[#FAF9F6] text-lg tracking-tight">PartnerLink</span>
            <span className="text-[#6B6560] text-sm tracking-widest">夥伴</span>
          </Link>
        </motion.div>

        {/* brand copy */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-5 relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#6B6560]">帳號安全</p>
          <h1 className="text-4xl font-serif text-[#FAF9F6] leading-[1.12]">
            設定一組
            <br />
            全新密碼
          </h1>
          <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">
            請設定至少 6 個字元的密碼。建議混合英文字母與數字，以提高帳號安全性。
          </p>
        </motion.div>

        {/* copyright */}
        <motion.p
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-xs uppercase tracking-[0.3em] text-[#3A3A3A] relative z-10"
        >
          © {new Date().getFullYear()} PartnerLink
        </motion.p>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 bg-[#FAF9F6] flex flex-col overflow-auto">

        {/* top bar */}
        <div className="flex items-center justify-between px-8 pt-8">
          <Link href="/" className="lg:hidden flex items-center gap-2">
            <span className="text-[#1A1A1A] tracking-tight">PartnerLink</span>
            <span className="text-[#6B6560] text-sm tracking-widest">夥伴</span>
          </Link>
          <div className="hidden lg:block" />
          <div className="lg:hidden" />
        </div>

        {/* form content */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-16">
          <div className="w-full max-w-sm">

            {/* heading */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
              <h2 className="text-3xl font-serif text-[#1A1A1A]">重設密碼</h2>
              <p className="text-sm text-[#6B6560] mt-2">請為你的帳號設定一組新的登入密碼。</p>
            </motion.div>

            {done ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div className="border border-[#E8E4DF] bg-white/70 p-6 space-y-4">
                  <div className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center bg-[#FAF9F6]">
                    <CheckCircle2 className="h-5 w-5 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">密碼已成功更新</p>
                    <p className="mt-1.5 text-xs text-[#6B6560] leading-relaxed">
                      正在為你跳轉至登入頁面，請使用新密碼登入。
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* new password */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#8A837B] mb-2" htmlFor="password">
                    新的密碼
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="至少 6 個字元"
                      className={`w-full border-b bg-transparent pb-3 pr-8 text-sm text-[#1A1A1A] outline-none transition-colors duration-200 placeholder:text-[#C5BFB9] ${passwordTooShort ? 'border-red-400 focus:border-red-500' : 'border-[#E8E4DF] focus:border-[#1A1A1A]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-0 bottom-3 text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordTooShort && (
                    <p className="mt-2 text-xs text-red-500">密碼至少需要 6 個字元</p>
                  )}
                </motion.div>

                {/* confirm password */}
                <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#8A837B] mb-2" htmlFor="confirm">
                    確認密碼
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="再次輸入密碼"
                      className={`w-full border-b bg-transparent pb-3 pr-8 text-sm text-[#1A1A1A] outline-none transition-colors duration-200 placeholder:text-[#C5BFB9] ${
                        mismatch ? 'border-red-400 focus:border-red-500' : 'border-[#E8E4DF] focus:border-[#1A1A1A]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      tabIndex={-1}
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      className="absolute right-0 bottom-3 text-[#6B6560] hover:text-[#1A1A1A] transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {mismatch && (
                    <p className="mt-1.5 text-xs text-red-500">兩次密碼輸入不一致</p>
                  )}
                </motion.div>

                {/* error */}
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 -mt-4"
                  >
                    {error}
                  </motion.p>
                )}

                {/* submit */}
                <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="group relative overflow-hidden w-full flex items-center justify-between px-6 py-4 bg-[#1A1A1A] text-[#FAF9F6] text-sm uppercase tracking-widest hover:bg-[#2A2A2A] disabled:opacity-50 transition-colors duration-300"
                  >
                    {submitting && (
                      <motion.span
                        initial={{ x: '-120%' }}
                        animate={{ x: '120%' }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                        className="pointer-events-none absolute inset-y-0 w-1/3 bg-white/15 blur-sm"
                      />
                    )}
                    <span>{submitting ? '更新中…' : '更新密碼並登入'}</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
                </motion.div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
