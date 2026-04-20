'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft, Mail, UserX } from 'lucide-react'
import Logo from '@/components/Logo'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
}

const darkLabel = 'block text-[10px] uppercase tracking-[0.3em] text-white/50 mb-2 font-body'
const darkInput = 'w-full bg-transparent border-b border-white/20 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-white/60 transition-colors duration-200'

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
      if (data.error === 'USER_NOT_FOUND') { setNotFound(true) }
      else { setError(data.error ?? '發送失敗，請稍後再試。') }
      setSubmitting(false)
      return
    }

    setSent(true)
    setSubmitting(false)
  }

  return (
    <div className="partnerlink-landing fixed inset-0 z-[100] flex overflow-hidden" style={{ background: '#0b0f1a' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 20% 60%, rgba(100,150,255,0.14) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(200,220,255,0.8) 0px, rgba(200,220,255,0.8) 1px, transparent 1px, transparent 60px), repeating-linear-gradient(90deg, rgba(200,220,255,0.8) 0px, rgba(200,220,255,0.8) 1px, transparent 1px, transparent 60px)' }}
        />

        <motion.div custom={0} initial="hidden" animate="visible" variants={fadeUp} className="relative z-10">
          <Logo />
        </motion.div>

        <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="space-y-4 relative z-10">
          <div className="inline-flex items-center liquid-glass rounded-full px-4 py-1.5">
            <span className="text-[10px] tracking-[0.3em] text-white/60 font-body uppercase">帳號安全</span>
          </div>
          <h1 className="font-heading italic text-white text-5xl leading-[0.95] tracking-tight">
            忘記密碼？<br /><span className="text-white/60">我們來幫你</span>
          </h1>
          <p className="font-body text-sm text-white/60 leading-relaxed max-w-xs">
            輸入你的帳號電子郵件，我們會立即寄出一封安全的重設連結，協助你快速恢復登入。
          </p>
        </motion.div>

        <motion.p custom={2} initial="hidden" animate="visible" variants={fadeUp} className="text-[10px] uppercase tracking-[0.3em] text-white/25 font-body relative z-10">
          © {new Date().getFullYear()} PartnerLink
        </motion.p>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col overflow-auto relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(100,150,255,0.05) 0%, transparent 60%)' }}
        />

        <div className="flex items-center justify-between px-8 pt-8 relative z-10">
          <Logo className="lg:hidden" size="sm" />
          <div className="hidden lg:block" />
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors duration-200 font-body"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回登入
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-8 md:px-16 lg:px-20 py-16 relative z-10">
          <div className="w-full max-w-sm">

            <motion.div custom={1} initial="hidden" animate="visible" variants={fadeUp} className="mb-12">
              <h2 className="font-heading italic text-white text-4xl">忘記密碼</h2>
              <p className="font-body text-sm text-white/60 mt-2">輸入你的帳號信箱，我們會寄送重設連結。</p>
            </motion.div>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
                <div className="liquid-glass rounded-xl p-6 space-y-4">
                  <div className="w-10 h-10 rounded-lg liquid-glass flex items-center justify-center">
                    <Mail className="h-5 w-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white font-body">重設連結已寄出</p>
                    <p className="mt-1.5 text-xs text-white/60 leading-relaxed font-body">
                      請檢查 <span className="text-white">{email}</span> 的收件匣（含垃圾郵件），點擊信中連結後即可設定新密碼。
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-[0.68rem] uppercase tracking-[0.24em] text-white/40 font-body">提醒</p>
                    <p className="mt-1.5 text-xs text-white/50 leading-relaxed font-body">
                      連結有效期限為 1 小時。若未收到，請確認信箱是否正確或重新操作。
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => { setSent(false); setEmail('') }}
                  className="w-full text-xs text-white/50 hover:text-white transition-colors duration-200 underline underline-offset-4 font-body"
                >
                  使用不同的信箱重試
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">

                <motion.div custom={2} initial="hidden" animate="visible" variants={fadeUp}>
                  <label className={darkLabel} htmlFor="email">電子郵件</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={darkInput}
                  />
                </motion.div>

                {notFound && (
                  <motion.div
                    key="not-found"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="-mt-2"
                  >
                    <div className="liquid-glass rounded-xl p-5 space-y-3 border-l-2 border-amber-400/50">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-7 h-7 rounded-lg liquid-glass flex items-center justify-center shrink-0">
                          <UserX className="h-3.5 w-3.5 text-amber-400" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-amber-300 tracking-wide font-body">找不到此帳號</p>
                          <p className="mt-1 text-[0.72rem] text-white/50 leading-relaxed font-body">
                            <span className="text-white">{email}</span> 尚未在本平台註冊。請確認信箱是否正確，或前往建立帳號。
                          </p>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => { setNotFound(false); setEmail('') }}
                          className="text-[0.68rem] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors duration-200 font-body"
                        >
                          重新輸入
                        </button>
                        <Link
                          href="/login"
                          className="text-[0.68rem] uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-colors duration-200 flex items-center gap-1 font-body"
                        >
                          前往登入 <ArrowRight className="h-2.5 w-2.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}

                {error && (
                  <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-400 -mt-4 font-body">
                    {error}
                  </motion.p>
                )}

                <motion.div custom={3} initial="hidden" animate="visible" variants={fadeUp}>
                  <button
                    type="submit"
                    disabled={submitting || !email}
                    className="group relative overflow-hidden w-full flex items-center justify-between px-6 py-3.5 bg-white text-black rounded-full text-sm font-body font-medium hover:bg-white/90 disabled:opacity-50 transition-colors duration-300"
                  >
                    {submitting && (
                      <motion.span
                        initial={{ x: '-120%' }}
                        animate={{ x: '120%' }}
                        transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                        className="pointer-events-none absolute inset-y-0 w-1/3 bg-black/10 blur-sm"
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
