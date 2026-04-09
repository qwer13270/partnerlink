'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Mail, UserX } from 'lucide-react'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setNotFound(false)

    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      if (data.error === 'USER_NOT_FOUND') {
        setNotFound(true)
      } else {
        setError(data.error ?? '發送失敗，請稍後再試。')
      }
      setSubmitting(false)
      return
    }

    setSent(true)
    setSubmitting(false)
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
            忘記密碼？
            <br />
            我們來幫你
          </h1>
          <p className="text-sm text-[#6B6560] leading-relaxed max-w-xs">
            輸入你的帳號電子郵件，我們會立即寄出一封安全的重設連結，協助你快速恢復登入。
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
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回登入
          </Link>
        </div>

        {/* form content */}
        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-16">
          <div className="w-full max-w-sm">

            {/* heading */}
            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
              <h2 className="text-3xl font-serif text-[#1A1A1A]">忘記密碼</h2>
              <p className="text-sm text-[#6B6560] mt-2">輸入你的帳號信箱，我們會寄送重設連結。</p>
            </motion.div>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                {/* success state */}
                <div className="border border-[#E8E4DF] bg-white/70 p-6 space-y-4">
                  <div className="w-10 h-10 border border-[#E8E4DF] flex items-center justify-center bg-[#FAF9F6]">
                    <Mail className="h-5 w-5 text-[#1A1A1A]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">重設連結已寄出</p>
                    <p className="mt-1.5 text-xs text-[#6B6560] leading-relaxed">
                      請檢查 <span className="text-[#1A1A1A]">{email}</span> 的收件匣（含垃圾郵件），點擊信中連結後即可設定新密碼。
                    </p>
                  </div>
                  <div className="border-t border-[#E8E4DF] pt-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#8A837B]">提醒</p>
                    <p className="mt-1.5 text-xs text-[#6B6560] leading-relaxed">
                      連結有效期限為 1 小時。若未收到，請確認信箱是否正確或重新操作。
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="w-full text-xs text-[#6B6560] hover:text-[#1A1A1A] transition-colors duration-200 underline underline-offset-4"
                >
                  使用不同的信箱重試
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                {/* email */}
                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                  <label className="block text-xs tracking-[0.24em] uppercase text-[#8A837B] mb-2" htmlFor="email">
                    電子郵件
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border-b border-[#E8E4DF] bg-transparent pb-3 text-sm text-[#1A1A1A] outline-none focus:border-[#1A1A1A] transition-colors duration-200 placeholder:text-[#C5BFB9]"
                  />
                </motion.div>

                {/* not-found error */}
                {notFound && (
                  <motion.div
                    key="not-found"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="-mt-2"
                  >
                    <div className="relative border border-[#D4A96A]/40 bg-[#FDF6EC] p-5 space-y-3 overflow-hidden">
                      {/* amber left accent bar */}
                      <span className="absolute left-0 inset-y-0 w-[3px] bg-[#C4872A]" />

                      <div className="flex items-start gap-3 pl-1">
                        <div className="mt-0.5 w-7 h-7 border border-[#D4A96A]/50 flex items-center justify-center shrink-0 bg-[#FAF3E8]">
                          <UserX className="h-3.5 w-3.5 text-[#C4872A]" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-[#7A4A0A] tracking-wide">找不到此帳號</p>
                          <p className="mt-1 text-[0.72rem] text-[#A07040] leading-relaxed">
                            <span className="text-[#7A4A0A] font-medium">{email}</span> 尚未在本平台註冊。請確認信箱是否正確，或前往建立帳號。
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-[#D4A96A]/25 pt-3 pl-1 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => { setNotFound(false); setEmail('') }}
                          className="text-[0.68rem] uppercase tracking-[0.2em] text-[#A07040] hover:text-[#7A4A0A] transition-colors duration-200"
                        >
                          重新輸入
                        </button>
                        <Link
                          href="/login"
                          className="text-[0.68rem] uppercase tracking-[0.2em] text-[#A07040] hover:text-[#7A4A0A] transition-colors duration-200 flex items-center gap-1"
                        >
                          前往登入 <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* generic error */}
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
                <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={submitting || !email}
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
                    <span>{submitting ? '寄送中…' : '寄送重設連結'}</span>
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
